import { describe, it, expect } from 'vitest';
import { decimalInputValue, displayAvailableBalance, visibleDecimals } from './displayAvailableBalance.js';

describe('decimal display', () => {
  it.each([['0', '0.00'], ['12', '12.00'], ['3.2', '3.20'], ['.25', '0.25'], ['76.9999', '76.99'], ['123456789123456789.9876', '123456789123456789.98'], ['—', '—']])('formats %s as %s without losing integer precision', (value, expected) => {
    expect(displayAvailableBalance(value)).toBe(expected);
  });
  it.each([
    ['0.001234', '0.0012'], ['0.0099999', '0.0099'], ['0.000000000000000001', '0.0000000000'], ['0.00000000012345', '0.0000000001'], ['0.0000000099', '0.0000000099'],
    ['0.01', '0.01'], ['0.009', '0.009'], ['0.00', '0.00'], ['1.0001', '1.00'],
  ])('shows small balance %s as %s instead of 0.00', (value, expected) => {
    expect(displayAvailableBalance(value)).toBe(expected);
  });
  it('widens decimals only for a positive amount below the usual precision', () => {
    expect(visibleDecimals('12.5')).toBe(2);
    expect(visibleDecimals('0.05')).toBe(2);
    expect(visibleDecimals('0.000345')).toBe(5);
    expect(visibleDecimals('0')).toBe(2);
    expect(visibleDecimals('0.4', 0)).toBe(1);
    expect(visibleDecimals('7.4', 0)).toBe(0);
    expect(visibleDecimals('—')).toBe(2);
  });
  it('normalizes a typed decimal comma to a dot without removing separators', () => {
    expect(decimalInputValue('1,25')).toBe('1.25');
    expect(decimalInputValue('1.25')).toBe('1.25');
    expect(decimalInputValue('131,239.8999')).toBe('131239.8999');
    expect(decimalInputValue('1,23.45')).toBe('1.23.45');
    expect(decimalInputValue('1,2,3')).toBe('1.2.3');
  });
});
