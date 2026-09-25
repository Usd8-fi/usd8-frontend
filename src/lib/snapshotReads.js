import { cachedData, checkAbort, protocolKey, queryClient } from './dataCache.js';
import { measuredRequest } from './requestUtils.js';

// Multicall3 is deployed at the same address on every supported chain. Reading
// the block number inside the batch saves a separate eth_blockNumber round trip.
export const MULTICALL3_ADDRESS = '0xca11bde05977b3631167028862be2a173976ca11';
const multicall3BlockAbi = [
  { type: 'function', name: 'getBlockNumber', stateMutability: 'view', inputs: [], outputs: [{ name: 'blockNumber', type: 'uint256' }] },
];
const BLOCK_NUMBER_CALL = { address: MULTICALL3_ADDRESS, abi: multicall3BlockAbi, functionName: 'getBlockNumber' };

// viem splits a multicall at 1 KB of calldata by default, which turns one
// snapshot into several eth_calls. Every batch here fits comfortably in one.
export const MULTICALL_BATCH_BYTES = 32_768;
export function multicall(client, parameters) {
  return client.multicall({ batchSize: MULTICALL_BATCH_BYTES, ...parameters });
}

const LONG_STALE_RESOURCES = new Set(['configuration', 'settlement-params', 'claim-bond']);
export function resourceStaleTime(resource) {
  return LONG_STALE_RESOURCES.has(resource) ? 60_000 : 15_000;
}

// Cache by resource and batch only the stale resources into one RPC. With an
// explicit `blockNumber` every read is pinned to it. Without one the batch runs
// at the latest block and reads that block number in the same call; when the
// node answers from behind a known receipt (`minBlock`), it is repeated pinned.
export async function snapshotReads(client, network, descriptors, { account, blockNumber, minBlock, signal, refresh = false, resources } = {}) {
  const groups = new Map();
  descriptors.forEach((descriptor, index) => {
    if (!groups.has(descriptor.resource)) groups.set(descriptor.resource, []);
    groups.get(descriptor.resource).push({ ...descriptor, index });
  });
  const specs = [...groups].map(([resource, entries]) => {
    const key = protocolKey(network, resource, ...(resource.startsWith('account') ? [account.toLowerCase()] : []), ...(entries[0].cacheScope ? [entries[0].cacheScope] : []));
    const selected = !resources || resources.includes(resource);
    const staleTime = resourceStaleTime(resource);
    const state = queryClient.getQueryState(key);
    return { resource, entries, key, staleTime, selected,
      needed: !state?.data || (selected && (refresh || state.isInvalidated || Date.now() - state.dataUpdatedAt >= staleTime)) };
  });
  if (refresh) await Promise.all(specs.filter(s => s.selected).map(async s => {
    await queryClient.cancelQueries({ queryKey: s.key, exact: true });
    return queryClient.invalidateQueries({ queryKey: s.key, exact: true, refetchType: 'none' }); }));
  const pending = specs.filter(s => s.needed).flatMap(s => s.entries).sort((a, b) => a.index - b.index);
  const pinned = blockNumber !== undefined;
  const execute = async (at) => {
    const contracts = pending.map(entry => entry.call);
    const latest = at === undefined;
    const results = await measuredRequest('rpc:snapshot', () => multicall(client, {
      contracts: latest ? [...contracts, BLOCK_NUMBER_CALL] : contracts,
      allowFailure: true,
      ...(latest ? {} : { blockNumber: at }),
    }));
    if (!latest) return { results, blockNumber: at };
    const head = results.at(-1);
    if (head?.status !== 'success' || typeof head.result !== 'bigint') throw head?.error || new Error('Block number unavailable.');
    return { results: results.slice(0, -1), blockNumber: head.result };
  };
  let batch;
  const read = () => batch ||= (async () => {
    if (pinned) return execute(blockNumber);
    const latest = await execute(undefined);
    return minBlock !== undefined && latest.blockNumber < minBlock ? execute(minBlock) : latest;
  })();
  const values = new Array(descriptors.length);
  const errors = {};
  const times = [];
  const blocks = [];
  await Promise.all(specs.map(async ({ resource, entries, key, staleTime, selected }) => {
    try {
      const old = queryClient.getQueryData(key);
      const result = !selected && old ? old : await cachedData(key, async ({ signal: querySignal }) => {
        checkAbort(querySignal);
        const { results, blockNumber: resultBlock } = await read();
        checkAbort(querySignal);
        const resourceValues = entries.map(entry => {
          const result = results[pending.findIndex(item => item.index === entry.index)];
          if (result?.status !== 'success') throw result?.error || new Error('Incomplete contract response.');
          return result.result;
        });
        return { values: resourceValues, updatedAt: Date.now(), blockNumber: resultBlock };
      }, { signal, staleTime });
      times.push(result.updatedAt);
      if (typeof result.blockNumber === 'bigint') blocks.push(result.blockNumber);
      entries.forEach((entry, index) => { values[entry.index] = result.values[index]; });
    } catch (error) {
      checkAbort(signal);
      errors[resource] = error.shortMessage || error.message || 'Data unavailable';
      entries.forEach(entry => { values[entry.index] = entry.fallback; });
    }
  }));
  checkAbort(signal);
  // The block the snapshot represents: the fresh batch's block, or the newest
  // cached one when every resource was still warm.
  let resolvedBlock = pinned ? blockNumber : undefined;
  if (!pinned && batch) {
    try { resolvedBlock = (await batch).blockNumber; } catch { /* reported per resource */ }
  }
  if (resolvedBlock === undefined && blocks.length) resolvedBlock = blocks.reduce((max, value) => (value > max ? value : max));
  if (resolvedBlock !== undefined && minBlock !== undefined && resolvedBlock < minBlock) resolvedBlock = minBlock;
  return { values, errors, updatedAt: times.length ? Math.min(...times) : 0, blockNumber: resolvedBlock };
}
