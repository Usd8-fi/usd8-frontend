// Frontend errors reported to Sentry, for the System Dashboard. Served ONLY by
// the local dashboard server (~/defi-dashboard/server.py, GET /errors/summary),
// which holds the read-only Sentry token; the public site has no such endpoint.
// Error text arrives from the public internet (the DSN is public): render it as
// text only and link only to the USD8 Sentry organization.

export const ERRORS_URL = '/errors/summary';
export const SENTRY_ISSUE_PREFIX = 'https://usd8fi.sentry.io/issues/';

export async function fetchAppErrors({ signal, refresh = false } = {}) {
  const response = await fetch(refresh ? `${ERRORS_URL}?refresh=1` : ERRORS_URL,
    { headers: { accept: 'application/json' }, cache: 'no-store', signal });
  if (response.status === 404) throw new Error('LOCAL_ONLY');
  if (!response.ok) throw new Error(`Errors request failed (${response.status})`);
  const payload = await response.json();
  if (!payload || typeof payload !== 'object' || (!payload.data && !payload.error)) throw new Error('Malformed errors response');
  if (!payload.data) throw new Error(payload.error);
  return payload;
}

/// Sentry links only; anything else (e.g. a forged event) gets no link.
export const safeSentryLink = (url) => (typeof url === 'string' && url.startsWith(SENTRY_ISSUE_PREFIX) ? url : null);

export const AREA_LABELS = Object.freeze({
  transaction: 'Transaction',
  'pool-action': 'Cover Pool',
  'usd8-action': 'USD8 Mint Or Redeem',
  'claim-file': 'File Claim',
  'claim-cancel': 'Cancel Claim',
  'claim-settle': 'Settle Claim',
  'claim-finalize': 'Finalize Claim',
  'score-load': 'Score Load',
  'score-refresh': 'Score Refresh',
  'wallet-connect': 'Wallet Connect',
  'render-crash': 'Page Crash',
  uncaught: 'Uncaught Error',
  'unhandled-rejection': 'Unhandled Promise',
});

export function areaLabel(area) {
  if (!area) return '—';
  return AREA_LABELS[area] ?? String(area);
}

export function agoText(iso, nowMs) {
  const at = Date.parse(iso ?? '');
  if (!Number.isFinite(at)) return '—';
  const seconds = Math.max(0, (nowMs - at) / 1000);
  if (seconds < 90) return `${Math.round(seconds)}s ago`;
  if (seconds < 5400) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 172_800) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86_400)}d ago`;
}

/// Sentry's 14-day window returns 15 daily buckets (today included); keep the last 14.
export const DAYS_SHOWN = 14;
export function lastDays(daily) {
  if (!daily?.days?.length) return null;
  const keep = (series) => (series ?? daily.days.map(() => 0)).slice(-DAYS_SHOWN);
  return {
    days: daily.days.slice(-DAYS_SHOWN),
    byOutcome: Object.fromEntries(Object.entries({ accepted: undefined, ...daily.byOutcome }).map(([key, series]) => [key, keep(series)])),
  };
}

/// KPI figures from the summary; null when the source is unavailable.
export function errorTotals(data) {
  const daily = lastDays(data?.daily?.data);
  const accepted = daily?.byOutcome?.accepted ?? null;
  const dropped = daily ? Object.entries(daily.byOutcome ?? {})
    .filter(([outcome]) => outcome !== 'accepted')
    .reduce((sum, [, series]) => sum + series.reduce((a, b) => a + b, 0), 0) : null;
  const sessions = data?.sessions?.data ?? null;
  const lastSeen = (data?.unresolved ?? []).map((issue) => issue.lastSeen).filter(Boolean).sort().at(-1) ?? null;
  return {
    unresolved: data?.unresolved?.length ?? null,
    today: accepted?.length ? accepted.at(-1) : null,
    total14d: accepted ? accepted.reduce((a, b) => a + b, 0) : null,
    dropped,
    sessions: sessions?.total ?? null,
    crashFreePercent: sessions?.crashFreeRate === null || sessions?.crashFreeRate === undefined ? null : sessions.crashFreeRate * 100,
    lastSeen,
  };
}
