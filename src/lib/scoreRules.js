// Insurance-score display rules: per-token breakdown, snapshot staleness, and
// extrapolating the last authoritative snapshot at current balance rates.
import { formatUnits, parseUnits } from './viemLite.js';

export function scoreWithTokenBreakdown(score, contracts) {
  const tokenScores = Array.isArray(score?.tokenScores) ? score.tokenScores : [];
  const byToken = new Map(tokenScores.map((item) => [item.token.toLowerCase(), item]));
  const usd8 = byToken.get(contracts?.usd8?.toLowerCase());
  const sUsd8 = byToken.get(contracts?.savingsVault?.toLowerCase());
  return {
    ...score,
    usd8Score: usd8?.grossEarnedScore || '0',
    usd8ScorePerSecond: usd8?.grossScorePerSecond || '0',
    sUsd8Score: sUsd8?.grossEarnedScore || '0',
    sUsd8ScorePerSecond: sUsd8?.grossScorePerSecond || '0',
  };
}

function scoredTokenBalancesChanged(score, scoreBalances, contracts) {
  if (!scoreBalances || !Array.isArray(score?.tokenScores)) return false;
  const byToken = new Map(score.tokenScores.map((item) => [item.token.toLowerCase(), item.balance]));
  return [
    [contracts?.usd8, scoreBalances.usd8],
    [contracts?.savingsVault, scoreBalances.savings],
  ].some(([token, currentBalance]) => {
    const snapshotBalance = token ? byToken.get(token.toLowerCase()) : undefined;
    return typeof snapshotBalance === 'string'
      && typeof currentBalance === 'string'
      && BigInt(snapshotBalance) !== BigInt(currentBalance);
  });
}

// Accepting a payout spends score without moving any token balance, so the
// snapshot also has to be re-fetched when onchain scoreSpent moves past it.
function scoreSpentChanged(score, onchainScoreSpent) {
  if (typeof onchainScoreSpent !== 'string' || typeof score?.scoreSpent !== 'string') return false;
  try {
    return parseUnits(score.scoreSpent, 18) !== BigInt(onchainScoreSpent);
  } catch {
    return false;
  }
}

export function scoreSnapshotStale(score, chainData, contracts) {
  return scoredTokenBalancesChanged(score, chainData?.scoreBalances, contracts)
    || scoreSpentChanged(score, chainData?.scoreSpent);
}

export function scoreBalanceRefreshKey(score, chainData, contracts, chainId, address) {
  if (!scoreSnapshotStale(score, chainData, contracts)) return '';
  const tokenBalances = (score.tokenScores || []).map((item) => `${item.token}:${item.balance}`).join('|');
  return [
    chainId,
    address.toLowerCase(),
    tokenBalances,
    chainData.scoreBalances?.usd8,
    chainData.scoreBalances?.savings,
    chainData.scoreSpent,
  ].join(':');
}

function advanceScoreValue(value, rate, elapsedMilliseconds) {
  const elapsed = BigInt(Math.max(0, Math.floor(elapsedMilliseconds)));
  return formatUnits(
    parseUnits(value || '0', 18) + parseUnits(rate || '0', 18) * elapsed / 1_000n,
    18,
  );
}

export function scoreWithCurrentBalanceRates(
  score,
  rates,
  balanceChangeTimestamps,
  snapshotTimestampMilliseconds,
) {
  if (!score) return score;
  const usd8Rate = rates?.usd8 || '0';
  const savingsRate = rates?.savings || '0';
  if (!Number.isSafeInteger(snapshotTimestampMilliseconds)
    || snapshotTimestampMilliseconds <= 0) {
    return {
      ...score,
      snapshotTimestampMilliseconds: Date.now(),
      grossScorePerSecond: formatUnits(parseUnits(usd8Rate, 18) + parseUnits(savingsRate, 18), 18),
      usd8ScorePerSecond: usd8Rate,
      sUsd8ScorePerSecond: savingsRate,
    };
  }
  const authoritativeTimestampMilliseconds = Number(
    score.snapshotTimestampMilliseconds ?? Number(score.snapshotTimestamp || 0) * 1_000,
  );
  const tokenScore = (token, baseValue, oldRate, currentRate) => {
    const balanceChangeTimestamp = Number(
      balanceChangeTimestamps?.[token] || snapshotTimestampMilliseconds,
    );
    if (!Number.isSafeInteger(authoritativeTimestampMilliseconds)
      || authoritativeTimestampMilliseconds <= 0) {
      return advanceScoreValue(
        baseValue,
        currentRate,
        snapshotTimestampMilliseconds - balanceChangeTimestamp,
      );
    }
    const oldRateEnd = Math.min(
      snapshotTimestampMilliseconds,
      Math.max(authoritativeTimestampMilliseconds, balanceChangeTimestamp),
    );
    const afterOldRate = advanceScoreValue(
      baseValue,
      oldRate,
      oldRateEnd - authoritativeTimestampMilliseconds,
    );
    return advanceScoreValue(
      afterOldRate,
      currentRate,
      snapshotTimestampMilliseconds - Math.max(authoritativeTimestampMilliseconds, balanceChangeTimestamp),
    );
  };
  const usd8Score = tokenScore('usd8', score.usd8Score, score.usd8ScorePerSecond, usd8Rate);
  const savingsScore = tokenScore('savings', score.sUsd8Score, score.sUsd8ScorePerSecond, savingsRate);
  return {
    ...score,
    snapshotTimestampMilliseconds,
    grossEarnedScore: formatUnits(parseUnits(usd8Score, 18) + parseUnits(savingsScore, 18), 18),
    grossScorePerSecond: formatUnits(parseUnits(usd8Rate, 18) + parseUnits(savingsRate, 18), 18),
    usd8Score,
    usd8ScorePerSecond: usd8Rate,
    sUsd8Score: savingsScore,
    sUsd8ScorePerSecond: savingsRate,
  };
}

export function hasCurrentBalanceScoreRate(rates) {
  return ['usd8', 'savings'].some((token) => {
    try {
      return parseUnits(rates?.[token] || '0', 18) > 0n;
    } catch {
      return false;
    }
  });
}
