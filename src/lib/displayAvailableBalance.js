export function displayAvailableBalance(available) {
  const value = String(available ?? '').trim();
  const normalized = value.replace(/,/g, '');
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return value;

  const decimalIndex = value.indexOf('.');
  if (decimalIndex < 0) return value;
  const fraction = value.slice(decimalIndex + 1, decimalIndex + 3);
  return fraction ? `${value.slice(0, decimalIndex)}.${fraction}` : value.slice(0, decimalIndex);
}
