const UNITS = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
];

function parts(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return null;
  // Largest unit that divides the duration exactly; otherwise round to the
  // nearest whole minute so short testnet windows still read naturally.
  if (value < 60) return [Math.round(value), 'second'];
  const exact = UNITS.slice(0, 3).find(([, size]) => value % size === 0 && value >= size);
  if (exact) return [value / exact[1], exact[0]];
  return [Math.max(1, Math.round(value / 60)), 'minute'];
}

/// "7 days", "1 hour", "5 minutes"; null when the deployment value is unknown.
export function durationPhrase(seconds) {
  const result = parts(seconds);
  if (!result) return null;
  const [count, unit] = result;
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

/// "7-day", "1-hour", "5-minute", for use before a noun; null when unknown.
export function durationAdjective(seconds) {
  const result = parts(seconds);
  return result ? `${result[0]}-${result[1]}` : null;
}
