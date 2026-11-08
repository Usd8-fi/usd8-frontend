import { RISK_URL, TERMS_URL } from '../lib/termsAcceptance.js';
import { useDialogFocus } from './useDialogFocus.js';
import { useTranslation } from '../lib/i18n.js';

/// Shown once per wallet address and terms version, right after connecting.
/// Agree records acceptance; Disagree (or closing) disconnects the wallet.
export default function TermsAcceptanceDialog({ onAgree, onDisagree }) {
  const dialogRef = useDialogFocus(onDisagree);
  const { t, tRich } = useTranslation();
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
        <h2 className="file-claim-title" id="terms-dialog-title"><span>{t('terms.title')}</span></h2>
        <p className="file-claim-requirement">
          {tRich('terms.requirement', {
            terms: (text) => <a href={TERMS_URL} target="_blank" rel="noreferrer">{text}</a>,
            risk: (text) => <a href={RISK_URL} target="_blank" rel="noreferrer">{text}</a>,
          })}
        </p>
        <p className="terms-dialog-note">
          {t('terms.disagreeNote')}
        </p>
        <div className="terms-dialog-actions">
          <button className="usd8-dialog-submit" type="button" onClick={onAgree}>{t('terms.agree')}</button>
          <button className="usd8-dialog-submit terms-dialog-secondary" type="button" onClick={onDisagree}>{t('terms.disagree')}</button>
        </div>
      </section>
    </div>
  );
}
