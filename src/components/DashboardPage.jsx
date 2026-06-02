import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';
import arrowDown from '../assets/arrowDown.png';
import greenWallet from '../assets/greenWallet.png';
import greyWallet from '../assets/greyWallet.png';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
import usdcLogo from '../assets/usdc.png';
import CoverPoolTable, { COVER_POOL_ROWS } from './CoverPoolTable.jsx';
import CoveredProtocolsTable from './CoveredProtocolsTable.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import { BuildingPill } from './PagePrimitives.jsx';
import TableTokenCell from './TableTokenCell.jsx';
import { computeDashboardCoverStats } from '../lib/coverScore.js';
import { walletConnectorConfigured } from '../lib/walletConnector.js';

const ZERO_VALUES = {
  usd8Balance: '0',
  usd8Rate: '0',
  usd8HistoryEarned: '0',
  sUsd8Balance: '0',
  sUsd8Rate: '0',
  sUsd8HistoryEarned: '0',
};

const LOADING_VALUES = {
  usd8Balance: '...',
  usd8Rate: '...',
  usd8HistoryEarned: '...',
  sUsd8Balance: '...',
  sUsd8Rate: '...',
  sUsd8HistoryEarned: '...',
};

const DEFAULT_SUSD8_APY = '3.5%';

const INFO_COPY = {
  tableRate: 'This is the standard daily Insurance Score earning rate per token. Your actual daily score is this rate multiplied by your token balance.',
  tableUserRate: 'This is your daily Insurance Score earning rate based on your current token balance and the standard rate.',
  tableEarned: 'The total Insurance Score earned from this token position.',
};

const TOTAL_INSURANCE_SCORE_COPY = 'This is the total overall Insurance Score you have earned through different token positions. This score can be used to claim insurance for any covered DeFi protocol. The actual claim amount depends on the claim, and the more score you have, the more you may be able to claim.';
const AVAILABLE_INSURANCE_SCORE_COPY = 'This is the Insurance Score currently available for Free Insurance claims. The more Insurance Score you have, the more coverage you may receive.';

const ACTION_CONFIG = {
  mint: {
    title: 'Mint USD8',
    action: 'Mint',
    from: 'USDC',
    to: 'USD8',
    fromCoin: 'usdc',
    toCoin: 'usd8',
    availableValueKey: 'usd8Balance',
  },
  redeem: {
    title: 'Redeem USD8',
    action: 'Redeem',
    from: 'USD8',
    to: 'USDC',
    fromCoin: 'usd8',
    toCoin: 'usdc',
    availableValueKey: 'usd8Balance',
  },
  deposit: {
    title: 'Deposit USD8',
    action: 'Deposit',
    from: 'USD8',
    to: 'sUSD8',
    fromCoin: 'usd8',
    toCoin: 'susd8',
    availableValueKey: 'usd8Balance',
  },
  withdraw: {
    title: 'Withdraw USD8',
    action: 'Withdraw',
    from: 'sUSD8',
    to: 'USD8',
    fromCoin: 'susd8',
    toCoin: 'usd8',
    availableValueKey: 'sUsd8Balance',
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

function getWalletInputAmount(availableValue) {
  const availableAmount = parseScore(availableValue);
  return availableAmount === null ? '0' : formatModalAmount(availableAmount);
}

function formatInsuranceRate(value) {
  if (!Number.isFinite(value) || value <= 0) return '0';

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4,
    useGrouping: false,
  }).format(value);
}

function getUserInsuranceRate(balance, standardRate) {
  const balanceValue = parseScore(balance);
  const standardRateValue = parseScore(standardRate);
  if (balanceValue === null || standardRateValue === null) return '...';

  return formatInsuranceRate(balanceValue * standardRateValue);
}

function formatCompactStatValue(value) {
  if (isLoadingValue(value)) return value;

  const rawValue = String(value).trim();
  if (!rawValue || rawValue.includes('%')) return value;

  const normalizedValue = rawValue.replace(/,/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(normalizedValue)) return value;

  const numberValue = Number(normalizedValue);
  if (!Number.isFinite(numberValue)) return value;

  const absoluteValue = Math.abs(numberValue);
  const units = [
    { threshold: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, suffix: 'M' },
    { threshold: 1_000, suffix: 'k' },
  ];
  const unit = units.find((item) => absoluteValue >= item.threshold);

  return unit ? `${(numberValue / unit.threshold).toFixed(1)}${unit.suffix}` : value;
}

function parseUsdValue(value) {
  const usdValue = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(usdValue) ? usdValue : 0;
}

function formatUsdValue(value) {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function getDashboardErrorMessage(error) {
  return error?.userMessage || error?.shortMessage || error?.message || 'Unable to calculate live cover score.';
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

function DashboardNumber({ value, size = 'stat', compact = false }) {
  if (!isLoadingValue(value)) return compact ? formatCompactStatValue(value) : value;

  return (
    <span
      className={`dashboard-number-spinner dashboard-number-spinner--${size}`}
      role="status"
      aria-label="Loading calculated value"
    />
  );
}

function DashboardTableSection({ className = '', title, pill, meta, children }) {
  return (
    <section className={`dashboard-table-section${className ? ` ${className}` : ''}`}>
      <div className="dashboard-table-section-header">
        <div className="dashboard-asset-title dashboard-table-section-heading">
          <h2>
            {title} {pill ?? <BuildingPill />}
          </h2>
        </div>
        {meta ? <div className="dashboard-table-section-meta">{meta}</div> : null}
      </div>
      {children}
    </section>
  );
}

function ActionModal({ config, connected, onClose }) {
  const availableAmount = parseScore(config.availableValue);
  const walletAmount = availableAmount === null ? '...' : formatModalAmount(availableAmount);
  const [amount, setAmount] = useState(() => getWalletInputAmount(config.availableValue));
  const outputAmount = amount || '0';
  const setMaxAmount = () => {
    if (!Number.isFinite(availableAmount)) return;
    setAmount(formatModalAmount(availableAmount));
  };

  useEffect(() => {
    if (!Number.isFinite(availableAmount)) return;
    setAmount(formatModalAmount(availableAmount));
  }, [availableAmount, config.from, config.to]);

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
                onChange={(event) => {
                  setAmount(event.target.value.replace(/[^\d.]/g, ''));
                }}
                aria-label={`${config.from} amount`}
              />
              <button
                className="text-link-button dashboard-max-wallet-button"
                type="button"
                disabled={availableAmount === null}
                onClick={setMaxAmount}
                aria-label={`Use maximum ${config.from} amount`}
              >
                {walletAmount} in wallet
              </button>
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

function CriticalAlert({ messages }) {
  const visibleMessages = messages.filter(Boolean);
  if (!visibleMessages.length) return null;

  return (
    <section className="dashboard-critical-alert" role="alert" aria-live="assertive">
      <strong>Alert</strong>
      {visibleMessages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </section>
  );
}

function TokenOverviewTable({ values, sUsd8Apy, connected, onAction }) {
  const rows = [
    {
      id: 'usd8',
      iconSrc: usd8Logo,
      token: 'USD8',
      apy: '-',
      balance: values.usd8Balance,
      rate: values.usd8Rate,
      userRate: getUserInsuranceRate(values.usd8Balance, values.usd8Rate),
      earned: values.usd8HistoryEarned,
      actions: [
        { key: 'mint', label: 'Mint' },
        { key: 'redeem', label: 'Redeem' },
      ],
    },
    {
      id: 'susd8',
      iconSrc: sUsd8Logo,
      token: 'Protected Savings sUSD8',
      apy: sUsd8Apy,
      balance: values.sUsd8Balance,
      rate: values.sUsd8Rate,
      userRate: getUserInsuranceRate(values.sUsd8Balance, values.sUsd8Rate),
      earned: values.sUsd8HistoryEarned,
      actions: [
        { key: 'deposit', label: 'Deposit' },
        { key: 'withdraw', label: 'Withdraw' },
      ],
    },
  ];

  return (
    <table className="cover-table dashboard-token-table dashboard-insured-token-table">
      <tbody>
        <tr className="cover-table-heading-row">
          <td className="dashboard-insured-token-token-cell">Token</td>
          <td className="dashboard-insured-token-apy-cell">APY</td>
          <td className="dashboard-insured-token-balance-cell">Your Balance</td>
          <td className="dashboard-insured-token-rate-cell">
            <span className="dashboard-table-heading-label">
              Standard Insurance Score Earning Rate
              <InfoTooltip ariaLabel="Standard Insurance Score Earning Rate info" className="dashboard-help--table">
                {INFO_COPY.tableRate}
              </InfoTooltip>
            </span>
          </td>
          <td className="dashboard-insured-token-user-rate-cell">
            <span className="dashboard-table-heading-label">
              Your Insurance Score Earning Rate
              <InfoTooltip ariaLabel="Your Insurance Score Earning Rate info" className="dashboard-help--table">
                {INFO_COPY.tableUserRate}
              </InfoTooltip>
            </span>
          </td>
          <td className="dashboard-insured-token-earned-cell">
            <span className="dashboard-table-heading-label">
              Insurance Score Earned
              <InfoTooltip ariaLabel="Insurance Score Earned info" className="dashboard-help--table">
                {INFO_COPY.tableEarned}
              </InfoTooltip>
            </span>
          </td>
          <td className="table-action-cell dashboard-insured-token-action-cell">Actions</td>
        </tr>

        {rows.map((row) => (
          <tr key={row.id}>
            <td className="dashboard-insured-token-token-cell"><TableTokenCell iconSrc={row.iconSrc}>{row.token}</TableTokenCell></td>
            <td className="dashboard-insured-token-apy-cell">{row.apy}</td>
            <td className="dashboard-insured-token-balance-cell"><DashboardNumber value={row.balance} compact /></td>
            <td className="dashboard-insured-token-rate-cell"><DashboardNumber value={row.rate} compact /></td>
            <td className="dashboard-insured-token-user-rate-cell"><DashboardNumber value={row.userRate} compact /></td>
            <td className="dashboard-insured-token-earned-cell"><DashboardNumber value={row.earned} compact /></td>
            <td className="table-action-cell dashboard-insured-token-action-cell">
              <div className="table-action-buttons">
                {row.actions.map((action) => (
                  <button
                    className="dashboard-action-button dashboard-table-action-button"
                    type="button"
                    disabled={!connected}
                    key={action.key}
                    onClick={() => onAction(action.key)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DashboardContent({
  address = '',
  connected = false,
  connecting = false,
  walletError = '',
  onWalletButtonClick,
  onWalletDisconnect,
}) {
  const [modalKey, setModalKey] = useState('');
  const [dashboardValues, setDashboardValues] = useState(ZERO_VALUES);
  const [scoreError, setScoreError] = useState('');
  const [actionError, setActionError] = useState('');
  const values = connected ? dashboardValues : ZERO_VALUES;
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
  const coverPoolTvl = useMemo(() => (
    formatUsdValue(COVER_POOL_ROWS.reduce((total, row) => total + parseUsdValue(row.tvlUsd), 0))
  ), []);
  const criticalMessages = [
    walletError,
    actionError,
    scoreError ? `Could not calculate live insurance score: ${scoreError}` : '',
  ];

  useEffect(() => {
    if (connected) setActionError('');
    if (!connected) setModalKey('');
  }, [connected]);

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
        setScoreError(getDashboardErrorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  function openAction(key) {
    if (!connected) {
      setActionError('Connect a wallet to use dashboard actions.');
      return;
    }

    setActionError('');
    setModalKey(key);
  }

  return (
    <div className={`dashboard-page${connected ? '' : ' dashboard-page--disconnected'}`}>
      <CriticalAlert messages={criticalMessages} />

      <div className="dashboard-top">
        <h1>Dashboard</h1>
        <p className="dashboard-wallet-line">
          <img className="dashboard-wallet-icon" src={connected ? greenWallet : greyWallet} alt="" />
          {connected ? (
            <span className="dashboard-wallet-copy">
              Connected{' '}
              <span className="dashboard-wallet-address">
                {address}
              </span>{' '}
              <button className="text-link-button dashboard-wallet-link" type="button" onClick={onWalletDisconnect}>
                Disconnect
              </button>
            </span>
          ) : (
            <span className="dashboard-wallet-copy">
              Wallet not connected{' '}
              <button
                className="text-link-button dashboard-wallet-link"
                type="button"
                disabled={connecting || !onWalletButtonClick}
                onClick={onWalletButtonClick}
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </span>
          )}
        </p>
      </div>

      <DashboardTableSection
        className="dashboard-insured-token-section"
        title="USD8"
        pill={<span className="live-pill">insured by cover pool</span>}
        meta={(
          <>
            <span className="dashboard-table-heading-label">
              Total Insurance Score Earned
              <InfoTooltip ariaLabel="Total Insurance Score info" className="dashboard-help--total">
                {TOTAL_INSURANCE_SCORE_COPY}
              </InfoTooltip>
            </span>
            <strong><DashboardNumber value={totalHistoryScore} size="total" /></strong>
          </>
        )}
      >
        <TokenOverviewTable
          values={values}
          sUsd8Apy={DEFAULT_SUSD8_APY}
          connected={connected}
          onAction={openAction}
        />
      </DashboardTableSection>

      <DashboardTableSection
        className="cover-pool-section"
        title="Cover Pool"
        meta={(
          <>
            <span>Total TVL</span>
            <strong>{coverPoolTvl}</strong>
          </>
        )}
      >
        <CoverPoolTable />
      </DashboardTableSection>

      <DashboardTableSection
        className="claim-insurance"
        title="Free Insurance"
        meta={(
          <>
            <span className="dashboard-table-heading-label">
              Available Insurance Score
              <InfoTooltip ariaLabel="Available Insurance Score info" className="dashboard-help--total">
                {AVAILABLE_INSURANCE_SCORE_COPY}
              </InfoTooltip>
            </span>
            <strong><DashboardNumber value={totalHistoryScore} size="total" /></strong>
          </>
        )}
      >
        <CoveredProtocolsTable />
      </DashboardTableSection>

      {modalConfig ? <ActionModal config={modalConfig} connected={connected} onClose={() => setModalKey('')} /> : null}
    </div>
  );
}

function DashboardWithWalletConnector() {
  const { open } = useAppKit();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const [walletError, setWalletError] = useState('');
  const [openingWalletModal, setOpeningWalletModal] = useState(false);
  const connected = isConnected && Boolean(address);

  async function onWalletButtonClick() {
    setWalletError('');
    setOpeningWalletModal(true);

    try {
      await open({ view: 'Connect' });
    } catch (error) {
      setWalletError(error?.message || 'Unable to open wallet connector.');
    } finally {
      setOpeningWalletModal(false);
    }
  }

  async function onWalletDisconnect() {
    setWalletError('');

    try {
      await disconnectAsync();
    } catch (error) {
      setWalletError(error?.message || 'Unable to disconnect wallet.');
    }
  }

  return (
    <DashboardContent
      address={address || ''}
      connected={connected}
      connecting={openingWalletModal || isConnecting || isReconnecting}
      walletError={walletError}
      onWalletButtonClick={onWalletButtonClick}
      onWalletDisconnect={onWalletDisconnect}
    />
  );
}

export default function DashboardPage() {
  if (!walletConnectorConfigured) {
    return (
      <DashboardContent
        walletError="Wallet connector is not configured. Set reownProjectId in src/config/protocolConfig.js."
      />
    );
  }

  return <DashboardWithWalletConnector />;
}
