import { useEffect, useRef, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { parseUnits, zeroAddress } from 'viem';
import { useAccount, useChainId, useDisconnect, useWriteContract } from 'wagmi';
import AvailabilityAction, { CONNECT_WALLET_REASON } from './components/AvailabilityAction.jsx';
import { COVERED_PROTOCOL_ROWS } from './components/CoveredProtocolsTable.jsx';
import FileClaimDialog from './components/FileClaimDialog.jsx';
import USD8Landing from './components/USD8Landing.jsx';
import {
  erc20Abi,
  fetchLandingChainData,
  publicClientFor,
} from './lib/chainData.js';
import { displayAvailableBalance } from './lib/displayAvailableBalance.js';
import { useLivePoolEarnings } from './lib/livePoolEarnings.js';
import { fetchMorphoVault } from './lib/morphoApi.js';
import { getNetwork, getProtocolNetwork } from './lib/networkConfig.js';
import { claimApiConfigured, prepareIncidentOpen } from './lib/claimApi.js';
import { claimLifecycle } from './lib/claimLifecycle.js';
import { fetchInsuranceScore } from './lib/scoreApi.js';
import { tokenAmountExceedsBalance } from './lib/tokenAmount.js';
import { walletConnectorConfigured } from './lib/walletConnector.js';

const EMPTY_CHAIN_DATA = {
  activeIncidentId: '0',
  incident: null,
  claim: null,
  scoreBalances: null,
  balances: {
    usdc: '0', usd8: '0', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0', insuredTokens: {},
  },
  pool: {
    apy: '34%',
    tvl: '$122.2K',
    capacityPercent: 50,
    deposit: '0',
    availableForCooldown: '0',
    availableForWithdraw: '0',
    inCooldown: '0',
    cooldownEndsAtMilliseconds: 0,
    earnings: '0',
    hasEarnings: false,
    shareDecimals: 21,
  },
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
  return /^(?:\d+\.?\d*|\.\d+)$/.test(normalized) && Number(normalized) > 0 ? '1' : '';
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

function groupedDecimal(value) {
  const [whole, fraction] = String(value ?? '0').split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
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

function scoreBalanceRefreshKey(score, scoreBalances, contracts, chainId, address) {
  if (!scoredTokenBalancesChanged(score, scoreBalances, contracts)) return '';
  const tokenBalances = score.tokenScores.map((item) => `${item.token}:${item.balance}`).join('|');
  return [chainId, address.toLowerCase(), tokenBalances, scoreBalances.usd8, scoreBalances.savings].join(':');
}

const poolWriteAbi = [
  { type: 'function', name: 'deposit', stateMutability: 'nonpayable', inputs: [{ name: 'assets', type: 'uint256' }, { name: 'receiver', type: 'address' }], outputs: [{ name: 'shares', type: 'uint256' }] },
  { type: 'function', name: 'requestRedeem', stateMutability: 'nonpayable', inputs: [{ name: 'shares', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'completeRedeem', stateMutability: 'nonpayable', inputs: [{ name: 'receiver', type: 'address' }], outputs: [{ name: 'assets', type: 'uint256' }] },
  { type: 'function', name: 'claimReward', stateMutability: 'nonpayable', inputs: [], outputs: [{ name: 'reward', type: 'uint256' }] },
  { type: 'function', name: 'exitRequests', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'shares', type: 'uint256' }, { name: 'exitEpoch', type: 'uint64' }] },
];

const approveAbi = [
  ...erc20Abi,
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
];

const treasuryWriteAbi = [
  { type: 'function', name: 'mintUSD8', stateMutability: 'nonpayable', inputs: [{ name: 'usdcAmount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'redeemUSD8', stateMutability: 'nonpayable', inputs: [{ name: 'usd8Amount', type: 'uint256' }, { name: 'minUsdcOut', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'usd8ToUsdcRate', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
];

const claimWriteAbi = [
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
];

function DialogCloseButton({ label, onClose }) {
  return (
    <button className="app-dialog-close" type="button" aria-label={label} onClick={onClose}>×</button>
  );
}

function isWaitingStatus(message) {
  return message.includes('in your wallet.')
    || message.startsWith('Checking ')
    || message.startsWith('Verifying ')
    || message.startsWith('Transaction submitted:');
}

function TransactionStatus({ message }) {
  if (!message) return null;
  const waiting = isWaitingStatus(message);
  return (
    <small className="usd8-dialog-status" role="status" aria-label="Transaction status" aria-live="polite">
      {waiting ? <span className="usd8-dialog-status-spinner" aria-hidden="true" /> : null}
      {message}
    </small>
  );
}

function Usd8ActionDialog({ mode, usdcBalance, usd8Balance, statusMessage, onInputChange, onModeChange, onClose, onSubmit, submitUnavailableReason = '' }) {
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
              <small>
                <button
                  className="usd8-dialog-available"
                  type="button"
                  aria-label={`Use full ${inputToken} balance ${availableBalance}`}
                  onClick={() => setAmount(availableBalance.replace(/,/g, ''))}
                >
                  {displayAvailableBalance(availableBalance)} available
                </button>
              </small>
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
            <TransactionStatus message={statusMessage} />
          </div>
        </form>
      </section>
    </div>
  );
}

function PoolActionDialog({
  mode,
  coverAssetBalance,
  poolShareBalance,
  availableForCooldown,
  availableForWithdraw,
  inCooldown,
  cooldownEndsAtMilliseconds,
  earnings,
  hasEarnings,
  statusMessage,
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
  const inputToken = depositing ? 'wstETH' : 'USD8-cp-wstETH';
  const available = depositing ? coverAssetBalance : availableForCooldown ?? poolShareBalance;
  const [amount, setAmount] = useState(() => defaultTokenAmount(available));
  const withdrawAvailable = availableForWithdraw ?? '0';
  const cooldownBalance = inCooldown ?? '0';
  const [currentTimeMilliseconds, setCurrentTimeMilliseconds] = useState(Date.now());
  const cooldownTiming = defaultTokenAmount(cooldownBalance)
    ? cooldownReadyLabel(cooldownEndsAtMilliseconds, currentTimeMilliseconds)
    : '';
  const hasWithdrawAvailable = !/^0(?:\.0+)?$/.test(String(withdrawAvailable).replace(/,/g, ''));
  const cooldownUnavailableReason = withdrawing && defaultTokenAmount(cooldownBalance)
    ? 'A cover-pool cooldown request is already active.'
    : (withdrawing && hasWithdrawAvailable
      ? 'Complete your existing cover-pool withdrawal before starting another cooldown.'
      : '');
  const actionUnavailableReason = submitUnavailableReason
    || (withdrawingEarnings && !hasEarnings ? 'No earnings to withdraw.' : '');
  const amountUnavailableReason = actionUnavailableReason
    || cooldownUnavailableReason
    || (!withdrawingEarnings
      ? tokenAmountValidationReason(amount, available, inputToken, depositing ? 'deposit' : 'start cooldown')
      : '');

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
      <section className="usd8-dialog" role="dialog" aria-modal="true" aria-label="Manage wstEth cover pool">
        <DialogCloseButton label="Close cover pool actions" onClose={onClose} />
        <nav className="usd8-dialog-tabs usd8-dialog-tabs--pool" aria-label="wstEth pool action">
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
                  <small className="usd8-dialog-withdrawal-availability">
                    <button
                      className="usd8-dialog-available"
                      type="button"
                      aria-label={`Use full ${inputToken} balance ${available}`}
                      onClick={() => setAmount(available.replace(/,/g, ''))}
                    >
                      {displayAvailableBalance(available)} available
                    </button>. 7-day cooldown if no pending claims. Otherwise after the claims are all finalized.{' '}
                    <a href={`${DOCS_BASE_URL}cover-pools.html`}>Learn More</a>.
                  </small>
                ) : (
                  <small>
                    <button
                      className="usd8-dialog-available"
                      type="button"
                      aria-label={`Use full ${inputToken} balance ${available}`}
                      onClick={() => setAmount(available.replace(/,/g, ''))}
                    >
                      {displayAvailableBalance(available)} available
                    </button>
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
                {statusAction === 'startCooldown' ? <TransactionStatus message={statusMessage} /> : null}
                <small className="usd8-dialog-withdraw-balances">
                  {withdrawAvailable} available for withdraw, {cooldownBalance} in cooldown{cooldownTiming ? ` — ${cooldownTiming}` : ''}.
                </small>
                <AvailabilityAction
                  className="usd8-dialog-submit"
                  type="button"
                  onClick={() => onSubmit('withdraw', '')}
                  unavailableReason={actionUnavailableReason || (!hasWithdrawAvailable ? 'No cover-pool withdrawal is available yet.' : '')}
                >
                  Withdraw
                </AvailabilityAction>
                {statusAction === 'withdraw' ? <TransactionStatus message={statusMessage} /> : null}
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
            {!withdrawing ? <TransactionStatus message={statusMessage} /> : null}
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
  const [savingsVault, setSavingsVault] = useState(EMPTY_SAVINGS_VAULT);
  const [usd8Action, setUsd8Action] = useState(null);
  const [usd8Status, setUsd8Status] = useState('');
  const [poolAction, setPoolAction] = useState(null);
  const [poolStatus, setPoolStatus] = useState('');
  const [poolStatusAction, setPoolStatusAction] = useState('');
  const [claimToken, setClaimToken] = useState(null);
  const [claimStatus, setClaimStatus] = useState('');
  const [claimStatusIsWarning, setClaimStatusIsWarning] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const claimAbortController = useRef(null);
  const livePool = useLivePoolEarnings(chainData.pool);

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
          setScore(scoreWithTokenBreakdown(nextScore, activeNetwork.contracts));
          setScoreStatus('ready');
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            setScoreStatus('error');
          }
        });
    } else {
      setScore(null);
      setScoreStatus('idle');
    }

    if (protocolNetwork) {
      setChainDataStatus('loading');
      fetchLandingChainData(connected ? address : zeroAddress, protocolNetwork.id)
        .then((nextChainData) => {
          setChainData(nextChainData);
          setChainDataStatus('ready');
        })
        .catch(() => {
          setChainData(EMPTY_CHAIN_DATA);
          setChainDataStatus('error');
        });
    } else {
      setChainData(EMPTY_CHAIN_DATA);
      setChainDataStatus('idle');
    }

    return () => controller.abort();
  }, [address, chainId, connected]);

  useEffect(() => {
    if (!connected || !activeNetwork?.scoreAvailable || scoreStatus !== 'ready') {
      scoreRefreshAttempt.current = '';
      setScoreRefreshCompletedKey('');
      return undefined;
    }
    const refreshKey = scoreBalanceRefreshKey(
      score,
      chainData.scoreBalances,
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

    const controller = new AbortController();
    fetchInsuranceScore(address, {
      chainId: activeNetwork.id,
      refresh: true,
      signal: controller.signal,
    })
      .then((nextScore) => setScore(scoreWithTokenBreakdown(nextScore, activeNetwork.contracts)))
      .catch((error) => {
        if (error.name !== 'AbortError') console.warn('Insurance Score refresh failed', error);
      })
      .finally(() => setScoreRefreshCompletedKey(refreshKey));
    return () => controller.abort();
  }, [address, connected, activeNetwork, chainData.scoreBalances, score, scoreStatus]);

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

  async function refreshChainData() {
    if (address && protocolNetwork) setChainData(await fetchLandingChainData(address, protocolNetwork.id));
  }

  function requireProtocolNetwork() {
    if (!protocolNetwork) throw new Error(protocolUnavailableReason || 'USD8 is not deployed on the selected network.');
    return protocolNetwork;
  }

  async function submitTransaction(request, pendingMessage, setStatus) {
    const network = requireProtocolNetwork();
    const client = publicClientFor(network.id);
    setStatus(pendingMessage);
    const estimatedGas = await client.estimateContractGas({ account: address, ...request });
    const gas = estimatedGas + estimatedGas / 2n;
    const hash = await writeContractAsync({ chainId: network.id, ...request, gas });
    if (!hash) throw new Error('Transaction cancelled in your wallet.');
    setStatus(`Transaction submitted: ${hash.slice(0, 10)}…${hash.slice(-4)}`);
    const receipt = await client.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('Transaction reverted.');
    await refreshChainData();
  }

  async function depositToPool(raw) {
    const network = requireProtocolNetwork();
    const client = publicClientFor(network.id);
    const { contracts } = network;
    const amount = parseTokenAmount(raw, 18);
    if (amount <= 0n) throw new Error('Deposit amount must be positive.');
    const allowance = await client.readContract({
      address: contracts.coverAsset,
      abi: approveAbi,
      functionName: 'allowance',
      args: [address, contracts.coverPool],
    });
    if (allowance < amount) {
      await submitTransaction({
        address: contracts.coverAsset,
        abi: approveAbi,
        functionName: 'approve',
        args: [contracts.coverPool, amount],
      }, 'Approve wstETH in your wallet.', setPoolStatus);
    }
    await submitTransaction({
      address: contracts.coverPool,
      abi: poolWriteAbi,
      functionName: 'deposit',
      args: [amount, address],
    }, 'Confirm the cover-pool deposit in your wallet.', setPoolStatus);
    setPoolStatus(`Deposit confirmed on ${network.name}.`);
    return true;
  }

  async function startPoolCooldown(raw) {
    const network = requireProtocolNetwork();
    const { contracts } = network;
    const shares = parseTokenAmount(raw, chainData.pool.shareDecimals);
    if (shares <= 0n) throw new Error('Cooldown share amount must be positive.');
    await submitTransaction({
      address: contracts.coverPool,
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
      address: network.contracts.coverPool,
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
      address: network.contracts.coverPool,
      abi: poolWriteAbi,
      functionName: 'claimReward',
      args: [],
    }, 'Confirm the USD8 reward claim in your wallet.', setPoolStatus);
    setPoolStatus(`Rewards claimed on ${network.name}.`);
    return true;
  }

  function openPoolAction(action) {
    if (!connected || !protocolNetwork) return;
    setPoolStatus('');
    setPoolStatusAction('');
    setPoolAction(action);
  }

  async function submitPoolAction(action, raw) {
    try {
      setPoolStatus('');
      setPoolStatusAction(action);
      if (action === 'deposit') await depositToPool(raw);
      else if (action === 'startCooldown') await startPoolCooldown(raw);
      else if (action === 'withdraw') await completePoolWithdrawal();
      else if (action === 'claimReward') await claimPoolRewards();
    } catch (error) {
      setPoolStatus(error?.shortMessage || error?.message || 'Transaction failed.');
    }
  }

  function fileClaimAction(row) {
    if (!connected) return;
    setClaimStatus('');
    setClaimStatusIsWarning(false);
    setClaimToken(row);
  }

  async function submitClaim({ token, amount: rawAmount, scoreToSpend: rawScore, boosterAmount: rawBoosters }) {
    if (claimSubmitting) return;
    const controller = new AbortController();
    claimAbortController.current = controller;
    setClaimSubmitting(true);
    setClaimStatusIsWarning(false);
    setClaimStatus('Checking current incident and claim requirements.');
    try {
      const network = requireProtocolNetwork();
      const { contracts } = network;
      const client = publicClientFor(network.id);
      const insuredToken = contracts.insuredTokens?.[token];
      if (!insuredToken) throw new Error('This token is not enabled for claims on the selected network.');

      const insuredTokenAmount = parseTokenAmount(rawAmount, 18);
      const scoreToSpend = parseTokenAmount(rawScore, 18);
      if (!/^\d+$/.test(String(rawBoosters ?? ''))) throw new Error('Please enter a valid Booster amount.');
      const boosterAmount = BigInt(rawBoosters);
      if (insuredTokenAmount <= 0n) throw new Error('Insured token amount must be positive.');
      if (scoreToSpend <= 0n) throw new Error('Insurance score to spend must be positive.');
      if (boosterAmount !== 0n) throw new Error('Booster claims are not connected yet.');

      let activeIncidentId = await client.readContract({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'activeIncidentId',
      });
      const claimBondAmount = await client.readContract({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'claimBondAmount',
      });
      const usd8Balance = parseTokenAmount(String(chainData.balances.usd8).replace(/,/g, ''), 18);
      const usd8Required = insuredToken.toLowerCase() === contracts.usd8.toLowerCase()
        ? insuredTokenAmount + claimBondAmount
        : claimBondAmount;
      if (usd8Required > usd8Balance) {
        throw new Error(insuredToken.toLowerCase() === contracts.usd8.toLowerCase()
          ? 'Insufficient USD8 balance for the insured amount and claim bond.'
          : 'Insufficient USD8 balance for the claim bond.');
      }
      const approvals = insuredToken.toLowerCase() === contracts.usd8.toLowerCase()
        ? [[contracts.usd8, insuredTokenAmount + claimBondAmount]]
        : [
          [insuredToken, insuredTokenAmount],
          [contracts.usd8, claimBondAmount],
        ];
      for (const [approvalToken, requiredAmount] of approvals) {
        const allowance = await client.readContract({
          address: approvalToken,
          abi: approveAbi,
          functionName: 'allowance',
          args: [address, contracts.defiInsurance],
        });
        if (allowance < requiredAmount) {
          await submitTransaction({
            address: approvalToken,
            abi: approveAbi,
            functionName: 'approve',
            args: [contracts.defiInsurance, requiredAmount],
          }, 'Approve token in your wallet.', setClaimStatus);
        }
      }

      activeIncidentId = await client.readContract({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'activeIncidentId',
      });
      let referenceBlock = 0n;
      let signature = '0x';
      if (activeIncidentId === 0n) {
        setClaimStatus('Verifying incident in the TEE. First claim may take several minutes.');
        const authorization = await prepareIncidentOpen(insuredToken, {
          chainId: network.id,
          registry: contracts.registry,
          defiInsurance: contracts.defiInsurance,
          signal: controller.signal,
        });
        activeIncidentId = await client.readContract({
          address: contracts.defiInsurance,
          abi: claimWriteAbi,
          functionName: 'activeIncidentId',
        });
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
      }, 'Confirm the claim in your wallet.', setClaimStatus);
      setClaimStatus(`Claim confirmed on ${network.name}.`);
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setClaimStatusIsWarning(true);
        setClaimStatus(error?.shortMessage || error?.message || 'Claim submission failed.');
      }
    } finally {
      if (claimAbortController.current === controller) claimAbortController.current = null;
      setClaimSubmitting(false);
    }
  }

  async function cancelClaim() {
    try {
      const network = requireProtocolNetwork();
      setClaimStatusIsWarning(false);
      await submitTransaction({
        address: network.contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'cancelClaim',
        args: [],
      }, 'Confirm claim cancellation in your wallet.', setClaimStatus);
      setClaimToken(null);
      setClaimStatus('');
    } catch (error) {
      setClaimStatusIsWarning(true);
      setClaimStatus(error?.shortMessage || error?.message || 'Claim cancellation failed.');
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
        abi: approveAbi,
        functionName: 'allowance',
        args: [address, contracts.treasury],
      });
      if (allowance < amount) {
        await submitTransaction({
          address: contracts.usdc,
          abi: approveAbi,
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
      setUsd8Status(error?.shortMessage || error?.message || 'Transaction failed.');
    }
  }

  const scoreNeedsBalanceRefresh = connected
    && scoreStatus === 'ready'
    && chainDataStatus === 'ready'
    && scoredTokenBalancesChanged(score, chainData.scoreBalances, activeNetwork?.contracts);
  const currentScoreRefreshKey = scoreNeedsBalanceRefresh
    ? scoreBalanceRefreshKey(score, chainData.scoreBalances, activeNetwork.contracts, activeNetwork.id, address)
    : '';
  const displayedScoreStatus = connected
    && scoreStatus === 'ready'
    && protocolNetwork
    && (chainDataStatus === 'loading'
      || (scoreNeedsBalanceRefresh && scoreRefreshCompletedKey !== currentScoreRefreshKey))
    ? 'loading'
    : scoreStatus;
  const selectedClaimStatus = claimToken
    && chainData.claim
    && chainData.incident?.tokenId === claimToken.id
    ? {
      ...chainData.claim,
      ...claimLifecycle(chainData.incident),
      incident: chainData.incident,
      insuredTokenAmount: groupedDecimal(chainData.claim.insuredTokenAmount),
      bondAmount: groupedDecimal(chainData.claim.bondAmount),
      boosterAmount: groupedDecimal(chainData.claim.boosterAmount),
      scoreToSpend: groupedDecimal(chainData.claim.scoreToSpend),
      phaseWindowDays: Math.max(1, Math.ceil(chainData.incident.phaseWindowMilliseconds / 86_400_000)),
    }
    : null;

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
        score={connected ? score : EMPTY_SCORE}
        scoreStatus={connected ? displayedScoreStatus : 'ready'}
        balances={connected ? chainData.balances : EMPTY_CHAIN_DATA.balances}
        savingsVault={savingsVault}
        pool={chainData.pool}
        incident={chainData.incident}
        onFileClaim={fileClaimAction}
        fileClaimUnavailableReason={connected ? protocolUnavailableReason : CONNECT_WALLET_REASON}
        onPoolAction={openPoolAction}
        onUsd8Action={openUsd8Action}
      />
      {connected && claimToken ? (
        <FileClaimDialog
          token={claimToken.id}
          insuredTokens={CLAIM_TOKEN_ROWS.map((row) => ({
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
          availableBoosters="0"
          claimBond="10 USD8"
          claimBondAvailable={chainData.balances.usd8}
          claimTotals={{
            insuredTokenAmount: chainData.incident?.totalInsuredTokenClaims || '0',
            scoreCommitted: chainData.incident?.totalScoreCommitted || '0',
          }}
          maxIncidentAgeHours={144}
          requiresIncidentTime={!chainData.activeIncidentId || chainData.activeIncidentId === '0'}
          claimStatus={selectedClaimStatus}
          submitUnavailableReason={!protocolNetwork?.contracts.insuredTokens?.[claimToken.id]
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
          onSubmit={submitClaim}
        />
      ) : null}
      {connected && usd8Action ? (
        <Usd8ActionDialog
          mode={usd8Action}
          usdcBalance={chainData.balances.usdc}
          usd8Balance={chainData.balances.usd8}
          statusMessage={usd8Status}
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
          coverAssetBalance={chainData.balances.coverAsset}
          poolShareBalance={chainData.balances.poolShares}
          availableForCooldown={chainData.pool.availableForCooldown}
          availableForWithdraw={chainData.pool.availableForWithdraw}
          inCooldown={chainData.pool.inCooldown}
          cooldownEndsAtMilliseconds={chainData.pool.cooldownEndsAtMilliseconds}
          earnings={livePool.earnings}
          hasEarnings={livePool.hasEarnings}
          statusMessage={poolStatus}
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