import { Fragment, useEffect, useId, useState } from 'react';
import aaveLogo from '../assets/aavelogo.svg';
import msLossLogo from '../assets/msloss-test.svg';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
import { remainingTimeParts } from '../lib/claimLifecycle.js';
import AvailabilityAction from './AvailabilityAction.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import TableTokenCell from './TableTokenCell.jsx';

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
    token: <>USD8 Protected<br />Savings sUSD8</>,
    address: 'TBD',
  },
  {
    id: 'aave-sgho',
    symbol: 'sGHO',
    iconSrc: aaveLogo,
    token: <>Aave Savings Gho<br />sGHO</>,
    address: <>0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d<br />impl 0x50f9d4e28309303f0cdcac8af0b569e8b75ab857</>,
  },
  {
    id: 'curve-scrvusd',
    symbol: 'scrvUSD',
    iconSrc: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/branding/logo.png',
    token: <>Curve Savings<br />scrvUSD</>,
    address: <>0x0655977feb2f289a4ab78af67bab0d17aab84367<br />impl 0xd8063123bba3b480569244ae66bfe72b6c84b00d</>,
  },
  {
    id: 'sky-susds',
    symbol: 'sUSDS',
    iconSrc: 'https://assets.coingecko.com/coins/images/39925/large/sky.jpg',
    token: 'Sky Savings sUSDS',
    address: <>0xa3931d71877c0e7a3148cb7eb4463524fec27fbd<br />impl 0x4e7991e5c547ce825bdeb665ee14a3274f9f61e0</>,
  },
  {
    id: 'test-msloss',
    symbol: 'msLOSS',
    iconSrc: msLossLogo,
    token: <>Sepolia Test Loss<br />msLOSS</>,
    address: '0xD5B2a08F474f77eF29211Ccc59cd65e5fA6734dc',
  },
];

const ZERO_ROOT = `0x${'00'.repeat(32)}`;

function timedLabel(label, deadline, nowMilliseconds) {
  const { daysLeft, hoursLeft } = remainingTimeParts(deadline, nowMilliseconds);
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

function formatCoverageBps(value) {
  try {
    const basisPoints = BigInt(value);
    if (basisPoints < 0n || basisPoints > 10_000n) return '—';
    const whole = basisPoints / 100n;
    const fraction = String(basisPoints % 100n).padStart(2, '0').replace(/0+$/, '');
    return `${whole}${fraction ? `.${fraction}` : ''}%`;
  } catch {
    return '—';
  }
}

export default function CoveredProtocolsTable({
  onFileClaim,
  fileClaimUnavailableReason = '',
  incident = null,
  insuredTokenStates = {},
  nowMilliseconds = Date.now(),
}) {
  const warningId = useId();
  const [warningRowId, setWarningRowId] = useState('');

  useEffect(() => {
    setWarningRowId('');
  }, [fileClaimUnavailableReason]);

  const displayedRows = COVERED_PROTOCOL_ROWS.filter((row) => (
    insuredTokenStates[row.id]?.enabled || row.id === incident?.tokenId
  ));

  return (
    <Fragment>
      {warningRowId ? (
        <p id={warningId} className="covered-protocols-warning" role="alert">
          {fileClaimUnavailableReason}
        </p>
      ) : null}
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
          const reimbursement = insuranceState?.enabled
            ? formatCoverageBps(insuranceState.maxCoverageBps)
            : '—';
          const actionLabel = row.id === incident?.tokenId
            ? incidentActionLabel(incident, nowMilliseconds)
            : 'File Claim';
          const actionAriaLabel = actionLabel === 'File Claim'
            ? `File claim for ${row.id}`
            : `${actionLabel} for ${row.id}`;
          return (
          <tr key={row.id}>
            <td><TableTokenCell iconSrc={row.iconSrc}>{row.token}</TableTokenCell></td>
            <td>{reimbursement}</td>
            <td className="table-action-cell covered-protocols-action-cell">
              <AvailabilityAction
                className={`dashboard-action-button dashboard-table-action-button${actionLabel === 'File Claim' ? '' : ' dashboard-table-action-button--claim-status'}`}
                type="button"
                onClick={() => {
                  if (fileClaimUnavailableReason) {
                    setWarningRowId(row.id);
                    return;
                  }
                  setWarningRowId('');
                  onFileClaim?.(row);
                }}
                aria-label={actionAriaLabel}
                aria-describedby={warningRowId === row.id ? warningId : undefined}
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
    </Fragment>
  );
}
