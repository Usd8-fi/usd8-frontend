import { describe, it, expect } from 'vitest';
import { exitAssetAmount, poolRedemptionQuote } from './poolWithdrawal.js';
const share = 10n ** 21n;
const asset = 10n ** 18n;
describe('share redemption estimates', () => {
  const snapshot = { totalAssets: '31901131803467721787', totalSupply: '64010000000000000000000' };
  it('matches the actual payout of the reported withdrawal', () => {
    expect(poolRedemptionQuote('1', snapshot)).toBe('0.49837731297403096');
    expect(poolRedemptionQuote('0.4', snapshot)).toBe('0.199350925189612384');
  });
  it('retains full share precision and handles a depleted pool', () => {
    expect(poolRedemptionQuote('1.000000000000000000001', { totalAssets: '100000000000000000000', totalSupply: '100000000000000000000000' })).toBe('1');
    expect(poolRedemptionQuote('1', { totalAssets: '0', totalSupply: String(share) })).toBe('0');
  });
  it('includes the final-exit rounding remainder', () => {
    expect(poolRedemptionQuote('1', { totalAssets: '123', totalSupply: String(share) })).toBe('0.000000000000000123');
  });
  it.each(['', '-1', 'abc', '1e2', '1.0000000000000000000001'])('does not invent an estimate for invalid input %s', value => {
    expect(poolRedemptionQuote(value, snapshot)).toBeNull();
  });
  it('keeps unavailable or invalid pool state unknown', () => {
    expect(poolRedemptionQuote('1', null)).toBeNull();
    expect(poolRedemptionQuote('1', { totalAssets: '-1', totalSupply: '1' })).toBeNull();
    expect(poolRedemptionQuote('999', snapshot)).toBeNull();
  });
  it('uses the current estimate only for unsettled exits', () => {
    expect(exitAssetAmount(share, [share, 0n, 0n, 0n], asset / 2n)).toBe(asset / 2n);
  });
  it('uses the settled receipt even when the live pool rate changes', () => {
    expect(exitAssetAmount(share, [share * 2n, asset, share * 2n, asset], 1n)).toBe(asset / 2n);
  });
  it('pays the entire remaining reserve to the last claimant, including rounding dust', () => {
    expect(exitAssetAmount(share, [share * 3n, 10n, share, 4n], 1n)).toBe(4n);
    expect(exitAssetAmount(share, [share, 0n, share, 0n], asset)).toBe(0n);
  });
});
