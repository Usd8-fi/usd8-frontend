import { describe, expect, it } from 'vitest';
import {
  hasCurrentBalanceScoreRate,
  scoreBalanceRefreshKey,
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

  it('detects whether any held token is currently earning', () => {
    expect(hasCurrentBalanceScoreRate({ usd8: '0', savings: '0.1' })).toBe(true);
    expect(hasCurrentBalanceScoreRate({ usd8: '0', savings: 'bad' })).toBe(false);
    expect(hasCurrentBalanceScoreRate(null)).toBe(false);
  });
});
