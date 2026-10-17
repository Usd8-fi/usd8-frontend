import { describe, expect, it } from 'vitest';
import {
  hasCurrentBalanceScoreRate,
  scoreBalanceRefreshKey,
  scoreRateChangedSinceSnapshot,
  scoreSnapshotStale,
  scoreWithCurrentBalanceRates,
  scoreWithTokenBreakdown,
} from './scoreRules.js';

const contracts = { usd8: '0xAA', savingsVault: '0xBB' };
const snapshot = {
  scoreSpent: '1',
  snapshotTimestamp: 1_000,
  tokenScores: [
    { token: '0xaa', balance: '100', grossEarnedScore: '10', grossScorePerSecond: '1' },
    { token: '0xbb', balance: '50', grossEarnedScore: '4', grossScorePerSecond: '0.5' },
  ],
};

describe('scoreRules', () => {
  it('splits the snapshot per token by address, case-insensitively', () => {
    const score = scoreWithTokenBreakdown(snapshot, contracts);
    expect(score).toMatchObject({ usd8Score: '10', usd8ScorePerSecond: '1', sUsd8Score: '4', sUsd8ScorePerSecond: '0.5' });
    expect(scoreWithTokenBreakdown({}, contracts)).toMatchObject({ usd8Score: '0', sUsd8Score: '0' });
  });

  it('is stale when a scored balance or onchain scoreSpent moves', () => {
    const current = { scoreBalances: { usd8: '100', savings: '50' }, scoreSpent: '1000000000000000000' };
    expect(scoreSnapshotStale(snapshot, current, contracts)).toBe(false);
    expect(scoreSnapshotStale(snapshot, { ...current, scoreBalances: { usd8: '101', savings: '50' } }, contracts)).toBe(true);
    expect(scoreSnapshotStale(snapshot, { ...current, scoreSpent: '2000000000000000000' }, contracts)).toBe(true);
  });

  it('keys a refresh only while stale, so one balance change triggers one refetch', () => {
    const fresh = { scoreBalances: { usd8: '100', savings: '50' }, scoreSpent: '1000000000000000000' };
    expect(scoreBalanceRefreshKey(snapshot, fresh, contracts, 1, '0xAbC')).toBe('');
    const moved = { ...fresh, scoreBalances: { usd8: '101', savings: '50' } };
    const key = scoreBalanceRefreshKey(snapshot, moved, contracts, 1, '0xAbC');
    expect(key).toContain('0xabc');
    expect(scoreBalanceRefreshKey(snapshot, moved, contracts, 1, '0xAbC')).toBe(key);
  });

  it('accrues at the old rate until the balance change, then at the current rate', () => {
    const score = scoreWithTokenBreakdown({ ...snapshot, snapshotTimestampMilliseconds: 1_000_000 }, contracts);
    const next = scoreWithCurrentBalanceRates(score, { usd8: '2', savings: '0.5' }, { usd8: 1_004_000 }, 1_010_000);
    // usd8: 10 + 1/s * 4s + 2/s * 6s = 26; sUSD8: 4 + 0.5/s * 10s = 9
    expect(next.usd8Score).toBe('26');
    expect(next.sUsd8Score).toBe('9');
    expect(next.grossEarnedScore).toBe('35');
    expect(next.grossScorePerSecond).toBe('2.5');
  });

  describe('Registry rate history', () => {
    // 100 USD8 and 50 sUSD8 held; snapshot at block 1000 (t = 1,000s), chain read at
    // block 1100 (t = 2,200s), so 12s per block. Rate 1e18 per token per block.
    const WAD = 10n ** 18n;
    const held = {
      ...snapshot,
      referenceBlock: '1000',
      snapshotTimestamp: 1_000,
      availableScore: '5',
      maturingScorePerSecond: '0.25',
      tokenScores: [
        { token: '0xaa', balance: (100n * WAD).toString(), grossEarnedScore: '10', grossScorePerSecond: '1' },
        { token: '0xbb', balance: (50n * WAD).toString(), grossEarnedScore: '4', grossScorePerSecond: '0.5' },
      ],
    };
    const history = (usd8, savings = [{ fromBlock: '1', rate: '0' }]) => ({
      rateHistory: { usd8, savings },
      headBlock: '1100',
      balances: { usd8: (100n * WAD).toString(), savings: (50n * WAD).toString() },
      contracts,
    });

    it('applies each rate from its own start block, not the snapshot rate', () => {
      const score = scoreWithTokenBreakdown(held, contracts);
      // Rate 1e16 (100 USD8 earn 1/block) until block 1050, then 3e16 (3/block).
      const next = scoreWithCurrentBalanceRates(score, { usd8: '0.25', savings: '0' }, null, 2_200_000,
        history([{ fromBlock: '1', rate: (WAD / 100n).toString() }, { fromBlock: '1050', rate: (3n * WAD / 100n).toString() }]));
      // 10 + 50 blocks × 1 + 50 blocks × 3 = 210
      expect(next.usd8Score).toBe('210');
      expect(next.sUsd8Score).toBe('4');
      expect(next.grossEarnedScore).toBe('214');
      expect(next.usd8ScorePerSecond).toBe('0.25');
      expect(next.snapshotTimestampMilliseconds).toBe(2_200_000);
      // Available score carries forward at its maturing rate: 5 + 0.25 × 1,200s.
      expect(next.availableScore).toBe('305');
    });

    it('combines rate changes with a balance change since the snapshot', () => {
      const score = scoreWithTokenBreakdown(held, contracts);
      const inputs = history([{ fromBlock: '1', rate: (WAD / 100n).toString() }, { fromBlock: '1050', rate: (3n * WAD / 100n).toString() }]);
      inputs.balances = { ...inputs.balances, usd8: (200n * WAD).toString() };
      // Balance doubles at block 1075 (t = 1,900s).
      const next = scoreWithCurrentBalanceRates(score, { usd8: '0.5', savings: '0' }, { usd8: 1_900_000 }, 2_200_000, inputs);
      // 10 + 50 × 1 + 25 × 3 (100 USD8) + 25 × 6 (200 USD8) = 285
      expect(next.usd8Score).toBe('285');
    });

    it('matches the snapshot-rate result when no rate changed', () => {
      const score = scoreWithTokenBreakdown(held, contracts);
      const next = scoreWithCurrentBalanceRates(score, { usd8: '0.25', savings: '0' }, null, 2_200_000,
        history([{ fromBlock: '1', rate: (WAD / 100n).toString() }]));
      expect(next.usd8Score).toBe('110');
    });

    it('detects a rate change only after the snapshot block', () => {
      expect(scoreRateChangedSinceSnapshot(held, history([{ fromBlock: '1', rate: '1' }]).rateHistory)).toBe(false);
      expect(scoreRateChangedSinceSnapshot(held, history([{ fromBlock: '1', rate: '1' }, { fromBlock: '1001', rate: '3' }]).rateHistory)).toBe(true);
      expect(scoreRateChangedSinceSnapshot({ ...held, referenceBlock: undefined }, history([{ fromBlock: '1001', rate: '3' }]).rateHistory)).toBe(false);
      expect(scoreRateChangedSinceSnapshot(held, null)).toBe(false);
    });
  });

  it('detects whether any held token is currently earning', () => {
    expect(hasCurrentBalanceScoreRate({ usd8: '0', savings: '0.1' })).toBe(true);
    expect(hasCurrentBalanceScoreRate({ usd8: '0', savings: 'bad' })).toBe(false);
    expect(hasCurrentBalanceScoreRate(null)).toBe(false);
  });
});
