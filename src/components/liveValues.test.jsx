import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Count renders of a component that only appears in the page body (never in
// a live value), so a page-level re-render on each clock tick would show up.
const tooltipRenders = vi.hoisted(() => ({ count: 0 }));
vi.mock('./InfoTooltip.jsx', () => ({
  default: ({ children }) => {
    tooltipRenders.count += 1;
    return <span role="tooltip">{children}</span>;
  },
}));

const { default: USD8Landing } = await import('./USD8Landing.jsx');
const { secondClockSubscriberCount } = await import('../lib/secondClock.js');

const wallet = { connected: true, address: '0x0000000000000000000000000000000000000001', onConnect: () => {}, onDisconnect: () => {} };
const score = {
  snapshotTimestamp: 20,
  grossEarnedScore: '128600',
  grossScorePerSecond: '0.2',
  availableScore: '96400',
  maturingScorePerSecond: '0.1',
  usd8Score: '84200',
  usd8ScorePerSecond: '0.1',
  sUsd8Score: '44400',
  sUsd8ScorePerSecond: '0.1',
};
const pools = [{
  id: 'wsteth',
  name: 'wstEth Cover Pool',
  assetSymbol: 'wstETH',
  shareSymbol: 'USD8-cp-wstETH',
  earnings: '1',
  earningsExact: '1',
  earningsPerSecond: '0.2',
  earningsSnapshotTimestampMilliseconds: 20_000,
  earningsPeriodFinishMilliseconds: 80_000,
  hasEarnings: true,
}];

describe('live values', () => {
  afterEach(() => vi.useRealTimers());

  it('re-renders only the ticking values each second, from one shared timer', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(20_000));
    const setInterval = vi.spyOn(window, 'setInterval');
    const { unmount } = render(<USD8Landing wallet={wallet} pools={pools} score={score} />);

    // Four score figures plus pool earnings share a single 1-second timer.
    expect(secondClockSubscriberCount()).toBe(5);
    expect(setInterval.mock.calls.filter(([, delay]) => delay === 1_000)).toHaveLength(1);

    const rendersBefore = tooltipRenders.count;
    act(() => vi.advanceTimersByTime(3_000));
    expect(screen.getByText('Total Insurance Score').parentElement).toHaveTextContent('128600.6');
    expect(screen.getByText('Your Earnings').nextElementSibling).toHaveTextContent('1.6 USD8');
    expect(tooltipRenders.count).toBe(rendersBefore);

    unmount();
    expect(secondClockSubscriberCount()).toBe(0);
  });
});
