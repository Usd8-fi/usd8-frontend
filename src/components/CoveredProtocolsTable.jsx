import { UNKNOWN_VALUE } from '../lib/units.js';
import { Fragment } from 'react';
import aaveLogo from '../assets/aavelogo.svg';
import etherscanLogo from '../assets/etherscan-logo-light-circle.svg';
// Raster icons stay separate cached files; base64-inlining them would add
// ~6.5 KB gzip of incompressible data to the public page's first-load JS.
import curveLogo from '../assets/curve-scrvusd.webp?no-inline';
import msLossLogo from '../assets/msloss-test.svg';
import skyLogo from '../assets/sky-susds.webp?no-inline';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
import { remainingTimeParts } from '../lib/claimLifecycle.js';
import { getProtocolNetwork, LOCAL_E2E_TEST_TOKEN, PROTOCOL_CHAIN_ID } from '../lib/networkConfig.js';
import AvailabilityAction from './AvailabilityAction.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import PercentRing from './PercentRing.jsx';
import TableTokenCell from './TableTokenCell.jsx';

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
    iconSrc: aaveLogo,
    token: 'Aave Savings GHO sGHO',
    address: '0xE1753F2e00940cC31213dd92013cF019DFE4ca1d',
  },
  {
    id: 'curve-scrvusd',
    symbol: 'scrvUSD',
    iconSrc: curveLogo,
    token: 'Curve Savings scrvUSD',
    address: <>0x0655977feb2f289a4ab78af67bab0d17aab84367<br />impl 0xd8063123bba3b480569244ae66bfe72b6c84b00d</>,
  },
  {
    id: 'sky-susds',
    symbol: 'sUSDS',
    iconSrc: skyLogo,
    token: 'Sky Savings sUSDS',
    address: '0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD',
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

/// Explorer page for an insured token on the protocol network, from the
/// network's own token address list (never the display rows above).
export function insuredTokenExplorerUrl(tokenId, network = getProtocolNetwork(PROTOCOL_CHAIN_ID)) {
  const address = network.contracts?.insuredTokens?.[tokenId];
  const explorer = network.chain?.blockExplorers?.default?.url;
  return address && explorer ? `${explorer}/token/${address}` : null;
}

const ZERO_ROOT = `0x${'00'.repeat(32)}`;

function timedLabel(label, deadline, nowMilliseconds) {
  const { daysLeft, hoursLeft, minutesLeft } = remainingTimeParts(deadline, nowMilliseconds);
  if (daysLeft === 0 && hoursLeft === 0) return `${label} (${minutesLeft}m left)`;
  return `${label} (${daysLeft}d ${hoursLeft}h left)`;
}

function incidentActionLabel(incident, nowMilliseconds) {
  const deadline = Number(incident.phaseDeadlineMilliseconds);
  const phaseWindow = Number(incident.phaseWindowMilliseconds);
  if (!Number.isFinite(deadline) || !Number.isFinite(phaseWindow)) return 'File Claim';

  if (String(incident.root).toLowerCase() === ZERO_ROOT) {
    if (nowMilliseconds <= deadline) return timedLabel('Claim Open', deadline, nowMilliseconds);
    if (nowMilliseconds <= deadline + phaseWindow) {
      return timedLabel('Settle Claims', deadline + phaseWindow, nowMilliseconds);
    }
    return 'Finalise Payout';
  }
  if (nowMilliseconds <= deadline) return timedLabel('Settle & Dispute', deadline, nowMilliseconds);
  if (nowMilliseconds <= deadline + phaseWindow) {
    return timedLabel('Finalise Payout', deadline + phaseWindow, nowMilliseconds);
  }
  return 'Finalise Payout';
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

export default function CoveredProtocolsTable({
  onFileClaim,
  fileClaimUnavailableReason = '',
  incident = null,
  insuredTokenStates = {},
  nowMilliseconds = Date.now(),
  onSimulate,
}) {
  const displayedRows = COVERED_PROTOCOL_ROWS.filter((row) => (
    insuredTokenStates[row.id]?.enabled || row.id === incident?.tokenId
  ));

  return (
    <Fragment>
      <div className="landing-table-shell">
        <table
          className="cover-table covered-protocols-table covered-protocols-table--claims"
          aria-label="Insured tokens"
        >
      <thead>
        <tr>
          <th scope="col">
            <span className="table-heading-with-help">
              Insured Token
              <InfoTooltip ariaLabel="About insured token" className="dashboard-help--table">
                An asset eligible for a claim after a covered loss incident, subject to insurance score and claim rules.
              </InfoTooltip>
            </span>
          </th>
          <th scope="col">
            <span className="table-heading-with-help">
              Max Coverage
              <InfoTooltip ariaLabel="About max coverage" className="dashboard-help--table">
                Current onchain maximum reimbursement for each listed token. Actual payout depends on the user&apos;s insurance score and cover pool limits.
              </InfoTooltip>
            </span>
          </th>
          <th scope="col" className="table-action-cell covered-protocols-action-cell">Claim</th>
        </tr>
      </thead>
      <tbody>
        {displayedRows.map((row) => {
          const insuranceState = insuredTokenStates?.[row.id];
          const explorerUrl = insuredTokenExplorerUrl(row.id);
          const reimbursement = insuranceState?.enabled
            ? formatCoverageBps(insuranceState.maxCoverageBps)
            : UNKNOWN_VALUE;
          const actionLabel = row.id === incident?.tokenId
            ? incidentActionLabel(incident, nowMilliseconds)
            : 'File Claim';
          const actionAriaLabel = actionLabel === 'File Claim'
            ? `File claim for ${row.id}`
            : `${actionLabel} for ${row.id}`;
          return (
          <tr key={row.id}>
            <td>
              <span className="table-token-with-links">
                <TableTokenCell iconSrc={row.iconSrc}>{row.token}</TableTokenCell>
                {explorerUrl ? (
                  <a
                    className="table-explorer-link"
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${row.symbol} on Etherscan`}
                    title="View on Etherscan"
                  >
                    <img src={etherscanLogo} alt="" />
                  </a>
                ) : null}
              </span>
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
                className={`dashboard-action-button dashboard-table-action-button${actionLabel === 'File Claim' ? '' : ' dashboard-table-action-button--claim-status'}`}
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
            Simulate Claim
          </button>
        </div>
      ) : null}
    </Fragment>
  );
}
