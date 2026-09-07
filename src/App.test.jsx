import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContractFunctionRevertedError, createPublicClient, custom, encodeErrorResult } from 'viem';
import App, { matchesSettlementTopology, settlementPayoutDetails } from './App.jsx';
import { claimWriteAbi } from './lib/writeAbis.js';

const mocks = vi.hoisted(() => ({
  account: { address: '', isConnected: false },
  chainId: 11155111,
  fetchInsuranceScore: vi.fn(),
  fetchLandingChainData: vi.fn(),
  fetchMorphoVault: vi.fn(),
  prepareIncidentOpen: vi.fn(),
  prepareSettlement: vi.fn(),
  getBlockNumber: vi.fn(),
  estimateContractGas: vi.fn(),
  readContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  writeContractAsync: vi.fn(),
}));

vi.mock('@reown/appkit/react', () => ({
  useAppKit: () => ({ open: vi.fn() }),
}));

vi.mock('wagmi', () => ({
  useAccount: () => mocks.account,
  useChainId: () => mocks.chainId,
  useDisconnect: () => ({ disconnectAsync: vi.fn() }),
  useSwitchChain: () => ({ switchChainAsync: vi.fn() }),
  useWriteContract: () => ({ writeContractAsync: mocks.writeContractAsync }),
}));

vi.mock('./lib/chainData.js', () => ({
  erc20Abi: [],
  fetchLandingChainData: mocks.fetchLandingChainData,
  fetchLandingAnalytics: async () => ({ pools: [] }),
  fetchScoreHistory: async () => null,
  publicClientFor: () => ({
    getBlockNumber: mocks.getBlockNumber,
    estimateContractGas: mocks.estimateContractGas,
    readContract: mocks.readContract,
    waitForTransactionReceipt: mocks.waitForTransactionReceipt,
  }),
  SEPOLIA_CONTRACTS: {
    usdc: '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c',
    usd8: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
    treasury: '0x2a722ed12982623dff64dc0adba40e734a5f59c3',
  },
}));

vi.mock('./lib/scoreApi.js', () => ({ fetchInsuranceScore: mocks.fetchInsuranceScore }));
vi.mock('./lib/claimApi.js', () => ({
  claimApiConfigured: true,
  matchesSettlementContext: (settlement, incidentId, root) => settlement?.incidentId === String(incidentId)
    && settlement?.root?.toLowerCase() === root?.toLowerCase(),
  prepareIncidentOpen: mocks.prepareIncidentOpen,
  prepareSettlement: mocks.prepareSettlement,
}));
vi.mock('./lib/walletConnector.js', () => ({ walletConnectorConfigured: false }));
vi.mock('./lib/morphoApi.js', () => ({
  fetchMorphoVault: mocks.fetchMorphoVault,
  MORPHO_VAULT_URL: 'https://app.morpho.org/ethereum/vault/0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
}));

function availabilityTooltip(button) {
  return document.getElementById(button.getAttribute('aria-describedby'));
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((next, fail) => {
    resolve = next;
    reject = fail;
  });
  return { promise, reject, resolve };
}

const LISTED_INSURANCE_TOKENS = {
  usd8: { enabled: true, maxCoverageBps: '8000' },
  susd8: { enabled: true, maxCoverageBps: '8000' },
  'aave-sgho': { enabled: true, maxCoverageBps: '8000' },
  'sky-susds': { enabled: true, maxCoverageBps: '8000' },
  'test-msloss': { enabled: true, maxCoverageBps: '8000' },
};

afterEach(() => vi.useRealTimers());

describe('settlementPayoutDetails', () => {
  it('formats each payout with the artifact asset order and configured decimals', () => {
    const usdc = '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c';
    const wstEth = '0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa';

    expect(settlementPayoutDetails(
      [1_234_567n, 100_000_000_000_000_000n],
      [usdc, wstEth],
      {
        [usdc]: { symbol: 'USDC', decimals: 6 },
        [wstEth]: { symbol: 'wstETH', decimals: 18 },
      },
    )).toEqual([
      { amount: '1.2346', symbol: 'USDC', usd: '' },
      { amount: '0.1', symbol: 'wstETH', usd: '' },
    ]);
  });

  it('preserves large payout precision while rounding the displayed fraction', () => {
    const usdc = '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c';

    expect(settlementPayoutDetails(
      [9_007_199_254_740_993_123_456_789n],
      [usdc],
      { [usdc]: { symbol: 'USDC', decimals: 6 } },
    )).toEqual([
      { amount: '9007199254740993123.4568', symbol: 'USDC', usd: '' },
    ]);
  });

  it('shows explicit base units and the asset address when metadata is unavailable', () => {
    const unknownAsset = '0x0000000000000000000000000000000000000002';

    expect(settlementPayoutDetails([1_234_567n], [unknownAsset])).toEqual([
      { amount: '1234567', symbol: `base units of ${unknownAsset}`, usd: '' },
    ]);
  });
});

describe('matchesSettlementTopology', () => {
  const pool = '0x00000000000000000000000000000000000000a1';
  const asset = '0x00000000000000000000000000000000000000b1';

  it('accepts the exact ordered pool and asset snapshot case-insensitively', () => {
    expect(matchesSettlementTopology(
      { poolAddrs: [pool.toUpperCase()], poolOrder: [asset.toUpperCase()] },
      { poolAddrs: [pool], poolOrder: [asset] },
    )).toBe(true);
  });

  it('rejects a reordered or stale pool topology', () => {
    expect(matchesSettlementTopology(
      { poolAddrs: [pool], poolOrder: [asset] },
      { poolAddrs: [pool, `${pool.slice(0, -1)}2`], poolOrder: [asset, `${asset.slice(0, -1)}2`] },
    )).toBe(false);
  });

  it('fails closed when either topology is absent', () => {
    expect(matchesSettlementTopology({}, {})).toBe(false);
    expect(matchesSettlementTopology(
      { poolAddrs: [pool], poolOrder: [asset] },
      {},
    )).toBe(false);
  });
});

// Each pool renders its own card, so pool-scoped queries must name the card.
const poolCard = (name = 'wstEth Cover Pool') => within(screen.getByRole('region', { name }));

const coverPoolFixture = (overrides = {}) => ({
  id: 'wsteth',
  name: 'wstEth Cover Pool',
  address: '0x55cb69271da9937d0cb3c548409fd3f77586df79',
  asset: '0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa',
  assetSymbol: 'wstETH',
  shareSymbol: 'USD8-cp-wstETH',
  assetBalance: '0',
  apy: '—',
  tvl: '—',
  capacityPercent: 0,
  capacityUncapped: false,
  remainingDepositCapacity: '',
  assets: '0',
  deposit: '0',
  availableForCooldown: '0',
  availableForWithdraw: '0',
  inCooldown: '0',
  cooldownEndsAtMilliseconds: 0,
  earnings: '0',
  earningsExact: '0',
  earningsPerSecond: '0',
  earningsSnapshotTimestampMilliseconds: 0,
  earningsPeriodFinishMilliseconds: 0,
  hasEarnings: false,
  shareDecimals: 21,
  // Default fixtures model a 1:1 asset/share rate; loss scenarios override these values.
  availableForCooldownAssets: overrides.availableForCooldown ?? '0',
  availableForWithdrawAssets: overrides.availableForWithdraw ?? '0',
  inCooldownAssets: overrides.inCooldown ?? '0',
  exitSettled: false,
  withdrawalQuote: { totalAssets: '100000000000000000000', totalSupply: '100000000000000000000000' },
  ...overrides,
});

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mocks.account.address = '';
    mocks.account.isConnected = false;
    mocks.chainId = 11155111;
    mocks.fetchInsuranceScore.mockReset();
    mocks.fetchInsuranceScore.mockResolvedValue({});
    mocks.fetchLandingChainData.mockReset();
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '10', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '0', availableForCooldown: '0' })],
      activeIncidentId: '0',
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.fetchMorphoVault.mockReset();
    mocks.fetchMorphoVault.mockResolvedValue({
      address: '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
      name: 'Steakhouse USDC',
      balance: '$76.94M',
      apy: '3.24%',
    });
    mocks.prepareIncidentOpen.mockReset();
    mocks.prepareIncidentOpen.mockResolvedValue({
      referenceBlock: 12_345_678n,
      signature: `0x${'11'.repeat(65)}`,
    });
    mocks.prepareSettlement.mockReset();
    mocks.getBlockNumber.mockReset();
    mocks.getBlockNumber.mockResolvedValue(123n);
    mocks.estimateContractGas.mockReset();
    mocks.estimateContractGas.mockResolvedValue(100_000n);
    mocks.readContract.mockReset();
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') return Promise.resolve(true);
      throw new Error(`Unexpected read: ${functionName}`);
    });
    mocks.waitForTransactionReceipt.mockReset();
    mocks.waitForTransactionReceipt.mockResolvedValue({ status: 'success', blockNumber: 99n });
    mocks.writeContractAsync.mockReset();
  });

  it('blocks claim filing while active-incident details are only partially loaded', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '100' });
    const finalSnapshot = deferred();
    const partial = {
      balances: { usdc: '10', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0', boosters: '0', insuredTokens: { 'test-msloss': '10' } },
      pools: [coverPoolFixture()],
      activeIncidentId: '1',
      incident: null,
      claim: null,
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10', minHoldingRequiredBlocks: '300' },
      resourceErrors: {},
    };
    mocks.fetchLandingChainData.mockImplementation((account, chainId, { onPartial }) => {
      setTimeout(() => onPartial(partial), 0);
      return finalSnapshot.promise;
    });
    render(<App />);

    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    await waitFor(() => expect(within(usd8Card).getByText('Your Balance').nextElementSibling).toHaveTextContent('25'));
    const action = screen.getByRole('button', { name: 'File claim for test-msloss' });
    fireEvent.click(action);
    const dialog = await screen.findByRole('dialog', { name: 'File claim for msLOSS' });
    const submit = within(dialog).getByRole('button', { name: 'File Claim' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Incident details are still loading. Refresh before filing a claim.');
    expect(availabilityTooltip(submit)).toHaveTextContent('Incident details are still loading. Refresh before filing a claim.');
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();

    await act(async () => finalSnapshot.resolve(partial));
  });

  it('blocks filing when a partial refresh retains a different historical incident', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '100' });
    const historicalIncident = {
      id: '1',
      tokenId: 'usd8',
      phaseDeadlineMilliseconds: Date.now() - 60_000,
      phaseWindowMilliseconds: 60_000,
      root: `0x${'11'.repeat(32)}`,
    };
    const initial = {
      balances: { usdc: '10', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0', boosters: '0', insuredTokens: { 'test-msloss': '10' } },
      pools: [coverPoolFixture()],
      activeIncidentId: '0',
      incident: historicalIncident,
      claim: null,
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10', minHoldingRequiredBlocks: '300' },
      resourceErrors: {},
    };
    const refresh = deferred();
    const partial = {
      ...initial,
      activeIncidentId: '2',
      incident: null,
      incidentReady: false,
    };
    mocks.fetchLandingChainData
      .mockResolvedValueOnce(initial)
      .mockImplementationOnce((account, chainId, { onPartial }) => {
        onPartial(partial);
        return refresh.promise;
      });
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'File claim for test-msloss' }));
    const dialog = await screen.findByRole('dialog', { name: 'File claim for msLOSS' });
    const submit = within(dialog).getByRole('button', { name: 'File Claim' });
    window.dispatchEvent(new Event('focus'));
    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(2));

    fireEvent.click(submit);
    await waitFor(() => expect(availabilityTooltip(submit)).toHaveTextContent(
      'Incident details are still loading. Refresh before filing a claim.',
    ));
    expect(mocks.readContract).not.toHaveBeenCalled();
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();

    await act(async () => refresh.resolve(partial));
  });

  it('stops before approvals when the active incident changed since the loaded snapshot', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '100' });
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0', boosters: '0', insuredTokens: { 'test-msloss': '10' } },
      pools: [coverPoolFixture()],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        minHoldingRequiredBlocks: '300',
        phaseDeadlineMilliseconds: Date.now() + 60_000,
        phaseWindowMilliseconds: 60_000,
        root: `0x${'00'.repeat(32)}`,
      },
      claim: null,
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10', minHoldingRequiredBlocks: '300' },
      resourceErrors: {},
    });
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') return Promise.resolve(true);
      if (functionName === 'activeIncidentId') return Promise.resolve(2n);
      throw new Error(`Unexpected read: ${functionName}`);
    });
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Claim Open .* for test-msloss/ }));
    const dialog = await screen.findByRole('dialog', { name: 'File claim for msLOSS' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'File Claim' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'The active incident changed. Refresh its details before filing a claim.',
    );
    expect(mocks.readContract).not.toHaveBeenCalledWith(expect.objectContaining({ functionName: 'claimBondAmount' }));
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('loads the configured Morpho placeholder APY without replacing the disconnected wallet savings balance', async () => {
    render(<App />);

    const savingsCard = screen.getByRole('heading', { name: 'sUSD8 Savings USD8 (Morpho)' }).closest('article');
    expect(within(savingsCard).getByText('Your Deposit (USD8)').nextElementSibling).toHaveTextContent('0');
    expect(within(savingsCard).queryByText('$76.94M')).not.toBeInTheDocument();
    await waitFor(() => expect(within(savingsCard).getByText('3.24%')).toBeInTheDocument());
    expect(mocks.fetchMorphoVault).toHaveBeenCalledTimes(1);
  });

  it('shows zero wallet-specific values while disconnected', () => {
    render(<App />);

    expect(screen.getByText('Total Insurance Score').parentElement).toHaveTextContent('0.0');
    expect(screen.getByText('Available Score').nextElementSibling).toHaveTextContent('0.0');

    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    expect(within(usd8Card).getByText('Your Balance').nextElementSibling).toHaveTextContent('0');
    expect(within(usd8Card).getByText('Score earned').nextElementSibling).toHaveTextContent('0.0');

    const savingsCard = screen.getByRole('heading', { name: 'sUSD8 Savings USD8 (Morpho)' }).closest('article');
    expect(within(savingsCard).getByText('Score earned').nextElementSibling).toHaveTextContent('0.0');
    expect(mocks.fetchInsuranceScore).not.toHaveBeenCalled();
  });

  it('spins for unknown pool values rather than inventing them, then shows the real ones', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));

    // Nothing is known yet, so APR/TVL/capacity must not display a number.
    expect(screen.getAllByRole('region').filter((card) => card.className.includes('cover-pool-card')))
      .toHaveLength(1);
    expect(poolCard().getAllByRole('status', { name: 'Loading pool data' })).toHaveLength(2);
    expect(poolCard().getByRole('status', { name: 'Loading pool capacity' })).toBeInTheDocument();
    expect(screen.queryByText('34%')).toBeNull();
    expect(screen.queryByText('$122.2K')).toBeNull();
    expect(screen.queryByLabelText('50% capacity filled')).toBeNull();
    expect(poolCard().getByText('0 wstETH')).toBeInTheDocument();
    expect(poolCard().getByText('0 USD8')).toBeInTheDocument();

    // The snapshot replaces every spinner with the value it actually read.
    await waitFor(() => expect(screen.queryByRole('status', { name: 'Loading pool data' })).toBeNull());
    expect(poolCard().getByLabelText('0% capacity filled')).toBeInTheDocument();
  });

  it('shows the shared wallet toast for a disconnected pool action', () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null);
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    const deposit = poolCard().getByRole('button', { name: 'deposit' });

    expect(deposit).toBeEnabled();
    fireEvent.click(deposit);
    expect(availabilityTooltip(deposit)).toHaveTextContent('Connect your wallet to continue.');
    expect(prompt).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('shows the shared wallet toast for disconnected minting without opening a dialog', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);

    const mint = screen.getByRole('button', { name: 'mint' });

    expect(mint).toBeEnabled();
    fireEvent.click(mint);
    expect(availabilityTooltip(mint)).toHaveTextContent('Connect your wallet to continue.');
    expect(alert).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('reuses one wallet toast for every disconnected claim button', async () => {
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    const table = screen.getByRole('table', { name: 'Insured tokens' });
    const firstClaim = screen.getByRole('button', { name: 'File claim for usd8' });
    const secondClaim = screen.getByRole('button', { name: 'File claim for susd8' });

    expect(firstClaim).toBeEnabled();
    fireEvent.click(firstClaim);
    const warning = screen.getByRole('alert');
    expect(warning).toHaveTextContent('Connect your wallet to continue.');
    expect(warning.parentElement).toBe(document.body);
    expect(document.querySelector('.covered-protocols-warning')).toBeNull();
    expect(warning.closest('.landing-table-shell')).toBeNull();
    expect(table).not.toContainElement(warning);

    fireEvent.click(secondClaim);
    expect(screen.getAllByRole('alert')).toEqual([warning]);
    expect(warning).toContainElement(availabilityTooltip(secondClaim));
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('shows the active Sepolia incident countdown while the wallet is disconnected', async () => {
    const now = Date.now();
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '0', usd8: '0', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '0', availableForCooldown: '0' })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: now + ((2 * 24 + 23) * 60 + 59) * 60 * 1_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root: `0x${'00'.repeat(32)}`,
      },
    });

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Claim Open (2d 23h left) for test-msloss' })).toBeEnabled();
    expect(mocks.fetchLandingChainData).toHaveBeenCalledWith(
      '0x0000000000000000000000000000000000000000',
      11155111,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('does not open an overlay warning when score loading fails', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockRejectedValueOnce(new Error('score unavailable'));
    render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalled());
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
    expect(document.querySelector('.landing-error')).not.toBeInTheDocument();
  });

  it('uses loading icons for score and balance values while fetching', () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockImplementation(() => new Promise(() => {}));
    mocks.fetchLandingChainData.mockImplementation(() => new Promise(() => {}));

    render(<App />);

    expect(screen.getAllByRole('status', { name: 'Loading insurance score' })).toHaveLength(4);
    expect(screen.getAllByRole('status', { name: 'Loading wallet balance' })).toHaveLength(2);
    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    const savingsCard = screen.getByRole('heading', { name: 'sUSD8 Savings USD8 (Morpho)' }).closest('article');
    expect(within(usd8Card).getByText('Your Balance').nextElementSibling).not.toHaveTextContent('0');
    expect(within(usd8Card).getByText('Score earned').nextElementSibling).not.toHaveTextContent('0.0');
    expect(within(savingsCard).getByText('Your Deposit (USD8)').nextElementSibling).not.toHaveTextContent('0');
    expect(within(savingsCard).getByText('Score earned').nextElementSibling).not.toHaveTextContent('0.0');
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('shows unknown available score while the remaining chain score inputs are still loading', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    const scoreRequest = deferred();
    mocks.fetchInsuranceScore.mockReturnValueOnce(scoreRequest.promise);
    mocks.fetchLandingChainData.mockImplementation(() => new Promise(() => {}));

    render(<App />);

    await act(async () => scoreRequest.reject(new Error('score unavailable')));

    expect(screen.getAllByRole('status', { name: 'Loading insurance score' })).toHaveLength(3);
    expect(screen.getByText('Available Score').parentElement).toHaveTextContent('—');
    expect(screen.getAllByRole('status', { name: 'Loading wallet balance' })).toHaveLength(2);
  });

  it('uses the connected wallet chain ID for the score API and protocol reads', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledWith(
      mocks.account.address,
      expect.objectContaining({ chainId: 11155111 }),
    ));
    expect(mocks.fetchLandingChainData).toHaveBeenCalledWith(
      mocks.account.address,
      11155111,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(screen.getByRole('button', { name: /manage wallet/i })).toHaveTextContent('Sepolia');
  });

  it('ignores an older wallet snapshot when account requests resolve in reverse order', async () => {
    const firstAccount = '0x0000000000000000000000000000000000000001';
    const secondAccount = '0x0000000000000000000000000000000000000002';
    const firstRequest = deferred();
    const secondRequest = deferred();
    const walletData = (usd8) => ({
      balances: {
        usdc: '0', usd8, savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '0', availableForCooldown: '0' })],
      activeIncidentId: '0',
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.account.address = firstAccount;
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    const { rerender } = render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledWith(
      firstAccount,
      11155111,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    ));
    const firstSignal = mocks.fetchLandingChainData.mock.calls[0][2].signal;
    mocks.account.address = secondAccount;
    rerender(<App />);
    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledWith(
      secondAccount,
      11155111,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    ));
    expect(firstSignal.aborted).toBe(true);

    await act(async () => secondRequest.resolve(walletData('222')));
    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    await waitFor(() => expect(within(usd8Card).getByText('Your Balance').nextElementSibling).toHaveTextContent('222'));

    await act(async () => firstRequest.resolve(walletData('111')));
    expect(within(usd8Card).getByText('Your Balance').nextElementSibling).toHaveTextContent('222');
    expect(within(usd8Card).getByText('Your Balance').nextElementSibling).not.toHaveTextContent('111');
  });

  it('rejects the previous account snapshot before the replacement passive effect starts', async () => {
    let publishOldSnapshot;
    const oldRequest = {
      then(callback) {
        publishOldSnapshot = callback;
        return oldRequest;
      },
      catch() {
        return oldRequest;
      },
    };
    const nextRequest = deferred();
    const oldChainData = {
      balances: {
        usdc: '0', usd8: '111', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '500' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: Date.now() + 3 * 86_400_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root: `0x${'00'.repeat(32)}`,
      },
      claim: {
        id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '0',
        scoreToSpend: '100', insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', resolved: false,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    };
    function ResolveDuringLayout({ resolve }) {
      useLayoutEffect(() => resolve?.(), [resolve]);
      return <App />;
    }
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData
      .mockReturnValueOnce(oldRequest)
      .mockReturnValueOnce(nextRequest.promise);
    const { rerender } = render(<ResolveDuringLayout />);
    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(1));

    mocks.account.address = '0x0000000000000000000000000000000000000002';
    rerender(<ResolveDuringLayout resolve={() => publishOldSnapshot(oldChainData)} />);

    expect(screen.queryByRole('button', { name: /Claim Open .* for test-msloss/ })).not.toBeInTheDocument();
    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    expect(within(usd8Card).getByText('Your Balance').nextElementSibling).not.toHaveTextContent('111');
  });

  it('clears the previous account claim and lifecycle state as soon as the account changes', async () => {
    const firstAccount = '0x0000000000000000000000000000000000000001';
    const secondAccount = '0x0000000000000000000000000000000000000002';
    const secondRequest = deferred();
    mocks.account.address = firstAccount;
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData
      .mockResolvedValueOnce({
        balances: {
          usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
          insuredTokens: { 'test-msloss': '500' },
        },
        pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
        activeIncidentId: '1',
        incident: {
          id: '1',
          tokenId: 'test-msloss',
          phaseDeadlineMilliseconds: Date.now() + 3 * 86_400_000,
          phaseWindowMilliseconds: 3 * 86_400_000,
          root: `0x${'00'.repeat(32)}`,
        },
        claim: {
          id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '0',
          scoreToSpend: '100', insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', resolved: false,
        },
        insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
      })
      .mockReturnValueOnce(secondRequest.promise);
    const { rerender } = render(<App />);

    const firstClaimButton = await screen.findByRole('button', { name: /Claim Open .* for test-msloss/ });
    fireEvent.click(firstClaimButton);
    expect(await screen.findByRole('dialog', { name: 'Claim Status for msLOSS' })).toBeInTheDocument();

    mocks.account.address = secondAccount;
    rerender(<App />);

    expect(screen.queryByRole('dialog', { name: 'Claim Status for msLOSS' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Claim Open .* for test-msloss/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('status', { name: 'Loading wallet balance' })).not.toHaveLength(0);
  });

  it('clears the hydrated claim state when the wallet disconnects', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '500' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: Date.now() + 3 * 86_400_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root: `0x${'00'.repeat(32)}`,
      },
      claim: {
        id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '0',
        scoreToSpend: '100', insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', resolved: false,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    const { rerender } = render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Claim Open .* for test-msloss/ }));
    expect(await screen.findByRole('dialog', { name: 'Claim Status for msLOSS' })).toBeInTheDocument();

    mocks.account.address = '';
    mocks.account.isConnected = false;
    rerender(<App />);

    expect(screen.queryByRole('dialog', { name: 'Claim Status for msLOSS' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect wallet' })).toBeInTheDocument();
    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    expect(within(usd8Card).getByText('Your Balance').nextElementSibling).toHaveTextContent('0');
  });

  it('ignores an older insurance score when account requests resolve in reverse order', async () => {
    const firstScoreRequest = deferred();
    const secondScoreRequest = deferred();
    const scoreData = (usd8Score) => ({
      snapshotTimestamp: Math.floor(Date.now() / 1_000),
      grossEarnedScore: usd8Score,
      grossScorePerSecond: '0',
      availableScore: usd8Score,
      maturingScorePerSecond: '0',
      tokenScores: [{
        token: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
        grossEarnedScore: usd8Score,
        grossScorePerSecond: '0',
      }],
    });
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore
      .mockReturnValueOnce(firstScoreRequest.promise)
      .mockReturnValueOnce(secondScoreRequest.promise);
    const { rerender } = render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledTimes(1));
    mocks.account.address = '0x0000000000000000000000000000000000000002';
    rerender(<App />);
    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledTimes(2));

    await act(async () => secondScoreRequest.resolve(scoreData('222')));
    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    await waitFor(() => expect(within(usd8Card).getByText('Score earned').nextElementSibling).toHaveTextContent('222.0'));

    await act(async () => firstScoreRequest.resolve(scoreData('111')));
    expect(within(usd8Card).getByText('Score earned').nextElementSibling).toHaveTextContent('222.0');
    expect(within(usd8Card).getByText('Score earned').nextElementSibling).not.toHaveTextContent('111.0');
  });

  it('does not reuse a late settlement result for another account claim', async () => {
    const firstAccount = '0x0000000000000000000000000000000000000001';
    const secondAccount = '0x0000000000000000000000000000000000000002';
    const root = `0x${'12'.repeat(32)}`;
    const payoutAsset = '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c';
    const payoutPool = '0x00000000000000000000000000000000000000c1';
    const firstSettlement = deferred();
    const secondSettlement = deferred();
    const unexpectedSettlement = deferred();
    const accountData = (claimId) => ({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '500' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: Date.now() - 3_600_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root,
        poolAddrs: [payoutPool],
        poolOrder: [payoutAsset],
      },
      claim: {
        id: claimId, incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '0',
        scoreToSpend: '100', insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', resolved: false,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.account.address = firstAccount;
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData
      .mockResolvedValueOnce(accountData('9'))
      .mockResolvedValueOnce(accountData('10'));
    mocks.prepareSettlement
      .mockReturnValueOnce(firstSettlement.promise)
      .mockReturnValueOnce(secondSettlement.promise)
      .mockReturnValue(unexpectedSettlement.promise);
    const { rerender } = render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Finalise Payout.* for test-msloss/ }));
    await waitFor(() => expect(mocks.prepareSettlement).toHaveBeenCalledTimes(1));

    mocks.account.address = secondAccount;
    rerender(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Finalise Payout.* for test-msloss/ }));
    await waitFor(() => expect(mocks.prepareSettlement).toHaveBeenCalledTimes(2));

    await act(async () => secondSettlement.resolve({
      poolAddrs: [payoutPool],
      poolOrder: [payoutAsset],
      rows: [{ claimId: '10', amounts: [10n], boostedScore: 30n, scoreSpent: 30n, eligibleAmount: 10n }],
    }));
    const dialog = screen.getByRole('dialog', { name: 'Claim Status for msLOSS' });
    await waitFor(() => expect(within(dialog).getByText(`10 base units of ${payoutAsset}`)).toBeInTheDocument());

    await act(async () => firstSettlement.resolve({
      poolAddrs: [payoutPool],
      poolOrder: [payoutAsset],
      rows: [{ claimId: '9', amounts: [9n], boostedScore: 10n, scoreSpent: 10n, eligibleAmount: 9n }],
    }));
    expect(within(dialog).getByText(`10 base units of ${payoutAsset}`)).toBeInTheDocument();
    expect(within(dialog).queryByText(`9 base units of ${payoutAsset}`)).not.toBeInTheDocument();
  });

  it('does not send a claim write to the wallet after the account changes', async () => {
    const estimateRequest = deferred();
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    const accountChainData = {
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '500' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: Date.now() + 3 * 86_400_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root: `0x${'00'.repeat(32)}`,
      },
      claim: {
        id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '0',
        scoreToSpend: '100', insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', resolved: false,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    };
    mocks.fetchLandingChainData
      .mockResolvedValueOnce(accountChainData)
      .mockResolvedValueOnce(accountChainData);
    mocks.estimateContractGas.mockReturnValueOnce(estimateRequest.promise);
    const { rerender } = render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Claim Open .* for test-msloss/ }));
    const dialog = screen.getByRole('dialog', { name: 'Claim Status for msLOSS' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel Claim' }));
    await waitFor(() => expect(mocks.estimateContractGas).toHaveBeenCalledWith(expect.objectContaining({
      account: '0x0000000000000000000000000000000000000001',
      functionName: 'cancelClaim',
    })));

    mocks.account.address = '0x0000000000000000000000000000000000000002';
    rerender(<App />);
    await act(async () => estimateRequest.resolve(100_000n));

    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('re-reads the authoritative claim before constructing payout calldata', async () => {
    const root = `0x${'12'.repeat(32)}`;
    const payoutAsset = '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c';
    const payoutPool = '0x00000000000000000000000000000000000000c1';
    const accountData = (resolved) => ({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '500' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: Date.now() - 3_600_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root,
        poolAddrs: [payoutPool],
        poolOrder: [payoutAsset],
      },
      claim: {
        id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '0',
        scoreToSpend: '100', insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', resolved,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData
      .mockResolvedValueOnce(accountData(false))
      .mockResolvedValueOnce(accountData(true));
    mocks.prepareSettlement.mockResolvedValue({
      root,
      poolAddrs: [payoutPool],
      poolOrder: [payoutAsset],
      rows: [{
        claimId: '9',
        amounts: [10n],
        scoreSpent: 1n,
        boostedScore: 0n,
        eligibleAmount: 10n,
        eligibleBoosterAmount: 0n,
        proof: [],
      }],
    });
    mocks.writeContractAsync.mockImplementation(() => new Promise(() => {}));
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Finalise Payout.* for test-msloss/ }));
    const dialog = screen.getByRole('dialog', { name: 'Claim Status for msLOSS' });
    await waitFor(() => expect(within(dialog).getByText(`10 base units of ${payoutAsset}`)).toBeInTheDocument());
    fireEvent.click(within(dialog).getByRole('button', { name: 'Accept Payout' }));

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(2));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('This claim has already been resolved.');
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it.each([
    [3n, 100n, true], [3n, 100n, false], [0n, 100n, true], [3n, 0n, false], [11n, 100n, true],
  ])('uses proof-bound boosters (%s, score %s, accept %s) for finalization and the compact usable display', async (eligibleBoosters, score, accept) => {
    const root = `0x${'12'.repeat(32)}`;
    const payoutAsset = '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c';
    const payoutPool = '0x00000000000000000000000000000000000000c1';
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '0', usd8: '25', insuredTokens: { 'test-msloss': '500' } },
      pools: [], activeIncidentId: '1',
      incident: {
        id: '1', tokenId: 'test-msloss', root,
        phaseDeadlineMilliseconds: Date.now() - 3_600_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        poolAddrs: [payoutPool], poolOrder: [payoutAsset],
      },
      claim: {
        id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '10',
        scoreToSpend: '100', scoreCommitmentPercentage: '100%', resolved: false,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    const row = { claimId: '9', amounts: [10n], scoreSpent: score, boostedScore: score * (100n + eligibleBoosters) / 100n,
      eligibleAmount: 10n, eligibleBoosterAmount: eligibleBoosters, proof: [] };
    mocks.prepareSettlement.mockResolvedValue({ root, poolAddrs: [payoutPool], poolOrder: [payoutAsset], rows: [row] });
    mocks.writeContractAsync.mockImplementation(() => new Promise(() => {}));
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Finalise Payout.* for test-msloss/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Claim Status for msLOSS' });
    if (eligibleBoosters <= 10n) {
      const expectedUsable = score > 0n ? eligibleBoosters : 0n;
      const boosterMetric = within(dialog).getByText('Boosters escrowed').closest('div');
      expect(await within(boosterMetric).findByText(`${expectedUsable} can be used`)).toBeInTheDocument();
      expect(within(dialog).queryByText('Boosters burned on acceptance')).toBeNull();
      expect(within(dialog).queryByText('Boosters returned on acceptance')).toBeNull();
      expect(within(dialog).queryByText('On decline: 10 returned')).toBeNull();
    }
    if (score > 0n) {
      await within(dialog).findByText(`10 base units of ${payoutAsset}`);
    } else {
      expect(await within(dialog).findByText(/You are not eligible for a payout/)).toBeInTheDocument();
      expect(within(dialog).queryByRole('button', { name: 'Accept Payout' })).toBeNull();
      expect(within(dialog).queryByText('Total Payout USD value')).toBeNull();
    }
    fireEvent.click(within(dialog).getByRole('button', { name: accept ? 'Accept Payout' : 'Cancel Payout and Return Tokens' }));
    if (eligibleBoosters > 10n) {
      expect(await within(dialog).findByRole('alert')).toHaveTextContent('The settlement booster amount exceeds this claim\'s escrow.');
      expect(mocks.writeContractAsync).not.toHaveBeenCalled();
    } else {
      await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({
        functionName: 'finalizeClaim',
        args: [9n, accept, row.amounts, row.scoreSpent, row.boostedScore, row.eligibleAmount, eligibleBoosters, row.proof],
      })));
    }
  });

  it.each([
    ['FinalizeNotOpen', ['incidentId'], [1n], 'Payout acceptance is not open. Refresh the claim status to check the payout or token-return window.'],
    ['InvalidProof', ['claimId'], [9n], 'The settlement proof is invalid. Refresh payout details before trying again.'],
    ['EligibleExceedsEscrow', ['eligibleAmount', 'escrow'], [11n, 10n], 'The settlement eligibility exceeds the escrowed tokens or boosters. Refresh payout details before trying again.'],
    ['InvalidBoostedScore', ['provided', 'expected'], [11n, 10n], 'The settlement payout weight does not match its eligible boosters. Refresh payout details before trying again.'],
    ['UnauthorizedClaim', ['claimId'], [9n], 'This wallet cannot finalize this claim. Check the connected account and refresh.'],
    ['ClaimAlreadyResolved', ['claimId'], [9n], 'This claim has already been resolved. Refresh the claim status.'],
    ['PayoutCapExceeded', ['poolIndex', 'requested', 'cap'], [0n, 11n, 10n], 'The payout exceeds the pool’s remaining payout allowance. Refresh payout details before trying again.'],
  ])('decodes %s and shows actionable finalization guidance', async (name, fields, args, message) => {
    const abi = [{ type: 'error', name, inputs: fields.map(name => ({ name, type: 'uint256' })) }];
    const error = new ContractFunctionRevertedError({ abi: claimWriteAbi, data: encodeErrorResult({ abi, errorName: name, args }), functionName: 'finalizeClaim' });
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '0', usd8: '25', insuredTokens: { 'test-msloss': '500' } },
      pools: [], activeIncidentId: '0',
      incident: { id: '1', tokenId: 'test-msloss', root: `0x${'00'.repeat(32)}`,
        phaseDeadlineMilliseconds: Date.now() - 10_000, phaseWindowMilliseconds: 1000 },
      claim: { id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '10',
        scoreToSpend: '100', scoreCommitmentPercentage: '100%', resolved: false },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.estimateContractGas.mockRejectedValueOnce({ shortMessage: 'Execution reverted.', cause: error });
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Finalise Payout.*for test-msloss/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Claim Status for msLOSS' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Return Tokens' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(message);
    expect(error.data?.errorName).toBe(name);
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('weights the committed-score share by settled boosted scores, not filed claims', async () => {
    const root = `0x${'12'.repeat(32)}`;
    const payoutAsset = '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c';
    const payoutPool = '0x00000000000000000000000000000000000000c1';
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '0', usd8: '25', insuredTokens: { 'test-msloss': '500' } },
      pools: [], activeIncidentId: '1',
      incident: {
        id: '1', tokenId: 'test-msloss', root,
        phaseDeadlineMilliseconds: Date.now() - 3_600_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        poolAddrs: [payoutPool], poolOrder: [payoutAsset],
      },
      claim: {
        id: '9', incidentId: '1', insuredTokenAmount: '2,000', bondAmount: '10', boosterAmount: '10',
        // Filed-claim total still counts the ineligible claim, so it reads low.
        scoreToSpend: '2,000', scoreCommitmentPercentage: '27.2%', resolved: false,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.prepareSettlement.mockResolvedValue({
      root, poolAddrs: [payoutPool], poolOrder: [payoutAsset],
      rows: [
        { claimId: '9', amounts: [10n], scoreSpent: 2_000n, boostedScore: 2_200n, eligibleAmount: 10n, eligibleBoosterAmount: 10n, proof: [] },
        { claimId: '10', amounts: [20n], scoreSpent: 4_000n, boostedScore: 4_880n, eligibleAmount: 20n, eligibleBoosterAmount: 22n, proof: [] },
        // Zero-eligible: the enclave zeroes its boosted score, so it leaves the denominator.
        { claimId: '11', amounts: [0n], scoreSpent: 0n, boostedScore: 0n, eligibleAmount: 0n, eligibleBoosterAmount: 0n, proof: [] },
      ],
    });
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Finalise Payout.* for test-msloss/ }));
    const dialog = screen.getByRole('dialog', { name: 'Claim Status for msLOSS' });
    await within(dialog).findByText(`10 base units of ${payoutAsset}`);
    expect(within(dialog).getByText('31.0% of all score committed')).toBeInTheDocument();
    expect(within(dialog).queryByText('27.2% of all score committed')).not.toBeInTheDocument();
  });

  it('rejects finalization calldata when the refreshed pool topology changed', async () => {
    const root = `0x${'12'.repeat(32)}`;
    const payoutAsset = '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c';
    const payoutPool = '0x00000000000000000000000000000000000000c1';
    const replacementPool = '0x00000000000000000000000000000000000000c2';
    const accountData = (poolAddrs) => ({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '500' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: Date.now() - 3_600_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root,
        poolAddrs,
        poolOrder: [payoutAsset],
      },
      claim: {
        id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '0',
        scoreToSpend: '100', insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', resolved: false,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData
      .mockResolvedValueOnce(accountData([payoutPool]))
      .mockResolvedValueOnce(accountData([replacementPool]));
    mocks.prepareSettlement.mockResolvedValue({
      root,
      poolAddrs: [payoutPool],
      poolOrder: [payoutAsset],
      rows: [{
        claimId: '9',
        amounts: [10n],
        scoreSpent: 1n,
        boostedScore: 0n,
        eligibleAmount: 10n,
        eligibleBoosterAmount: 0n,
        proof: [],
      }],
    });
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Finalise Payout.* for test-msloss/ }));
    const dialog = screen.getByRole('dialog', { name: 'Claim Status for msLOSS' });
    await waitFor(() => expect(within(dialog).getByText(`10 base units of ${payoutAsset}`)).toBeInTheDocument());
    fireEvent.click(within(dialog).getByRole('button', { name: 'Accept Payout' }));

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(2));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'The payout state changed while details were loading. Review the current claim and try again.',
    );
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('re-reads the authoritative claim before requesting cancellation', async () => {
    const accountData = (claim) => ({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '500' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: Date.now() + 3 * 86_400_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root: `0x${'00'.repeat(32)}`,
      },
      claim,
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    const unresolvedClaim = {
      id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '0',
      scoreToSpend: '100', insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', resolved: false,
    };
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData
      .mockResolvedValueOnce(accountData(unresolvedClaim))
      .mockResolvedValueOnce(accountData(null));
    mocks.writeContractAsync.mockImplementation(() => new Promise(() => {}));
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Claim Open .* for test-msloss/ }));
    const dialog = screen.getByRole('dialog', { name: 'Claim Status for msLOSS' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel Claim' }));

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(2));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'This account no longer has an unresolved claim to cancel.',
    );
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('requests settleIncident from the settlement-open UI for a nonclaimant', async () => {
    const zeroRoot = `0x${'00'.repeat(32)}`;
    const pool = '0x00000000000000000000000000000000000000c1';
    const asset = '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c';
    const settlement = {
      incidentId: '1',
      root: `0x${'34'.repeat(32)}`,
      poolAddrs: [pool],
      poolOrder: [asset],
      poolPayouts: [10n],
      signature: `0x${'11'.repeat(65)}`,
      rows: [],
    };
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: {
        usdc: '0', usd8: '0', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '0' },
      },
      pools: [coverPoolFixture()],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: Date.now() - 3_600_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root: zeroRoot,
        poolAddrs: [pool],
        poolOrder: [asset],
      },
      claim: null,
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.prepareSettlement.mockResolvedValue(settlement);
    mocks.writeContractAsync.mockImplementation(() => new Promise(() => {}));
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Settle Claims .* for test-msloss/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Claim Status for msLOSS' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Settle Claim' }));

    await waitFor(() => {
      expect(dialog).not.toHaveTextContent(/Cannot read properties of null/);
      expect(mocks.writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({
        abi: claimWriteAbi,
        functionName: 'settleIncident',
        args: [settlement.root, settlement.poolPayouts, settlement.signature],
      }));
    });
    expect(mocks.prepareSettlement).toHaveBeenCalledWith('1', expect.objectContaining({
      chainId: 11155111,
      expectedRoot: zeroRoot,
      expectedPoolAddrs: [pool],
      expectedPoolOrder: [asset],
    }));
    expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(2);
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
    expect(dialog).not.toHaveTextContent(/Cannot read properties of null/);
  });

  it('re-reads the authoritative incident before constructing settlement calldata', async () => {
    const zeroRoot = `0x${'00'.repeat(32)}`;
    const standingRoot = `0x${'34'.repeat(32)}`;
    const accountData = (root) => ({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '500' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: Date.now() - 3_600_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root,
      },
      claim: {
        id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '0',
        scoreToSpend: '100', insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', resolved: false,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData
      .mockResolvedValueOnce(accountData(zeroRoot))
      .mockResolvedValueOnce(accountData(standingRoot));
    mocks.prepareSettlement.mockResolvedValue({
      root: standingRoot,
      poolPayouts: [10n],
      signature: `0x${'11'.repeat(65)}`,
      poolOrder: [],
      rows: [],
    });
    mocks.writeContractAsync.mockImplementation(() => new Promise(() => {}));
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Settle Claims .* for test-msloss/ }));
    const dialog = screen.getByRole('dialog', { name: 'Claim Status for msLOSS' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Settle Claim' }));

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(2));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'The incident settlement state changed while the settlement was prepared.',
    );
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('rejects settlement calldata when the refreshed pool topology changed', async () => {
    const zeroRoot = `0x${'00'.repeat(32)}`;
    const standingRoot = `0x${'34'.repeat(32)}`;
    const pool = '0x00000000000000000000000000000000000000c1';
    const asset = '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c';
    const replacementPool = '0x00000000000000000000000000000000000000c2';
    const accountData = (poolAddrs) => ({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '500' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: Date.now() - 3_600_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root: zeroRoot,
        poolAddrs,
        poolOrder: [asset],
      },
      claim: {
        id: '9', incidentId: '1', insuredTokenAmount: '345', bondAmount: '10', boosterAmount: '0',
        scoreToSpend: '100', insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', resolved: false,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData
      .mockResolvedValueOnce(accountData([pool]))
      .mockResolvedValueOnce(accountData([replacementPool]));
    mocks.prepareSettlement.mockResolvedValue({
      root: standingRoot,
      poolAddrs: [pool],
      poolOrder: [asset],
      poolPayouts: [10n],
      signature: `0x${'11'.repeat(65)}`,
      rows: [],
    });
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /Settle Claims .* for test-msloss/ }));
    const dialog = screen.getByRole('dialog', { name: 'Claim Status for msLOSS' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Settle Claim' }));

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(2));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'The incident settlement state changed while the settlement was prepared.',
    );
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('maps the existing score response token breakdown to the USD8 and sUSD8 cards', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValueOnce({
      snapshotTimestamp: Math.floor(Date.now() / 1_000),
      grossEarnedScore: '12',
      grossScorePerSecond: '0',
      availableScore: '5',
      maturingScorePerSecond: '0',
      tokenScores: [
        {
          token: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
          grossEarnedScore: '8',
          grossScorePerSecond: '0',
        },
        {
          token: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
          grossEarnedScore: '4',
          grossScorePerSecond: '0',
        },
      ],
    });

    render(<App />);

    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    const savingsCard = screen.getByRole('heading', { name: 'sUSD8 Savings USD8 (Morpho)' }).closest('article');
    await waitFor(() => expect(within(usd8Card).getByText('Score earned').nextElementSibling).toHaveTextContent('8.0'));
    expect(within(savingsCard).getByText('Score earned').nextElementSibling).toHaveTextContent('4.0');
  });

  it('keeps the score loading until current chain balances are available', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    const chainData = deferred();
    mocks.fetchLandingChainData.mockReturnValueOnce(chainData.promise);
    mocks.fetchInsuranceScore.mockResolvedValueOnce({
      snapshotTimestamp: Math.floor(Date.now() / 1_000),
      grossEarnedScore: '100',
      grossScorePerSecond: '0',
      availableScore: '0',
      maturingScorePerSecond: '0',
      tokenScores: [
        {
          token: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
          balance: '20000000000000000000',
          grossEarnedScore: '60',
          grossScorePerSecond: '0',
        },
        {
          token: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
          balance: '0',
          grossEarnedScore: '40',
          grossScorePerSecond: '0',
        },
      ],
    });

    render(<App />);

    const total = screen.getByText('Total Insurance Score').parentElement;
    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalled());
    expect(within(total).getByRole('status', { name: 'Loading insurance score' })).toBeInTheDocument();
    expect(total).not.toHaveTextContent('100.0');

    chainData.resolve({
      balances: { usdc: '0', usd8: '20', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      scoreBalances: { usd8: '20000000000000000000', savings: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '0',
    });

    await waitFor(() => expect(total).toHaveTextContent('100.0'));
  });

  it('refreshes the cached score once when current scored-token balances changed', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    const staleScore = {
      snapshotTimestamp: Math.floor(Date.now() / 1_000) - 86_400,
      grossEarnedScore: '12',
      grossScorePerSecond: '0',
      availableScore: '5',
      maturingScorePerSecond: '0',
      tokenScores: [
        {
          token: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
          balance: '20000000000000000000',
          grossEarnedScore: '8',
          grossScorePerSecond: '0',
        },
        {
          token: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
          balance: '0',
          grossEarnedScore: '4',
          grossScorePerSecond: '0',
        },
      ],
    };
    mocks.fetchInsuranceScore
      .mockResolvedValueOnce(staleScore)
      .mockResolvedValueOnce({ ...staleScore, cacheStatus: 'advanced' });
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '0', usd8: '20', savings: '2', coverAsset: '0', poolShares: '0' },
      scoreBalances: { usd8: '20000000000000000000', savings: '2000000000000000000' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '0',
    });

    render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledTimes(2));
    expect(mocks.fetchInsuranceScore).toHaveBeenLastCalledWith(
      mocks.account.address,
      expect.objectContaining({ chainId: 11155111, refresh: true }),
    );
  });

  it('ignores a late forced score refresh from the previous account', async () => {
    const oldRefresh = deferred();
    const tokenScore = (grossEarnedScore, balance) => ({
      snapshotTimestamp: Math.floor(Date.now() / 1_000),
      grossEarnedScore,
      grossScorePerSecond: '0',
      availableScore: grossEarnedScore,
      maturingScorePerSecond: '0',
      tokenScores: [
        {
          token: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
          balance,
          grossEarnedScore,
          grossScorePerSecond: '0',
        },
        {
          token: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
          balance: '0',
          grossEarnedScore: '0',
          grossScorePerSecond: '0',
        },
      ],
    });
    const landingData = (usd8, savings) => ({
      balances: { usdc: '0', usd8, savings, savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      scoreBalances: {
        usd8: `${usd8}000000000000000000`,
        savings: `${savings}000000000000000000`,
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '0',
    });
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore
      .mockResolvedValueOnce(tokenScore('111', '20000000000000000000'))
      .mockReturnValueOnce(oldRefresh.promise)
      .mockResolvedValue(tokenScore('222', '30000000000000000000'));
    mocks.fetchLandingChainData
      .mockResolvedValueOnce(landingData('20', '2'))
      .mockResolvedValueOnce(landingData('30', '0'));
    const { rerender } = render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledTimes(2));
    mocks.account.address = '0x0000000000000000000000000000000000000002';
    rerender(<App />);
    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledWith(
      '0x0000000000000000000000000000000000000002',
      expect.objectContaining({ chainId: 11155111 }),
    ));
    const total = screen.getByText('Total Insurance Score').parentElement;
    await waitFor(() => expect(total).toHaveTextContent('222.0'));

    await act(async () => oldRefresh.resolve(tokenScore('111', '30000000000000000000')));

    expect(total).toHaveTextContent('222.0');
    expect(total).not.toHaveTextContent('111.0');
  });

  it('does not keep simulating score from a stale nonzero balance after the refreshed balance is zero', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    const staleScore = {
      snapshotTimestamp: Math.floor(Date.now() / 1_000),
      grossEarnedScore: '100',
      grossScorePerSecond: '1',
      availableScore: '50',
      maturingScorePerSecond: '0',
      tokenScores: [
        {
          token: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
          balance: '20000000000000000000',
          grossEarnedScore: '100',
          grossScorePerSecond: '1',
        },
        {
          token: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
          balance: '0',
          grossEarnedScore: '0',
          grossScorePerSecond: '0',
        },
      ],
    };
    mocks.fetchInsuranceScore.mockResolvedValue(staleScore);
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '0', usd8: '0', savings: '0', coverAsset: '0', poolShares: '0' },
      scoreBalances: { usd8: '0', savings: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '0',
    });

    render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledTimes(2));
    const total = screen.getByText('Total Insurance Score').parentElement;
    await waitFor(() => expect(within(total).queryByRole('status', { name: 'Loading insurance score' })).not.toBeInTheDocument());
    const scoreAfterRefresh = total.textContent;

    await new Promise((resolve) => window.setTimeout(resolve, 1_100));

    expect(total).toHaveTextContent(scoreAfterRefresh);
  });

  it('starts a provisional score simulation from the current balance while finalization trails', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    const finalizedScore = {
      snapshotTimestamp: Math.floor(Date.now() / 1_000),
      grossEarnedScore: '0',
      grossScorePerSecond: '0',
      availableScore: '0',
      maturingScorePerSecond: '0',
      tokenScores: [
        {
          token: '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
          balance: '0',
          grossEarnedScore: '0',
          grossScorePerSecond: '0',
        },
        {
          token: '0x7989b3eb6fad27e404b07433ebd265657359f4ab',
          balance: '0',
          grossEarnedScore: '0',
          grossScorePerSecond: '0',
        },
      ],
    };
    mocks.fetchInsuranceScore
      .mockResolvedValueOnce(finalizedScore)
      .mockResolvedValueOnce({ ...finalizedScore, cacheStatus: 'advanced' });
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '0', usd8: '5000', savings: '0', coverAsset: '0', poolShares: '0' },
      scoreBalances: { usd8: '5000000000000000000000', savings: '0' },
      scoreRatesPerSecond: { usd8: '1', savings: '0' },
      scoreBalancesSnapshotTimestampMilliseconds: Date.now(),
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '0',
    });

    render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledTimes(2));
    const total = screen.getByText('Total Insurance Score').parentElement;
    await waitFor(() => expect(within(total).queryByRole('status', { name: 'Loading insurance score' })).not.toBeInTheDocument());
    expect(total).toHaveTextContent('0.0');

    await new Promise((resolve) => window.setTimeout(resolve, 1_100));

    expect(total).not.toHaveTextContent('0.0');
  });

  it('starts a provisional score simulation when the finalized score API is unavailable', async () => {
    mocks.account.address = '0x8ca72D405CFa5128f2623AAB437A8741c57983a7';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockRejectedValue(new Error('Insurance Score is temporarily unavailable'));
    const mintTimestampMilliseconds = Date.now() - 60_000;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '0', usd8: '1000', savings: '0', coverAsset: '0', poolShares: '0' },
      scoreBalances: { usd8: '1000000000000000000000', savings: '0' },
      scoreRatesPerSecond: { usd8: '1', savings: '0' },
      scoreBalanceChangeTimestampMilliseconds: { usd8: mintTimestampMilliseconds, savings: 0 },
      scoreBalancesSnapshotTimestampMilliseconds: Date.now(),
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '0',
    });

    render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledTimes(1));
    const total = screen.getByText('Total Insurance Score').parentElement;
    await waitFor(() => expect(within(total).queryByRole('status', { name: 'Loading insurance score' })).not.toBeInTheDocument());
    expect(total).toHaveTextContent('60.0');

    await new Promise((resolve) => window.setTimeout(resolve, 1_100));

    expect(total).toHaveTextContent('61.0');
  });

  it('does not query an unconfigured score or Sepolia protocol contracts when the wallet is on Ethereum', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.chainId = 1;
    render(<App />);

    await waitFor(() => expect(mocks.fetchMorphoVault).toHaveBeenCalled());
    expect(mocks.fetchInsuranceScore).not.toHaveBeenCalled();
    expect(mocks.fetchLandingChainData).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /manage wallet/i })).toHaveTextContent('Ethereum');
    const mint = screen.getByRole('button', { name: 'mint' });
    expect(mint).toBeEnabled();
    fireEvent.click(mint);
    expect(availabilityTooltip(mint)).toHaveTextContent('USD8 is not deployed on Ethereum.');
  });


  it('opens the connected mint and redeem flows in the correct direction', () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'mint' }));
    let dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    expect(within(dialog).getByLabelText('USDC amount')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('USD8 output')).toBeInTheDocument();
    const mintSubmit = within(dialog).getByRole('button', { name: 'mint' });
    expect(mintSubmit).toBeEnabled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Redeem USD8' }));
    dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    expect(within(dialog).getByLabelText('USD8 amount')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('USDC output')).toBeInTheDocument();
    const close = within(dialog).getByRole('button', { name: 'Close mint and redeem' });
    expect(close).toHaveTextContent('×');
    fireEvent.click(close);
    expect(screen.queryByRole('dialog', { name: 'Mint or redeem USD8' })).not.toBeInTheDocument();
  });

  it('defaults mint and redemption amounts to the full balance without balance links', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10.123456', usd8: '25.987654321', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '0', availableForCooldown: '0' })],
      activeIncidentId: '0',
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'mint' }));
    let dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    expect(within(dialog).getByLabelText('USDC amount')).toHaveValue('10.123456');
    expect(within(dialog).queryByRole('button', { name: /Use full USDC balance/ })).not.toBeInTheDocument();
    expect(within(dialog).getByText('10.12 available')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Redeem USD8' }));
    dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    expect(within(dialog).getByLabelText('USD8 amount')).toHaveValue('25.987654321');
    expect(within(dialog).queryByRole('button', { name: /Use full USD8 balance/ })).not.toBeInTheDocument();
    expect(within(dialog).getByText('25.98 available')).toBeInTheDocument();
  });

  it('prevents minting or redeeming more than the available input-token balance', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'mint' }));
    let dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USDC amount'), { target: { value: '10.0000001' } });
    let submit = within(dialog).getByRole('button', { name: 'mint' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(availabilityTooltip(submit)).toHaveTextContent('The USDC amount exceeds your available balance.');

    fireEvent.change(within(dialog).getByLabelText('USDC amount'), { target: { value: '10' } });
    expect(availabilityTooltip(submit)).toBeNull();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Redeem USD8' }));
    dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USD8 amount'), { target: { value: '25.0000001' } });
    submit = within(dialog).getByRole('button', { name: 'redeem' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(availabilityTooltip(submit)).toHaveTextContent('The USD8 amount exceeds your available balance.');
  });

  it('shows a shared USD8 input warning after submit and clears it when editing', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'mint' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    const amount = within(dialog).getByLabelText('USDC amount');
    fireEvent.change(amount, { target: { value: '0' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'mint' }));

    expect(within(dialog).getByRole('alert')).toHaveTextContent('Enter a USDC amount greater than zero to mint USD8.');
    fireEvent.change(amount, { target: { value: '1' } });
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a shared toast warning for an invalid token amount', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'mint' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USDC amount'), { target: { value: '' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'mint' }));

    expect(within(dialog).getByRole('alert')).toHaveTextContent('Enter a valid USDC amount to mint USD8.');
  });

  it('names the missing token balance and intended action', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '0', usd8: '0', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '0', availableForCooldown: '0' })],
      activeIncidentId: '0',
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'mint' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    const submit = within(dialog).getByRole('button', { name: 'mint' });
    fireEvent.click(submit);

    expect(availabilityTooltip(submit)).toHaveTextContent('You do not have any USDC available to mint USD8.');
  });

  it('opens the connected wstEth pool actions in one three-tab transaction dialog', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3.258765', poolShares: '2.198765' },
      pools: [coverPoolFixture({ apy: '—',
        tvl: '—',
        capacityPercent: 0,
        deposit: '2.198765',
        earnings: '7.5',
        hasEarnings: true,
        availableForCooldown: '2.198765',
        availableForWithdraw: '4',
        inCooldown: '12', assetBalance: '3.258765', availableForCooldown: '2.198765' })],
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'deposit' }));

    let dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    expect(within(dialog).getByRole('button', { name: 'Deposit' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Withdraw' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Withdraw earnings' })).toBeInTheDocument();
    expect(within(dialog).getByLabelText('wstETH amount')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('wstETH amount')).toHaveValue('3.258765');
    expect(within(dialog).getByText('wstETH')).toBeInTheDocument();
    expect(within(dialog).queryByText('Pool shares')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('→')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /Use full wstETH balance/ })).not.toBeInTheDocument();
    expect(within(dialog).getByText(/3.25 available/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Withdraw' }));
    dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    expect(within(dialog).getByLabelText('USD8-cp-wstETH amount')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('USD8-cp-wstETH amount')).toHaveValue('2.198765');
    expect(within(dialog).getByText('Pool shares to redeem')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Estimated wstETH received')).toHaveTextContent('2.198765');
    expect(within(dialog).queryByText('USD8-cp-wstETH')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('→')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /Use full USD8-cp-wstETH balance/ })).not.toBeInTheDocument();
    expect(within(dialog).getByText(/2.19 shares available/).closest('small')).toHaveTextContent('2.19 shares available. 7-day cooldown if no pending claims. Otherwise after the claims are all finalized. Learn More.');
    expect(within(dialog).getByRole('button', { name: 'start cooldown' })).toBeInTheDocument();
    expect(within(dialog).getByText('4.00 wstETH estimated for withdrawal, 12.00 wstETH in cooldown.')).toBeInTheDocument();
    expect(within(dialog).getAllByRole('button', { name: 'Withdraw' })).toHaveLength(2);
    expect(within(dialog).getByRole('link', { name: 'Learn More' })).toHaveAttribute(
      'href',
      './docs/cover-pools.html',
    );

    fireEvent.click(within(dialog).getByRole('button', { name: 'Withdraw earnings' }));
    dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    expect(within(dialog).getByText('7.50 USD8 available to withdraw')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'withdraw earnings' })).toBeInTheDocument();
  });

  it('prevents depositing more wstETH than the wallet balance', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3.258765', poolShares: '2.198765' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '2.198765', earnings: '0', hasEarnings: false, assetBalance: '3.258765', availableForCooldown: '2.198765' })],
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'deposit' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    fireEvent.change(within(dialog).getByLabelText('wstETH amount'), { target: { value: '3.258766' } });
    const submit = within(dialog).getByRole('button', { name: 'deposit' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(availabilityTooltip(submit)).toHaveTextContent('The wstETH amount exceeds your available balance.');
  });

  it('explains that an active incident temporarily blocks cover-pool deposits', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3', poolShares: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 23.01, capacityUncapped: false,
        remainingDepositCapacity: '76.99', deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '3', availableForCooldown: '0' })],
      activeIncidentId: '1',
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'deposit' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    const poolCapacity = within(dialog).getByText('76.99 wstETH left in pool limit');
    expect(poolCapacity).toHaveClass('usd8-dialog-pool-capacity');
    expect(poolCapacity.parentElement).toHaveClass('usd8-dialog-pool-availability');
    expect(within(dialog).queryByRole('button', { name: /Use full wstETH balance/ })).not.toBeInTheDocument();
    expect(within(dialog).getByText(/3.00 available/).closest('small'))
      .toHaveTextContent('3.00 available. 76.99 wstETH left in pool limit');
    const submit = within(dialog).getByRole('button', { name: 'deposit' });
    fireEvent.click(submit);

    expect(availabilityTooltip(submit)).toHaveTextContent(
      'Deposits are temporarily unavailable while insurance incident #1 is active. Try again after the incident is finalized.',
    );
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('explains when a completed cooldown is waiting for active incident claims', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3', poolShares: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 23.01, deposit: '0', earnings: '0', hasEarnings: false,
        availableForCooldown: '0', availableForWithdraw: '0', inCooldown: '4',
        cooldownEndsAtMilliseconds: Date.now() - 60_000, assetBalance: '3', availableForCooldown: '0' })],
      activeIncidentId: '1',
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });

    expect(within(dialog).getByText(
      '4.00 wstETH estimated for withdrawal after claims are finalized, 0.00 wstETH in cooldown.',
    )).toBeInTheDocument();
    const startCooldown = within(dialog).getByRole('button', { name: 'start cooldown' });
    fireEvent.click(startCooldown);
    expect(availabilityTooltip(startCooldown)).toHaveTextContent(
      'Please finish the existing withdrawal request before starting a new one.',
    );
    const withdraw = within(dialog).getAllByRole('button', { name: 'Withdraw' })[1];
    fireEvent.click(withdraw);
    expect(availabilityTooltip(withdraw)).toHaveTextContent('Waiting for claims to finish');
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('explains when a deposit exceeds the cover pool remaining capacity', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3', poolShares: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 99.5, capacityUncapped: false,
        remainingDepositCapacity: '0.5', deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '3', availableForCooldown: '0' })],
      activeIncidentId: '0',
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'deposit' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    const submit = within(dialog).getByRole('button', { name: 'deposit' });
    fireEvent.click(submit);

    expect(availabilityTooltip(submit)).toHaveTextContent(
      "This deposit exceeds the cover pool's remaining capacity. You can deposit up to 0.5 wstETH.",
    );
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('labels the cover-pool return as trailing earnings APR and explains its calculation', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));

    expect(poolCard().getByText('30D Earnings APR')).toBeInTheDocument();
    // Tooltips portal to document.body, one per card.
    expect(screen.getAllByText('USD8 earnings accrued over the past 30 days, annualized against average pool value. Earnings represented by this APR are delivered in USD8.')).toHaveLength(1);
  });

  it('prevents starting cooldown for more shares than are available', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3', poolShares: '2.198765' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '2.198765', earnings: '0', hasEarnings: false,
        availableForCooldown: '2.198765', availableForWithdraw: '0', inCooldown: '0', assetBalance: '3', availableForCooldown: '2.198765' })],
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    fireEvent.change(within(dialog).getByLabelText('USD8-cp-wstETH amount'), { target: { value: '2.198766' } });
    const submit = within(dialog).getByRole('button', { name: 'start cooldown' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(availabilityTooltip(submit)).toHaveTextContent('The USD8-cp-wstETH amount exceeds your available balance.');
  });

  it('explains reward withdrawal beside the button when earnings are zero', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'withdraw earnings' }));

    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    const withdraw = within(dialog).getByRole('button', { name: 'withdraw earnings' });
    expect(withdraw).toBeEnabled();
    fireEvent.click(withdraw);
    expect(availabilityTooltip(withdraw)).toHaveTextContent('No earnings to withdraw.');
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('preserves confirmed transactions and known data when their refresh fails', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData
      .mockResolvedValueOnce({
        balances: {
          usdc: '10', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        },
        pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '7.5', hasEarnings: true, assetBalance: '0', availableForCooldown: '0' })],
        activeIncidentId: '1',
        incident: {
          id: '1',
          tokenId: 'test-msloss',
          phaseDeadlineMilliseconds: Date.now() + 86_400_000,
          phaseWindowMilliseconds: 86_400_000,
          root: `0x${'11'.repeat(32)}`,
        },
        insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
      })
      .mockRejectedValueOnce(new Error('chain refresh unavailable'));
    mocks.writeContractAsync.mockResolvedValueOnce(
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    );
    render(<App />);

    await screen.findByRole('button', { name: 'File claim for usd8' });
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'withdraw earnings' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'withdraw earnings' }));

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole('button', { name: 'Defi Insurance' }));
    const table = screen.getByRole('table', { name: 'Insured tokens' });
    expect(within(table).getByRole('button', { name: 'File claim for usd8' })).toBeInTheDocument();
    expect(await screen.findByText(/Transaction confirmed/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View transaction' })).toHaveAttribute('href', expect.stringContaining('/tx/0xaaaa'));
    expect(screen.getByRole('button', { name: 'Retry refresh' })).toBeInTheDocument();
    expect(await within(dialog).findByRole('alert', { name: 'Transaction status' })).toHaveTextContent('Rewards claimed on Sepolia.');
  });

  it('submits a pool deposit from the dialog instead of using a browser prompt', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3', poolShares: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '3', availableForCooldown: '0' })],
      activeIncidentId: '0',
    });
    mocks.readContract.mockResolvedValueOnce(0n);
    mocks.writeContractAsync
      .mockResolvedValueOnce('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      .mockResolvedValueOnce('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    const prompt = vi.spyOn(window, 'prompt');
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'deposit' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    fireEvent.change(within(dialog).getByLabelText('wstETH amount'), { target: { value: '1.5' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'deposit' }));

    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledTimes(2));
    expect(prompt).not.toHaveBeenCalled();
    expect(mocks.writeContractAsync).toHaveBeenNthCalledWith(1, expect.objectContaining({
      chainId: 11155111,
      functionName: 'approve',
      args: [expect.any(String), 1_500_000_000_000_000_000n],
    }));
    expect(mocks.writeContractAsync).toHaveBeenNthCalledWith(2, expect.objectContaining({
      chainId: 11155111,
      functionName: 'deposit',
      args: [1_500_000_000_000_000_000n, mocks.account.address],
    }));
    const status = await within(dialog).findByRole('status', { name: 'Transaction status' });
    expect(status).toHaveTextContent('Deposit confirmed on Sepolia.');
    expect(screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' })).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('starts the cover-pool cooldown using the pool share decimals', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3.25', poolShares: '2.1' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '2.1', earnings: '0', hasEarnings: false, shareDecimals: 21, assetBalance: '3.25', availableForCooldown: '2.1' })],
      activeIncidentId: '0',
    });
    mocks.writeContractAsync.mockResolvedValueOnce(
      '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    );
    mocks.readContract.mockImplementation(({ functionName }) => Promise.resolve(functionName === 'balanceOf' ? 2_100_000_000_000_000_000_000n : 2_100_000_000_000_000_000n));
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    fireEvent.change(within(dialog).getByLabelText('USD8-cp-wstETH amount'), { target: { value: '2.1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'start cooldown' }));

    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledOnce());
    expect(mocks.writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({
      functionName: 'requestRedeem',
      args: [2_100_000_000_000_000_000_000n],
    }));
  });

  it.each([
    ['full balance', null, 1_000_000_000_000_000_000_000n, '0.498377'],
    ['edited shares', '0.4', 400_000_000_000_000_000_000n, '0.199350'],
  ])('shows the pool-loss estimate and submits exactly the %s', async (_, editedAmount, expectedShares, expectedOutput) => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '0', usd8: '0', savings: '0' },
      pools: [coverPoolFixture({ availableForCooldown: '1', availableForCooldownAssets: '0.498377312974030960',
        withdrawalQuote: { totalAssets: '31901131803467721787', totalSupply: '64010000000000000000000' } })],
      activeIncidentId: '0',
    });
    mocks.readContract.mockImplementation(async ({ functionName }) => {
      if (functionName === 'balanceOf') return 1_000_000_000_000_000_000_000n;
      throw new Error(`Unexpected read ${functionName}`);
    });
    mocks.writeContractAsync.mockResolvedValue('0x' + 'ab'.repeat(32));
    render(<App />);
    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog');
    const input = within(dialog).getByLabelText('USD8-cp-wstETH amount');
    expect(input).toHaveValue('1');
    expect(within(dialog).queryByRole('button', { name: /max/i })).not.toBeInTheDocument();
    expect(within(dialog).getByText('→')).toBeInTheDocument();
    expect(dialog).toHaveTextContent('May decrease if the pool pays claims before your withdrawal settles.');
    if (editedAmount) fireEvent.change(input, { target: { value: editedAmount } });
    expect(within(dialog).getByLabelText('Estimated wstETH received')).toHaveTextContent(expectedOutput);
    fireEvent.click(within(dialog).getByRole('button', { name: 'start cooldown' }));
    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({ functionName: 'requestRedeem', args: [expectedShares] })));
    expect(mocks.readContract).not.toHaveBeenCalledWith(expect.objectContaining({ functionName: 'previewWithdraw' }));
  });

  it('prevents a second cooldown request while an exit request is active', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    const cooldownEndsAtMilliseconds = Date.now() + (6 * 24 * 60 * 60 * 1_000);
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3', poolShares: '19' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '19', earnings: '0', hasEarnings: false,
        availableForCooldown: '19', availableForWithdraw: '0', inCooldown: '1', cooldownEndsAtMilliseconds, assetBalance: '3', availableForCooldown: '19' })],
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    expect(within(dialog).queryByRole('button', { name: /Use full USD8-cp-wstETH balance/ })).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText('USD8-cp-wstETH amount')).toHaveValue('19');
    expect(within(dialog).getByText(/19.00 shares available/).closest('small')).toHaveTextContent('19.00 shares available');
    expect(within(dialog).getByText('0.00 wstETH estimated for withdrawal, 1.00 wstETH in cooldown — ready in 6 days.')).toBeInTheDocument();
    const submit = within(dialog).getByRole('button', { name: 'start cooldown' });
    fireEvent.click(submit);

    expect(availabilityTooltip(submit)).toHaveTextContent(
      'Please finish the existing withdrawal request before starting a new one.',
    );
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('shows a cooldown error in the shared toast', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3.25', poolShares: '2.1' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '2.1', earnings: '0', hasEarnings: false,
        availableForCooldown: '2.1', availableForWithdraw: '0', inCooldown: '0', assetBalance: '3.25', availableForCooldown: '2.1' })],
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    fireEvent.change(within(dialog).getByLabelText('USD8-cp-wstETH amount'), { target: { value: '0' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'start cooldown' }));

    const status = await within(dialog).findByRole('alert');
    expect(status).toHaveTextContent('Enter a USD8-cp-wstETH amount greater than zero to start cooldown.');
    expect(within(dialog).getByRole('button', { name: 'start cooldown' }).closest('.action-button-shell'))
      .not.toContainElement(status);
    fireEvent.change(within(dialog).getByLabelText('USD8-cp-wstETH amount'), { target: { value: '1' } });
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('withdraws a matured cover-pool exit without starting another cooldown', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3.25', poolShares: '2.1' },
      pools: [coverPoolFixture({ apy: '—',
        tvl: '—',
        capacityPercent: 0,
        deposit: '2.1',
        earnings: '0',
        hasEarnings: false,
        shareDecimals: 21,
        availableForCooldown: '2.1',
        availableForWithdraw: '12',
        inCooldown: '0', assetBalance: '3.25', availableForCooldown: '2.1' })],
      activeIncidentId: '0',
    });
    mocks.writeContractAsync.mockResolvedValueOnce(
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    );
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(poolCard().getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth Cover Pool' });
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Withdraw' })[1]);

    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledOnce());
    expect(mocks.writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({
      functionName: 'completeRedeem',
      args: [mocks.account.address],
    }));
    expect(mocks.readContract).not.toHaveBeenCalledWith(expect.objectContaining({ functionName: 'exitRequests' }));
    const status = await within(dialog).findByRole('status', { name: 'Transaction status' });
    expect(status).toHaveTextContent('Withdrawal completed on Sepolia.');
    expect(status.previousElementSibling).toContainElement(
      within(dialog).getAllByRole('button', { name: 'Withdraw' })[1],
    );
  });

  it('approves USDC and mints USD8 through the Sepolia Treasury', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.readContract.mockResolvedValueOnce(0n);
    mocks.writeContractAsync
      .mockResolvedValueOnce('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      .mockResolvedValueOnce('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'mint' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USDC amount'), { target: { value: '1.5' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'mint' }));

    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledTimes(2));
    expect(mocks.writeContractAsync).toHaveBeenNthCalledWith(1, expect.objectContaining({
      chainId: 11155111,
      address: '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c',
      functionName: 'approve',
      args: ['0x2a722ed12982623dff64dc0adba40e734a5f59c3', 1_500_000n],
    }));
    expect(mocks.writeContractAsync).toHaveBeenNthCalledWith(2, expect.objectContaining({
      chainId: 11155111,
      address: '0x2a722ed12982623dff64dc0adba40e734a5f59c3',
      functionName: 'mintUSD8',
      args: [1_500_000n],
      gas: 150_000n,
    }));
    expect(await screen.findByText('Mint confirmed on Sepolia.')).toBeInTheDocument();
  });

  it('redeems USD8 through the Sepolia Treasury with the quoted pro-rata minimum', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.readContract.mockResolvedValue(1_000_000_000_000_000_000n);
    mocks.writeContractAsync.mockResolvedValueOnce(
      '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    );
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'redeem' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USD8 amount'), { target: { value: '1.5' } });
    await waitFor(() => expect(within(dialog).getByLabelText('USDC output')).toHaveTextContent('1.5'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'redeem' }));

    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledOnce());
    expect(mocks.readContract).toHaveBeenCalledWith(expect.objectContaining({
      address: '0x2a722ed12982623dff64dc0adba40e734a5f59c3',
      functionName: 'usd8ToUsdcRate',
    }));
    expect(mocks.writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({
      chainId: 11155111,
      address: '0x2a722ed12982623dff64dc0adba40e734a5f59c3',
      functionName: 'redeemUSD8',
      args: [1_500_000_000_000_000_000n, 1_500_000n],
    }));
    expect(await screen.findByText('Redemption confirmed on Sepolia.')).toBeInTheDocument();
  });

  it('shows transaction progress and success in the shared toast', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.readContract.mockResolvedValue(1_000_000_000_000_000_000n);
    const walletApproval = deferred();
    const confirmation = deferred();
    mocks.writeContractAsync.mockReturnValueOnce(walletApproval.promise);
    mocks.waitForTransactionReceipt.mockReturnValueOnce(confirmation.promise);
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'redeem' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USD8 amount'), { target: { value: '1.5' } });
    await waitFor(() => expect(within(dialog).getByLabelText('USDC output')).toHaveTextContent('1.5'));
    const submit = within(dialog).getByRole('button', { name: 'redeem' });
    fireEvent.click(submit);

    const status = await within(dialog).findByRole('status', { name: 'Transaction status' });
    expect(status).toHaveTextContent('Confirm the USD8 redemption in your wallet.');
    expect(status.querySelector('.usd8-spinner')).toBeInTheDocument();
    expect(submit.closest('.usd8-dialog-submit-row')).not.toContainElement(status);
    expect(status).toHaveClass('wallet-notice');
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();

    walletApproval.resolve('0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc1234');
    await waitFor(() => expect(status).toHaveTextContent('Transaction submitted: 0xcccccccc…1234'));
    expect(status.querySelector('.usd8-spinner')).toBeInTheDocument();

    confirmation.resolve({ status: 'success' });
    await waitFor(() => expect(status).toHaveTextContent('Redemption confirmed on Sepolia.'));
    expect(screen.getByRole('dialog', { name: 'Mint or redeem USD8' })).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('shows a readable cancellation message when the wallet closes without a transaction hash', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.readContract.mockResolvedValue(1_000_000_000_000_000_000n);
    mocks.writeContractAsync.mockResolvedValueOnce(null);
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'redeem' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USD8 amount'), { target: { value: '1.5' } });
    await waitFor(() => expect(within(dialog).getByLabelText('USDC output')).toHaveTextContent('1.5'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'redeem' }));

    expect(await within(dialog).findByText('Transaction cancelled in your wallet.')).toBeInTheDocument();
    expect(mocks.waitForTransactionReceipt).not.toHaveBeenCalled();
  });

  it('shows the Booster balance loaded from chain data in the claim dialog', async () => {
    mocks.account.address = '0xb446b0c85cc4ef5f5ebf495c4fdd38ecc5284176';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: {
        usdc: '10',
        usd8: '25',
        savings: '0',
        savingsAssets: '0',
        coverAsset: '0',
        poolShares: '0',
        boosters: '100',
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '0', availableForCooldown: '0' })],
      activeIncidentId: '0',
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'File claim for usd8' }));
    const dialog = screen.getByRole('dialog', { name: 'File claim for USD8' });

    expect(within(dialog).getByLabelText('Boosters to escrow')).toHaveValue(100);
    expect(within(dialog).queryByRole('button', { name: /Use all boosters/ })).not.toBeInTheDocument();
    expect(within(dialog).getByText('100.00 available')).toBeInTheDocument();
  });

  it.each([
    ['lagging', 11652295n],
    ['current', 11652300n],
    ['reverting', 11652300n],
  ])('approves Boosters and estimates the claim against a %s RPC', async (scenario, head) => {
    const boosterCollection = '0xc0012770848fcd350ab11906e93ba9fdfda19f4c';
    mocks.account.address = '0xb446b0c85cc4ef5f5ebf495c4fdd38ecc5284176';
    mocks.account.isConnected = true;
    const approvalBlock = 11652296n;
    mocks.getBlockNumber.mockResolvedValue(head);
    mocks.waitForTransactionReceipt.mockResolvedValueOnce({ status: 'success', blockNumber: approvalBlock });
    const rpc = createPublicClient({ transport: custom({ request: async ({ method, params }) => {
      if (method !== 'eth_estimateGas') throw new Error(`Unexpected RPC: ${method}`);
      if (scenario === 'reverting' || BigInt(params[1] || 0) < approvalBlock) {
        throw Object.assign(new Error('execution reverted'), {
          code: 3,
          data: encodeErrorResult({ abi: claimWriteAbi, errorName: 'ERC1155MissingApprovalForAll',
            args: ['0x4e346ccd0a46d51ebae6810d653791982968d502', mocks.account.address] }),
        });
      }
      return '0x186a0';
    } }, { retryCount: 0 }) });
    mocks.estimateContractGas.mockImplementation(request => request.functionName === 'fileClaim'
      ? rpc.estimateContractGas(request) : Promise.resolve(100_000n));
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '100' });
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        boosters: '5', insuredTokens: { 'test-msloss': '10' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1', tokenId: 'test-msloss', minHoldingRequiredBlocks: '300',
        phaseDeadlineMilliseconds: Date.now() + 60_000, phaseWindowMilliseconds: 60_000,
        root: `0x${'00'.repeat(32)}`,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') return Promise.resolve(true);
      if (functionName === 'activeIncidentId') return Promise.resolve(1n);
      if (functionName === 'claimBondAmount') return Promise.resolve(10_000_000_000_000_000_000n);
      if (functionName === 'allowance') return Promise.resolve(10_000_000_000_000_000_000n);
      if (functionName === 'boosterConfig') return Promise.resolve([boosterCollection, 1n]);
      if (functionName === 'balanceOf') return Promise.resolve(5n);
      if (functionName === 'isApprovedForAll') return Promise.resolve(false);
      throw new Error(`Unexpected read: ${functionName}`);
    });
    mocks.writeContractAsync
      .mockResolvedValueOnce('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      .mockResolvedValueOnce('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /Claim Open .* for test-msloss/ }));
    const dialog = screen.getByRole('dialog', { name: 'File claim for msLOSS' });
    fireEvent.change(within(dialog).getByLabelText('Insured msLOSS amount'), { target: { value: '10' } });
    fireEvent.change(within(dialog).getByLabelText('Insurance score to spend'), { target: { value: '25' } });
    fireEvent.change(within(dialog).getByLabelText('Boosters to escrow'), { target: { value: '3' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'File Claim' }));

    if (scenario === 'reverting') {
      const notice = await within(dialog).findByRole('alert', { name: 'Claim submission status' });
      expect(notice).toHaveTextContent('Claim transaction failed');
      expect(mocks.writeContractAsync).toHaveBeenCalledTimes(1);
      const error = await mocks.estimateContractGas.mock.results[1].value.catch(error => error);
      expect(error.walk(cause => cause instanceof ContractFunctionRevertedError).data.errorName)
        .toBe('ERC1155MissingApprovalForAll');
      return;
    }
    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledTimes(2));
    expect(mocks.getBlockNumber).toHaveBeenCalledWith({ cacheTime: 0 });
    expect(mocks.estimateContractGas).toHaveBeenLastCalledWith(expect.objectContaining({
      functionName: 'fileClaim', blockNumber: head < approvalBlock ? approvalBlock : head,
    }));
    expect(mocks.writeContractAsync.mock.calls[1][0]).not.toHaveProperty('blockNumber');
    expect(mocks.writeContractAsync).toHaveBeenNthCalledWith(1, expect.objectContaining({
      address: boosterCollection,
      functionName: 'setApprovalForAll',
      args: ['0x4e346ccd0a46d51ebae6810d653791982968d502', true],
    }));
    expect(mocks.writeContractAsync).toHaveBeenNthCalledWith(2, expect.objectContaining({
      functionName: 'fileClaim',
      args: [
        '0xd5b2a08f474f77ef29211ccc59cd65e5fa6734dc',
        10_000_000_000_000_000_000n,
        25_000_000_000_000_000_000n,
        3n,
        0n,
        '0x',
      ],
    }));
  });


  it.each(['verification', 'requirements', 'receipt'])('identifies a claim %s failure without mislabelling the booster approval', async (failureStep) => {
    const boosterCollection = '0xc0012770848fcd350ab11906e93ba9fdfda19f4c';
    mocks.account.address = '0xb446b0c85cc4ef5f5ebf495c4fdd38ecc5284176';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '100' });
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        boosters: '5', insuredTokens: { 'test-msloss': '10' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1', tokenId: 'test-msloss', minHoldingRequiredBlocks: '300',
        phaseDeadlineMilliseconds: Date.now() + 60_000, phaseWindowMilliseconds: 60_000,
        root: `0x${'00'.repeat(32)}`,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    let listingReads = 0;
    mocks.prepareIncidentOpen.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    if (failureStep === 'receipt') mocks.waitForTransactionReceipt.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') {
        listingReads += 1;
        if (failureStep === 'requirements' && listingReads === 3) return Promise.reject(new TypeError('Failed to fetch'));
        return Promise.resolve(true);
      }
      if (functionName === 'activeIncidentId') return Promise.resolve(0n);
      if (functionName === 'claimBondAmount') return Promise.resolve(10_000_000_000_000_000_000n);
      if (functionName === 'allowance') return Promise.resolve(10_000_000_000_000_000_000n);
      if (functionName === 'boosterConfig') return Promise.resolve([boosterCollection, 1n]);
      if (functionName === 'balanceOf') return Promise.resolve(5n);
      if (functionName === 'isApprovedForAll') return Promise.resolve(mocks.writeContractAsync.mock.calls.length > 0);
      throw new Error(`Unexpected read: ${functionName}`);
    });
    mocks.writeContractAsync
      .mockResolvedValueOnce('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      .mockResolvedValueOnce('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /Claim Open .* for test-msloss/ }));
    const dialog = screen.getByRole('dialog', { name: 'File claim for msLOSS' });
    fireEvent.change(within(dialog).getByLabelText('Insured msLOSS amount'), { target: { value: '10' } });
    fireEvent.change(within(dialog).getByLabelText('Insurance score to spend'), { target: { value: '25' } });
    fireEvent.change(within(dialog).getByLabelText('Boosters to escrow'), { target: { value: '2' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'File Claim' }));


    const notice = await within(dialog).findByRole('alert', { name: 'Claim submission status' });
    expect(notice).toHaveTextContent('No claim transaction was submitted.');
    expect(notice).not.toHaveTextContent('Failed to fetch');
    expect(mocks.writeContractAsync).toHaveBeenCalledTimes(1);
    if (failureStep === 'receipt') {
      expect(notice).toHaveTextContent('Booster approval confirmation unavailable: The transaction was submitted, but its confirmation could not be checked.');
      expect(within(notice).getByRole('link', { name: 'View transaction' })).toHaveAttribute('href',
        'https://sepolia.etherscan.io/tx/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      expect(notice).not.toHaveTextContent('Booster approval confirmed.');
    } else {
      expect(notice).toHaveTextContent('Booster approval confirmed.');
      expect(within(notice).queryByRole('link', { name: 'View transaction' })).not.toBeInTheDocument();
      expect(notice).toHaveTextContent(failureStep === 'verification'
        ? 'Claim verification failed: Could not reach the claim verification service.'
        : 'Claim requirements check failed: Could not connect to the blockchain.');
    }
    if (failureStep === 'verification') {
      mocks.prepareIncidentOpen.mockResolvedValueOnce({ referenceBlock: 12345678n, signature: `0x${'11'.repeat(65)}` });
      fireEvent.click(within(dialog).getByRole('button', { name: 'File Claim' }));
      await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledTimes(2));
      expect(mocks.writeContractAsync).toHaveBeenLastCalledWith(expect.objectContaining({
        functionName: 'fileClaim',
        args: expect.arrayContaining([2n]),
      }));
      expect(await within(dialog).findByText('Claim confirmed on Sepolia.')).toBeInTheDocument();
    }
  });


  it('prepares a first claim through the TEE service and submits its authorization onchain', async () => {
    const approval = deferred();
    mocks.getBlockNumber.mockResolvedValue(12_345_680n);
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') return Promise.resolve(true);
      if (functionName === 'activeIncidentId') return Promise.resolve(0n);
      if (functionName === 'claimBondAmount') return Promise.resolve(10_000_000_000_000_000_000n);
      if (functionName === 'incidentTimingConfig') {
        return Promise.resolve({ phaseWindow: 3600n, maxReferenceBlockAge: 450n });
      }
      if (functionName === 'allowance') return Promise.resolve(0n);
      throw new Error(`Unexpected read: ${functionName}`);
    });
    mocks.writeContractAsync
      .mockReturnValueOnce(approval.promise)
      .mockResolvedValueOnce('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    const claim = screen.getByRole('button', { name: 'File claim for usd8' });
    fireEvent.click(claim);
    const dialog = screen.getByRole('dialog', { name: 'File claim for USD8' });
    expect(within(dialog).getByRole('heading', { name: 'File a Claim for USD8' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('combobox', { name: 'Insured token' })).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText('Insured USD8 amount')).toBeInTheDocument();
    expect(within(dialog).queryByRole('combobox', { name: 'Approximate incident age' })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('note')).not.toBeInTheDocument();
    await waitFor(() => expect(within(dialog).getByLabelText('Insurance score to spend')).toHaveValue('128600'));
    fireEvent.change(within(dialog).getByLabelText('Insured USD8 amount'), { target: { value: '1' } });
    const submit = within(dialog).getByRole('button', { name: 'File Claim' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    expect(await within(dialog).findByText('Approve token in your wallet.')).toBeInTheDocument();
    expect(mocks.prepareIncidentOpen).not.toHaveBeenCalled();
    approval.resolve('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    await waitFor(() => expect(mocks.prepareIncidentOpen).toHaveBeenCalledWith(
      '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
      expect.objectContaining({
        chainId: 11155111,
        registry: '0xb34d92cd05005df36050370433819597a9bac693',
        defiInsurance: '0x4e346ccd0a46d51ebae6810d653791982968d502',
      }),
    ));
    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledTimes(2));
    expect(mocks.estimateContractGas).toHaveBeenCalledWith(expect.objectContaining({
      account: '0x0000000000000000000000000000000000000001',
      functionName: 'fileClaim',
      blockNumber: 12_345_680n,
      abi: expect.arrayContaining([
        expect.objectContaining({ type: 'error', name: 'InvalidReferenceBlock' }),
        expect.objectContaining({ type: 'error', name: 'UnauthorizedOpenSigner' }),
      ]),
    }));
    expect(mocks.writeContractAsync).toHaveBeenLastCalledWith(expect.objectContaining({
      chainId: 11155111,
      address: '0x4e346ccd0a46d51ebae6810d653791982968d502',
      functionName: 'fileClaim',
      args: [
        '0xa5b32853235619b5e9af364a40c0c6386dbd6055',
        1_000_000_000_000_000_000n,
        128_600_000_000_000_000_000_000n,
        0n,
        12_345_678n,
        `0x${'11'.repeat(65)}`,
      ],
      gas: 150_000n,
    }));
    expect(await within(dialog).findByText('Claim confirmed on Sepolia.')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('keeps the new account claim pending when an aborted prior claim finishes late', async () => {
    const firstTee = deferred();
    const secondTee = deferred();
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { usd8: '25' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '0',
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') return Promise.resolve(true);
      if (functionName === 'activeIncidentId') return Promise.resolve(0n);
      if (functionName === 'claimBondAmount') return Promise.resolve(10_000_000_000_000_000_000n);
      if (functionName === 'incidentTimingConfig') {
        return Promise.resolve({ phaseWindow: 3600n, maxReferenceBlockAge: 450n });
      }
      if (functionName === 'allowance') return Promise.resolve(11_000_000_000_000_000_000n);
      throw new Error(`Unexpected read: ${functionName}`);
    });
    mocks.prepareIncidentOpen
      .mockReturnValueOnce(firstTee.promise)
      .mockReturnValueOnce(secondTee.promise);
    const { rerender } = render(<App />);

    const startClaim = async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'File claim for usd8' }));
      const dialog = screen.getByRole('dialog', { name: 'File claim for USD8' });
      fireEvent.change(within(dialog).getByLabelText('Insured USD8 amount'), { target: { value: '1' } });
      const submit = within(dialog).getByRole('button', { name: 'File Claim' });
      fireEvent.click(submit);
      return { dialog, submit };
    };

    await startClaim();
    await waitFor(() => expect(mocks.prepareIncidentOpen).toHaveBeenCalledTimes(1));
    mocks.account.address = '0x0000000000000000000000000000000000000002';
    rerender(<App />);
    const secondClaim = await startClaim();
    await waitFor(() => expect(mocks.prepareIncidentOpen).toHaveBeenCalledTimes(2));
    expect(await within(secondClaim.dialog).findByText(
      'Verifying incident in the TEE. First claim may take several minutes.',
    )).toBeInTheDocument();

    await act(async () => firstTee.resolve({
      referenceBlock: 12_345_678n,
      signature: `0x${'11'.repeat(65)}`,
    }));

    expect(within(secondClaim.dialog).getByText(
      'Verifying incident in the TEE. First claim may take several minutes.',
    )).toBeInTheDocument();
    expect(secondClaim.dialog).not.toHaveTextContent('Wallet account or network changed.');
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('does not let an old claim preflight overwrite the new account wallet status', async () => {
    const oldEligibility = deferred();
    const oldTee = deferred();
    const secondApproval = deferred();
    let eligibilityReads = 0;
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: {
        usdc: '0', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { usd8: '25' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '0',
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') {
        eligibilityReads += 1;
        return eligibilityReads === 1 ? oldEligibility.promise : Promise.resolve(true);
      }
      if (functionName === 'activeIncidentId') return Promise.resolve(0n);
      if (functionName === 'claimBondAmount') return Promise.resolve(10_000_000_000_000_000_000n);
      if (functionName === 'incidentTimingConfig') {
        return Promise.resolve({ phaseWindow: 3600n, maxReferenceBlockAge: 450n });
      }
      if (functionName === 'allowance') return Promise.resolve(0n);
      throw new Error(`Unexpected read: ${functionName}`);
    });
    mocks.prepareIncidentOpen
      .mockResolvedValueOnce({ referenceBlock: 12_345_678n, signature: `0x${'11'.repeat(65)}` })
      .mockReturnValueOnce(oldTee.promise);
    mocks.writeContractAsync.mockReturnValueOnce(secondApproval.promise);
    const { rerender } = render(<App />);

    const startClaim = async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'File claim for usd8' }));
      const dialog = screen.getByRole('dialog', { name: 'File claim for USD8' });
      fireEvent.change(within(dialog).getByLabelText('Insured USD8 amount'), { target: { value: '1' } });
      fireEvent.click(within(dialog).getByRole('button', { name: 'File Claim' }));
      return dialog;
    };

    await startClaim();
    await waitFor(() => expect(eligibilityReads).toBe(1));
    mocks.account.address = '0x0000000000000000000000000000000000000002';
    rerender(<App />);
    const secondDialog = await startClaim();
    expect(await within(secondDialog).findByText('Approve token in your wallet.')).toBeInTheDocument();

    await act(async () => oldEligibility.resolve(true));

    expect(within(secondDialog).getByText('Approve token in your wallet.')).toBeInTheDocument();
    expect(secondDialog).not.toHaveTextContent('Verifying incident in the TEE.');
    expect(mocks.prepareIncidentOpen).not.toHaveBeenCalled();
    expect(mocks.writeContractAsync).toHaveBeenCalledTimes(1);
  });

  it('checks first-incident eligibility before requesting token approval', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') return Promise.resolve(true);
      if (functionName === 'activeIncidentId') return Promise.resolve(0n);
      if (functionName === 'claimBondAmount') return Promise.resolve(10_000_000_000_000_000_000n);
      if (functionName === 'incidentTimingConfig') {
        return Promise.resolve({ phaseWindow: 3600n, maxReferenceBlockAge: 450n });
      }
      if (functionName === 'allowance') return Promise.resolve(11_000_000_000_000_000_000n);
      throw new Error(`Unexpected read: ${functionName}`);
    });
    mocks.prepareIncidentOpen.mockRejectedValueOnce(
      new Error('No qualifying >20% price drop was detected in the past 1.5 hours.'),
    );
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole('button', { name: 'File claim for usd8' }));
    const dialog = screen.getByRole('dialog', { name: 'File claim for USD8' });
    fireEvent.change(within(dialog).getByLabelText('Insured USD8 amount'), { target: { value: '1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'File Claim' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'No qualifying >20% price drop was detected in the past 1.5 hours.',
    );
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('does not render a configured catalog row that is not listed by the insurance contract', async () => {
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'File claim for curve-scrvusd' })).not.toBeInTheDocument();
  });

  it('fails closed before TEE preparation when the token was delisted after the landing snapshot', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') return Promise.resolve(false);
      throw new Error(`Unexpected read: ${functionName}`);
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'File claim for usd8' }));
    const dialog = screen.getByRole('dialog', { name: 'File claim for USD8' });
    await waitFor(() => expect(within(dialog).getByLabelText('Insurance score to spend')).toHaveValue('128600'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'File Claim' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'USD8 is no longer enabled for new claims on Sepolia.',
    );
    expect(mocks.prepareIncidentOpen).not.toHaveBeenCalled();
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('rechecks listing immediately before any approval or TEE request', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    let eligibilityChecks = 0;
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') {
        eligibilityChecks += 1;
        return Promise.resolve(eligibilityChecks === 1);
      }
      if (functionName === 'activeIncidentId') return Promise.resolve(0n);
      if (functionName === 'claimBondAmount') return Promise.resolve(10_000_000_000_000_000_000n);
      if (functionName === 'incidentTimingConfig') {
        return Promise.resolve({ phaseWindow: 3600n, maxReferenceBlockAge: 450n });
      }
      throw new Error(`Unexpected read: ${functionName}`);
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'File claim for usd8' }));
    const dialog = screen.getByRole('dialog', { name: 'File claim for USD8' });
    await waitFor(() => expect(within(dialog).getByLabelText('Insurance score to spend')).toHaveValue('128600'));
    fireEvent.change(within(dialog).getByLabelText('Insured USD8 amount'), { target: { value: '1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'File Claim' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'USD8 is no longer enabled for new claims on Sepolia.',
    );
    expect(mocks.prepareIncidentOpen).not.toHaveBeenCalled();
    expect(eligibilityChecks).toBe(2);
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('opens the connected user claim status and cancels it through the insurance contract', async () => {
    const now = Date.now();
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: {
        usdc: '10', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0',
        insuredTokens: { 'test-msloss': '500' },
      },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false })],
      activeIncidentId: '1',
      incident: {
        id: '1',
        tokenId: 'test-msloss',
        phaseDeadlineMilliseconds: now + ((2 * 24 + 23) * 60 + 59) * 60 * 1_000,
        phaseWindowMilliseconds: 3 * 86_400_000,
        root: `0x${'00'.repeat(32)}`,
      },
      claim: {
        id: '42',
        incidentId: '1',
        insuredTokenAmount: '345',
        bondAmount: '10',
        boosterAmount: '2',
        scoreToSpend: '2344322',
        insuredTokenClaimPercentage: '3.4%',
        scoreCommitmentPercentage: '2.5%',
        resolved: false,
      },
    });
    mocks.writeContractAsync.mockResolvedValueOnce('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Claim Open (2d 23h left) for test-msloss' }));
    const dialog = screen.getByRole('dialog', { name: 'Claim Status for msLOSS' });
    expect(within(dialog).getByText('345 msLOSS')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel Claim' }));

    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({
      chainId: 11155111,
      address: '0x4e346ccd0a46d51ebae6810d653791982968d502'.toLowerCase(),
      functionName: 'cancelClaim',
      args: [],
      gas: 150_000n,
    })));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Claim Status for msLOSS' })).not.toBeInTheDocument());
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Claim Status for msLOSS' })).not.toBeInTheDocument();
  });

  it('omits rough incident timing for later claims in an active incident', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '10', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '0', availableForCooldown: '0' })],
      activeIncidentId: '7',
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'File claim for usd8' }));
    await waitFor(() => expect(screen.queryByRole('combobox', { name: 'Approximate incident age' })).not.toBeInTheDocument());
  });

  it('rejects a claim in JavaScript when USD8 cannot cover its amount plus the claim bond', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '0', usd8: '5', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      pools: [coverPoolFixture({ apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false, assetBalance: '0', availableForCooldown: '0' })],
      activeIncidentId: '7',
      incident: {
        id: '7', tokenId: 'test-msloss', minHoldingRequiredBlocks: '300',
        phaseDeadlineMilliseconds: Date.now() + 60_000, phaseWindowMilliseconds: 60_000,
        root: `0x${'00'.repeat(32)}`,
      },
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
    });
    mocks.readContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInsuredToken') return Promise.resolve(true);
      if (functionName === 'activeIncidentId') return Promise.resolve(7n);
      if (functionName === 'claimBondAmount') return Promise.resolve(10_000_000_000_000_000_000n);
      throw new Error(`Unexpected read: ${functionName}`);
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'File claim for usd8' }));
    const dialog = screen.getByRole('dialog', { name: 'File claim for USD8' });
    await waitFor(() => expect(within(dialog).getByLabelText('Insurance score to spend')).toHaveValue('128600'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'File Claim' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Insufficient USD8 balance for the insured amount and claim bond.',
    );
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
    expect(mocks.prepareIncidentOpen).not.toHaveBeenCalled();
  });

  it('says why onchain data is missing instead of rendering zeros', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockRejectedValue(new Error('USD8 is not deployed on Ethereum'));

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('USD8 is not deployed on Ethereum');
  });

  it('marks a failed transaction as a failure rather than a neutral status', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.readContract.mockRejectedValue(new Error('Insufficient USDC allowance.'));

    render(<App />);
    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'mint' }));

    const dialog = await screen.findByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'mint' }));

    const status = await within(dialog).findByLabelText('Transaction status');
    await waitFor(() => expect(status).toHaveTextContent('Insufficient USDC allowance.'));
    expect(status).toHaveClass('wallet-notice');
    expect(status).toHaveAttribute('role', 'alert');
    expect(status.querySelector('.usd8-spinner')).toBeNull();
  });

  it('drops the incident row once your own claim is resolved', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    const incident = {
      id: '15',
      tokenId: 'test-msloss',
      root: `0x${'11'.repeat(32)}`,
      phaseDeadlineMilliseconds: Date.now() - 1_000,
      phaseWindowMilliseconds: 3_600_000,
      poolAddrs: ['0x55cb69271da9937d0cb3c548409fd3f77586df79'],
      poolOrder: ['0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa'],
      totalScoreCommitted: '2000',
    };
    // Settlement delists the token, so the row only persists for an open claim.
    const settledTokens = { ...LISTED_INSURANCE_TOKENS, 'test-msloss': { enabled: false, maxCoverageBps: '0' } };
    const claim = {
      id: '56', incidentId: '15', insuredTokenAmount: '1,000', bondAmount: '10',
      boosterAmount: '0', scoreToSpend: '2,000', scoreCommitmentPercentage: '100%',
    };

    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '0', usd8: '0', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      pools: [coverPoolFixture()],
      activeIncidentId: '15',
      incident,
      claim: { ...claim, resolved: false },
      insurance: { tokens: settledTokens },
    });
    const { unmount } = render(<App />);
    expect(await screen.findByRole('button', { name: /for test-msloss/ })).toBeInTheDocument();
    unmount();

    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '0', usd8: '0', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      pools: [coverPoolFixture()],
      activeIncidentId: '15',
      incident,
      claim: { ...claim, resolved: true },
      insurance: { tokens: settledTokens },
    });
    render(<App />);
    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('button', { name: /for test-msloss/ })).toBeNull());
  });

  it('re-fetches the score when a spend lands, even though no balance moved', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    const balances = { usdc: '0', usd8: '0', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' };
    // Snapshot predates the spend; the chain already records 2000 spent.
    const stale = {
      chainId: '11155111',
      snapshotTimestamp: 1,
      grossEarnedScore: '8931',
      maturedGrossEarnedScore: '8931',
      scoreSpent: '0',
      availableScore: '8931',
      grossScorePerSecond: '0',
      maturingScorePerSecond: '0',
      tokenScores: [
        { token: '0xa5B32853235619B5e9AF364A40c0c6386Dbd6055', balance: '0', grossEarnedScore: '0', grossScorePerSecond: '0' },
        { token: '0x7989B3EB6faD27e404b07433eBD265657359F4AB', balance: '0', grossEarnedScore: '0', grossScorePerSecond: '0' },
      ],
    };
    mocks.fetchInsuranceScore.mockResolvedValueOnce(stale)
      .mockResolvedValue({ ...stale, scoreSpent: '2000', availableScore: '6931' });
    mocks.fetchLandingChainData.mockResolvedValue({
      balances,
      pools: [coverPoolFixture()],
      activeIncidentId: '0',
      insurance: { tokens: LISTED_INSURANCE_TOKENS, claimBond: '10' },
      scoreBalances: { usd8: '0', savings: '0' },
      scoreSpent: '2000000000000000000000',
    });

    render(<App />);

    // Token balances are unchanged, so only the spend can have triggered this.
    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledTimes(2));
    expect(mocks.fetchInsuranceScore.mock.calls[1][1]).toEqual(
      expect.objectContaining({ refresh: true }),
    );
  });
  it('blocks repeated submits across approval and mint and skips approval refreshes', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.readContract.mockResolvedValue(0n);
    const approval = deferred();
    mocks.waitForTransactionReceipt.mockReturnValueOnce(approval.promise).mockResolvedValue({ status: 'success', blockNumber: 99n });
    mocks.writeContractAsync.mockResolvedValue('0x' + 'a'.repeat(64));
    render(<App />);
    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'mint' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USDC amount'), { target: { value: '1' } });
    const submit = within(dialog).getByRole('button', { name: 'mint' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledTimes(1));
    expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(1);
    approval.resolve({ status: 'success', blockNumber: 98n });
    expect(await within(dialog).findByText('Mint confirmed on Sepolia.')).toBeInTheDocument();
    expect(mocks.writeContractAsync).toHaveBeenCalledTimes(2);
    expect(mocks.fetchLandingChainData).toHaveBeenCalledTimes(2);
    expect(mocks.fetchLandingChainData).toHaveBeenLastCalledWith(mocks.account.address, 11155111,
      expect.objectContaining({ resources: ['account-balances'], minBlock: 99n, refresh: true }));
  });

  it('requires review of a changed redemption quote before sending a transaction', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.readContract.mockResolvedValueOnce(10n ** 18n).mockResolvedValue(800_000_000_000_000_000n);
    mocks.writeContractAsync.mockResolvedValue('0x' + 'b'.repeat(64));
    render(<App />);
    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'redeem' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USD8 amount'), { target: { value: '1.5' } });
    await waitFor(() => expect(within(dialog).getByLabelText('USDC output')).toHaveTextContent('1.5'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'redeem' }));
    expect(await within(dialog).findByText(/redemption quote changed/)).toBeInTheDocument();
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
    expect(within(dialog).getByLabelText('USDC output')).toHaveTextContent('1.2');
    fireEvent.click(within(dialog).getByRole('button', { name: 'redeem' }));
    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledTimes(1));
    expect(mocks.writeContractAsync).toHaveBeenLastCalledWith(expect.objectContaining({ args: [1_500_000_000_000_000_000n, 1_200_000n] }));
  });

  it('keeps keyboard focus inside a dialog and returns it to its opener', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    render(<App />);
    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    const opener = screen.getByRole('button', { name: 'mint' });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    const first = within(dialog).getByRole('button', { name: 'Close mint and redeem' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(within(dialog).getByRole('button', { name: 'mint' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement, { key: 'Tab' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'Escape' });
    expect(opener).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

});
