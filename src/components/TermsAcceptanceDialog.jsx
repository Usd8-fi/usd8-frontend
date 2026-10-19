import { RISK_URL, TERMS_URL } from '../lib/termsAcceptance.js';
import { useDialogFocus } from './useDialogFocus.js';

/// Shown once per wallet address and terms version, right after connecting.
/// Agree records acceptance; Disagree (or closing) disconnects the wallet.
export default function TermsAcceptanceDialog({ onAgree, onDisagree }) {
  const dialogRef = useDialogFocus(onDisagree);
  return (
    <div className="usd8-dialog-backdrop">
      <section
        className="usd8-dialog terms-dialog"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-dialog-title"
      >
        <h2 className="file-claim-title" id="terms-dialog-title"><span>Terms of Use</span></h2>
        <p className="file-claim-requirement">
          To use USD8 with this wallet, please agree to the{' '}
          <a href={TERMS_URL} target="_blank" rel="noreferrer">Terms</a> and{' '}
          <a href={RISK_URL} target="_blank" rel="noreferrer">Risk Disclaimer</a>.
        </p>
        <p className="terms-dialog-note">
          If you disagree, your wallet will be disconnected. No signature or transaction is needed.
        </p>
        <div className="terms-dialog-actions">
          <button className="usd8-dialog-submit" type="button" onClick={onAgree}>Agree</button>
          <button className="usd8-dialog-submit terms-dialog-secondary" type="button" onClick={onDisagree}>Disagree</button>
        </div>
      </section>
    </div>
  );
}
