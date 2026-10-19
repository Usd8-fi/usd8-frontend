export const RPC_READ_ERROR = 'RPC error: Unable to read blockchain data. The RPC request failed or timed out. Please try again.';

// viem wraps transport failures in contract-read errors. Inspect the cause chain,
// not the full error text (which can contain RPC URLs and request payloads).
const TRANSPORT_ERRORS = new Set(['TimeoutError', 'HttpRequestError', 'WebSocketRequestError', 'ProviderDisconnectedError']);
export function resourceErrorMessage(errors, fallback) {
  return Object.values(errors || {}).includes(RPC_READ_ERROR) ? RPC_READ_ERROR
    : Object.keys(errors || {}).length ? fallback : '';
}

export function readErrorMessage(error) {
  const seen = new Set();
  for (let current = error; current && typeof current === 'object' && !seen.has(current); current = current.cause) {
    seen.add(current);
    if (TRANSPORT_ERRORS.has(current.name)) return RPC_READ_ERROR;
  }
  return error?.shortMessage || error?.message || 'Data unavailable';
}
