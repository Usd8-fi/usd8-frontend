import { describe, expect, it } from 'vitest';
import { claimLifecycle } from './claimLifecycle.js';

const DAY = 86_400_000;
const ZERO_ROOT = `0x${'00'.repeat(32)}`;

describe('claimLifecycle', () => {
  it('describes an open and cancellable claim', () => {
    expect(claimLifecycle({
      phaseDeadlineMilliseconds: 3 * DAY,
      phaseWindowMilliseconds: 3 * DAY,
      root: ZERO_ROOT,
    }, DAY)).toMatchObject({ state: 'claim-open', stage: 'Claim Open', stageIndex: 0, daysLeft: 2, hoursLeft: 0, progressPercent: 33 });
  });

  it('distinguishes settlement open from settlement expired without a root', () => {
    expect(claimLifecycle({
      phaseDeadlineMilliseconds: DAY,
      phaseWindowMilliseconds: 3 * DAY,
      root: ZERO_ROOT,
    }, 2 * DAY)).toMatchObject({ state: 'settlement-open', stage: 'Settle Open', stageIndex: 1, daysLeft: 2 });
    expect(claimLifecycle({
      phaseDeadlineMilliseconds: DAY,
      phaseWindowMilliseconds: 3 * DAY,
      root: ZERO_ROOT,
    }, 5 * DAY)).toMatchObject({ state: 'settlement-expired', stage: 'Not Settled', stageIndex: 1, daysLeft: 0 });
  });

  it('distinguishes a settled correction window, payout window, and expired payout', () => {
    const settled = { phaseDeadlineMilliseconds: 3 * DAY, phaseWindowMilliseconds: DAY, root: `0x${'11'.repeat(32)}` };
    expect(claimLifecycle(settled, 2 * DAY)).toMatchObject({ state: 'settlement-pending', stage: 'Settled', stageIndex: 1 });
    expect(claimLifecycle({
      phaseDeadlineMilliseconds: DAY,
      phaseWindowMilliseconds: 3 * DAY,
      root: `0x${'11'.repeat(32)}`,
    }, 2 * DAY)).toMatchObject({ state: 'payout-open', stage: 'Payout Open', stageIndex: 2, daysLeft: 2 });
    expect(claimLifecycle({
      phaseDeadlineMilliseconds: DAY,
      phaseWindowMilliseconds: 3 * DAY,
      root: `0x${'11'.repeat(32)}`,
    }, 5 * DAY)).toMatchObject({ state: 'payout-expired', stage: 'Payout Closed', stageIndex: 2, daysLeft: 0 });
  });

  it('shows completed whole days while keeping the final partial hour visible', () => {
    expect(claimLifecycle({
      phaseDeadlineMilliseconds: 3 * DAY,
      phaseWindowMilliseconds: 3 * DAY,
      root: ZERO_ROOT,
    }, 1)).toMatchObject({ daysLeft: 2, hoursLeft: 23, progressPercent: 0 });
    expect(claimLifecycle({
      phaseDeadlineMilliseconds: 30 * 60 * 1_000,
      phaseWindowMilliseconds: DAY,
      root: ZERO_ROOT,
    }, 0)).toMatchObject({ daysLeft: 0, hoursLeft: 1 });
  });
});
