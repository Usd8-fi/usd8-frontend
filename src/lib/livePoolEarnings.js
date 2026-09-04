import { useEffect, useState } from 'react';
import { formatWad, rateDecimals, wadUnits } from './units.js';

export function useLivePoolEarnings(pool) {
  const [now, setNow] = useState(Date.now());
  const snapshot = Number(pool?.earningsSnapshotTimestampMilliseconds);
  const periodFinish = Number(pool?.earningsPeriodFinishMilliseconds);
  const rateUnits = wadUnits(pool?.earningsPerSecond);
  const canAdvance = Number.isSafeInteger(snapshot)
    && Number.isSafeInteger(periodFinish)
    && snapshot > 0
    && periodFinish > snapshot
    && rateUnits > 0n;

  useEffect(() => {
    setNow(Date.now());
    if (!canAdvance) return undefined;
    const update = () => {
      if (!document.hidden) setNow(Date.now());
    };
    const timer = window.setInterval(update, 1_000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [canAdvance, snapshot, periodFinish]);

  if (!pool || !canAdvance) return pool;

  const elapsedMilliseconds = Math.max(0, Math.min(now, periodFinish) - snapshot);
  const earningsUnits = wadUnits(pool.earningsExact ?? pool.earnings)
    + rateUnits * BigInt(elapsedMilliseconds) / 1_000n;

  return {
    ...pool,
    earnings: formatWad(earningsUnits, rateDecimals(pool.earningsPerSecond)),
    hasEarnings: earningsUnits > 0n,
  };
}
