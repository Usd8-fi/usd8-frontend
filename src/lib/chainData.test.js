import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  multicall: vi.fn(),
  readContract: vi.fn(),
}));

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      multicall: mocks.multicall,
      readContract: mocks.readContract,
    })),
    http: vi.fn(),
  };
});

import { calculateTrailingRewardApr, fetchLandingChainData } from './chainData.js';

describe('calculateTrailingRewardApr', () => {
  it('annualizes rewards accrued over the trailing window against time-weighted pool assets', () => {
    const day = 24 * 60 * 60;
    const apr = calculateTrailingRewardApr({
      nowSeconds: 30 * day,
      windowSeconds: 30 * day,
      deploymentTimestamp: 0,
      currentAssetUsdPrice: 2_000_00000000n,
      priceDecimals: 8,
      events: [
        { timestamp: 0, logIndex: 0, type: 'deposit', assets: 10n * 10n ** 18n },
        {
          timestamp: 0,
          logIndex: 1,
          type: 'reward',
          rate: 1_000n * 10n ** 18n / BigInt(30 * day),
          periodFinish: 30 * day,
        },
      ],
    });

    expect(apr).toBe('60.8%');
  });

  it('returns unavailable when the pool had no assets in the trailing window', () => {
    expect(calculateTrailingRewardApr({
      nowSeconds: 100,
      windowSeconds: 100,
      deploymentTimestamp: 0,
      currentAssetUsdPrice: 2_000_00000000n,
      priceDecimals: 8,
      events: [],
    })).toBe('—');
  });
});

describe('fetchLandingChainData', () => {
  beforeEach(() => {
    mocks.multicall.mockReset();
    mocks.readContract.mockReset();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('history unavailable')));
  });

  it('reports wstETH pool TVL in USD using the configured onchain oracle', async () => {
    mocks.multicall.mockResolvedValue([
      10_000_000n,
      25_000_000_000_000_000_000n,
      4_000_000_000_000_000_000n,
      0n,
      2_100_000_000_000_000_000_000n,
      10_000_000_000_000_000_000n,
      100_000_000_000_000_000_000n,
      0n,
      21,
      221_968_543_886_352n,
      [1n, 2_000_000_000_00n, 0n, 0n, 1n],
      8,
      7n,
      23_010_000_000_000_000_000_000n,
      0n,
      1_800_000_000n,
      [12_000_000_000_000_000_000_000n, 1_800_000_000n],
      345_000_000_000_000_000_000n,
      678_000_000_000_000_000_000n,
      5_000_000_000_000_000_000_000n,
    ]);
    mocks.readContract.mockImplementation(({ functionName, args }) => {
      if (functionName === 'convertToAssets' && args[0] === 4_000_000_000_000_000_000n) {
        return 4_200_000_000_000_000_000n;
      }
      if (functionName === 'convertToAssets') return 2_100_000_000_000_000_000n;
      if (functionName === 'exitEpochs') {
        return [12_000_000_000_000_000_000_000n, 0n, 0n, 0n];
      }
      throw new Error(`Unexpected read: ${functionName}`);
    });

    const data = await fetchLandingChainData('0x0000000000000000000000000000000000000001', 11155111);

    expect(data.pool.tvl).toBe('$20K');
    expect(data.pool.apy).toBe('—');
    expect(data.pool.capacityUncapped).toBe(false);
    expect(data.pool.assets).toBe('10');
    expect(data.scoreBalances).toEqual({
      usd8: '25000000000000000000',
      savings: '4000000000000000000',
    });
    expect(data.balances.savings).toBe('4');
    expect(data.balances.savingsAssets).toBe('4.2');
    expect(data.balances.insuredTokens).toEqual({
      'aave-sgho': '345',
      'sky-susds': '678',
      'test-msloss': '5,000',
    });
    expect(data.pool.hasEarnings).toBe(false);
    expect(data.pool.shareDecimals).toBe(21);
    expect(data.pool.earningsExact).toBe('0');
    expect(data.pool.earningsPerSecond).toBe('0.000020257885361205');
    expect(data.pool.earningsPeriodFinishMilliseconds).toBe(1_800_000_000_000);
    expect(Number.isSafeInteger(data.pool.earningsSnapshotTimestampMilliseconds)).toBe(true);
    expect(data.balances.poolShares).toBe('2.1');
    expect(data.pool.availableForCooldown).toBe('2.1');
    expect(data.pool.availableForWithdraw).toBe('0');
    expect(data.pool.inCooldown).toBe('12');
    expect(data.pool.cooldownEndsAtMilliseconds).toBe(1_800_000_000_000);
    expect(data.activeIncidentId).toBe('7');
  });

  it('never reads Sepolia contracts for a wallet connected to Ethereum', async () => {
    await expect(fetchLandingChainData('0x0000000000000000000000000000000000000001', 1))
      .rejects.toThrow('USD8 is not deployed on Ethereum');
    expect(mocks.multicall).not.toHaveBeenCalled();
  });
});
