const ZERO_ROOT = `0x${'00'.repeat(32)}`;
const HOUR_MILLISECONDS = 3_600_000;
const DAY_MILLISECONDS = 24 * HOUR_MILLISECONDS;

export function remainingTimeParts(deadline, nowMilliseconds) {
  const remaining = Math.max(0, deadline - nowMilliseconds);
  const totalHours = remaining > 0 && remaining < HOUR_MILLISECONDS
    ? 1
    : Math.floor(remaining / HOUR_MILLISECONDS);
  return {
    daysLeft: Math.floor(totalHours / 24),
    hoursLeft: totalHours % 24,
  };
}

function progressPercent(start, end, nowMilliseconds) {
  if (end <= start) return 100;
  const elapsedPercent = Math.floor(((nowMilliseconds - start) * 100) / (end - start));
  return Math.max(0, Math.min(100, elapsedPercent));
}

export function claimLifecycle(incident, nowMilliseconds = Date.now()) {
  const deadline = Number(incident?.phaseDeadlineMilliseconds);
  const phaseWindow = Number(incident?.phaseWindowMilliseconds);
  const hasRoot = String(incident?.root).toLowerCase() !== ZERO_ROOT;

  if (!Number.isFinite(deadline) || !Number.isFinite(phaseWindow)) {
    return {
      state: 'unavailable',
      stage: 'Claim Open',
      stageIndex: 0,
      daysLeft: 0,
      hoursLeft: 0,
      progressPercent: 0,
      cancellable: false,
    };
  }
  if (!hasRoot && nowMilliseconds <= deadline) {
    return {
      state: 'claim-open',
      stage: 'Claim Open',
      stageIndex: 0,
      ...remainingTimeParts(deadline, nowMilliseconds),
      progressPercent: progressPercent(deadline - phaseWindow, deadline, nowMilliseconds),
      cancellable: true,
    };
  }
  if (!hasRoot && nowMilliseconds <= deadline + phaseWindow) {
    return {
      state: 'settlement-open',
      stage: 'Settle Open',
      stageIndex: 1,
      ...remainingTimeParts(deadline + phaseWindow, nowMilliseconds),
      progressPercent: progressPercent(deadline, deadline + phaseWindow, nowMilliseconds),
      cancellable: false,
    };
  }
  if (!hasRoot) {
    return {
      state: 'settlement-expired',
      stage: 'Not Settled',
      stageIndex: 1,
      ...remainingTimeParts(deadline + phaseWindow, nowMilliseconds),
      progressPercent: 100,
      cancellable: false,
    };
  }
  if (nowMilliseconds <= deadline) {
    return {
      state: 'settlement-pending',
      stage: 'Settled',
      stageIndex: 1,
      ...remainingTimeParts(deadline, nowMilliseconds),
      progressPercent: progressPercent(deadline - phaseWindow, deadline, nowMilliseconds),
      cancellable: false,
    };
  }
  if (nowMilliseconds <= deadline + phaseWindow) return {
    state: 'payout-open',
    stage: 'Payout Open',
    stageIndex: 2,
    ...remainingTimeParts(deadline + phaseWindow, nowMilliseconds),
    progressPercent: progressPercent(deadline, deadline + phaseWindow, nowMilliseconds),
    cancellable: false,
  };
  return {
    state: 'payout-expired',
    stage: 'Payout Closed',
    stageIndex: 2,
    ...remainingTimeParts(deadline + phaseWindow, nowMilliseconds),
    progressPercent: 100,
    cancellable: false,
  };
}
