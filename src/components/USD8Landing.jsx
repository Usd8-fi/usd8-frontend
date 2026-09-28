import WalletNoticeProvider, { NoticeMessage } from './WalletNotice.jsx';
import { useEffect, useState } from 'react';
import coverWsteth from '../assets/cover-wsteth.png';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
import { useLivePoolEarnings } from '../lib/livePoolEarnings.js';
import { useSecondClock } from '../lib/secondClock.js';
import { formatWad, groupDecimalString, rateDecimals, wadUnits } from '../lib/units.js';
import { MORPHO_VAULT_URL } from '../lib/morphoApi.js';
import { docsUrl } from '../lib/docsLinks.js';
import { durationPhrase } from '../lib/durations.js';
import AvailabilityAction, { CONNECT_WALLET_REASON } from './AvailabilityAction.jsx';
import CoveredProtocolsTable from './CoveredProtocolsTable.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import LoadingSpinner, { MetricValue } from './LoadingSpinner.jsx';


function displayValue(value, fallback = '0') {
  return value === null || value === undefined || value === '' ? fallback : value;
}

const formatWholeBalance = (value) => groupDecimalString(displayValue(value), { decimals: 0 });
// Dollar-denominated balances read as whole numbers everywhere on the page.
// Other assets keep two decimals, because a whole wstETH hides most of a
// typical position.
const WHOLE_NUMBER_ASSETS = new Set(['USD8', 'sUSD8', 'USDC']);
const formatAssetBalance = (value, assetSymbol) => groupDecimalString(displayValue(value), {
  decimals: WHOLE_NUMBER_ASSETS.has(assetSymbol) ? 0 : 2,
});
const POOL_ACTION_LABELS = { deposit: 'Deposit', withdraw: 'Withdraw', claimReward: 'Withdraw Earnings' };
const formatScore = (value, decimals = 1) => groupDecimalString(value, { decimals });

const scoreRateDecimals = (rate) => rateDecimals(rate, { max: 4, whenZero: 1 });
const liveScoreValue = (base, rate, elapsedMilliseconds) => formatWad(
  wadUnits(base) + wadUnits(rate) * BigInt(elapsedMilliseconds) / 1_000n,
  18,
);

function scoreSnapshotMilliseconds(score) {
  const milliseconds = Number(score?.snapshotTimestampMilliseconds ?? Number(score?.snapshotTimestamp) * 1_000);
  return Number.isSafeInteger(milliseconds) && milliseconds > 0 ? milliseconds : 0;
}

function ScoreValue({ loading, value, decimals = 1 }) {
  if (loading) {
    return <LoadingSpinner label="Loading insurance score" />;
  }
  return value === null || value === undefined || value === '' ? displayValue(value) : formatScore(value, decimals);
}

/// One score figure, advanced every second from its snapshot. Only this leaf
/// re-renders on each tick; the page around it renders when data changes.
function LiveScoreValue({ loading, score, valueKey, rateKey, keepMissing = false }) {
  const snapshotMilliseconds = scoreSnapshotMilliseconds(score);
  const base = score?.[valueKey];
  const canAdvance = snapshotMilliseconds > 0 && !(keepMissing && base == null);
  const now = useSecondClock(canAdvance);
  const value = canAdvance
    ? liveScoreValue(base, score[rateKey], Math.max(0, now - snapshotMilliseconds))
    : base;
  return <ScoreValue loading={loading} value={value} decimals={scoreRateDecimals(score?.[rateKey])} />;
}

function LivePoolEarnings({ pool }) {
  return `${displayValue(useLivePoolEarnings(pool).earnings)} USD8`;
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
      aria-label={connected ? `Manage Wallet ${address}` : 'Connect Wallet'}
      unavailableReason={connected ? '' : connectUnavailableReason}
    >
      {connecting ? 'Connecting...' : connected ? (
        <>
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
          {networkName ? <span className="landing-wallet-network">{` ${networkName}`}</span> : null}
        </>
      ) : 'Connect Wallet'}
    </AvailabilityAction>
  );
}


function SiteFooter({ updatedAt }) {
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
          <span className="landing-footer-unlinked">Audit Report</span>
          <a className="site-nav-link" href={docsUrl('faqs.html')}>FAQs</a>
        </div>
        <div>
          <a className="site-nav-link" href={docsUrl('transparency.html')}>Transparency</a>
          <a className="site-nav-link" href={docsUrl('usd8.html#contact')}>Contacts</a>
          <a className="site-nav-link" href={docsUrl('legal.html')}>Legal</a>
          <button className="site-nav-link analytics-settings-link" type="button" data-analytics-settings>Cookie Settings</button>
        </div>
      </nav>
      {updatedAt ? <small className="landing-data-freshness">Data as of {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small> : null}
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
  scoreKey,
  scoreRateKey,
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
            <strong><MetricValue value={apy} label="Loading APY" /></strong>
          </div>
        ) : null}
      </div>

      <div className="insurance-asset-score">
        <span>Score Earned</span>
        <strong><LiveScoreValue loading={scoreLoading} score={score} valueKey={scoreKey} rateKey={scoreRateKey} /></strong>
      </div>

      <div className="insurance-asset-actions">{children}</div>
    </article>
  );
}

function FreeInsurancePage({ wallet, score, scoreStatus, availableScoreLoading, balances, balancesLoading, savingsVault, pools, poolLoading, incident, insuredTokenStates, scoreMaturitySeconds, onFileClaim, onPoolAction, onUsd8Action, fileClaimUnavailableReason }) {
  const scoreMaturityPhrase = durationPhrase(scoreMaturitySeconds) || 'the holding period';
  const scoreLoading = scoreStatus === 'loading';
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
      <h1 className="landing-section-title">DeFi Insurance</h1>
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
            <LiveScoreValue loading={scoreLoading} score={score} valueKey="grossEarnedScore" rateKey="grossScorePerSecond" />
          </strong>
        </div>
      </section>

      <section className="insurance-assets">
        <AssetCard
          title="USD8"
          balance={balances.usd8}
          balanceLoading={balancesLoading}
          wholeBalance
          score={score}
          scoreKey="usd8Score"
          scoreRateKey="usd8ScorePerSecond"
          scoreLoading={scoreLoading}
          scoreRate="1 per USD8 per day"
          scoreRateHelp="You get 1 score per day for every USD8 you hold. Rewarded every block."
        >
          <AvailabilityAction type="button" onClick={() => onUsd8Action?.('mint')} unavailableReason={walletUnavailableReason}>
            Mint
          </AvailabilityAction>
          <AvailabilityAction type="button" onClick={() => onUsd8Action?.('redeem')} unavailableReason={walletUnavailableReason}>
            Redeem
          </AvailabilityAction>
        </AssetCard>

        <AssetCard
          title="sUSD8 Savings USD8 (Morpho)"
          iconSrc={sUsd8Logo}
          balance={balances.savingsAssets}
          balanceLabel="Your Deposit (USD8)"
          balanceLoading={balancesLoading}
          wholeBalance
          score={score}
          scoreKey="sUsd8Score"
          scoreRateKey="sUsd8ScorePerSecond"
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
          <p>File claim with your insurance score.</p>
          <div>
            <span className="metric-label-with-help">
              Available Score
              <InfoTooltip ariaLabel="About available score" className="dashboard-help--align-right">
                Score becomes available to use after {scoreMaturityPhrase}, minus any score already spent on claims.
              </InfoTooltip>
            </span>
            <strong>
              <LiveScoreValue
                loading={availableScoreLoading ?? scoreLoading}
                score={score}
                valueKey="availableScore"
                rateKey="maturingScorePerSecond"
                keepMissing
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

      <section className="cover-pools-section" aria-labelledby="cover-pools-title">
        <h2 className="landing-section-title" id="cover-pools-title">Cover Pools</h2>
        <p className="cover-pool-warning">
          Be aware: Cover Pools might be deployed to cover insured token loss, make sure you understand the{' '}
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
      </section>

      <section className="white-hat-economy-section" aria-labelledby="white-hat-economy-title">
        <h2 className="landing-section-title" id="white-hat-economy-title">White Hat Economy</h2>
        <p className="white-hat-economy-message">
          The White Hat Economy will launch once USD8 holds a meaningful amount of insured tokens acquired through the claim process.{' '}
          <a href={docsUrl('white-hat-economy.html')}>Learn More</a>.
        </p>
      </section>
    </main>
  );
}

function CapacityBar({ value = 0, uncapped = false, assets = '0', assetSymbol = 'wstETH' }) {
  if (uncapped) {
    return <div className="landing-capacity" aria-label={`${assets} ${assetSymbol} deposited, uncapped`}>Uncapped</div>;
  }
  const bounded = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="landing-capacity" aria-label={`${Math.round(bounded)}% capacity filled`}>
      <span><i style={{ width: `${bounded}%` }} /></span>
    </div>
  );
}

function CoverPoolCard({ pool, poolLoading, walletUnavailableReason, onPoolAction }) {
  const cardClassName = pool.tint === 'green' ? 'cover-pool-card cover-pool-card--green' : 'cover-pool-card';
  return (
    <section className={cardClassName} aria-label={pool.name}>
      <header>
        <img src={pool.id === 'usd8' ? usd8Logo : coverWsteth} alt="" />
        <h2>{pool.name}</h2>
      </header>

      <div className="cover-pool-overview">
        <div className="cover-pool-metrics">
          <div>
            <span className="metric-label-with-help">
              30D APY
              <InfoTooltip ariaLabel={`About 30-day APY for ${pool.name}`}>
                USD8 earnings accrued over the past 30 days, annualized against average pool value. Earnings represented by this APY are delivered in USD8.
              </InfoTooltip>
            </span>
            <strong><MetricValue loading={poolLoading} value={pool.apy} label="Loading pool data" /></strong>
          </div>
          <div><span>TVL</span><strong><MetricValue loading={poolLoading} value={pool.tvl} label="Loading pool data" /></strong></div>
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
            : <CapacityBar value={pool.capacityPercent} uncapped={pool.capacityUncapped} assets={pool.assets} assetSymbol={pool.assetSymbol} />}
        </div>
      </div>

      <div className="cover-pool-account">
        <div>
          <span>Your Deposit</span>
          <strong>
            {/^[—–-]$/.test(String(pool.deposit ?? '').trim())
              ? <LoadingSpinner label="Loading your deposit" />
              : `${formatAssetBalance(pool.deposit, pool.assetSymbol)} ${pool.assetSymbol}`}
          </strong>
        </div>
        <div>
          <span className="metric-label-with-help">
            Your Earnings
            <InfoTooltip ariaLabel={`About your earnings in ${pool.name}`} className="dashboard-help--align-right">
              Earnings are paid in USD8, not {pool.assetSymbol}. Earnings are not exposed to insurance claims and can be withdrawn at any time.
            </InfoTooltip>
          </span>
          <strong><LivePoolEarnings pool={pool} /></strong>
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
            {POOL_ACTION_LABELS[action]}
          </AvailabilityAction>
        ))}
      </div>
    </section>
  );
}

export default function USD8Landing({
  wallet = {},
  score = null,
  scoreStatus = 'idle',
  availableScoreLoading,
  balances = {},
  balancesLoading = false,
  savingsVault = {},
  pools = [],
  poolLoading = false,
  dataError = '',
  onRetry,
  updatedAt,
  incident = null,
  insuredTokenStates = {},
  scoreMaturitySeconds = null,
  onFileClaim,
  fileClaimUnavailableReason = '',
  onPoolAction,
  onUsd8Action,
}) {
  return (
    <WalletNoticeProvider wallet={wallet}>
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-brand-group">
          <a className="landing-brand" href="./" aria-label="USD8 home">
            <img src={usd8Logo} alt="USD8" />
            <span className="landing-brand-label">USD8.fi</span>
          </a>
          <a className="landing-beta-link" href={docsUrl('faqs.html#whats-different-in-beta')}>beta</a>
        </div>
        <WalletButton wallet={wallet} />
        {wallet.networkUnavailableReason && wallet.onSwitchNetwork ? <button type="button" className="landing-wallet-button" onClick={wallet.onSwitchNetwork}>Switch to Sepolia</button> : null}
      </header>

      {dataError ? (
        <NoticeMessage message={dataError} actionLabel={onRetry ? "Retry Data" : undefined} onAction={onRetry} />
      ) : null}

      <FreeInsurancePage
        wallet={wallet}
        score={score}
        scoreStatus={scoreStatus}
        availableScoreLoading={availableScoreLoading}
        balances={balances}
        balancesLoading={balancesLoading}
        savingsVault={savingsVault}
        pools={pools}
        poolLoading={poolLoading}
        incident={incident}
        insuredTokenStates={insuredTokenStates}
        scoreMaturitySeconds={scoreMaturitySeconds}
        onFileClaim={onFileClaim}
        fileClaimUnavailableReason={fileClaimUnavailableReason}
        onPoolAction={onPoolAction}
        onUsd8Action={onUsd8Action}
      />

      <SiteFooter updatedAt={updatedAt} />
    </div>
    </WalletNoticeProvider>
  );
}