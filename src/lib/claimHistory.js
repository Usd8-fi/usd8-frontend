import { checkAbort } from './dataCache.js';
import { mapLimited } from './requestUtils.js';

const accounts = new Map();
export function clearClaimHistory() { accounts.clear(); }

// Once an incident is inactive, new claims cannot be added. Keep that mapping
// after a reorg overlap, but read claim resolution state on every refresh.
export async function historicalClaimIds(client, key, nextIncidentId, blockNumber, read, { signal } = {}) {
  const count = Number(nextIncidentId - 1n);
  if (!Number.isSafeInteger(count) || count > 10_000) throw new Error('Claim history exceeds the supported range. Contact support to load this claim.');
  let previous = accounts.get(key);
  if (previous && (blockNumber < previous.blockNumber || (await client.getBlock({ blockNumber: previous.blockNumber }))?.hash !== previous.hash)) previous = null;
  checkAbort(signal);
  const reusable = previous && blockNumber >= previous.blockNumber + 128n;
  const retained = reusable ? previous.ids : [];
  const start = retained.length;
  const chunks = [];
  for (let offset = start; offset < count; offset += 128) chunks.push(Array.from({ length: Math.min(128, count - offset) }, (_, i) => BigInt(offset + i + 1)));
  const additions = await mapLimited(chunks, read, { signal, concurrency: 2 });
  const ids = [...retained, ...additions.flat()];
  checkAbort(signal);
  const hash = (await client.getBlock({ blockNumber }))?.hash;
  if (hash && (!previous || reusable)) {
    accounts.delete(key);
    accounts.set(key, { ids, blockNumber, hash });
    if (accounts.size > 8) accounts.delete(accounts.keys().next().value);
  }
  return ids;
}
