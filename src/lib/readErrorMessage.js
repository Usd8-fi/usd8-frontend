import { t } from './i18n.js';

/// English text of the RPC read failure. It doubles as a language-independent
/// marker in stored per-resource errors; readErrorMessage/resourceErrorMessage
/// show it in the current language.
export const RPC_READ_ERROR = 'RPC error: Unable to read blockchain data. The RPC request failed or timed out. Please try again.';
const DATA_UNAVAILABLE = 'Data unavailable';

// viem wraps transport failures in contract-read errors. Inspect the cause chain,
// not the full error text (which can contain RPC URLs and request payloads).
const TRANSPORT_ERRORS = new Set(['TimeoutError', 'HttpRequestError', 'WebSocketRequestError', 'ProviderDisconnectedError']);
const isRpcReadError = (message) => message === RPC_READ_ERROR || message === t('lib.errors.rpcRead');

export function resourceErrorMessage(errors, fallback) {
  return Object.values(errors || {}).some(isRpcReadError) ? t('lib.errors.rpcRead')
    : Object.keys(errors || {}).length ? fallback : '';
}

/// English, language-independent error text for stored records (snapshot
/// resource errors). Display text comes from readErrorMessage.
export function readErrorText(error) {
  const seen = new Set();
  for (let current = error; current && typeof current === 'object' && !seen.has(current); current = current.cause) {
    seen.add(current);
    if (TRANSPORT_ERRORS.has(current.name)) return RPC_READ_ERROR;
  }
  return error?.shortMessage || error?.message || DATA_UNAVAILABLE;
}

/// The error as shown to the user: our own friendly texts in the current
/// language, anything else (contract/RPC messages) unchanged.
export function readErrorMessage(error) {
  const text = readErrorText(error);
  if (text === RPC_READ_ERROR) return t('lib.errors.rpcRead');
  return text === DATA_UNAVAILABLE ? t('lib.errors.dataUnavailable') : text;
}
