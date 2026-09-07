import { describe, it, expect } from 'vitest';
import { decimalInputValue, displayAvailableBalance } from './displayAvailableBalance.js';

describe('decimal display', () => {
  it.each([['0', '0.00'], ['12', '12.00'], ['3.2', '3.20'], ['.25', '0.25'], ['76.9999', '76.99'], ['123456789123456789.9876', '123456789123456789.98'], ['—', '—']])('formats %s as %s without losing integer precision', (value, expected) => {
    expect(displayAvailableBalance(value)).toBe(expected);
  });
  it('normalizes a typed decimal comma to a dot without removing separators', () => {
    expect(decimalInputValue('1,25')).toBe('1.25');
    expect(decimalInputValue('1.25')).toBe('1.25');
    expect(decimalInputValue('131,239.8999')).toBe('131239.8999');
    expect(decimalInputValue('1,23.45')).toBe('1.23.45');
    expect(decimalInputValue('1,2,3')).toBe('1.2.3');
  });
});
