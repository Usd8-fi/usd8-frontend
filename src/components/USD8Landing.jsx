import { useEffect, useState } from 'react';
import coverWsteth from '../assets/cover-wsteth.png';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
import { useLivePoolEarnings } from '../lib/livePoolEarnings.js';
import { formatWad, groupDecimalString, rateDecimals, wadUnits } from '../lib/units.js';
import { MORPHO_VAULT_URL } from '../lib/morphoApi.js';
import AvailabilityAction, { CONNECT_WALLET_REASON } from './AvailabilityAction.jsx';
import CoveredProtocolsTable from './CoveredProtocolsTable.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import LoadingSpinner, { MetricValue } from './LoadingSpinner.jsx';

const PRODUCTS = {
  insurance: 'Defi Insurance',
  pools: 'Cover Pools',
  whiteHat: 'White Hat Economy',
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

const formatWholeBalance = (value) => groupDecimalString(displayValue(value), { decimals: 0 });
const formatScore = (value, decimals = 1) => groupDecimalString(value, { decimals });

const scoreRateDecimals = (rate) => rateDecimals(rate, { max: 4, whenZero: 1 });
const liveScoreValue = (base, rate, elapsedMilliseconds) => formatWad(
  wadUnits(base) + wadUnits(rate) * BigInt(elapsedMilliseconds) / 1_000n,
  18,
);

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
    return <LoadingSpinner label="Loading insurance score" />;
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
  balanceLoading = false,
  wholeBalance = false,
  score,
  scoreDecimals = 1,
  scoreLoading = false,
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
          <strong>
            {balanceLoading
              ? <LoadingSpinner label="Loading wallet balance" />
              : wholeBalance ? formatWholeBalance(balance) : displayValue(balance)}
          </strong>
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
        <strong><ScoreValue loading={scoreLoading} value={score} decimals={scoreDecimals} /></strong>
      </div>

      <div className="insurance-asset-actions">{children}</div>
    </article>
  );
}

function FreeInsurancePage({ wallet, score, scoreStatus, balances, balancesLoading, savingsVault, incident, insuredTokenStates, onFileClaim, onUsd8Action, fileClaimUnavailableReason }) {
  const scoreLoading = scoreStatus === 'loading';
  const liveScore = useLiveScore(score);
  const totalScore = liveScore?.grossEarnedScore;
  const availableScore = liveScore?.availableScore;
  const walletUnavailableReason = wallet.connected ? wallet.networkUnavailableReason || '' : CONNECT_WALLET_REASON;
  const [nowMilliseconds, setNowMilliseconds] = useState(Date.now());

  useEffect(() => {
    if (!incident) return undefined;
    const update = () => setNowMilliseconds(Date.now());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [incident]);

  return (
    <main className="landing-page free-insurance-page">
      <h1 className="sr-only">Defi Insurance</h1>
      <section className="insurance-summary">
        <p>Earn free insurance score with USD8 or sUSD8.</p>
        <div>
          <span className="metric-label-with-help">
            Total Insurance Score
            <InfoTooltip ariaLabel="About total insurance score" className="dashboard-help--align-right">
              Your total insurance score earned across all holdings. Score updates may be delayed by around 13–19 minutes while Ethereum blocks finalize.
            </InfoTooltip>
          </span>
          <strong>
            <ScoreValue
              loading={scoreLoading}
              value={totalScore}
              decimals={scoreRateDecimals(score?.grossScorePerSecond)}
            />
          </strong>
        </div>
      </section>

      <section className="insurance-assets">
        <AssetCard
          title="USD8"
          balance={balances.usd8}
          balanceLoading={balancesLoading}
          wholeBalance
          score={liveScore?.usd8Score}
          scoreDecimals={scoreRateDecimals(score?.usd8ScorePerSecond)}
          scoreLoading={scoreLoading}
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
          balanceLoading={balancesLoading}
          wholeBalance
          score={liveScore?.sUsd8Score}
          scoreDecimals={scoreRateDecimals(score?.sUsd8ScorePerSecond)}
          scoreLoading={scoreLoading}
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
                decimals={scoreRateDecimals(score?.maturingScorePerSecond)}
              />
            </strong>
          </div>
        </div>
        <div className="covered-protocols-table-area">
          <CoveredProtocolsTable
            onFileClaim={onFileClaim}
            fileClaimUnavailableReason={fileClaimUnavailableReason || walletUnavailableReason}
            incident={incident}
            insuredTokenStates={insuredTokenStates}
            nowMilliseconds={nowMilliseconds}
          />
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

function CoverPoolCard({ pool, poolLoading, walletUnavailableReason, onPoolAction }) {
  const livePool = useLivePoolEarnings(pool);
  return (
    <section className="cover-pool-card" aria-label={pool.name}>
      <header>
        <img src={coverWsteth} alt="" />
        <h2>{pool.name}</h2>
      </header>

      <div className="cover-pool-overview">
        <div className="cover-pool-metrics">
          <div>
            <span className="metric-label-with-help">
              30D Earnings APR
              <InfoTooltip ariaLabel={`About 30-day earnings APR for ${pool.name}`}>
                USD8 earnings accrued over the past 30 days, annualized against average pool value. Earnings represented by this APR are delivered in USD8.
              </InfoTooltip>
            </span>
            <strong><MetricValue loading={poolLoading} value={livePool.apy} label="Loading pool data" /></strong>
          </div>
          <div><span>TVL</span><strong><MetricValue loading={poolLoading} value={livePool.tvl} label="Loading pool data" /></strong></div>
        </div>

        <div className="cover-pool-capacity-metric">
          <span className="metric-label-with-help">
            Capacity Filled
            <InfoTooltip ariaLabel={`About capacity filled for ${pool.name}`}>
              {pool.capacityUncapped
                ? 'Current pool deposits. This pool has no deposit cap.'
                : 'Percentage of the pool\'s deposit capacity currently in use.'}
            </InfoTooltip>
          </span>
          {poolLoading && pool.capacityPercent === null
            ? <LoadingSpinner label="Loading pool capacity" />
            : <CapacityBar value={pool.capacityPercent} uncapped={pool.capacityUncapped} assets={pool.assets} />}
        </div>
      </div>

      <div className="cover-pool-account">
        <div><span>Your deposit</span><strong>{displayValue(pool.deposit)} {pool.assetSymbol}</strong></div>
        <div>
          <span className="metric-label-with-help">
            Your Earnings
            <InfoTooltip ariaLabel={`About your earnings in ${pool.name}`} className="dashboard-help--align-right">
              Earnings are paid in USD8, not {pool.assetSymbol}. Earnings are not exposed to insurance claims and can be withdrawn at any time.
            </InfoTooltip>
          </span>
          <strong>{displayValue(livePool.earnings)} USD8</strong>
        </div>
      </div>

      <div className="cover-pool-actions">
        {['deposit', 'withdraw', 'claimReward'].map((action) => (
          <AvailabilityAction
            key={action}
            type="button"
            onClick={() => onPoolAction?.(action, pool.id)}
            unavailableReason={walletUnavailableReason}
          >
            {action === 'claimReward' ? 'withdraw earnings' : action}
          </AvailabilityAction>
        ))}
      </div>
    </section>
  );
}

function CoverPoolsPage({ wallet, pools = [], poolLoading = false, onPoolAction }) {
  const walletUnavailableReason = wallet.connected ? wallet.networkUnavailableReason || '' : CONNECT_WALLET_REASON;

  return (
    <main className="landing-page cover-pools-page">
      <h1 className="sr-only">Cover Pools</h1>
      <p className="cover-pool-warning">
        Warning - Cover Pools might be deployed to cover insured token loss, make sure you understand the{' '}
        <a href={docsUrl('cover-pools.html')}>risk involved</a>.
      </p>

      {pools.map((pool) => (
        <CoverPoolCard
          key={pool.id}
          pool={pool}
          poolLoading={poolLoading}
          walletUnavailableReason={walletUnavailableReason}
          onPoolAction={onPoolAction}
        />
      ))}
    </main>
  );
}

function WhiteHatEconomyPage() {
  return (
    <main className="landing-page white-hat-economy-page">
      <h1 className="sr-only">White Hat Economy</h1>
      <p className="white-hat-economy-message">
        The White Hat Economy will launch in the future, once USD8 holds a meaningful amount of insured tokens acquired through the claims process.{' '}
        <a href={docsUrl('white-hat-economy.html')}>Learn more</a>.
      </p>
    </main>
  );
}

export default function USD8Landing({
  wallet = {},
  score = null,
  scoreStatus = 'idle',
  balances = {},
  balancesLoading = false,
  savingsVault = {},
  pools = [],
  poolLoading = false,
  dataError = '',
  incident = null,
  insuredTokenStates = {},
  onFileClaim,
  fileClaimUnavailableReason = '',
  onPoolAction,
  onUsd8Action,
}) {
  const [activeProduct, setActiveProduct] = useState(storedProduct);

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

      {dataError ? (
        <p className="landing-data-error" role="alert">{dataError}</p>
      ) : null}

      {activeProduct === 'insurance' ? (
        <FreeInsurancePage
          wallet={wallet}
          score={score}
          scoreStatus={scoreStatus}
          balances={balances}
          balancesLoading={balancesLoading}
          savingsVault={savingsVault}
          incident={incident}
          insuredTokenStates={insuredTokenStates}
          onFileClaim={onFileClaim}
          fileClaimUnavailableReason={fileClaimUnavailableReason}
          onUsd8Action={onUsd8Action}
        />
      ) : activeProduct === 'pools' ? (
        <CoverPoolsPage wallet={wallet} pools={pools} poolLoading={poolLoading} onPoolAction={onPoolAction} />
      ) : (
        <WhiteHatEconomyPage />
      )}

      <SiteFooter />
    </div>
  );
}