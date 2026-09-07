import { cachedData, checkAbort, protocolKey, queryClient } from './dataCache.js';
import { measuredRequest } from './requestUtils.js';

// Cache by resource, batch only the stale resources into one block-pinned RPC.
export async function snapshotReads(client, network, descriptors, { account, blockNumber, signal, refresh = false, resources } = {}) {
  const groups = new Map();
  descriptors.forEach((descriptor, index) => {
    if (!groups.has(descriptor.resource)) groups.set(descriptor.resource, []);
    groups.get(descriptor.resource).push({ ...descriptor, index });
  });
  const specs = [...groups].map(([resource, entries]) => {
    const key = protocolKey(network, resource, ...(resource.startsWith('account') ? [account.toLowerCase()] : []), ...(entries[0].cacheScope ? [entries[0].cacheScope] : []));
    const selected = !resources || resources.includes(resource);
    const staleTime = resource === 'configuration' ? 60_000 : 15_000;
    const state = queryClient.getQueryState(key);
    return { resource, entries, key, staleTime, selected,
      needed: !state?.data || (selected && (refresh || state.isInvalidated || Date.now() - state.dataUpdatedAt >= staleTime)) };
  });
  if (refresh) await Promise.all(specs.filter(s => s.selected).map(async s => {
    await queryClient.cancelQueries({ queryKey: s.key, exact: true });
    return queryClient.invalidateQueries({ queryKey: s.key, exact: true, refetchType: 'none' }); }));
  const pending = specs.filter(s => s.needed).flatMap(s => s.entries).sort((a, b) => a.index - b.index);
  let batch;
  const read = () => batch ||= measuredRequest('rpc:snapshot', () => client.multicall({
    contracts: pending.map(entry => entry.call), allowFailure: true, blockNumber,
  }));
  const values = new Array(descriptors.length);
  const errors = {};
  const times = [];
  await Promise.all(specs.map(async ({ resource, entries, key, staleTime, selected }) => {
    try {
      const old = queryClient.getQueryData(key);
      const result = !selected && old ? old : await cachedData(key, async ({ signal: querySignal }) => {
        checkAbort(querySignal);
        const results = await read();
        checkAbort(querySignal);
        const resourceValues = entries.map(entry => {
          const result = results[pending.findIndex(item => item.index === entry.index)];
          if (result?.status !== 'success') throw result?.error || new Error('Incomplete contract response.');
          return result.result;
        });
        return { values: resourceValues, updatedAt: Date.now(), blockNumber };
      }, { signal, staleTime });
      times.push(result.updatedAt);
      entries.forEach((entry, index) => { values[entry.index] = result.values[index]; });
    } catch (error) {
      checkAbort(signal);
      errors[resource] = error.shortMessage || error.message || 'Data unavailable';
      entries.forEach(entry => { values[entry.index] = entry.fallback; });
    }
  }));
  checkAbort(signal);
  return { values, errors, updatedAt: times.length ? Math.min(...times) : 0 };
}
