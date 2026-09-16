import { describe, expect, it } from 'vitest';
import { liveEarningsDecimals } from './units.js';

describe('live cover-pool earnings precision', () => {
  it('uses the smallest precision that visibly advances each second', () => {
    expect(liveEarningsDecimals('0.2')).toBe(1);
    expect(liveEarningsDecimals('0.041330829249072799')).toBe(2);
    expect(liveEarningsDecimals('0.000165323316996290')).toBe(4);
    expect(liveEarningsDecimals('0.000016527780422222')).toBe(5);
  });

  it('shows no decimals when a live tick would require more than ten', () => {
    expect(liveEarningsDecimals('0.0000000001')).toBe(10);
    expect(liveEarningsDecimals('0.00000000001')).toBe(0);
    expect(liveEarningsDecimals('0')).toBe(0);
  });
});
