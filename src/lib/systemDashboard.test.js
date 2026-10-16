import { describe, expect, it } from 'vitest';
import { exitEpochRows, sumSeries, trailingSeries } from './systemDashboard.js';

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
