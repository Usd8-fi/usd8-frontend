import { expect, it } from 'vitest';
import { redemptionQuote } from './quote.js';
it('uses the pro-rata rate and exact bigint units for the displayed redemption output', () => {
  expect(redemptionQuote('1.5', 800_000_000_000_000_000n)).toBe('1.2');
  expect(redemptionQuote('9007199254740993.000001', 10n ** 18n)).toBe('9007199254740993.000001');
  expect(redemptionQuote('0.0000000000000000001', 10n ** 18n)).toBe(null);
  expect(redemptionQuote('1', null)).toBe(null);
});
