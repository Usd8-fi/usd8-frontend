import WalletNoticeProvider, { NoticeMessage } from './WalletNotice.jsx';
import { Fragment, useEffect, useState } from 'react';
import coverWsteth from '../assets/cover-wsteth.png';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
import usd8Wordmark from '../assets/usd8-wordmark.svg';
import { useLivePoolEarnings } from '../lib/livePoolEarnings.js';
import { useSecondClock } from '../lib/secondClock.js';
import { liveAvailableScore } from '../lib/scoreRules.js';
import { formatWad, groupDecimalString, rateDecimals, wadUnits } from '../lib/units.js';
import { docsUrl } from '../lib/docsLinks.js';
import { durationPhrase } from '../lib/durations.js';
import AvailabilityAction, { CONNECT_WALLET_REASON } from './AvailabilityAction.jsx';
import CoveredProtocolsTable, { COVERED_PROTOCOL_ROWS } from './CoveredProtocolsTable.jsx';
import SimulateClaimDialog from './SimulateClaimDialog.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import { getProtocolNetwork, PROTOCOL_CHAIN_ID } from '../lib/networkConfig.js';
import PercentRing from './PercentRing.jsx';
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

// Live on-chain rate per token per day; already rounded to 4 decimals, shown without trailing zeros.
const formatScoreRate = (value) => groupDecimalString(value, {
  decimals: Math.min(4, (String(value).split('.')[1] || '').replace(/0+$/, '').length),
});
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

/// Available score, moved forward every second along the snapshot's maturing
/// schedule (the holding cutoff advances with the clock).
function LiveAvailableScoreValue({ loading, score }) {
  const snapshotMilliseconds = scoreSnapshotMilliseconds(score);
  const canAdvance = snapshotMilliseconds > 0 && score?.availableScore != null;
  const now = useSecondClock(canAdvance);
  const value = canAdvance ? liveAvailableScore(score, now, snapshotMilliseconds) : score?.availableScore;
  return <ScoreValue loading={loading} value={value} decimals={scoreRateDecimals(score?.grossScorePerSecond)} />;
}

/// Score earned but still inside the holding window: total − spent − available.
/// With a steady balance it stays flat once the window has passed.
function LiveCooldownScore({ score, maturityPhrase }) {
  const snapshotMilliseconds = scoreSnapshotMilliseconds(score);
  const ready = snapshotMilliseconds > 0 && score?.availableScore != null && score?.grossEarnedScore != null;
  const now = useSecondClock(ready);
  if (!ready) return null;
  const elapsed = Math.max(0, now - snapshotMilliseconds);
  const total = wadUnits(liveScoreValue(score.grossEarnedScore, score.grossScorePerSecond, elapsed));
  const available = wadUnits(liveAvailableScore(score, now, snapshotMilliseconds));
  const spent = wadUnits(score.scoreSpent || '0');
  const cooling = total - spent - available;
  if (cooling <= 0n) return null;
  return (
    <small className="score-cooldown-note">
      {formatScore(formatWad(cooling, 18), scoreRateDecimals(score.grossScorePerSecond))} in cooldown, available within {maturityPhrase}
    </small>
  );
}

function LivePoolEarnings({ pool }) {
  return <>{displayValue(useLivePoolEarnings(pool).earnings)}<small className="cover-pool-unit"> USD8</small></>;
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
        <img className="landing-footer-wordmark" src={usd8Wordmark} alt="USD8.fi" />
      </a>
      <nav className="landing-footer-links" aria-label="Footer">
        <div>
          <a className="site-nav-link" href={docsUrl()} target="_blank" rel="noreferrer">Docs</a>
          <a className="site-nav-link" href="https://github.com/Usd8-fi/usd8-core" target="_blank" rel="noreferrer">Github</a>
          <a className="site-nav-link" href="https://t.me/+e84i2oYk1ao1MTk1" target="_blank" rel="noreferrer">Telegram</a>
          <a className="site-nav-link" href="https://x.com/usd8_fi" target="_blank" rel="noreferrer">X.com</a>
        </div>
        <div>
          <a className="site-nav-link" href="https://github.com/Usd8-fi/usd8-core/tree/main/audit" target="_blank" rel="noreferrer">Audit Report</a>
          <a className="site-nav-link" href={docsUrl('addresses.html')} target="_blank" rel="noreferrer">Addresses</a>
          <a className="site-nav-link" href={docsUrl('faqs.html')} target="_blank" rel="noreferrer">FAQs</a>
          <a className="site-nav-link" href={docsUrl('defi-insurance.html#boosters')} target="_blank" rel="noreferrer">Check Boosters</a>
        </div>
        <div>
          <a className="site-nav-link" href={docsUrl('transparency.html')} target="_blank" rel="noreferrer">Transparency</a>
          <a className="site-nav-link" href={docsUrl('usd8.html#contact')} target="_blank" rel="noreferrer">Contacts</a>
          <a className="site-nav-link" href={docsUrl('legal.html')} target="_blank" rel="noreferrer">Legal</a>
          <button className="site-nav-link analytics-settings-link" type="button" data-analytics-settings>Cookie Settings</button>
        </div>
      </nav>
      <small className="landing-data-freshness">
        All code open sourced
        {updatedAt ? `. Data as of ${new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
      </small>
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
  scoreRatePerDay,
  scoreRateLoading = false,
  scoreRateUnit,
  apy,
  flag,
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
            <MetricValue
              loading={scoreRateLoading}
              value={scoreRatePerDay ? `${formatScoreRate(scoreRatePerDay)} per ${scoreRateUnit} per day` : null}
              label="Loading score rate"
            />
            <InfoTooltip ariaLabel="About score rate">
              {scoreRatePerDay
                ? `You get ${formatScoreRate(scoreRatePerDay)} score per day for every ${scoreRateUnit} you hold. Rewarded every block.`
                : `Score earned per day for every ${scoreRateUnit} you hold. Rewarded every block.`}
            </InfoTooltip>
            {flag ? <span className="insurance-asset-flag">{flag}</span> : null}
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

function simulatorInsuredTokens(insuredTokenStates = {}) {
  return COVERED_PROTOCOL_ROWS
    .filter((row) => insuredTokenStates[row.id]?.enabled)
    .map((row) => ({ id: row.id, symbol: row.symbol, maxCoverageBps: Number(insuredTokenStates[row.id].maxCoverageBps) }));
}

function simulatorPools(pools = []) {
  return pools.flatMap((pool) => {
    try {
      const balance = BigInt(pool.withdrawalQuote?.totalAssets ?? '0');
      const price = BigInt(pool.usdPrice ?? '0');
      if (!Number.isInteger(pool.priceDecimals)) return [];
      return [{ id: pool.id, symbol: pool.assetSymbol, balance, price, priceDecimals: pool.priceDecimals, assetDecimals: 18 }];
    } catch {
      return [];
    }
  });
}

// The sUSD8 Morpho vault is not deployed or registered yet, so there is no
// on-chain rate to read. Show the planned rate until it is; then pass
// scoreRatesPerTokenPerDay?.savings again (and its loading flag).
const SUSD8_PLANNED_SCORE_RATE_PER_DAY = '0.1';

function FreeInsurancePage({ wallet, score, scoreStatus, availableScoreLoading, balances, balancesLoading, savingsVault, pools, poolLoading, incident, insuredTokenStates, scoreMaturitySeconds, scoreRatesPerTokenPerDay, scoreRatesLoading, onFileClaim, onPoolAction, onUsd8Action, fileClaimUnavailableReason }) {
  const scoreMaturityPhrase = durationPhrase(scoreMaturitySeconds) || 'the holding period';
  const scoreLoading = scoreStatus === 'loading';
  const walletUnavailableReason = wallet.connected ? wallet.networkUnavailableReason || '' : CONNECT_WALLET_REASON;
  const [nowMilliseconds, setNowMilliseconds] = useState(Date.now());
  const [simulatorOpen, setSimulatorOpen] = useState(false);

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
            Your Insurance Score
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
          scoreRatePerDay={scoreRatesPerTokenPerDay?.usd8}
          scoreRateLoading={scoreRatesLoading}
          scoreRateUnit="USD8"
          flag="x300% for private beta"
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
          scoreRatePerDay={SUSD8_PLANNED_SCORE_RATE_PER_DAY}
          scoreRateLoading={false}
          scoreRateUnit="sUSD8"
          apy={savingsVault.apy}
        >
          {/* Unlinked until the USD8 Morpho vault is deployed; then link MORPHO_VAULT_URL again. */}
          <button type="button" className="landing-gold-button">
            Coming Soon
          </button>
        </AssetCard>
      </section>

      <section className="insurance-token-section">
        <div className="insurance-claim-summary">
          <p>File claim with your insurance score.</p>
          <div>
            <span className="metric-label-with-help">
              Your Available Score
              <InfoTooltip ariaLabel="About available score" className="dashboard-help--align-right">
                Score becomes available to use after {scoreMaturityPhrase}, minus any score already spent on claims.
              </InfoTooltip>
            </span>
            <strong>
              <LiveAvailableScoreValue loading={availableScoreLoading ?? scoreLoading} score={score} />
            </strong>
            <LiveCooldownScore score={score} maturityPhrase={scoreMaturityPhrase} />
          </div>
        </div>
        <div className="covered-protocols-table-area">
          <CoveredProtocolsTable
            onFileClaim={onFileClaim}
            fileClaimUnavailableReason={fileClaimUnavailableReason || walletUnavailableReason}
            incident={incident}
            insuredTokenStates={insuredTokenStates}
            nowMilliseconds={nowMilliseconds}
            onSimulate={() => setSimulatorOpen(true)}
          />
        </div>
      </section>
      {simulatorOpen ? (
        <SimulateClaimDialog
          onClose={() => setSimulatorOpen(false)}
          insuredTokens={simulatorInsuredTokens(insuredTokenStates)}
          pools={simulatorPools(pools)}
        />
      ) : null}

      <section className="cover-pools-section" aria-labelledby="cover-pools-title">
        <h2 className="landing-section-title" id="cover-pools-title">Cover Pools</h2>
        <p className="cover-pool-warning">
          Be aware: Cover Pools might be deployed to cover insured token loss, make sure you understand the{' '}
          <a href={docsUrl('cover-pools.html')} target="_blank" rel="noreferrer">risk involved</a>.
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
          <a href={docsUrl('white-hat-economy.html')} target="_blank" rel="noreferrer">Learn More</a>.
        </p>
      </section>
    </main>
  );
}

function CapacityBar({ value = 0, uncapped = false, assets = '0', assetSymbol = 'wstETH' }) {
  if (uncapped) {
    return <div className="landing-capacity landing-capacity--value" aria-label={`${assets} ${assetSymbol} deposited, uncapped`}>Uncapped</div>;
  }
  const bounded = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="landing-capacity landing-capacity--value percent-with-ring" aria-label={`${Math.round(bounded)}% capacity filled`}>
      {`${Math.round(bounded)}%`}
      <PercentRing share={bounded / 100} />
    </div>
  );
}

function apyNumber(value) {
  const number = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(number) ? number : null;
}

/// The choice is offered once both figures exist. While rewards are younger than
/// the window, the tooltip says how much history the figure really uses.
function apyWindowChoice(pool) {
  const week = apyNumber(pool.apy7d);
  const month = apyNumber(pool.apy);
  const offered = week !== null && month !== null;
  return { offered, preferred: offered && week > month ? '7D' : '30D' };
}

/// While rewards are younger than the APY window, say how much history it uses.
function apyHistoryNote(windowSeconds, windowDays = 30) {
  if (!Number.isFinite(windowSeconds) || windowSeconds <= 0 || windowSeconds >= windowDays * 86_400) return '';
  const days = windowSeconds / 86_400;
  const span = days >= 1
    ? `${Math.floor(days)} day${Math.floor(days) === 1 ? '' : 's'}`
    : `${Math.max(1, Math.floor(windowSeconds / 3_600))} hour${Math.floor(windowSeconds / 3_600) === 1 ? '' : 's'}`;
  return ` Based on ${span} of rewards so far; becomes a ${windowDays}-day average after ${windowDays} days.`;
}

function CoverPoolCard({ pool, poolLoading, walletUnavailableReason, onPoolAction }) {
  const [chosenWindow, setChosenWindow] = useState(null);
  const { offered: windowOffered, preferred: preferredWindow } = apyWindowChoice(pool);
  // Starts on whichever average is higher; a click keeps the user's choice.
  const apyWindow = windowOffered ? (chosenWindow ?? preferredWindow) : '30D';
  const apyDays = apyWindow === '7D' ? 7 : 30;
  const cardClassName = pool.tint === 'green' ? 'cover-pool-card cover-pool-card--green' : 'cover-pool-card';
  return (
    <section className={cardClassName} aria-label={pool.name}>
      <header>
        <img src={pool.id === 'usd8' ? usd8Logo : coverWsteth} alt="" />
        <h2>{pool.name}</h2>
      </header>

      <div className="cover-pool-stats">
        <div>
          <span className="metric-label-with-help">
            {windowOffered ? (
              <span className="apy-window-label" role="group" aria-label={`APY window for ${pool.name}`}>
                {['7D', '30D'].map((option, index) => (
                  <Fragment key={option}>
                    {index ? ' ' : ''}
                    <button type="button" className="apy-window-option" aria-pressed={apyWindow === option} onClick={() => setChosenWindow(option)}>{option}</button>
                  </Fragment>
                ))}
                {' APY'}
              </span>
            ) : `${apyWindow} APY`}
            <InfoTooltip ariaLabel={`About ${apyDays}-day APY for ${pool.name}`}>
              USD8 earnings accrued over the past {apyDays} days, annualized against average pool value. Earnings represented by this APY are delivered in USD8.{apyHistoryNote(apyWindow === '7D' ? pool.apy7dWindowSeconds : pool.apyWindowSeconds, apyDays)}
            </InfoTooltip>
          </span>
          <strong>
            <MetricValue loading={poolLoading} value={apyWindow === '7D' ? pool.apy7d : pool.apy} label="Loading pool data" />
          </strong>
        </div>
        <div><span>TVL</span><strong><MetricValue loading={poolLoading} value={pool.tvl} label="Loading pool data" /></strong></div>
        <div>
          <span>Your Deposit</span>
          <strong>
            {/^[—–-]$/.test(String(pool.deposit ?? '').trim())
              ? <LoadingSpinner label="Loading your deposit" />
              : <>{formatAssetBalance(pool.deposit, pool.assetSymbol)}<small className="cover-pool-unit"> {pool.assetSymbol}</small></>}
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
        <div className="cover-pool-capacity-metric">
          <span className="metric-label-with-help">
            Capacity
            <InfoTooltip ariaLabel={`About capacity for ${pool.name}`} className="dashboard-help--align-right">
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
  scoreRatesPerTokenPerDay = null,
  // Spin until the caller says the on-chain rate read finished (or failed).
  scoreRatesLoading = true,
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
            <img className="landing-brand-wordmark" src={usd8Wordmark} alt="USD8.fi" />
          </a>
          <a className="landing-beta-link" href={docsUrl('faqs.html#whats-different-in-beta')} target="_blank" rel="noreferrer">beta</a>
        </div>
        <WalletButton wallet={wallet} />
        {wallet.networkUnavailableReason && wallet.onSwitchNetwork ? <button type="button" className="landing-wallet-button" onClick={wallet.onSwitchNetwork}>{`Switch to ${getProtocolNetwork(PROTOCOL_CHAIN_ID)?.name ?? 'Ethereum'}`}</button> : null}
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
        scoreRatesPerTokenPerDay={scoreRatesPerTokenPerDay}
        scoreRatesLoading={scoreRatesLoading}
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