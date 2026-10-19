export function displayAvailableBalance(available) {
  const value = String(available ?? '').trim();
  const normalized = value.replace(/,/g, '');
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return value;
  const [whole, fraction = ''] = normalized.split('.');
  // Truncate display-only hints so they never overstate the available balance.
  return `${whole || '0'}.${fraction.slice(0, 2).padEnd(2, '0')}`;
}

// Text inputs avoid browsers displaying a locale-specific decimal comma.
export function decimalInputValue(value) {
  const raw = String(value);
  if (/^\d{1,3}(?:,\d{3})+\.\d*$/.test(raw)) return raw.replace(/,/g, '');
  return raw.replace(/,/g, '.');
}
