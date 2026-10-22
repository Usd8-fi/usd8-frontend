import { describe, expect, it, vi } from 'vitest';
import { aaveSupplyApy, exitEpochRows, morphoSupplyApy, reserveApy, sumSeries, trailingSeries } from './systemDashboard.js';

const DAY = 86_400;
const E18 = 10n ** 18n;

describe('trailingSeries', () => {
  const events = [
    { timestamp: 0, logIndex: 0, type: 'deposit', assets: 10n * E18 },
    { timestamp: 0, logIndex: 1, type: 'reward', rate: 100n * E18 / BigInt(23 * DAY), periodFinish: 23 * DAY },
    { timestamp: 23 * DAY, logIndex: 0, type: 'reward', rate: 700n * E18 / BigInt(7 * DAY), periodFinish: 30 * DAY },
    { timestamp: 20 * DAY, logIndex: 1, type: 'deposit', assets: 10n * E18 },
  ];
  const series = trailingSeries({ events, nowSeconds: 30 * DAY, rewardsSince: 0, price: '200000000000', priceDecimals: 8 });

  it('rebuilds pool value in USD from the replayed deposits', () => {
    expect(series.tvl[0]).toEqual({ t: 0, v: 20_000 });
    expect(series.tvl.at(-1)).toEqual({ t: 30 * DAY, v: 40_000 });
    expect(series.tvl.every((point, i, list) => !i || point.t > list[i - 1].t)).toBe(true);
  });

  it('measures each point only with what was known then, so 7D can differ from 30D', () => {
    const last = list => list.at(-1).v;
    expect(last(series.apy7)).toBeGreaterThan(last(series.apy30));
    expect(series.apy30.every(point => Number.isFinite(point.v))).toBe(true);
  });

  it('skips APY points before an hour of rewards exists', () => {
    expect(series.apy30[0].t).toBeGreaterThanOrEqual(3_600);
  });

  it('is empty without events', () => {
    expect(trailingSeries({ events: [], nowSeconds: 10, rewardsSince: 0, price: '1', priceDecimals: 8 })).toEqual({ tvl: [], apy7: [], apy30: [] });
  });
});

describe('exitEpochRows', () => {
  const base = { cooldownSeconds: 7 * DAY, intervalSeconds: 3 * DAY };
  it('groups requests by batch and classifies each batch', () => {
    const now = 100 * DAY;
    const rows = exitEpochRows({
      ...base, nowSeconds: now,
      requests: [
        { shares: 5n * E18, exitEpoch: now + 5 * DAY }, { shares: 3n * E18, exitEpoch: now + 5 * DAY },
        { shares: 2n * E18, exitEpoch: now - DAY }, { shares: 4n * E18, exitEpoch: now - 4 * DAY }, { shares: 0n, exitEpoch: now + 9 * DAY },
      ],
      epochs: new Map([[now - 4 * DAY, { totalShares: 4n * E18, totalAssets: 4n * E18, remainingShares: 4n * E18, remainingAssets: 4n * E18 }]]),
    });
    expect(rows.map(row => [row.state, row.requests, row.shares])).toEqual([
      ['settled', 1, 4n * E18], ['ready', 1, 2n * E18], ['queued', 2, 8n * E18],
    ]);
    expect(rows[0].settledAssets).toBe(4n * E18);
    expect(rows[1].progress).toBe(1);
    expect(rows[2].progress).toBeCloseTo(5 / 10, 5); // 5 of the 10-day cooldown plus batch window remain
  });
});

describe('sumSeries', () => {
  it('adds pools on one timeline and treats a not-yet-created pool as zero', () => {
    const total = sumSeries([[{ t: 0, v: 10 }, { t: 100, v: 20 }], [{ t: 50, v: 5 }, { t: 100, v: 5 }]], 3);
    expect(total).toEqual([{ t: 0, v: 10 }, { t: 50, v: 15 }, { t: 100, v: 25 }]);
    expect(sumSeries([])).toEqual([]);
  });
});

describe('reserve history (90-day window from Blockscout)', () => {
  const word = (value) => BigInt(value).toString(16).padStart(64, '0');
  const MINT = '0x25b428dfde728ccfaddad7e29e4ac23c24ed7fd1a6e3e3f91894a9a073f5dfff';
  const REDEEM = '0xf3a670cd3af7d64b488926880889d08a8585a138ff455227af6737339a1ec262';
  const at = (seconds) => new Date(seconds * 1000).toISOString();
  const log = (topic, data, seconds) => ({ topics: [topic, '0x00'], data: `0x${data}`, block_timestamp: at(seconds) });

  it('decodes USDC mints and redeems, newest first, and stops at the window start', async () => {
    const { fetchReserveFlows } = await import('./systemDashboard.js');
    const pages = [
      { items: [log(MINT, word(50_000_000) + word(50n * 10n ** 18n), 1_000), log(REDEEM, word(5n * 10n ** 18n) + word(5_000_000), 900)], next_page_params: { block_number: 1 } },
      { items: [log(MINT, word(7_000_000) + word(7n * 10n ** 18n), 500), log(MINT, word(1) + word(1), 100)], next_page_params: { block_number: 0 } },
    ];
    const urls = [];
    globalThis.fetch = vi.fn(async (url) => { urls.push(String(url)); return new Response(JSON.stringify(pages[urls.length - 1])); });
    const result = await fetchReserveFlows('https://explorer.example/api/v2', '0xtreasury', 400);
    expect(result.complete).toBe(true);
    expect(result.flows).toEqual([
      { timestamp: 1_000, delta: 50_000_000n },
      { timestamp: 900, delta: -5_000_000n },
      { timestamp: 500, delta: 7_000_000n },
    ]);
    expect(urls).toEqual(['https://explorer.example/api/v2/addresses/0xtreasury/logs', 'https://explorer.example/api/v2/addresses/0xtreasury/logs?block_number=1']);
  });

  it('caps paging and reports an incomplete window instead of scanning forever', async () => {
    const { fetchReserveFlows } = await import('./systemDashboard.js');
    let calls = 0;
    globalThis.fetch = vi.fn(async () => { calls += 1; return new Response(JSON.stringify({ items: [log(MINT, word(1) + word(1), 10_000 - calls)], next_page_params: { page: calls } })); });
    const result = await fetchReserveFlows('https://explorer.example/api/v2', '0xtreasury', 0);
    expect(result.complete).toBe(false);
    expect(calls).toBe(20);
  });

  it('limits the chart to 90 days', async () => {
    const { RESERVE_HISTORY_SECONDS } = await import('./systemDashboard.js');
    expect(RESERVE_HISTORY_SECONDS).toBe(90 * 86_400);
  });
});

describe('strategy APY', () => {
  it('compounds the Aave liquidity rate per second', () => {
    // 3.7751% APR in ray, read from the mainnet USDC reserve.
    expect(aaveSupplyApy(37751073057303415000000000n)).toBeCloseTo(0.038473, 5);
    expect(aaveSupplyApy(0n)).toBe(0);
  });

  it('matches the Morpho API supply APY for a Blue market', () => {
    // PT-reUSD Dec 2026 market state; Morpho API supplyApy 0.0792638.
    const apy = morphoSupplyApy({
      borrowRate: 2683511021n, totalSupplyAssets: 133889032568757n, totalBorrowAssets: 120681589320867n, fee: 0n,
    });
    expect(apy).toBeCloseTo(0.0792638, 6);
    expect(morphoSupplyApy({ borrowRate: 2683511021n, totalSupplyAssets: 0n, totalBorrowAssets: 0n, fee: 0n })).toBe(0);
    const withFee = morphoSupplyApy({ borrowRate: 2683511021n, totalSupplyAssets: 100n, totalBorrowAssets: 100n, fee: 10n ** 17n });
    expect(withFee).toBeCloseTo(Math.expm1(2683511021e-18 * 0.9 * 31_536_000), 9);
  });

  it('weights APY by amount with idle at 0% and fails closed on an unknown funded row', () => {
    expect(reserveApy([{ amount: 25, apy: 0 }, { amount: 75, apy: 0.04 }])).toBeCloseTo(0.03, 12);
    expect(reserveApy([{ amount: 25, apy: 0 }, { amount: 75, apy: null }])).toBeNull();
    expect(reserveApy([{ amount: 100, apy: 0.05 }, { amount: 0, apy: null }])).toBeCloseTo(0.05, 12);
    expect(reserveApy([])).toBeNull();
    expect(reserveApy(null)).toBeNull();
  });
});
