import { QueryClient } from '@tanstack/react-query';

// Shared with Wagmi's provider. Bigint snapshots need no JSON structural sharing.
export const queryClient = new QueryClient({ defaultOptions: { queries: {
  retry: false, gcTime: 5 * 60_000, structuralSharing: false,
} } });
const subscribers = new Map();

export function abortError() {
  return new DOMException('The operation was aborted.', 'AbortError');
}

export function checkAbort(signal) {
  if (signal?.aborted) throw abortError();
}

// One caller leaving must not cancel a request another mounted view still needs.
// When the last caller leaves, TanStack aborts the query function's own signal.
export function cachedData(queryKey, queryFn, { signal, staleTime = 15_000 } = {}) {
  checkAbort(signal);
  const hash = JSON.stringify(queryKey);
  const entry = subscribers.get(hash) || { count: 0 };
  subscribers.set(hash, entry);
  entry.count += 1;
  const request = queryClient.fetchQuery({ queryKey, queryFn, staleTime });
  return new Promise((resolve, reject) => {
    let finished = false;
    const finish = (callback, value, aborted = false) => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener('abort', onAbort);
      entry.count -= 1;
      if (!entry.count && subscribers.get(hash) === entry) {
        subscribers.delete(hash);
        if (aborted) void queryClient.cancelQueries({ queryKey, exact: true });
      }
      callback(value);
    };
    const onAbort = () => finish(reject, abortError(), true);
    signal?.addEventListener('abort', onAbort, { once: true });
    request.then(value => finish(resolve, value), error => finish(reject, error));
    if (signal?.aborted) onAbort();
  });
}

export function protocolKey(network, resource, ...scope) {
  return ['protocol', network.id, network.contracts.registry.toLowerCase(),
    network.contracts.defiInsurance.toLowerCase(), resource, ...scope];
}

export function invalidateResources(network, account, resources) {
  const prefix = protocolKey(network, '').slice(0, 4);
  return queryClient.invalidateQueries({ predicate: query => {
    const key = query.queryKey;
    return prefix.every((value, index) => key[index] === value)
      && (!resources || resources.includes(key[4]))
      && (!key[4].startsWith('account') || key[5] === account.toLowerCase());
  }, refetchType: 'none' });
}
