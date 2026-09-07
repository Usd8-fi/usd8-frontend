import LoadingSpinner from './LoadingSpinner.jsx';
import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const WalletNoticeContext = createContext(null);
export const useWalletNotice = () => useContext(WalletNoticeContext);

function NoticeToast({ entry, onDismiss }) {
  const notice = useRef(null);
  const [portalTarget, setPortalTarget] = useState(document.body);
  useLayoutEffect(() => {
    const sync = () => setPortalTarget([...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].at(-1) || document.body);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  const dismiss = useCallback(() => {
    const returnFocus = notice.current?.contains(document.activeElement);
    onDismiss();
    if (returnFocus && entry.trigger?.isConnected) entry.trigger.focus();
  }, [entry, onDismiss]);
  useEffect(() => {
    const escape = event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      dismiss();
    };
    document.addEventListener('keydown', escape, true);
    return () => document.removeEventListener('keydown', escape, true);
  }, [dismiss]);
  const warning = entry.tone !== 'status';
  // Keep notices inside an open modal's accessible focus scope, outside its layout.
  return createPortal(
    <aside ref={notice} className={`wallet-notice wallet-notice--${warning ? 'warning' : 'status'}`} role={warning ? 'alert' : 'status'} aria-label={entry.label || 'Notification'}>
      <span className="wallet-notice-icon" aria-hidden="true">
        {entry.busy ? <LoadingSpinner /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          {warning ? <path d="M12 7v6m0 3v1" /> : <path d="m7.5 12 3 3 6-6" />}
        </svg>}
      </span>
      <div className="wallet-notice-message">
        <p id={entry.id}>{entry.message}</p>
        {entry.detail ? <small>{entry.detail}</small> : null}
        {entry.href ? <a href={entry.href} target="_blank" rel="noreferrer">View transaction</a> : null}
      </div>
      {entry.actionLabel ? <button className="wallet-notice-connect" type="button" disabled={!entry.onAction}
        onClick={() => { dismiss(); entry.onAction?.(); }}>{entry.actionLabel}</button> : null}
      <button className="wallet-notice-close" type="button" aria-label={entry.wallet ? 'Dismiss wallet notice' : 'Dismiss notification'} onClick={dismiss}>×</button>
    </aside>, portalTarget,
  );
}

function NoticeHost({ wallet, children }) {
  const [entries, setEntries] = useState([]);
  const messageId = useId();
  const publish = useCallback(entry => setEntries(previous => [...previous.filter(item => item.id !== entry.id), entry]), []);
  const remove = useCallback(id => setEntries(previous => previous.some(item => item.id === id) ? previous.filter(item => item.id !== id) : previous), []);
  const show = useCallback(button => publish({
    id: messageId, wallet: true, trigger: button, label: 'Wallet connection required',
    message: 'Connect your wallet to continue.', detail: wallet.connectUnavailableReason,
    actionLabel: 'Connect wallet', onAction: wallet.connectUnavailableReason ? undefined : wallet.onConnect,
  }), [publish, messageId, wallet.connectUnavailableReason, wallet.onConnect]);
  useEffect(() => { if (wallet.connected || wallet.connecting) remove(messageId); }, [wallet.connected, wallet.connecting, remove, messageId]);
  const current = entries.at(-1);
  const value = useMemo(() => ({ show, visible: current?.id === messageId, messageId, publish, remove }), [show, current?.id, messageId, publish, remove]);
  return <WalletNoticeContext.Provider value={value}>
    {children}
    {current ? <NoticeToast entry={current} onDismiss={() => remove(current.id)} /> : null}
  </WalletNoticeContext.Provider>;
}

export default function WalletNoticeProvider({ wallet = {}, children }) {
  const parent = useWalletNotice();
  return parent ? children : <NoticeHost wallet={wallet}>{children}</NoticeHost>;
}

// Declarative notices disappear when their error/status resolves or the source unmounts.
// Dismissal lasts until the message changes; callback identity never reopens a toast.
export function NoticeMessage({ message, id: providedId, tone = 'error', label, actionLabel, onAction, href, trigger, onDismiss, busy = false }) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const context = useWalletNotice();
  const callbacks = useRef({ onAction, onDismiss });
  callbacks.current = { onAction, onDismiss };
  const [dismissed, setDismissed] = useState(false);
  const publish = context?.publish;
  const remove = context?.remove;
  useEffect(() => {
    setDismissed(false);
    if (!message || !publish) return;
    publish({ id, message, tone, label, actionLabel, href, trigger, busy, onAction: actionLabel ? () => callbacks.current.onAction?.() : undefined });
    return () => remove(id);
  }, [id, message, tone, label, actionLabel, href, trigger, busy, publish, remove]);
  if (context || !message || dismissed) return null;
  return <NoticeToast entry={{ id, message, tone, label, actionLabel, onAction, href, trigger, busy }} onDismiss={() => { setDismissed(true); callbacks.current.onDismiss?.(); }} />;
}
