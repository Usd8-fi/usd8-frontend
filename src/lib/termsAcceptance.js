// Terms acceptance after wallet connect. The server record (write-only, no
// lookup endpoint) is the evidence; the browser flag only avoids asking again.
export const TERMS_VERSION = '2026-10-18';
export const TERMS_URL = './docs/legal.html#terms';
export const RISK_URL = './docs/legal.html#risk-disclaimer';
const STORAGE_KEY = 'usd8.termsAccepted';
const DEFAULT_TERMS_API_URL = 'https://oz43wdk335yzi5k2kdt3qm7uzq0nbpsd.lambda-url.eu-central-1.on.aws/terms';
export const TERMS_API_URL = import.meta.env.VITE_TERMS_API_URL || DEFAULT_TERMS_API_URL;

function readAll(storage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function hasAcceptedTerms(address, storage = globalThis.localStorage) {
  if (!address || !storage) return false;
  return readAll(storage)[address.toLowerCase()] === TERMS_VERSION;
}

export function rememberTermsAccepted(address, storage = globalThis.localStorage) {
  if (!address || !storage) return;
  try {
    const all = readAll(storage);
    all[address.toLowerCase()] = TERMS_VERSION;
    storage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage may be unavailable (private mode); the user is simply asked again.
  }
}

/// Fire-and-forget with a few retries. A failed save never blocks the user.
export async function recordTermsAcceptance(address, { fetchImpl = globalThis.fetch, attempts = 3, delayMs = 2_000 } = {}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(TERMS_API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address, termsVersion: TERMS_VERSION }),
      });
      if (response.ok) return true;
      if (response.status >= 400 && response.status < 500) return false;
    } catch {
      // Network error: retry below.
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
  }
  return false;
}
