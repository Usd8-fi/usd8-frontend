import { poolRedemptionQuote } from './lib/poolWithdrawal.js';
import WalletNoticeProvider, { NoticeMessage } from './components/WalletNotice.jsx';
import { redemptionQuote } from './lib/quote.js';
import { useDialogFocus } from './components/useDialogFocus.js';
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { formatUnits, parseUnits, zeroAddress } from 'viem';
import { useAccount, useChainId, useSwitchChain, useWriteContract } from 'wagmi';
import AvailabilityAction, { CONNECT_WALLET_REASON } from './components/AvailabilityAction.jsx';
import { COVERED_PROTOCOL_ROWS } from './components/CoveredProtocolsTable.jsx';
const FileClaimDialog = lazy(() => import('./components/FileClaimDialog.jsx'));
import USD8Landing from './components/USD8Landing.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { fetchLandingChainData, fetchLandingAnalytics, fetchScoreHistory, publicClientFor } from './lib/chainData.js';
import { mergeSnapshot } from './lib/mergeSnapshot.js';
import { cachedData } from './lib/dataCache.js';
import { poolWriteAbi, treasuryWriteAbi, claimWriteAbi } from './lib/writeAbis.js';
import { erc1155Abi, erc20Abi, registryBoosterAbi } from './lib/abis.js';
import { formatUsdWad, groupDecimalString, percentOfWad } from './lib/units.js';
import { decimalInputValue, displayAvailableBalance } from './lib/displayAvailableBalance.js';
import { useLivePoolEarnings } from './lib/livePoolEarnings.js';
import { fetchMorphoVault } from './lib/morphoApi.js';
import { getNetwork, getProtocolNetwork } from './lib/networkConfig.js';
import { claimApiConfigured, matchesSettlementContext } from './lib/claimContext.js';
const prepareIncidentOpen = (...args) => import('./lib/claimApi.js').then(api => api.prepareIncidentOpen(...args));
const prepareSettlement = (...args) => import('./lib/claimApi.js').then(api => api.prepareSettlement(...args));
import { claimLifecycle } from './lib/claimLifecycle.js';
import { fetchInsuranceScore } from './lib/scoreApi.js';
import { tokenAmountExceedsBalance } from './lib/tokenAmount.js';
import { walletConnectorConfigured } from './lib/walletConnector.js';

function cachedInsuranceScore(account, { chainId, signal, fresh = false, refresh = false }) {
  return cachedData(['insurance-score', chainId, account.toLowerCase()], ({ signal: querySignal }) => fetchInsuranceScore(account, { chainId, signal: querySignal, ...(refresh || fresh ? { refresh: true } : {}) }), { signal, staleTime: fresh || refresh ? 0 : 60_000 });
}

const EMPTY_CHAIN_DATA = {
  activeIncidentId: '0',
  incident: null,
  claim: null,
  insurance: { tokens: {} },
  scoreBalances: null,
  scoreRatesPerSecond: null,
  scoreBalanceChangeTimestampMilliseconds: null,
  scoreBalancesSnapshotTimestampMilliseconds: 0,
  balances: {
    usdc: '0', usd8: '0', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0', insuredTokens: {},
  },
  pools: [],
};
const EMPTY_SAVINGS_VAULT = { balance: '—', apy: '—' };
const CLAIM_TOKEN_ROWS = COVERED_PROTOCOL_ROWS;
const EMPTY_SCORE = {
  grossEarnedScore: '0',
  grossScorePerSecond: '0',
  availableScore: '0',
  maturingScorePerSecond: '0',
  usd8Score: '0',
  usd8ScorePerSecond: '0',
  sUsd8Score: '0',
  sUsd8ScorePerSecond: '0',
};
const WALLET_CONNECT_UNAVAILABLE_REASON = 'Wallet connection is unavailable until VITE_REOWN_PROJECT_ID is configured.';
const DOCS_BASE_URL = './docs/';

function defaultTokenAmount(available) {
  const normalized = String(available ?? '').replace(/,/g, '').trim();
  return /^(?:\d+\.?\d*|\.\d+)$/.test(normalized) && /[1-9]/.test(normalized)
    ? normalized
    : '';
}

function cooldownReadyLabel(endsAtMilliseconds, nowMilliseconds) {
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

function parseTokenAmount(raw, decimals) {
  const normalized = String(raw ?? '').trim();
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) {
    throw new Error('Please enter a valid number.');
  }
  if ((normalized.split('.')[1] || '').length > decimals) throw new Error(`Use at most ${decimals} decimal places.`);
  try {
    return parseUnits(normalized, decimals);
  } catch {
    throw new Error('Please enter a valid number.');
  }
}

function tokenAmountValidationReason(raw, available, token, action) {
  const normalized = String(raw ?? '').trim();
  if (!defaultTokenAmount(available)) return `You do not have any ${token} available to ${action}.`;
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return `Enter a valid ${token} amount to ${action}.`;
  if (!/[1-9]/.test(normalized)) return `Enter a ${token} amount greater than zero to ${action}.`;
  return tokenAmountExceedsBalance(normalized, available)
    ? `The ${token} amount exceeds your available balance.`
    : '';
}

function formattedPayoutAmount(amount, decimals) {
  const displayedDecimals = Math.min(decimals, 4);
  const discardedScale = 10n ** BigInt(decimals - displayedDecimals);
  const rounded = discardedScale === 1n
    ? amount
    : (amount + discardedScale / 2n) / discardedScale;
  const displayedScale = 10n ** BigInt(displayedDecimals);
  const whole = rounded / displayedScale;
  const fraction = String(rounded % displayedScale)
    .padStart(displayedDecimals, '0')
    .replace(/0+$/, '');
  return fraction ? `${groupDecimalString(whole)}.${fraction}` : groupDecimalString(whole);
}

export function settlementPayoutDetails(amounts, poolOrder, payoutAssets = {}) {
  return amounts.map((amount, index) => {
    const asset = poolOrder[index];
    const metadata = payoutAssets[asset?.toLowerCase()];
    return {
      amount: metadata
        ? formattedPayoutAmount(amount, metadata.decimals)
        : groupDecimalString(amount),
      symbol: metadata?.symbol || `base units of ${asset || 'unknown asset'}`,
      usd: '',
    };
  });
}

function normalizedAddressOrder(addresses) {
  return Array.isArray(addresses) ? addresses.map((address) => String(address).toLowerCase()) : [];
}

export function matchesSettlementTopology(settlement, incident) {
  const settlementPools = normalizedAddressOrder(settlement?.poolAddrs);
  const settlementAssets = normalizedAddressOrder(settlement?.poolOrder);
  const incidentPools = normalizedAddressOrder(incident?.poolAddrs);
  const incidentAssets = normalizedAddressOrder(incident?.poolOrder);
  return incidentPools.length > 0
    && incidentAssets.length === incidentPools.length
    && settlementPools.length === incidentPools.length
    && settlementAssets.length === incidentAssets.length
    && settlementPools.every((address, index) => address === incidentPools[index])
    && settlementAssets.every((address, index) => address === incidentAssets[index]);
}

function scoreWithTokenBreakdown(score, contracts) {
  const tokenScores = Array.isArray(score?.tokenScores) ? score.tokenScores : [];
  const byToken = new Map(tokenScores.map((item) => [item.token.toLowerCase(), item]));
  const usd8 = byToken.get(contracts?.usd8?.toLowerCase());
  const sUsd8 = byToken.get(contracts?.savingsVault?.toLowerCase());
  return {
    ...score,
    usd8Score: usd8?.grossEarnedScore || '0',
    usd8ScorePerSecond: usd8?.grossScorePerSecond || '0',
    sUsd8Score: sUsd8?.grossEarnedScore || '0',
    sUsd8ScorePerSecond: sUsd8?.grossScorePerSecond || '0',
  };
}

function scoredTokenBalancesChanged(score, scoreBalances, contracts) {
  if (!scoreBalances || !Array.isArray(score?.tokenScores)) return false;
  const byToken = new Map(score.tokenScores.map((item) => [item.token.toLowerCase(), item.balance]));
  return [
    [contracts?.usd8, scoreBalances.usd8],
    [contracts?.savingsVault, scoreBalances.savings],
  ].some(([token, currentBalance]) => {
    const snapshotBalance = token ? byToken.get(token.toLowerCase()) : undefined;
    return typeof snapshotBalance === 'string'
      && typeof currentBalance === 'string'
      && BigInt(snapshotBalance) !== BigInt(currentBalance);
  });
}

// Accepting a payout spends score without moving any token balance, so the
// snapshot also has to be re-fetched when onchain scoreSpent moves past it.
function scoreSpentChanged(score, onchainScoreSpent) {
  if (typeof onchainScoreSpent !== 'string' || typeof score?.scoreSpent !== 'string') return false;
  try {
    return parseUnits(score.scoreSpent, 18) !== BigInt(onchainScoreSpent);
  } catch {
    return false;
  }
}

function scoreSnapshotStale(score, chainData, contracts) {
  return scoredTokenBalancesChanged(score, chainData?.scoreBalances, contracts)
    || scoreSpentChanged(score, chainData?.scoreSpent);
}

function scoreBalanceRefreshKey(score, chainData, contracts, chainId, address) {
  if (!scoreSnapshotStale(score, chainData, contracts)) return '';
  const tokenBalances = (score.tokenScores || []).map((item) => `${item.token}:${item.balance}`).join('|');
  return [
    chainId,
    address.toLowerCase(),
    tokenBalances,
    chainData.scoreBalances?.usd8,
    chainData.scoreBalances?.savings,
    chainData.scoreSpent,
  ].join(':');
}

function advanceScoreValue(value, rate, elapsedMilliseconds) {
  const elapsed = BigInt(Math.max(0, Math.floor(elapsedMilliseconds)));
  return formatUnits(
    parseUnits(value || '0', 18) + parseUnits(rate || '0', 18) * elapsed / 1_000n,
    18,
  );
}

function scoreWithCurrentBalanceRates(
  score,
  rates,
  balanceChangeTimestamps,
  snapshotTimestampMilliseconds,
) {
  if (!score) return score;
  const usd8Rate = rates?.usd8 || '0';
  const savingsRate = rates?.savings || '0';
  if (!Number.isSafeInteger(snapshotTimestampMilliseconds)
    || snapshotTimestampMilliseconds <= 0) {
    return {
      ...score,
      snapshotTimestampMilliseconds: Date.now(),
      grossScorePerSecond: formatUnits(parseUnits(usd8Rate, 18) + parseUnits(savingsRate, 18), 18),
      usd8ScorePerSecond: usd8Rate,
      sUsd8ScorePerSecond: savingsRate,
    };
  }
  const authoritativeTimestampMilliseconds = Number(
    score.snapshotTimestampMilliseconds ?? Number(score.snapshotTimestamp || 0) * 1_000,
  );
  const tokenScore = (token, baseValue, oldRate, currentRate) => {
    const balanceChangeTimestamp = Number(
      balanceChangeTimestamps?.[token] || snapshotTimestampMilliseconds,
    );
    if (!Number.isSafeInteger(authoritativeTimestampMilliseconds)
      || authoritativeTimestampMilliseconds <= 0) {
      return advanceScoreValue(
        baseValue,
        currentRate,
        snapshotTimestampMilliseconds - balanceChangeTimestamp,
      );
    }
    const oldRateEnd = Math.min(
      snapshotTimestampMilliseconds,
      Math.max(authoritativeTimestampMilliseconds, balanceChangeTimestamp),
    );
    const afterOldRate = advanceScoreValue(
      baseValue,
      oldRate,
      oldRateEnd - authoritativeTimestampMilliseconds,
    );
    return advanceScoreValue(
      afterOldRate,
      currentRate,
      snapshotTimestampMilliseconds - Math.max(authoritativeTimestampMilliseconds, balanceChangeTimestamp),
    );
  };
  const usd8Score = tokenScore('usd8', score.usd8Score, score.usd8ScorePerSecond, usd8Rate);
  const savingsScore = tokenScore('savings', score.sUsd8Score, score.sUsd8ScorePerSecond, savingsRate);
  return {
    ...score,
    snapshotTimestampMilliseconds,
    grossEarnedScore: formatUnits(parseUnits(usd8Score, 18) + parseUnits(savingsScore, 18), 18),
    grossScorePerSecond: formatUnits(parseUnits(usd8Rate, 18) + parseUnits(savingsRate, 18), 18),
    usd8Score,
    usd8ScorePerSecond: usd8Rate,
    sUsd8Score: savingsScore,
    sUsd8ScorePerSecond: savingsRate,
  };
}

function hasCurrentBalanceScoreRate(rates) {
  return ['usd8', 'savings'].some((token) => {
    try {
      return parseUnits(rates?.[token] || '0', 18) > 0n;
    } catch {
      return false;
    }
  });
}

function DialogCloseButton({ label, onClose }) {
  return (
    <button className="app-dialog-close" type="button" aria-label={label} onClick={onClose}>×</button>
  );
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

function isWaitingStatus(message) {
  return message.includes('in your wallet.')
    || WAITING_STATUS_PREFIXES.some((prefix) => message.startsWith(prefix));
}

function TransactionStatus({ message, failed = false, busy = false }) {
  if (!message) return null;
  return <NoticeMessage message={message} tone={failed ? 'error' : 'status'} busy={busy && !failed} label="Transaction status" />;
}

function Usd8ActionDialog({ busy = false, quoteRate, mode, usdcBalance, usd8Balance, statusMessage, statusFailed = false, onInputChange, onModeChange, onClose, onSubmit, submitUnavailableReason = '' }) {
  const minting = mode === 'mint';
  const inputToken = minting ? 'USDC' : 'USD8';
  const outputToken = minting ? 'USD8' : 'USDC';
  const availableBalance = minting ? usdcBalance : usd8Balance;
  const [amount, setAmount] = useState(() => defaultTokenAmount(availableBalance));
  const amountUnavailableReason = submitUnavailableReason
    || tokenAmountValidationReason(amount, availableBalance, inputToken, minting ? 'mint USD8' : 'redeem USD8')
    || (!minting && redemptionQuote(amount, quoteRate) === null ? 'Waiting for a valid redemption quote.' : '');

  useEffect(() => {
    setAmount(defaultTokenAmount(availableBalance));
  }, [mode]);

  const dialogRef = useDialogFocus(onClose);

  return (
    <div className="usd8-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="usd8-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Mint or redeem USD8">
        <DialogCloseButton label="Close mint and redeem" onClose={onClose} />
        <nav className="usd8-dialog-tabs" aria-label="USD8 action">
          <button
            className={minting ? 'usd8-dialog-tab usd8-dialog-tab--active' : 'usd8-dialog-tab'}
            type="button"
            onClick={() => onModeChange('mint')}
          >
            Mint USD8
          </button>
          <button
            className={!minting ? 'usd8-dialog-tab usd8-dialog-tab--active' : 'usd8-dialog-tab'}
            type="button"
            onClick={() => onModeChange('redeem')}
          >
            Redeem USD8
          </button>
        </nav>

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
              <output aria-label={`${outputToken} output`}>{minting ? amount || '0' : redemptionQuote(amount, quoteRate) ?? '—'}</output>
            </div>
          </div>

          <div className="usd8-dialog-submit-row">
            <AvailabilityAction
              className="usd8-dialog-submit"
              type="submit"
              unavailableReason={amountUnavailableReason}
              warningResetKey={`${mode}:${amount}`}
            >
              {mode}
            </AvailabilityAction>
            <TransactionStatus message={statusMessage} failed={statusFailed} busy={busy} />
          </div>
        </form>
      </section>
    </div>
  );
}

export function PoolActionDialog({
  busy = false,
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
  earnings,
  hasEarnings,
  statusMessage,
  statusFailed = false,
  statusAction,
  onInputChange,
  onModeChange,
  onClose,
  onSubmit,
  submitUnavailableReason = '',
}) {
  const withdrawingEarnings = mode === 'claimReward';
  const depositing = mode === 'deposit';
  const withdrawing = mode === 'withdraw';
  const inputToken = depositing ? assetSymbol : shareSymbol;
  const available = depositing ? coverAssetBalance : availableForCooldown ?? poolShareBalance;

  const [amount, setAmount] = useState(() => defaultTokenAmount(available));
  const amountEdited = useRef(false);
  const estimatedAssets = poolRedemptionQuote(amount, withdrawalQuote, shareDecimals);
  const estimatedOutput = estimatedAssets === null ? '—'
    : parseUnits(estimatedAssets, 18) > 0n && parseUnits(estimatedAssets, 18) < 1_000_000_000_000n ? '<0.000001'
    : groupDecimalString(estimatedAssets, { decimals: 6 });
  const withdrawAvailable = availableForWithdraw ?? '0';
  const cooldownBalance = inCooldown ?? '0';
  const [currentTimeMilliseconds, setCurrentTimeMilliseconds] = useState(Date.now());
  const incidentActive = String(activeIncidentId || '0') !== '0';
  const cooldownElapsed = Number(cooldownEndsAtMilliseconds) > 0
    && currentTimeMilliseconds >= Number(cooldownEndsAtMilliseconds);
  const cooldownCompleteWaitingForClaims = incidentActive
    && cooldownElapsed
    && Boolean(defaultTokenAmount(cooldownBalance));
  const cooldownTiming = defaultTokenAmount(cooldownBalance)
    && !cooldownCompleteWaitingForClaims
    ? cooldownReadyLabel(cooldownEndsAtMilliseconds, currentTimeMilliseconds)
    : '';
  const displayedWithdrawAvailable = (cooldownCompleteWaitingForClaims ? inCooldownAssets : availableForWithdrawAssets) ?? '—';
  const displayedCooldownBalance = cooldownCompleteWaitingForClaims ? '0' : inCooldownAssets ?? '—';
  const hasWithdrawAvailable = !/^0(?:\.0+)?$/.test(String(withdrawAvailable).replace(/,/g, ''));
  const existingWithdrawalRequestReason = 'Please finish the existing withdrawal request before starting a new one.';
  const cooldownUnavailableReason = withdrawing && defaultTokenAmount(cooldownBalance)
    ? existingWithdrawalRequestReason
    : (withdrawing && hasWithdrawAvailable
      ? existingWithdrawalRequestReason
      : '');
  const actionUnavailableReason = submitUnavailableReason
    || (withdrawing && availableForCooldownAssets == null ? 'Withdrawal amounts are unavailable. Retry data to continue.' : '')
    || (withdrawingEarnings && !hasEarnings ? 'No earnings to withdraw.' : '');
  const tokenValidationReason = !withdrawingEarnings
    ? tokenAmountValidationReason(amount, available, inputToken, depositing ? 'deposit' : 'start cooldown')
    : '';
  const activeIncidentDepositReason = depositing && incidentActive
    ? `Deposits are temporarily unavailable while insurance incident #${activeIncidentId} is active. Try again after the incident is finalized.`
    : '';
  const activeIncidentWithdrawReason = withdrawing
    && cooldownCompleteWaitingForClaims
    ? 'Waiting for claims to finish'
    : '';
  const capacityDepositReason = depositing
    && !capacityUncapped
    && !tokenValidationReason
    && tokenAmountExceedsBalance(amount, remainingDepositCapacity)
    ? (defaultTokenAmount(remainingDepositCapacity)
      ? `This deposit exceeds the cover pool's remaining capacity. You can deposit up to ${remainingDepositCapacity} ${assetSymbol}.`
      : `The cover pool is full and cannot accept additional ${assetSymbol} deposits.`)
    : '';
  const amountUnavailableReason = actionUnavailableReason
    || cooldownUnavailableReason
    || activeIncidentDepositReason
    || tokenValidationReason
    || capacityDepositReason
    || (withdrawing && estimatedAssets === null ? 'Waiting for a valid withdrawal estimate.' : '');

  useEffect(() => {
    amountEdited.current = false;
  }, [mode]);

  useEffect(() => {
    if (!amountEdited.current) setAmount(defaultTokenAmount(available));
  }, [available, mode]);

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
      <section className="usd8-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Manage ${poolName}`}>
        <DialogCloseButton label="Close cover pool actions" onClose={onClose} />
        <nav className="usd8-dialog-tabs usd8-dialog-tabs--pool" aria-label={`${poolName} action`}>
          <button
            className={mode === 'deposit' ? 'usd8-dialog-tab usd8-dialog-tab--active' : 'usd8-dialog-tab'}
            type="button"
            onClick={() => onModeChange('deposit')}
          >
            Deposit
          </button>
          <button
            className={mode === 'withdraw' ? 'usd8-dialog-tab usd8-dialog-tab--active' : 'usd8-dialog-tab'}
            type="button"
            onClick={() => onModeChange('withdraw')}
          >
            Withdraw
          </button>
          <button
            className={withdrawingEarnings ? 'usd8-dialog-tab usd8-dialog-tab--active' : 'usd8-dialog-tab'}
            type="button"
            onClick={() => onModeChange('claimReward')}
          >
            Withdraw earnings
          </button>
        </nav>

        <form className="usd8-dialog-form" onSubmit={(event) => {
          event.preventDefault();
          if (!amountUnavailableReason && !withdrawing) onSubmit(mode, amount);
        }}>
          {withdrawingEarnings ? (
            <div className="usd8-dialog-flow usd8-dialog-flow--single">
              <div className="usd8-dialog-output">
                <span>USD8 earnings</span>
                <output aria-label="USD8 earnings">{earnings}</output>
                <small>{displayAvailableBalance(earnings)} USD8 available to withdraw</small>
              </div>
            </div>
          ) : (
            <div className={`usd8-dialog-flow${withdrawing ? ' usd8-dialog-flow--withdraw' : ' usd8-dialog-flow--single'}`}>
              <label className="usd8-dialog-amount">
                <span>{withdrawing ? 'Pool shares to redeem' : inputToken}</span>
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
                    {displayAvailableBalance(available)} shares available. 7-day cooldown if no pending claims. Otherwise after the claims are all finalized.{' '}
                    <a href={`${DOCS_BASE_URL}cover-pools.html`}>Learn More</a>.
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
                  <span>Estimated {assetSymbol} received</span>
                  <output aria-label={`Estimated ${assetSymbol} received`} title={estimatedAssets ?? undefined}>{estimatedOutput}</output>
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
                  start cooldown
                </AvailabilityAction>
                {statusAction === 'startCooldown' ? <TransactionStatus message={statusMessage} failed={statusFailed} busy={busy} /> : null}
                <small className="usd8-dialog-withdraw-balances">
                  {displayAvailableBalance(displayedWithdrawAvailable)} {assetSymbol} {exitSettled ? 'ready to withdraw' : 'estimated for withdrawal'}{cooldownCompleteWaitingForClaims ? ' after claims are finalized' : ''}, {' '}
                  {displayAvailableBalance(displayedCooldownBalance)} {assetSymbol} in cooldown{cooldownTiming ? ` — ${cooldownTiming}` : ''}.
                </small>
                <AvailabilityAction
                  className="usd8-dialog-submit"
                  type="button"
                  onClick={() => onSubmit('withdraw', '')}
                  unavailableReason={actionUnavailableReason
                    || activeIncidentWithdrawReason
                    || (!hasWithdrawAvailable ? 'No cover-pool withdrawal is available yet.' : '')}
                >
                  Withdraw
                </AvailabilityAction>
                {statusAction === 'withdraw' ? <TransactionStatus message={statusMessage} failed={statusFailed} busy={busy} /> : null}
              </>
            ) : (
              <AvailabilityAction
                className="usd8-dialog-submit"
                type="submit"
                unavailableReason={amountUnavailableReason}
                warningResetKey={`${mode}:${amount}`}
              >
                {withdrawingEarnings ? 'withdraw earnings' : mode}
              </AvailabilityAction>
            )}
            {!withdrawing ? <TransactionStatus message={statusMessage} failed={statusFailed} busy={busy} /> : null}
          </div>
        </form>
      </section>
    </div>
  );
}

export default function App({ autoConnect = false }) {
  const { address = '', isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { open } = useAppKit();
  const connected = isConnected && Boolean(address);
  const activeNetwork = getNetwork(chainId);
  const protocolNetwork = getProtocolNetwork(chainId);
  const walletScopeKey = [
    chainId,
    connected ? address.toLowerCase() : zeroAddress,
    protocolNetwork?.contracts.defiInsurance?.toLowerCase() || '',
  ].join(':');
  const protocolUnavailableReason = connected && !protocolNetwork
    ? `USD8 is not deployed on ${activeNetwork?.name || 'this network'}.`
    : '';
  const [connecting, setConnecting] = useState(false);
  const [quoteRate, setQuoteRate] = useState(null);
  useEffect(() => { if (autoConnect && !connected) open({ view: 'Connect' }); }, [autoConnect]);
  const [score, setScore] = useState(null);
  const [scoreStatus, setScoreStatus] = useState('idle');
  const [scoreError, setScoreError] = useState('');
  const [scoreRetry, setScoreRetry] = useState(0);
  const scoreRetryForcesRefresh = useRef(false);
  const scoreRefreshAttempt = useRef('');
  const [scoreRefreshCompletedKey, setScoreRefreshCompletedKey] = useState('');
  const [chainData, setChainData] = useState(EMPTY_CHAIN_DATA);
  const [chainDataStatus, setChainDataStatus] = useState('idle');
  const [dataError, setDataError] = useState('');
  const [operationBusy, setOperationBusy] = useState(false);
  const operation = useRef(null);
  const [transaction, setTransaction] = useState(null);
  const dataController = useRef(null);
  const enrichmentController = useRef(null);
  const foregroundRefreshing = useRef(false);
  const chainDataRequestGeneration = useRef(0);
  const [savingsVault, setSavingsVault] = useState(EMPTY_SAVINGS_VAULT);
  const [usd8Action, setUsd8Action] = useState(null);
  const [usd8Status, setUsd8StatusState] = useState('');
  const [usd8StatusFailed, setUsd8StatusFailedState] = useState(false);
  const [poolAction, setPoolAction] = useState(null);
  const [poolActionId, setPoolActionId] = useState('');
  const [poolStatus, setPoolStatusState] = useState('');
  const [poolStatusFailed, setPoolStatusFailedState] = useState(false);
  const [poolStatusAction, setPoolStatusAction] = useState('');
  const [claimSelection, setClaimToken] = useState(null);
  const claimToken = claimSelection?.walletScopeKey === walletScopeKey
    ? claimSelection.token
    : null;
  const [claimStatus, setClaimStatus] = useState('');
  const [claimStatusIsWarning, setClaimStatusIsWarning] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSettlement, setClaimSettlement] = useState(null);
  const claimAbortController = useRef(null);
  const walletScopeRef = useRef(walletScopeKey);
  walletScopeRef.current = walletScopeKey;
  function setUsd8Status(value) { if (walletScopeRef.current === walletScopeKey) setUsd8StatusState(value); }
  function setUsd8StatusFailed(value) { if (walletScopeRef.current === walletScopeKey) setUsd8StatusFailedState(value); }
  function setPoolStatus(value) { if (walletScopeRef.current === walletScopeKey) setPoolStatusState(value); }
  function setPoolStatusFailed(value) { if (walletScopeRef.current === walletScopeKey) setPoolStatusFailedState(value); }
  const claimContextKey = [
    walletScopeKey,
    chainData.incident?.id || '',
    chainData.claim?.id || '',
    chainData.incident?.root?.toLowerCase() || '',
    normalizedAddressOrder(chainData.incident?.poolAddrs).join(','),
    normalizedAddressOrder(chainData.incident?.poolOrder).join(','),
  ].join(':');
  const claimContextRef = useRef(claimContextKey);
  claimContextRef.current = claimContextKey;

  useLayoutEffect(() => {
    chainDataRequestGeneration.current += 1;
    dataController.current?.abort();
    enrichmentController.current?.abort();
    operation.current = null;
    setOperationBusy(false);
    setTransaction(null);
    setQuoteRate(null);
    claimAbortController.current?.abort();
    claimAbortController.current = null;
    setScore(null);
    setScoreError('');
    setScoreStatus(connected && activeNetwork?.scoreAvailable ? 'loading' : 'idle');
    setScoreRefreshCompletedKey('');
    setChainData(EMPTY_CHAIN_DATA);
    setChainDataStatus(protocolNetwork ? 'loading' : 'idle');
    setDataError('');
    setClaimToken(null);
    setClaimSettlement(null);
    setClaimStatus('');
    setClaimStatusIsWarning(false);
    setClaimSubmitting(false);
    setUsd8Action(null);
    setUsd8Status('');
    setPoolAction(null);
    setPoolStatus('');
    setPoolStatusAction('');
  }, [walletScopeKey]);

  useEffect(() => {
    const controller = new AbortController();
    cachedData(['morpho-vault'], ({ signal }) => fetchMorphoVault({ signal }), { signal: controller.signal, staleTime: 300_000 })
      .then(setSavingsVault)
      .catch((error) => {
        if (error.name !== 'AbortError') setSavingsVault(EMPTY_SAVINGS_VAULT);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    chainDataRequestGeneration.current += 1;
    const requestedWalletScope = walletScopeKey;
    if (!activeNetwork) {
      setScore(null);
      setScoreStatus('idle');
      setScoreRefreshCompletedKey('');
      setChainData(EMPTY_CHAIN_DATA);
      setChainDataStatus('idle');
      return undefined;
    }

    if (protocolNetwork) loadChainData(walletScopeKey).catch(() => {});
    else { setChainData(EMPTY_CHAIN_DATA); setChainDataStatus('idle'); }
  }, [address, chainId, connected]);

  useEffect(() => {
    if (!connected || !activeNetwork?.scoreAvailable) return;
    const controller = new AbortController();
    const requestedWalletScope = walletScopeKey;
    setScoreStatus('loading');
    setScoreError('');
    cachedInsuranceScore(address, { chainId: activeNetwork.id, signal: controller.signal, refresh: scoreRetryForcesRefresh.current })
      .then(nextScore => {
        if (controller.signal.aborted || walletScopeRef.current !== requestedWalletScope) return;
        setScore(scoreWithTokenBreakdown(nextScore, activeNetwork.contracts));
        setScoreStatus('ready');
      })
      .catch(error => {
        if (controller.signal.aborted || walletScopeRef.current !== requestedWalletScope || error.name === 'AbortError') return;
        setScoreStatus('error');
        setScoreError('Insurance Score could not be loaded. Retry to get your available score.');
      });
    return () => controller.abort();
  }, [walletScopeKey, scoreRetry]);

  useEffect(() => {
    if (scoreStatus !== 'error') return;
    // Automatic recovery must reuse the daily snapshot: forcing a refresh re-runs the
    // multi-second cold replay that failed in the first place.
    const retry = () => {
      if (document.hidden) return;
      scoreRetryForcesRefresh.current = false;
      setScoreRetry(value => value + 1);
    };
    const timer = setInterval(retry, 30_000);
    window.addEventListener('online', retry);
    return () => { clearInterval(timer); window.removeEventListener('online', retry); };
  }, [scoreStatus]);

  useEffect(() => {
    const root = chainData.incident?.root;
    if (!claimToken || !chainData.claim || !protocolNetwork || !root || claimStatusIsWarning
        || root === `0x${'00'.repeat(32)}`
        || (claimSettlement?.contextKey === claimContextKey
          && matchesSettlementContext(claimSettlement, chainData.incident.id, root)
          && matchesSettlementTopology(claimSettlement.value, chainData.incident))) return undefined;
    const requestedContextKey = claimContextKey;
    const controller = new AbortController();
    setClaimStatusIsWarning(false);
    setClaimStatus('Loading proof-backed payout details.');
    prepareSettlement(chainData.incident.id, {
      chainId: protocolNetwork.id,
      registry: protocolNetwork.contracts.registry,
      defiInsurance: protocolNetwork.contracts.defiInsurance,
      expectedRoot: root,
      expectedPoolAddrs: chainData.incident.poolAddrs,
      expectedPoolOrder: chainData.incident.poolOrder,
      signal: controller.signal,
    }).then((value) => {
      if (controller.signal.aborted || claimContextRef.current !== requestedContextKey) return;
      setClaimSettlement({
        contextKey: requestedContextKey,
        incidentId: chainData.incident.id,
        claimId: chainData.claim.id,
        root,
        value,
      });
      setClaimStatus('');
    }).catch((error) => {
      if (claimContextRef.current === requestedContextKey && error?.name !== 'AbortError') {
        setClaimStatusIsWarning(true);
        setClaimStatus(error?.message || 'Payout details are temporarily unavailable.');
      }
    });
    return () => controller.abort();
  }, [claimToken, claimContextKey, protocolNetwork, claimSettlement?.contextKey, claimStatusIsWarning]);

  useEffect(() => {
    if (!connected || !activeNetwork?.scoreAvailable || scoreStatus !== 'ready') {
      scoreRefreshAttempt.current = '';
      setScoreRefreshCompletedKey('');
      return undefined;
    }
    const refreshKey = scoreBalanceRefreshKey(
      score,
      chainData,
      activeNetwork.contracts,
      activeNetwork.id,
      address,
    );
    if (!refreshKey) {
      scoreRefreshAttempt.current = '';
      setScoreRefreshCompletedKey('');
      return undefined;
    }
    if (scoreRefreshAttempt.current === refreshKey) return undefined;
    scoreRefreshAttempt.current = refreshKey;
    setScoreRefreshCompletedKey('');

    const requestedWalletScope = walletScopeKey;
    const controller = new AbortController();
    cachedInsuranceScore(address, {
      chainId: activeNetwork.id,
      refresh: true,
      signal: controller.signal,
    })
      .then((nextScore) => {
        if (walletScopeRef.current !== requestedWalletScope
            || scoreRefreshAttempt.current !== refreshKey) return;
        setScore(scoreWithTokenBreakdown(nextScore, activeNetwork.contracts));
        setScoreError('');
      })
      .catch((error) => {
        if (walletScopeRef.current === requestedWalletScope
            && scoreRefreshAttempt.current === refreshKey
            && error.name !== 'AbortError') {
          setScoreError('Insurance Score could not be refreshed. Retry to update your available score.');
        }
      })
      .finally(() => {
        if (walletScopeRef.current === requestedWalletScope
            && scoreRefreshAttempt.current === refreshKey) {
          setScoreRefreshCompletedKey(refreshKey);
        }
      });
    return () => controller.abort();
  }, [address, connected, activeNetwork, chainData.scoreBalances, score, scoreStatus, walletScopeKey]);

  async function connect() {
    if (!walletConnectorConfigured) return;
    setConnecting(true);
    try {
      await open({ view: 'Connect' });
    } catch (error) {
      setDataError(error?.shortMessage || error?.message || 'Wallet connection failed.');
    } finally {
      setConnecting(false);
    }
  }

  function assertCurrentWalletScope(expectedWalletScope = walletScopeKey) {
    if (walletScopeRef.current === expectedWalletScope) return;
    const error = new Error('Wallet account or network changed. Review the current state and try again.');
    error.name = 'WalletScopeChangedError';
    throw error;
  }

  async function runOperation(run) {
    if (operation.current) return;
    const id = Symbol('operation');
    operation.current = id;
    setTransaction(null);
    setUsd8Status('');
    setUsd8StatusFailed(false);
    setPoolStatus('');
    setPoolStatusFailed(false);
    setClaimStatus('');
    setClaimStatusIsWarning(false);
    const controller = new AbortController();
    claimAbortController.current = controller;
    setOperationBusy(true);
    try { return await run(); }
    finally {
      if (claimAbortController.current === controller) claimAbortController.current = null;
      if (operation.current === id) { operation.current = null; setOperationBusy(false); }
    }
  }

  async function loadChainData(expectedWalletScope = walletScopeKey, options = {}) {
    assertCurrentWalletScope(expectedWalletScope);
    if (!protocolNetwork) return;
    const generation = ++chainDataRequestGeneration.current;
    dataController.current?.abort();
    const controller = new AbortController();
    dataController.current = controller;
    const current = () => !controller.signal.aborted && generation === chainDataRequestGeneration.current
      && walletScopeRef.current === expectedWalletScope;
    setChainDataStatus('loading');
    let enrichmentStarted = false;
    const apply = (next, partial = false) => {
      if (!current()) return;
      setChainData(previous => mergeSnapshot(previous, partial && !next.incidentReady
        ? { ...next, incident: previous.incident, claim: previous.claim } : next));
      setChainDataStatus(partial ? 'partial' : 'ready');
      const failures = Object.keys(next.resourceErrors || {});
      setDataError(failures.length ? 'Some balances or protocol data could not be updated. Retry to update it.' : '');
    };
    try {
      const next = await fetchLandingChainData(connected ? address : zeroAddress, protocolNetwork.id, {
        ...options, signal: controller.signal, onPartial: partial => {
          apply(partial, true);
          if (enrichmentStarted) return;
          enrichmentStarted = true;
          if (enrichmentController.current) return;
          const enrichment = new AbortController();
          enrichmentController.current = enrichment;
          const valid = () => walletScopeRef.current === expectedWalletScope && !enrichment.signal.aborted;
          const analyticsRequest = fetchLandingAnalytics(partial, address, protocolNetwork.id, { signal: enrichment.signal }).then(extra => {
            if (valid()) setChainData(previous => ({ ...previous, pools: previous.pools.map(pool => ({ ...pool, ...extra.pools.find(p => p.id === pool.id) })) }));
          }).catch(() => {});
          const historyRequest = fetchScoreHistory(partial, connected ? address : zeroAddress, protocolNetwork.id, { signal: enrichment.signal }).then(timestamps => {
            if (valid() && timestamps) setChainData(previous => previous.scoreBalances?.usd8 === partial.scoreBalances?.usd8 && previous.scoreBalances?.savings === partial.scoreBalances?.savings ? { ...previous, scoreBalanceChangeTimestampMilliseconds: timestamps } : previous);
          }).catch(() => {});
          Promise.allSettled([analyticsRequest, historyRequest]).then(() => {
            if (enrichmentController.current === enrichment) enrichmentController.current = null;
          });
        },
      });
      apply(next);
      return current() ? next : undefined;
    } catch (error) {
      if (current()) {
        setChainDataStatus('error');
        setChainData(previous => previous.updatedAt ? previous : { ...previous, balances: { usdc: '—', usd8: '—', savings: '—', savingsAssets: '—', insuredTokens: {} } });
        setDataError(error?.shortMessage || error?.message || 'Could not refresh onchain data.');
      }
      throw error;
    }
  }

  function refreshChainData(expectedWalletScope = walletScopeKey, options = {}) {
    return loadChainData(expectedWalletScope, { refresh: true, ...options });
  }

  useEffect(() => {
    const refresh = () => {
      if (document.hidden || foregroundRefreshing.current || operation.current || !protocolNetwork) return;
      foregroundRefreshing.current = true;
      loadChainData(walletScopeKey).catch(() => {}).finally(() => { foregroundRefreshing.current = false; });
    };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
      document.removeEventListener('visibilitychange', refresh);
      dataController.current?.abort();
      enrichmentController.current?.abort();
    };
  }, [walletScopeKey]);

  // Pools come from config, so their cards render immediately; the chain read
  // only fills in the numbers.
  const displayedPools = chainData.pools?.length
    ? chainData.pools
    : (protocolNetwork?.contracts.coverPools || []).map((pool) => ({
      ...pool,
      assetBalance: '0',
      apy: null,
      tvl: null,
      capacityPercent: null,
      capacityUncapped: false,
      deposit: '0',
      earnings: '0',
      hasEarnings: false,
      shareDecimals: 21,
    }));
  const activePool = chainData.pools?.find((pool) => pool.id === poolActionId)
    || chainData.pools?.[0]
    || null;

  const livePoolAction = useLivePoolEarnings(activePool || {}) || {};

  function selectedPool(network) {
    const pool = network.contracts.coverPools.find((entry) => entry.id === poolActionId)
      || network.contracts.coverPools[0];
    if (!pool) throw new Error('No cover pool is configured on this network.');
    return pool;
  }

  function requireProtocolNetwork() {
    if (!protocolNetwork) throw new Error(protocolUnavailableReason || 'USD8 is not deployed on the selected network.');
    return protocolNetwork;
  }

  async function submitTransaction(
    request,
    pendingMessage,
    setStatus,
    expectedWalletScope = walletScopeKey,
    minBlock,
  ) {
    assertCurrentWalletScope(expectedWalletScope);
    const network = requireProtocolNetwork();
    const client = publicClientFor(network.id);
    setTransaction({ phase: 'wallet', message: pendingMessage, chainId: network.id });
    setStatus(pendingMessage);
    try {
    let blockNumber;
    if (minBlock !== undefined) {
      // Pin the estimate after approvals without freezing it before TEE verification.
      blockNumber = await client.getBlockNumber({ cacheTime: 0 });
      assertCurrentWalletScope(expectedWalletScope);
      if (blockNumber < minBlock) blockNumber = minBlock;
    }
    const estimatedGas = await client.estimateContractGas({ account: address, ...request, blockNumber });
    assertCurrentWalletScope(expectedWalletScope);
    const gas = estimatedGas + estimatedGas / 2n;
    const hash = await writeContractAsync({ account: address, chainId: network.id, ...request, gas });
    if (!hash) throw new Error('Transaction cancelled in your wallet.');
    if (walletScopeRef.current === expectedWalletScope) {
      setTransaction({ phase: 'pending', hash, chainId: network.id });
      setStatus(`Transaction submitted: ${hash.slice(0, 10)}…${hash.slice(-4)}`);
    }
    let receipt;
    try {
      receipt = await client.waitForTransactionReceipt({ hash });
    } catch (cause) {
      const error = new Error('The transaction was submitted, but its confirmation could not be checked. View the transaction status before retrying.', { cause });
      error.name = 'TransactionConfirmationError';
      throw error;
    }
    if (receipt.status !== 'success') throw new Error('Transaction reverted.');
    if (walletScopeRef.current === expectedWalletScope) {
      setTransaction({ phase: 'confirmed', hash, chainId: network.id });
      if (!['approve', 'setApprovalForAll'].includes(request.functionName)) {
        const pool = network.contracts.coverPools.find(pool => pool.address.toLowerCase() === request.address.toLowerCase());
        const resources = pool ? ['account-balances', `account-pool:${pool.id}`, `pool:${pool.id}`, 'head']
          : ['mintUSD8', 'redeemUSD8'].includes(request.functionName) ? ['account-balances'] : undefined;
        try { await refreshChainData(expectedWalletScope, { resources, minBlock: receipt.blockNumber }); }
        catch { if (walletScopeRef.current === expectedWalletScope) setTransaction({ phase: 'confirmed', hash, chainId: network.id, refreshError: true }); }
      }
    }
    return receipt;
    } catch (error) {
      if (walletScopeRef.current === expectedWalletScope) setTransaction(previous => ({ ...previous, phase: 'failed', message: error.shortMessage || error.message }));
      throw error;
    }
  }

  async function depositToPool(raw) {
    const network = requireProtocolNetwork();
    const client = publicClientFor(network.id);
    const pool = selectedPool(network);
    const amount = parseTokenAmount(raw, 18);
    if (amount <= 0n) throw new Error('Deposit amount must be positive.');
    const allowance = await client.readContract({
      address: pool.asset,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [address, pool.address],
    });
    if (allowance < amount) {
      await submitTransaction({
        address: pool.asset,
        abi: erc20Abi,
        functionName: 'approve',
        args: [pool.address, amount],
      }, `Approve ${pool.assetSymbol} in your wallet.`, setPoolStatus);
    }
    await submitTransaction({
      address: pool.address,
      abi: poolWriteAbi,
      functionName: 'deposit',
      args: [amount, address],
    }, 'Confirm the cover-pool deposit in your wallet.', setPoolStatus);
    setPoolStatus(`Deposit confirmed on ${network.name}.`);
    return true;
  }

  async function startPoolCooldown(raw) {
    const network = requireProtocolNetwork();
    const pool = selectedPool(network);
    const shares = parseTokenAmount(raw, activePool?.shareDecimals ?? 21);
    if (shares <= 0n) throw new Error('Enter a share amount greater than zero.');
    const expectedWalletScope = walletScopeKey;
    const balance = await publicClientFor(network.id).readContract({ address: pool.address, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
    assertCurrentWalletScope(expectedWalletScope);
    if (shares > balance) throw new Error('Your pool share balance has changed. Refresh the amount and try again.');
    await submitTransaction({
      address: pool.address,
      abi: poolWriteAbi,
      functionName: 'requestRedeem',
      args: [shares],
    }, 'Confirm the seven-day cooldown request in your wallet.', setPoolStatus);
    setPoolStatus('Cooldown started. This amount stops earning and may decrease if the pool pays claims before your exit settles.');
    return true;
  }

  async function completePoolWithdrawal() {
    const network = requireProtocolNetwork();
    await submitTransaction({
      address: selectedPool(network).address,
      abi: poolWriteAbi,
      functionName: 'completeRedeem',
      args: [address],
    }, 'Complete the matured withdrawal in your wallet.', setPoolStatus);
    setPoolStatus(`Withdrawal completed on ${network.name}.`);
    return true;
  }

  async function claimPoolRewards() {
    const network = requireProtocolNetwork();
    await submitTransaction({
      address: selectedPool(network).address,
      abi: poolWriteAbi,
      functionName: 'claimReward',
      args: [],
    }, 'Confirm the USD8 reward claim in your wallet.', setPoolStatus);
    setPoolStatus(`Rewards claimed on ${network.name}.`);
    return true;
  }

  function openPoolAction(action, poolId) {
    if (!connected || !protocolNetwork) return;
    setPoolStatus('');
    setPoolStatusFailed(false);
    setPoolStatusAction('');
    setPoolActionId(poolId);
    setPoolAction(action);
  }

  async function submitPoolAction(action, raw) {
    try {
      setPoolStatus('');
      setPoolStatusFailed(false);
      setPoolStatusAction(action);
      if (action === 'deposit') await depositToPool(raw);
      else if (action === 'startCooldown') await startPoolCooldown(raw);
      else if (action === 'withdraw') await completePoolWithdrawal();
      else if (action === 'claimReward') await claimPoolRewards();
    } catch (error) {
      setPoolStatusFailed(true);
      setPoolStatus(error?.shortMessage || error?.message || 'Transaction failed.');
    }
  }

  function fileClaimAction(row) {
    if (!connected) return;
    setClaimStatus('');
    setClaimStatusIsWarning(false);
    setClaimToken({ walletScopeKey, token: row });
  }

  async function submitClaim({ token, amount: rawAmount, scoreToSpend: rawScore, boosterAmount: rawBoosters }) {
    if (claimSubmitting) return;
    if (activeIncidentDetailsLoading) {
      throw new Error('Incident details are still loading. Refresh before filing a claim.');
    }
    const expectedWalletScope = walletScopeKey;
    assertCurrentWalletScope(expectedWalletScope);
    const controller = new AbortController();
    claimAbortController.current = controller;
    const assertCurrentClaimOperation = () => {
      assertCurrentWalletScope(expectedWalletScope);
      if (controller.signal.aborted || claimAbortController.current !== controller) {
        const error = new Error('Wallet account or network changed.');
        error.name = 'AbortError';
        throw error;
      }
    };
    const setCurrentClaimStatus = (message) => {
      assertCurrentClaimOperation();
      setClaimStatus(message);
    };
    let claimStep = 'requirements';
    let minBlock = 0n;
    const confirmedApprovals = [];
    const finishApproval = (label, receipt) => {
      assertCurrentClaimOperation();
      if (receipt.blockNumber > minBlock) minBlock = receipt.blockNumber;
      confirmedApprovals.push(label);
      claimStep = 'requirements';
      // An approval hash must not be attached to a later offchain failure.
      setTransaction(null);
    };
    setTransaction(null);
    setClaimSubmitting(true);
    setClaimStatusIsWarning(false);
    setClaimStatus('Checking current incident and claim requirements.');
    try {
      const network = requireProtocolNetwork();
      const { contracts } = network;
      const client = publicClientFor(network.id);
      const insuredToken = contracts.insuredTokens?.[token];
      if (!insuredToken) throw new Error('This token is not enabled for claims on the selected network.');
      const claimTokenSymbol = CLAIM_TOKEN_ROWS.find((row) => row.id === token)?.symbol || token;
      const ensureCurrentlyInsured = async () => {
        const listed = await client.readContract({
          address: contracts.defiInsurance,
          abi: claimWriteAbi,
          functionName: 'isInsuredToken',
          args: [insuredToken],
        });
        if (listed !== true) {
          throw new Error(`${claimTokenSymbol} is no longer enabled for new claims on ${network.name}.`);
        }
      };
      await ensureCurrentlyInsured();
      assertCurrentClaimOperation();

      const insuredTokenAmount = parseTokenAmount(rawAmount, 18);
      const scoreToSpend = parseTokenAmount(rawScore, 18);
      if (!/^\d+$/.test(String(rawBoosters ?? ''))) throw new Error('Please enter a valid Booster amount.');
      const boosterAmount = BigInt(rawBoosters);
      if (insuredTokenAmount <= 0n) throw new Error('Insured token amount must be positive.');
      if (scoreToSpend <= 0n) throw new Error('Insurance score to spend must be positive.');

      let activeIncidentId = await client.readContract({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'activeIncidentId',
      });
      assertCurrentClaimOperation();
      if (activeIncidentId !== 0n
        && String(actionableIncident?.id ?? '') !== activeIncidentId.toString()) {
        throw new Error('The active incident changed. Refresh its details before filing a claim.');
      }
      const claimBondAmount = await client.readContract({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'claimBondAmount',
      });
      assertCurrentClaimOperation();
      const usd8Balance = parseTokenAmount(String(chainData.balances.usd8).replace(/,/g, ''), 18);
      const usd8Required = insuredToken.toLowerCase() === contracts.usd8.toLowerCase()
        ? insuredTokenAmount + claimBondAmount
        : claimBondAmount;
      if (usd8Required > usd8Balance) {
        throw new Error(insuredToken.toLowerCase() === contracts.usd8.toLowerCase()
          ? 'Insufficient USD8 balance for the insured amount and claim bond.'
          : 'Insufficient USD8 balance for the claim bond.');
      }
      let referenceBlock = 0n;
      let signature = '0x';
      let authorization = null;
      const prepareFirstIncident = async () => {
        claimStep = 'verification';
        setCurrentClaimStatus('Verifying incident in the TEE. First claim may take several minutes.');
        return prepareIncidentOpen(insuredToken, {
          chainId: network.id,
          registry: contracts.registry,
          defiInsurance: contracts.defiInsurance,
          signal: controller.signal,
        });
      };
      const approvals = insuredToken.toLowerCase() === contracts.usd8.toLowerCase()
        ? [[contracts.usd8, insuredTokenAmount + claimBondAmount]]
        : [
          [insuredToken, insuredTokenAmount],
          [contracts.usd8, claimBondAmount],
        ];
      // Do not launch approval side effects from a stale landing snapshot.
      await ensureCurrentlyInsured();
      assertCurrentClaimOperation();
      for (const [approvalToken, requiredAmount] of approvals) {
        const allowance = await client.readContract({
          address: approvalToken,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address, contracts.defiInsurance],
        });
        assertCurrentClaimOperation();
        if (allowance < requiredAmount) {
          claimStep = 'token-approval';
          const receipt = await submitTransaction({
            address: approvalToken,
            abi: erc20Abi,
            functionName: 'approve',
            args: [contracts.defiInsurance, requiredAmount],
          }, 'Approve token in your wallet.', setCurrentClaimStatus, expectedWalletScope);
          finishApproval('Token approval', receipt);
        }
      }

      if (boosterAmount > 0n) {
        const [boosterCollection, boosterTokenId] = await client.readContract({
          address: contracts.registry,
          abi: registryBoosterAbi,
          functionName: 'boosterConfig',
        });
        assertCurrentClaimOperation();
        if (boosterCollection === zeroAddress) throw new Error('Boosters are not enabled for claims.');
        const currentBoosterBalance = await client.readContract({
          address: boosterCollection,
          abi: erc1155Abi,
          functionName: 'balanceOf',
          args: [address, boosterTokenId],
        });
        assertCurrentClaimOperation();
        if (currentBoosterBalance < boosterAmount) throw new Error('Insufficient Booster balance.');
        const boostersApproved = await client.readContract({
          address: boosterCollection,
          abi: erc1155Abi,
          functionName: 'isApprovedForAll',
          args: [address, contracts.defiInsurance],
        });
        assertCurrentClaimOperation();
        if (!boostersApproved) {
          claimStep = 'booster-approval';
          const receipt = await submitTransaction({
            address: boosterCollection,
            abi: erc1155Abi,
            functionName: 'setApprovalForAll',
            args: [contracts.defiInsurance, true],
          }, 'Approve Boosters in your wallet.', setCurrentClaimStatus, expectedWalletScope);
          finishApproval('Booster approval', receipt);
        }
      }

      // Opening authorizations are block-bounded. Obtain one only after every
      // prerequisite approval is confirmed so wallet latency cannot age it out.
      setCurrentClaimStatus('Checking the incident before filing your claim.');
      await ensureCurrentlyInsured();
      assertCurrentClaimOperation();
      activeIncidentId = await client.readContract({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'activeIncidentId',
      });
      assertCurrentClaimOperation();
      if (activeIncidentId === 0n) {
        if (!authorization) authorization = await prepareFirstIncident();
        assertCurrentClaimOperation();
        claimStep = 'requirements';
        activeIncidentId = await client.readContract({
          address: contracts.defiInsurance,
          abi: claimWriteAbi,
          functionName: 'activeIncidentId',
        });
        assertCurrentClaimOperation();
        if (activeIncidentId === 0n) {
          referenceBlock = authorization.referenceBlock;
          signature = authorization.signature;
          if (referenceBlock >= minBlock) minBlock = referenceBlock + 1n;
        }
      }

      claimStep = 'submission';
      await submitTransaction({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'fileClaim',
        args: [insuredToken, insuredTokenAmount, scoreToSpend, boosterAmount, referenceBlock, signature],
      }, 'Confirm the claim in your wallet.', setCurrentClaimStatus, expectedWalletScope, minBlock);
      assertCurrentClaimOperation();
      if (walletScopeRef.current === expectedWalletScope) {
        setClaimStatus(`Claim confirmed on ${network.name}.`);
      }
    } catch (error) {
      if (claimAbortController.current === controller
        && walletScopeRef.current === expectedWalletScope
        && error?.name !== 'AbortError') {
        setClaimStatusIsWarning(true);
        let stepLabel = {
          requirements: 'Claim requirements check failed',
          'token-approval': 'Token approval failed',
          'booster-approval': 'Booster approval failed',
          verification: 'Claim verification failed',
          submission: 'Claim transaction failed',
        }[claimStep];
        if (error?.name === 'TransactionConfirmationError') {
          stepLabel = stepLabel.replace('failed', 'confirmation unavailable');
        }
        let reason = error?.shortMessage || error?.message || 'Please try again.';
        if (/failed to fetch|fetch failed|networkerror|load failed/i.test(reason)) {
          reason = claimStep === 'verification'
            ? 'Could not reach the claim verification service. Check your connection and try again.'
            : 'Could not connect to the blockchain. Check your connection and try again.';
        }
        const approvals = [...new Set(confirmedApprovals)].map(label => `${label} confirmed.`).join(' ');
        const outcome = claimStep !== 'submission' ? 'No claim transaction was submitted.' : '';
        setClaimStatus([`${stepLabel}: ${reason}`, approvals, outcome].filter(Boolean).join(' '));
      }
    } finally {
      if (claimAbortController.current === controller) {
        claimAbortController.current = null;
        if (walletScopeRef.current === expectedWalletScope) setClaimSubmitting(false);
      }
    }
  }

  async function cancelClaim() {
    const expectedWalletScope = walletScopeKey;
    try {
      assertCurrentWalletScope(expectedWalletScope);
      const network = requireProtocolNetwork();
      const initialClaimId = chainData.claim?.id;
      const initialIncidentId = chainData.incident?.id;
      setClaimStatusIsWarning(false);
      const latestChainData = await refreshChainData(expectedWalletScope);
      const latestClaim = latestChainData?.claim;
      if (!latestClaim) throw new Error('This account no longer has an unresolved claim to cancel.');
      if (latestClaim.resolved) throw new Error('This claim has already been resolved.');
      if (latestClaim.id !== initialClaimId || latestChainData.incident?.id !== initialIncidentId) {
        throw new Error('The active claim changed. Review the current claim before cancelling.');
      }
      if (claimLifecycle(latestChainData.incident).state !== 'claim-open') {
        throw new Error('This claim can no longer be cancelled. Review its current lifecycle state.');
      }
      assertCurrentWalletScope(expectedWalletScope);
      await submitTransaction({
        address: network.contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'cancelClaim',
        args: [],
      }, 'Confirm claim cancellation in your wallet.', setClaimStatus, expectedWalletScope);
      if (walletScopeRef.current !== expectedWalletScope) return;
      setClaimToken(null);
      setClaimStatus('');
    } catch (error) {
      if (walletScopeRef.current !== expectedWalletScope) return;
      setClaimStatusIsWarning(true);
      setClaimStatus(error?.shortMessage || error?.message || 'Claim cancellation failed.');
    }
  }

  async function settlementArtifact() {
    const requestedContextKey = claimContextKey;
    if (claimSettlement?.contextKey === requestedContextKey
        && matchesSettlementContext(claimSettlement, chainData.incident?.id, chainData.incident?.root)
        && matchesSettlementTopology(claimSettlement.value, chainData.incident)) {
      return claimSettlement.value;
    }
    const network = requireProtocolNetwork();
    const value = await prepareSettlement(chainData.incident.id, {
      signal: claimAbortController.current?.signal,
      chainId: network.id,
      registry: network.contracts.registry,
      defiInsurance: network.contracts.defiInsurance,
      expectedRoot: chainData.incident.root,
      expectedPoolAddrs: chainData.incident.poolAddrs,
      expectedPoolOrder: chainData.incident.poolOrder,
    });
    if (claimContextRef.current !== requestedContextKey) {
      const error = new Error('Wallet account or claim changed while payout details were loading.');
      error.name = 'AbortError';
      throw error;
    }
    setClaimSettlement({
      contextKey: requestedContextKey,
      incidentId: chainData.incident.id,
      claimId: chainData.claim?.id ?? null,
      root: chainData.incident.root,
      value,
    });
    return value;
  }

  async function settleClaim() {
    const expectedWalletScope = walletScopeKey;
    try {
      assertCurrentWalletScope(expectedWalletScope);
      const network = requireProtocolNetwork();
      const initialIncidentId = chainData.incident?.id;
      const initialRoot = chainData.incident?.root;
      setClaimStatusIsWarning(false);
      setClaimStatus('Preparing the TEE settlement. This may take several minutes.');
      const settlement = await settlementArtifact();
      const latestChainData = await refreshChainData(expectedWalletScope);
      const latestIncident = latestChainData?.incident;
      if (latestIncident?.id !== initialIncidentId
          || latestIncident?.root?.toLowerCase() !== initialRoot?.toLowerCase()
          || claimLifecycle(latestIncident).state !== 'settlement-open'
          || !matchesSettlementTopology(settlement, latestIncident)) {
        throw new Error('The incident settlement state changed while the settlement was prepared.');
      }
      assertCurrentWalletScope(expectedWalletScope);
      await submitTransaction({
        address: network.contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'settleIncident',
        args: [settlement.root, settlement.poolPayouts, settlement.signature],
      }, 'Confirm claim settlement in your wallet.', setClaimStatus, expectedWalletScope);
      if (walletScopeRef.current === expectedWalletScope) {
        setClaimStatus(`Settlement confirmed on ${network.name}.`);
      }
    } catch (error) {
      if (walletScopeRef.current !== expectedWalletScope) return;
      setClaimStatusIsWarning(true);
      setClaimStatus(error?.shortMessage || error?.message || 'Claim settlement failed.');
    }
  }

  async function finalizeCurrentClaim(acceptPayout) {
    const expectedWalletScope = walletScopeKey;
    try {
      assertCurrentWalletScope(expectedWalletScope);
      const network = requireProtocolNetwork();
      const initialClaimId = chainData.claim?.id;
      const initialIncidentId = chainData.incident?.id;
      const initialRoot = chainData.incident?.root;
      const lifecycle = claimLifecycle(chainData.incident);
      setClaimStatusIsWarning(false);
      const settlement = lifecycle.state === 'payout-open' || lifecycle.state === 'payout-expired'
        ? await settlementArtifact()
        : null;
      const latestChainData = await refreshChainData(expectedWalletScope);
      const latestClaim = latestChainData?.claim;
      const latestIncident = latestChainData?.incident;
      if (!latestClaim) throw new Error('This account no longer has an unresolved claim to finalize.');
      if (latestClaim.resolved) throw new Error('This claim has already been resolved.');
      if (latestClaim.id !== initialClaimId || latestIncident?.id !== initialIncidentId) {
        throw new Error('The active claim changed while payout details were loading. Review the current claim and try again.');
      }

      const latestLifecycle = claimLifecycle(latestIncident);
      let row = null;
      if (lifecycle.state === 'payout-open' || lifecycle.state === 'payout-expired') {
        if (latestIncident.root?.toLowerCase() !== initialRoot?.toLowerCase()
            || (latestLifecycle.state !== 'payout-open' && latestLifecycle.state !== 'payout-expired')
            || !matchesSettlementTopology(settlement, latestIncident)) {
          throw new Error('The payout state changed while details were loading. Review the current claim and try again.');
        }
        row = settlement.rows.find((candidate) => candidate.claimId === latestClaim.id);
        if (!row) throw new Error('The settlement does not contain this claim.');
        if (row.eligibleBoosterAmount > BigInt(latestClaim.boosterAmount)) {
          throw new Error('The settlement booster amount exceeds this claim\'s escrow.');
        }
      }
      assertCurrentWalletScope(expectedWalletScope);
      await submitTransaction({
        address: network.contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'finalizeClaim',
        args: row
          ? [BigInt(latestClaim.id), acceptPayout, row.amounts, row.scoreSpent, row.boostedScore, row.eligibleAmount, row.eligibleBoosterAmount, row.proof]
          : [BigInt(latestClaim.id), false, [], 0n, 0n, 0n, 0n, []],
      }, acceptPayout ? 'Confirm payout acceptance in your wallet.' : 'Confirm token return in your wallet.', setClaimStatus, expectedWalletScope);
      if (walletScopeRef.current !== expectedWalletScope) return;
      setClaimToken(null);
      setClaimStatus('');
    } catch (error) {
      if (walletScopeRef.current !== expectedWalletScope) return;
      setClaimStatusIsWarning(true);
      const messages = {
        FinalizeNotOpen: 'Payout acceptance is not open. Refresh the claim status to check the payout or token-return window.',
        InvalidProof: 'The settlement proof is invalid. Refresh payout details before trying again.',
        EligibleExceedsEscrow: 'The settlement eligibility exceeds the escrowed tokens or boosters. Refresh payout details before trying again.',
        InvalidBoostedScore: 'The settlement payout weight does not match its eligible boosters. Refresh payout details before trying again.',
        UnauthorizedClaim: 'This wallet cannot finalize this claim. Check the connected account and refresh.',
        ClaimAlreadyResolved: 'This claim has already been resolved. Refresh the claim status.',
        PayoutCapExceeded: 'The payout exceeds the pool’s remaining payout allowance. Refresh payout details before trying again.',
      };
      let reason;
      const seen = new Set();
      for (let cause = error; cause && !seen.has(cause); cause = cause.cause) {
        seen.add(cause);
        reason = messages[cause.data?.errorName];
        if (reason) break;
      }
      setClaimStatus(reason || error?.shortMessage || error?.message || 'Claim finalization failed.');
    }
  }

  async function openUsd8Action(action) {
    if (!connected || !protocolNetwork) return;
    setUsd8Status('');
    setUsd8Action(action);
    if (action === 'redeem') {
      setQuoteRate(null);
      try {
        const rate = await publicClientFor(protocolNetwork.id).readContract({ address: protocolNetwork.contracts.treasury, abi: treasuryWriteAbi, functionName: 'usd8ToUsdcRate' });
        if (walletScopeRef.current === walletScopeKey) setQuoteRate(rate);
      } catch { setUsd8Status('Could not load the redemption quote. Reopen the dialog to retry.'); }
    }
  }

  async function submitUsd8Action(action, raw) {
    try {
      setUsd8Status('');
      setUsd8StatusFailed(false);
      const network = requireProtocolNetwork();
      const client = publicClientFor(network.id);
      const { contracts } = network;
      const amount = parseTokenAmount(raw, action === 'mint' ? 6 : 18);
      if (amount <= 0n) throw new Error(`${action === 'mint' ? 'Mint' : 'Redemption'} amount must be positive.`);
      if (action === 'redeem') {
        const rate = await client.readContract({
          address: contracts.treasury,
          abi: treasuryWriteAbi,
          functionName: 'usd8ToUsdcRate',
        });
        assertCurrentWalletScope(walletScopeKey);
        if (rate !== quoteRate) { setQuoteRate(rate); setUsd8Status('The redemption quote changed. Review the updated output and submit again.'); return; }
        const minUsdcOut = amount * rate / 1_000_000_000_000_000_000_000_000_000_000n;
        await submitTransaction({
          address: contracts.treasury,
          abi: treasuryWriteAbi,
          functionName: 'redeemUSD8',
          args: [amount, minUsdcOut],
        }, 'Confirm the USD8 redemption in your wallet.', setUsd8Status);
        setUsd8Status(`Redemption confirmed on ${network.name}.`);
        return;
      }

      const allowance = await client.readContract({
        address: contracts.usdc,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, contracts.treasury],
      });
      if (allowance < amount) {
        await submitTransaction({
          address: contracts.usdc,
          abi: erc20Abi,
          functionName: 'approve',
          args: [contracts.treasury, amount],
        }, 'Approve USDC in your wallet.', setUsd8Status);
      }
      await submitTransaction({
        address: contracts.treasury,
        abi: treasuryWriteAbi,
        functionName: 'mintUSD8',
        args: [amount],
      }, 'Confirm the USD8 mint in your wallet.', setUsd8Status);
      setUsd8Status(`Mint confirmed on ${network.name}.`);
    } catch (error) {
      setUsd8StatusFailed(true);
      setUsd8Status(error?.shortMessage || error?.message || 'Transaction failed.');
    }
  }

  function dataUnavailableFor(resources) {
    return chainDataStatus === 'error' || resources.some(resource => chainData.resourceErrors?.[resource])
      ? 'Refresh unavailable data before continuing.' : '';
  }

  const scoreNeedsBalanceRefresh = connected
    && scoreStatus === 'ready'
    && chainDataStatus === 'ready'
    && scoreSnapshotStale(score, chainData, activeNetwork?.contracts);
  const canSimulateCurrentScore = connected
    && chainDataStatus === 'ready'
    && chainData.scoreBalancesSnapshotTimestampMilliseconds > 0
    && hasCurrentBalanceScoreRate(chainData.scoreRatesPerSecond);
  const currentScoreRefreshKey = scoreNeedsBalanceRefresh
    ? scoreBalanceRefreshKey(score, chainData, activeNetwork.contracts, activeNetwork.id, address)
    : '';
  const displayedScoreStatus = canSimulateCurrentScore && scoreStatus !== 'ready'
    ? 'ready'
    : connected
    && protocolNetwork
    && (chainDataStatus === 'loading'
      || (scoreStatus === 'ready'
        && scoreNeedsBalanceRefresh
        && scoreRefreshCompletedKey !== currentScoreRefreshKey))
    ? 'loading'
    : scoreStatus;
  const scoreStatusForDisplay = connected
    && activeNetwork?.scoreAvailable
    && displayedScoreStatus === 'idle'
    ? 'loading'
    : displayedScoreStatus;
  const balancesLoading = connected
    && Boolean(protocolNetwork)
    && chainDataStatus === 'loading' && !chainData.updatedAt;
  const poolLoading = Boolean(protocolNetwork)
    && chainDataStatus !== 'ready'
    && chainDataStatus !== 'error';
  const displayedScore = scoreNeedsBalanceRefresh
    && scoreRefreshCompletedKey === currentScoreRefreshKey
    ? scoreWithCurrentBalanceRates(
      score,
      chainData.scoreRatesPerSecond,
      chainData.scoreBalanceChangeTimestampMilliseconds,
      chainData.scoreBalancesSnapshotTimestampMilliseconds,
    )
    : canSimulateCurrentScore && !score
      ? scoreWithCurrentBalanceRates(
        { ...EMPTY_SCORE, availableScore: null, maturingScorePerSecond: null },
        chainData.scoreRatesPerSecond,
        chainData.scoreBalanceChangeTimestampMilliseconds,
        chainData.scoreBalancesSnapshotTimestampMilliseconds,
      )
    : score;
  const selectedSettlementRow = chainData.claim
      && claimSettlement?.contextKey === claimContextKey
      && matchesSettlementContext(claimSettlement, chainData.incident?.id, chainData.incident?.root)
      && matchesSettlementTopology(claimSettlement.value, chainData.incident)
    ? claimSettlement.value.rows.find((row) => row.claimId === chainData.claim.id)
    : null;
  // A resolved claim needs no action, and a settled incident delists its token, so
  // the row should disappear rather than keep offering a payout button.
  const unresolvedClaim = chainData.claim && !chainData.claim.resolved ? chainData.claim : null;
  // Only a claim of your own that is already resolved removes the row; with no
  // claim the incident stays visible so anyone can still see or join it.
  const activeIncidentDetailsLoading = Boolean(
    chainDataStatus !== 'ready'
      && chainData.activeIncidentId
      && chainData.activeIncidentId !== '0'
      && String(chainData.incident?.id ?? '') !== String(chainData.activeIncidentId),
  );
  const actionableIncident = chainData.claim?.resolved ? null : chainData.incident;

  // The settlement artifact is still being fetched, so the payout figures are
  // unknown rather than unavailable.
  const payoutLoading = Boolean(unresolvedClaim)
    && !selectedSettlementRow
    && !claimStatusIsWarning;
  const boostersToBurn = selectedSettlementRow?.eligibleBoosterAmount !== undefined
    && selectedSettlementRow.eligibleBoosterAmount <= BigInt(chainData.claim.boosterAmount)
    ? (selectedSettlementRow.eligibleAmount > 0n && selectedSettlementRow.scoreSpent > 0n
      ? selectedSettlementRow.eligibleBoosterAmount : 0n)
    : null;
  const settledScoreShare = selectedSettlementRow
    ? percentOfWad(
      selectedSettlementRow.boostedScore,
      claimSettlement.value.rows.reduce((total, row) => total + row.boostedScore, 0n),
    )
    : null;
  const selectedClaimStatus = claimToken
    && unresolvedClaim
    && chainData.incident?.tokenId === claimToken.id
    ? {
      ...unresolvedClaim,
      ...claimLifecycle(chainData.incident),
      incident: chainData.incident,
      insuredTokenAmount: groupDecimalString(chainData.claim.insuredTokenAmount),
      bondAmount: groupDecimalString(chainData.claim.bondAmount),
      boosterAmount: groupDecimalString(chainData.claim.boosterAmount),
      boostersToBurn: boostersToBurn === null ? null : groupDecimalString(boostersToBurn.toString()),
      scoreToSpend: groupDecimalString(chainData.claim.scoreToSpend),
      // Mirrors finalizeClaim's `eligible`: without it every payout branch is a no-op,
      // the bond goes to the treasury, and accepting does nothing a decline would not.
      payoutEligible: selectedSettlementRow
        ? selectedSettlementRow.eligibleAmount > 0n && selectedSettlementRow.scoreSpent > 0n
        : null,
      // Once settled, weight by the enclave's boosted scores: ineligible claims are
      // zeroed there, so the filed-claim total overstates the denominator.
      scoreCommitmentPercentage: settledScoreShare || chainData.claim.scoreCommitmentPercentage,
      payoutUsd: selectedSettlementRow?.payoutUsd === undefined
        ? null
        : formatUsdWad(selectedSettlementRow.payoutUsd),
      payoutVsLoss: selectedSettlementRow?.payoutUsd === undefined
        || !selectedSettlementRow?.lossUsd
        ? null
        : percentOfWad(selectedSettlementRow.payoutUsd, selectedSettlementRow.lossUsd),
      payoutDetails: settlementPayoutDetails(
        selectedSettlementRow?.amounts || [],
        claimSettlement?.value?.poolOrder || [],
        protocolNetwork?.payoutAssets,
      ),
    }
    : null;
  const insuredTokenStates = chainData.insurance?.tokens || {};
  const currentClaimTokenRows = CLAIM_TOKEN_ROWS.filter((row) => (
    insuredTokenStates[row.id]?.enabled || row.id === actionableIncident?.tokenId
  ));

  return (
    <WalletNoticeProvider key={walletScopeKey} wallet={{ connected, connecting, onConnect: connect, connectUnavailableReason: !walletConnectorConfigured ? WALLET_CONNECT_UNAVAILABLE_REASON : '' }}>
      <NoticeMessage
        message={transaction?.refreshError ? `${claimStatus || usd8Status || poolStatus || 'Transaction confirmed.'} Transaction confirmed. Balances could not be refreshed.` : claimStatus || usd8Status || poolStatus || (transaction ? (transaction.phase === 'confirmed' ? 'Transaction confirmed.' : transaction.message) : '')}
        actionLabel={transaction?.refreshError ? 'Retry refresh' : undefined}
        onAction={() => refreshChainData().then(() => setTransaction(previous => previous ? ({ ...previous, refreshError: false }) : previous)).catch(() => {})}
        tone={transaction?.refreshError || claimStatusIsWarning || usd8StatusFailed || poolStatusFailed || transaction?.phase === 'failed' ? 'error' : 'status'}
        label={claimStatus ? 'Claim submission status' : 'Transaction status'}
        busy={operationBusy && transaction?.phase !== 'confirmed' && transaction?.phase !== 'failed'}
        href={transaction?.hash ? `${getNetwork(transaction.chainId)?.chain.blockExplorers?.default.url || 'https://sepolia.etherscan.io'}/tx/${transaction.hash}` : undefined}
      />
      <NoticeMessage message={scoreError} actionLabel="Retry score" onAction={() => {
        scoreRetryForcesRefresh.current = true;
        setScoreRetry(value => value + 1);
      }} />
      <USD8Landing
        wallet={{
          address,
          connected,
          connecting,
          networkName: activeNetwork?.name || (connected ? `Chain ${chainId}` : ''),
          networkUnavailableReason: protocolUnavailableReason,
          connectUnavailableReason: !connected && !walletConnectorConfigured ? WALLET_CONNECT_UNAVAILABLE_REASON : '',
          onConnect: connect,
          onDisconnect: () => open({ view: 'Account' }).catch(error => setDataError(error?.message || 'Wallet details could not be opened.')),
          onSwitchNetwork: () => switchChainAsync({ chainId: 11155111 }).catch(error => setDataError(error.shortMessage || error.message)),
        }}
        score={connected ? displayedScore : EMPTY_SCORE}
        scoreStatus={connected ? scoreStatusForDisplay : 'ready'}
        availableScoreLoading={connected && (scoreStatus === 'loading' || (scoreStatus !== 'error' && scoreStatusForDisplay === 'loading'))}
        balances={connected ? chainData.balances : EMPTY_CHAIN_DATA.balances}
        balancesLoading={balancesLoading}
        savingsVault={savingsVault}
        pools={displayedPools}
        poolLoading={poolLoading}
        dataError={transaction?.refreshError ? '' : dataError}
        updatedAt={chainData.updatedAt}
        onRetry={() => refreshChainData(walletScopeKey, { resources: Object.keys(chainData.resourceErrors || {}).length ? Object.keys(chainData.resourceErrors) : undefined }).catch(() => {})}
        incident={actionableIncident}
        insuredTokenStates={insuredTokenStates}
        onFileClaim={fileClaimAction}
        fileClaimUnavailableReason={connected ? protocolUnavailableReason || (chainDataStatus === 'error' ? 'Refresh unavailable data before continuing.' : '') : CONNECT_WALLET_REASON}
        onPoolAction={openPoolAction}
        onUsd8Action={openUsd8Action}
      />
      {connected && claimToken ? (
        <Suspense fallback={<div role="status">Loading claim details…</div>}><FileClaimDialog
          token={claimToken.id}
          insuredTokens={currentClaimTokenRows.map((row) => ({
            id: row.id,
            symbol: row.symbol,
            iconSrc: row.iconSrc,
            address: protocolNetwork?.contracts.insuredTokens?.[row.id],
            balance: row.id === 'usd8'
              ? chainData.balances.usd8
              : row.id === 'susd8'
                ? chainData.balances.savings
                : chainData.balances.insuredTokens?.[row.id] || '0',
          }))}
          availableScore={score?.availableScore ?? '—'}
          availableBoosters={chainData.balances.boosters || '0'}
          minHoldingRequiredBlocks={actionableIncident?.tokenId === claimToken.id
            ? actionableIncident.minHoldingRequiredBlocks : chainData.insurance?.minHoldingRequiredBlocks}
          claimBond={chainData.insurance?.claimBond === undefined || chainData.insurance?.claimBond === null ? '— USD8' : `${chainData.insurance.claimBond} USD8`}
          claimBondAvailable={chainData.balances.usd8}
          claimTotals={{ scoreCommitted: chainData.incident?.totalScoreCommitted || '0' }}
          boosterBoostBps={chainData.incident?.boosterBoostBps || 0}
          claimStatus={selectedClaimStatus}
          incident={actionableIncident?.tokenId === claimToken.id ? actionableIncident : null}
          payoutLoading={payoutLoading}
          submitUnavailableReason={(!score ? 'Insurance Score is unavailable. Retry to load it before filing a claim.' : '') || (activeIncidentDetailsLoading
            ? 'Incident details are still loading. Refresh before filing a claim.'
            : '') || (actionableIncident?.tokenId === claimToken.id && actionableIncident.minHoldingRequiredBlocks == null
            ? 'Holding window is unavailable. Refresh before filing a claim.'
            : '') || dataUnavailableFor(['configuration', 'account-balances', 'boosters', 'claim-bond', 'head', 'incident', 'incident-settlement-params']) || ( !protocolNetwork?.contracts.insuredTokens?.[claimToken.id]
            || !insuredTokenStates[claimToken.id]?.enabled
            ? `${claimToken.symbol} is not enabled for claims on ${protocolNetwork?.name || 'the selected network'}.`
            : (operationBusy
              ? 'Claim preparation is in progress.'
              : ((!chainData.activeIncidentId || chainData.activeIncidentId === '0') && !claimApiConfigured
                ? 'Claim verification service is not configured.'
                : '')))}
          statusMessage=""
          statusTone={claimStatusIsWarning
            ? 'warning'
            : (isWaitingStatus(claimStatus) ? 'loading' : 'neutral')}
          onClearStatus={() => {
            setClaimStatus('');
            setClaimStatusIsWarning(false);
          }}
          onClose={() => {
            claimAbortController.current?.abort();
            setClaimStatus('');
            setClaimStatusIsWarning(false);
            setClaimToken(null);
          }}
          onCancel={(...args) => runOperation(() => cancelClaim(...args))}
          onSettle={(...args) => runOperation(() => settleClaim(...args))}
          onReturnTokens={() => runOperation(() => finalizeCurrentClaim(false))}
          onAcceptPayout={() => runOperation(() => finalizeCurrentClaim(true))}
          onCancelPayout={() => runOperation(() => finalizeCurrentClaim(false))}
          onSubmit={(...args) => runOperation(() => submitClaim(...args))}
        /></Suspense>
      ) : null}
      {connected && usd8Action ? (
        <Usd8ActionDialog
          busy={operationBusy && transaction?.phase !== 'confirmed'}
          quoteRate={quoteRate}
          mode={usd8Action}
          usdcBalance={chainData.balances.usdc}
          usd8Balance={chainData.balances.usd8}
          statusMessage=""
          statusFailed={usd8StatusFailed}
          onInputChange={() => setUsd8Status('')}
          onModeChange={openUsd8Action}
          onClose={() => {
            setUsd8Status('');
            setUsd8Action(null);
          }}
          onSubmit={(...args) => runOperation(() => submitUsd8Action(...args))}
          submitUnavailableReason={protocolUnavailableReason || (operationBusy ? 'A transaction is already in progress.' : '') || dataUnavailableFor(['account-balances'])}
        />
      ) : null}
      {connected && poolAction ? (
        <PoolActionDialog
          busy={operationBusy && transaction?.phase !== 'confirmed'}
          mode={poolAction}
          poolName={activePool?.name || 'cover pool'}
          assetSymbol={activePool?.assetSymbol || ''}
          shareSymbol={activePool?.shareSymbol || ''}
          shareDecimals={activePool?.shareDecimals ?? 21}
          withdrawalQuote={activePool?.withdrawalQuote}
          coverAssetBalance={activePool?.assetBalance || '0'}
          activeIncidentId={chainData.activeIncidentId}
          capacityUncapped={activePool?.capacityUncapped}
          remainingDepositCapacity={activePool?.remainingDepositCapacity}
          poolShareBalance={activePool?.availableForCooldown || '0'}
          availableForCooldown={activePool?.availableForCooldown}
          availableForCooldownAssets={activePool?.availableForCooldownAssets}
          availableForWithdrawAssets={activePool?.availableForWithdrawAssets}
          inCooldownAssets={activePool?.inCooldownAssets}
          exitSettled={activePool?.exitSettled}
          availableForWithdraw={activePool?.availableForWithdraw}
          inCooldown={activePool?.inCooldown}
          cooldownEndsAtMilliseconds={activePool?.cooldownEndsAtMilliseconds}
          earnings={livePoolAction.earnings}
          hasEarnings={livePoolAction.hasEarnings}
          statusMessage=""
          statusFailed={poolStatusFailed}
          statusAction={poolStatusAction}
          onInputChange={() => {
            setPoolStatus('');
            setPoolStatusAction('');
          }}
          onModeChange={(action) => {
            setPoolStatus('');
            setPoolStatusAction('');
            setPoolAction(action);
          }}
          onClose={() => {
            setPoolStatus('');
            setPoolStatusAction('');
            setPoolAction(null);
          }}
          onSubmit={(...args) => runOperation(() => submitPoolAction(...args))}
          submitUnavailableReason={protocolUnavailableReason || (operationBusy ? 'A transaction is already in progress.' : '') || dataUnavailableFor(['head', `pool:${activePool?.id}`, `account-pool:${activePool?.id}`, `account-pool-derived:${activePool?.id}`])}
        />
      ) : null}
    </WalletNoticeProvider>
  );
}
