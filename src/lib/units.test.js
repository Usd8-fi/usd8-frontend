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
