import { useSyncExternalStore } from 'react';

// One shared 1-second clock for every live-accruing number on the page.
// Components subscribe only where a ticking value is actually rendered, so a
// tick re-renders those leaves and nothing else. The timer exists only while
// something is subscribed and skips ticks while the tab is hidden.
const listeners = new Set();
let timer = null;
let now = Date.now();

function tick() {
  if (document.hidden) return;
  now = Date.now();
  for (const listener of listeners) listener();
}

function subscribe(listener) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = window.setInterval(tick, 1_000);
    document.addEventListener('visibilitychange', tick);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size) return;
    window.clearInterval(timer);
    timer = null;
    document.removeEventListener('visibilitychange', tick);
  };
}

const subscribeNever = () => () => {};
// Before anything subscribes, a render still needs a fresh time. Refresh at
// most once per second so repeated reads within one render stay identical.
const current = () => {
  if (!timer && Date.now() - now >= 1_000) now = Date.now();
  return now;
};
const idle = () => 0;

/// Current time in milliseconds, updated once per second while `enabled`.
/// Returns 0 while disabled; callers only read it when they can advance.
export function useSecondClock(enabled) {
  return useSyncExternalStore(enabled ? subscribe : subscribeNever, enabled ? current : idle, idle);
}

export function secondClockSubscriberCount() {
  return listeners.size;
}
