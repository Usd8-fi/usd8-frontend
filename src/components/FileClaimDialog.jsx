import { useEffect, useState } from 'react';
import { claimLifecycle } from '../lib/claimLifecycle.js';
import { displayAvailableBalance } from '../lib/displayAvailableBalance.js';
import { tokenAmountExceedsBalance } from '../lib/tokenAmount.js';
import AvailabilityAction from './AvailabilityAction.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import LoadingSpinner, { MetricValue } from './LoadingSpinner.jsx';
import { boostedScore, wadUnits, formatWad } from '../lib/units.js';

function normalizedDecimal(value) {
  return String(value || '0').replace(/,/g, '').trim();
}

function insuranceScoreInputValue(value) {
  const normalized = String(value ?? '').replace(/,/g, '').trim();
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

function timeLeftLabel(daysLeft, hoursLeft) {
  const days = `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;
  const hours = `${hoursLeft} ${hoursLeft === 1 ? 'hour' : 'hours'}`;
  return `${days} ${hours} left`;
}

function ClaimDialogCloseButton({ activeClaim, onClose }) {
  return (
    <button
      className="app-dialog-close file-claim-dialog-close"
      type="button"
      aria-label={activeClaim ? 'Close claim status' : 'Close file claim'}
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
  claimStatus = null,
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
    || (!hasAvailableScore ? 'You do not have any available insurance score to spend.' : '')
    || (tokenAmountExceedsBalance(amount, selectedToken.balance)
      ? `The ${selectedToken.symbol} amount exceeds your available balance.`
      : '')
    || (!isPositiveDecimal(amount) ? `Enter the ${selectedToken.symbol} amount you want to claim for.` : '')
    || (!isPositiveDecimal(scoreToSpend) ? 'Enter the insurance score you want to spend.' : '');
  const activeClaim = Boolean(claimStatus?.id);
  const boosterCount = normalizedDecimal(boosterAmount);
  const effectiveScoreUnits = boostedScore(
    wadUnits(scoreToSpend),
    /^\d+$/.test(boosterCount) ? BigInt(boosterCount) : 0n,
    boosterBoostBps,
  );
  const effectiveScoreShare = sharePercentage(effectiveScoreUnits, wadUnits(claimTotals.scoreCommitted));
  const claimIncident = claimStatus?.incident;
  const [statusNowMilliseconds, setStatusNowMilliseconds] = useState(Date.now());
  const liveClaimStatus = activeClaim && claimIncident
    ? { ...claimStatus, ...claimLifecycle(claimIncident, statusNowMilliseconds) }
    : claimStatus;
  const timelineLabels = {
    'claim-open': ['Claim Open', 'Settle', 'Payout'],
    'settlement-open': ['Claim Closed', 'Settle Open', 'Payout'],
    'settlement-expired': ['Claim Closed', 'Not Settled', 'Payout'],
    'settlement-pending': ['Claim Closed', 'Settled', 'Payout'],
    'payout-open': ['Claim Closed', 'Settled', 'Payout Open'],
    'payout-expired': ['Claim Closed', 'Settled', 'Payout Closed'],
  }[liveClaimStatus?.state] || ['Claim Open', 'Settle', 'Payout'];
  const showPayout = liveClaimStatus?.state === 'payout-open' || liveClaimStatus?.state === 'payout-expired';
  const actionButtons = activeClaim ? {
    'claim-open': [['Cancel Claim', onCancel]],
    'settlement-open': [['Settle Claim', onSettle]],
    'settlement-expired': [['Return Tokens', onReturnTokens]],
    'payout-open': [['Accept Payout', onAcceptPayout], ['Cancel Payout and Return Tokens', onCancelPayout]],
    'payout-expired': [['Cancel Payout and Return Tokens', onCancelPayout]],
  }[liveClaimStatus?.state] || [] : [];

  useEffect(() => {
    setScoreToSpend(insuranceScoreInputValue(availableScoreValue));
  }, [availableScoreValue]);

  useEffect(() => {
    if (!activeClaim || !claimIncident) return undefined;
    const update = () => setStatusNowMilliseconds(Date.now());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [activeClaim, claimIncident]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="usd8-dialog-backdrop file-claim-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className={`usd8-dialog file-claim-dialog${activeClaim ? ' file-claim-dialog--status' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${activeClaim ? 'Claim Status' : 'File claim'} for ${selectedToken.symbol}`}
      >
        <ClaimDialogCloseButton activeClaim={activeClaim} onClose={onClose} />
        <h2
          className="file-claim-title"
          aria-label={activeClaim ? 'Your Claim Status' : `File a Claim for ${selectedToken.symbol}`}
        >
          {!activeClaim && selectedToken.iconSrc ? <img src={selectedToken.iconSrc} alt={selectedToken.symbol} /> : null}
          <span>{activeClaim ? 'Your Claim Status' : `File a Claim for ${selectedToken.symbol}`}</span>
        </h2>
        {!activeClaim ? (
          <p className="file-claim-requirement">
            {selectedToken.symbol} must lose more than 20% of its value against its underlying,
            measured between its TWAP price immediately before and after the drop.{' '}
            <a href="./docs/defi-insurance.html">learn more</a>.
          </p>
        ) : null}

        {activeClaim ? (
          <section className="file-claim-status" aria-live="polite">
            <div className="claim-status-metrics">
              <div>
                <span>Insured Token</span>
                <strong>{liveClaimStatus.insuredTokenAmount} {selectedToken.symbol}</strong>
              </div>
              <div><span>Claim Bond</span><strong>{liveClaimStatus.bondAmount} USD8</strong></div>
              <div>
                <span>Insurance score to spend</span>
                <strong>{liveClaimStatus.scoreToSpend}</strong>
                <small>{liveClaimStatus.scoreCommitmentPercentage} of all score committed</small>
              </div>
              <div><span>Booster to spend</span><strong>{liveClaimStatus.boosterAmount}</strong></div>
            </div>
            {showPayout ? (
              <>
                <div className="claim-status-payout-summary">
                  <div>
                    <span>Total Payout USD value</span>
                    <strong>
                      <MetricValue
                        loading={payoutLoading}
                        value={liveClaimStatus.payoutUsd}
                        label="Loading payout value"
                      />
                    </strong>
                  </div>
                  <div>
                    <span>Payout vs Loss value</span>
                    <strong>
                      <MetricValue
                        loading={payoutLoading}
                        value={liveClaimStatus.payoutVsLoss}
                        label="Loading payout comparison"
                      />
                    </strong>
                  </div>
                </div>
                <div className="claim-status-payout-details">
                  <span>Payout Details</span>
                  {payoutLoading && (liveClaimStatus.payoutDetails || []).length === 0
                    ? <LoadingSpinner label="Loading payout details" />
                    : null}
                  {(liveClaimStatus.payoutDetails || []).map((detail) => (
                    <strong key={`${detail.symbol}:${detail.amount}`}>{detail.amount} {detail.symbol}{detail.usd ? ` (${detail.usd})` : ''}</strong>
                  ))}
                </div>
              </>
            ) : null}
            <span className="claim-status-timeline-label">Status</span>
            <div className="claim-status-timeline" aria-label={`Current stage: ${liveClaimStatus.stage}`}>
              {timelineLabels.map((label, index) => {
                const active = index === liveClaimStatus.stageIndex;
                // Stages behind the current one have run to completion: fill the
                // bar and show no time remaining instead of their nominal length.
                const complete = index < liveClaimStatus.stageIndex;
                const duration = index === 1
                  ? `${liveClaimStatus.phaseWindowDays || 3}-${(liveClaimStatus.phaseWindowDays || 3) * 2} days`
                  : `${liveClaimStatus.phaseWindowDays || 3} days`;
                const progressPercent = active ? liveClaimStatus.progressPercent : 100;
                return (
                <div className={`claim-status-step${active ? ' claim-status-step--active' : ''}${complete ? ' claim-status-step--complete' : ''}`} key={label}>
                  <span
                    className="claim-status-step-bar"
                    role={active || complete ? 'progressbar' : undefined}
                    aria-label={active || complete ? `${label} progress` : undefined}
                    aria-valuemin={active || complete ? 0 : undefined}
                    aria-valuemax={active || complete ? 100 : undefined}
                    aria-valuenow={active || complete ? progressPercent : undefined}
                    aria-valuetext={active
                      ? timeLeftLabel(liveClaimStatus.daysLeft, liveClaimStatus.hoursLeft)
                      : complete ? timeLeftLabel(0, 0) : undefined}
                    style={active || complete
                      ? { '--claim-progress': `${progressPercent}%` }
                      : undefined}
                  />
                  <strong>{label}</strong>
                  <small>{active
                    ? timeLeftLabel(liveClaimStatus.daysLeft, liveClaimStatus.hoursLeft)
                    : complete ? timeLeftLabel(0, 0) : duration}</small>
                </div>
                );
              })}
            </div>
            {actionButtons.length > 0 || statusMessage ? (
              <div className="claim-status-actions">
                {actionButtons.map(([label, action]) => (
                  <button className="usd8-dialog-submit" type="button" onClick={action} key={label}>{label}</button>
                ))}
                {statusMessage ? (
                  <small className={`usd8-dialog-status${statusTone === 'warning' ? ' usd8-dialog-status--warning' : ''}`} role={statusTone === 'loading' ? 'status' : 'alert'}>
                    {statusTone === 'loading' ? <LoadingSpinner /> : null}
                    {statusMessage}
                  </small>
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
                <label htmlFor="file-claim-token-amount">{selectedToken.symbol} Amount</label>
                <input
                  id="file-claim-token-amount"
                  aria-label={`Insured ${selectedToken.symbol} amount`}
                  inputMode="decimal"
                  min="0"
                  step="any"
                  type="number"
                  value={amount}
                  onChange={(event) => {
                    onClearStatus?.();
                    setAmount(event.target.value);
                  }}
                />
                <small>
                  {displayAvailableBalance(selectedToken.balance)} available.
                </small>
              </div>

              <div className="file-claim-field file-claim-field--bond file-claim-field--compact">
                <span className="metric-label-with-help">
                  Claim bond
                  <InfoTooltip ariaLabel="About claim bond" className="dashboard-help--align-right" floating>
                    A 10 USD8 anti-spam bond is required to file. It will not be returned if you are not eligible for a claim.
                  </InfoTooltip>
                </span>
                <output>{claimBond}</output>
                <small><span>{displayAvailableBalance(claimBondAvailable)} available</span></small>
              </div>

              <div className="file-claim-field file-claim-field--score file-claim-field--primary">
                <span className="metric-label-with-help">
                  <label htmlFor="file-claim-score">Insurance score to spend</label>
                  <InfoTooltip ariaLabel="About insurance score to spend" floating>
                    Requested score spend. Settlement caps it to your available score, and score is spent only if an eligible payout is accepted.
                  </InfoTooltip>
                </span>
                <input
                  id="file-claim-score"
                  aria-label="Insurance score to spend"
                  inputMode="decimal"
                  pattern="[0-9,]*[.]?[0-9]*"
                  type="text"
                  value={scoreToSpend}
                  onChange={(event) => {
                    onClearStatus?.();
                    setScoreToSpend(insuranceScoreInputValue(event.target.value));
                  }}
                />
                <small>{displayAvailableBalance(availableScore)} available</small>
              </div>

              <div className="file-claim-field file-claim-field--compact">
                <span className="metric-label-with-help">
                  <label htmlFor="file-claim-boosters">Boosters to burn</label>
                  <InfoTooltip ariaLabel="About boosters to burn" className="dashboard-help--align-right" floating>
                    Optional. Each Booster will boost the final insurance score by 1%. Unused Boosters will be returned.
                  </InfoTooltip>
                </span>
                <input
                  id="file-claim-boosters"
                  aria-label="Boosters to burn"
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
                <small>{displayAvailableBalance(availableBoosters)} available</small>
              </div>

            </div>

            <div className="usd8-dialog-submit-row file-claim-submit-row">
              <AvailabilityAction
                className="usd8-dialog-submit"
                type="submit"
                unavailableReason={claimUnavailableReason}
                warningResetKey={`${selectedToken.id}:${amount}:${scoreToSpend}:${boosterAmount}`}
              >
                File Claim
              </AvailabilityAction>
              <small className="file-claim-weight">
                Total insurance score to spend: {formatWad(effectiveScoreUnits, 2, { trim: true })}
                {boosterCount !== '0' ? ` (incl. ${boosterCount} booster${boosterCount === '1' ? '' : 's'})` : ''}
                {' '}— {effectiveScoreShare} of all score committed atm.
              </small>
              {statusMessage ? (
                <small
                  className={`usd8-dialog-status${statusTone === 'warning' ? ' usd8-dialog-status--warning' : ''}`}
                  role={statusTone === 'loading' ? 'status' : 'alert'}
                  aria-label="Claim submission status"
                >
                  {statusTone === 'loading' ? <LoadingSpinner /> : null}
                  {statusMessage}
                </small>
              ) : null}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
