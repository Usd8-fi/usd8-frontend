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
    }, DAY)).toEqual({ stage: 'Claim Open', stageIndex: 0, daysLeft: 2, hoursLeft: 0, progressPercent: 33, cancellable: true });
  });

  it('describes settlement and final payout phases', () => {
    expect(claimLifecycle({
      phaseDeadlineMilliseconds: DAY,
      phaseWindowMilliseconds: 3 * DAY,
      root: ZERO_ROOT,
    }, 2 * DAY)).toEqual({ stage: 'Settle & Dispute', stageIndex: 1, daysLeft: 2, hoursLeft: 0, progressPercent: 33, cancellable: false });
    expect(claimLifecycle({
      phaseDeadlineMilliseconds: DAY,
      phaseWindowMilliseconds: 3 * DAY,
      root: `0x${'11'.repeat(32)}`,
    }, 2 * DAY)).toEqual({ stage: 'Finalise Payout', stageIndex: 2, daysLeft: 2, hoursLeft: 0, progressPercent: 33, cancellable: false });
  });

  it('shows completed whole days remaining instead of rounding partial days up', () => {
    expect(claimLifecycle({
      phaseDeadlineMilliseconds: 3 * DAY,
      phaseWindowMilliseconds: 3 * DAY,
      root: ZERO_ROOT,
    }, 1)).toMatchObject({ daysLeft: 2, hoursLeft: 23, progressPercent: 0 });
  });
});
