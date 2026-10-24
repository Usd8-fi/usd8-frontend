const DECIMAL = /^(?:\d+\.?\d*|\.\d+)$/;
/// Never show more than this many decimals, however small the amount.
export const MAX_DISPLAY_DECIMALS = 10;

/// Decimals needed to show an amount: `min` normally; when a positive amount
/// would read as zero at `min` decimals, enough to show its first
/// `significant` digits (0.000123 → 5 decimals → "0.00012"), capped at
/// MAX_DISPLAY_DECIMALS so dust (1 wei) reads 0.0000000000.
export function visibleDecimals(value, min = 2, significant = 2) {
  const normalized = String(value ?? '').trim().replace(/,/g, '');
  if (!DECIMAL.test(normalized)) return min;
  const [whole, fraction = ''] = normalized.split('.');
  if (/[1-9]/.test(whole) || /[1-9]/.test(fraction.slice(0, min))) return min;
  const first = fraction.search(/[1-9]/);
  return first < 0 ? min : Math.max(min, Math.min(first + significant, fraction.length, MAX_DISPLAY_DECIMALS));
}

export function displayAvailableBalance(available) {
  const value = String(available ?? '').trim();
  const normalized = value.replace(/,/g, '');
  if (!DECIMAL.test(normalized)) return value;
  const [whole, fraction = ''] = normalized.split('.');
  const decimals = visibleDecimals(normalized);
  // Truncate display-only hints so they never overstate the available balance.
  return `${whole || '0'}.${fraction.slice(0, decimals).padEnd(decimals, '0')}`;
}

// Text inputs avoid browsers displaying a locale-specific decimal comma.
export function decimalInputValue(value) {
  const raw = String(value);
  if (/^\d{1,3}(?:,\d{3})+\.\d*$/.test(raw)) return raw.replace(/,/g, '');
  return raw.replace(/,/g, '.');
}
