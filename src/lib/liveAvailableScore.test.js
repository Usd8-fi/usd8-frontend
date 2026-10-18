import { describe, expect, it } from 'vitest';
import { parseMaturingSchedule } from './scoreApi.js';
import { liveAvailableScore } from './scoreRules.js';

const ANCHOR = Date.parse('2026-10-18T07:44:23Z');
const HOUR = 3_600_000;
const at = (ms) => Number(liveAvailableScore(SCORE_IN_PROGRESS, ANCHOR + ms));

// 20 USD8 at 3 score per token per day = 0.000694444… per second.
const RATE = '0.000694444444444445';
const SCORE_IN_PROGRESS = {
  availableScore: '0',
  maturedGrossEarnedScore: '0',
  scoreSpent: '0',
  maturingScorePerSecond: '0',
  maturingAnchorMilliseconds: ANCHOR,
  snapshotTimestamp: ANCHOR / 1000,
  // 0x6b3f…Aa4c on 18 Oct (from the score service on mainnet): cutoff 26217732
  // (no balance yet), 20 USD8 deposited at block 26217989.
  maturingSchedule: [
    { fromBlock: '26217732', scorePerSecond: '0' },
    { fromBlock: '26217989', scorePerSecond: RATE },
  ],
};

describe('liveAvailableScore', () => {
  it('keeps a new depositor at 0 until the cutoff reaches the deposit, then grows at the full rate', () => {
    // The deposit is 257 blocks (3084 s) after the cutoff. Mainnet replay at
    // +300/+600/+1200 blocks gave 0.358333, 2.858333 and 7.858333.
    expect(at(0)).toBe(0);
    expect(at(3_083_000)).toBe(0);
    expect(at(300 * 12_000)).toBeCloseTo(0.358333333, 8);
    expect(at(600 * 12_000)).toBeCloseTo(2.858333333, 8);
    expect(at(1_200 * 12_000)).toBeCloseTo(7.858333333, 8);
  });

  it('holds the cooldown amount flat for a steady holder once the window has passed', () => {
    // Steady 50 USD8 since long before the window: one schedule point at the cutoff.
    const rate = 0.001736111111111112;
    const steady = {
      ...SCORE_IN_PROGRESS,
      availableScore: '110',
      maturedGrossEarnedScore: '110',
      maturingScorePerSecond: String(rate),
      maturingSchedule: [{ fromBlock: '26217732', scorePerSecond: String(rate) }],
    };
    const total = (ms) => 117 + rate * ms / 1000;
    const cooldown = (ms) => total(ms) - Number(liveAvailableScore(steady, ANCHOR + ms));
    expect(cooldown(0)).toBeCloseTo(7, 9);
    expect(cooldown(HOUR)).toBeCloseTo(7, 9);
    expect(cooldown(20 * HOUR)).toBeCloseTo(7, 9);
  });

  it('applies each rate change in the window and continues at the last rate', () => {
    const changing = {
      ...SCORE_IN_PROGRESS,
      availableScore: '1',
      maturedGrossEarnedScore: '1',
      maturingSchedule: [
        { fromBlock: '100', scorePerSecond: '1' },
        { fromBlock: '110', scorePerSecond: '3' }, // deposit 120 s after the cutoff
        { fromBlock: '120', scorePerSecond: '0' }, // full withdrawal 240 s after
      ],
    };
    const value = (seconds) => Number(liveAvailableScore(changing, ANCHOR + seconds * 1000));
    expect(value(60)).toBe(61);
    expect(value(180)).toBe(1 + 120 + 60 * 3);
    expect(value(240)).toBe(1 + 120 + 120 * 3);
    expect(value(10_000)).toBe(1 + 120 + 120 * 3);
  });

  it('subtracts spent score and never goes below 0', () => {
    const spent = { ...SCORE_IN_PROGRESS, availableScore: '0', maturedGrossEarnedScore: '10', scoreSpent: '15',
      maturingSchedule: [{ fromBlock: '1', scorePerSecond: '1' }] };
    expect(Number(liveAvailableScore(spent, ANCHOR + 2_000))).toBe(0);
    expect(Number(liveAvailableScore(spent, ANCHOR + 8_000))).toBe(3);
  });

  it('falls back to the single maturing rate for snapshots without a schedule', () => {
    const legacy = { availableScore: '5', maturingScorePerSecond: '0.5', snapshotTimestamp: ANCHOR / 1000 };
    expect(Number(liveAvailableScore(legacy, ANCHOR + 10_000))).toBe(10);
    expect(Number(liveAvailableScore(legacy, ANCHOR + 10_000, ANCHOR + 4_000))).toBe(8);
    expect(liveAvailableScore({ availableScore: null }, ANCHOR)).toBeNull();
  });
});

describe('parseMaturingSchedule', () => {
  const payload = (maturingSchedule, scoreCutoffBlock = '100') => ({ maturingSchedule, scoreCutoffBlock });

  it('reads score-per-second points from the score cutoff on', () => {
    expect(parseMaturingSchedule(payload([
      { fromBlock: '100', scorePerSecond: '0' },
      { fromBlock: '143', scorePerSecond: '694444444444445' },
    ]))).toEqual([
      { fromBlock: '100', scorePerSecond: '0' },
      { fromBlock: '143', scorePerSecond: '0.000694444444444445' },
    ]);
  });

  it('rejects missing, malformed, unordered or misanchored schedules', () => {
    expect(parseMaturingSchedule({})).toBeNull();
    expect(parseMaturingSchedule(payload([]))).toBeNull();
    expect(parseMaturingSchedule(payload([{ fromBlock: '100', scorePerSecond: '-1' }]))).toBeNull();
    expect(parseMaturingSchedule(payload([{ fromBlock: '100', scorePerSecond: '1' }, { fromBlock: '100', scorePerSecond: '2' }]))).toBeNull();
    expect(parseMaturingSchedule(payload([{ fromBlock: '101', scorePerSecond: '1' }]))).toBeNull();
  });
});
