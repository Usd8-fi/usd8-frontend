export const REFRESH_INTERVAL_MS = 30_000;
// Returning to the tab fires both `visibilitychange` and `focus`; coming back
// online can coincide with either. One refresh covers all of them.
export const EVENT_REFRESH_GAP_MS = 5_000;

/// Runs `refresh` every 30 s while the page is visible, and once when the user
/// returns to the page (tab shown, window focused, or back online). Event
/// triggers within a few seconds of the last run are coalesced so a single
/// return costs a single round of RPC calls. Returns an unsubscribe function.
export function onForegroundRefresh(refresh, {
  intervalMs = REFRESH_INTERVAL_MS,
  eventGapMs = EVENT_REFRESH_GAP_MS,
  now = () => Date.now(),
} = {}) {
  let lastRun = -Infinity;
  const run = (fromEvent) => {
    if (document.hidden) return;
    const time = now();
    if (fromEvent && time - lastRun < eventGapMs) return;
    lastRun = time;
    refresh();
  };
  const onEvent = () => run(true);
  const timer = window.setInterval(() => run(false), intervalMs);
  window.addEventListener('focus', onEvent);
  window.addEventListener('online', onEvent);
  document.addEventListener('visibilitychange', onEvent);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener('focus', onEvent);
    window.removeEventListener('online', onEvent);
    document.removeEventListener('visibilitychange', onEvent);
  };
}
