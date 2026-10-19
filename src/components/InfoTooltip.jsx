import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const isTouchLike = pointerType => pointerType === 'touch' || pointerType === 'pen';

export default function InfoTooltip({ ariaLabel, children, className = '', floating = true }) {
  const [alignRight, setAlignRight] = useState(false);
  const [floatingStyle, setFloatingStyle] = useState({});
  const [visible, setVisible] = useState(false);
  // Opened by a tap: phones and tablets have no hover, so a tap toggles the
  // tooltip and it stays open until the next tap, a tap elsewhere or a scroll.
  const [pinned, setPinned] = useState(false);
  const tooltipRef = useRef(null);
  const wrapperRef = useRef(null);
  const lastPointerType = useRef('mouse');

  function positionTooltip(trigger) {
    const rect = trigger.getBoundingClientRect();
    const tooltipWidth = Math.max(0, Math.min(340, window.innerWidth - 32));
    const nextAlignRight = rect.left + tooltipWidth > window.innerWidth - 16;
    setAlignRight(nextAlignRight);

    if (floating) {
      const tooltipHeight = tooltipRef.current?.offsetHeight || 140;
      const roomBelow = window.innerHeight - rect.bottom - 16;
      setFloatingStyle({
        left: `${nextAlignRight ? Math.max(16, rect.right - tooltipWidth) : Math.max(16, rect.left)}px`,
        top: `${roomBelow >= tooltipHeight + 10 ? rect.bottom + 10 : Math.max(16, rect.top - tooltipHeight - 10)}px`,
        width: `${tooltipWidth}px`,
      });
    }
  }

  function close() {
    setPinned(false);
    setVisible(false);
  }

  useEffect(() => {
    if (!pinned) return undefined;
    const onOutside = event => {
      if (wrapperRef.current?.contains(event.target) || tooltipRef.current?.contains(event.target)) return;
      close();
    };
    document.addEventListener('pointerdown', onOutside, true);
    window.addEventListener('scroll', close, { passive: true, capture: true });
    return () => {
      document.removeEventListener('pointerdown', onOutside, true);
      window.removeEventListener('scroll', close, { capture: true });
    };
  }, [pinned]);

  const tooltip = (
    <span
      ref={tooltipRef}
      className={`dashboard-help-tooltip${floating ? ' dashboard-help-tooltip--floating' : ''}${(floating || pinned) && visible ? ' dashboard-help-tooltip--visible' : ''}`}
      role="tooltip"
      style={floating ? floatingStyle : undefined}
    >
      {children}
    </span>
  );

  return (
    <span
      ref={wrapperRef}
      className={`dashboard-help${className ? ` ${className}` : ''}${alignRight && !className.includes('dashboard-help--align-right') ? ' dashboard-help--align-right' : ''}`}
      onPointerDown={(event) => { lastPointerType.current = event.pointerType || 'mouse'; }}
      onPointerEnter={(event) => {
        if (isTouchLike(event.pointerType)) return;
        positionTooltip(event.currentTarget);
        setVisible(true);
      }}
      onPointerLeave={(event) => {
        if (isTouchLike(event.pointerType) || pinned) return;
        setVisible(false);
      }}
      onFocus={(event) => {
        positionTooltip(event.currentTarget);
        setVisible(true);
      }}
      onBlur={() => { if (!pinned) setVisible(false); }}
    >
      <button
        className="dashboard-help-button"
        type="button"
        aria-label={ariaLabel}
        aria-expanded={pinned}
        onClick={(event) => {
          if (!isTouchLike(lastPointerType.current)) {
            event.currentTarget.blur();
            return;
          }
          if (pinned) {
            close();
            event.currentTarget.blur();
            return;
          }
          positionTooltip(event.currentTarget);
          setPinned(true);
          setVisible(true);
        }}
      >
        ?
      </button>
      {floating ? createPortal(tooltip, document.body) : tooltip}
    </span>
  );
}
