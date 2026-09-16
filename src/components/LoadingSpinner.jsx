/// The one spinner in the app. Omit `label` where the surrounding element already
/// announces the wait (a status line), so screen readers do not hear it twice.
export default function LoadingSpinner({ label }) {
  return label
    ? <span className="usd8-spinner" role="status" aria-label={label} />
    : <span className="usd8-spinner" aria-hidden="true" />;
}

/// Renders `value`, or the standard spinner while it is still unknown. Legacy
/// dash placeholders are treated as pending values so they never flash onscreen.
export function MetricValue({ loading, value, label, fallback = '—' }) {
  const missing = value === null || value === undefined || value === '';
  const temporaryDash = typeof value === 'string' && /^[—–-]$/.test(value.trim());
  if (temporaryDash || (loading && missing)) {
    return <LoadingSpinner label={label} />;
  }
  return missing ? fallback : value;
}
