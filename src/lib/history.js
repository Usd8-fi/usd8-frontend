import { checkAbort } from './dataCache.js';
import { fetchJson, mapLimited, measuredRequest } from './requestUtils.js';

const RANGE = 10_000n;
const REORG_OVERLAP = 128n;
const MAX_LOGS = 50_000;
const MAX_PAGES = 200;
const histories = new Map();

function retain(key, value) {
  histories.delete(key);
  histories.set(key, value);
  while (histories.size > 12) histories.delete(histories.keys().next().value);
}
export function clearHistoryCache() { histories.clear(); }

export async function fetchLogsInChunks(client, request, fromBlock, toBlock, { signal } = {}) {
  if (toBlock >= fromBlock && (toBlock - fromBlock) / RANGE + 1n > BigInt(MAX_PAGES)) throw new Error('History is too large for this RPC. An indexed history service is required.');
  const ranges = [];
  for (let start = fromBlock; start <= toBlock; start += RANGE) {
    const end = start + RANGE - 1n;
    ranges.push({ fromBlock: start, toBlock: end > toBlock ? toBlock : end });
  }
  // Bound both concurrency and total work. An incomplete history stays unknown.
  if (ranges.length > MAX_PAGES) throw new Error('History is too large for this RPC. An indexed history service is required.');
  const pages = await mapLimited(ranges, range => measuredRequest('rpc:getLogs', () => client.getLogs({ ...request, ...range })), { signal });
  const logs = pages.flat();
  if (logs.length > MAX_LOGS) throw new Error('History response exceeded the supported size.');
  return logs;
}

export async function incrementalLogs(client, key, request, fromBlock, toBlock, { signal } = {}) {
  let previous = histories.get(key);
  if (previous && (previous.anchor < fromBlock || previous.anchor > toBlock
    || (await client.getBlock({ blockNumber: previous.anchor }))?.hash !== previous.hash)) previous = null;
  checkAbort(signal);
  const start = previous ? previous.anchor + 1n : fromBlock;
  const fresh = await fetchLogsInChunks(client, request, start, toBlock, { signal });
  const logs = [...(previous?.logs || []), ...fresh];
  const anchor = toBlock - REORG_OVERLAP;
  if (anchor >= fromBlock) {
    const block = await client.getBlock({ blockNumber: anchor });
    checkAbort(signal);
    if (block?.hash && logs.length <= MAX_LOGS) retain(key, {
      anchor, hash: block.hash, logs: logs.filter(log => log.blockNumber <= anchor),
    });
  }
  return logs;
}

// Keep the full seed before the trailing window. Dropping it would corrupt the
// time-weighted APR denominator. Re-fetch the unfinalized tail on each refresh.
export async function poolHistory(client, chainId, poolAddress, baseUrl, { signal } = {}) {
  const key = `apr:${chainId}:${poolAddress.toLowerCase()}`;
  let previous = histories.get(key);
  if (previous && (await client.getBlock({ blockNumber: previous.anchor }))?.hash !== previous.hash) previous = null;
  checkAbort(signal);
  let nextUrl = `${baseUrl}/addresses/${poolAddress}/logs`;
  const fresh = [];
  const seenPages = new Set();
  while (nextUrl) {
    checkAbort(signal);
    if (seenPages.has(nextUrl) || seenPages.size >= MAX_PAGES) throw new Error('Pool history is incomplete. Please retry later.');
    seenPages.add(nextUrl);
    const page = await fetchJson(nextUrl, { signal });
    if (!Array.isArray(page.items)) throw new Error('Invalid pool history response.');
    fresh.push(...page.items);
    if (fresh.length > MAX_LOGS) throw new Error('Pool history exceeds the supported size.');
    const reachedAnchor = previous && page.items.some(log => Number.isSafeInteger(log.block_number) && BigInt(log.block_number) <= previous.anchor);
    if (reachedAnchor || !page.next_page_params) break;
    const url = new URL(`${baseUrl}/addresses/${poolAddress}/logs`);
    Object.entries(page.next_page_params).forEach(([name, value]) => url.searchParams.set(name, value));
    nextUrl = url.toString();
  }
  const logs = [...(previous?.logs || []), ...fresh.filter(log => !previous || !Number.isSafeInteger(log.block_number) || BigInt(log.block_number) > previous.anchor)];
  if (logs.length > MAX_LOGS) throw new Error('Pool history exceeds the supported size.');
  const heights = logs.map(log => log.block_number);
  if (heights.length && heights.every(Number.isSafeInteger)) {
    const anchor = BigInt(Math.max(...heights)) - REORG_OVERLAP;
    if (anchor >= 0n) {
      const block = await client.getBlock({ blockNumber: anchor });
      checkAbort(signal);
      if (block?.hash) retain(key, { anchor, hash: block.hash, logs: logs.filter(log => BigInt(log.block_number) <= anchor) });
    }
  }
  return logs;
}
