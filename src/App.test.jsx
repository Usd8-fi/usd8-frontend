import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

const mocks = vi.hoisted(() => ({
  account: { address: '', isConnected: false },
  chainId: 11155111,
  fetchInsuranceScore: vi.fn(),
  fetchLandingChainData: vi.fn(),
  fetchMorphoVault: vi.fn(),
  prepareIncidentOpen: vi.fn(),
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
  publicClientFor: () => ({
    estimateContractGas: mocks.estimateContractGas,
    readContract: mocks.readContract,
    waitForTransactionReceipt: mocks.waitForTransactionReceipt,
  }),
  publicClient: {
    estimateContractGas: mocks.estimateContractGas,
    readContract: mocks.readContract,
    waitForTransactionReceipt: mocks.waitForTransactionReceipt,
  },
  SEPOLIA_CONTRACTS: {
    usdc: '0x31cd4d9299ac2d55bb8590c9557edd3ff08cf35c',
    usd8: '0xfdb7546dea188d52e8ee98b789da2d695da702a7',
    treasury: '0x26f85ec30a753451d218f4dc526f696d2d805097',
  },
}));

vi.mock('./lib/scoreApi.js', () => ({ fetchInsuranceScore: mocks.fetchInsuranceScore }));
vi.mock('./lib/claimApi.js', () => ({
  claimApiConfigured: true,
  prepareIncidentOpen: mocks.prepareIncidentOpen,
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
  const promise = new Promise((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

afterEach(() => vi.useRealTimers());

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
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false },
      activeIncidentId: '0',
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
    mocks.estimateContractGas.mockReset();
    mocks.estimateContractGas.mockResolvedValue(100_000n);
    mocks.readContract.mockReset();
    mocks.waitForTransactionReceipt.mockReset();
    mocks.waitForTransactionReceipt.mockResolvedValue({ status: 'success' });
    mocks.writeContractAsync.mockReset();
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

  it('keeps global pool values but zeros wallet-specific pool values while disconnected', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));

    expect(screen.getByText('34%')).toBeInTheDocument();
    expect(screen.getByText('$122.2K')).toBeInTheDocument();
    expect(screen.getByText('0 wstEth')).toBeInTheDocument();
    expect(screen.getByText('0 USD8')).toBeInTheDocument();
    expect(screen.getByLabelText('50% capacity filled')).toBeInTheDocument();
  });

  it('explains a disconnected pool action beside the button after click', () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null);
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    const deposit = screen.getByRole('button', { name: 'deposit' });

    expect(deposit).toBeEnabled();
    fireEvent.click(deposit);
    expect(availabilityTooltip(deposit)).toHaveTextContent('Please connect your wallet first.');
    expect(prompt).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('explains disconnected mint availability beside the button without opening a dialog', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);

    const mint = screen.getByRole('button', { name: 'mint' });

    expect(mint).toBeEnabled();
    fireEvent.click(mint);
    expect(availabilityTooltip(mint)).toHaveTextContent('Please connect your wallet first.');
    expect(alert).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('reuses the wallet warning for disconnected claim buttons', () => {
    render(<App />);

    const claim = screen.getByRole('button', { name: 'File claim for usd8' });

    expect(claim).toBeEnabled();
    fireEvent.click(claim);
    expect(availabilityTooltip(claim)).toHaveTextContent('Please connect your wallet first.');
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('shows score-loading errors in the same overlay notice', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockRejectedValueOnce(new Error('score unavailable'));
    render(<App />);

    const notice = await screen.findByRole('alertdialog', { name: 'Notice' });
    expect(notice).toHaveTextContent('Insurance Score is temporarily unavailable.');
    expect(document.querySelector('.landing-error')).not.toBeInTheDocument();
  });

  it('uses score loading icons instead of textual placeholders while fetching', () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockImplementation(() => new Promise(() => {}));

    render(<App />);

    expect(screen.getAllByRole('status', { name: 'Loading insurance score' })).toHaveLength(2);
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('uses the connected wallet chain ID for the score API and protocol reads', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledWith(
      mocks.account.address,
      expect.objectContaining({ chainId: 11155111 }),
    ));
    expect(mocks.fetchLandingChainData).toHaveBeenCalledWith(mocks.account.address, 11155111);
    expect(screen.getByRole('button', { name: /disconnect wallet/i })).toHaveTextContent('Sepolia');
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
          token: '0xfdb7546dea188d52e8ee98b789da2d695da702a7',
          grossEarnedScore: '8',
          grossScorePerSecond: '0',
        },
        {
          token: '0x830e05aa59f71d5f2977c8089fad14c0e6ad1440',
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
          token: '0xfdb7546dea188d52e8ee98b789da2d695da702a7',
          balance: '20000000000000000000',
          grossEarnedScore: '60',
          grossScorePerSecond: '0',
        },
        {
          token: '0x830e05aa59f71d5f2977c8089fad14c0e6ad1440',
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
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false },
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
          token: '0xfdb7546dea188d52e8ee98b789da2d695da702a7',
          balance: '20000000000000000000',
          grossEarnedScore: '8',
          grossScorePerSecond: '0',
        },
        {
          token: '0x830e05aa59f71d5f2977c8089fad14c0e6ad1440',
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
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false },
      activeIncidentId: '0',
    });

    render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledTimes(2));
    expect(mocks.fetchInsuranceScore).toHaveBeenLastCalledWith(
      mocks.account.address,
      expect.objectContaining({ chainId: 11155111, refresh: true }),
    );
  });

  it('stops score loading when a refreshed finalized snapshot still trails a new balance', async () => {
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
          token: '0xfdb7546dea188d52e8ee98b789da2d695da702a7',
          balance: '0',
          grossEarnedScore: '0',
          grossScorePerSecond: '0',
        },
        {
          token: '0x830e05aa59f71d5f2977c8089fad14c0e6ad1440',
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
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false },
      activeIncidentId: '0',
    });

    render(<App />);

    await waitFor(() => expect(mocks.fetchInsuranceScore).toHaveBeenCalledTimes(2));
    const total = screen.getByText('Total Insurance Score').parentElement;
    await waitFor(() => expect(within(total).queryByRole('status', { name: 'Loading insurance score' })).not.toBeInTheDocument());
    expect(total).toHaveTextContent('0.0');
  });

  it('does not query an unconfigured score or Sepolia protocol contracts when the wallet is on Ethereum', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.chainId = 1;
    render(<App />);

    await waitFor(() => expect(mocks.fetchMorphoVault).toHaveBeenCalled());
    expect(mocks.fetchInsuranceScore).not.toHaveBeenCalled();
    expect(mocks.fetchLandingChainData).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /disconnect wallet/i })).toHaveTextContent('Ethereum');
    const mint = screen.getByRole('button', { name: 'mint' });
    expect(mint).toBeEnabled();
    fireEvent.click(mint);
    expect(availabilityTooltip(mint)).toHaveTextContent('USD8 is not deployed on Ethereum.');
  });

  it('keeps a warning notice open when its backdrop is clicked', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockRejectedValueOnce(new Error('score unavailable'));
    render(<App />);

    const notice = await screen.findByRole('alertdialog', { name: 'Notice' });
    fireEvent.mouseDown(notice.closest('.app-notice-backdrop'));

    expect(screen.getByRole('alertdialog', { name: 'Notice' })).toBeInTheDocument();
  });

  it('keeps a warning notice open on Escape until its close button is clicked', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockRejectedValueOnce(new Error('score unavailable'));
    render(<App />);

    const notice = await screen.findByRole('alertdialog', { name: 'Notice' });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByRole('alertdialog', { name: 'Notice' })).toBeInTheDocument();

    fireEvent.click(within(notice).getByRole('button', { name: 'Close notice' }));
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
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

  it('uses the clickable available balance as the full mint or redemption amount', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10.123456', usd8: '25.987654321', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false },
      activeIncidentId: '0',
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'mint' }));
    let dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    expect(within(dialog).getByLabelText('USDC amount')).toHaveValue(1);
    const mintAvailable = within(dialog).getByRole('button', { name: 'Use full USDC balance 10.123456' });
    expect(mintAvailable).toHaveTextContent('10.12 available');
    fireEvent.click(mintAvailable);
    expect(within(dialog).getByLabelText('USDC amount')).toHaveValue(10.123456);

    fireEvent.click(within(dialog).getByRole('button', { name: 'Redeem USD8' }));
    dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    expect(within(dialog).getByLabelText('USD8 amount')).toHaveValue(1);
    const redeemAvailable = within(dialog).getByRole('button', { name: 'Use full USD8 balance 25.987654321' });
    expect(redeemAvailable).toHaveTextContent('25.98 available');
    fireEvent.click(redeemAvailable);
    expect(within(dialog).getByLabelText('USD8 amount')).toHaveValue(25.987654321);
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

  it('shows a red USD8 input warning after submit and clears it when editing', async () => {
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

  it('shows a red action-local warning for an invalid token amount', async () => {
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
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false },
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
      pool: {
        apy: '—',
        tvl: '—',
        capacityPercent: 0,
        deposit: '2.198765',
        earnings: '7.5',
        hasEarnings: true,
        availableForCooldown: '2.198765',
        availableForWithdraw: '4',
        inCooldown: '12',
      },
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(screen.getByRole('button', { name: 'deposit' }));

    let dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
    expect(within(dialog).getByRole('button', { name: 'Deposit' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Withdraw' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Withdraw earnings' })).toBeInTheDocument();
    expect(within(dialog).getByLabelText('wstETH amount')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('wstETH amount')).toHaveValue(1);
    expect(within(dialog).getByText('wstETH')).toBeInTheDocument();
    expect(within(dialog).queryByText('Pool shares')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('→')).not.toBeInTheDocument();
    const depositAvailable = within(dialog).getByRole('button', { name: 'Use full wstETH balance 3.258765' });
    expect(depositAvailable).toHaveTextContent('3.25 available');
    fireEvent.click(depositAvailable);
    expect(within(dialog).getByLabelText('wstETH amount')).toHaveValue(3.258765);

    fireEvent.click(within(dialog).getByRole('button', { name: 'Withdraw' }));
    dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
    expect(within(dialog).getByLabelText('USD8-cp-wstETH amount')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('USD8-cp-wstETH amount')).toHaveValue(1);
    expect(within(dialog).getByText('USD8-cp-wstETH')).toBeInTheDocument();
    expect(within(dialog).queryByText('wstETH')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('→')).not.toBeInTheDocument();
    const withdrawAvailable = within(dialog).getByRole('button', { name: 'Use full USD8-cp-wstETH balance 2.198765' });
    fireEvent.click(withdrawAvailable);
    expect(within(dialog).getByLabelText('USD8-cp-wstETH amount')).toHaveValue(2.198765);
    expect(withdrawAvailable.parentElement).toHaveTextContent('2.19 available. 7-day cooldown if no pending claims. Otherwise after the claims are all finalized. Learn More.');
    expect(within(dialog).getByRole('button', { name: 'start cooldown' })).toBeInTheDocument();
    expect(within(dialog).getByText('4 available for withdraw, 12 in cooldown.')).toBeInTheDocument();
    expect(within(dialog).getAllByRole('button', { name: 'Withdraw' })).toHaveLength(2);
    expect(within(dialog).getByRole('link', { name: 'Learn More' })).toHaveAttribute(
      'href',
      './docs/cover-pools.html',
    );

    fireEvent.click(within(dialog).getByRole('button', { name: 'Withdraw earnings' }));
    dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
    expect(within(dialog).getByText('7.5 USD8 available to withdraw')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'withdraw earnings' })).toBeInTheDocument();
  });

  it('prevents depositing more wstETH than the wallet balance', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3.258765', poolShares: '2.198765' },
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '2.198765', earnings: '0', hasEarnings: false },
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(screen.getByRole('button', { name: 'deposit' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
    fireEvent.change(within(dialog).getByLabelText('wstETH amount'), { target: { value: '3.258766' } });
    const submit = within(dialog).getByRole('button', { name: 'deposit' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(availabilityTooltip(submit)).toHaveTextContent('The wstETH amount exceeds your available balance.');
  });

  it('prevents starting cooldown for more shares than are available', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3', poolShares: '2.198765' },
      pool: {
        apy: '—', tvl: '—', capacityPercent: 0, deposit: '2.198765', earnings: '0', hasEarnings: false,
        availableForCooldown: '2.198765', availableForWithdraw: '0', inCooldown: '0',
      },
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(screen.getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
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
    fireEvent.click(screen.getByRole('button', { name: 'withdraw earnings' }));

    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
    const withdraw = within(dialog).getByRole('button', { name: 'withdraw earnings' });
    expect(withdraw).toBeEnabled();
    fireEvent.click(withdraw);
    expect(availabilityTooltip(withdraw)).toHaveTextContent('No earnings to withdraw.');
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('submits a pool deposit from the dialog instead of using a browser prompt', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3', poolShares: '0' },
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false },
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
    fireEvent.click(screen.getByRole('button', { name: 'deposit' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
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
    expect(screen.getByRole('dialog', { name: 'Manage wstEth cover pool' })).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('starts the cover-pool cooldown using the pool share decimals', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3.25', poolShares: '2.1' },
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '2.1', earnings: '0', hasEarnings: false, shareDecimals: 21 },
      activeIncidentId: '0',
    });
    mocks.writeContractAsync.mockResolvedValueOnce(
      '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    );
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(screen.getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
    fireEvent.change(within(dialog).getByLabelText('USD8-cp-wstETH amount'), { target: { value: '2.1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'start cooldown' }));

    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledOnce());
    expect(mocks.writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({
      functionName: 'requestRedeem',
      args: [2_100_000_000_000_000_000_000n],
    }));
  });

  it('prevents a second cooldown request while an exit request is active', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    const cooldownEndsAtMilliseconds = Date.now() + (6 * 24 * 60 * 60 * 1_000);
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3', poolShares: '19' },
      pool: {
        apy: '—', tvl: '—', capacityPercent: 0, deposit: '19', earnings: '0', hasEarnings: false,
        availableForCooldown: '19', availableForWithdraw: '0', inCooldown: '1', cooldownEndsAtMilliseconds,
      },
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(screen.getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
    expect(within(dialog).getByRole('button', { name: 'Use full USD8-cp-wstETH balance 19' }))
      .toHaveTextContent('19 available');
    expect(within(dialog).getByText('0 available for withdraw, 1 in cooldown — ready in 6 days.')).toBeInTheDocument();
    const submit = within(dialog).getByRole('button', { name: 'start cooldown' });
    fireEvent.click(submit);

    expect(availabilityTooltip(submit)).toHaveTextContent('A cover-pool cooldown request is already active.');
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
  });

  it('shows a cooldown error next to the start cooldown button', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3.25', poolShares: '2.1' },
      pool: {
        apy: '—', tvl: '—', capacityPercent: 0, deposit: '2.1', earnings: '0', hasEarnings: false,
        availableForCooldown: '2.1', availableForWithdraw: '0', inCooldown: '0',
      },
    });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(screen.getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
    fireEvent.change(within(dialog).getByLabelText('USD8-cp-wstETH amount'), { target: { value: '0' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'start cooldown' }));

    const status = await within(dialog).findByRole('alert');
    expect(status).toHaveTextContent('Enter a USD8-cp-wstETH amount greater than zero to start cooldown.');
    expect(within(dialog).getByRole('button', { name: 'start cooldown' }).closest('.action-button-shell'))
      .toContainElement(status);
    fireEvent.change(within(dialog).getByLabelText('USD8-cp-wstETH amount'), { target: { value: '1' } });
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('withdraws a matured cover-pool exit without starting another cooldown', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchLandingChainData.mockResolvedValueOnce({
      balances: { usdc: '10', usd8: '25', savings: '0', coverAsset: '3.25', poolShares: '2.1' },
      pool: {
        apy: '—',
        tvl: '—',
        capacityPercent: 0,
        deposit: '2.1',
        earnings: '0',
        hasEarnings: false,
        shareDecimals: 21,
        availableForCooldown: '2.1',
        availableForWithdraw: '12',
        inCooldown: '0',
      },
      activeIncidentId: '0',
    });
    mocks.writeContractAsync.mockResolvedValueOnce(
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    );
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    fireEvent.click(screen.getByRole('button', { name: 'withdraw' }));
    const dialog = screen.getByRole('dialog', { name: 'Manage wstEth cover pool' });
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
      args: ['0x26f85ec30a753451d218f4dc526f696d2d805097', 1_500_000n],
    }));
    expect(mocks.writeContractAsync).toHaveBeenNthCalledWith(2, expect.objectContaining({
      chainId: 11155111,
      address: '0x26f85ec30a753451d218f4dc526f696d2d805097',
      functionName: 'mintUSD8',
      args: [1_500_000n],
      gas: 150_000n,
    }));
    expect(await screen.findByText('Mint confirmed on Sepolia.')).toBeInTheDocument();
  });

  it('redeems USD8 through the Sepolia Treasury with the quoted pro-rata minimum', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.readContract.mockResolvedValueOnce(1_000_000_000_000_000_000n);
    mocks.writeContractAsync.mockResolvedValueOnce(
      '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    );
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'redeem' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USD8 amount'), { target: { value: '1.5' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'redeem' }));

    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledOnce());
    expect(mocks.readContract).toHaveBeenCalledWith(expect.objectContaining({
      address: '0x26f85ec30a753451d218f4dc526f696d2d805097',
      functionName: 'usd8ToUsdcRate',
    }));
    expect(mocks.writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({
      chainId: 11155111,
      address: '0x26f85ec30a753451d218f4dc526f696d2d805097',
      functionName: 'redeemUSD8',
      args: [1_500_000_000_000_000_000n, 1_500_000n],
    }));
    expect(await screen.findByText('Redemption confirmed on Sepolia.')).toBeInTheDocument();
  });

  it('shows wallet transaction progress beside the submit button through confirmation', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.readContract.mockResolvedValueOnce(1_000_000_000_000_000_000n);
    const walletApproval = deferred();
    const confirmation = deferred();
    mocks.writeContractAsync.mockReturnValueOnce(walletApproval.promise);
    mocks.waitForTransactionReceipt.mockReturnValueOnce(confirmation.promise);
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'redeem' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USD8 amount'), { target: { value: '1.5' } });
    const submit = within(dialog).getByRole('button', { name: 'redeem' });
    fireEvent.click(submit);

    const status = await within(dialog).findByRole('status', { name: 'Transaction status' });
    expect(status).toHaveTextContent('Confirm the USD8 redemption in your wallet.');
    expect(status.querySelector('.usd8-dialog-status-spinner')).toBeInTheDocument();
    expect(submit.closest('.usd8-dialog-submit-row')).toContainElement(status);
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();

    walletApproval.resolve('0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc');
    await waitFor(() => expect(status).toHaveTextContent('Transaction submitted: 0xcccccccc…'));
    expect(status.querySelector('.usd8-dialog-status-spinner')).toBeInTheDocument();

    confirmation.resolve({ status: 'success' });
    await waitFor(() => expect(status).toHaveTextContent('Redemption confirmed on Sepolia.'));
    expect(screen.getByRole('dialog', { name: 'Mint or redeem USD8' })).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog', { name: 'Notice' })).not.toBeInTheDocument();
  });

  it('shows a readable cancellation message when the wallet closes without a transaction hash', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.readContract.mockResolvedValueOnce(1_000_000_000_000_000_000n);
    mocks.writeContractAsync.mockResolvedValueOnce(null);
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'redeem' }));
    const dialog = screen.getByRole('dialog', { name: 'Mint or redeem USD8' });
    fireEvent.change(within(dialog).getByLabelText('USD8 amount'), { target: { value: '1.5' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'redeem' }));

    expect(await within(dialog).findByText('Transaction cancelled in your wallet.')).toBeInTheDocument();
    expect(mocks.waitForTransactionReceipt).not.toHaveBeenCalled();
  });


  it('prepares a first claim through the TEE service and submits its authorization onchain', async () => {
    const approval = deferred();
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    mocks.readContract
      .mockResolvedValueOnce(0n)
      .mockResolvedValueOnce(10_000_000_000_000_000_000n)
      .mockResolvedValueOnce(0n)
      .mockResolvedValueOnce(0n)
      .mockResolvedValueOnce(0n);
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
    expect(within(dialog).getByRole('combobox', { name: 'Approximate incident age' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('note')).not.toBeInTheDocument();
    await waitFor(() => expect(within(dialog).getByLabelText('Insurance score to spend')).toHaveValue('128600'));
    const submit = within(dialog).getByRole('button', { name: 'file claim' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    expect(await within(dialog).findByText('Approve token in your wallet.')).toBeInTheDocument();
    approval.resolve('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');

    await waitFor(() => expect(mocks.prepareIncidentOpen).toHaveBeenCalledWith(
      '0xfdb7546dea188d52e8ee98b789da2d695da702a7',
      expect.objectContaining({
        chainId: 11155111,
        registry: '0x7d09c1e9ee03350a177c2a542e90285b55e8a218',
        defiInsurance: '0xc74439a7a3d5db8a48766a5fc2d200bd2858026d',
      }),
    ));
    await waitFor(() => expect(mocks.writeContractAsync).toHaveBeenCalledTimes(2));
    expect(mocks.writeContractAsync).toHaveBeenLastCalledWith(expect.objectContaining({
      chainId: 11155111,
      address: '0xc74439a7a3d5db8a48766a5fc2d200bd2858026d',
      functionName: 'fileClaim',
      args: [
        '0xfdb7546dea188d52e8ee98b789da2d695da702a7',
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

  it('never substitutes USD8 when the selected insured-token row is unavailable on the network', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'File claim for curve-scrvusd' }));

    const dialog = screen.getByRole('dialog', { name: 'File claim for scrvUSD' });
    expect(within(dialog).getByRole('heading', { name: 'File a Claim for scrvUSD' })).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Insured scrvUSD amount')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'file claim' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('scrvUSD is not enabled for claims on Sepolia.');
  });

  it('omits rough incident timing for later claims in an active incident', async () => {
    mocks.account.address = '0x0000000000000000000000000000000000000001';
    mocks.account.isConnected = true;
    mocks.fetchInsuranceScore.mockResolvedValue({ availableScore: '128600' });
    mocks.fetchLandingChainData.mockResolvedValue({
      balances: { usdc: '10', usd8: '25', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0' },
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false },
      activeIncidentId: '7',
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
      pool: { apy: '—', tvl: '—', capacityPercent: 0, deposit: '0', earnings: '0', hasEarnings: false },
      activeIncidentId: '7',
    });
    mocks.readContract
      .mockResolvedValueOnce(7n)
      .mockResolvedValueOnce(10_000_000_000_000_000_000n);
    render(<App />);

    await waitFor(() => expect(mocks.fetchLandingChainData).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'File claim for usd8' }));
    const dialog = screen.getByRole('dialog', { name: 'File claim for USD8' });
    await waitFor(() => expect(within(dialog).getByLabelText('Insurance score to spend')).toHaveValue('128600'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'file claim' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Insufficient USD8 balance for the insured amount and claim bond.',
    );
    expect(mocks.writeContractAsync).not.toHaveBeenCalled();
    expect(mocks.prepareIncidentOpen).not.toHaveBeenCalled();
  });
});
