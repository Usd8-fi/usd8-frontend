import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ status: 'disconnected', reconnect: vi.fn() }));
vi.mock('wagmi', () => ({ useAccount: () => ({ status: mocks.status }), useReconnect: () => ({ reconnect: mocks.reconnect }) }));
import WalletRestore, { RESTORE_RETRY_DELAYS_MS, hasSavedSession } from './WalletRestore.jsx';

const SAVED = JSON.stringify({ state: { current: 'abc' } });
beforeEach(() => { vi.useFakeTimers(); mocks.reconnect.mockClear(); mocks.status = 'disconnected'; localStorage.clear(); });
afterEach(() => vi.useRealTimers());

describe('WalletRestore', () => {
  it('detects a saved session', () => {
    expect(hasSavedSession()).toBe(false);
    localStorage.setItem('wagmi.store', SAVED);
    expect(hasSavedSession()).toBe(true);
    localStorage.setItem('wagmi.store', '{bad');
    expect(hasSavedSession()).toBe(false);
  });

  it('retries the restore while a saved session exists and nothing is connected', () => {
    localStorage.setItem('wagmi.store', SAVED);
    render(<WalletRestore />);
    vi.advanceTimersByTime(Math.max(...RESTORE_RETRY_DELAYS_MS) + 10);
    expect(mocks.reconnect).toHaveBeenCalledTimes(RESTORE_RETRY_DELAYS_MS.length);
  });

  it('does nothing without a saved session, when connected, or while reconnecting', () => {
    render(<WalletRestore />);
    vi.advanceTimersByTime(6000);
    expect(mocks.reconnect).not.toHaveBeenCalled();
    localStorage.setItem('wagmi.store', SAVED);
    for (const status of ['connected', 'reconnecting']) {
      mocks.status = status;
      render(<WalletRestore />);
    }
    vi.advanceTimersByTime(6000);
    expect(mocks.reconnect).not.toHaveBeenCalled();
  });
});
