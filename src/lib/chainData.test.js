import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  multicall: vi.fn(),
  readContract: vi.fn(),
  getLogs: vi.fn(),
  getBlock: vi.fn(),
  getBlockNumber: vi.fn(),
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
      getBlock: mocks.getBlock,
      getBlockNumber: mocks.getBlockNumber,
    })),
    http: mocks.http,
    fallback: mocks.fallback,
  };
});

import {
  calculateTrailingRewardApr,
  fetchBoosterBalance,
  fetchLandingChainData,
  fetchLogsInChunks,
  rpcTransportFor,
} from './chainData.js';

function insuredTokenConfig(maxCoverageBps) {
  return {
    maxCoverageBps,
    underlyingPriceOracle: '0x0000000000000000000000000000000000000001',
    underlyingConversionAddress: '0x0000000000000000000000000000000000000000',
    underlyingConversionCallData: '0x',
  };
}

const BOOSTER_POLICY = ['0x0000000000000000000000000000000000000000', 0n, 100];
const INCIDENT_POOL_A = '0x55cb69271da9937d0cb3c548409fd3f77586df79';
const INCIDENT_POOL_B = '0x8917f4c377dd0e5bd4909d8a00b508f38c0f3f4f';
const INCIDENT_ASSET_A = '0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa';
const INCIDENT_ASSET_B = '0xbbd327336d5135e146312dd16f2491c1e6ce8822';

describe('rpcTransportFor', () => {
  beforeEach(() => {
    mocks.http.mockReset();
    mocks.fallback.mockReset();
  });

  it('builds a single transport with no fallback layer', () => {
    const transport = Symbol('transport');
    mocks.http.mockReturnValue(transport);

    expect(rpcTransportFor('https://sepolia.example')).toBe(transport);
    expect(mocks.http).toHaveBeenCalledWith('https://sepolia.example', { timeout: 15_000 });
    expect(mocks.fallback).not.toHaveBeenCalled();
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

describe('fetchBoosterBalance', () => {
  beforeEach(() => {
    mocks.readContract.mockReset();
  });

  it('resolves the collection and token ID from the Registry before reading the ERC-1155 balance', async () => {
    const registry = '0xb34d92cd05005df36050370433819597a9bac693';
    const collection = '0xc0012770848fcd350ab11906e93ba9fdfda19f4c';
    const account = '0xb446b0c85cc4ef5f5ebf495c4fdd38ecc5284176';
    mocks.readContract
      .mockResolvedValueOnce([collection, 1n, 100n])
      .mockResolvedValueOnce(100n);

    await expect(fetchBoosterBalance({ readContract: mocks.readContract }, registry, account))
      .resolves.toBe(100n);
    expect(mocks.readContract).toHaveBeenNthCalledWith(1, expect.objectContaining({
      address: registry,
      functionName: 'boosterConfig',
    }));
    expect(mocks.readContract).toHaveBeenNthCalledWith(2, expect.objectContaining({
      address: collection,
      functionName: 'balanceOf',
      args: [account, 1n],
    }));
  });

  it('returns zero without calling an ERC-1155 collection when boosters are not configured', async () => {
    mocks.readContract.mockResolvedValueOnce([
      '0x0000000000000000000000000000000000000000',
      0n,
      0n,
    ]);

    await expect(fetchBoosterBalance(
      { readContract: mocks.readContract },
      '0xb34d92cd05005df36050370433819597a9bac693',
      '0xb446b0c85cc4ef5f5ebf495c4fdd38ecc5284176',
    )).resolves.toBe(0n);
    expect(mocks.readContract).toHaveBeenCalledTimes(1);
  });
});

const EMPTY_POOL = {
  assetBalance: 0n, shares: 0n, totalAssets: 0n, depositCap: 0n, earned: 0n,
  shareDecimals: 21, rewardRate: 0n, totalSupply: 0n, escrowedShares: 0n,
  periodFinish: 0n, exit: [0n, 0n], price: 0n, priceDecimals: 8,
};

/// Builds the landing multicall response: 11 fixed reads then 13 per cover pool,
/// matching fetchLandingChainData's layout without hand-ordering 37 values.
const landingSnapshot = ({
  usdc = 0n, usd8 = 0n, savings = 0n, activeIncidentId = 0n,
  sGho = 0n, sUsds = 0n, msloss = 0n,
  usd8Rates = [], savingsRates = [], nextIncidentId = 7n, scoreSpent = 0n,
  pools = [{}],
  insurance = [8_000n, insuredTokenConfig(8_000), insuredTokenConfig(8_000),
    insuredTokenConfig(8_000), insuredTokenConfig(8_000), insuredTokenConfig(8_000)],
} = {}) => [
  usdc, usd8, savings, activeIncidentId, sGho, sUsds, msloss,
  usd8Rates, savingsRates, BOOSTER_POLICY, nextIncidentId, scoreSpent,
  ...pools.flatMap((overrides) => {
    const pool = { ...EMPTY_POOL, ...overrides };
    return [
      pool.assetBalance, pool.shares, pool.totalAssets, pool.depositCap, pool.earned,
      pool.shareDecimals, pool.rewardRate, pool.totalSupply, pool.escrowedShares,
      pool.periodFinish, pool.exit, [1n, pool.price, 0n, 0n, 1n], pool.priceDecimals,
    ];
  }),
  ...insurance,
];

describe('fetchLandingChainData', () => {
  beforeEach(() => {
    mocks.multicall.mockReset();
    mocks.readContract.mockReset();
    mocks.readContract.mockResolvedValue([
      '0x0000000000000000000000000000000000000000',
      0n,
      0n,
    ]);
    mocks.getLogs.mockReset();
    mocks.getBlock.mockReset();
    mocks.getBlockNumber.mockReset();
    // Claim-log reads are chunked against a concrete head block.
    mocks.getBlockNumber.mockResolvedValue(115_430_000n);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('history unavailable')));
  });

  it('fails closed when token coverage exceeds the contract-reported claimant cap', async () => {
    mocks.multicall.mockResolvedValueOnce(landingSnapshot({
      insurance: [8_000n, insuredTokenConfig(8_001), insuredTokenConfig(8_000),
        insuredTokenConfig(8_000), insuredTokenConfig(7_000), insuredTokenConfig(0)],
    }));

    await expect(fetchLandingChainData(
      '0x0000000000000000000000000000000000000001',
      11155111,
    )).rejects.toThrow('Invalid insurance configuration for usd8.');
  });

  it('reports wstETH pool TVL in USD using the configured onchain oracle', async () => {
    mocks.multicall
      .mockResolvedValueOnce(landingSnapshot({
        usdc: 10_000_000n,
        usd8: 25_000_000_000_000_000_000n,
        savings: 4_000_000_000_000_000_000n,
        activeIncidentId: 7n,
        sGho: 345_000_000_000_000_000_000n,
        sUsds: 678_000_000_000_000_000_000n,
        msloss: 5_000_000_000_000_000_000_000n,
        usd8Rates: [{ fromBlock: 1n, rate: 138_888_888_888_889n }],
        savingsRates: [{ fromBlock: 1n, rate: 13_888_888_888_889n }],
        pools: [{
          shares: 2_100_000_000_000_000_000_000n,
          totalAssets: 10_000_000_000_000_000_000n,
          depositCap: 100_000_000_000_000_000_000n,
          rewardRate: 221_968_543_886_352n,
          totalSupply: 23_010_000_000_000_000_000_000n,
          periodFinish: 1_800_000_000n,
          exit: [12_000_000_000_000_000_000_000n, 1_800_000_000n],
          price: 2_000_000_000_00n,
        }],
        insurance: [8_000n, insuredTokenConfig(8_000), insuredTokenConfig(7_500),
          insuredTokenConfig(6_000), insuredTokenConfig(5_050), insuredTokenConfig(8_000)],
      }))
      // derived batch: convertToAssets(savings), convertToAssets(shares), exitEpochs
      .mockResolvedValueOnce([
        4_200_000_000_000_000_000n,
        2_123_456_789_012_345_678n,
        [12_000_000_000_000_000_000_000n, 0n, 0n, 0n],
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
      ], 259_200n, 42n, [INCIDENT_POOL_A, INCIDENT_POOL_B]])
      .mockResolvedValueOnce([INCIDENT_ASSET_A, INCIDENT_ASSET_B])
      .mockResolvedValueOnce([[
        '0x0000000000000000000000000000000000000001',
        7n,
        345_000_000_000_000_000_000n,
        2n,
        10_000_000_000_000_000_000n,
        false,
      ]]);
    mocks.readContract.mockImplementation(({ functionName, args }) => {
      if (functionName === 'boosterConfig') {
        return ['0xc0012770848fcd350ab11906e93ba9fdfda19f4c', 1n, 100n];
      }
      if (functionName === 'balanceOf' && args.length === 2) return 100n;
      if (functionName === 'convertToAssets' && args[0] === 4_000_000_000_000_000_000n) {
        return 4_200_000_000_000_000_000n;
      }
      if (functionName === 'convertToAssets') return 2_100_000_000_000_000_000n;
      if (functionName === 'exitEpochs') {
        return [12_000_000_000_000_000_000_000n, 0n, 0n, 0n];
      }
      throw new Error(`Unexpected read: ${functionName}`);
    });
    const claimLogs = [
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
    ];
    mocks.getLogs.mockImplementation(({ event }) => {
      if (event?.name !== 'Transfer') return Promise.resolve(claimLogs);
      return Promise.resolve([]);
    });
    vi.mocked(fetch).mockImplementation((url) => {
      if (!String(url).includes('/token-transfers?')) {
        return Promise.reject(new Error('history unavailable'));
      }
      const token = new URL(String(url)).searchParams.get('token');
      return Promise.resolve({
        ok: true,
        json: async () => ({
          items: [{
            block_number: 123,
            timestamp: '2027-01-15T08:01:40.000000Z',
            token: { address_hash: token },
          }],
        }),
      });
    });
    mocks.getBlock.mockResolvedValue({ timestamp: 1_800_000_100n });

    const data = await fetchLandingChainData('0x0000000000000000000000000000000000000001', 11155111);

    expect(data.pools[0].tvl).toBe('$20K');
    expect(data.pools[0].apy).toBe('—');
    expect(data.pools[0].capacityUncapped).toBe(false);
    expect(data.pools[0].assets).toBe('10');
    expect(data.pools[0].remainingDepositCapacity).toBe('90');
    expect(data.scoreBalances).toEqual({
      usd8: '25000000000000000000',
      savings: '4000000000000000000',
    });
    expect(data.scoreRatesPerSecond).toEqual({
      usd8: '0.000289351851851852',
      savings: '0.000004629629629629',
    });
    expect(data.scoreBalanceChangeTimestampMilliseconds).toEqual({
      usd8: 1_800_000_100_000,
      savings: 1_800_000_100_000,
    });
    expect(Number.isSafeInteger(data.scoreBalancesSnapshotTimestampMilliseconds)).toBe(true);
    expect(data.balances.savings).toBe('4');
    expect(data.balances.savingsAssets).toBe('4.2');
    // The deposit line is display-only and stays short.
    expect(data.pools[0].deposit).toBe('2.12');
    expect(data.balances.boosters).toBe('100');
    expect(data.balances.insuredTokens).toEqual({
      'aave-sgho': '345',
      'sky-susds': '678',
      'test-msloss': '5000',
    });
    expect(data.insurance.tokens).toEqual({
      usd8: {
        address: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
        enabled: true,
        maxCoverageBps: '8000',
      },
      susd8: {
        address: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
        enabled: true,
        maxCoverageBps: '7500',
      },
      'aave-sgho': {
        address: '0x6e5eb99a5923bea10eb3990ec8da84e70007e668',
        enabled: true,
        maxCoverageBps: '6000',
      },
      'sky-susds': {
        address: '0x5279e60d104110db53b9d00a54f323e978be3757',
        enabled: true,
        maxCoverageBps: '5050',
      },
      'test-msloss': {
        address: '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
        enabled: true,
        maxCoverageBps: '8000',
      },
    });
    expect(mocks.multicall.mock.calls[0][0].contracts.slice(-6, -5)).toEqual([
      expect.objectContaining({ functionName: 'MAX_CLAIMANT_COVERAGE_BPS' }),
    ]);
    expect(mocks.multicall.mock.calls[0][0].contracts.slice(-5).map((call) => ({
      functionName: call.functionName,
      token: call.args[0],
    }))).toEqual([
      { functionName: 'getInsuredToken', token: '0xa5b32853235619b5e9af364a40c0c6386dbd6055' },
      { functionName: 'getInsuredToken', token: '0x7989b3eb6fad27e404b07433ebd265657359f4ab' },
      { functionName: 'getInsuredToken', token: '0x6e5eb99a5923bea10eb3990ec8da84e70007e668' },
      { functionName: 'getInsuredToken', token: '0x5279e60d104110db53b9d00a54f323e978be3757' },
      { functionName: 'getInsuredToken', token: '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc' },
    ]);
    expect(data.pools[0].hasEarnings).toBe(false);
    expect(data.pools[0].shareDecimals).toBe(21);
    expect(data.pools[0].earningsExact).toBe('0');
    expect(data.pools[0].earningsPerSecond).toBe('0.000020257885361205');
    expect(data.pools[0].earningsPeriodFinishMilliseconds).toBe(1_800_000_000_000);
    expect(Number.isSafeInteger(data.pools[0].earningsSnapshotTimestampMilliseconds)).toBe(true);
    expect(data.balances.poolShares).toBe('2.1');
    expect(data.pools[0].availableForCooldown).toBe('2.1');
    expect(data.pools[0].availableForWithdraw).toBe('0');
    expect(data.pools[0].inCooldown).toBe('12');
    expect(data.pools[0].cooldownEndsAtMilliseconds).toBe(1_800_000_000_000);
    expect(data.activeIncidentId).toBe('7');
    expect(data.incident).toEqual({
      id: '7',
      tokenId: 'test-msloss',
      tokenAddress: '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
      phaseDeadlineMilliseconds: 1_800_259_200_000,
      phaseWindowMilliseconds: 259_200_000,
      root: `0x${'00'.repeat(32)}`,
      unresolvedClaims: '1',
      // 2,344,322 raw + 2 boosters at 100 bps = 2,391,208.44 booster-adjusted.
      totalScoreCommitted: '93819766.44',
      boosterBoostBps: 100,
      poolAddrs: [INCIDENT_POOL_A, INCIDENT_POOL_B],
      poolOrder: [INCIDENT_ASSET_A, INCIDENT_ASSET_B],
    });
    // Located by shape, not call order, so batching changes cannot silently skip it.
    const assetCall = mocks.multicall.mock.calls
      .find(([{ contracts }]) => contracts.every((call) => call.functionName === 'asset'));
    expect(assetCall[0].contracts).toEqual([
      expect.objectContaining({ address: INCIDENT_POOL_A, functionName: 'asset' }),
      expect.objectContaining({ address: INCIDENT_POOL_B, functionName: 'asset' }),
    ]);
    expect(data.claim).toEqual({
      id: '42',
      incidentId: '7',
      insuredTokenAmount: '345',
      bondAmount: '10',
      boosterAmount: '2',
      scoreToSpend: '2344322',
      scoreCommitmentPercentage: '2.5%',
      resolved: false,
    });
    expect(mocks.getLogs).toHaveBeenCalledTimes(1);
    expect(mocks.getBlock).not.toHaveBeenCalled();
  });

  it('loads incident claim totals for a wallet that has not filed a claim', async () => {
    mocks.multicall
      .mockResolvedValueOnce(landingSnapshot({ activeIncidentId: 7n }))
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
      ], 259_200n, 0n, [INCIDENT_POOL_A]])
      .mockResolvedValueOnce([INCIDENT_ASSET_A]);
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
      totalScoreCommitted: '91428558',
      poolAddrs: [INCIDENT_POOL_A],
      poolOrder: [INCIDENT_ASSET_A],
    }));
    expect(mocks.getLogs).toHaveBeenCalledTimes(1);
  });

  it('loads an unresolved historical claim after the active incident expires', async () => {
    const account = '0x0000000000000000000000000000000000000001';
    mocks.multicall
      .mockResolvedValueOnce(landingSnapshot({ activeIncidentId: 0n }))
      .mockResolvedValueOnce([0n, 0n, 0n, 0n, 0n, 42n])
      .mockResolvedValueOnce([[
        account,
        6n,
        100_000_000_000_000_000_000n,
        0n,
        10_000_000_000_000_000_000n,
        false,
      ]])
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
      ], 259_200n, 42n, [INCIDENT_POOL_A]])
      .mockResolvedValueOnce([INCIDENT_ASSET_A]);
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'boosterConfig') {
        return ['0x0000000000000000000000000000000000000000', 0n, 0n];
      }
      throw new Error(`Unexpected read: ${functionName}`);
    });
    mocks.getLogs.mockResolvedValue([{
      eventName: 'ClaimRegistered',
      args: {
        claimId: 42n,
        incidentId: 6n,
        user: account,
        insuredTokenAmount: 100_000_000_000_000_000_000n,
        scoreToSpend: 200_000_000_000_000_000_000n,
        boosterAmount: 0n,
      },
    }]);

    const data = await fetchLandingChainData(account, 11155111);

    expect(data.activeIncidentId).toBe('0');
    expect(data.incident).toEqual(expect.objectContaining({ id: '6', unresolvedClaims: '1' }));
    expect(data.claim).toEqual(expect.objectContaining({
      id: '42',
      incidentId: '6',
      insuredTokenAmount: '100',
      bondAmount: '10',
      resolved: false,
    }));
  });

  it('splits a wide claim-log span into ranges the public endpoints accept', async () => {
    const client = { getLogs: vi.fn().mockResolvedValue([]) };

    await fetchLogsInChunks(client, { address: '0xabc' }, 11_576_840n, 11_626_677n);

    // The default Sepolia endpoint rejects anything wider than 30k blocks.
    const spans = client.getLogs.mock.calls.map(([call]) => call.toBlock - call.fromBlock + 1n);
    expect(spans.every((span) => span <= 10_000n)).toBe(true);
    expect(client.getLogs.mock.calls[0][0].fromBlock).toBe(11_576_840n);
    expect(client.getLogs.mock.calls.at(-1)[0].toBlock).toBe(11_626_677n);
    // Contiguous, no gaps and no overlap.
    client.getLogs.mock.calls.slice(1).forEach(([call], index) => {
      expect(call.fromBlock).toBe(client.getLogs.mock.calls[index][0].toBlock + 1n);
    });
  });

  it('reports an unknown share instead of an impossible zero when claim logs are missing', async () => {
    const account = '0x0000000000000000000000000000000000000001';
    mocks.multicall
      .mockResolvedValueOnce(landingSnapshot({ activeIncidentId: 0n }))
      .mockResolvedValueOnce([0n, 0n, 0n, 0n, 0n, 42n])
      .mockResolvedValueOnce([[
        account, 6n, 100_000_000_000_000_000_000n, 0n, 10_000_000_000_000_000_000n, false,
      ]])
      .mockResolvedValueOnce([[
        '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
        0n, 115_426_632n, 115_428_912n, 1_800_259_200n,
        `0x${'00'.repeat(32)}`, 1n, `0x${'11'.repeat(32)}`, `0x${'22'.repeat(32)}`,
      ], 259_200n, 42n, [INCIDENT_POOL_A]])
      .mockResolvedValueOnce([INCIDENT_ASSET_A]);
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'boosterConfig') {
        return ['0x0000000000000000000000000000000000000000', 0n, 0n];
      }
      throw new Error(`Unexpected read: ${functionName}`);
    });
    // A pruned or capped endpoint returns nothing for the incident's span.
    mocks.getLogs.mockResolvedValue([]);

    const data = await fetchLandingChainData(account, 11155111);

    expect(data.claim.insuredTokenAmount).toBe('100');
    // Score committed exists only in the event; report the gap, never 0.
    expect(data.claim.scoreToSpend).toBe('—');
    expect(data.claim.scoreCommitmentPercentage).toBe('—');
  });

  it('never reads Sepolia contracts for a wallet connected to Ethereum', async () => {
    await expect(fetchLandingChainData('0x0000000000000000000000000000000000000001', 1))
      .rejects.toThrow('USD8 is not deployed on Ethereum');
    expect(mocks.multicall).not.toHaveBeenCalled();
  });

  it('stops before contract reads when the wallet snapshot request is aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(fetchLandingChainData(
      '0x0000000000000000000000000000000000000001',
      11155111,
      { signal: controller.signal },
    )).rejects.toMatchObject({ name: 'AbortError' });
    expect(mocks.multicall).not.toHaveBeenCalled();
  });

  it('stops after an in-flight snapshot RPC when the wallet request is aborted', async () => {
    let resolveMulticall;
    mocks.multicall.mockReturnValueOnce(new Promise((resolve) => {
      resolveMulticall = resolve;
    }));
    const controller = new AbortController();

    const request = fetchLandingChainData(
      '0x0000000000000000000000000000000000000001',
      11155111,
      { signal: controller.signal },
    );
    controller.abort();
    resolveMulticall([]);

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    expect(mocks.getLogs).not.toHaveBeenCalled();
  });
});
