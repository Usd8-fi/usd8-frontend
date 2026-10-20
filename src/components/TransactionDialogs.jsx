// Mint/redeem and cover-pool transaction dialogs. Blocker rules live in
// lib/actionRules.js; these components only render them.
import { useEffect, useRef, useState } from 'react';
import AvailabilityAction from './AvailabilityAction.jsx';
import { useDialogFocus } from './useDialogFocus.js';
import { defaultTokenAmount, poolActionState, tokenAmountValidationReason } from '../lib/actionRules.js';
import { decimalInputValue, displayAvailableBalance } from '../lib/displayAvailableBalance.js';
import { docsUrl } from '../lib/docsLinks.js';
import { durationAdjective } from '../lib/durations.js';
import { cooldownProgressPercent, fetchExitRequestedAt } from '../lib/exitRequest.js';
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

/// Progress of the account's live exit: elapsed share of the cooldown (start
/// from the account's RedeemRequested log, end = the exit's batch epoch), or a
/// full bar once it is ready or waiting for claims. Renders nothing without a live exit, and
/// nothing while the cooldown start is unknown (no guessed progress).
export function ExitProgress({
  poolAddress, account, cooldownEndsAtMilliseconds, ready, waitingForClaims, nowMilliseconds,
}) {
  const inCooldown = !ready && !waitingForClaims && Number(cooldownEndsAtMilliseconds) > 0;
  const [requestedAt, setRequestedAt] = useState(null);
  useEffect(() => {
    if (!inCooldown) return undefined;
    const controller = new AbortController();
    setRequestedAt(null);
    fetchExitRequestedAt({ poolAddress, account, cooldownEndsAtMilliseconds, signal: controller.signal })
      .then((value) => { if (!controller.signal.aborted) setRequestedAt(value); })
      .catch(() => { if (!controller.signal.aborted) setRequestedAt(null); });
    return () => controller.abort();
  }, [inCooldown, poolAddress, account, cooldownEndsAtMilliseconds]);

  if (!ready && !waitingForClaims && !inCooldown) return null;
  const percent = inCooldown ? cooldownProgressPercent(requestedAt, cooldownEndsAtMilliseconds, nowMilliseconds) : 100;
  if (percent === null) return null;
  const rounded = Math.floor(percent);
  // Amounts and the ready time are in the sentence just above; the bar adds the state and share elapsed.
  const label = ready ? 'Ready to withdraw' : waitingForClaims ? 'Cooldown complete, waiting for claims to finalize' : 'Cooldown progress';
  const detail = `${rounded}%`;
  return (
    <div className="usd8-dialog-exit-progress">
      <div className="usd8-dialog-exit-progress-labels">
        <span>{label}</span>
        <span>{detail}</span>
      </div>
      <span
        className={`usd8-dialog-exit-progress-bar${ready ? ' usd8-dialog-exit-progress-bar--ready' : ''}`}
        role="progressbar"
        aria-label="Withdrawal cooldown progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        style={{ '--exit-progress': `${percent}%` }}
      />
    </div>
  );
}

export function PoolActionDialog({
  mode,
  poolAddress = '',
  account = '',
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
    hasWithdrawAvailable,
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
                    <a href={docsUrl('cover-pools.html')} target="_blank" rel="noreferrer">Learn More</a>.
                  </small>
                ) : (
                  <small className="usd8-dialog-pool-availability">
                    {displayAvailableBalance(available)} available
                    {depositing && !capacityUncapped && remainingDepositCapacity !== '' ? (
                      <>
                        .{' '}
                        <span className="usd8-dialog-pool-capacity">
                          {displayAvailableBalance(remainingDepositCapacity)} {assetSymbol} left in pool capacity
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
                <ExitProgress
                  poolAddress={poolAddress}
                  account={account}
                  cooldownEndsAtMilliseconds={cooldownEndsAtMilliseconds}
                  ready={hasWithdrawAvailable && !cooldownCompleteWaitingForClaims}
                  waitingForClaims={cooldownCompleteWaitingForClaims}
                  nowMilliseconds={currentTimeMilliseconds}
                />
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
