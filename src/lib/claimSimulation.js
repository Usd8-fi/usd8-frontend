// Claim payout estimate. Mirrors the settlement kernel `allocate`
// (offchain-rust/src/lib.rs) for a single claimant against the rest of the
// claim set, using integer math with the same rounding (always down):
//
//   poolUsd        = Σ pool balance × asset USD price
//   claimantBudget = poolUsd × maxCoverPoolPayoutBps × (1 − protocolFeeShareBps)
//   boostedScore   = scoreSpent × (1 + boosters × boostBps)
//   entitlement    = claimantBudget × yourBoosted / (yourBoosted + othersBoosted)
//   cap            = claimed value (pre-drop) × coverageBps
//   payoutUsd      = min(entitlement, cap)
//   per pool       = payoutUsd × poolBalance / poolUsd   (same % from every pool)
//
// Unused budget is not redistributed, matching the protocol.
import { BPS_DENOMINATOR, WAD } from './units.js';

const ZERO = 0n;

function minBigInt(a, b) {
  return a < b ? a : b;
}

/// All amounts are bigint: USD and score in 18-decimal WAD units, pool
/// balances in the asset's own decimals, prices in the feed's decimals.
export function simulateClaimPayout({
  claimedValueUsd,
  coverageBps,
  scoreToSpend,
  boosters = ZERO,
  boosterBoostBps = ZERO,
  othersBoostedScore,
  pools,
  maxCoverPoolPayoutBps,
  protocolFeeShareBps,
}) {
  const poolRows = pools.map((pool) => {
    const usd = (pool.balance * pool.price * WAD)
      / (10n ** BigInt(pool.priceDecimals) * 10n ** BigInt(pool.assetDecimals));
    return { ...pool, usd };
  });
  const poolUsd = poolRows.reduce((sum, pool) => sum + pool.usd, ZERO);
  const grossBudgetUsd = (poolUsd * BigInt(maxCoverPoolPayoutBps)) / BPS_DENOMINATOR;
  const userShareBps = BPS_DENOMINATOR - BigInt(protocolFeeShareBps);
  const claimantBudgetUsd = (grossBudgetUsd * userShareBps) / BPS_DENOMINATOR;
  const protocolFeeUsd = grossBudgetUsd - claimantBudgetUsd;

  const yourBoostedScore = (scoreToSpend
    * (BPS_DENOMINATOR + boosters * BigInt(boosterBoostBps))) / BPS_DENOMINATOR;
  const totalBoostedScore = yourBoostedScore + othersBoostedScore;
  const entitlementUsd = totalBoostedScore === ZERO
    ? ZERO
    : (claimantBudgetUsd * yourBoostedScore) / totalBoostedScore;
  const capUsd = (claimedValueUsd * BigInt(coverageBps)) / BPS_DENOMINATOR;
  const payoutUsd = minBigInt(entitlementUsd, capUsd);
  const limitedBy = payoutUsd === ZERO
    ? 'none'
    : entitlementUsd <= capUsd ? 'score' : 'coverage';

  const payouts = poolRows.map((pool) => {
    const amount = poolUsd === ZERO ? ZERO : (payoutUsd * pool.balance) / poolUsd;
    const usd = poolUsd === ZERO ? ZERO : (payoutUsd * pool.usd) / poolUsd;
    return { id: pool.id, symbol: pool.symbol, assetDecimals: pool.assetDecimals, amount, usd };
  });

  return {
    poolUsd,
    grossBudgetUsd,
    protocolFeeUsd,
    claimantBudgetUsd,
    yourBoostedScore,
    totalBoostedScore,
    weightWad: totalBoostedScore === ZERO ? ZERO : (yourBoostedScore * WAD) / totalBoostedScore,
    entitlementUsd,
    capUsd,
    payoutUsd,
    limitedBy,
    payouts,
  };
}
