// Pure rules behind the transaction dialogs: amount defaults, parsing, and the
// ordered blocker checks that decide which inline warning an action shows.
// Kept free of React so every precedence rule is unit-tested directly.
import { tokenAmountExceedsBalance } from './tokenAmount.js';
import { parseUnits } from './viemLite.js';

const DECIMAL = /^(?:\d+\.?\d*|\.\d+)$/;

export function defaultTokenAmount(available) {
  const normalized = String(available ?? '').replace(/,/g, '').trim();
  return DECIMAL.test(normalized) && /[1-9]/.test(normalized) ? normalized : '';
}

export function cooldownReadyLabel(endsAtMilliseconds, nowMilliseconds) {
  const end = Number(endsAtMilliseconds);
  const remainingMinutes = Math.ceil((end - nowMilliseconds) / 60_000);
  if (!Number.isFinite(remainingMinutes) || end <= 0) return '';
  if (remainingMinutes <= 0) return 'ready now';
  if (remainingMinutes < 60) return `ready in ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
  const remainingHours = Math.ceil(remainingMinutes / 60);
  if (remainingHours < 24) return `ready in ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`;
  const remainingDays = Math.ceil(remainingHours / 24);
  return `ready in ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
}

export function parseTokenAmount(raw, decimals) {
  const normalized = String(raw ?? '').trim();
  if (!DECIMAL.test(normalized)) throw new Error('Please enter a valid number.');
  if ((normalized.split('.')[1] || '').length > decimals) throw new Error(`Use at most ${decimals} decimal places.`);
  try {
    return parseUnits(normalized, decimals);
  } catch {
    throw new Error('Please enter a valid number.');
  }
}

export function tokenAmountValidationReason(raw, available, token, action) {
  const normalized = String(raw ?? '').trim();
  if (!defaultTokenAmount(available)) return `You do not have any ${token} available to ${action}.`;
  if (!DECIMAL.test(normalized)) return `Enter a valid ${token} amount to ${action}.`;
  if (!/[1-9]/.test(normalized)) return `Enter a ${token} amount greater than zero to ${action}.`;
  return tokenAmountExceedsBalance(normalized, available)
    ? `The ${token} amount exceeds your available balance.`
    : '';
}

// Anything the user has to wait on spins. Terminal confirmations and errors
// are absent from this list and stay static.
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

const EXISTING_WITHDRAWAL_REQUEST_REASON = 'Please finish the existing withdrawal request before starting a new one.';

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
  const cooldownTiming = hasCooldownBalance && !cooldownCompleteWaitingForClaims
    ? cooldownReadyLabel(cooldownEndsAtMilliseconds, nowMilliseconds)
    : '';
  const hasWithdrawAvailable = !/^0(?:\.0+)?$/.test(String(availableForWithdraw ?? '0').replace(/,/g, ''));

  const actionUnavailableReason = submitUnavailableReason
    || (withdrawing && availableForCooldownAssets == null ? 'Withdrawal amounts are unavailable. Retry Data to continue.' : '')
    || (withdrawingEarnings && !hasEarnings ? 'No earnings to withdraw.' : '');
  const cooldownUnavailableReason = withdrawing && (hasCooldownBalance || hasWithdrawAvailable)
    ? EXISTING_WITHDRAWAL_REQUEST_REASON
    : '';
  const activeIncidentDepositReason = depositing && incidentActive
    ? `Deposits are temporarily unavailable while insurance incident #${activeIncidentId} is active. Try again after the incident is finalized.`
    : '';
  const tokenValidationReason = withdrawingEarnings
    ? ''
    : tokenAmountValidationReason(amount, available, inputToken, depositing ? 'deposit' : 'start cooldown');
  const capacityDepositReason = depositing
    && !capacityUncapped
    && !tokenValidationReason
    && tokenAmountExceedsBalance(amount, remainingDepositCapacity)
    ? (defaultTokenAmount(remainingDepositCapacity)
      ? `This deposit exceeds the cover pool's remaining capacity. You can deposit up to ${remainingDepositCapacity} ${assetSymbol}.`
      : `The cover pool is full and cannot accept additional ${assetSymbol} deposits.`)
    : '';

  return {
    cooldownCompleteWaitingForClaims,
    cooldownTiming,
    hasWithdrawAvailable,
    amountUnavailableReason: actionUnavailableReason
      || cooldownUnavailableReason
      || activeIncidentDepositReason
      || tokenValidationReason
      || capacityDepositReason
      || (withdrawing && estimatedAssets === null ? 'Waiting for a valid withdrawal estimate.' : ''),
    withdrawUnavailableReason: actionUnavailableReason
      || (withdrawing && cooldownCompleteWaitingForClaims ? 'Waiting for claims to finish' : '')
      || (!hasWithdrawAvailable ? 'No cover-pool withdrawal is available yet.' : ''),
  };
}
