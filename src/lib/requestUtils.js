import { checkAbort } from './dataCache.js';

// Only labels, counts and timings; never wallet addresses, RPC payloads or URLs.
const counters = new Map();
export function requestStats() { return [...counters].map(([label, value]) => ({ label, ...value })); }
export function resetRequestStats() { counters.clear(); }
export async function measuredRequest(label, run) {
  const started = performance.now();
  try { return await run(); }
  finally {
    if (import.meta.env.DEV) {
      const previous = counters.get(label) || { count: 0, milliseconds: 0 };
      counters.set(label, { count: previous.count + 1, milliseconds: previous.milliseconds + performance.now() - started });
    }
  }
}

export async function fetchJson(url, { signal, timeout = 15_000, ...options } = {}) {
  checkAbort(signal);
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, timeout);
  try {
    const response = await measuredRequest('http:history', () => fetch(url, { ...options, signal: controller.signal }));
    if (!response.ok) throw new Error(`History request failed (${response.status})`);
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

export async function mapLimited(items, run, { signal, concurrency = 4 } = {}) {
  let cursor = 0;
  const results = new Array(items.length);
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      checkAbort(signal);
      const index = cursor++;
      results[index] = await run(items[index], index);
      checkAbort(signal);
    }
  }));
  return results;
}
