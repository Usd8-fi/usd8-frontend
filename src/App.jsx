import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { formatUnits, parseUnits, zeroAddress } from 'viem';
import { useAccount, useChainId, useDisconnect, useWriteContract } from 'wagmi';
import AvailabilityAction, { CONNECT_WALLET_REASON } from './components/AvailabilityAction.jsx';
import { COVERED_PROTOCOL_ROWS } from './components/CoveredProtocolsTable.jsx';
import FileClaimDialog from './components/FileClaimDialog.jsx';
import USD8Landing from './components/USD8Landing.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { fetchLandingChainData, publicClientFor } from './lib/chainData.js';
import { erc1155Abi, erc20Abi, registryBoosterAbi } from './lib/abis.js';
import { formatUsdWad, groupDecimalString, percentOfWad } from './lib/units.js';
import { displayAvailableBalance } from './lib/displayAvailableBalance.js';
import { useLivePoolEarnings } from './lib/livePoolEarnings.js';
import { fetchMorphoVault } from './lib/morphoApi.js';
import { getNetwork, getProtocolNetwork } from './lib/networkConfig.js';
import {
  claimApiConfigured,
  matchesSettlementContext,
  prepareIncidentOpen,
  prepareSettlement,
} from './lib/claimApi.js';
import { claimLifecycle } from './lib/claimLifecycle.js';
import { fetchInsuranceScore } from './lib/scoreApi.js';
import { tokenAmountExceedsBalance } from './lib/tokenAmount.js';
import { walletConnectorConfigured } from './lib/walletConnector.js';

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

const poolWriteAbi = [
  { type: 'function', name: 'deposit', stateMutability: 'nonpayable', inputs: [{ name: 'assets', type: 'uint256' }, { name: 'receiver', type: 'address' }], outputs: [{ name: 'shares', type: 'uint256' }] },
  { type: 'function', name: 'requestRedeem', stateMutability: 'nonpayable', inputs: [{ name: 'shares', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'completeRedeem', stateMutability: 'nonpayable', inputs: [{ name: 'receiver', type: 'address' }], outputs: [{ name: 'assets', type: 'uint256' }] },
  { type: 'function', name: 'claimReward', stateMutability: 'nonpayable', inputs: [], outputs: [{ name: 'reward', type: 'uint256' }] },
  { type: 'function', name: 'exitRequests', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'shares', type: 'uint256' }, { name: 'exitEpoch', type: 'uint64' }] },
];

const treasuryWriteAbi = [
  { type: 'function', name: 'mintUSD8', stateMutability: 'nonpayable', inputs: [{ name: 'usdcAmount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'redeemUSD8', stateMutability: 'nonpayable', inputs: [{ name: 'usd8Amount', type: 'uint256' }, { name: 'minUsdcOut', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'usd8ToUsdcRate', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
];

const claimWriteAbi = [
  { type: 'error', name: 'ZeroAmount', inputs: [] },
  { type: 'error', name: 'InvalidReferenceBlock', inputs: [{ name: 'referenceBlock', type: 'uint64' }] },
  { type: 'error', name: 'InsuredTokenNotApproved', inputs: [{ name: 'insuredToken', type: 'address' }] },
  {
    type: 'error', name: 'ClaimWindowClosed',
    inputs: [{ name: 'insuredToken', type: 'address' }, { name: 'claimDeadline', type: 'uint64' }],
  },
  { type: 'error', name: 'DuplicateClaim', inputs: [{ name: 'incidentId', type: 'uint256' }] },
  { type: 'error', name: 'IncidentFinalizing', inputs: [{ name: 'incidentId', type: 'uint256' }] },
  {
    type: 'error', name: 'IncidentTokenMismatch',
    inputs: [
      { name: 'incidentId', type: 'uint256' },
      { name: 'expectedToken', type: 'address' },
      { name: 'suppliedToken', type: 'address' },
    ],
  },
  { type: 'error', name: 'UnexpectedOpenAttestation', inputs: [] },
  { type: 'error', name: 'UnauthorizedOpenSigner', inputs: [{ name: 'recovered', type: 'address' }] },
  { type: 'error', name: 'DefiInsuranceNotRegistered', inputs: [] },
  { type: 'error', name: 'ECDSAInvalidSignatureLength', inputs: [{ name: 'length', type: 'uint256' }] },
  { type: 'error', name: 'SafeERC20FailedOperation', inputs: [{ name: 'token', type: 'address' }] },
  {
    type: 'error', name: 'ERC1155MissingApprovalForAll',
    inputs: [{ name: 'operator', type: 'address' }, { name: 'owner', type: 'address' }],
  },
  { type: 'function', name: 'isInsuredToken', stateMutability: 'view', inputs: [{ name: 'insuredToken', type: 'address' }], outputs: [{ name: 'listed', type: 'bool' }] },
  { type: 'function', name: 'activeIncidentId', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'claimBondAmount', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint128' }] },
  {
    type: 'function',
    name: 'fileClaim',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'insuredToken', type: 'address' },
      { name: 'insuredTokenAmount', type: 'uint128' },
      { name: 'scoreToSpend', type: 'uint256' },
      { name: 'boosterAmount', type: 'uint256' },
      { name: 'referenceBlock', type: 'uint64' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [{ name: 'claimId', type: 'uint256' }],
  },
  { type: 'function', name: 'cancelClaim', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  {
    type: 'function', name: 'settleIncident', stateMutability: 'nonpayable',
    inputs: [{ name: 'root', type: 'bytes32' }, { name: 'poolPayouts', type: 'uint256[]' }, { name: 'signature', type: 'bytes' }], outputs: [],
  },
  {
    type: 'function', name: 'finalizeClaim', stateMutability: 'nonpayable',
    inputs: [
      { name: 'claimId', type: 'uint256' }, { name: 'acceptPayout', type: 'bool' },
      { name: 'amounts', type: 'uint256[]' }, { name: 'scoreSpent', type: 'uint256' },
      { name: 'boostedScore', type: 'uint256' }, { name: 'eligibleAmount', type: 'uint256' },
      { name: 'proof', type: 'bytes32[]' },
    ], outputs: [],
  },
];

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

function TransactionStatus({ message, failed = false }) {
  if (!message) return null;
  const waiting = !failed && isWaitingStatus(message);
  return (
    <small
      className={`usd8-dialog-status${failed ? ' usd8-dialog-status--warning' : ''}`}
      role={failed ? 'alert' : 'status'}
      aria-label="Transaction status"
      aria-live="polite"
    >
      {waiting ? <LoadingSpinner /> : null}
      {message}
    </small>
  );
}

function Usd8ActionDialog({ mode, usdcBalance, usd8Balance, statusMessage, statusFailed = false, onInputChange, onModeChange, onClose, onSubmit, submitUnavailableReason = '' }) {
  const minting = mode === 'mint';
  const inputToken = minting ? 'USDC' : 'USD8';
  const outputToken = minting ? 'USD8' : 'USDC';
  const availableBalance = minting ? usdcBalance : usd8Balance;
  const [amount, setAmount] = useState(() => defaultTokenAmount(availableBalance));
  const amountUnavailableReason = submitUnavailableReason
    || tokenAmountValidationReason(amount, availableBalance, inputToken, minting ? 'mint USD8' : 'redeem USD8');

  useEffect(() => {
    setAmount(defaultTokenAmount(availableBalance));
  }, [mode]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="usd8-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="usd8-dialog" role="dialog" aria-modal="true" aria-label="Mint or redeem USD8">
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
                type="number"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  onInputChange?.();
                }}
              />
              <small>{displayAvailableBalance(availableBalance)} available</small>
            </label>

            <span className="usd8-dialog-arrow" aria-hidden="true">→</span>

            <div className="usd8-dialog-output">
              <span>{outputToken}</span>
              <output aria-label={`${outputToken} output`}>{amount || '0'}</output>
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
            <TransactionStatus message={statusMessage} failed={statusFailed} />
          </div>
        </form>
      </section>
    </div>
  );
}

function PoolActionDialog({
  mode,
  poolName = 'cover pool',
  assetSymbol = '',
  shareSymbol = '',
  coverAssetBalance,
  activeIncidentId,
  capacityUncapped,
  remainingDepositCapacity,
  poolShareBalance,
  availableForCooldown,
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
  const displayedWithdrawAvailable = cooldownCompleteWaitingForClaims ? cooldownBalance : withdrawAvailable;
  const displayedCooldownBalance = cooldownCompleteWaitingForClaims ? '0' : cooldownBalance;
  const hasWithdrawAvailable = !/^0(?:\.0+)?$/.test(String(withdrawAvailable).replace(/,/g, ''));
  const existingWithdrawalRequestReason = 'Please finish the existing withdrawal request before starting a new one.';
  const cooldownUnavailableReason = withdrawing && defaultTokenAmount(cooldownBalance)
    ? existingWithdrawalRequestReason
    : (withdrawing && hasWithdrawAvailable
      ? existingWithdrawalRequestReason
      : '');
  const actionUnavailableReason = submitUnavailableReason
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
    || capacityDepositReason;

  useEffect(() => {
    setAmount(defaultTokenAmount(available));
  }, [mode]);

  useEffect(() => {
    if (!cooldownTiming || cooldownTiming === 'ready now') return undefined;
    const timer = window.setInterval(() => setCurrentTimeMilliseconds(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [cooldownEndsAtMilliseconds, cooldownTiming]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="usd8-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="usd8-dialog" role="dialog" aria-modal="true" aria-label={`Manage ${poolName}`}>
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
                <small>{earnings} USD8 available to withdraw</small>
              </div>
            </div>
          ) : (
            <div className="usd8-dialog-flow usd8-dialog-flow--single">
              <label className="usd8-dialog-amount">
                <span>{inputToken}</span>
                <input
                  aria-label={`${inputToken} amount`}
                  inputMode="decimal"
                  min="0"
                  step="any"
                  type="number"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    onInputChange?.();
                  }}
                />
                {mode === 'withdraw' ? (
                  <small className="usd8-dialog-pool-availability usd8-dialog-withdrawal-availability">
                    {displayAvailableBalance(available)} available. 7-day cooldown if no pending claims. Otherwise after the claims are all finalized.{' '}
                    <a href={`${DOCS_BASE_URL}cover-pools.html`}>Learn More</a>.
                  </small>
                ) : (
                  <small className="usd8-dialog-pool-availability">
                    {displayAvailableBalance(available)} available
                    {depositing && !capacityUncapped && remainingDepositCapacity !== '' ? (
                      <>
                        .{' '}
                        <span className="usd8-dialog-pool-capacity">
                          {remainingDepositCapacity} {assetSymbol} left in pool limit
                        </span>
                      </>
                    ) : null}
                  </small>
                )}
              </label>
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
                {statusAction === 'startCooldown' ? <TransactionStatus message={statusMessage} failed={statusFailed} /> : null}
                <small className="usd8-dialog-withdraw-balances">
                  {displayedWithdrawAvailable} available for withdraw{cooldownCompleteWaitingForClaims ? ' after claims are finalized' : ''}, {' '}
                  {displayedCooldownBalance} in cooldown{cooldownTiming ? ` — ${cooldownTiming}` : ''}.
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
                {statusAction === 'withdraw' ? <TransactionStatus message={statusMessage} failed={statusFailed} /> : null}
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
            {!withdrawing ? <TransactionStatus message={statusMessage} failed={statusFailed} /> : null}
          </div>
        </form>
      </section>
    </div>
  );
}

export default function App() {
  const { address = '', isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
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
  const [score, setScore] = useState(null);
  const [scoreStatus, setScoreStatus] = useState('idle');
  const scoreRefreshAttempt = useRef('');
  const [scoreRefreshCompletedKey, setScoreRefreshCompletedKey] = useState('');
  const [chainData, setChainData] = useState(EMPTY_CHAIN_DATA);
  const [chainDataStatus, setChainDataStatus] = useState('idle');
  const [dataError, setDataError] = useState('');
  const chainDataRequestGeneration = useRef(0);
  const [savingsVault, setSavingsVault] = useState(EMPTY_SAVINGS_VAULT);
  const [usd8Action, setUsd8Action] = useState(null);
  const [usd8Status, setUsd8Status] = useState('');
  const [usd8StatusFailed, setUsd8StatusFailed] = useState(false);
  const [poolAction, setPoolAction] = useState(null);
  const [poolActionId, setPoolActionId] = useState('');
  const [poolStatus, setPoolStatus] = useState('');
  const [poolStatusFailed, setPoolStatusFailed] = useState(false);
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
    claimAbortController.current?.abort();
    claimAbortController.current = null;
    setScore(null);
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
    fetchMorphoVault({ signal: controller.signal })
      .then(setSavingsVault)
      .catch((error) => {
        if (error.name !== 'AbortError') setSavingsVault(EMPTY_SAVINGS_VAULT);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const requestGeneration = ++chainDataRequestGeneration.current;
    const requestedWalletScope = walletScopeKey;
    if (!activeNetwork) {
      setScore(null);
      setScoreStatus('idle');
      setScoreRefreshCompletedKey('');
      setChainData(EMPTY_CHAIN_DATA);
      setChainDataStatus('idle');
      return undefined;
    }

    const controller = new AbortController();
    setScoreRefreshCompletedKey('');
    if (connected && activeNetwork.scoreAvailable) {
      setScoreStatus('loading');
      fetchInsuranceScore(address, { chainId: activeNetwork.id, signal: controller.signal })
        .then((nextScore) => {
          if (requestGeneration !== chainDataRequestGeneration.current
              || walletScopeRef.current !== requestedWalletScope) return;
          setScore(scoreWithTokenBreakdown(nextScore, activeNetwork.contracts));
          setScoreStatus('ready');
        })
        .catch((error) => {
          if (requestGeneration === chainDataRequestGeneration.current
              && walletScopeRef.current === requestedWalletScope
              && error.name !== 'AbortError') {
            setScoreStatus('error');
            setDataError(error?.message || 'Insurance Score is unavailable.');
          }
        });
    } else {
      setScore(null);
      setScoreStatus('idle');
    }

    if (protocolNetwork) {
      setChainDataStatus('loading');
      fetchLandingChainData(connected ? address : zeroAddress, protocolNetwork.id, {
        signal: controller.signal,
        onPartial: (partial) => {
          if (requestGeneration !== chainDataRequestGeneration.current
              || walletScopeRef.current !== requestedWalletScope) return;
          setChainData(partial);
          setChainDataStatus('partial');
        },
      })
        .then((nextChainData) => {
          if (requestGeneration !== chainDataRequestGeneration.current
              || walletScopeRef.current !== requestedWalletScope) return;
          setChainData(nextChainData);
          setChainDataStatus('ready');
        })
        .catch((error) => {
          if (requestGeneration !== chainDataRequestGeneration.current
              || walletScopeRef.current !== requestedWalletScope) return;
          setChainData(EMPTY_CHAIN_DATA);
          setChainDataStatus('error');
          setDataError(error?.shortMessage || error?.message || 'Could not load onchain data.');
        });
    } else {
      setChainData(EMPTY_CHAIN_DATA);
      setChainDataStatus('idle');
    }

    return () => controller.abort();
  }, [address, chainId, connected]);

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
    fetchInsuranceScore(address, {
      chainId: activeNetwork.id,
      refresh: true,
      signal: controller.signal,
    })
      .then((nextScore) => {
        if (walletScopeRef.current !== requestedWalletScope
            || scoreRefreshAttempt.current !== refreshKey) return;
        setScore(scoreWithTokenBreakdown(nextScore, activeNetwork.contracts));
      })
      .catch((error) => {
        if (walletScopeRef.current === requestedWalletScope
            && scoreRefreshAttempt.current === refreshKey
            && error.name !== 'AbortError') {
          console.warn('Insurance Score refresh failed', error);
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
    } finally {
      setConnecting(false);
    }
  }

  async function disconnect() {
    await disconnectAsync();
  }

  function assertCurrentWalletScope(expectedWalletScope = walletScopeKey) {
    if (walletScopeRef.current === expectedWalletScope) return;
    const error = new Error('Wallet account or network changed. Review the current state and try again.');
    error.name = 'WalletScopeChangedError';
    throw error;
  }

  async function refreshChainData(expectedWalletScope = walletScopeKey) {
    assertCurrentWalletScope(expectedWalletScope);
    if (!address || !protocolNetwork) return;
    const clearInsuranceTokens = () => setChainData((current) => ({
      ...current,
      insurance: { ...current.insurance, tokens: {} },
    }));
    clearInsuranceTokens();
    setChainDataStatus('loading');
    try {
      const nextChainData = await fetchLandingChainData(address, protocolNetwork.id);
      if (walletScopeRef.current !== expectedWalletScope) return;
      setChainData(nextChainData);
      setChainDataStatus('ready');
      return nextChainData;
    } catch (error) {
      if (walletScopeRef.current === expectedWalletScope) {
        clearInsuranceTokens();
        setChainDataStatus('error');
      }
      throw error;
    }
  }

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
    simulateBeforeSubmit = false,
  ) {
    assertCurrentWalletScope(expectedWalletScope);
    const network = requireProtocolNetwork();
    const client = publicClientFor(network.id);
    setStatus(pendingMessage);
    let preparedRequest = request;
    if (simulateBeforeSubmit) {
      const simulation = await client.simulateContract({ account: address, ...request });
      assertCurrentWalletScope(expectedWalletScope);
      preparedRequest = simulation.request;
    }
    const estimatedGas = await client.estimateContractGas({ account: address, ...preparedRequest });
    assertCurrentWalletScope(expectedWalletScope);
    const gas = estimatedGas + estimatedGas / 2n;
    const hash = await writeContractAsync({ account: address, chainId: network.id, ...preparedRequest, gas });
    if (!hash) throw new Error('Transaction cancelled in your wallet.');
    if (walletScopeRef.current === expectedWalletScope) {
      setStatus(`Transaction submitted: ${hash.slice(0, 10)}…${hash.slice(-4)}`);
    }
    const receipt = await client.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('Transaction reverted.');
    if (walletScopeRef.current === expectedWalletScope) await refreshChainData(expectedWalletScope);
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
    if (shares <= 0n) throw new Error('Cooldown share amount must be positive.');
    await submitTransaction({
      address: pool.address,
      abi: poolWriteAbi,
      functionName: 'requestRedeem',
      args: [shares],
    }, 'Confirm the seven-day cooldown request in your wallet.', setPoolStatus);
    setPoolStatus('Cooldown started. Shares stop earning but remain loss-exposed until the exit epoch settles.');
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
          await submitTransaction({
            address: approvalToken,
            abi: erc20Abi,
            functionName: 'approve',
            args: [contracts.defiInsurance, requiredAmount],
          }, 'Approve token in your wallet.', setCurrentClaimStatus, expectedWalletScope);
          assertCurrentClaimOperation();
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
          await submitTransaction({
            address: boosterCollection,
            abi: erc1155Abi,
            functionName: 'setApprovalForAll',
            args: [contracts.defiInsurance, true],
          }, 'Approve Boosters in your wallet.', setCurrentClaimStatus, expectedWalletScope);
          assertCurrentClaimOperation();
        }
      }

      // Opening authorizations are block-bounded. Obtain one only after every
      // prerequisite approval is confirmed so wallet latency cannot age it out.
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
        activeIncidentId = await client.readContract({
          address: contracts.defiInsurance,
          abi: claimWriteAbi,
          functionName: 'activeIncidentId',
        });
        assertCurrentClaimOperation();
        if (activeIncidentId === 0n) {
          referenceBlock = authorization.referenceBlock;
          signature = authorization.signature;
        }
      }

      await submitTransaction({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'fileClaim',
        args: [insuredToken, insuredTokenAmount, scoreToSpend, boosterAmount, referenceBlock, signature],
      }, 'Confirm the claim in your wallet.', setCurrentClaimStatus, expectedWalletScope, true);
      assertCurrentClaimOperation();
      if (walletScopeRef.current === expectedWalletScope) {
        setClaimStatus(`Claim confirmed on ${network.name}.`);
      }
    } catch (error) {
      if (claimAbortController.current === controller
        && walletScopeRef.current === expectedWalletScope
        && error?.name !== 'AbortError') {
        setClaimStatusIsWarning(true);
        setClaimStatus(error?.shortMessage || error?.message || 'Claim submission failed.');
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
      claimId: chainData.claim.id,
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
      }
      assertCurrentWalletScope(expectedWalletScope);
      await submitTransaction({
        address: network.contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'finalizeClaim',
        args: row
          ? [BigInt(latestClaim.id), acceptPayout, row.amounts, row.scoreSpent, row.boostedScore, row.eligibleAmount, row.proof]
          : [BigInt(latestClaim.id), false, [], 0n, 0n, 0n, []],
      }, acceptPayout ? 'Confirm payout acceptance in your wallet.' : 'Confirm token return in your wallet.', setClaimStatus, expectedWalletScope);
      if (walletScopeRef.current !== expectedWalletScope) return;
      setClaimToken(null);
      setClaimStatus('');
    } catch (error) {
      if (walletScopeRef.current !== expectedWalletScope) return;
      setClaimStatusIsWarning(true);
      setClaimStatus(error?.shortMessage || error?.message || 'Claim finalization failed.');
    }
  }

  function openUsd8Action(action) {
    if (!connected || !protocolNetwork) return;
    setUsd8Status('');
    setUsd8Action(action);
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
    && chainDataStatus === 'loading';
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
    : canSimulateCurrentScore && scoreStatus !== 'ready'
      ? scoreWithCurrentBalanceRates(
        EMPTY_SCORE,
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
  const actionableIncident = chainData.claim?.resolved ? null : chainData.incident;

  // The settlement artifact is still being fetched, so the payout figures are
  // unknown rather than unavailable.
  const payoutLoading = Boolean(unresolvedClaim)
    && !selectedSettlementRow
    && !claimStatusIsWarning;
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
      scoreToSpend: groupDecimalString(chainData.claim.scoreToSpend),
      phaseWindowDays: Math.max(1, Math.ceil(chainData.incident.phaseWindowMilliseconds / 86_400_000)),
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
    <>
      <USD8Landing
        wallet={{
          address,
          connected,
          connecting,
          networkName: activeNetwork?.name || (connected ? `Chain ${chainId}` : ''),
          networkUnavailableReason: protocolUnavailableReason,
          connectUnavailableReason: !connected && !walletConnectorConfigured ? WALLET_CONNECT_UNAVAILABLE_REASON : '',
          onConnect: connect,
          onDisconnect: disconnect,
        }}
        score={connected ? displayedScore : EMPTY_SCORE}
        scoreStatus={connected ? scoreStatusForDisplay : 'ready'}
        balances={connected ? chainData.balances : EMPTY_CHAIN_DATA.balances}
        balancesLoading={balancesLoading}
        savingsVault={savingsVault}
        pools={displayedPools}
        poolLoading={poolLoading}
        dataError={dataError}
        incident={actionableIncident}
        insuredTokenStates={insuredTokenStates}
        onFileClaim={fileClaimAction}
        fileClaimUnavailableReason={connected ? protocolUnavailableReason : CONNECT_WALLET_REASON}
        onPoolAction={openPoolAction}
        onUsd8Action={openUsd8Action}
      />
      {connected && claimToken ? (
        <FileClaimDialog
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
          availableScore={score?.availableScore || '0'}
          availableBoosters={chainData.balances.boosters || '0'}
          claimBond="10 USD8"
          claimBondAvailable={chainData.balances.usd8}
          claimTotals={{ scoreCommitted: chainData.incident?.totalScoreCommitted || '0' }}
          boosterBoostBps={chainData.incident?.boosterBoostBps || 0}
          claimStatus={selectedClaimStatus}
          payoutLoading={payoutLoading}
          submitUnavailableReason={!protocolNetwork?.contracts.insuredTokens?.[claimToken.id]
            || !insuredTokenStates[claimToken.id]?.enabled
            ? `${claimToken.symbol} is not enabled for claims on ${protocolNetwork?.name || 'the selected network'}.`
            : (claimSubmitting
              ? 'Claim preparation is in progress.'
              : ((!chainData.activeIncidentId || chainData.activeIncidentId === '0') && !claimApiConfigured
                ? 'Claim verification service is not configured.'
                : ''))}
          statusMessage={claimStatus}
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
          onCancel={cancelClaim}
          onSettle={settleClaim}
          onReturnTokens={() => finalizeCurrentClaim(false)}
          onAcceptPayout={() => finalizeCurrentClaim(true)}
          onCancelPayout={() => finalizeCurrentClaim(false)}
          onSubmit={submitClaim}
        />
      ) : null}
      {connected && usd8Action ? (
        <Usd8ActionDialog
          mode={usd8Action}
          usdcBalance={chainData.balances.usdc}
          usd8Balance={chainData.balances.usd8}
          statusMessage={usd8Status}
          statusFailed={usd8StatusFailed}
          onInputChange={() => setUsd8Status('')}
          onModeChange={(action) => {
            setUsd8Status('');
            setUsd8Action(action);
          }}
          onClose={() => {
            setUsd8Status('');
            setUsd8Action(null);
          }}
          onSubmit={submitUsd8Action}
          submitUnavailableReason={protocolUnavailableReason}
        />
      ) : null}
      {connected && poolAction ? (
        <PoolActionDialog
          mode={poolAction}
          poolName={activePool?.name || 'cover pool'}
          assetSymbol={activePool?.assetSymbol || ''}
          shareSymbol={activePool?.shareSymbol || ''}
          coverAssetBalance={activePool?.assetBalance || '0'}
          activeIncidentId={chainData.activeIncidentId}
          capacityUncapped={activePool?.capacityUncapped}
          remainingDepositCapacity={activePool?.remainingDepositCapacity}
          poolShareBalance={activePool?.availableForCooldown || '0'}
          availableForCooldown={activePool?.availableForCooldown}
          availableForWithdraw={activePool?.availableForWithdraw}
          inCooldown={activePool?.inCooldown}
          cooldownEndsAtMilliseconds={activePool?.cooldownEndsAtMilliseconds}
          earnings={livePoolAction.earnings}
          hasEarnings={livePoolAction.hasEarnings}
          statusMessage={poolStatus}
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
          onSubmit={submitPoolAction}
          submitUnavailableReason={protocolUnavailableReason}
        />
      ) : null}
    </>
  );
}