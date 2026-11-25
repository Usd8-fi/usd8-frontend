import { describe, expect, it } from 'vitest';
import { formatWad, groupDecimalString, wadUnits } from './units.js';

describe('display formatting', () => {
  it('never inserts thousands separators', () => {
    expect(formatWad(1_234_567n * 10n ** 18n, 2)).toBe('1234567.00');
    expect(groupDecimalString('9876543.21')).toBe('9876543.21');
    expect(groupDecimalString('9876543.21', { decimals: 1 })).toBe('9876543.2');
    expect(groupDecimalString('9876543.6', { decimals: 0 })).toBe('9876544');
  });

  it('still parses input that contains them', () => {
    expect(wadUnits('1,234.5')).toBe(1234500000000000000000n);
  });
});

describe('earningsDisplayDecimals', () => {
  it('keeps a stopped earnings balance visible instead of rounding it to 0', async () => {
    const { earningsDisplayDecimals } = await import('./units.js');
    // All shares queued for exit: no accrual, 0.038 USD8 still withdrawable.
    expect(earningsDisplayDecimals('0', '0.03798994321906804')).toBe(2);
    expect(earningsDisplayDecimals('0', '0.000123')).toBe(5);
    expect(earningsDisplayDecimals('0', '0')).toBe(2);
  });

  it('still uses the ticking precision while earnings accrue', async () => {
    const { earningsDisplayDecimals } = await import('./units.js');
    expect(earningsDisplayDecimals('0.000020257885361205', '1.5')).toBe(5);
  });
});
