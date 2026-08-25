import { useEffect, useState } from 'react';
import { claimLifecycle } from '../lib/claimLifecycle.js';
import { displayAvailableBalance } from '../lib/displayAvailableBalance.js';
import { tokenAmountExceedsBalance } from '../lib/tokenAmount.js';
import AvailabilityAction from './AvailabilityAction.jsx';
import InfoTooltip from './InfoTooltip.jsx';

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
  return isPositiveDecimal(available) ? '1' : '';
}

function proposedSharePercentage(value, existingTotal) {
  const input = normalizedDecimal(value);
  const total = normalizedDecimal(existingTotal);
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(input)
      || !/^(?:\d+\.?\d*|\.\d+)$/.test(total)) return '0.0%';

  const inputFraction = input.split('.')[1]?.length || 0;
  const totalFraction = total.split('.')[1]?.length || 0;
  const decimals = Math.max(inputFraction, totalFraction);
  const scaled = (decimal) => {
    const [whole = '0', fraction = ''] = decimal.split('.');
    return BigInt(`${whole || '0'}${fraction.padEnd(decimals, '0')}`);
  };
  const inputAmount = scaled(input);
  const combinedTotal = inputAmount + scaled(total);
  if (combinedTotal === 0n) return '0.0%';
  const tenths = (inputAmount * 1_000n) / combinedTotal;
  return `${tenths / 10n}.${tenths % 10n}%`;
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
  claimTotals = { insuredTokenAmount: '0', scoreCommitted: '0' },
  maxIncidentAgeHours = 144,
  requiresIncidentTime = true,
  claimStatus = null,
  submitUnavailableReason = '',
  statusMessage = '',
  statusTone = 'neutral',
  onClearStatus,
  onClose,
  onCancel,
  onSubmit,
}) {
  const tokenOptions = insuredTokens.length > 0
    ? insuredTokens
    : [{ id: token, symbol: token, balance: '0' }];
  const selectedToken = tokenOptions.find((option) => option.id === token || option.symbol === token) || tokenOptions[0];
  const [amount, setAmount] = useState(() => defaultTokenAmount(selectedToken.balance));
  const [scoreToSpend, setScoreToSpend] = useState(() => insuranceScoreInputValue(availableScore));
  const [boosterAmount, setBoosterAmount] = useState('0');
  const [incidentAgeHours, setIncidentAgeHours] = useState(24);

  const incidentAgeLimit = Math.max(1, Math.floor(Number(maxIncidentAgeHours) || 1));
  const incidentDayOptions = Array.from(
    { length: Math.floor(incidentAgeLimit / 24) },
    (_, index) => ({ days: index + 1, hours: (index + 1) * 24 }),
  );
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
  const claimIncident = claimStatus?.incident;
  const proposedTokenClaimPercentage = proposedSharePercentage(
    amount,
    claimTotals.insuredTokenAmount,
  );
  const proposedScoreCommitmentPercentage = proposedSharePercentage(
    scoreToSpend,
    claimTotals.scoreCommitted,
  );
  const [statusNowMilliseconds, setStatusNowMilliseconds] = useState(Date.now());
  const liveClaimStatus = activeClaim && claimIncident
    ? { ...claimStatus, ...claimLifecycle(claimIncident, statusNowMilliseconds) }
    : claimStatus;

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
          aria-label={activeClaim ? 'Claim Status' : `File a Claim for ${selectedToken.symbol}`}
        >
          {!activeClaim && selectedToken.iconSrc ? <img src={selectedToken.iconSrc} alt={selectedToken.symbol} /> : null}
          <span>{activeClaim ? 'Claim Status' : `File a Claim for ${selectedToken.symbol}`}</span>
        </h2>

        {activeClaim ? (
          <section className="file-claim-status" aria-live="polite">
            <div className="claim-status-metrics">
              <div>
                <span>Insured Token</span>
                <strong>{liveClaimStatus.insuredTokenAmount} {selectedToken.symbol}</strong>
                <small>{liveClaimStatus.insuredTokenClaimPercentage} of all token claims</small>
              </div>
              <div><span>Claim Bond</span><strong>{liveClaimStatus.bondAmount} USD8</strong></div>
              <div>
                <span>Insurance score to spend</span>
                <strong>{liveClaimStatus.scoreToSpend}</strong>
                <small>{liveClaimStatus.scoreCommitmentPercentage} of all score committed</small>
              </div>
              <div><span>Booster to spend</span><strong>{liveClaimStatus.boosterAmount}</strong></div>
            </div>
            <span className="claim-status-timeline-label">Status</span>
            <div className="claim-status-timeline" aria-label={`Current stage: ${liveClaimStatus.stage}`}>
              {[
                ['Claim Open', `${liveClaimStatus.phaseWindowDays || 3} days`],
                ['Settle & Dispute', `${liveClaimStatus.phaseWindowDays || 3}-${(liveClaimStatus.phaseWindowDays || 3) * 2} days`],
                ['Finalise Payout', `${liveClaimStatus.phaseWindowDays || 3} days`],
              ].map(([label, duration], index) => (
                <div className={index === liveClaimStatus.stageIndex ? 'claim-status-step claim-status-step--active' : 'claim-status-step'} key={label}>
                  <span
                    className="claim-status-step-bar"
                    role={index === liveClaimStatus.stageIndex ? 'progressbar' : undefined}
                    aria-label={index === liveClaimStatus.stageIndex ? `${label} progress` : undefined}
                    aria-valuemin={index === liveClaimStatus.stageIndex ? 0 : undefined}
                    aria-valuemax={index === liveClaimStatus.stageIndex ? 100 : undefined}
                    aria-valuenow={index === liveClaimStatus.stageIndex ? liveClaimStatus.progressPercent : undefined}
                    aria-valuetext={index === liveClaimStatus.stageIndex
                      ? timeLeftLabel(liveClaimStatus.daysLeft, liveClaimStatus.hoursLeft)
                      : undefined}
                    style={index === liveClaimStatus.stageIndex
                      ? { '--claim-progress': `${liveClaimStatus.progressPercent}%` }
                      : undefined}
                  />
                  <strong>{label}</strong>
                  <small>{index === liveClaimStatus.stageIndex
                    ? timeLeftLabel(liveClaimStatus.daysLeft, liveClaimStatus.hoursLeft)
                    : duration}</small>
                </div>
              ))}
            </div>
            {liveClaimStatus.cancellable ? (
              <div className="claim-status-actions">
                <button className="usd8-dialog-submit" type="button" onClick={onCancel}>Cancel Claim</button>
                {statusMessage ? (
                  <small className={`usd8-dialog-status${statusTone === 'warning' ? ' usd8-dialog-status--warning' : ''}`} role={statusTone === 'loading' ? 'status' : 'alert'}>
                    {statusTone === 'loading' ? <span className="usd8-dialog-status-spinner" aria-hidden="true" /> : null}
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
                incidentAgeHours: requiresIncidentTime ? incidentAgeHours : null,
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
                  <button
                    className="usd8-dialog-available"
                    type="button"
                    aria-label={`Use full ${selectedToken.symbol} balance ${selectedToken.balance}`}
                    onClick={() => setAmount(String(selectedToken.balance).replace(/,/g, ''))}
                  >
                    {displayAvailableBalance(selectedToken.balance)}
                  </button>
                  <span> available. {amount || '0'} {selectedToken.symbol} is {proposedTokenClaimPercentage} of all token claims atm.</span>
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
                <small>
                  <button
                    className="usd8-dialog-available"
                    type="button"
                    aria-label={`Use full insurance score ${availableScore}`}
                    onClick={() => setScoreToSpend(insuranceScoreInputValue(availableScoreValue))}
                  >
                    {displayAvailableBalance(availableScore)}
                  </button>
                  <span> available. {scoreToSpend || '0'} is {proposedScoreCommitmentPercentage} of all score committed atm.</span>
                </small>
              </div>

              <div className="file-claim-field file-claim-field--compact">
                <span className="metric-label-with-help">
                  <label htmlFor="file-claim-boosters">Boosters to burn</label>
                  <InfoTooltip ariaLabel="About boosters to burn" className="dashboard-help--align-right" floating>
                    Optional Booster units escrowed with the claim and consumed only if an eligible boosted payout is accepted.
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
                <small>
                  <button
                    className="usd8-dialog-available"
                    type="button"
                    aria-label={`Use all boosters ${availableBoosters}`}
                    onClick={() => setBoosterAmount(String(availableBoosters).replace(/,/g, ''))}
                  >
                    {displayAvailableBalance(availableBoosters)}
                  </button>
                  <span> available</span>
                </small>
              </div>

              {requiresIncidentTime ? (
                <div className="file-claim-field file-claim-field--incident">
                  <span className="metric-label-with-help">
                    <label htmlFor="file-claim-incident-age">Roughly when price dropped 20% against its underlying</label>
                    <InfoTooltip ariaLabel="About incident time" floating>
                      Choose the approximate start of the loss. Claims can only be made for qualifying drops within the past six days. The TEE verifies finalized prices and selects the eligible reference block within the protocol's 43,200-block lookback.
                    </InfoTooltip>
                  </span>
                  <select
                    id="file-claim-incident-age"
                    aria-label="Approximate incident age"
                    value={incidentAgeHours}
                    onChange={(event) => {
                      onClearStatus?.();
                      setIncidentAgeHours(Number(event.target.value));
                    }}
                  >
                    {incidentDayOptions.length > 0 ? (
                      <optgroup label="Days ago">
                        {incidentDayOptions.map(({ days, hours }) => (
                          <option key={hours} value={hours}>{days} {days === 1 ? 'day' : 'days'} ago</option>
                        ))}
                      </optgroup>
                    ) : null}
                  </select>
                </div>
              ) : null}
            </div>

            <div className="usd8-dialog-submit-row file-claim-submit-row">
              <AvailabilityAction
                className="usd8-dialog-submit"
                type="submit"
                unavailableReason={claimUnavailableReason}
                warningResetKey={`${selectedToken.id}:${amount}:${scoreToSpend}:${boosterAmount}:${incidentAgeHours}`}
              >
                File Claim
              </AvailabilityAction>
              {statusMessage ? (
                <small
                  className={`usd8-dialog-status${statusTone === 'warning' ? ' usd8-dialog-status--warning' : ''}`}
                  role={statusTone === 'loading' ? 'status' : 'alert'}
                  aria-label="Claim submission status"
                >
                  {statusTone === 'loading' ? <span className="usd8-dialog-status-spinner" aria-hidden="true" /> : null}
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
