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

// ─── Rate history ───────────────────────────────────────────────────────────
// Registry rates are score per whole token per block (1e18-scaled); the score
// service converts with the same 12-second block, so a token earns
// balance × rate / 1e18 / 12 score per second.
const WAD = 10n ** 18n;
const BLOCK_MILLISECONDS = 12_000n;

function validRateHistory(history) {
  return Array.isArray(history) && history.every((point) => {
    try {
      return BigInt(point.fromBlock) >= 0n && BigInt(point.rate) >= 0n;
    } catch {
      return false;
    }
  });
}

function rateAtBlock(history, block) {
  let rate = 0n;
  for (const point of history) {
    if (BigInt(point.fromBlock) <= block) rate = BigInt(point.rate);
  }
  return rate;
}

function referenceBlockOf(score) {
  try {
    const block = BigInt(score?.referenceBlock);
    return block > 0n ? block : null;
  } catch {
    return null;
  }
}

/// True when the Registry changed a scored rate after the score snapshot's block,
/// so the snapshot's own per-second rates no longer describe the time since then.
export function scoreRateChangedSinceSnapshot(score, rateHistory) {
  const reference = referenceBlockOf(score);
  if (reference === null || !rateHistory) return false;
  return ['usd8', 'savings'].some((token) => validRateHistory(rateHistory[token])
    && rateHistory[token].some((point) => BigInt(point.fromBlock) > reference));
}

// Rate segments in wall-clock time. Block times are interpolated between the
// snapshot's reference block and the head block read with the chain data, so no
// block-timestamp RPC call is needed (accurate to within a block or two).
function rateSegments(history, timing) {
  const { referenceBlock, referenceMilliseconds, headBlock, headMilliseconds } = timing;
  const blocks = headBlock - referenceBlock;
  const span = BigInt(Math.max(0, headMilliseconds - referenceMilliseconds));
  const atBlock = (block) => Number(blocks > 0n
    ? BigInt(referenceMilliseconds) + (block - referenceBlock) * span / blocks
    : BigInt(referenceMilliseconds) + (block - referenceBlock) * BLOCK_MILLISECONDS);
  const segments = [{ startMilliseconds: -Infinity, rate: rateAtBlock(history, referenceBlock) }];
  for (const point of history) {
    const fromBlock = BigInt(point.fromBlock);
    if (fromBlock > referenceBlock) segments.push({ startMilliseconds: atBlock(fromBlock), rate: BigInt(point.rate) });
  }
  return segments.sort((a, b) => a.startMilliseconds - b.startMilliseconds);
}

// Score (18-decimal units) earned by `balance` over [start, end) under `segments`.
function scoreUnitsOver(balance, segments, startMilliseconds, endMilliseconds) {
  let total = 0n;
  segments.forEach((segment, index) => {
    const from = Math.max(startMilliseconds, segment.startMilliseconds);
    const to = Math.min(endMilliseconds, segments[index + 1]?.startMilliseconds ?? Infinity);
    if (to > from) {
      total += balance * segment.rate * BigInt(Math.floor(to - from)) / (WAD * BLOCK_MILLISECONDS);
    }
  });
  return total;
}

function historyInputs(score, history) {
  const reference = referenceBlockOf(score);
  const referenceMilliseconds = Number(score?.snapshotTimestampMilliseconds ?? Number(score?.snapshotTimestamp || 0) * 1_000);
  if (reference === null || !history?.rateHistory || !history.balances
    || !Number.isSafeInteger(referenceMilliseconds) || referenceMilliseconds <= 0) return null;
  let headBlock;
  try {
    headBlock = BigInt(history.headBlock);
  } catch {
    return null;
  }
  const byToken = new Map((score.tokenScores || []).map((item) => [item.token.toLowerCase(), item.balance]));
  const tokens = {};
  for (const [token, address] of [['usd8', history.contracts?.usd8], ['savings', history.contracts?.savingsVault]]) {
    const rates = history.rateHistory[token];
    if (!validRateHistory(rates)) return null;
    try {
      tokens[token] = {
        rates,
        snapshotBalance: BigInt(byToken.get(address?.toLowerCase?.()) ?? '0'),
        currentBalance: BigInt(history.balances[token] ?? '0'),
      };
    } catch {
      return null;
    }
  }
  return { referenceBlock: reference, referenceMilliseconds, headBlock, tokens };
}

/// Advance the snapshot to `snapshotTimestampMilliseconds` (the chain-data read).
/// With `history` ({ rateHistory, headBlock, balances, contracts }) every Registry
/// rate applies from its own start block; without it, the snapshot's rate is used
/// until the balance change and the current rate after it.
export function scoreWithCurrentBalanceRates(
  score,
  rates,
  balanceChangeTimestamps,
  snapshotTimestampMilliseconds,
  history = null,
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
  const inputs = historyInputs(score, history);
  const tokenScore = (token, baseValue, oldRate, currentRate) => {
    if (inputs) {
      const { rates: tokenRates, snapshotBalance, currentBalance } = inputs.tokens[token];
      const segments = rateSegments(tokenRates, {
        referenceBlock: inputs.referenceBlock,
        referenceMilliseconds: authoritativeTimestampMilliseconds,
        headBlock: inputs.headBlock,
        headMilliseconds: snapshotTimestampMilliseconds,
      });
      const balanceChange = Math.min(
        snapshotTimestampMilliseconds,
        Math.max(authoritativeTimestampMilliseconds, Number(balanceChangeTimestamps?.[token] || snapshotTimestampMilliseconds)),
      );
      return formatUnits(
        parseUnits(baseValue || '0', 18)
          + scoreUnitsOver(snapshotBalance, segments, authoritativeTimestampMilliseconds, balanceChange)
          + scoreUnitsOver(currentBalance, segments, balanceChange, snapshotTimestampMilliseconds),
        18,
      );
    }
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
  // Moving the anchor must carry the available score forward too: it matures at
  // the snapshot's own rate (score from before the holding window), unaffected by
  // balance or rate changes since the snapshot.
  const availableScore = score.availableScore != null
    && Number.isSafeInteger(authoritativeTimestampMilliseconds) && authoritativeTimestampMilliseconds > 0
    ? advanceScoreValue(score.availableScore, score.maturingScorePerSecond,
      snapshotTimestampMilliseconds - authoritativeTimestampMilliseconds)
    : score.availableScore;
  return {
    ...score,
    availableScore,
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
