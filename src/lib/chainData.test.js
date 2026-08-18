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

import { fetchLandingChainData } from './chainData.js';

describe('fetchLandingChainData', () => {
  beforeEach(() => {
    mocks.multicall.mockReset();
    mocks.readContract.mockReset();
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
    expect(data.pool.apy).toBe('35%');
    expect(data.pool.capacityUncapped).toBe(false);
    expect(data.pool.assets).toBe('10');
    expect(data.scoreBalances).toEqual({
      usd8: '25000000000000000000',
      savings: '4000000000000000000',
    });
    expect(data.balances.savings).toBe('4');
    expect(data.balances.savingsAssets).toBe('4.2');
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
    expect(data.activeIncidentId).toBe('7');
  });

  it('never reads Sepolia contracts for a wallet connected to Ethereum', async () => {
    await expect(fetchLandingChainData('0x0000000000000000000000000000000000000001', 1))
      .rejects.toThrow('USD8 is not deployed on Ethereum');
    expect(mocks.multicall).not.toHaveBeenCalled();
  });
});
