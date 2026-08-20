import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function InfoTooltip({ ariaLabel, children, className = '', floating = true }) {
  const [alignRight, setAlignRight] = useState(false);
  const [floatingStyle, setFloatingStyle] = useState({});
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef(null);

  function positionTooltip(event) {
    const trigger = event.currentTarget.getBoundingClientRect();
    const tooltipWidth = Math.max(0, Math.min(340, window.innerWidth - 32));
    const nextAlignRight = trigger.left + tooltipWidth > window.innerWidth - 16;
    setAlignRight(nextAlignRight);

    if (floating) {
      const tooltipHeight = tooltipRef.current?.offsetHeight || 140;
      const roomBelow = window.innerHeight - trigger.bottom - 16;
      setFloatingStyle({
        left: `${nextAlignRight ? Math.max(16, trigger.right - tooltipWidth) : Math.max(16, trigger.left)}px`,
        top: `${roomBelow >= tooltipHeight + 10 ? trigger.bottom + 10 : Math.max(16, trigger.top - tooltipHeight - 10)}px`,
        width: `${tooltipWidth}px`,
      });
    }
  }

  const tooltip = (
    <span
      ref={tooltipRef}
      className={`dashboard-help-tooltip${floating ? ' dashboard-help-tooltip--floating' : ''}${floating && visible ? ' dashboard-help-tooltip--visible' : ''}`}
      role="tooltip"
      style={floating ? floatingStyle : undefined}
    >
      {children}
    </span>
  );

  return (
    <span
      className={`dashboard-help${className ? ` ${className}` : ''}${alignRight && !className.includes('dashboard-help--align-right') ? ' dashboard-help--align-right' : ''}`}
      onPointerEnter={(event) => {
        positionTooltip(event);
        setVisible(true);
      }}
      onPointerLeave={() => setVisible(false)}
      onFocus={(event) => {
        positionTooltip(event);
        setVisible(true);
      }}
      onBlur={() => setVisible(false)}
    >
      <button
        className="dashboard-help-button"
        type="button"
        aria-label={ariaLabel}
        onClick={(event) => event.currentTarget.blur()}
      >
        ?
      </button>
      {floating ? createPortal(tooltip, document.body) : tooltip}
    </span>
  );
}
