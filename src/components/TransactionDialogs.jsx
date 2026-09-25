// Mint/redeem and cover-pool transaction dialogs. Blocker rules live in
// lib/actionRules.js; these components only render them.
import { useEffect, useRef, useState } from 'react';
import AvailabilityAction from './AvailabilityAction.jsx';
import { useDialogFocus } from './useDialogFocus.js';
import { defaultTokenAmount, poolActionState, tokenAmountValidationReason } from '../lib/actionRules.js';
import { decimalInputValue, displayAvailableBalance } from '../lib/displayAvailableBalance.js';
import { docsUrl } from '../lib/docsLinks.js';
import { durationAdjective } from '../lib/durations.js';
import { useLivePoolEarnings } from '../lib/livePoolEarnings.js';
import { poolRedemptionQuote } from '../lib/poolWithdrawal.js';
import { redemptionQuote } from '../lib/quote.js';
import { groupDecimalString, UNKNOWN_VALUE } from '../lib/units.js';
import { parseUnits } from '../lib/viemLite.js';

function DialogCloseButton({ label, onClose }) {
  return (
    <button className="app-dialog-close" type="button" aria-label={label} onClick={onClose}>×</button>
  );
}

export function Usd8ActionDialog({ quoteRate, mode, usdcBalance, usd8Balance, onInputChange, onClose, onSubmit, submitUnavailableReason = '' }) {
  const minting = mode === 'mint';
  const dialogTitle = minting ? 'Mint USD8' : 'Redeem USD8';
  const closeLabel = minting ? 'Close mint USD8' : 'Close redeem USD8';
  const inputToken = minting ? 'USDC' : 'USD8';
  const outputToken = minting ? 'USD8' : 'USDC';
  const availableBalance = minting ? usdcBalance : usd8Balance;
  const [amount, setAmount] = useState(() => defaultTokenAmount(availableBalance));
  const amountUnavailableReason = submitUnavailableReason
    || tokenAmountValidationReason(amount, availableBalance, inputToken, minting ? 'mint USD8' : 'redeem USD8')
    || (!minting && redemptionQuote(amount, quoteRate) === null ? 'Waiting for a valid redemption quote.' : '');

  const dialogRef = useDialogFocus(onClose);

  return (
    <div className="usd8-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="usd8-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={dialogTitle}>
        <DialogCloseButton label={closeLabel} onClose={onClose} />
        <h2 className="usd8-dialog-title">{dialogTitle}</h2>

        <form className="usd8-dialog-form" onSubmit={(event) => {
          event.preventDefault();
          if (!amountUnavailableReason) onSubmit(mode, amount);
        }}>
          <div className="usd8-dialog-flow">
            <label className="usd8-dialog-amount">
              <span>{inputToken}</span>
              <input
                aria-label={`${inputToken} amount`}
                inputMode="decimal"
                min="0"
                step="any"
                type="text"
                value={amount}
                onChange={(event) => {
                  setAmount(decimalInputValue(event.target.value));
                  onInputChange?.();
                }}
              />
              <small>{displayAvailableBalance(availableBalance)} available</small>
            </label>

            <span className="usd8-dialog-arrow" aria-hidden="true">→</span>

            <div className="usd8-dialog-output">
              <span>{outputToken}</span>
              <output aria-label={`${outputToken} output`}>{minting ? amount || '0' : redemptionQuote(amount, quoteRate) ?? UNKNOWN_VALUE}</output>
            </div>
          </div>

          <div className="usd8-dialog-submit-row">
            <AvailabilityAction
              className="usd8-dialog-submit"
              type="submit"
              unavailableReason={amountUnavailableReason}
              warningResetKey={`${mode}:${amount}`}
            >
              {minting ? 'Mint' : 'Redeem'}
            </AvailabilityAction>
          </div>
        </form>
      </section>
    </div>
  );
}

// Ticks once per second on its own, so the dialog's form doesn't re-render.
function LiveEarningsOutput({ pool }) {
  const earnings = useLivePoolEarnings(pool || {})?.earnings;
  return (
    <>
      <output aria-label="USD8 Earnings">{earnings}</output>
      <small>{displayAvailableBalance(earnings)} USD8 available to withdraw</small>
    </>
  );
}

export function PoolActionDialog({
  mode,
  poolName = 'cover pool',
  assetSymbol = '',
  shareSymbol = '',
  shareDecimals = 21,
  withdrawalQuote,
  coverAssetBalance,
  activeIncidentId,
  capacityUncapped,
  remainingDepositCapacity,
  poolShareBalance,
  availableForCooldown,
  availableForCooldownAssets,
  availableForWithdrawAssets,
  inCooldownAssets,
  exitSettled,
  availableForWithdraw,
  inCooldown,
  cooldownEndsAtMilliseconds,
  exitCooldownSeconds = null,
  earningsPool,
  hasEarnings,
  onInputChange,
  onClose,
  onSubmit,
  submitUnavailableReason = '',
}) {
  const withdrawingEarnings = mode === 'claimReward';
  const exitCooldownLabel = durationAdjective(exitCooldownSeconds);
  const depositing = mode === 'deposit';
  const withdrawing = mode === 'withdraw';
  const dialogTitle = depositing ? 'Deposit' : withdrawing ? 'Withdraw' : 'Withdraw Earnings';
  const closeLabel = `Close ${depositing ? 'deposit to' : withdrawing ? 'withdraw from' : 'withdraw earnings from'} ${poolName}`;
  const inputToken = depositing ? assetSymbol : shareSymbol;
  const available = depositing ? coverAssetBalance : availableForCooldown ?? poolShareBalance;

  const [amount, setAmount] = useState(() => defaultTokenAmount(available));
  const amountEdited = useRef(false);
  const estimatedAssets = poolRedemptionQuote(amount, withdrawalQuote, shareDecimals);
  const estimatedOutput = estimatedAssets === null ? UNKNOWN_VALUE
    : parseUnits(estimatedAssets, 18) > 0n && parseUnits(estimatedAssets, 18) < 1_000_000_000_000n ? '<0.000001'
    : groupDecimalString(estimatedAssets, { decimals: 6 });
  const [currentTimeMilliseconds, setCurrentTimeMilliseconds] = useState(Date.now());
  const {
    cooldownCompleteWaitingForClaims,
    cooldownTiming,
    amountUnavailableReason,
    withdrawUnavailableReason,
  } = poolActionState({
    mode,
    amount,
    available,
    inputToken,
    assetSymbol,
    estimatedAssets,
    activeIncidentId,
    availableForWithdraw,
    availableForCooldownAssets,
    inCooldown,
    cooldownEndsAtMilliseconds,
    nowMilliseconds: currentTimeMilliseconds,
    capacityUncapped,
    remainingDepositCapacity,
    hasEarnings,
    submitUnavailableReason,
  });
  const displayedWithdrawAvailable = (cooldownCompleteWaitingForClaims ? inCooldownAssets : availableForWithdrawAssets) ?? UNKNOWN_VALUE;
  const displayedCooldownBalance = cooldownCompleteWaitingForClaims ? '0' : inCooldownAssets ?? UNKNOWN_VALUE;

  useEffect(() => {
    if (!amountEdited.current) setAmount(defaultTokenAmount(available));
  }, [available]);

  useEffect(() => {
    if (!cooldownTiming || cooldownTiming === 'ready now') return undefined;
    const timer = window.setInterval(() => setCurrentTimeMilliseconds(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [cooldownEndsAtMilliseconds, cooldownTiming]);

  const dialogRef = useDialogFocus(onClose);

  return (
    <div className="usd8-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="usd8-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={dialogTitle}>
        <DialogCloseButton label={closeLabel} onClose={onClose} />
        <h2 className="usd8-dialog-title">{dialogTitle}</h2>

        <form className="usd8-dialog-form" onSubmit={(event) => {
          event.preventDefault();
          if (!amountUnavailableReason && !withdrawing) onSubmit(mode, amount);
        }}>
          {withdrawingEarnings ? (
            <div className="usd8-dialog-flow usd8-dialog-flow--single">
              <div className="usd8-dialog-output">
                <span>USD8 Earnings</span>
                <LiveEarningsOutput pool={earningsPool} />
              </div>
            </div>
          ) : (
            <div className={`usd8-dialog-flow${withdrawing ? ' usd8-dialog-flow--withdraw' : ' usd8-dialog-flow--single'}`}>
              <label className="usd8-dialog-amount">
                <span>{withdrawing ? 'Pool Shares to Redeem' : inputToken}</span>
                <input
                  aria-label={`${inputToken} amount`}
                  inputMode="decimal"
                  min="0"
                  step="any"
                  type="text"
                  value={amount}
                  onChange={(event) => {
                    amountEdited.current = true;
                    setAmount(decimalInputValue(event.target.value));
                    onInputChange?.();
                  }}
                />
                {mode === 'withdraw' ? (
                  <small className="usd8-dialog-pool-availability usd8-dialog-withdrawal-availability">
                    {displayAvailableBalance(available)} shares available. {exitCooldownLabel ? `${exitCooldownLabel} cooldown` : 'Cooldown'} if no pending claims. Otherwise after the claims are all finalized.{' '}
                    <a href={docsUrl('cover-pools.html')}>Learn More</a>.
                  </small>
                ) : (
                  <small className="usd8-dialog-pool-availability">
                    {displayAvailableBalance(available)} available
                    {depositing && !capacityUncapped && remainingDepositCapacity !== '' ? (
                      <>
                        .{' '}
                        <span className="usd8-dialog-pool-capacity">
                          {displayAvailableBalance(remainingDepositCapacity)} {assetSymbol} left in pool limit
                        </span>
                      </>
                    ) : null}
                  </small>
                )}
              </label>
              {withdrawing ? <>
                <span className="usd8-dialog-arrow" aria-hidden="true">→</span>
                <div className="usd8-dialog-output">
                  <span>Estimated {assetSymbol} Received</span>
                  <output aria-label={`Estimated ${assetSymbol} Received`} title={estimatedAssets ?? undefined}>{estimatedOutput}</output>
                  <small>May decrease if the pool pays claims before your withdrawal settles.</small>
                </div>
              </> : null}
            </div>
          )}

          <div className={`usd8-dialog-submit-row${withdrawing ? ' usd8-dialog-submit-row--withdraw' : ''}`}>
            {withdrawing ? (
              <>
                <AvailabilityAction
                  className="usd8-dialog-submit"
                  type="button"
                  onClick={() => onSubmit('startCooldown', amount)}
                  unavailableReason={amountUnavailableReason}
                  warningResetKey={`${mode}:${amount}`}
                >
                  Start Cooldown
                </AvailabilityAction>
                <small className="usd8-dialog-withdraw-balances">
                  {displayAvailableBalance(displayedWithdrawAvailable)} {assetSymbol} {exitSettled ? 'ready to withdraw' : 'estimated for withdrawal'}{cooldownCompleteWaitingForClaims ? ' after claims are finalized' : ''}, {' '}
                  {displayAvailableBalance(displayedCooldownBalance)} {assetSymbol} in cooldown{cooldownTiming ? ` — ${cooldownTiming}` : ''}.
                </small>
                <AvailabilityAction
                  className="usd8-dialog-submit"
                  type="button"
                  onClick={() => onSubmit('withdraw', '')}
                  unavailableReason={withdrawUnavailableReason}
                >
                  Withdraw
                </AvailabilityAction>
              </>
            ) : (
              <AvailabilityAction
                className="usd8-dialog-submit"
                type="submit"
                unavailableReason={amountUnavailableReason}
                warningResetKey={`${mode}:${amount}`}
              >
                {withdrawingEarnings ? 'Withdraw Earnings' : 'Deposit'}
              </AvailabilityAction>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
