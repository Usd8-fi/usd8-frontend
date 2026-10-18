import LoadingSpinner from './LoadingSpinner.jsx';

export function Metric({ label, children }) {
  return <div className="sd-metric"><span>{label}</span><strong>{children}</strong></div>;
}

export function Panel({ title, note, stale, action, children, className = '' }) {
  return (
    <section className={`sd-panel ${className}`} aria-label={title}>
      <header className="sd-panel-head">
        <h2>{title}</h2>
        {stale ? <span className="sd-stale"><LoadingSpinner />Stale</span> : null}
        {note ? <span className="sd-note">{note}</span> : null}
        {action}
      </header>
      {children}
    </section>
  );
}
