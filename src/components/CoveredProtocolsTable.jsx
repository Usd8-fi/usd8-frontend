import aaveLogo from '../assets/aavelogo.svg';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
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
    reimbursement: '80%',
  },
  {
    id: 'susd8',
    symbol: 'sUSD8',
    iconSrc: sUsd8Logo,
    token: <>USD8 Protected<br />Savings sUSD8</>,
    address: 'TBD',
    reimbursement: '80%',
  },
  {
    id: 'aave-sgho',
    symbol: 'sGHO',
    iconSrc: aaveLogo,
    token: <>Aave Savings Gho<br />sGHO</>,
    address: <>0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d<br />impl 0x50f9d4e28309303f0cdcac8af0b569e8b75ab857</>,
    reimbursement: '80%',
  },
  {
    id: 'curve-scrvusd',
    symbol: 'scrvUSD',
    iconSrc: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/branding/logo.png',
    token: <>Curve Savings<br />scrvUSD</>,
    address: <>0x0655977feb2f289a4ab78af67bab0d17aab84367<br />impl 0xd8063123bba3b480569244ae66bfe72b6c84b00d</>,
    reimbursement: '80%',
  },
  {
    id: 'sky-susds',
    symbol: 'sUSDS',
    iconSrc: 'https://assets.coingecko.com/coins/images/39925/large/sky.jpg',
    token: 'Sky Savings sUSDS',
    address: <>0xa3931d71877c0e7a3148cb7eb4463524fec27fbd<br />impl 0x4e7991e5c547ce825bdeb665ee14a3274f9f61e0</>,
    reimbursement: '80%',
  },
];

export default function CoveredProtocolsTable({ onFileClaim, fileClaimUnavailableReason = '' }) {
  return (
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
                Maximum reimbursement possible: 80% of the insured token&apos;s underlying value. Actual payout depends on the user&apos;s insurance score and cover pool limits.
              </InfoTooltip>
            </span>
          </th>
          <th scope="col" className="table-action-cell covered-protocols-action-cell">File Claim</th>
        </tr>
      </thead>
      <tbody>
        {COVERED_PROTOCOL_ROWS.map((row) => (
          <tr key={row.id}>
            <td><TableTokenCell iconSrc={row.iconSrc}>{row.token}</TableTokenCell></td>
            <td>{row.reimbursement}</td>
            <td className="table-action-cell covered-protocols-action-cell">
              <AvailabilityAction
                className="dashboard-action-button dashboard-table-action-button"
                type="button"
                onClick={() => onFileClaim?.(row)}
                aria-label={`File claim for ${row.id}`}
                unavailableReason={fileClaimUnavailableReason}
              >
                file claim
              </AvailabilityAction>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
