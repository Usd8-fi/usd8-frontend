import { NoticeMessage } from './WalletNotice.jsx';
import { useDialogFocus } from './useDialogFocus.js';
import { useEffect, useState } from 'react';
import { useTranslation } from '../lib/i18n.js';
import { claimLifecycle } from '../lib/claimLifecycle.js';
import { docsUrl } from '../lib/docsLinks.js';
import { decimalInputValue, displayAvailableBalance } from '../lib/displayAvailableBalance.js';
import { tokenAmountExceedsBalance } from '../lib/tokenAmount.js';
import AvailabilityAction from './AvailabilityAction.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import LoadingSpinner, { MetricValue } from './LoadingSpinner.jsx';
import SettlementFinalityNote from './SettlementFinalityNote.jsx';
import { boostedScore, wadUnits, formatWad } from '../lib/units.js';

function normalizedDecimal(value) {
  return String(value || '0').replace(/,/g, '').trim();
}

function insuranceScoreInputValue(value) {
  const normalized = String(value ?? '').trim();
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return normalized;
  const decimalIndex = normalized.indexOf('.');
  if (decimalIndex < 0) return normalized;
  return `${normalized.slice(0, decimalIndex)}.${normalized.slice(decimalIndex + 1, decimalIndex + 3)}`;
}

function isPositiveDecimal(value) {
  const normalized = normalizedDecimal(value);
  return /^(?:\d+\.?\d*|\.\d+)$/.test(normalized) && /[1-9]/.test(normalized);
}

function defaultTokenAmount(available) {
  const normalized = normalizedDecimal(available);
  return isPositiveDecimal(normalized) ? normalized : '';
}

function defaultBoosterAmount(available) {
  const normalized = normalizedDecimal(available);
  return /^\d+$/.test(normalized) ? normalized : '0';
}

function sharePercentage(mine, existingTotal) {
  const combined = mine + existingTotal;
  if (combined === 0n) return '0%';
  return `${(mine * 100n + combined / 2n) / combined}%`;
}

function wholePercentage(value) {
  const normalized = String(value ?? '').trim();
  if (!/^\d+(?:\.\d+)?%$/.test(normalized)) return normalized;
  return `${Math.round(Number.parseFloat(normalized))}%`;
}

function countPhrase(t, unit, count) {
  return t(`fileClaim.time.${unit}_${count === 1 ? 'one' : 'other'}`, { count: String(count) });
}

function timeLeftLabel(t, daysLeft, hoursLeft, minutesLeft) {
  if (daysLeft === 0 && minutesLeft !== undefined) {
    const minutes = countPhrase(t, 'minutes', minutesLeft);
    return hoursLeft
      ? t('fileClaim.time.hoursMinutesLeft', { hours: countPhrase(t, 'hours', hoursLeft), minutes })
      : t('fileClaim.time.minutesLeft', { minutes });
  }
  return t('fileClaim.time.daysHoursLeft', {
    days: countPhrase(t, 'days', daysLeft),
    hours: countPhrase(t, 'hours', hoursLeft),
  });
}

// Stage labels per lifecycle state (translation keys under fileClaim.stage).
const TIMELINE_STAGES = {
  'claim-open': ['claimOpen', 'settle', 'payout'],
  'settlement-open': ['claimClosed', 'settleOpen', 'payout'],
  'settlement-expired': ['claimClosed', 'notSettled', 'payout'],
  'settlement-pending': ['claimClosed', 'settled', 'payout'],
  'payout-open': ['claimClosed', 'settled', 'payoutOpen'],
  'payout-expired': ['claimClosed', 'settled', 'payoutClosed'],
};

function ClaimDialogCloseButton({ activeClaim, onClose }) {
  const { t } = useTranslation();
  return (
    <button
      className="app-dialog-close file-claim-dialog-close"
      type="button"
      aria-label={activeClaim ? t('fileClaim.close.claimStatus') : t('fileClaim.close.fileClaim')}
      onClick={onClose}
    >
      ×
    </button>
  );
}

export default function FileClaimDialog({
  token,
  insuredTokens = [],
  availableScore,
  availableBoosters = '0',
  claimBond = '10 USD8',
  claimBondAvailable = '0',
  claimTotals = { scoreCommitted: '0' },
  boosterBoostBps = 0,
  minHoldingRequiredBlocks = null,
  claimStatus = null,
  incident = null,
  payoutLoading = false,
  submitUnavailableReason = '',
  statusMessage = '',
  statusTone = 'neutral',
  onClearStatus,
  onClose,
  onCancel,
  onSettle,
  onReturnTokens,
  onAcceptPayout,
  onCancelPayout,
  onSubmit,
}) {
  const { t, tRich } = useTranslation();
  const tokenOptions = insuredTokens.length > 0
    ? insuredTokens
    : [{ id: token, symbol: token, balance: '0' }];
  const selectedToken = tokenOptions.find((option) => option.id === token || option.symbol === token) || tokenOptions[0];
  const [amount, setAmount] = useState(() => defaultTokenAmount(selectedToken.balance));
  const [scoreToSpend, setScoreToSpend] = useState(() => insuranceScoreInputValue(availableScore));
  const [boosterAmount, setBoosterAmount] = useState(() => defaultBoosterAmount(availableBoosters));
  const availableScoreValue = normalizedDecimal(availableScore);
  const hasAvailableScore = isPositiveDecimal(availableScoreValue);
  const claimUnavailableReason = submitUnavailableReason
    || (!hasAvailableScore ? t('fileClaim.validation.noAvailableScore') : '')
    || (tokenAmountExceedsBalance(amount, selectedToken.balance)
      ? t('fileClaim.validation.amountExceedsBalance', { symbol: selectedToken.symbol })
      : '')
    || (!isPositiveDecimal(amount) ? t('fileClaim.validation.enterAmount', { symbol: selectedToken.symbol }) : '')
    || (!isPositiveDecimal(scoreToSpend) ? t('fileClaim.validation.enterScore') : '');
  const activeClaim = Boolean(claimStatus?.id);
  const boosterCount = normalizedDecimal(boosterAmount);
  const effectiveScoreUnits = boostedScore(
    wadUnits(scoreToSpend),
    /^\d+$/.test(boosterCount) ? BigInt(boosterCount) : 0n,
    boosterBoostBps,
  );
  const effectiveScoreShare = sharePercentage(effectiveScoreUnits, wadUnits(claimTotals.scoreCommitted));
  const claimIncident = claimStatus?.incident || incident;
  const [statusNowMilliseconds, setStatusNowMilliseconds] = useState(Date.now());
  const lifecycle = claimIncident ? claimLifecycle(claimIncident, statusNowMilliseconds) : null;
  const liveClaimStatus = lifecycle ? { ...claimStatus, ...lifecycle } : claimStatus;
  const activeBoosterCount = normalizedDecimal(liveClaimStatus?.boosterAmount);
  const showEffectiveClaimScore = /^\d+$/.test(activeBoosterCount)
    && BigInt(activeBoosterCount) > 0n
    && isPositiveDecimal(liveClaimStatus?.scoreToSpend);
  // Once settled, the enclave's boosted score is authoritative: it boosts only the
  // eligible Boosters, which can be fewer than the escrowed ones.
  const activeEffectiveScoreUnits = !showEffectiveClaimScore
    ? 0n
    : liveClaimStatus.settledBoostedScore
      ? wadUnits(liveClaimStatus.settledBoostedScore)
      : boostedScore(wadUnits(liveClaimStatus.scoreToSpend), BigInt(activeBoosterCount), boosterBoostBps);
  // Settlement is permissionless, so once filing closes the incident replaces the
  // claim form for everyone, including accounts that never filed.
  const showStatus = activeClaim
    || Boolean(lifecycle && lifecycle.state !== 'claim-open' && lifecycle.state !== 'unavailable');
  const statusTitle = activeClaim
    ? t('fileClaim.title.yourClaimStatus')
    : showStatus ? t('fileClaim.title.incidentStatus') : t('fileClaim.title.fileClaim');
  const holdingRequirement = minHoldingRequiredBlocks
    ? t('fileClaim.holdingRequirement.blocks', { blocks: BigInt(minHoldingRequiredBlocks).toLocaleString('en-US') })
    : t('fileClaim.holdingRequirement.unavailable');
  const phaseMilliseconds = Number(claimIncident?.phaseWindowMilliseconds ?? 3 * 86_400_000);
  const phaseUnit = phaseMilliseconds >= 86_400_000 ? 'day' : phaseMilliseconds >= 3_600_000 ? 'hour' : 'minute';
  const phaseLength = phaseMilliseconds / ({ day: 86_400_000, hour: 3_600_000, minute: 60_000 }[phaseUnit]);
  const timelineLabels = (TIMELINE_STAGES[liveClaimStatus?.state] || TIMELINE_STAGES['claim-open'])
    .map((stage) => t(`fileClaim.stage.${stage}`));
  const statusDescriptionKey = {
    'claim-open': 'claimOpen',
    'settlement-open': activeClaim ? 'settlementOpenClaimant' : 'settlementOpenAnyone',
    'settlement-expired': 'settlementExpired',
    'settlement-pending': 'settlementPending',
    'payout-open': 'payoutOpen',
    'payout-expired': 'payoutExpired',
  }[liveClaimStatus?.state];
  const statusDescription = statusDescriptionKey ? t(`fileClaim.statusDescription.${statusDescriptionKey}`) : '';
  const showPayout = activeClaim
    && (liveClaimStatus?.state === 'payout-open' || liveClaimStatus?.state === 'payout-expired');
  const payoutIneligible = liveClaimStatus?.payoutEligible === false;
  // Each action is [id, handler]; the id is the fileClaim.action translation key.
  const returnTokens = ['cancelPayoutReturnTokens', onCancelPayout];
  const actionButtons = activeClaim ? {
    'claim-open': [['cancelClaim', onCancel]],
    'settlement-open': [['settleAllClaims', onSettle]],
    'settlement-expired': [['returnTokens', onReturnTokens]],
    // Accepting an ineligible payout resolves exactly as a decline, so only offer the decline.
    'payout-open': payoutIneligible ? [returnTokens] : [['acceptPayout', onAcceptPayout], returnTokens],
    'payout-expired': [returnTokens],
  }[liveClaimStatus?.state] || []
    : liveClaimStatus?.state === 'settlement-open' ? [['settleAllClaims', onSettle]] : [];

  useEffect(() => {
    setScoreToSpend(insuranceScoreInputValue(availableScoreValue));
  }, [availableScoreValue]);

  useEffect(() => {
    if (!claimIncident) return undefined;
    const update = () => setStatusNowMilliseconds(Date.now());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [claimIncident]);

  const dialogRef = useDialogFocus(onClose);

  return (
    <div className="usd8-dialog-backdrop file-claim-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className={`usd8-dialog file-claim-dialog${showStatus ? ' file-claim-dialog--status' : ''}`}
        ref={dialogRef} tabIndex={-1} role="dialog"
        aria-modal="true"
        aria-label={t(showStatus ? 'fileClaim.dialogLabel.status' : 'fileClaim.dialogLabel.file', { symbol: selectedToken.symbol })}
      >
        <ClaimDialogCloseButton activeClaim={showStatus} onClose={onClose} />
        <h2
          className="file-claim-title"
          aria-label={statusTitle}
        >
          {!showStatus && selectedToken.iconSrc ? <img src={selectedToken.iconSrc} alt={selectedToken.symbol} /> : null}
          <span>{statusTitle}</span>
        </h2>
        {!showStatus ? (
          <p className="file-claim-requirement">
            {tRich('fileClaim.requirement', {
              link: (text) => <a href={docsUrl('defi-insurance.html')} target="_blank" rel="noreferrer">{text}</a>,
            }, { symbol: selectedToken.symbol })}
          </p>
        ) : null}

        {showStatus ? (
          <section className="file-claim-status" aria-live="polite">
            {!activeClaim ? (
              <p className="file-claim-requirement">
                {t('fileClaim.noClaimInIncident')}
              </p>
            ) : (
            <div className="claim-status-metrics">
              <div>
                <span>{t('fileClaim.metric.insuredTokenEscrowed')}</span>
                <strong>{liveClaimStatus.insuredTokenAmount} {selectedToken.symbol}</strong>
              </div>
              <div>
                <span>{t('fileClaim.metric.claimBondEscrowed')}</span>
                <strong>{liveClaimStatus.bondAmount} USD8</strong>
                {showPayout && typeof liveClaimStatus.payoutEligible === 'boolean' ? (
                  <small>{liveClaimStatus.payoutEligible
                    ? t('fileClaim.metric.bondFullyRefunded')
                    : t('fileClaim.metric.bondNotRefunded')}</small>
                ) : null}
              </div>
              <div>
                <span>{t('fileClaim.metric.insuranceScoreToSpend')}</span>
                <strong>{liveClaimStatus.scoreToSpend}</strong>
                <small className={showEffectiveClaimScore ? 'claim-status-score-summary' : undefined}>
                  {showEffectiveClaimScore
                    ? t('fileClaim.metric.effectiveScoreAfterBoosters', { score: formatWad(activeEffectiveScoreUnits, 2, { trim: true }) })
                    : ''}
                  {t('fileClaim.metric.scoreCommitted', { percent: wholePercentage(liveClaimStatus.scoreCommitmentPercentage) })}
                </small>
              </div>
              <div>
                <span>{t('fileClaim.metric.boostersEscrowed')}</span>
                <strong>{liveClaimStatus.boosterAmount}</strong>
                {showPayout && (payoutLoading || liveClaimStatus.boostersToBurn !== null) ? (
                  <small>
                    {payoutLoading
                      ? <LoadingSpinner label={t('fileClaim.metric.loadingBoostersTaken')} />
                      : <span>{t('fileClaim.metric.boostersTaken', { count: String(liveClaimStatus.boostersToBurn) })}</span>}
                  </small>
                ) : null}
              </div>
            </div>
            )}
            {showPayout && payoutIneligible ? (
              <p className="file-claim-requirement">
                {t('fileClaim.payout.ineligible', { bond: liveClaimStatus.bondAmount ?? '' })}
              </p>
            ) : null}
            {showPayout && !payoutIneligible ? (
              <>
                <div className="claim-status-payout-summary">
                  <div>
                    <span>{t('fileClaim.payout.totalUsdValue')}</span>
                    <strong>
                      <MetricValue
                        loading={payoutLoading}
                        value={liveClaimStatus.payoutUsd}
                        label={t('fileClaim.payout.loadingValue')}
                      />
                    </strong>
                  </div>
                  <div>
                    <span>{t('fileClaim.payout.vsLossValue')}</span>
                    <strong>
                      <MetricValue
                        loading={payoutLoading}
                        value={liveClaimStatus.payoutVsLoss}
                        label={t('fileClaim.payout.loadingComparison')}
                      />
                    </strong>
                  </div>
                </div>
                <div className="claim-status-payout-details">
                  <span>{t('fileClaim.payout.details')}</span>
                  {payoutLoading && (liveClaimStatus.payoutDetails || []).length === 0
                    ? <LoadingSpinner label={t('fileClaim.payout.loadingDetails')} />
                    : null}
                  {(liveClaimStatus.payoutDetails || []).map((detail) => (
                    <strong key={`${detail.symbol}:${detail.amount}`}>{detail.amount} {detail.symbol}{detail.usd ? ` (${detail.usd})` : ''}</strong>
                  ))}
                </div>
              </>
            ) : null}
            <span className="claim-status-timeline-label">
              {statusDescription
                ? t('fileClaim.statusLabel.withDescription', { description: statusDescription })
                : t('fileClaim.statusLabel.plain')}
            </span>
            <div className="claim-status-timeline" aria-label={t('fileClaim.currentStage', { stage: String(liveClaimStatus.stage) })}>
              {timelineLabels.map((label, index) => {
                const active = index === liveClaimStatus.stageIndex;
                // Stages behind the current one have run to completion: fill the
                // bar and show no time remaining instead of their nominal length.
                const complete = index < liveClaimStatus.stageIndex;
                const duration = index === 1
                  ? t(`fileClaim.time.range${{ day: 'Days', hour: 'Hours', minute: 'Minutes' }[phaseUnit]}`, { from: phaseLength, to: phaseLength * 2 })
                  : countPhrase(t, `${phaseUnit}s`, phaseLength);
                const progressPercent = active ? liveClaimStatus.progressPercent : 100;
                return (
                <div className={`claim-status-step${active ? ' claim-status-step--active' : ''}${complete ? ' claim-status-step--complete' : ''}`} key={label}>
                  <span
                    className="claim-status-step-bar"
                    role={active || complete ? 'progressbar' : undefined}
                    aria-label={active || complete ? t('fileClaim.stage.progress', { stage: label }) : undefined}
                    aria-valuemin={active || complete ? 0 : undefined}
                    aria-valuemax={active || complete ? 100 : undefined}
                    aria-valuenow={active || complete ? progressPercent : undefined}
                    aria-valuetext={active
                      ? timeLeftLabel(t, liveClaimStatus.daysLeft, liveClaimStatus.hoursLeft, liveClaimStatus.minutesLeft)
                      : complete ? timeLeftLabel(t, 0, 0) : undefined}
                    style={active || complete
                      ? { '--claim-progress': `${progressPercent}%` }
                      : undefined}
                  />
                  <strong>{label}</strong>
                  <small>{active
                    ? timeLeftLabel(t, liveClaimStatus.daysLeft, liveClaimStatus.hoursLeft, liveClaimStatus.minutesLeft)
                    : complete ? timeLeftLabel(t, 0, 0) : duration}</small>
                </div>
                );
              })}
            </div>
            {actionButtons.length > 0 || statusMessage ? (
              <div className="claim-status-actions">
                {actionButtons.map(([id, action]) => (
                  <button className="usd8-dialog-submit" type="button" onClick={action} key={id}>{t(`fileClaim.action.${id}`)}</button>
                ))}
                {actionButtons.some(([id]) => id === 'settleAllClaims') ? (
                  <SettlementFinalityNote claimDeadlineMilliseconds={claimIncident?.phaseDeadlineMilliseconds} />
                ) : null}
                {statusMessage ? (
                  <NoticeMessage message={statusMessage} busy={statusTone === 'loading'} tone={statusTone === 'warning' ? 'error' : 'status'} label={t('fileClaim.submissionStatus')} />
                ) : null}
              </div>
            ) : null}
          </section>
        ) : (
          <form className="file-claim-dialog-form" onSubmit={(event) => {
            event.preventDefault();
            if (!claimUnavailableReason) {
              onSubmit?.({
                token: selectedToken.id,
                amount,
                scoreToSpend,
                boosterAmount,
              });
            }
          }}>
            <div className="file-claim-form-grid">
              <div className="file-claim-field file-claim-field--token file-claim-field--primary">
                <span className="metric-label-with-help">
                  <label htmlFor="file-claim-token-amount">{t('fileClaim.form.tokenAmountLabel', { symbol: selectedToken.symbol })}</label>
                  <InfoTooltip ariaLabel={t('fileClaim.form.tokenAmountHelpLabel')} floating>
                    {t('fileClaim.form.tokenAmountHelp', { symbol: selectedToken.symbol, holding: holdingRequirement })}
                  </InfoTooltip>
                </span>
                <input
                  id="file-claim-token-amount"
                  aria-label={t('fileClaim.form.tokenAmountInput', { symbol: selectedToken.symbol })}
                  inputMode="decimal"
                  min="0"
                  step="any"
                  type="text"
                  value={amount}
                  onChange={(event) => {
                    onClearStatus?.();
                    setAmount(decimalInputValue(event.target.value));
                  }}
                />
                <small>
                  {t('fileClaim.form.availableWithPeriod', { amount: displayAvailableBalance(selectedToken.balance) })}
                </small>
              </div>

              <div className="file-claim-field file-claim-field--bond file-claim-field--compact">
                <span className="metric-label-with-help">
                  {t('fileClaim.form.claimBond')}
                  <InfoTooltip ariaLabel={t('fileClaim.form.claimBondHelpLabel')} className="dashboard-help--align-right" floating>
                    {t('fileClaim.form.claimBondHelp')}
                  </InfoTooltip>
                </span>
                <output>{claimBond}</output>
                <small><span>{t('fileClaim.form.available', { amount: displayAvailableBalance(claimBondAvailable) })}</span></small>
              </div>

              <div className="file-claim-field file-claim-field--score file-claim-field--primary">
                <span className="metric-label-with-help">
                  <label htmlFor="file-claim-score">{t('fileClaim.form.scoreLabel')}</label>
                  <InfoTooltip ariaLabel={t('fileClaim.form.scoreHelpLabel')} floating>
                    {t('fileClaim.form.scoreHelp')}
                  </InfoTooltip>
                </span>
                <input
                  id="file-claim-score"
                  aria-label={t('fileClaim.form.scoreLabel')}
                  inputMode="decimal"
                  pattern="[0-9,]*[.]?[0-9]*"
                  type="text"
                  value={scoreToSpend}
                  onChange={(event) => {
                    onClearStatus?.();
                    setScoreToSpend(insuranceScoreInputValue(decimalInputValue(event.target.value)));
                  }}
                />
                <small>{t('fileClaim.form.available', { amount: displayAvailableBalance(availableScore) })}</small>
              </div>

              <div className="file-claim-field file-claim-field--compact">
                <span className="metric-label-with-help">
                  <label htmlFor="file-claim-boosters">{t('fileClaim.form.boostersLabel')}</label>
                  <InfoTooltip ariaLabel={t('fileClaim.form.boostersHelpLabel')} className="dashboard-help--align-right" floating>
                    {t('fileClaim.form.boostersHelp', { holding: holdingRequirement })}
                  </InfoTooltip>
                </span>
                <input
                  id="file-claim-boosters"
                  aria-label={t('fileClaim.form.boostersLabel')}
                  inputMode="numeric"
                  min="0"
                  step="1"
                  type="number"
                  value={boosterAmount}
                  onChange={(event) => {
                    onClearStatus?.();
                    setBoosterAmount(event.target.value);
                  }}
                />
                <small>{t('fileClaim.form.available', { amount: displayAvailableBalance(availableBoosters) })}</small>
              </div>

            </div>

            <div className="usd8-dialog-submit-row file-claim-submit-row">
              <AvailabilityAction
                className="usd8-dialog-submit"
                type="submit"
                unavailableReason={claimUnavailableReason}
                warningResetKey={`${selectedToken.id}:${amount}:${scoreToSpend}:${boosterAmount}`}
              >
                {t('fileClaim.action.fileClaim')}
              </AvailabilityAction>
              <small className="file-claim-weight">
                {t('fileClaim.weight.summary', {
                  weight: formatWad(effectiveScoreUnits, 2, { trim: true }),
                  boosters: boosterCount !== '0'
                    ? t(`fileClaim.weight.boosters_${boosterCount === '1' ? 'one' : 'other'}`, { count: boosterCount })
                    : '',
                  share: effectiveScoreShare,
                })}
              </small>
              {statusMessage ? (
                <NoticeMessage message={statusMessage} busy={statusTone === 'loading'} tone={statusTone === 'warning' ? 'error' : 'status'} label={t('fileClaim.submissionStatus')} />
              ) : null}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
