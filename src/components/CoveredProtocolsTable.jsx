import aaveLogo from '../assets/aavelogo.svg';
import lidoLogo from '../assets/lidoLogo.svg';
import oethLogo from '../assets/oethLogo.svg';
import sUsd8Logo from '../assets/sUSD8.svg';
import usd8Logo from '../assets/usd8Logo.svg';
import InfoTooltip from './InfoTooltip.jsx';
import TableTokenCell from './TableTokenCell.jsx';

const REIMBURSEMENT_COPY = 'This is the maximum claim coverage you can get from one insured token.';

const COVERED_PROTOCOL_ROWS = [
  {
    id: 'usd8',
    iconSrc: usd8Logo,
    token: 'USD8',
    address: 'TBD',
    reimbursement: '0.8 USDC',
  },
  {
    id: 'susd8',
    iconSrc: sUsd8Logo,
    token: <>USD8 Protected<br />Savings sUSD8</>,
    address: 'TBD',
    reimbursement: '0.8 USD8',
  },
  {
    id: 'aave-sgho',
    iconSrc: aaveLogo,
    token: <>Aave Savings Gho<br />sGHO</>,
    address: <>0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d<br />impl 0x50f9d4e28309303f0cdcac8af0b569e8b75ab857</>,
    reimbursement: '0.8 GHO',
  },
  {
    id: 'curve-scrvusd',
    iconSrc: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/branding/logo.png',
    token: <>Curve Savings<br />scrvUSD</>,
    address: <>0x0655977feb2f289a4ab78af67bab0d17aab84367<br />impl 0xd8063123bba3b480569244ae66bfe72b6c84b00d</>,
    reimbursement: '0.7 crvUSD',
  },
  {
    id: 'lido-steth',
    iconSrc: lidoLogo,
    token: 'Lido stETH',
    address: <>0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84<br />impl 0x17144556fd3424edc8fc8a4c940b2d04936d17eb</>,
    reimbursement: '0.7 Eth',
  },
  {
    id: 'sky-susds',
    iconSrc: 'https://assets.coingecko.com/coins/images/39925/large/sky.jpg',
    token: 'Sky Savings sUSDS',
    address: <>0xa3931d71877c0e7a3148cb7eb4463524fec27fbd<br />impl 0x4e7991e5c547ce825bdeb665ee14a3274f9f61e0</>,
    reimbursement: '0.7 USDS',
  },
  {
    id: 'yieldnest-ynethx',
    iconSrc: 'https://docs.yieldnest.finance/~gitbook/image?url=https%3A%2F%2F2873068466-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FDyxbBTdzhJqQAdVgDB8k%252Fuploads%252FzN9OBqA2oJbHWzVrvxDD%252FLogomark%2520Gold%2520on%2520Dark.png%3Falt%3Dmedia%26token%3Dc4a4a84c-ca82-4cd2-8794-cf298a392d80&width=768&dpr=2&quality=100&sign=139c44cd&sv=2',
    token: 'Yieldnest ynETHx',
    address: <>0x657d9ABA1DBb59e53f9F3eCAA878447dCfC96dCb<br />impl 0x9C1713BC42dCF621038F4016664fFAB096A05410</>,
    reimbursement: '0.6 Eth',
  },
  {
    id: 'origin-oeth',
    iconSrc: oethLogo,
    token: 'Origin OETH',
    address: <>0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3<br />impl 0xD86756dBb01e75A11AaDaCB75c8495759ED92033</>,
    reimbursement: '0.6 Eth',
  },
];

export default function CoveredProtocolsTable() {
  return (
    <table className="cover-table covered-protocols-table covered-protocols-table--claims">
      <tbody>
        <tr className="cover-table-heading-row">
          <td>Insured Token</td>
          <td>Address</td>
          <td>
            <span className="dashboard-table-heading-label">
              Reimbursement
              <InfoTooltip ariaLabel="Reimbursement info" className="dashboard-help--table">
                {REIMBURSEMENT_COPY}
              </InfoTooltip>
            </span>
          </td>
          <td className="table-action-cell covered-protocols-action-cell">Actions</td>
        </tr>

        {COVERED_PROTOCOL_ROWS.map((row) => (
          <tr key={row.id}>
            <td><TableTokenCell iconSrc={row.iconSrc}>{row.token}</TableTokenCell></td>
            <td>{row.address}</td>
            <td>{row.reimbursement}</td>
            <td className="table-action-cell covered-protocols-action-cell">
              <button className="dashboard-action-button dashboard-table-action-button" type="button" disabled>
                Claim
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
