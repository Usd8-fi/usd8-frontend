import { render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ load: vi.fn(), fetchActivity: vi.fn(), fetchScoreList: vi.fn() }));
vi.mock('../lib/systemDashboard.js', async importOriginal => ({ ...(await importOriginal()), loadSystemDashboard: mocks.load }));
vi.mock('../lib/scoreApi.js', async importOriginal => ({ ...(await importOriginal()), fetchScoreList: mocks.fetchScoreList }));
vi.mock('../lib/activityFeed.js', async importOriginal => ({ ...(await importOriginal()), fetchActivity: mocks.fetchActivity }));
import SystemDashboard from './SystemDashboard.jsx';

const pool = {
  id: 'wsteth', name: 'wstEth Cover Pool', address: '0x4bf47e25e8b42579c5cbaf84edaefb1a0f30c1b8',
  assetSymbol: 'wstETH', shareSymbol: 'USD8-cp-wstETH', price: 4000, assets: 6.29, tvlUsd: 25160.28,
  capacityPercent: 62.9, capacityUncapped: false, apy30: '2.1%', apy7: '3.4%',
  series: { tvl: [{ t: 1, v: 4 }, { t: 2, v: 25160 }], apy7: [{ t: 1, v: 3 }, { t: 2, v: 3.4 }], apy30: [{ t: 1, v: 2 }, { t: 2, v: 2.1 }] },
  escrowedAssets: 0, escrowedPercent: 0, withdrawalReserve: 0, exits: [], exitsUnavailable: false,
};
const snapshot = {
  updatedAt: Date.now(), blockNumber: '11926094', timing: { cooldown: 604800, interval: 259200 },
  insured: { symbol: 'USD8', supply: 54, maxCoverageBps: 8000, exposure: 43.2 }, totalCover: 25160.28, pools: [pool],
  reserve: { reserve: 54, series: [{ t: 1, v: 40 }, { t: 2, v: 54 }], allocation: [
    { key: 'idle', label: 'Idle USDC (Treasury)', address: '0x0eae2d44dfeb2154f60cd702dc2c9c5abb090f05', amount: 13.5, percent: 25 },
    { key: '0xaaaa', label: 'Aave USDC Vault', address: '0x00000000000000000000000000000000000000aa', amount: 40.5, percent: 75 },
  ] },
};
const activity = [{ id: '0xaa:mint', hash: '0xaa', at: 1, block: 11922388, actor: '0x8ca7…83a7', action: 'minted', amount: '20 USD8', target: null }];

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  mocks.fetchScoreList.mockResolvedValue([]);
});
afterEach(() => { vi.restoreAllMocks(); mocks.load.mockReset(); mocks.fetchActivity.mockReset(); mocks.fetchScoreList.mockReset(); });

describe('SystemDashboard', () => {
  it('shows the seven sections in order, with the reserve after insured supply and no exposure ladder', async () => {
    mocks.load.mockResolvedValue(snapshot);
    mocks.fetchActivity.mockResolvedValue(activity);
    render(<SystemDashboard />);
    await screen.findByText('Block 11926094', { exact: false });
    const names = screen.getAllByRole('region').map(region => region.getAttribute('aria-label')).filter(name => (
      ['USD8 Insured Supply', 'USD8 Reserve', 'Event Tape', 'Cover Pools', 'Cover To Exposure', 'Pool Yield', 'Cover Pool Yield', 'Withdrawal Exit Queue', 'Cover Pool Withdrawal Exit Queue', 'Insurance Scores'].includes(name)));
    expect(names).toEqual(['USD8 Insured Supply', 'USD8 Reserve', 'Event Tape', 'Cover Pools', 'Cover Pool Yield', 'Cover Pool Withdrawal Exit Queue', 'Insurance Scores']);
    expect(screen.getAllByRole('region')).toHaveLength(7);
  });

  it('lists stored insurance scores with the time each was last updated', async () => {
    mocks.load.mockResolvedValue(snapshot);
    mocks.fetchActivity.mockResolvedValue(activity);
    mocks.fetchScoreList.mockResolvedValue([
      { account: '0xb446b0c85cc4ef5f5ebf495c4fdd38ecc5284176', total: 6.318, available: 5.84, spent: 0, updatedAtSeconds: 1_792_108_800 },
      { account: '0x1111111111111111111111111111111111111111', total: 1.5, available: 1.5, spent: 0, updatedAtSeconds: null },
    ]);
    render(<SystemDashboard />);
    const panel = await screen.findByRole('region', { name: 'Insurance Scores' });
    expect(await within(panel).findByText('0xb446…4176')).toBeInTheDocument();
    expect(within(panel).getByText('6.32')).toBeInTheDocument();
    expect(within(panel).getByText('5.84')).toBeInTheDocument();
    expect(within(panel).getByText(/10-16 00:00 UTC/)).toBeInTheDocument();
    expect(within(panel).getByText('2 accounts · stored scores, not live')).toBeInTheDocument();
    expect(mocks.fetchScoreList).toHaveBeenCalledOnce();
  });

  it('lists where the reserve sits, by share and amount', async () => {
    mocks.load.mockResolvedValue(snapshot);
    mocks.fetchActivity.mockResolvedValue(activity);
    render(<SystemDashboard />);
    const panel = await screen.findByRole('region', { name: 'USD8 Reserve' });
    expect(await within(panel).findByText('Idle USDC (Treasury)')).toBeInTheDocument();
    expect(within(panel).getByText('Aave USDC Vault')).toBeInTheDocument();
    expect(within(panel).getByText('25%')).toBeInTheDocument();
    expect(within(panel).getByText('75%')).toBeInTheDocument();
    expect(within(panel).getByText('40.50 USDC')).toBeInTheDocument();
  });

  it('presents live values: events, pool APYs with the higher one highlighted, and an empty exit queue', async () => {
    mocks.load.mockResolvedValue(snapshot);
    mocks.fetchActivity.mockResolvedValue(activity);
    render(<SystemDashboard />);
    const tape = await screen.findByRole('region', { name: 'Event Tape' });
    await waitFor(() => expect(within(tape).getByText(/minted/)).toBeInTheDocument());
    expect(within(tape).getByText('Block 11922388')).toBeInTheDocument();
    const card = screen.getByRole('article', { name: 'wstEth Cover Pool' });
    expect(within(card).getByText('3.4%').closest('div')).toHaveClass('sd-best');
    expect(within(card).getByText('2.1%').closest('div')).not.toHaveClass('sd-best');
    expect(within(screen.getByRole('region', { name: 'Cover Pool Withdrawal Exit Queue' })).getByText('No Pending Exits')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('lists pending exit batches with their state', async () => {
    const now = Math.floor(Date.now() / 1000);
    mocks.load.mockResolvedValue({ ...snapshot, pools: [{ ...pool, exits: [
      { epoch: now + 5 * 86_400, shares: 8, requests: 2, state: 'queued', progress: 0.5, settledAssets: null },
      { epoch: now - 86_400, shares: 4, requests: 1, state: 'settled', progress: 1, settledAssets: 4 },
    ] }] });
    mocks.fetchActivity.mockResolvedValue([]);
    render(<SystemDashboard />);
    const queue = await screen.findByRole('region', { name: 'Cover Pool Withdrawal Exit Queue' });
    await waitFor(() => expect(within(queue).getByText('Cooldown')).toBeInTheDocument());
    expect(within(queue).getByText('Settled')).toBeInTheDocument();
    expect(within(queue).getByText('4 Shares · 1 Request')).toBeInTheDocument();
  });

  it('shows an error with retry and never invents numbers', async () => {
    mocks.load.mockRejectedValue(new Error('RPC unavailable'));
    mocks.fetchActivity.mockRejectedValue(new Error('down'));
    render(<SystemDashboard />);
    expect(await screen.findByRole('alert')).toHaveTextContent('RPC unavailable');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByText(/\$\d/)).toBeNull();
  });
});
