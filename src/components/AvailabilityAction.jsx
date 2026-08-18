import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const CONNECT_WALLET_REASON = 'Please connect your wallet first.';

const TOOLTIP_WIDTH = 340;
const TOOLTIP_GAP = 10;
const VIEWPORT_PADDING = 16;

export default function AvailabilityAction({
  unavailableReason = '',
  tooltipAlign = 'left',
  tooltipPosition = 'above',
  className = '',
  children,
  ...buttonProps
}) {
  const tooltipId = useId();
  const shellRef = useRef(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipCoordinates, setTooltipCoordinates] = useState({ left: VIEWPORT_PADDING, top: VIEWPORT_PADDING });
  const unavailable = Boolean(unavailableReason);
  const shellClasses = [
    'action-button-shell',
    `action-button-shell--${tooltipAlign}`,
    `action-button-shell--${tooltipPosition}`,
  ].join(' ');

  function positionTooltip() {
    if (!shellRef.current) return;
    const trigger = shellRef.current.getBoundingClientRect();
    const availableWidth = Math.max(0, window.innerWidth - (VIEWPORT_PADDING * 2));
    const tooltipWidth = Math.min(TOOLTIP_WIDTH, availableWidth);
    const preferredLeft = tooltipAlign === 'right' ? trigger.right - tooltipWidth : trigger.left;
    const left = Math.min(
      Math.max(VIEWPORT_PADDING, preferredLeft),
      Math.max(VIEWPORT_PADDING, window.innerWidth - tooltipWidth - VIEWPORT_PADDING),
    );
    const top = tooltipPosition === 'below'
      ? trigger.bottom + TOOLTIP_GAP
      : trigger.top - TOOLTIP_GAP;
    setTooltipCoordinates({ left, top });
  }

  function showTooltip() {
    if (!unavailable) return;
    positionTooltip();
    setTooltipOpen(true);
  }

  useEffect(() => {
    if (!tooltipOpen) return undefined;
    const reposition = () => positionTooltip();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [tooltipOpen, tooltipAlign, tooltipPosition]);

  const tooltip = unavailable && typeof document !== 'undefined' ? createPortal(
    <span
      id={tooltipId}
      className={`dashboard-help-tooltip action-availability-tooltip${tooltipOpen ? ' action-availability-tooltip--visible' : ''}`}
      role="tooltip"
      style={{
        left: `${tooltipCoordinates.left}px`,
        top: `${tooltipCoordinates.top}px`,
        transform: tooltipPosition === 'above' ? 'translateY(-100%)' : 'none',
      }}
    >
      {unavailableReason}
    </span>,
    document.body,
  ) : null;

  return (
    <>
      <span
        ref={shellRef}
        className={shellClasses}
        tabIndex={unavailable ? 0 : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltipOpen(false)}
        onFocus={showTooltip}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setTooltipOpen(false);
        }}
      >
        <button
          {...buttonProps}
          className={className}
          disabled={unavailable || buttonProps.disabled}
          aria-describedby={unavailable ? tooltipId : buttonProps['aria-describedby']}
        >
          {children}
        </button>
      </span>
      {tooltip}
    </>
  );
}
