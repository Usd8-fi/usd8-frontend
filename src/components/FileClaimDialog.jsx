import { useEffect, useState } from 'react';
import { displayAvailableBalance } from '../lib/displayAvailableBalance.js';
import { tokenAmountExceedsBalance } from '../lib/tokenAmount.js';
import AvailabilityAction from './AvailabilityAction.jsx';
import InfoTooltip from './InfoTooltip.jsx';

function normalizedDecimal(value) {
  return String(value || '0').replace(/,/g, '').trim();
}

function isPositiveDecimal(value) {
  const normalized = normalizedDecimal(value);
  return /^(?:\d+\.?\d*|\.\d+)$/.test(normalized) && /[1-9]/.test(normalized);
}

function defaultTokenAmount(available) {
  return isPositiveDecimal(available) ? '1' : '';
}

function ClaimDialogCloseButton({ onClose }) {
  return (
    <button className="app-dialog-close" type="button" aria-label="Close file claim" onClick={onClose}>
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
  maxIncidentAgeHours = 144,
  requiresIncidentTime = true,
  claimStatus = null,
  submitUnavailableReason = '',
  statusMessage = '',
  onClearStatus,
  onClose,
  onSubmit,
}) {
  const tokenOptions = insuredTokens.length > 0
    ? insuredTokens
    : [{ id: token, symbol: token, balance: '0' }];
  const initialToken = tokenOptions.find((option) => option.id === token || option.symbol === token) || tokenOptions[0];
  const [amount, setAmount] = useState(() => defaultTokenAmount(initialToken.balance));
  const [scoreToSpend, setScoreToSpend] = useState(() => normalizedDecimal(availableScore));
  const [boosterAmount, setBoosterAmount] = useState('0');
  const [incidentAgeHours, setIncidentAgeHours] = useState(24);
  const [selectedTokenId, setSelectedTokenId] = useState(initialToken.id);
  const selectedToken = tokenOptions.find((option) => option.id === selectedTokenId) || tokenOptions[0];
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
  const daysLeft = Number.isFinite(claimStatus?.daysLeft) ? Math.max(0, Math.ceil(claimStatus.daysLeft)) : null;

  useEffect(() => {
    setScoreToSpend(availableScoreValue);
  }, [availableScoreValue]);

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
      <section className="usd8-dialog file-claim-dialog" role="dialog" aria-modal="true" aria-label={`File claim for ${selectedToken.symbol}`}>
        <ClaimDialogCloseButton onClose={onClose} />
        <h2 className="file-claim-title">{activeClaim ? 'Claim Status' : 'File a Claim'}</h2>

        {activeClaim ? (
          <section className="file-claim-status" aria-live="polite">
            <div className="file-claim-status-main">
              <p>Claim ID</p>
              <strong>{claimStatus.id}</strong>
              <p>Current status</p>
              <strong>{claimStatus.stage}</strong>
            </div>
            {daysLeft !== null ? (
              <footer className="file-claim-days-left">{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</footer>
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
              <div className="file-claim-field file-claim-field--token">
                <span className="metric-label-with-help">
                  Insured token
                  <InfoTooltip ariaLabel="About insured token" floating>
                    Select the covered token affected by the incident and the amount to escrow with the claim.
                  </InfoTooltip>
                </span>
                <div className="file-claim-token-entry">
                  <input
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
                  <select
                    aria-label="Insured token"
                    value={selectedTokenId}
                    onChange={(event) => {
                      onClearStatus?.();
                      const nextTokenId = event.target.value;
                      const nextToken = tokenOptions.find((option) => option.id === nextTokenId);
                      setSelectedTokenId(nextTokenId);
                      setAmount(defaultTokenAmount(nextToken?.balance));
                    }}
                  >
                    {tokenOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.symbol}</option>
                    ))}
                  </select>
                </div>
                <small>
                  <button
                    className="usd8-dialog-available"
                    type="button"
                    aria-label={`Use full ${selectedToken.symbol} balance ${selectedToken.balance}`}
                    onClick={() => setAmount(String(selectedToken.balance).replace(/,/g, ''))}
                  >
                    {displayAvailableBalance(selectedToken.balance)} available
                  </button>
                </small>
              </div>

              <div className="file-claim-field file-claim-field--bond">
                <span className="metric-label-with-help">
                  Claim bond
                  <InfoTooltip ariaLabel="About claim bond" className="dashboard-help--align-right" floating>
                    A 10 USD8 anti-spam bond is required to file. It will not be returned if you are not eligible for a claim.
                  </InfoTooltip>
                </span>
                <output>{claimBond}</output>
                <small><span>{displayAvailableBalance(claimBondAvailable)} available</span></small>
              </div>

              <div className="file-claim-field file-claim-field--score">
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
                  min="0"
                  step="any"
                  type="number"
                  disabled={!hasAvailableScore}
                  value={scoreToSpend}
                  onChange={(event) => {
                    onClearStatus?.();
                    setScoreToSpend(event.target.value);
                  }}
                />
                <small>
                  {hasAvailableScore ? (
                    <button
                      className="usd8-dialog-available"
                      type="button"
                      aria-label={`Use full insurance score ${availableScore}`}
                      onClick={() => setScoreToSpend(availableScoreValue)}
                    >
                      {displayAvailableBalance(availableScore)} available
                    </button>
                  ) : <span>No available insurance score to spend.</span>}
                </small>
              </div>

              <div className="file-claim-field">
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
                    {displayAvailableBalance(availableBoosters)} available
                  </button>
                </small>
              </div>

              {requiresIncidentTime ? (
                <div className="file-claim-field file-claim-field--incident">
                  <span className="metric-label-with-help">
                    <label htmlFor="file-claim-incident-age">Roughly when price dropped 20% against its underlying</label>
                    <InfoTooltip ariaLabel="About incident time" floating>
                      Choose the approximate start of the loss. The TEE verifies finalized prices and selects the eligible reference block within the protocol's 43,200-block lookback.
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

            {requiresIncidentTime ? (
              <p className="file-claim-tee-note" role="note">
                First claim may take several minutes while the TEE verifies the incident.
              </p>
            ) : null}

            <div className="usd8-dialog-submit-row file-claim-submit-row">
              <AvailabilityAction
                className="usd8-dialog-submit"
                type="submit"
                unavailableReason={claimUnavailableReason}
                warningResetKey={`${selectedTokenId}:${amount}:${scoreToSpend}:${boosterAmount}:${incidentAgeHours}`}
              >
                file claim
              </AvailabilityAction>
              {statusMessage ? (
                <small className="usd8-dialog-status" role="alert">
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
