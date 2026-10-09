import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PublicApp from './PublicApp.jsx';
import { queryClient } from './lib/dataCache.js';
import { RPC_READ_ERROR } from './lib/readErrorMessage.js';
import { TimeoutError } from 'viem';

const mocks = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock('./lib/chainData.js', () => ({
  fetchLandingChainData: mocks.read,
  fetchLandingAnalytics: vi.fn().mockResolvedValue({ pools: [] }),
}));
vi.mock('./lib/morphoApi.js', async (importOriginal) => ({ ...(await importOriginal()), fetchMorphoVault: vi.fn().mockResolvedValue({}) }));
vi.mock('./lib/foregroundRefresh.js', () => ({ onForegroundRefresh: () => () => {} }));

beforeEach(() => { queryClient.clear(); mocks.read.mockReset(); });
afterEach(() => queryClient.clear());

const snapshot = errors => ({ updatedAt: Date.now(), pools: [], insurance: { tokens: {} }, resourceErrors: errors });

describe('public RPC failure notice', () => {
  it('shows the RPC warning again when a top-level request times out after Retry Data', async () => {
    mocks.read.mockRejectedValue(new TimeoutError({ url: 'https://rpc.example' }));
    render(<PublicApp />);
    expect(await screen.findByText(RPC_READ_ERROR)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry Data' }));
    await waitFor(() => expect(mocks.read).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(RPC_READ_ERROR)).toBeInTheDocument();
  });
  it('shows an explicit RPC warning for partial read failures and clears it after a successful Retry Data', async () => {
    mocks.read.mockResolvedValueOnce(snapshot({ 'pool:wsteth': RPC_READ_ERROR }))
      .mockResolvedValueOnce(snapshot({ 'pool:wsteth': RPC_READ_ERROR }))
      .mockResolvedValueOnce({ ...snapshot({}), insurance: { tokens: { usd8: { enabled: true, maxCoverageBps: '8000' } } } });
    render(<PublicApp />);
    expect(await screen.findByText(RPC_READ_ERROR)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry Data' }));
    await waitFor(() => expect(mocks.read).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(RPC_READ_ERROR)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry Data' }));
    expect(await screen.findByRole('button', { name: 'File claim for usd8' })).toBeInTheDocument();
    expect(screen.queryByText(RPC_READ_ERROR)).not.toBeInTheDocument();
    expect(mocks.read).toHaveBeenCalledTimes(3);
  });
});
