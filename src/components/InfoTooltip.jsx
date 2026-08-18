import { useState } from 'react';

export default function InfoTooltip({ ariaLabel, children, className = '' }) {
  const [alignRight, setAlignRight] = useState(false);

  function positionTooltip(event) {
    const trigger = event.currentTarget.getBoundingClientRect();
    const tooltipWidth = Math.max(0, Math.min(340, window.innerWidth - 32));
    setAlignRight(trigger.left + tooltipWidth > window.innerWidth - 16);
  }

  return (
    <span
      className={`dashboard-help${className ? ` ${className}` : ''}${alignRight && !className.includes('dashboard-help--align-right') ? ' dashboard-help--align-right' : ''}`}
      onPointerEnter={positionTooltip}
      onFocus={positionTooltip}
    >
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
