import { useEffect, useId, useState } from 'react';

export const CONNECT_WALLET_REASON = 'Please connect your wallet first.';

export default function AvailabilityAction({
  unavailableReason = '',
  warningResetKey,
  className = '',
  children,
  onClick,
  ...buttonProps
}) {
  const warningId = useId();
  const [warning, setWarning] = useState('');

  useEffect(() => {
    setWarning('');
  }, [warningResetKey, unavailableReason]);

  return (
    <span className="action-button-shell">
      <button
        {...buttonProps}
        className={className}
        aria-describedby={warning ? warningId : buttonProps['aria-describedby']}
        onClick={(event) => {
          if (unavailableReason) {
            event.preventDefault();
            event.stopPropagation();
            setWarning(unavailableReason);
            return;
          }
          setWarning('');
          onClick?.(event);
        }}
      >
        {children}
      </button>
      {warning ? <small id={warningId} className="action-validation-warning" role="alert">{warning}</small> : null}
    </span>
  );
}
