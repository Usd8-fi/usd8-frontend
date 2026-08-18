import { useEffect, useState } from 'react';

const TOKEN_DECIMALS = 18;
const TOKEN_SCALE = 10n ** BigInt(TOKEN_DECIMALS);

function tokenUnits(value) {
  const raw = String(value ?? '0').replace(/,/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(raw)) return 0n;
  const [whole, fraction = ''] = raw.split('.');
  return BigInt(whole) * TOKEN_SCALE
    + BigInt(fraction.slice(0, TOKEN_DECIMALS).padEnd(TOKEN_DECIMALS, '0'));
}

function displayDecimals(rate) {
  const rateUnits = tokenUnits(rate);
  for (let decimals = 1; decimals <= 6; decimals += 1) {
    if (rateUnits * (10n ** BigInt(decimals)) >= TOKEN_SCALE) return decimals;
  }
  return 6;
}

function formatUnitsForDisplay(units, decimals) {
  const fraction = String(units % TOKEN_SCALE)
    .padStart(TOKEN_DECIMALS, '0')
    .slice(0, decimals);
  return `${units / TOKEN_SCALE}.${fraction}`;
}

export function useLivePoolEarnings(pool) {
  const [now, setNow] = useState(Date.now());
  const snapshot = Number(pool?.earningsSnapshotTimestampMilliseconds);
  const periodFinish = Number(pool?.earningsPeriodFinishMilliseconds);
  const rateUnits = tokenUnits(pool?.earningsPerSecond);
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
  const earningsUnits = tokenUnits(pool.earningsExact ?? pool.earnings)
    + rateUnits * BigInt(elapsedMilliseconds) / 1_000n;

  return {
    ...pool,
    earnings: formatUnitsForDisplay(earningsUnits, displayDecimals(pool.earningsPerSecond)),
    hasEarnings: earningsUnits > 0n,
  };
}
