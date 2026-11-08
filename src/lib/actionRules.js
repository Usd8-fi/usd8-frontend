// Pure rules behind the transaction dialogs: amount defaults, parsing, and the
// ordered blocker checks that decide which inline warning an action shows.
// Kept free of React so every precedence rule is unit-tested directly.
import { t } from './i18n.js';
import { tCount } from './plural.js';
import { tokenAmountExceedsBalance } from './tokenAmount.js';
import { parseUnits } from './viemLite.js';

const DECIMAL = /^(?:\d+\.?\d*|\.\d+)$/;

export function defaultTokenAmount(available) {
  const normalized = String(available ?? '').replace(/,/g, '').trim();
  return DECIMAL.test(normalized) && /[1-9]/.test(normalized) ? normalized : '';
}

/// Time left on a cooldown as a language-independent value: null when the end
/// is unknown, { ready: true } once it has passed, else { count, unit }.
export function cooldownRemaining(endsAtMilliseconds, nowMilliseconds) {
  const end = Number(endsAtMilliseconds);
  const remainingMinutes = Math.ceil((end - nowMilliseconds) / 60_000);
  if (!Number.isFinite(remainingMinutes) || end <= 0) return null;
  if (remainingMinutes <= 0) return { ready: true };
  if (remainingMinutes < 60) return { ready: false, count: remainingMinutes, unit: 'minute' };
  const remainingHours = Math.ceil(remainingMinutes / 60);
  if (remainingHours < 24) return { ready: false, count: remainingHours, unit: 'hour' };
  return { ready: false, count: Math.ceil(remainingHours / 24), unit: 'day' };
}

/// "ready now" / "ready in 6 days", in the current language ('' when unknown).
/// Compare `cooldownRemaining(...).ready`, never this text.
export function cooldownReadyLabel(endsAtMilliseconds, nowMilliseconds) {
  const remaining = cooldownRemaining(endsAtMilliseconds, nowMilliseconds);
  if (!remaining) return '';
  if (remaining.ready) return t('lib.cooldown.readyNow');
  return tCount(`lib.cooldown.readyIn.${remaining.unit}`, remaining.count);
}

export function parseTokenAmount(raw, decimals) {
  const normalized = String(raw ?? '').trim();
  if (!DECIMAL.test(normalized)) throw new Error(t('lib.amount.invalidNumber'));
  if ((normalized.split('.')[1] || '').length > decimals) throw new Error(t('lib.amount.tooManyDecimals', { decimals }));
  try {
    return parseUnits(normalized, decimals);
  } catch {
    throw new Error(t('lib.amount.invalidNumber'));
  }
}

// Callers name the action in English ('deposit', 'mint USD8' ...); each known
// action has its own full sentence per language so word order can change.
const AMOUNT_ACTIONS = Object.freeze({
  deposit: 'deposit',
  'start cooldown': 'startCooldown',
  'mint USD8': 'mint',
  'redeem USD8': 'redeem',
});

function amountReason(reason, token, action) {
  const id = AMOUNT_ACTIONS[action];
  return id ? t(`lib.amount.${reason}.${id}`, { token }) : t(`lib.amount.${reason}.generic`, { token, action });
}

export function tokenAmountValidationReason(raw, available, token, action) {
  const normalized = String(raw ?? '').trim();
  if (!defaultTokenAmount(available)) return amountReason('noBalance', token, action);
  if (!DECIMAL.test(normalized)) return amountReason('invalid', token, action);
  if (!/[1-9]/.test(normalized)) return amountReason('zero', token, action);
  return tokenAmountExceedsBalance(normalized, available)
    ? t('lib.amount.exceedsBalance', { token })
    : '';
}

// Anything the user has to wait on spins. Terminal confirmations and errors
// are absent from this list and stay static. These match the English status
// lines only; App.jsx remembers translated waiting lines separately.
const WAITING_STATUS_PREFIXES = [
  'Checking ',
  'Loading ',
  'Preparing ',
  'Verifying ',
  'Transaction submitted:',
];

export function isWaitingStatus(message) {
  return message.includes('in your wallet.')
    || WAITING_STATUS_PREFIXES.some((prefix) => message.startsWith(prefix));
}

/**
 * Cover-pool dialog state for one render. Blockers are returned in the order
 * the UI reports them; the first non-empty one wins.
 *
 * - `amountUnavailableReason` guards Deposit, Start Cooldown and Withdraw Earnings.
 * - `withdrawUnavailableReason` guards completing a matured withdrawal, which
 *   takes no amount and must not inherit amount blockers.
 */
export function poolActionState({
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
  nowMilliseconds,
  capacityUncapped,
  remainingDepositCapacity,
  hasEarnings,
  submitUnavailableReason = '',
}) {
  const depositing = mode === 'deposit';
  const withdrawing = mode === 'withdraw';
  const withdrawingEarnings = mode === 'claimReward';
  const cooldownBalance = inCooldown ?? '0';
  const hasCooldownBalance = Boolean(defaultTokenAmount(cooldownBalance));
  const incidentActive = String(activeIncidentId || '0') !== '0';
  const cooldownElapsed = Number(cooldownEndsAtMilliseconds) > 0
    && nowMilliseconds >= Number(cooldownEndsAtMilliseconds);
  const cooldownCompleteWaitingForClaims = incidentActive && cooldownElapsed && hasCooldownBalance;
  const showCooldownTiming = hasCooldownBalance && !cooldownCompleteWaitingForClaims;
  const cooldownTiming = showCooldownTiming
    ? cooldownReadyLabel(cooldownEndsAtMilliseconds, nowMilliseconds)
    : '';
  // Language-independent twin of cooldownTiming === 'ready now'.
  const cooldownReady = showCooldownTiming
    && cooldownRemaining(cooldownEndsAtMilliseconds, nowMilliseconds)?.ready === true;
  const hasWithdrawAvailable = !/^0(?:\.0+)?$/.test(String(availableForWithdraw ?? '0').replace(/,/g, ''));

  const actionUnavailableReason = submitUnavailableReason
    || (withdrawing && availableForCooldownAssets == null ? t('lib.pool.withdrawalAmountsUnavailable') : '')
    || (withdrawingEarnings && !hasEarnings ? t('lib.pool.noEarnings') : '');
  const cooldownUnavailableReason = withdrawing && (hasCooldownBalance || hasWithdrawAvailable)
    ? t('lib.pool.existingWithdrawalRequest')
    : '';
  const activeIncidentDepositReason = depositing && incidentActive
    ? t('lib.pool.depositsPausedForIncident', { incident: activeIncidentId })
    : '';
  const tokenValidationReason = withdrawingEarnings
    ? ''
    : tokenAmountValidationReason(amount, available, inputToken, depositing ? 'deposit' : 'start cooldown');
  const capacityDepositReason = depositing
    && !capacityUncapped
    && !tokenValidationReason
    && tokenAmountExceedsBalance(amount, remainingDepositCapacity)
    ? (defaultTokenAmount(remainingDepositCapacity)
      ? t('lib.pool.exceedsCapacity', { amount: remainingDepositCapacity, symbol: assetSymbol })
      : t('lib.pool.full', { symbol: assetSymbol }))
    : '';

  return {
    cooldownCompleteWaitingForClaims,
    cooldownTiming,
    cooldownReady,
    hasWithdrawAvailable,
    amountUnavailableReason: actionUnavailableReason
      || cooldownUnavailableReason
      || activeIncidentDepositReason
      || tokenValidationReason
      || capacityDepositReason
      || (withdrawing && estimatedAssets === null ? t('lib.pool.waitingForEstimate') : ''),
    withdrawUnavailableReason: actionUnavailableReason
      || (withdrawing && cooldownCompleteWaitingForClaims ? t('lib.pool.waitingForClaims') : '')
      || (!hasWithdrawAvailable ? t('lib.pool.noWithdrawal') : ''),
  };
}
