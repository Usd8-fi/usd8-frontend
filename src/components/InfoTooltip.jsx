export default function InfoTooltip({ ariaLabel, children, className = '' }) {
  return (
    <span className={`dashboard-help${className ? ` ${className}` : ''}`}>
      <button
        className="dashboard-help-button"
        type="button"
        aria-label={ariaLabel}
        onClick={(event) => event.currentTarget.blur()}
      >
        ?
      </button>
      <span className="dashboard-help-tooltip" role="tooltip">
        {children}
      </span>
    </span>
  );
}
