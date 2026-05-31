import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import arrowDown from '../assets/arrowDown.png';
import greenWallet from '../assets/greenWallet.png';
import greyWallet from '../assets/greyWallet.png';
import sUsd8Logo from '../assets/sUSD8.svg';
import usdcLogo from '../assets/usdc.png';
import { computeDashboardCoverStats } from '../lib/coverScore.js';

const ZERO_VALUES = {
  usd8Balance: '0',
  usd8Rate: '0',
  usd8HistoryEarned: '0',
  usd8Insurance: '0%',
  sUsd8Balance: '0',
  sUsd8Apy: '0%',
  sUsd8Rate: '0',
  sUsd8HistoryEarned: '0',
  sUsd8Insurance: '0%',
};

const LOADING_VALUES = {
  usd8Balance: '...',
  usd8Rate: '...',
  usd8HistoryEarned: '...',
  usd8Insurance: '80%',
  sUsd8Balance: '...',
  sUsd8Rate: '...',
  sUsd8HistoryEarned: '...',
  sUsd8Insurance: '80%',
};

const WALLET_DISCONNECTED_KEY = 'usd8-dashboard-wallet-disconnected';

const APY_VALUES = {
  '7D': '3.5%',
  '14D': '5%',
  '30D': '6%',
};

const INFO_COPY = {
  usd8Rate: 'The amount of History Score you earn for holding 1 USD8 for 1 block.',
  usd8Earned: 'The total History Score earned from your USD8 balance.',
  usd8Insurance: 'The maximum insurance coverage available for your USD8 balance.',
  sUsd8Rate: 'The amount of History Score you earn for holding 1 sUSD8 for 1 block.',
  sUsd8Earned: 'The total History Score earned from your sUSD8 balance.',
  sUsd8Insurance: 'The maximum insurance coverage available for your sUSD8 balance.',
};

const ACTION_CONFIG = {
  mint: {
    title: 'Mint USD8',
    action: 'Mint',
    from: 'USDC',
    to: 'USD8',
    fromCoin: 'usdc',
    toCoin: 'usd8',
    availableValueKey: 'usd8Balance',
    defaultAmount: '200',
  },
  redeem: {
    title: 'Redeem USD8',
    action: 'Redeem',
    from: 'USD8',
    to: 'USDC',
    fromCoin: 'usd8',
    toCoin: 'usdc',
    availableValueKey: 'usd8Balance',
    defaultAmount: '200',
  },
  deposit: {
    title: 'Deposit USD8',
    action: 'Deposit',
    from: 'USD8',
    to: 'sUSD8',
    fromCoin: 'usd8',
    toCoin: 'susd8',
    availableValueKey: 'usd8Balance',
    defaultAmount: '200',
  },
  withdraw: {
    title: 'Withdraw USD8',
    action: 'Withdraw',
    from: 'sUSD8',
    to: 'USD8',
    fromCoin: 'susd8',
    toCoin: 'usd8',
    availableValueKey: 'sUsd8Balance',
    defaultAmount: '200',
  },
};

function parseScore(value) {
  if (isLoadingValue(value)) return null;
  const score = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(score) ? score : 0;
}

function isLoadingValue(value) {
  return String(value).includes('...');
}

function formatModalAmount(value) {
  if (!Number.isFinite(value) || value <= 0) return '0';
  return value.toFixed(6).replace(/\.?0+$/, '');
}

function getEthereum() {
  return window.ethereum?.providers?.find((provider) => provider.isMetaMask) || window.ethereum;
}

function isWalletDisconnected() {
  try {
    return window.localStorage.getItem(WALLET_DISCONNECTED_KEY) === 'true';
  } catch {
    return false;
  }
}

function rememberWalletDisconnected(disconnected) {
  try {
    if (disconnected) {
      window.localStorage.setItem(WALLET_DISCONNECTED_KEY, 'true');
      return;
    }

    window.localStorage.removeItem(WALLET_DISCONNECTED_KEY);
  } catch {}
}

function Coin({ type, size = 'md' }) {
  if (type === 'usd8' || type === 'susd8' || type === 'usdc') {
    const logo = type === 'susd8' ? sUsd8Logo : type === 'usdc' ? usdcLogo : '/assets/usd8Logo.svg';

    return (
      <span className={`dashboard-coin dashboard-coin--${size} dashboard-coin--${type}`}>
        <img src={logo} alt="" />
      </span>
    );
  }

  return (
    <span className={`dashboard-coin dashboard-coin--${size} dashboard-coin--${type}`} aria-hidden="true">
      $
    </span>
  );
}

function Stat({ label, value, tooltip }) {
  const labelLines = Array.isArray(label) ? label : [label];
  const tooltipLabel = labelLines.map((line) => (typeof line === 'string' ? line : '')).filter(Boolean).join(' ');

  return (
    <div className="dashboard-stat">
      <div className="dashboard-stat-label">
        {labelLines.map((line, index) => {
          const isLastLine = index === labelLines.length - 1;

          return (
            <span className="dashboard-stat-label-line" key={index}>
              {line}
              {isLastLine && tooltip ? (
                <span className="dashboard-help">
                  <button className="dashboard-help-button" type="button" aria-label={`${tooltipLabel} info`}>
                    ?
                  </button>
                  <span className="dashboard-help-tooltip" role="tooltip">
                    {tooltip}
                  </span>
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
      <div className="dashboard-stat-value"><DashboardNumber value={value} /></div>
    </div>
  );
}

function DashboardNumber({ value, size = 'stat' }) {
  if (!isLoadingValue(value)) return value;

  return (
    <span
      className={`dashboard-number-spinner dashboard-number-spinner--${size}`}
      role="status"
      aria-label="Loading calculated value"
    />
  );
}

function ApyRangeSelector({ active, onSelect }) {
  return (
    <span className="dashboard-apy-range" aria-label="APY range">
      {Object.keys(APY_VALUES).map((range) => (
        <button
          className={active === range ? 'active' : ''}
          type="button"
          key={range}
          onClick={() => onSelect(range)}
          aria-pressed={active === range}
        >
          {range}
        </button>
      ))}
    </span>
  );
}

function ActionButton({ children, disabled, onClick }) {
  return (
    <button className="dashboard-action-button" type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function AssetSection({ type, title, actions, children }) {
  return (
    <section className={`dashboard-asset dashboard-asset--${type}`}>
      <div className="dashboard-asset-header">
        <div className="dashboard-asset-title">
          <Coin type={type} size="lg" />
          <h2>{title}</h2>
        </div>
        <div className="dashboard-asset-actions">{actions}</div>
      </div>
      {children}
    </section>
  );
}

function ActionModal({ config, connected, onClose }) {
  const [amount, setAmount] = useState(config.defaultAmount);
  const outputAmount = amount || '0';
  const availableAmount = parseScore(config.availableValue);
  const availableText = availableAmount === null ? '... available' : `${config.availableValue} available`;
  const setPercentAmount = (percent) => {
    const baseAmount = availableAmount;
    if (!Number.isFinite(baseAmount)) return;

    setAmount(formatModalAmount((baseAmount * percent) / 100));
  };

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="dashboard-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-modal-title">
        <button className="dashboard-modal-close" type="button" aria-label="Close dialog" onClick={onClose}>
          <X size={22} strokeWidth={2} />
        </button>

        <h2 id="dashboard-modal-title">{config.title}</h2>

        <div className="dashboard-conversion">
          <div className="dashboard-conversion-row dashboard-conversion-row--input">
            <Coin type={config.fromCoin} size="xl" />
            <span className="dashboard-token-label">{config.from}</span>
            <div className="dashboard-amount-field">
              <input
                className="dashboard-amount-input"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))}
                aria-label={`${config.from} amount`}
              />
              <div className="dashboard-amount-meta">
                <span className="dashboard-available">{availableText}</span>
                <div className="dashboard-percent-options" aria-label="Quick amount options">
                  <button type="button" disabled={availableAmount === null} onClick={() => setPercentAmount(25)}>25%</button>
                  <button type="button" disabled={availableAmount === null} onClick={() => setPercentAmount(50)}>50%</button>
                  <button type="button" disabled={availableAmount === null} onClick={() => setPercentAmount(100)}>100%</button>
                </div>
              </div>
            </div>
          </div>

          <span className="dashboard-rail-arrow" aria-hidden="true">
            <img src={arrowDown} alt="" />
          </span>

          <div className="dashboard-conversion-row dashboard-conversion-row--output">
            <Coin type={config.toCoin} size="xl" />
            <span className="dashboard-token-label">{config.to}</span>
            <span className="dashboard-output-amount">{outputAmount}</span>
          </div>
        </div>

        <button className="dashboard-modal-action" type="button" disabled={!connected}>
          {config.action}
        </button>
      </section>
    </div>
  );
}

function DisconnectModal({ onCancel, onConfirm }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onCancel();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="dashboard-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section className="dashboard-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="disconnect-title">
        <button className="dashboard-modal-close" type="button" aria-label="Close dialog" onClick={onCancel}>
          <X size={22} strokeWidth={2} />
        </button>
        <h2 id="disconnect-title">Disconnect wallet?</h2>
        <p>Disconnecting will clear your dashboard values in this session.</p>
        <div className="dashboard-confirm-actions">
          <button className="dashboard-confirm-secondary" type="button" onClick={onCancel}>Cancel</button>
          <button className="dashboard-confirm-primary" type="button" onClick={onConfirm}>Yes, disconnect</button>
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const [address, setAddress] = useState('');
  const [walletError, setWalletError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [modalKey, setModalKey] = useState('');
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [apyRange, setApyRange] = useState('7D');
  const [dashboardValues, setDashboardValues] = useState(ZERO_VALUES);
  const [scoreError, setScoreError] = useState('');
  const connected = Boolean(address);
  const values = connected ? dashboardValues : ZERO_VALUES;
  const sUsd8Apy = connected ? APY_VALUES[apyRange] : ZERO_VALUES.sUsd8Apy;
  const modalConfig = useMemo(() => {
    const config = modalKey ? ACTION_CONFIG[modalKey] : null;
    if (!config) return null;

    return {
      ...config,
      availableValue: values[config.availableValueKey] ?? '0',
    };
  }, [modalKey, values]);
  const totalHistoryScore = useMemo(() => {
    const usd8Score = parseScore(values.usd8HistoryEarned);
    const sUsd8Score = parseScore(values.sUsd8HistoryEarned);
    if (usd8Score === null || sUsd8Score === null) return '...';

    return (usd8Score + sUsd8Score).toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, '');
  }, [values]);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum?.request) return;

    let mounted = true;

    if (!isWalletDisconnected()) {
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts) => {
          if (mounted && accounts?.[0]) setAddress(accounts[0]);
        })
        .catch(() => {});
    }

    function onAccountsChanged(accounts = []) {
      if (isWalletDisconnected()) {
        setAddress('');
        return;
      }

      setAddress(accounts[0] || '');
      setWalletError('');
    }

    ethereum.on?.('accountsChanged', onAccountsChanged);
    return () => {
      mounted = false;
      ethereum.removeListener?.('accountsChanged', onAccountsChanged);
    };
  }, []);

  useEffect(() => {
    if (!address) {
      setDashboardValues(ZERO_VALUES);
      setScoreError('');
      return undefined;
    }

    let cancelled = false;
    setDashboardValues(LOADING_VALUES);
    setScoreError('');

    computeDashboardCoverStats(address)
      .then(({ values: liveValues }) => {
        if (!cancelled) setDashboardValues(liveValues);
      })
      .catch((error) => {
        if (cancelled) return;
        setDashboardValues(ZERO_VALUES);
        setScoreError(error?.shortMessage || error?.message || 'Unable to calculate live cover score.');
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  async function connectWallet() {
    const ethereum = getEthereum();
    setWalletError('');

    if (!ethereum?.request) {
      setWalletError('No wallet found. Install MetaMask or another injected wallet.');
      return;
    }

    setConnecting(true);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      rememberWalletDisconnected(false);
      setAddress(accounts?.[0] || '');
    } catch (error) {
      setWalletError(error?.message || 'Wallet connection was cancelled.');
    } finally {
      setConnecting(false);
    }
  }

  function onWalletButtonClick() {
    if (connected) {
      setDisconnectOpen(true);
      return;
    }

    connectWallet();
  }

  function disconnectWallet() {
    rememberWalletDisconnected(true);
    setAddress('');
    setModalKey('');
    setWalletError('');
    setDisconnectOpen(false);
  }

  function openAction(key) {
    if (!connected) {
      setWalletError('Connect a wallet to use dashboard actions.');
      return;
    }

    setModalKey(key);
  }

  return (
    <div className={`dashboard-page${connected ? '' : ' dashboard-page--disconnected'}`}>
      <div className="dashboard-top">
        <h1>Dashboard</h1>
        <p className="dashboard-wallet-line">
          <img className="dashboard-wallet-icon" src={connected ? greenWallet : greyWallet} alt="" />
          {connected ? (
            <span className="dashboard-wallet-copy">
              Wallet connected as{' '}
              <button className="dashboard-wallet-link" type="button" onClick={onWalletButtonClick}>
                {address}
              </button>
            </span>
          ) : (
            <span className="dashboard-wallet-copy">
              Wallet not connected{' '}
              <button className="dashboard-wallet-link" type="button" disabled={connecting} onClick={onWalletButtonClick}>
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </span>
          )}
        </p>
      </div>
      {walletError ? <p className="dashboard-wallet-error">{walletError}</p> : null}
      {scoreError ? <p className="dashboard-wallet-error">Could not calculate live history score: {scoreError}</p> : null}

      <div className="dashboard-summary-row">
        <div className="dashboard-total-card">
          <span>Total History Score Earned</span>
          <strong><DashboardNumber value={totalHistoryScore} size="total" /></strong>
        </div>
      </div>

      <AssetSection
        type="usd8"
        title="USD8"
        actions={(
          <>
            <ActionButton disabled={!connected} onClick={() => openAction('mint')}>Mint USD8</ActionButton>
            <ActionButton disabled={!connected} onClick={() => openAction('redeem')}>Redeem USD8</ActionButton>
          </>
        )}
      >
        <div className="dashboard-stats dashboard-stats--usd8">
          <Stat label={['USD8', 'Balance']} value={values.usd8Balance} />
          <Stat label={['History Score', 'Earning Rate']} value={values.usd8Rate} tooltip={INFO_COPY.usd8Rate} />
          <Stat label={['History Score', 'Earned']} value={values.usd8HistoryEarned} tooltip={INFO_COPY.usd8Earned} />
          <Stat label={['Insurance', 'Upto']} value={values.usd8Insurance} tooltip={INFO_COPY.usd8Insurance} />
        </div>
      </AssetSection>

      <AssetSection
        type="susd8"
        title="USD8 Savings - sUSD8"
        actions={(
          <>
            <ActionButton disabled={!connected} onClick={() => openAction('deposit')}>Deposit USD8</ActionButton>
            <ActionButton disabled={!connected} onClick={() => openAction('withdraw')}>Withdraw USD8</ActionButton>
          </>
        )}
      >
        <div className="dashboard-stats dashboard-stats--savings">
          <Stat label={['sUSD8', 'Balance']} value={values.sUsd8Balance} />
          <Stat
            label={[
              'APY',
              <ApyRangeSelector active={apyRange} onSelect={setApyRange} />,
            ]}
            value={sUsd8Apy}
          />
          <Stat label={['History Score', 'Earning Rate']} value={values.sUsd8Rate} tooltip={INFO_COPY.sUsd8Rate} />
          <Stat label={['History Score', 'Earned']} value={values.sUsd8HistoryEarned} tooltip={INFO_COPY.sUsd8Earned} />
          <Stat label={['Insurance', 'Upto']} value={values.sUsd8Insurance} tooltip={INFO_COPY.sUsd8Insurance} />
        </div>
      </AssetSection>

      {modalConfig ? <ActionModal config={modalConfig} connected={connected} onClose={() => setModalKey('')} /> : null}
      {disconnectOpen ? <DisconnectModal onCancel={() => setDisconnectOpen(false)} onConfirm={disconnectWallet} /> : null}
    </div>
  );
}
