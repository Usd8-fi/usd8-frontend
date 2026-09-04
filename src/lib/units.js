const WAD_DECIMALS = 18;
export const WAD = 10n ** BigInt(WAD_DECIMALS);
export const BPS_DENOMINATOR = 10_000n;

/// Parse a display decimal ("1,050.25", ".5", "5.") into WAD units. Non-numeric input is 0.
export function wadUnits(value) {
  const raw = String(value ?? '0').replace(/,/g, '').trim();
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(raw)) return 0n;
  const [whole = '', fraction = ''] = raw.split('.');
  return BigInt(whole || '0') * WAD
    + BigInt(fraction.slice(0, WAD_DECIMALS).padEnd(WAD_DECIMALS, '0'));
}

/// WAD units back to a display decimal. Never grouped — the UI shows no
/// thousands separators anywhere. `trim` drops trailing fraction zeros.
export function formatWad(units, decimals, { trim = false } = {}) {
  const head = String(units / WAD);
  if (decimals === 0) return head;
  let fraction = String(units % WAD).padStart(WAD_DECIMALS, '0').slice(0, decimals);
  if (trim) fraction = fraction.replace(/0+$/, '');
  return fraction ? `${head}.${fraction}` : head;
}

/// Smallest fraction width that makes a per-second rate visibly tick.
export function rateDecimals(rate, { max = 6, whenZero = max } = {}) {
  const units = wadUnits(rate);
  if (units === 0n) return whenZero;
  for (let decimals = 1; decimals <= max; decimals += 1) {
    if (units * 10n ** BigInt(decimals) >= WAD) return decimals;
  }
  return max;
}

/// Mirrors DefiInsurance.finalizeClaim's expectedBoostedScore.
export function boostedScore(scoreToSpend, boosterAmount, boostBps) {
  return scoreToSpend * (BPS_DENOMINATOR + BigInt(boosterAmount ?? 0) * BigInt(boostBps ?? 0))
    / BPS_DENOMINATOR;
}

/// Group the integer part of an already-formatted decimal string.
/// `decimals` undefined keeps the fraction as-is, 0 rounds half-up to a whole
/// number, and any other value fixes the fraction width. Non-numeric input is
/// returned untouched so placeholders like "—" survive.
export function groupDecimalString(value, { decimals } = {}) {
  const raw = String(value ?? '0').replace(/,/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(raw)) return String(value ?? '');
  const [whole, fraction = ''] = raw.split('.');
  if (decimals === 0) {
    return String(BigInt(whole) + (fraction[0] >= '5' ? 1n : 0n));
  }
  const head = String(BigInt(whole));
  if (decimals === undefined) return fraction ? `${head}.${fraction}` : head;
  return `${head}.${fraction.slice(0, decimals).padEnd(decimals, '0')}`;
}

/// WAD USD amount as a currency string.
export function formatUsdWad(units) {
  return `$${formatWad(units, 2)}`;
}

/// One-decimal percentage of `part` against `whole`, both WAD.
export function percentOfWad(part, whole) {
  if (!whole) return null;
  const tenths = (part * 1_000n) / whole;
  return `${tenths / 10n}.${tenths % 10n}%`;
}
