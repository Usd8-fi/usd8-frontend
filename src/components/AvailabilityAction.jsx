import { NoticeMessage, useWalletNotice } from './WalletNotice.jsx';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from '../lib/i18n.js';

// Identifier compared by callers; the shown text is translated at render.
export const CONNECT_WALLET_REASON = 'Please connect your wallet first.';

export default function AvailabilityAction({
  unavailableReason = '',
  warningResetKey,
  className = '',
  children,
  onClick,
  ...buttonProps
}) {
  const { t } = useTranslation();
  const walletNotice = useWalletNotice();
  const walletRequired = unavailableReason === CONNECT_WALLET_REASON && Boolean(walletNotice);
  const warningId = useId();
  const [warning, setWarning] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [trigger, setTrigger] = useState(null);

  useEffect(() => {
    setWarning('');
  }, [warningResetKey, unavailableReason]);

  return (
    <span className="action-button-shell">
      <button
        {...buttonProps}
        className={className}
        aria-describedby={walletRequired && walletNotice.visible ? walletNotice.messageId : warning ? warningId : buttonProps['aria-describedby']}
        onClick={(event) => {
          if (unavailableReason) {
            event.preventDefault();
            event.stopPropagation();
            if (walletRequired) {
              setWarning('');
              walletNotice.show(event.currentTarget);
            } else { setTrigger(event.currentTarget); setWarning(unavailableReason); setAttempt(value => value + 1); }
            return;
          }
          setWarning('');
          onClick?.(event);
        }}
      >
        {children}
      </button>
      {warning ? <NoticeMessage key={attempt} id={warningId} message={warning === CONNECT_WALLET_REASON ? t('availability.connectWallet') : warning} trigger={trigger} onDismiss={() => setWarning('')} /> : null}
    </span>
  );
}
