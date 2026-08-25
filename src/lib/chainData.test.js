import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  multicall: vi.fn(),
  readContract: vi.fn(),
  getLogs: vi.fn(),
  http: vi.fn(),
  fallback: vi.fn(),
}));

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      multicall: mocks.multicall,
      readContract: mocks.readContract,
      getLogs: mocks.getLogs,
    })),
    http: mocks.http,
    fallback: mocks.fallback,
  };
});

import { calculateTrailingRewardApr, fetchLandingChainData, rpcTransportFor } from './chainData.js';

describe('rpcTransportFor', () => {
  beforeEach(() => {
    mocks.http.mockReset();
    mocks.fallback.mockReset();
  });

  it('uses the configured RPC directly when there is no fallback', () => {
    const transport = Symbol('transport');
    mocks.http.mockReturnValue(transport);

    expect(rpcTransportFor(['https://sepolia.example'])).toBe(transport);
    expect(mocks.http).toHaveBeenCalledWith('https://sepolia.example', { timeout: 15_000 });
    expect(mocks.fallback).not.toHaveBeenCalled();
  });

  it('keeps RPC URLs in primary-to-fallback order', () => {
    const transports = [Symbol('primary'), Symbol('fallback')];
    const fallbackTransport = Symbol('fallbackTransport');
    mocks.http.mockReturnValueOnce(transports[0]).mockReturnValueOnce(transports[1]);
    mocks.fallback.mockReturnValue(fallbackTransport);

    expect(rpcTransportFor(['https://primary.example', 'https://fallback.example'])).toBe(fallbackTransport);
    expect(mocks.http.mock.calls).toEqual([
      ['https://primary.example', { timeout: 15_000 }],
      ['https://fallback.example', { timeout: 15_000 }],
    ]);
    expect(mocks.fallback).toHaveBeenCalledWith(transports);
  });
});

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
    mocks.getLogs.mockReset();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('history unavailable')));
  });

  it('reports wstETH pool TVL in USD using the configured onchain oracle', async () => {
    mocks.multicall
      .mockResolvedValueOnce([
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
      ])
      .mockResolvedValueOnce([[
        '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
        0n,
        115_426_632n,
        115_428_912n,
        1_800_259_200n,
        `0x${'00'.repeat(32)}`,
        1n,
        `0x${'11'.repeat(32)}`,
        `0x${'22'.repeat(32)}`,
      ], 259_200n, 42n])
      .mockResolvedValueOnce([[
        '0x0000000000000000000000000000000000000001',
        7n,
        345_000_000_000_000_000_000n,
        2n,
        10_000_000_000_000_000_000n,
        false,
      ]]);
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
    mocks.getLogs.mockResolvedValue([
      {
        eventName: 'ClaimRegistered',
        args: {
          claimId: 42n,
          incidentId: 7n,
          user: '0x0000000000000000000000000000000000000001',
          insuredTokenAmount: 345_000_000_000_000_000_000n,
          scoreToSpend: 2_344_322_000_000_000_000_000_000n,
          boosterAmount: 2n,
        },
      },
      {
        eventName: 'ClaimRegistered',
        args: {
          claimId: 43n,
          incidentId: 7n,
          user: '0x0000000000000000000000000000000000000002',
          insuredTokenAmount: 9_655_000_000_000_000_000_000n,
          scoreToSpend: 91_428_558_000_000_000_000_000_000n,
          boosterAmount: 0n,
        },
      },
      {
        eventName: 'ClaimRegistered',
        args: {
          claimId: 44n,
          incidentId: 7n,
          user: '0x0000000000000000000000000000000000000003',
          insuredTokenAmount: 1_000_000_000_000_000_000_000n,
          scoreToSpend: 1_000_000_000_000_000_000_000_000n,
          boosterAmount: 0n,
        },
      },
      {
        eventName: 'ClaimCancelled',
        args: {
          claimId: 44n,
          user: '0x0000000000000000000000000000000000000003',
        },
      },
    ]);

    const data = await fetchLandingChainData('0x0000000000000000000000000000000000000001', 11155111);

    expect(data.pool.tvl).toBe('$20K');
    expect(data.pool.apy).toBe('—');
    expect(data.pool.capacityUncapped).toBe(false);
    expect(data.pool.assets).toBe('10');
    expect(data.pool.remainingDepositCapacity).toBe('90');
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
    expect(data.incident).toEqual({
      id: '7',
      tokenId: 'test-msloss',
      tokenAddress: '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
      phaseDeadlineMilliseconds: 1_800_259_200_000,
      phaseWindowMilliseconds: 259_200_000,
      root: `0x${'00'.repeat(32)}`,
      unresolvedClaims: '1',
      totalInsuredTokenClaims: '10000',
      totalScoreCommitted: '93772880',
    });
    expect(data.claim).toEqual({
      id: '42',
      incidentId: '7',
      insuredTokenAmount: '345',
      bondAmount: '10',
      boosterAmount: '2',
      scoreToSpend: '2,344,322',
      insuredTokenClaimPercentage: '3.4%',
      scoreCommitmentPercentage: '2.5%',
      resolved: false,
    });
    expect(mocks.getLogs).toHaveBeenCalledTimes(1);
  });

  it('loads incident claim totals for a wallet that has not filed a claim', async () => {
    mocks.multicall
      .mockResolvedValueOnce([
        0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 21, 0n,
        [1n, 2_000_000_000_00n, 0n, 0n, 1n], 8, 7n, 0n, 0n, 0n,
        [0n, 0n], 0n, 0n, 0n,
      ])
      .mockResolvedValueOnce([[
        '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
        0n,
        115_426_632n,
        115_428_912n,
        1_800_259_200n,
        `0x${'00'.repeat(32)}`,
        2n,
        `0x${'11'.repeat(32)}`,
        `0x${'22'.repeat(32)}`,
      ], 259_200n, 0n]);
    mocks.getLogs.mockResolvedValue([{
      eventName: 'ClaimRegistered',
      args: {
        claimId: 42n,
        incidentId: 7n,
        user: '0x0000000000000000000000000000000000000002',
        insuredTokenAmount: 9_655_000_000_000_000_000_000n,
        scoreToSpend: 91_428_558_000_000_000_000_000_000n,
      },
    }]);

    const data = await fetchLandingChainData('0x0000000000000000000000000000000000000001', 11155111);

    expect(data.claim).toBeNull();
    expect(data.incident).toEqual(expect.objectContaining({
      totalInsuredTokenClaims: '9655',
      totalScoreCommitted: '91428558',
    }));
    expect(mocks.getLogs).toHaveBeenCalledTimes(1);
  });

  it('never reads Sepolia contracts for a wallet connected to Ethereum', async () => {
    await expect(fetchLandingChainData('0x0000000000000000000000000000000000000001', 1))
      .rejects.toThrow('USD8 is not deployed on Ethereum');
    expect(mocks.multicall).not.toHaveBeenCalled();
  });
});
