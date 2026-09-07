import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ prepare: vi.fn() }));
vi.mock('./PublicApp.jsx', () => ({ default: ({ onConnect, connectError }) => <><button onClick={onConnect}>Connect</button><p>{connectError}</p></> }));
vi.mock('./WalletApp.jsx', () => ({ prepareWallet: mocks.prepare, default: () => <p>Wallet ready</p> }));
import Root from './Root.jsx';
beforeEach(() => { localStorage.clear(); mocks.prepare.mockReset(); });
describe('wallet startup', () => {
  it('shows the public app first and initializes the wallet only on connect', async () => {
    render(<Root />);
    expect(mocks.prepare).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));
    expect(await screen.findByText('Wallet ready')).toBeInTheDocument();
    expect(mocks.prepare).toHaveBeenCalledTimes(1);
  });
  it('keeps the public app usable if the wallet configuration is missing', async () => {
    mocks.prepare.mockImplementation(() => { throw new Error('Wallet is not configured'); });
    render(<Root />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));
    expect(await screen.findByText('Wallet is not configured')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
  });
  it('restores an existing session after painting the public app', async () => {
    localStorage.setItem('wagmi.store', JSON.stringify({ state: { current: 'saved-connector' } }));
    render(<Root />);
    expect(mocks.prepare).not.toHaveBeenCalled();
    await waitFor(() => expect(mocks.prepare).toHaveBeenCalledTimes(1));
  });
});
