// Mint/redeem and cover-pool transaction dialogs. Blocker rules live in
// lib/actionRules.js; these components only render them.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../lib/i18n.js';
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
  const { t } = useTranslation();
  const minting = mode === 'mint';
  const dialogTitle = minting ? t('transactions.usd8.mintTitle') : t('transactions.usd8.redeemTitle');
  const closeLabel = minting ? t('transactions.usd8.closeMint') : t('transactions.usd8.closeRedeem');
  const inputToken = minting ? 'USDC' : 'USD8';
  const outputToken = minting ? 'USD8' : 'USDC';
  const availableBalance = minting ? usdcBalance : usd8Balance;
  const [amount, setAmount] = useState(() => defaultTokenAmount(availableBalance));
  const amountUnavailableReason = submitUnavailableReason
    || tokenAmountValidationReason(amount, availableBalance, inputToken, minting ? 'mint USD8' : 'redeem USD8')
    || (!minting && redemptionQuote(amount, quoteRate) === null ? t('transactions.usd8.waitingForQuote') : '');

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
                aria-label={t('transactions.usd8.amountInput', { token: inputToken })}
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
              <small>{t('transactions.available', { amount: displayAvailableBalance(availableBalance) })}</small>
            </label>

            <span className="usd8-dialog-arrow" aria-hidden="true">→</span>

            <div className="usd8-dialog-output">
              <span>{outputToken}</span>
              <output aria-label={t('transactions.usd8.output', { token: outputToken })}>{minting ? amount || '0' : redemptionQuote(amount, quoteRate) ?? UNKNOWN_VALUE}</output>
            </div>
          </div>

          <div className="usd8-dialog-submit-row">
            <AvailabilityAction
              className="usd8-dialog-submit"
              type="submit"
              unavailableReason={amountUnavailableReason}
              warningResetKey={`${mode}:${amount}`}
            >
              {minting ? t('transactions.usd8.mint') : t('transactions.usd8.redeem')}
            </AvailabilityAction>
          </div>
        </form>
      </section>
    </div>
  );
}

// Ticks once per second on its own, so the dialog's form doesn't re-render.
function LiveEarningsOutput({ pool }) {
  const { t } = useTranslation();
  const earnings = useLivePoolEarnings(pool || {})?.earnings;
  return (
    <>
      <output aria-label={t('transactions.earnings.label')}>{earnings}</output>
      <small>{t('transactions.earnings.availableToWithdraw', { amount: displayAvailableBalance(earnings) })}</small>
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
  const { t } = useTranslation();
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
  const label = t(ready ? 'transactions.exitProgress.ready'
    : waitingForClaims ? 'transactions.exitProgress.waitingForClaims' : 'transactions.exitProgress.cooldown');
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
        aria-label={t('transactions.exitProgress.barLabel')}
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
  poolName,
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
  const { t, tRich } = useTranslation();
  const withdrawingEarnings = mode === 'claimReward';
  const exitCooldownLabel = durationAdjective(exitCooldownSeconds);
  const depositing = mode === 'deposit';
  const withdrawing = mode === 'withdraw';
  const dialogTitle = depositing ? t('transactions.pool.depositTitle')
    : withdrawing ? t('transactions.pool.withdrawTitle') : t('transactions.pool.withdrawEarningsTitle');
  const closeLabel = t(depositing ? 'transactions.pool.closeDeposit'
    : withdrawing ? 'transactions.pool.closeWithdraw' : 'transactions.pool.closeWithdrawEarnings',
  { pool: poolName ?? t('transactions.pool.defaultName') });
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
    cooldownReady,
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
    if (!cooldownTiming || cooldownReady) return undefined;
    const timer = window.setInterval(() => setCurrentTimeMilliseconds(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [cooldownEndsAtMilliseconds, cooldownTiming, cooldownReady]);

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
                <span>{t('transactions.earnings.label')}</span>
                <LiveEarningsOutput pool={earningsPool} />
              </div>
            </div>
          ) : (
            <div className={`usd8-dialog-flow${withdrawing ? ' usd8-dialog-flow--withdraw' : ' usd8-dialog-flow--single'}`}>
              <label className="usd8-dialog-amount">
                <span>{withdrawing ? t('transactions.pool.sharesToRedeem') : inputToken}</span>
                <input
                  aria-label={t('transactions.usd8.amountInput', { token: inputToken })}
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
                    {tRich('transactions.pool.withdrawAvailability', {
                      link: (text) => <a href={docsUrl('cover-pools.html')} target="_blank" rel="noreferrer">{text}</a>,
                    }, {
                      amount: displayAvailableBalance(available),
                      cooldown: exitCooldownLabel
                        ? t('transactions.pool.cooldownWithLength', { length: exitCooldownLabel })
                        : t('transactions.pool.cooldown'),
                    })}
                  </small>
                ) : (
                  <small className="usd8-dialog-pool-availability">
                    {depositing && !capacityUncapped && remainingDepositCapacity !== ''
                      ? tRich('transactions.pool.depositAvailabilityWithCapacity', {
                        capacity: (text) => <span className="usd8-dialog-pool-capacity">{text}</span>,
                      }, {
                        amount: displayAvailableBalance(available),
                        capacity: displayAvailableBalance(remainingDepositCapacity),
                        symbol: assetSymbol,
                      })
                      : t('transactions.available', { amount: displayAvailableBalance(available) })}
                  </small>
                )}
              </label>
              {withdrawing ? <>
                <span className="usd8-dialog-arrow" aria-hidden="true">→</span>
                <div className="usd8-dialog-output">
                  <span>{t('transactions.pool.estimatedReceived', { symbol: assetSymbol })}</span>
                  <output aria-label={t('transactions.pool.estimatedReceived', { symbol: assetSymbol })} title={estimatedAssets ?? undefined}>{estimatedOutput}</output>
                  <small>{t('transactions.pool.mayDecrease')}</small>
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
                  {t('transactions.pool.startCooldown')}
                </AvailabilityAction>
                <small className="usd8-dialog-withdraw-balances">
                  {t('transactions.pool.balances.summary', {
                    withdrawable: t(`transactions.pool.balances.${exitSettled ? 'readyToWithdraw' : 'estimatedForWithdrawal'}${cooldownCompleteWaitingForClaims ? 'AfterClaims' : ''}`, {
                      amount: displayAvailableBalance(displayedWithdrawAvailable),
                      symbol: assetSymbol,
                    }),
                    cooldown: t(cooldownTiming ? 'transactions.pool.balances.inCooldownWithTiming' : 'transactions.pool.balances.inCooldown', {
                      amount: displayAvailableBalance(displayedCooldownBalance),
                      symbol: assetSymbol,
                      timing: cooldownTiming,
                    }),
                  })}
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
                  {t('transactions.pool.withdraw')}
                </AvailabilityAction>
              </>
            ) : (
              <AvailabilityAction
                className="usd8-dialog-submit"
                type="submit"
                unavailableReason={amountUnavailableReason}
                warningResetKey={`${mode}:${amount}`}
              >
                {withdrawingEarnings ? t('transactions.pool.withdrawEarnings') : t('transactions.pool.deposit')}
              </AvailabilityAction>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
