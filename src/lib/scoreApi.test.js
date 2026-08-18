import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchInsuranceScore } from './scoreApi.js';

afterEach(() => vi.restoreAllMocks());

describe('fetchInsuranceScore', () => {
  it('loads the public AWS score route and normalizes its string fields', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        network: 'sepolia',
        chainId: '11155111',
        account: '0x1111111111111111111111111111111111111111',
        registry: '0x2222222222222222222222222222222222222222',
        grossEarnedScore: '1200000000000000000',
        maturedGrossEarnedScore: '700000000000000000',
        scoreSpent: '200000000000000000',
        availableScore: '1000000000000000000',
        snapshotTimestamp: '1786320000',
        grossScorePerSecond: '150000000000000000',
        maturingScorePerSecond: '100000000000000000',
        tokenScores: [
          {
            token: '0x3333333333333333333333333333333333333333',
            balance: '25000000000000000000',
            grossEarnedScore: '800000000000000000',
            grossScorePerSecond: '100000000000000000',
          },
          {
            token: '0x4444444444444444444444444444444444444444',
            balance: '2000000000000000000',
            grossEarnedScore: '400000000000000000',
            grossScorePerSecond: '50000000000000000',
          },
        ],
        referenceBlock: '123',
        scoreCutoffBlock: '122',
        cacheStatus: 'hit',
      }),
    });

    const result = await fetchInsuranceScore('0x1111111111111111111111111111111111111111', { chainId: 11155111 });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://j9j79vdvkj.execute-api.eu-central-1.amazonaws.com/score/0x1111111111111111111111111111111111111111',
      expect.objectContaining({ headers: { accept: 'application/json' } }),
    );
    expect(result.availableScore).toBe('1');
    expect(result.grossEarnedScore).toBe('1.2');
    expect(result.maturedGrossEarnedScore).toBe('0.7');
    expect(result.scoreSpent).toBe('0.2');
    expect(result.snapshotTimestamp).toBe(1_786_320_000);
    expect(result.grossScorePerSecond).toBe('0.15');
    expect(result.maturingScorePerSecond).toBe('0.1');
    expect(result.tokenScores).toEqual([
      {
        token: '0x3333333333333333333333333333333333333333',
        balance: '25000000000000000000',
        grossEarnedScore: '0.8',
        grossScorePerSecond: '0.1',
      },
      {
        token: '0x4444444444444444444444444444444444444444',
        balance: '2000000000000000000',
        grossEarnedScore: '0.4',
        grossScorePerSecond: '0.05',
      },
    ]);
  });

  it('requests an uncached incremental refresh through the existing route', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        chainId: '11155111',
        account: '0x1111111111111111111111111111111111111111',
        snapshotTimestamp: '1786320000',
        grossEarnedScore: '0',
        maturedGrossEarnedScore: '0',
        scoreSpent: '0',
        availableScore: '0',
        grossScorePerSecond: '0',
        maturingScorePerSecond: '0',
        tokenScores: [{
          token: '0x3333333333333333333333333333333333333333',
          balance: '0',
          grossEarnedScore: '0',
          grossScorePerSecond: '0',
        }],
      }),
    });

    await fetchInsuranceScore('0x1111111111111111111111111111111111111111', {
      chainId: 11155111,
      refresh: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://j9j79vdvkj.execute-api.eu-central-1.amazonaws.com/score/0x1111111111111111111111111111111111111111?refresh=1',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('fails closed on the wrong network', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ chainId: '11155111' }),
    });

    await expect(fetchInsuranceScore('0x1111111111111111111111111111111111111111', { chainId: 1 }))
      .rejects.toThrow('Unexpected score API network');
  });
});
