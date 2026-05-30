import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import arrowDown from '../assets/arrowDown.png';
import sUsd8Logo from '../assets/sUSD8.svg';
import usdcLogo from '../assets/usdc.png';

const DUMMY_VALUES = {
  usd8Balance: '3000',
  usd8Value: '$3000',
  usd8Rate: '10',
  usd8HistoryEarned: '234231',
  usd8Insurance: '80%',
  sUsd8Balance: '200',
  sUsd8Value: '$230',
  sUsd8Apy: '3.5%',
  sUsd8Rate: '1',
  sUsd8HistoryEarned: '1800',
  sUsd8Insurance: '80%',
};

const ZERO_VALUES = {
  usd8Balance: '0',
  usd8Value: '$0',
  usd8Rate: '0',
  usd8HistoryEarned: '0',
  usd8Insurance: '0%',
  sUsd8Balance: '0',
  sUsd8Value: '$0',
  sUsd8Apy: '0%',
  sUsd8Rate: '0',
  sUsd8HistoryEarned: '0',
  sUsd8Insurance: '0%',
};

const WALLET_DISCONNECTED_KEY = 'usd8-dashboard-wallet-disconnected';

const ACTION_CONFIG = {
  mint: {
    title: 'Mint USD8',
    action: 'Mint',
    from: 'USDC',
    to: 'USD8',
    fromCoin: 'usdc',
    toCoin: 'usd8',
    defaultAmount: '2000',
  },
  redeem: {
    title: 'Redeem USD8',
    action: 'Redeem',
    from: 'USD8',
    to: 'USDC',
    fromCoin: 'usd8',
    toCoin: 'usdc',
    defaultAmount: '2000',
  },
  deposit: {
    title: 'Deposit USD8',
    action: 'Deposit',
    from: 'USD8',
    to: 'sUSD8',
    fromCoin: 'usd8',
    toCoin: 'susd8',
    defaultAmount: '200',
  },
  withdraw: {
    title: 'Withdraw USD8',
    action: 'Withdraw',
    from: 'sUSD8',
    to: 'USD8',
    fromCoin: 'susd8',
    toCoin: 'usd8',
    defaultAmount: '200',
  },
};

function parseScore(value) {
  const score = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(score) ? score : 0;
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

function Stat({ label, value, helper }) {
  return (
    <div className="dashboard-stat">
      <div className="dashboard-stat-label">{label}</div>
      <div className="dashboard-stat-value">{value}</div>
      {helper ? <div className="dashboard-stat-helper">{helper}</div> : null}
    </div>
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
          <div className="dashboard-conversion-rail">
            <Coin type={config.fromCoin} size="xl" />
            <span className="dashboard-rail-arrow" aria-hidden="true">
              <img src={arrowDown} alt="" />
            </span>
            <Coin type={config.toCoin} size="xl" />
          </div>

          <div className="dashboard-conversion-fields">
            <div className="dashboard-conversion-row">
              <span className="dashboard-token-label">{config.from}</span>
              <input
                className="dashboard-amount-input"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))}
                aria-label={`${config.from} amount`}
              />
              <div className="dashboard-percent-options" aria-label="Quick amount options">
                <button type="button" onClick={() => setAmount('500')}>25%</button>
                <button type="button" onClick={() => setAmount('1000')}>50%</button>
                <button type="button" onClick={() => setAmount(config.defaultAmount)}>100%</button>
              </div>
            </div>

            <div className="dashboard-conversion-row dashboard-conversion-row--output">
              <span className="dashboard-token-label">{config.to}</span>
              <span className="dashboard-output-amount">{outputAmount}</span>
            </div>
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
  const connected = Boolean(address);
  const values = connected ? DUMMY_VALUES : ZERO_VALUES;
  const modalConfig = modalKey ? ACTION_CONFIG[modalKey] : null;
  const totalHistoryScore = useMemo(() => (
    parseScore(values.usd8HistoryEarned) + parseScore(values.sUsd8HistoryEarned)
  ).toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, ''), [values]);

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
    <div className="dashboard-page">
      <div className="dashboard-top">
        <h1>Dashboard</h1>
        <p className="dashboard-wallet-line">
          {connected ? (
            <>
              Wallet connected as{' '}
              <button className="dashboard-wallet-link" type="button" onClick={onWalletButtonClick}>
                {address}
              </button>
            </>
          ) : (
            <>
              Wallet not connected{' '}
              <button className="dashboard-wallet-link" type="button" disabled={connecting} onClick={onWalletButtonClick}>
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </>
          )}
        </p>
      </div>
      {walletError ? <p className="dashboard-wallet-error">{walletError}</p> : null}

      <div className="dashboard-summary-row">
        <div className="dashboard-total-card">
          <span>Total History Score Earned</span>
          <strong>{totalHistoryScore}</strong>
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
          <Stat label="Your USD8 Balance" value={values.usd8Balance} helper={values.usd8Value} />
          <Stat label="History Score Earning Rate" value={values.usd8Rate} helper="per USD8 per block" />
          <Stat label="History Score Earned" value={values.usd8HistoryEarned} />
          <Stat label="Insurance Upto" value={values.usd8Insurance} />
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
          <Stat label="Your sUSD8 Balance" value={values.sUsd8Balance} helper={values.sUsd8Value} />
          <Stat label="APY" value={values.sUsd8Apy} helper="7D 14D 30D" />
          <Stat label="History Score Earning Rate" value={values.sUsd8Rate} helper="per sUSD8 per block" />
          <Stat label="History Score Earned" value={values.sUsd8HistoryEarned} />
          <Stat label="Insurance Upto" value={values.sUsd8Insurance} />
        </div>
      </AssetSection>

      {modalConfig ? <ActionModal config={modalConfig} connected={connected} onClose={() => setModalKey('')} /> : null}
      {disconnectOpen ? <DisconnectModal onCancel={() => setDisconnectOpen(false)} onConfirm={disconnectWallet} /> : null}
    </div>
  );
}
