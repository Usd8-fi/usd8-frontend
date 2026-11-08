import WalletNoticeProvider, { NoticeMessage } from './WalletNotice.jsx';
import { Fragment, useEffect, useId, useRef, useState } from 'react';
import coverWsteth from '../assets/cover-wsteth.png';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
import usd8Wordmark from '../assets/usd8-wordmark.svg';
import { useLivePoolEarnings } from '../lib/livePoolEarnings.js';
import { useSecondClock } from '../lib/secondClock.js';
import { liveAvailableScore } from '../lib/scoreRules.js';
import { formatWad, groupDecimalString, rateDecimals, wadUnits } from '../lib/units.js';
import { visibleDecimals } from '../lib/displayAvailableBalance.js';
import { docsUrl } from '../lib/docsLinks.js';
import { durationPhrase } from '../lib/durations.js';
import AvailabilityAction, { CONNECT_WALLET_REASON } from './AvailabilityAction.jsx';
import CoveredProtocolsTable, { COVERED_PROTOCOL_ROWS } from './CoveredProtocolsTable.jsx';
import SimulateClaimDialog from './SimulateClaimDialog.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import { getProtocolNetwork, PROTOCOL_CHAIN_ID } from '../lib/networkConfig.js';
import PercentRing from './PercentRing.jsx';
import LoadingSpinner, { MetricValue } from './LoadingSpinner.jsx';
import LanguagePicker from './LanguagePicker.jsx';
import SiteNotice from './SiteNotice.jsx';
import { getLanguage, poolDisplayName, useTranslation } from '../lib/i18n.js';


function displayValue(value, fallback = '0') {
  return value === null || value === undefined || value === '' ? fallback : value;
}

const formatWholeBalance = (value) => groupDecimalString(displayValue(value), { decimals: 0 });
// Dollar-denominated balances read as whole numbers everywhere on the page.
// Other assets keep two decimals, because a whole wstETH hides most of a
// typical position.
const WHOLE_NUMBER_ASSETS = new Set(['USD8', 'sUSD8', 'USDC']);
// A balance too small for the usual precision shows its first significant
// digits instead of reading as zero.
const formatAssetBalance = (value, assetSymbol) => {
  const shown = displayValue(value);
  return groupDecimalString(shown, { decimals: visibleDecimals(shown, WHOLE_NUMBER_ASSETS.has(assetSymbol) ? 0 : 2) });
};
// Button label keys (landing.pool.actions.*), translated at render.
const POOL_ACTION_LABELS = { deposit: 'landing.pool.actions.deposit', withdraw: 'landing.pool.actions.withdraw', claimReward: 'landing.pool.actions.claimReward' };
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
  const { t } = useTranslation();
  if (loading) {
    return <LoadingSpinner label={t('landing.score.loading')} />;
  }
  // translate="no": see MetricValue (browser translation vs. a ticking text node).
  return <span translate="no">{value === null || value === undefined || value === '' ? displayValue(value) : formatScore(value, decimals)}</span>;
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
function LiveCooldownScore({ score, maturitySeconds }) {
  const { t } = useTranslation();
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
  const maturityPhrase = durationPhrase(maturitySeconds);
  return (
    <small className="score-cooldown-note">
      {maturityPhrase
        ? t('landing.score.cooldownIn', { amount: formatScore(formatWad(cooling, 18), scoreRateDecimals(score.grossScorePerSecond)), duration: maturityPhrase })
        : t('landing.score.cooldownAfterHolding', { amount: formatScore(formatWad(cooling, 18), scoreRateDecimals(score.grossScorePerSecond)) })}
    </small>
  );
}

function LivePoolEarnings({ pool }) {
  return <><span translate="no">{displayValue(useLivePoolEarnings(pool).earnings)}</span><small className="cover-pool-unit"> USD8</small></>;
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
  const { t } = useTranslation();
  return (
    <AvailabilityAction
      className="landing-wallet-button"
      type="button"
      onClick={connected ? onDisconnect : onConnect}
      aria-label={connected ? t('landing.wallet.manageLabel', { address }) : t('landing.wallet.connect')}
      unavailableReason={connected ? '' : connectUnavailableReason}
    >
      {connecting ? t('landing.wallet.connecting') : connected ? (
        <>
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
          {networkName ? <span className="landing-wallet-network">{` ${networkName}`}</span> : null}
        </>
      ) : t('landing.wallet.connect')}
    </AvailabilityAction>
  );
}


function SiteFooter({ updatedAt }) {
  const { t } = useTranslation();
  return (
    <footer className="landing-footer">
      <a className="landing-footer-logo" href="./" aria-label={t('landing.footer.homeLabel')}>
        <img src={usd8Logo} alt="" />
        <img className="landing-footer-wordmark" src={usd8Wordmark} alt="USD8.fi" />
      </a>
      <nav className="landing-footer-links" aria-label={t('landing.footer.navLabel')}>
        <div>
          <a className="site-nav-link" href={docsUrl()} target="_blank" rel="noreferrer">{t('landing.footer.docs')}</a>
          <a className="site-nav-link" href="https://github.com/Usd8-fi/usd8-core" target="_blank" rel="noreferrer">Github</a>
          <a className="site-nav-link" href="https://t.me/+e84i2oYk1ao1MTk1" target="_blank" rel="noreferrer">Telegram</a>
          <a className="site-nav-link" href="https://x.com/usd8_fi" target="_blank" rel="noreferrer">X.com</a>
        </div>
        <div>
          <a className="site-nav-link" href="https://github.com/Usd8-fi/usd8-core/tree/main/audit" target="_blank" rel="noreferrer">{t('landing.footer.auditReport')}</a>
          <a className="site-nav-link" href={docsUrl('addresses.html#addresses')} target="_blank" rel="noreferrer">{t('landing.footer.addresses')}</a>
          <a className="site-nav-link" href={docsUrl('addresses.html#timelock-queues')} target="_blank" rel="noreferrer">{t('landing.footer.timelockQueues')}</a>
          <a className="site-nav-link" href={docsUrl('faqs.html')} target="_blank" rel="noreferrer">{t('landing.footer.faqs')}</a>
          <a className="site-nav-link" href={docsUrl('defi-insurance.html#boosters')} target="_blank" rel="noreferrer">{t('landing.footer.checkBoosters')}</a>
        </div>
        <div>
          <a className="site-nav-link" href={docsUrl('transparency.html')} target="_blank" rel="noreferrer">{t('landing.footer.transparency')}</a>
          <a className="site-nav-link" href={docsUrl('usd8.html#contact')} target="_blank" rel="noreferrer">{t('landing.footer.contacts')}</a>
          <a className="site-nav-link" href={docsUrl('legal.html')} target="_blank" rel="noreferrer">{t('landing.footer.legal')}</a>
          <button className="site-nav-link analytics-settings-link" type="button" data-analytics-settings>{t('landing.footer.cookieSettings')}</button>
        </div>
        <div className="landing-footer-language">
          <LanguagePicker />
        </div>
      </nav>
      <small className="landing-data-freshness">
        {updatedAt
          ? t('landing.footer.openSourceWithDataTime', { time: new Date(updatedAt).toLocaleTimeString(getLanguage() === 'en' ? [] : document.documentElement.lang, { hour: '2-digit', minute: '2-digit' }) })
          : t('landing.footer.openSource')}
      </small>
    </footer>
  );
}

function AssetCard({
  title,
  iconSrc = usd8Logo,
  balance,
  balanceLabel,
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
  apyHelp,
  flag,
  children,
}) {
  const { t } = useTranslation();
  return (
    <article className="insurance-asset-card">
      <header>
        <img src={iconSrc} alt="" />
        <h2>{title}</h2>
      </header>

      <dl className="insurance-asset-terms">
        <div>
          <dt>{t('landing.asset.insured')}</dt>
          <dd className="metric-label-with-help">
            {t('landing.asset.insuredValue')}
            <InfoTooltip ariaLabel={t('landing.asset.coverageHelpLabel')}>
              {t('landing.asset.coverageHelp')}
            </InfoTooltip>
          </dd>
        </div>
        <div>
          <dt>{t('landing.asset.scoreRate')}</dt>
          <dd className="metric-label-with-help">
            <MetricValue
              loading={scoreRateLoading}
              value={scoreRatePerDay ? t('landing.asset.scoreRateValue', { rate: formatScoreRate(scoreRatePerDay), unit: scoreRateUnit }) : null}
              label={t('landing.asset.scoreRateLoading')}
            />
            <InfoTooltip ariaLabel={t('landing.asset.scoreRateHelpLabel')}>
              {scoreRatePerDay
                ? t('landing.asset.scoreRateHelp', { rate: formatScoreRate(scoreRatePerDay), unit: scoreRateUnit })
                : t('landing.asset.scoreRateHelpPending', { unit: scoreRateUnit })}
            </InfoTooltip>
            {flag ? <span className="insurance-asset-flag">{flag}</span> : null}
          </dd>
        </div>
      </dl>

      <div className="insurance-asset-values">
        <div>
          <span>{balanceLabel ?? t('landing.asset.balance')}</span>
          <strong>
            {balanceLoading
              ? <LoadingSpinner label={t('landing.asset.balanceLoading')} />
              : wholeBalance ? formatWholeBalance(balance) : displayValue(balance)}
          </strong>
        </div>
        {apy !== undefined ? (
          <div>
            <span className="metric-label-with-help">
              {t('common.metrics.apy')}
              {apyHelp ? <InfoTooltip ariaLabel={t('landing.asset.apyHelpLabel', { title })}>{apyHelp}</InfoTooltip> : null}
            </span>
            <strong><MetricValue value={apy} label={t('landing.asset.apyLoading')} /></strong>
          </div>
        ) : null}
      </div>

      <div className="insurance-asset-score">
        <span>{t('landing.asset.scoreEarned')}</span>
        <strong><LiveScoreValue loading={scoreLoading} score={score} valueKey={scoreKey} rateKey={scoreRateKey} /></strong>
      </div>

      <div className="insurance-asset-actions">{children}</div>
    </article>
  );
}

function simulatorInsuredTokens(insuredTokenStates = {}) {
  const addresses = getProtocolNetwork(PROTOCOL_CHAIN_ID)?.contracts.insuredTokens ?? {};
  return COVERED_PROTOCOL_ROWS
    .filter((row) => insuredTokenStates[row.id]?.enabled)
    .map((row) => ({
      id: row.id,
      symbol: row.symbol,
      address: addresses[row.id] ?? '',
      maxCoverageBps: Number(insuredTokenStates[row.id].maxCoverageBps),
    }));
}

function simulatorPools(pools = []) {
  return pools.flatMap((pool) => {
    try {
      const balance = BigInt(pool.withdrawalQuote?.totalAssets ?? '0');
      const price = BigInt(pool.usdPrice ?? '0');
      if (!Number.isInteger(pool.priceDecimals)) return [];
      return [{ id: pool.id, symbol: pool.assetSymbol, asset: pool.asset ?? '', balance, price, priceDecimals: pool.priceDecimals, assetDecimals: 18 }];
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
  // Docs link to /#cover-pools. The page renders after load, so the browser's own
  // jump to the anchor misses it: scroll once the section exists.
  const { t, tRich } = useTranslation();
  const coverPoolsRef = useRef(null);
  useEffect(() => {
    if (window.location.hash === '#cover-pools') coverPoolsRef.current?.scrollIntoView?.();
  }, []);
  const scoreMaturityPhrase = durationPhrase(scoreMaturitySeconds) || t('landing.score.holdingPeriod');
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
      <h1 className="landing-section-title">{t('landing.score.title')}</h1>
      <section className="insurance-summary">
        <p>{t('landing.score.intro')}</p>
        <div>
          <span className="metric-label-with-help">
            {t('landing.score.total')}
            <InfoTooltip ariaLabel={t('landing.score.totalHelpLabel')} className="dashboard-help--align-right">
              {t('landing.score.totalHelp')}
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
          flag={t('landing.usd8.flag')}
        >
          <AvailabilityAction type="button" onClick={() => onUsd8Action?.('mint')} unavailableReason={walletUnavailableReason}>
            {t('landing.usd8.mint')}
          </AvailabilityAction>
          <AvailabilityAction type="button" onClick={() => onUsd8Action?.('redeem')} unavailableReason={walletUnavailableReason}>
            {t('landing.usd8.redeem')}
          </AvailabilityAction>
        </AssetCard>

        <AssetCard
          title={t('landing.susd8.title')}
          iconSrc={sUsd8Logo}
          balance={balances.savingsAssets}
          balanceLabel={t('landing.susd8.balance')}
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
          apyHelp={(
            <>
              <span className="apy-help-section">
                {t('landing.susd8.apyHelp')}
              </span>
              <YieldIllustration target={t('landing.susd8.yieldTarget')} />
            </>
          )}
        >
          {/* Unlinked until the USD8 Morpho vault is deployed; then link MORPHO_VAULT_URL again. */}
          <button type="button" className="landing-gold-button">
            {t('landing.susd8.comingSoon')}
          </button>
        </AssetCard>
      </section>

      <section className="insurance-token-section">
        <h1 className="landing-section-title">{t('landing.claims.title')}</h1>
        <div className="insurance-claim-summary">
          <p>{t('landing.claims.intro')}</p>
          <div>
            <span className="metric-label-with-help">
              {t('landing.claims.available')}
              <InfoTooltip ariaLabel={t('landing.claims.availableHelpLabel')} className="dashboard-help--align-right">
                {t('landing.claims.availableHelp', { duration: scoreMaturityPhrase })}
              </InfoTooltip>
            </span>
            <strong>
              <LiveAvailableScoreValue loading={availableScoreLoading ?? scoreLoading} score={score} />
            </strong>
            <LiveCooldownScore score={score} maturitySeconds={scoreMaturitySeconds} />
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

      <section id="cover-pools" ref={coverPoolsRef} className="cover-pools-section" aria-labelledby="cover-pools-title">
        <div className="landing-section-title-row">
          <h2 className="landing-section-title" id="cover-pools-title">{t('landing.coverPools.title')}</h2>
          <InfoTooltip ariaLabel={t('landing.coverPools.helpLabel')}>
            {t('landing.coverPools.help')}
          </InfoTooltip>
        </div>
        <p className="cover-pool-warning">
          {tRich('landing.coverPools.warning', {
            link: (text) => <a href={docsUrl('cover-pools.html')} target="_blank" rel="noreferrer">{text}</a>,
          })}
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
        <h2 className="landing-section-title" id="white-hat-economy-title">{t('landing.whiteHat.title')}</h2>
        <p className="white-hat-economy-message">
          {tRich('landing.whiteHat.message', {
            link: (text) => <a href={docsUrl('white-hat-economy.html')} target="_blank" rel="noreferrer">{text}</a>,
          })}
        </p>
      </section>
    </main>
  );
}

function CapacityBar({ value = 0, uncapped = false, assets = '0', assetSymbol = 'wstETH' }) {
  const { t } = useTranslation();
  if (uncapped) {
    return <div className="landing-capacity landing-capacity--value" aria-label={t('landing.pool.uncappedLabel', { assets, asset: assetSymbol })}>{t('landing.pool.uncapped')}</div>;
  }
  const bounded = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="landing-capacity landing-capacity--value percent-with-ring" aria-label={t('landing.pool.capacityFilledLabel', { percent: Math.round(bounded) })}>
      {`${Math.round(bounded)}%`}
      <PercentRing share={bounded / 100} />
    </div>
  );
}

/// Where the APY comes from, as a small illustration: yield from the USDC behind
/// all USD8 flows into a much smaller pool. For cover pools the size gap is
/// what pushes the APY up, so that variant labels it.
function YieldIllustration({ target, smallPool = false }) {
  const { t } = useTranslation();
  const id = useId().replace(/:/g, '');
  return (
    <svg className="apy-illustration" viewBox="0 0 300 156" role="img" aria-label={t('landing.yieldIllustration.label', { target })}>
      <defs>
        <linearGradient id={`${id}-reserve`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4d8dff" />
          <stop offset="1" stopColor="#2775ca" />
        </linearGradient>
        <linearGradient id={`${id}-flow`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4d8dff" stopOpacity="0.75" />
          <stop offset="0.55" stopColor="#34d3a0" stopOpacity="0.7" />
          <stop offset="1" stopColor="#e3b54a" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${id}-pool`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3cf6b" />
          <stop offset="1" stopColor="#d49b22" />
        </linearGradient>
      </defs>
      <rect x="2" y="16" width="96" height="116" rx="10" fill={`url(#${id}-reserve)`} />
      <text x="50" y="66" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="600">USDC</text>
      <text x="50" y="84" textAnchor="middle" fill="#e6efff" fontSize="10.5">{t('landing.yieldIllustration.backing')}</text>
      <path d="M98 34 C158 34 168 64 214 64 L214 92 C168 92 158 114 98 114 Z" fill={`url(#${id}-flow)`} />
      <text x="150" y="78" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="600">{t('landing.yieldIllustration.defiYield')}</text>
      <text x="150" y="91" textAnchor="middle" fill="#f2fff9" fontSize="9">{t('landing.yieldIllustration.viaTreasury')}</text>
      <circle cx="126" cy="46" r="5" fill="#f3cf6b" />
      <circle cx="176" cy="60" r="4" fill="#f3cf6b" />
      <circle cx="188" cy="98" r="4.5" fill="#f3cf6b" />
      <rect x="214" y="58" width="84" height="40" rx="8" fill={`url(#${id}-pool)`} />
      <text x="256" y="82" textAnchor="middle" fill="#1b1405" fontSize="11" fontWeight="700">{target}</text>
      {smallPool ? (
        <>
          <text x="256" y="44" textAnchor="middle" fill="#34f5a0" fontSize="11" fontWeight="700">{t('landing.yieldIllustration.highApy')}</text>
          <text x="50" y="150" textAnchor="middle" fill="#9a9a9a" fontSize="9.5">{t('landing.yieldIllustration.largeSupply')}</text>
          <text x="256" y="114" textAnchor="middle" fill="#9a9a9a" fontSize="9.5">{t('landing.yieldIllustration.smallPool')}</text>
        </>
      ) : null}
    </svg>
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

function CoverPoolCard({ pool, poolLoading, walletUnavailableReason, onPoolAction }) {
  const { t } = useTranslation();
  const [chosenWindow, setChosenWindow] = useState(null);
  const { offered: windowOffered, preferred: preferredWindow } = apyWindowChoice(pool);
  // Starts on whichever average is higher; a click keeps the user's choice.
  const apyWindow = windowOffered ? (chosenWindow ?? preferredWindow) : '30D';
  const apyDays = apyWindow === '7D' ? 7 : 30;
  const poolName = poolDisplayName(pool);
  const cardClassName = {
    green: 'cover-pool-card cover-pool-card--green',
    usd8: 'cover-pool-card cover-pool-card--usd8',
  }[pool.tint] ?? 'cover-pool-card';
  const usd8Styled = pool.id === 'usd8' || pool.tint === 'usd8';
  return (
    <section className={cardClassName} aria-label={poolName}>
      <header>
        <img src={usd8Styled ? usd8Logo : coverWsteth} alt="" />
        <h2>{poolName}</h2>
      </header>

      <div className="cover-pool-stats">
        <div>
          <span className="metric-label-with-help">
            {windowOffered ? (
              <span className="apy-window-label" role="group" aria-label={t('landing.pool.apyWindowLabel', { pool: poolName })}>
                {['7D', '30D'].map((option, index) => (
                  <Fragment key={option}>
                    {index ? ' ' : ''}
                    <button type="button" className="apy-window-option" aria-pressed={apyWindow === option} onClick={() => setChosenWindow(option)}>{t(`common.metrics.window${option}`)}</button>
                  </Fragment>
                ))}
                {t('common.metrics.apySuffix')}
              </span>
            ) : t('common.metrics.windowApy', { window: t(`common.metrics.window${apyWindow}`) })}
            <InfoTooltip ariaLabel={t('landing.pool.apyHelpLabel', { days: apyDays, pool: poolName })}>
              <span className="apy-help-section">
                {t('landing.pool.apyHelpSource')}
              </span>
              <YieldIllustration target={t('landing.pool.yieldTarget')} smallPool />
              <span className="apy-help-section">
                {t('landing.pool.apyHelpWhyHigh')}
              </span>
            </InfoTooltip>
          </span>
          <strong>
            <MetricValue loading={poolLoading || pool.apyPending === true} value={apyWindow === '7D' ? pool.apy7d : pool.apy} label={t('landing.pool.loading')} />
          </strong>
        </div>
        <div><span>{t('common.metrics.tvl')}</span><strong><MetricValue loading={poolLoading} value={pool.tvl} label={t('landing.pool.loading')} /></strong></div>
        <div className="cover-pool-capacity-metric">
          <span className="metric-label-with-help">
            {t('landing.pool.filled')}
            <InfoTooltip ariaLabel={t('landing.pool.filledHelpLabel', { pool: poolName })} className="dashboard-help--align-right">
              {pool.capacityUncapped
                ? t('landing.pool.filledHelpUncapped')
                : t('landing.pool.filledHelp')}
            </InfoTooltip>
          </span>
          {poolLoading && pool.capacityPercent === null
            ? <LoadingSpinner label={t('landing.pool.capacityLoading')} />
            : <CapacityBar value={pool.capacityPercent} uncapped={pool.capacityUncapped} assets={pool.assets} assetSymbol={pool.assetSymbol} />}
        </div>
        <div>
          <span>{t('landing.pool.deposit')}</span>
          <strong>
            {/^[—–-]$/.test(String(pool.deposit ?? '').trim())
              ? <LoadingSpinner label={t('landing.pool.depositLoading')} />
              : <>{formatAssetBalance(pool.deposit, pool.assetSymbol)}<small className="cover-pool-unit"> {pool.assetSymbol}</small></>}
          </strong>
        </div>
        <div>
          <span className="metric-label-with-help">
            {t('landing.pool.earnings')}
            <InfoTooltip ariaLabel={t('landing.pool.earningsHelpLabel', { pool: poolName })} className="dashboard-help--align-right">
              {t('landing.pool.earningsHelp', { asset: pool.assetSymbol })}
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
            {t(POOL_ACTION_LABELS[action])}
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
  const { t } = useTranslation();
  return (
    <WalletNoticeProvider wallet={wallet}>
    <SiteNotice />
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-brand-group">
          <a className="landing-brand" href="./" aria-label={t('landing.header.homeLabel')}>
            <img src={usd8Logo} alt="USD8" />
            <img className="landing-brand-wordmark" src={usd8Wordmark} alt="USD8.fi" />
          </a>
          <a className="landing-beta-link" href={docsUrl('faqs.html#whats-different-in-beta')} target="_blank" rel="noreferrer">{t('landing.header.beta')}</a>
        </div>
        <WalletButton wallet={wallet} />
        {wallet.networkUnavailableReason && wallet.onSwitchNetwork ? <button type="button" className="landing-wallet-button" onClick={wallet.onSwitchNetwork}>{t('landing.header.switchNetwork', { network: getProtocolNetwork(PROTOCOL_CHAIN_ID)?.name ?? 'Ethereum' })}</button> : null}
      </header>

      {dataError ? (
        <NoticeMessage message={dataError} actionLabel={onRetry ? t('landing.header.retryData') : undefined} onAction={onRetry} />
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