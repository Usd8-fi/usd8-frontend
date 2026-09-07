import { formatUnits, parseUnits } from 'viem';
export function redemptionQuote(amount, rate) {
  if (typeof rate !== 'bigint' || rate <= 0n || !/^(?:\d+\.?\d*|\.\d+)$/.test(amount) || (amount.split('.')[1] || '').length > 18) return null;
  return formatUnits(parseUnits(amount, 18) * rate / 10n ** 30n, 6);
}
