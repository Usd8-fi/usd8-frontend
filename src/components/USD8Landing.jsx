import { useEffect, useState } from 'react';
import coverWsteth from '../assets/cover-wsteth.png';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
import { useLivePoolEarnings } from '../lib/livePoolEarnings.js';
import { MORPHO_VAULT_URL } from '../lib/morphoApi.js';
import AvailabilityAction, { CONNECT_WALLET_REASON } from './AvailabilityAction.jsx';
import CoveredProtocolsTable from './CoveredProtocolsTable.jsx';
import InfoTooltip from './InfoTooltip.jsx';

const PRODUCTS = {
  insurance: 'Defi Insurance',
  pools: 'Cover Pools',
};
const ACTIVE_PRODUCT_STORAGE_KEY = 'usd8-active-product';

function storedProduct() {
  try {
    const product = window.localStorage.getItem(ACTIVE_PRODUCT_STORAGE_KEY);
    return Object.hasOwn(PRODUCTS, product) ? product : 'insurance';
  } catch {
    return 'insurance';
  }
}

const DOCS_BASE_URL = './docs/';
const docsUrl = (path = '') => `${DOCS_BASE_URL}${path}`;

function displayValue(value, fallback = '0') {
  return value === null || value === undefined || value === '' ? fallback : value;
}

function formatWholeBalance(value) {
  const raw = String(displayValue(value)).replaceAll(',', '');
  if (!/^\d+(?:\.\d+)?$/.test(raw)) return displayValue(value);
  const [whole, fraction = ''] = raw.split('.');
  const rounded = BigInt(whole) + (fraction[0] >= '5' ? 1n : 0n);
  return rounded.toLocaleString('en-US');
}

function formatScore(value, decimals = 1) {
  const raw = String(value);
  if (!/^\d+(?:\.\d+)?$/.test(raw)) return raw;

  const [whole, fraction = ''] = raw.split('.');
  const integer = BigInt(whole);
  return `${integer}.${fraction.slice(0, decimals).padEnd(decimals, '0')}`;
}

const SCORE_DECIMALS = 18;
const SCORE_SCALE = 10n ** BigInt(SCORE_DECIMALS);

function scoreUnits(value) {
  const raw = String(value ?? '0');
  if (!/^\d+(?:\.\d+)?$/.test(raw)) return 0n;
  const [whole, fraction = ''] = raw.split('.');
  return BigInt(whole) * SCORE_SCALE
    + BigInt(fraction.slice(0, SCORE_DECIMALS).padEnd(SCORE_DECIMALS, '0'));
}

function scoreDisplayDecimals(rate) {
  const rateUnits = scoreUnits(rate);
  if (rateUnits === 0n) return 1;
  for (let decimals = 1; decimals <= 4; decimals += 1) {
    if (rateUnits * (10n ** BigInt(decimals)) >= SCORE_SCALE) return decimals;
  }
  return 4;
}

function liveScoreValue(base, rate, elapsedMilliseconds) {
  const units = scoreUnits(base)
    + scoreUnits(rate) * BigInt(elapsedMilliseconds) / 1_000n;
  const fraction = String(units % SCORE_SCALE).padStart(SCORE_DECIMALS, '0');
  return `${units / SCORE_SCALE}.${fraction}`;
}

function useLiveScore(score) {
  const [now, setNow] = useState(Date.now());
  const snapshotTimestamp = Number(score?.snapshotTimestamp);
  const snapshotMilliseconds = Number(
    score?.snapshotTimestampMilliseconds ?? snapshotTimestamp * 1_000,
  );
  const canAdvance = Number.isSafeInteger(snapshotMilliseconds) && snapshotMilliseconds > 0;

  useEffect(() => {
    setNow(Date.now());
    if (!canAdvance) return undefined;
    const update = () => {
      if (!document.hidden) setNow(Date.now());
    };
    const timer = window.setInterval(update, 1_000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [canAdvance, snapshotMilliseconds]);

  if (!score || !canAdvance) return score;
  const elapsedMilliseconds = Math.max(0, now - snapshotMilliseconds);
  return {
    ...score,
    grossEarnedScore: liveScoreValue(score.grossEarnedScore, score.grossScorePerSecond, elapsedMilliseconds),
    availableScore: liveScoreValue(score.availableScore, score.maturingScorePerSecond, elapsedMilliseconds),
    usd8Score: liveScoreValue(score.usd8Score, score.usd8ScorePerSecond, elapsedMilliseconds),
    sUsd8Score: liveScoreValue(score.sUsd8Score, score.sUsd8ScorePerSecond, elapsedMilliseconds),
  };
}

function ScoreValue({ loading, value, decimals = 1 }) {
  if (loading) {
    return <span className="insurance-score-spinner" role="status" aria-label="Loading insurance score" />;
  }
  return value === null || value === undefined || value === '' ? displayValue(value) : formatScore(value, decimals);
}

function WalletButton({ wallet }) {
  const {
    address = '',
    connected = false,
    connecting = false,
    networkName = '',
    connectUnavailableReason = '',
    onConnect,
    onDisconnect,
  } = wallet;
  return (
    <AvailabilityAction
      className="landing-wallet-button"
      type="button"
      onClick={connected ? onDisconnect : onConnect}
      aria-label={connected ? `Disconnect wallet ${address}` : 'Connect wallet'}
      unavailableReason={connected ? '' : connectUnavailableReason}
    >
      {connecting ? 'connecting...' : connected ? `${address.slice(0, 6)}...${address.slice(-4)}${networkName ? ` ${networkName}` : ''}` : 'connect wallet'}
    </AvailabilityAction>
  );
}

function ProductTabs({ activeProduct, onChange }) {
  return (
    <nav className="landing-product-tabs" aria-label="USD8 products">
      {Object.entries(PRODUCTS).map(([key, label]) => (
        <button
          key={key}
          className={`landing-product-tab${activeProduct === key ? ' landing-product-tab--active' : ''}`}
          type="button"
          aria-current={activeProduct === key ? 'page' : undefined}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function SiteFooter() {
  return (
    <footer className="landing-footer">
      <a className="landing-footer-logo" href="./" aria-label="USD8 footer home">
        <img src={usd8Logo} alt="" />
      </a>
      <nav className="landing-footer-links" aria-label="Footer">
        <div>
          <a className="site-nav-link" href={docsUrl()}>Docs</a>
          <a className="site-nav-link" href="https://github.com/Usd8-fi/usd8-core" target="_blank" rel="noreferrer">Github</a>
          <a className="site-nav-link" href="https://t.me/+e84i2oYk1ao1MTk1" target="_blank" rel="noreferrer">Telegram</a>
          <a className="site-nav-link" href="https://x.com/usd8_fi" target="_blank" rel="noreferrer">X.com</a>
        </div>
        <div>
          <a className="site-nav-link" href={docsUrl('defi-insurance.html')}>DeFi Insurance</a>
          <a className="site-nav-link" href={docsUrl('cover-pools.html')}>Cover Pools</a>
          <span className="landing-footer-unlinked">Audit Report</span>
          <a className="site-nav-link" href={docsUrl('faqs.html')}>FAQs</a>
        </div>
        <div>
          <a className="site-nav-link" href={docsUrl('transparency.html')}>Transparency</a>
          <a className="site-nav-link" href={docsUrl('usd8.html#contact')}>Contacts</a>
          <a className="site-nav-link" href={docsUrl('legal.html')}>Legal</a>
        </div>
      </nav>
    </footer>
  );
}

function AssetCard({
  title,
  iconSrc = usd8Logo,
  balance,
  balanceLabel = 'Your Balance',
  wholeBalance = false,
  score,
  scoreDecimals = 1,
  scoreRate,
  scoreRateHelp = 'Insurance score earned per eligible token held per day.',
  apy,
  children,
}) {
  return (
    <article className="insurance-asset-card">
      <header>
        <img src={iconSrc} alt="" />
        <h2>{title}</h2>
      </header>

      <dl className="insurance-asset-terms">
        <div>
          <dt>Insured</dt>
          <dd className="metric-label-with-help">
            YES with limits
            <InfoTooltip ariaLabel="About coverage limits">
              Coverage is subject to the amount available in the cover pools.
            </InfoTooltip>
          </dd>
        </div>
        <div>
          <dt>Score Rate</dt>
          <dd className="metric-label-with-help">
            {scoreRate}
            <InfoTooltip ariaLabel="About score rate">
              {scoreRateHelp}
            </InfoTooltip>
          </dd>
        </div>
      </dl>

      <div className="insurance-asset-values">
        <div>
          <span>{balanceLabel}</span>
          <strong>{wholeBalance ? formatWholeBalance(balance) : displayValue(balance)}</strong>
        </div>
        {apy !== undefined ? (
          <div>
            <span>APY</span>
            <strong>{displayValue(apy, '—')}</strong>
          </div>
        ) : null}
      </div>

      <div className="insurance-asset-score">
        <span>Score earned</span>
        <strong><ScoreValue value={score} decimals={scoreDecimals} /></strong>
      </div>

      <div className="insurance-asset-actions">{children}</div>
    </article>
  );
}

function FreeInsurancePage({ wallet, score, scoreStatus, balances, savingsVault, onFileClaim, onUsd8Action, fileClaimUnavailableReason }) {
  const scoreLoading = scoreStatus === 'loading';
  const liveScore = useLiveScore(score);
  const totalScore = liveScore?.grossEarnedScore;
  const availableScore = liveScore?.availableScore;
  const walletUnavailableReason = wallet.connected ? wallet.networkUnavailableReason || '' : CONNECT_WALLET_REASON;

  return (
    <main className="landing-page free-insurance-page">
      <h1 className="sr-only">Defi Insurance</h1>
      <section className="insurance-summary">
        <p>Earn free insurance score with USD8 or sUSD8.</p>
        <div>
          <span className="metric-label-with-help">
            Total Insurance Score
            <InfoTooltip ariaLabel="About total insurance score" className="dashboard-help--align-right">
              Your total insurance score earned across all holdings.
            </InfoTooltip>
          </span>
          <strong>
            <ScoreValue
              loading={scoreLoading}
              value={totalScore}
              decimals={scoreDisplayDecimals(score?.grossScorePerSecond)}
            />
          </strong>
        </div>
      </section>

      <section className="insurance-assets">
        <AssetCard
          title="USD8"
          balance={balances.usd8}
          wholeBalance
          score={liveScore?.usd8Score}
          scoreDecimals={scoreDisplayDecimals(score?.usd8ScorePerSecond)}
          scoreRate="1 per USD8 per day"
          scoreRateHelp="You get 1 score per day for every USD8 you hold. Rewarded every block."
        >
          <AvailabilityAction type="button" onClick={() => onUsd8Action?.('mint')} unavailableReason={walletUnavailableReason}>
            mint
          </AvailabilityAction>
          <AvailabilityAction type="button" onClick={() => onUsd8Action?.('redeem')} unavailableReason={walletUnavailableReason}>
            redeem
          </AvailabilityAction>
        </AssetCard>

        <AssetCard
          title="sUSD8 Savings USD8 (Morpho)"
          iconSrc={sUsd8Logo}
          balance={balances.savingsAssets}
          balanceLabel="Your Deposit (USD8)"
          wholeBalance
          score={liveScore?.sUsd8Score}
          scoreDecimals={scoreDisplayDecimals(score?.sUsd8ScorePerSecond)}
          scoreRate="0.1 per sUSD8 per day"
          scoreRateHelp="You get 0.1 score per day for every sUSD8 you hold. Rewarded every block."
          apy={savingsVault.apy}
        >
          <a className="landing-gold-button" href={MORPHO_VAULT_URL} target="_blank" rel="noreferrer">
            Go to Morpho
          </a>
        </AssetCard>
      </section>

      <section className="insurance-token-section">
        <div className="insurance-claim-summary">
          <h2>File claim with your insurance score</h2>
          <div>
            <span className="metric-label-with-help">
              Available Score
              <InfoTooltip ariaLabel="About available score" className="dashboard-help--align-right">
                Score becomes available to use after seven days, minus any score already spent on claims.
              </InfoTooltip>
            </span>
            <strong>
              <ScoreValue
                loading={scoreLoading}
                value={availableScore}
                decimals={scoreDisplayDecimals(score?.maturingScorePerSecond)}
              />
            </strong>
          </div>
        </div>
        <div className="landing-table-shell">
          <CoveredProtocolsTable onFileClaim={onFileClaim} fileClaimUnavailableReason={fileClaimUnavailableReason || walletUnavailableReason} />
        </div>
      </section>
    </main>
  );
}

function CapacityBar({ value = 0, uncapped = false, assets = '0' }) {
  if (uncapped) {
    return <div className="landing-capacity" aria-label={`${assets} wstETH deposited, uncapped`}>Uncapped · {assets} wstETH deposited</div>;
  }
  const bounded = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="landing-capacity" aria-label={`${bounded}% capacity filled`}>
      <span><i style={{ width: `${bounded}%` }} /></span>
    </div>
  );
}

function CoverPoolsPage({ wallet, pool, onPoolAction }) {
  const walletUnavailableReason = wallet.connected ? wallet.networkUnavailableReason || '' : CONNECT_WALLET_REASON;

  return (
    <main className="landing-page cover-pools-page">
      <h1 className="sr-only">Cover Pools</h1>
      <p className="cover-pool-warning">
        Warning - Cover Pools might be deployed to cover insured token loss, make sure you understand the{' '}
        <a href={docsUrl('cover-pools.html')}>risk involved</a>.
      </p>

      <section className="cover-pool-card">
        <header>
          <img src={coverWsteth} alt="" />
          <h2>wstEth Cover Pool</h2>
        </header>

        <div className="cover-pool-overview">
          <div className="cover-pool-metrics">
            <div>
              <span className="metric-label-with-help">
                30D APY
                <InfoTooltip ariaLabel="About 30-day APY">
                  APY is paid in USD8, not wstETH.
                </InfoTooltip>
              </span>
              <strong>{displayValue(pool.apy, '—')}</strong>
            </div>
            <div><span>TVL</span><strong>{displayValue(pool.tvl, '—')}</strong></div>
          </div>

          <div className="cover-pool-capacity-metric">
            <span className="metric-label-with-help">
              Capacity Filled
              <InfoTooltip ariaLabel="About capacity filled">
                {pool.capacityUncapped
                  ? 'Current pool deposits. This pool has no deposit cap.'
                  : 'Percentage of the pool\'s deposit capacity currently in use.'}
              </InfoTooltip>
            </span>
            <CapacityBar value={pool.capacityPercent} uncapped={pool.capacityUncapped} assets={pool.assets} />
          </div>
        </div>

        <div className="cover-pool-account">
          <div><span>Your deposit</span><strong>{displayValue(pool.deposit)} wstEth</strong></div>
          <div>
            <span className="metric-label-with-help">
              Your Earnings
              <InfoTooltip ariaLabel="About your earnings" className="dashboard-help--align-right">
                Earnings are paid in USD8, not wstETH. Earnings are not exposed to insurance claims and can be withdrawn at any time.
              </InfoTooltip>
            </span>
            <strong>{displayValue(pool.earnings)} USD8</strong>
          </div>
        </div>

        <div className="cover-pool-actions">
          <AvailabilityAction type="button" onClick={() => onPoolAction?.('deposit')} unavailableReason={walletUnavailableReason}>
            deposit
          </AvailabilityAction>
          <AvailabilityAction type="button" onClick={() => onPoolAction?.('withdraw')} unavailableReason={walletUnavailableReason}>
            withdraw
          </AvailabilityAction>
          <AvailabilityAction type="button" onClick={() => onPoolAction?.('claimReward')} unavailableReason={walletUnavailableReason}>
            withdraw earnings
          </AvailabilityAction>
        </div>
      </section>
    </main>
  );
}

export default function USD8Landing({
  wallet = {},
  score = null,
  scoreStatus = 'idle',
  balances = {},
  savingsVault = {},
  pool = {},
  onFileClaim,
  fileClaimUnavailableReason = '',
  onPoolAction,
  onUsd8Action,
}) {
  const [activeProduct, setActiveProduct] = useState(storedProduct);
  const livePool = useLivePoolEarnings(pool);

  useEffect(() => {
    try {
      window.localStorage.setItem(ACTIVE_PRODUCT_STORAGE_KEY, activeProduct);
    } catch {
      // Storage may be unavailable in private or restricted browser contexts.
    }
  }, [activeProduct]);

  return (
    <div className={`landing-shell landing-shell--${activeProduct}`}>
      <header className="landing-header">
        <div className="landing-brand-group">
          <a className="landing-brand" href="./" aria-label="USD8 home">
            <img src={usd8Logo} alt="USD8" />
            <span className="landing-brand-label">USD8.fi</span>
          </a>
          <a className="landing-beta-link" href={docsUrl('faqs.html#whats-different-in-beta')}>beta</a>
        </div>
        <WalletButton wallet={wallet} />
      </header>

      <ProductTabs activeProduct={activeProduct} onChange={setActiveProduct} />

      {activeProduct === 'insurance' ? (
        <FreeInsurancePage
          wallet={wallet}
          score={score}
          scoreStatus={scoreStatus}
          balances={balances}
          savingsVault={savingsVault}
          onFileClaim={onFileClaim}
          fileClaimUnavailableReason={fileClaimUnavailableReason}
          onUsd8Action={onUsd8Action}
        />
      ) : (
        <CoverPoolsPage wallet={wallet} pool={livePool} onPoolAction={onPoolAction} />
      )}

      <SiteFooter />
    </div>
  );
}