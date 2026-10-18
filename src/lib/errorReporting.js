// Frontend error reporting (Sentry). Off unless the production build has a DSN
// (VITE_SENTRY_DSN in the gitignored .env.local). The SDK is loaded after the
// first paint so it never counts against the initial bundle; errors raised
// before it arrives are queued and sent once it is ready.
//
// Privacy: no default PII (no IP, cookies or headers), no session replay, no
// performance tracing. Wallet addresses and transaction hashes are shortened
// in every string before an event leaves the browser. Users rejecting a wallet
// prompt are not errors and are never reported.

const DSN = import.meta.env.VITE_SENTRY_DSN || '';
const RELEASE = import.meta.env.VITE_APP_RELEASE || undefined;
export const errorReportingEnabled = import.meta.env.PROD === true && DSN.startsWith('https://');

let sentry = null;
let starting = null;
const queued = [];
const MAX_QUEUED = 20;

/// 0x + 40 hex -> 0x1234…abcd; 0x + 64 hex (tx/root hashes) -> 0x12345678…
export function shortenHexIdentifiers(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/0x[a-fA-F0-9]{64}/g, (hash) => `${hash.slice(0, 10)}…`)
    .replace(/0x[a-fA-F0-9]{40}(?![a-fA-F0-9])/g, (address) => `${address.slice(0, 6)}…${address.slice(-4)}`);
}

function scrub(value, depth = 0) {
  if (depth > 8 || value === null || value === undefined) return value;
  if (typeof value === 'string') return shortenHexIdentifiers(value);
  if (Array.isArray(value)) return value.map((item) => scrub(item, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = scrub(item, depth + 1);
    return out;
  }
  return value;
}

const stripQuery = (url) => (typeof url === 'string' ? url.split('?')[0].split('#')[0] : url);

/// Applied to every event: no user/IP/headers/cookies, no query strings,
/// shortened addresses and hashes everywhere else.
export function scrubEvent(event) {
  const clean = scrub(event);
  delete clean.user;
  if (clean.request) {
    clean.request = { url: stripQuery(clean.request.url) };
  }
  if (Array.isArray(clean.breadcrumbs)) {
    clean.breadcrumbs = clean.breadcrumbs.map((crumb) => (crumb?.data?.url
      ? { ...crumb, data: { ...crumb.data, url: stripQuery(crumb.data.url) } } : crumb));
  }
  return clean;
}

/// A user declining a wallet prompt (EIP-1193 4001, viem UserRejectedRequestError).
export function isUserRejection(error) {
  for (let current = error, depth = 0; current && depth < 6; current = current.cause, depth += 1) {
    if (current.name === 'UserRejectedRequestError' || current.code === 4001 || current.code === 'ACTION_REJECTED') return true;
    if (/user (rejected|denied|cancell?ed)/i.test(String(current.shortMessage || current.message || ''))) return true;
  }
  return false;
}

/// Report a handled failure (transaction, claim step, API call) with the app
/// area it happened in. Safe to call anywhere; a no-op when reporting is off.
const reported = new WeakSet();

export function reportError(error, area, extra = undefined) {
  if (!errorReportingEnabled || !error || isUserRejection(error)) return;
  // A failure reported where it happened (e.g. the transaction runner) is not
  // sent again by the outer flow that also catches it.
  if (typeof error === 'object') {
    if (reported.has(error)) return;
    reported.add(error);
  }
  const exception = error instanceof Error ? error : new Error(String(error?.shortMessage || error?.message || error));
  const context = { tags: { area }, extra };
  if (sentry) sentry.captureException(exception, context);
  else if (queued.length < MAX_QUEUED) queued.push([exception, context]);
}

function onEarlyError(event) {
  const error = event?.reason ?? event?.error;
  if (error) reportError(error, event?.reason !== undefined ? 'unhandled-rejection' : 'uncaught');
}

/// Call once at startup. Listens for crashes immediately, loads the SDK after
/// the first paint, then hands the global handlers over to Sentry.
export function startErrorReporting() {
  if (!errorReportingEnabled || starting) return starting;
  window.addEventListener('error', onEarlyError);
  window.addEventListener('unhandledrejection', onEarlyError);
  starting = new Promise((resolve) => setTimeout(resolve, 0))
    .then(() => import('@sentry/react'))
    .then((Sentry) => {
      Sentry.init({
        dsn: DSN,
        release: RELEASE,
        environment: 'production',
        sendDefaultPii: false,
        tracesSampleRate: 0,
        // Browser-extension noise (wallet extensions inject scripts into every page).
        denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i, /^safari(-web)?-extension:\/\//i, /extensions\//i],
        ignoreErrors: ['ResizeObserver loop limit exceeded', 'ResizeObserver loop completed with undelivered notifications'],
        beforeSend: (event, hint) => (isUserRejection(hint?.originalException) ? null : scrubEvent(event)),
        beforeBreadcrumb: (crumb) => scrub(crumb),
      });
      window.removeEventListener('error', onEarlyError);
      window.removeEventListener('unhandledrejection', onEarlyError);
      sentry = Sentry;
      for (const [exception, context] of queued.splice(0)) Sentry.captureException(exception, context);
    })
    .catch(() => {
      // Reporting must never break the app (e.g. the chunk is blocked by an ad blocker).
      window.removeEventListener('error', onEarlyError);
      window.removeEventListener('unhandledrejection', onEarlyError);
    });
  return starting;
}
