import aUsdcLogo from '../assets/cover-ausdc.svg';
import wbtcLogo from '../assets/cover-wbtc.svg';
import wstEthLogo from '../assets/cover-wsteth.png';
import InfoTooltip from './InfoTooltip.jsx';
import TableTokenCell from './TableTokenCell.jsx';

const COVER_POOL_APY_COPY = 'Cover Pool APY is paid in USD8 based on the value of the token at the time of payout. The final USD8 amount may be slightly more or less depending on token price fluctuation.';
const COVER_POOL_CAPACITY_COPY = 'Cover Pools have limited capacity. Once a pool is full, no further deposits will be allowed until capacity opens again.';
const COVER_POOL_EARNINGS_COPY = 'This is your earnings in USD8 since your last withdrawal.';

export const COVER_POOL_ROWS = [
  {
    id: 'wbtc',
    iconSrc: wbtcLogo,
    token: 'WBTC',
    apy: '25%',
    tvlAmount: '10',
    tvlUsd: '$1,050,000',
    capacityPercent: 10,
    balance: '0',
    earnings: '0',
  },
  {
    id: 'wsteth',
    iconSrc: wstEthLogo,
    token: 'wstETH',
    apy: '20%',
    tvlAmount: '20',
    tvlUsd: '$80,000',
    capacityPercent: 20,
    balance: '0',
    earnings: '0',
  },
  {
    id: 'ausdc',
    iconSrc: aUsdcLogo,
    token: 'Aave aUSDC',
    apy: '30%',
    tvlAmount: '50,000',
    tvlUsd: '$50,000',
    capacityPercent: 50,
    balance: '0',
    earnings: '0',
  },
];

function TvlCell({ amount, usdValue }) {
  return (
    <div className="cover-pool-tvl">
      <span>{amount}</span>
      <span>{usdValue}</span>
    </div>
  );
}

function CapacityCell({ percent }) {
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="cover-pool-capacity" aria-label={`${safePercent}% full`}>
      <span className="cover-pool-capacity-track" aria-hidden="true">
        <span className="cover-pool-capacity-fill" style={{ width: `${safePercent}%` }} />
      </span>
      <span>{safePercent}%</span>
    </div>
  );
}

function CoverPoolActions() {
  return (
    <div className="table-action-buttons">
      <button className="dashboard-action-button dashboard-table-action-button" type="button" disabled>
        Deposit
      </button>
      <button className="dashboard-action-button dashboard-table-action-button" type="button" disabled>
        Withdraw
      </button>
    </div>
  );
}

export default function CoverPoolTable() {
  return (
    <table className="cover-table dashboard-token-table cover-pool-table">
      <tbody>
        <tr className="cover-table-heading-row">
          <td>Token</td>
          <td>
            <span className="dashboard-table-heading-label">
              APY in USD8
              <InfoTooltip ariaLabel="Cover Pool APY info" className="dashboard-help--table">
                {COVER_POOL_APY_COPY}
              </InfoTooltip>
            </span>
          </td>
          <td className="cover-pool-tvl-cell">Amount / TVL</td>
          <td className="cover-pool-capacity-cell">
            <span className="dashboard-table-heading-label">
              Capacity
              <InfoTooltip ariaLabel="Cover Pool capacity info" className="dashboard-help--table">
                {COVER_POOL_CAPACITY_COPY}
              </InfoTooltip>
            </span>
          </td>
          <td className="cover-pool-balance-cell">Your Deposit</td>
          <td className="cover-pool-earnings-cell">
            <span className="dashboard-table-heading-label">
              Your Earnings in USD8
              <InfoTooltip ariaLabel="Cover Pool earnings info" className="dashboard-help--table">
                {COVER_POOL_EARNINGS_COPY}
              </InfoTooltip>
            </span>
          </td>
          <td className="table-action-cell cover-pool-action-cell">Actions</td>
        </tr>

        {COVER_POOL_ROWS.map((row) => (
          <tr key={row.id}>
            <td><TableTokenCell iconSrc={row.iconSrc}>{row.token}</TableTokenCell></td>
            <td>{row.apy}</td>
            <td className="cover-pool-tvl-cell"><TvlCell amount={row.tvlAmount} usdValue={row.tvlUsd} /></td>
            <td className="cover-pool-capacity-cell"><CapacityCell percent={row.capacityPercent} /></td>
            <td className="cover-pool-balance-cell">{row.balance}</td>
            <td className="cover-pool-earnings-cell">{row.earnings}</td>
            <td className="table-action-cell cover-pool-action-cell">
              <CoverPoolActions />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
