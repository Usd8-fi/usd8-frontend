import { describe, expect, it } from 'vitest';
import { simulateClaimPayout } from './claimSimulation.js';

const WAD = 10n ** 18n;
const usd = (value) => BigInt(value) * WAD;

describe('claim payout simulation (mirrors settlement allocate)', () => {
  const pools = [
    // 10 wstETH at $4,000 (8-decimal feed) = $40,000
    { id: 'wsteth', symbol: 'wstETH', balance: 10n * WAD, price: 400_000_000_000n, priceDecimals: 8, assetDecimals: 18 },
    // 60,000 USD8 at $1 = $60,000
    { id: 'usd8', symbol: 'USD8', balance: 60_000n * WAD, price: 100_000_000n, priceDecimals: 8, assetDecimals: 18 },
  ];
  const base = { coverageBps: 8000, boosters: 0n, boosterBoostBps: 100n, pools, maxCoverPoolPayoutBps: 5000, protocolFeeShareBps: 2000 };

  it('pays the score share when it is below the coverage cap, split pro-rata by pool value', () => {
    const result = simulateClaimPayout({ ...base, claimedValueUsd: usd(100_000), scoreToSpend: usd(1), othersBoostedScore: usd(3) });
    // pools $100k -> budget $50k -> claimant budget $40k -> 25% share = $10k; cap $80k
    expect(result.claimantBudgetUsd).toBe(usd(40_000));
    expect(result.payoutUsd).toBe(usd(10_000));
    expect(result.limitedBy).toBe('score');
    expect(result.payouts.map((p) => p.amount)).toEqual([WAD, 6_000n * WAD]); // 1 wstETH ($4k) + 6,000 USD8
    expect(result.payouts.map((p) => p.usd)).toEqual([usd(4_000), usd(6_000)]);
  });

  it('caps at coverage and does not redistribute the unused share', () => {
    const result = simulateClaimPayout({ ...base, claimedValueUsd: usd(1_000), scoreToSpend: usd(1), othersBoostedScore: 0n });
    expect(result.entitlementUsd).toBe(usd(40_000));
    expect(result.payoutUsd).toBe(usd(800));
    expect(result.limitedBy).toBe('coverage');
  });

  it('applies booster weight to the claimant score', () => {
    const result = simulateClaimPayout({ ...base, claimedValueUsd: usd(1_000_000), scoreToSpend: usd(100), boosters: 10n, othersBoostedScore: usd(110) });
    expect(result.yourBoostedScore).toBe(usd(110));
    expect(result.payoutUsd).toBe(usd(20_000));
  });
});
