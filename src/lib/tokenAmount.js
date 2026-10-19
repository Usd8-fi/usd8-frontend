function decimalParts(value) {
  const normalized = String(value ?? '').replace(/,/g, '').trim();
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;

  const [rawInteger = '', fraction = ''] = normalized.split('.');
  const integer = rawInteger.replace(/^0+(?=\d)/, '') || '0';
  return { integer, fraction };
}

export function tokenAmountExceedsBalance(amount, balance) {
  const amountParts = decimalParts(amount);
  const balanceParts = decimalParts(balance);
  if (!amountParts || !balanceParts) return false;

  if (amountParts.integer.length !== balanceParts.integer.length) {
    return amountParts.integer.length > balanceParts.integer.length;
  }
  if (amountParts.integer !== balanceParts.integer) {
    return amountParts.integer > balanceParts.integer;
  }

  const fractionLength = Math.max(amountParts.fraction.length, balanceParts.fraction.length);
  return amountParts.fraction.padEnd(fractionLength, '0')
    > balanceParts.fraction.padEnd(fractionLength, '0');
}
