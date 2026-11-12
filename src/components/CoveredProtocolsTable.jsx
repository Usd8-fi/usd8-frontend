import { UNKNOWN_VALUE } from '../lib/units.js';
import { Fragment } from 'react';
// Token icons (not protocol logos), from each issuer's app or the Curve/CoinGecko token lists.
// Raster icons stay separate cached files; base64-inlining them would add
// incompressible data to the public page's first-load JS.
import sGhoIcon from '../assets/token-sgho.svg';
import scrvUsdIcon from '../assets/token-scrvusd.webp?no-inline';
import msLossLogo from '../assets/msloss-test.svg';
import sUsdsIcon from '../assets/token-susds.webp?no-inline';
import steakUsdcIcon from '../assets/token-steakusdc.webp?no-inline';
import ssftUsdIcon from '../assets/token-ssftusd.svg';
import wstEthIcon from '../assets/token-wsteth.webp?no-inline';
import rEthIcon from '../assets/token-reth.webp?no-inline';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
import { remainingTimeParts } from '../lib/claimLifecycle.js';
import { LOCAL_E2E_TEST_TOKEN } from '../lib/networkConfig.js';
import AvailabilityAction from './AvailabilityAction.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import PercentRing from './PercentRing.jsx';
import TableTokenCell from './TableTokenCell.jsx';
import { t, useTranslation } from '../lib/i18n.js';

// Names are one line; the cell wraps them only when the column is too narrow.
export const COVERED_PROTOCOL_ROWS = [
  {
    id: 'usd8',
    symbol: 'USD8',
    iconSrc: usd8Logo,
    token: 'USD8',
    address: 'TBD',
  },
  {
    id: 'susd8',
    symbol: 'sUSD8',
    iconSrc: sUsd8Logo,
    token: 'USD8 Protected Savings sUSD8',
    address: 'TBD',
  },
  {
    id: 'aave-sgho',
    symbol: 'sGHO',
    iconSrc: sGhoIcon,
    token: 'Aave Savings GHO sGHO',
    url: 'https://app.aave.com/sgho/',
    address: '0xE1753F2e00940cC31213dd92013cF019DFE4ca1d',
  },
  {
    id: 'curve-scrvusd',
    symbol: 'scrvUSD',
    iconSrc: scrvUsdIcon,
    token: 'Curve Savings scrvUSD',
    address: <>0x0655977feb2f289a4ab78af67bab0d17aab84367<br />impl 0xd8063123bba3b480569244ae66bfe72b6c84b00d</>,
  },
  {
    id: 'sky-susds',
    symbol: 'sUSDS',
    iconSrc: sUsdsIcon,
    token: 'Sky Savings sUSDS',
    url: 'https://app.sky.money/',
    address: '0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD',
  },
  {
    id: 'morpho-steakusdc',
    symbol: 'steakUSDC',
    iconSrc: steakUsdcIcon,
    token: 'Morpho Steakhouse USDC steakUSDC',
    address: '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
    url: 'https://app.morpho.org/ethereum/vault/0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
  },
  {
    id: 'flyingtulip-ssftusd',
    symbol: 'ssftUSD',
    iconSrc: ssftUsdIcon,
    token: 'Flying Tulip Stable Staked ftUSD ssftUSD',
    address: '0x232128844e5aF56fD4B3f8BF97e08aB477282Ab5',
    url: 'https://flyingtulip.com/ftusd/',
  },
  {
    id: 'lido-wsteth',
    symbol: 'wstETH',
    iconSrc: wstEthIcon,
    token: 'Lido Wrapped Staked ETH wstETH',
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    url: 'https://stake.lido.fi/wrap',
  },
  {
    id: 'rocketpool-reth',
    symbol: 'rETH',
    iconSrc: rEthIcon,
    token: 'Rocket Pool ETH rETH',
    address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    url: 'https://stake.rocketpool.net/',
  },
  {
    id: 'test-msloss',
    symbol: 'msLOSS',
    iconSrc: msLossLogo,
    token: 'Sepolia Test Loss msLOSS',
    address: '0xD5B2a08F474f77eF29211Ccc59cd65e5fA6734dc',
  },
  // Sepolia-only second loss vault (local dev server only, like the mainnet test token).
  ...(import.meta.env.DEV ? [{
    id: 'test-msloss2',
    symbol: 'msLOSS2',
    iconSrc: msLossLogo,
    token: 'Sepolia Test Loss msLOSS2',
    address: '0x18664D1a4E2DcC2F760EC648719C1B709D107d1C',
  }] : []),
  // Mainnet E2E test token: local dev server only (never in a production build).
  // `import.meta.env.DEV` is inlined so production builds drop this row entirely.
  ...(import.meta.env.DEV && LOCAL_E2E_TEST_TOKEN ? [{
    id: 'test-test',
    symbol: 'TEST',
    iconSrc: msLossLogo,
    token: 'Test Token TEST',
    address: '0x116e4336047C97703F84619dE03b6Bf893667DE1',
  }] : []),
];

const ZERO_ROOT = `0x${'00'.repeat(32)}`;

const FILE_CLAIM = 'fileClaim';

function timedLabel(phase, deadline, nowMilliseconds) {
  const label = t(`coveredProtocols.actions.${phase}`);
  const { daysLeft, hoursLeft, minutesLeft } = remainingTimeParts(deadline, nowMilliseconds);
  if (daysLeft === 0 && hoursLeft === 0) return t('coveredProtocols.actions.minutesLeft', { label, minutes: minutesLeft });
  return t('coveredProtocols.actions.daysHoursLeft', { label, days: daysLeft, hours: hoursLeft });
}

/// Returns { phase, label }: `phase` is the language-independent state
/// (FILE_CLAIM selects the plain button style), `label` the translated text.
function incidentAction(incident, nowMilliseconds) {
  const plain = (phase) => ({ phase, label: t(`coveredProtocols.actions.${phase}`) });
  const timed = (phase, deadline) => ({ phase, label: timedLabel(phase, deadline, nowMilliseconds) });
  const deadline = Number(incident.phaseDeadlineMilliseconds);
  const phaseWindow = Number(incident.phaseWindowMilliseconds);
  if (!Number.isFinite(deadline) || !Number.isFinite(phaseWindow)) return plain(FILE_CLAIM);

  if (String(incident.root).toLowerCase() === ZERO_ROOT) {
    if (nowMilliseconds <= deadline) return timed('claimOpen', deadline);
    if (nowMilliseconds <= deadline + phaseWindow) {
      return timed('settleClaims', deadline + phaseWindow);
    }
    return plain('finalisePayout');
  }
  if (nowMilliseconds <= deadline) return timed('settleAndDispute', deadline);
  if (nowMilliseconds <= deadline + phaseWindow) {
    return timed('finalisePayout', deadline + phaseWindow);
  }
  return plain('finalisePayout');
}

function coverageShare(value) {
  try { return Number(BigInt(value)) / 10_000; } catch { return NaN; }
}

function formatCoverageBps(value) {
  try {
    const basisPoints = BigInt(value);
    if (basisPoints < 0n || basisPoints > 10_000n) return UNKNOWN_VALUE;
    const whole = basisPoints / 100n;
    const fraction = String(basisPoints % 100n).padStart(2, '0').replace(/0+$/, '');
    return `${whole}${fraction ? `.${fraction}` : ''}%`;
  } catch {
    return UNKNOWN_VALUE;
  }
}

/// Highest max coverage first; equal coverage keeps the listing order, and rows
/// without a readable coverage go last.
export function sortByMaxCoverage(rows, insuredTokenStates = {}) {
  const coverage = (row) => {
    const state = insuredTokenStates[row.id];
    const share = state?.enabled ? coverageShare(state.maxCoverageBps) : NaN;
    return Number.isFinite(share) && share >= 0 && share <= 1 ? share : -1;
  };
  return rows
    .map((row, index) => ({ row, index, coverage: coverage(row) }))
    .sort((left, right) => right.coverage - left.coverage || left.index - right.index)
    .map(({ row }) => row);
}

export default function CoveredProtocolsTable({
  onFileClaim,
  fileClaimUnavailableReason = '',
  incident = null,
  insuredTokenStates = {},
  nowMilliseconds = Date.now(),
  onSimulate,
}) {
  const { t } = useTranslation();
  const displayedRows = sortByMaxCoverage(COVERED_PROTOCOL_ROWS.filter((row) => (
    insuredTokenStates[row.id]?.enabled || row.id === incident?.tokenId
  )), insuredTokenStates);

  return (
    <Fragment>
      <div className="landing-table-shell">
        <table
          className="cover-table covered-protocols-table covered-protocols-table--claims"
          aria-label={t('coveredProtocols.tableLabel')}
        >
      <thead>
        <tr>
          <th scope="col">
            <span className="table-heading-with-help">
              {t('coveredProtocols.columns.insuredToken')}
              <InfoTooltip ariaLabel={t('coveredProtocols.columns.insuredTokenHelpLabel')} className="dashboard-help--table">
                {t('coveredProtocols.columns.insuredTokenHelp')}
              </InfoTooltip>
            </span>
          </th>
          <th scope="col">
            <span className="table-heading-with-help">
              {t('coveredProtocols.columns.maxCoverage')}
              <InfoTooltip ariaLabel={t('coveredProtocols.columns.maxCoverageHelpLabel')} className="dashboard-help--table">
                {t('coveredProtocols.columns.maxCoverageHelp')}
              </InfoTooltip>
            </span>
          </th>
          <th scope="col" className="table-action-cell covered-protocols-action-cell">{t('coveredProtocols.columns.claim')}</th>
        </tr>
      </thead>
      <tbody>
        {displayedRows.map((row) => {
          const insuranceState = insuredTokenStates?.[row.id];
          const reimbursement = insuranceState?.enabled
            ? formatCoverageBps(insuranceState.maxCoverageBps)
            : UNKNOWN_VALUE;
          const { phase: actionPhase, label: actionLabel } = row.id === incident?.tokenId
            ? incidentAction(incident, nowMilliseconds)
            : { phase: FILE_CLAIM, label: t('coveredProtocols.actions.fileClaim') };
          const actionAriaLabel = actionPhase === FILE_CLAIM
            ? t('coveredProtocols.actions.fileClaimFor', { token: row.id })
            : t('coveredProtocols.actions.actionFor', { action: actionLabel, token: row.id });
          return (
          <tr key={row.id}>
            <td>
              <TableTokenCell iconSrc={row.iconSrc}>
                {row.url ? (
                  <a href={row.url} target="_blank" rel="noreferrer" aria-label={t('coveredProtocols.openTokenSite', { token: row.token })}>{row.token}</a>
                ) : row.token}
              </TableTokenCell>
            </td>
            <td>
              <span className="percent-with-ring">
                {reimbursement}
                {insuranceState?.enabled ? <PercentRing share={coverageShare(insuranceState.maxCoverageBps)} /> : null}
              </span>
            </td>
            <td className="table-action-cell covered-protocols-action-cell">
              <AvailabilityAction
                unavailableReason={fileClaimUnavailableReason}
                className={`dashboard-action-button dashboard-table-action-button${actionPhase === FILE_CLAIM ? '' : ' dashboard-table-action-button--claim-status'}`}
                type="button"
                onClick={() => onFileClaim?.(row)}
                aria-label={actionAriaLabel}
              >
                {actionLabel}
              </AvailabilityAction>
            </td>
          </tr>
          );
        })}
      </tbody>
        </table>
      </div>
      {onSimulate ? (
        <div className="covered-protocols-footer">
          <button className="covered-protocols-simulate-link" type="button" onClick={onSimulate}>
            {t('coveredProtocols.simulateClaim')}
          </button>
        </div>
      ) : null}
    </Fragment>
  );
}
