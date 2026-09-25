import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onForegroundRefresh } from './foregroundRefresh.js';

function setHidden(hidden) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
}

describe('foreground refresh', () => {
  beforeEach(() => { vi.useFakeTimers(); setHidden(false); });
  afterEach(() => { vi.useRealTimers(); setHidden(false); });

  it('refreshes every 30 seconds while visible and pauses while hidden', () => {
    const refresh = vi.fn();
    const stop = onForegroundRefresh(refresh);
    vi.advanceTimersByTime(30_000);
    expect(refresh).toHaveBeenCalledTimes(1);
    setHidden(true);
    vi.advanceTimersByTime(60_000);
    expect(refresh).toHaveBeenCalledTimes(1);
    stop();
  });

  it('makes one refresh when returning to the tab fires both visibility and focus', () => {
    const refresh = vi.fn();
    const stop = onForegroundRefresh(refresh);
    setHidden(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(refresh).not.toHaveBeenCalled();
    setHidden(false);
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('focus'));
    window.dispatchEvent(new Event('online'));
    expect(refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(5_000);
    window.dispatchEvent(new Event('focus'));
    expect(refresh).toHaveBeenCalledTimes(2);
    stop();
  });

  it('coalesces an event that lands just after the scheduled refresh', () => {
    const refresh = vi.fn();
    const stop = onForegroundRefresh(refresh);
    vi.advanceTimersByTime(30_000);
    window.dispatchEvent(new Event('focus'));
    expect(refresh).toHaveBeenCalledTimes(1);
    stop();
  });

  it('stops listening once unsubscribed', () => {
    const refresh = vi.fn();
    onForegroundRefresh(refresh)();
    window.dispatchEvent(new Event('focus'));
    vi.advanceTimersByTime(90_000);
    expect(refresh).not.toHaveBeenCalled();
  });
});
