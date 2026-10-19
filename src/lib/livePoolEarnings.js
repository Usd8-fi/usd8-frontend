import { useSecondClock } from './secondClock.js';
import { formatWad, liveEarningsDecimals, wadUnits } from './units.js';

/// The pool with `earnings` advanced to the current second. Subscribes to the
/// shared clock only while the pool is accruing, so call it in the component
/// that renders the earnings value rather than in a page or dialog parent.
function accrual(pool) {
  const snapshot = Number(pool?.earningsSnapshotTimestampMilliseconds);
  const periodFinish = Number(pool?.earningsPeriodFinishMilliseconds);
  const rateUnits = wadUnits(pool?.earningsPerSecond);
  const canAdvance = Number.isSafeInteger(snapshot)
    && Number.isSafeInteger(periodFinish)
    && snapshot > 0
    && periodFinish > snapshot
    && rateUnits > 0n;
  return { snapshot, periodFinish, rateUnits, canAdvance };
}

/// Whether the pool has withdrawable earnings now, without subscribing to the
/// clock: any positive accrual since the snapshot counts.
export function poolHasEarnings(pool, now = Date.now()) {
  if (pool?.hasEarnings) return true;
  const { snapshot, canAdvance } = accrual(pool);
  return canAdvance && now > snapshot;
}

export function useLivePoolEarnings(pool) {
  const { snapshot, periodFinish, rateUnits, canAdvance } = accrual(pool);
  const now = useSecondClock(canAdvance);

  if (!pool || !canAdvance) return pool;

  const elapsedMilliseconds = Math.max(0, Math.min(now, periodFinish) - snapshot);
  const earningsUnits = wadUnits(pool.earningsExact ?? pool.earnings)
    + rateUnits * BigInt(elapsedMilliseconds) / 1_000n;
  const earningsDecimals = liveEarningsDecimals(pool.earningsPerSecond);

  return {
    ...pool,
    earnings: formatWad(earningsUnits, earningsDecimals),
    hasEarnings: earningsUnits > 0n,
  };
}
