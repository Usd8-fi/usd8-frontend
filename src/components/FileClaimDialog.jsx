import { NoticeMessage } from './WalletNotice.jsx';
import { useDialogFocus } from './useDialogFocus.js';
import { useEffect, useState } from 'react';
import { claimLifecycle } from '../lib/claimLifecycle.js';
import { decimalInputValue, displayAvailableBalance } from '../lib/displayAvailableBalance.js';
import { tokenAmountExceedsBalance } from '../lib/tokenAmount.js';
import AvailabilityAction from './AvailabilityAction.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import LoadingSpinner, { MetricValue } from './LoadingSpinner.jsx';
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

function timeLeftLabel(daysLeft, hoursLeft, minutesLeft) {
  if (daysLeft === 0 && minutesLeft !== undefined) {
    const hours = hoursLeft ? `${hoursLeft} ${hoursLeft === 1 ? 'hour' : 'hours'} ` : '';
    return `${hours}${minutesLeft} ${minutesLeft === 1 ? 'minute' : 'minutes'} left`;
  }
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
  const claimIncident = claimStatus?.incident || incident;
  const [statusNowMilliseconds, setStatusNowMilliseconds] = useState(Date.now());
  const lifecycle = claimIncident ? claimLifecycle(claimIncident, statusNowMilliseconds) : null;
  const liveClaimStatus = lifecycle ? { ...claimStatus, ...lifecycle } : claimStatus;
  // Settlement is permissionless, so once filing closes the incident replaces the
  // claim form for everyone, including accounts that never filed.
  const showStatus = activeClaim
    || Boolean(lifecycle && lifecycle.state !== 'claim-open' && lifecycle.state !== 'unavailable');
  const statusTitle = activeClaim
    ? 'Your Claim Status'
    : showStatus ? 'Incident Status' : `File a Claim for ${selectedToken.symbol}`;
  const holdingRequirement = minHoldingRequiredBlocks
    ? `${BigInt(minHoldingRequiredBlocks).toLocaleString('en-US')} blocks before the incident.`
    : 'the configured pre-incident window. Holding window unavailable; refresh before filing.';
  const phaseMilliseconds = Number(claimIncident?.phaseWindowMilliseconds ?? 3 * 86_400_000);
  const phaseUnit = phaseMilliseconds >= 86_400_000 ? 'day' : phaseMilliseconds >= 3_600_000 ? 'hour' : 'minute';
  const phaseLength = phaseMilliseconds / ({ day: 86_400_000, hour: 3_600_000, minute: 60_000 }[phaseUnit]);
  const timelineLabels = {
    'claim-open': ['Claim Open', 'Settle', 'Payout'],
    'settlement-open': ['Claim Closed', 'Settle Open', 'Payout'],
    'settlement-expired': ['Claim Closed', 'Not Settled', 'Payout'],
    'settlement-pending': ['Claim Closed', 'Settled', 'Payout'],
    'payout-open': ['Claim Closed', 'Settled', 'Payout Open'],
    'payout-expired': ['Claim Closed', 'Settled', 'Payout Closed'],
  }[liveClaimStatus?.state] || ['Claim Open', 'Settle', 'Payout'];
  const showPayout = activeClaim
    && (liveClaimStatus?.state === 'payout-open' || liveClaimStatus?.state === 'payout-expired');
  const payoutIneligible = liveClaimStatus?.payoutEligible === false;
  const returnTokens = ['Cancel Payout and Return Tokens', onCancelPayout];
  const actionButtons = activeClaim ? {
    'claim-open': [['Cancel Claim', onCancel]],
    'settlement-open': [['Settle Claim', onSettle]],
    'settlement-expired': [['Return Tokens', onReturnTokens]],
    // Accepting an ineligible payout resolves exactly as a decline, so only offer the decline.
    'payout-open': payoutIneligible ? [returnTokens] : [['Accept Payout', onAcceptPayout], returnTokens],
    'payout-expired': [returnTokens],
  }[liveClaimStatus?.state] || []
    : liveClaimStatus?.state === 'settlement-open' ? [['Settle Claim', onSettle]] : [];

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
        aria-label={`${showStatus ? 'Claim Status' : 'File claim'} for ${selectedToken.symbol}`}
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
            {selectedToken.symbol} must lose more than 20% of its value against its underlying,
            measured between its TWAP price immediately before and after the drop.{' '}
            <a href="./docs/defi-insurance.html">learn more</a>.
          </p>
        ) : null}

        {showStatus ? (
          <section className="file-claim-status" aria-live="polite">
            {!activeClaim ? (
              <p className="file-claim-requirement">
                You have no claim in this incident. Filing has closed, but settlement is
                permissionless — anyone can settle it.
              </p>
            ) : (
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
              <div><span>Boosters escrowed</span><strong>{liveClaimStatus.boosterAmount}</strong></div>
            </div>
            )}
            {showPayout && payoutIneligible ? (
              <p className="file-claim-requirement">
                You are not eligible for a payout, and your {liveClaimStatus.bondAmount} USD8
                bond will not be refunded. Return your tokens to close the claim.
              </p>
            ) : null}
            {showPayout && !payoutIneligible ? (
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
                <div className="claim-status-payout-summary">
                  <div>
                    <span>Boosters burned on acceptance</span>
                    <strong><MetricValue loading={payoutLoading} value={liveClaimStatus.boostersToBurn} label="Loading eligible boosters" /></strong>
                  </div>
                  <div>
                    <span>Boosters returned on acceptance</span>
                    <strong><MetricValue loading={payoutLoading} value={liveClaimStatus.boostersToRefund} label="Loading booster refund" /></strong>
                    <small>On decline: {liveClaimStatus.boosterAmount} returned</small>
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
                  ? `${phaseLength}-${phaseLength * 2} ${phaseUnit}s`
                  : `${phaseLength} ${phaseUnit}${phaseLength === 1 ? '' : 's'}`;
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
                      ? timeLeftLabel(liveClaimStatus.daysLeft, liveClaimStatus.hoursLeft, liveClaimStatus.minutesLeft)
                      : complete ? timeLeftLabel(0, 0) : undefined}
                    style={active || complete
                      ? { '--claim-progress': `${progressPercent}%` }
                      : undefined}
                  />
                  <strong>{label}</strong>
                  <small>{active
                    ? timeLeftLabel(liveClaimStatus.daysLeft, liveClaimStatus.hoursLeft, liveClaimStatus.minutesLeft)
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
                  <NoticeMessage message={statusMessage} busy={statusTone === 'loading'} tone={statusTone === 'warning' ? 'error' : 'status'} label="Claim submission status" />
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
                  <label htmlFor="file-claim-token-amount">{selectedToken.symbol} Amount</label>
                  <InfoTooltip ariaLabel="About insured token amount" floating>
                    You must have held {selectedToken.symbol} for at least {holdingRequirement}
                    Eligibility uses your lowest balance over that window, so tokens acquired later do not
                    count. If that balance is zero you are not eligible and your claim bond is forfeited.
                  </InfoTooltip>
                </span>
                <input
                  id="file-claim-token-amount"
                  aria-label={`Insured ${selectedToken.symbol} amount`}
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
                    setScoreToSpend(insuranceScoreInputValue(decimalInputValue(event.target.value)));
                  }}
                />
                <small>{displayAvailableBalance(availableScore)} available</small>
              </div>

              <div className="file-claim-field file-claim-field--compact">
                <span className="metric-label-with-help">
                  <label htmlFor="file-claim-boosters">Boosters to escrow</label>
                  <InfoTooltip ariaLabel="About boosters to escrow" className="dashboard-help--align-right" floating>
                    Optional. Boosters must meet the same pre-incident holding requirement as the insured token: {holdingRequirement}
                    Only eligible boosters increase payout weight and are burned on acceptance.
                    Excess boosters are returned. Declining returns all boosters.
                  </InfoTooltip>
                </span>
                <input
                  id="file-claim-boosters"
                  aria-label="Boosters to escrow"
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
                Maximum payout weight: {formatWad(effectiveScoreUnits, 2, { trim: true })}
                {boosterCount !== '0' ? ` (incl. ${boosterCount} booster${boosterCount === '1' ? '' : 's'})` : ''}
                {' '}— {effectiveScoreShare} of provisional escrow weight; final weight depends on holding eligibility.
              </small>
              {statusMessage ? (
                <NoticeMessage message={statusMessage} busy={statusTone === 'loading'} tone={statusTone === 'warning' ? 'error' : 'status'} label="Claim submission status" />
              ) : null}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
