/// The one spinner in the app. Omit `label` where the surrounding element already
/// announces the wait (a status line), so screen readers do not hear it twice.
export default function LoadingSpinner({ label }) {
  return label
    ? <span className="usd8-spinner" role="status" aria-label={label} />
    : <span className="usd8-spinner" aria-hidden="true" />;
}

/// Renders `value`, or a spinner while it is still unknown. A value that is known
/// to be unavailable falls back to `fallback` rather than spinning forever.
export function MetricValue({ loading, value, label, fallback = '—' }) {
  if (loading && (value === null || value === undefined || value === '')) {
    return <LoadingSpinner label={label} />;
  }
  return value === null || value === undefined || value === '' ? fallback : value;
}
