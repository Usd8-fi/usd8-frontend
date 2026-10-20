import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const fetchExitRequestedAt = vi.fn();
vi.mock('../lib/exitRequest.js', async (importOriginal) => ({ ...(await importOriginal()), fetchExitRequestedAt: (...args) => fetchExitRequestedAt(...args) }));
const { ExitProgress } = await import('./TransactionDialogs.jsx');

const DAY = 86_400_000;
const base = { poolAddress: '0xpool', account: '0xabc', assetSymbol: 'wstETH', inCooldownAssets: '1.5', readyAssets: '0' };

describe('exit progress bar', () => {
  it('shows elapsed cooldown and the amount in cooldown', async () => {
    const now = 1_800_000_000_000;
    fetchExitRequestedAt.mockResolvedValueOnce(now - 4 * DAY);
    render(<ExitProgress {...base} cooldownEndsAtMilliseconds={now + 6 * DAY} cooldownTiming="ready in 6 days" nowMilliseconds={now} />);
    const bar = await screen.findByRole('progressbar', { name: 'Withdrawal cooldown progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar.style.getPropertyValue('--exit-progress')).toBe('40%');
    expect(screen.getByText('Cooldown progress')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(fetchExitRequestedAt).toHaveBeenCalledWith(expect.objectContaining({ poolAddress: '0xpool', account: '0xabc', cooldownEndsAtMilliseconds: now + 6 * DAY }));
  });

  it('shows a full green bar with the amount ready to withdraw', () => {
    render(<ExitProgress {...base} readyAssets="2" ready cooldownEndsAtMilliseconds={1} nowMilliseconds={2} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar).toHaveClass('usd8-dialog-exit-progress-bar--ready');
    expect(screen.getByText('Ready to withdraw')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('says when a completed cooldown waits for claims', () => {
    render(<ExitProgress {...base} readyAssets="1.5" waitingForClaims cooldownEndsAtMilliseconds={1} nowMilliseconds={2} />);
    expect(screen.getByText('Cooldown complete, waiting for claims to finalize')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders nothing without an exit, or while the cooldown start is unknown', async () => {
    const { container, rerender } = render(<ExitProgress {...base} cooldownEndsAtMilliseconds={0} nowMilliseconds={1} />);
    expect(container).toBeEmptyDOMElement();
    fetchExitRequestedAt.mockResolvedValueOnce(null);
    rerender(<ExitProgress {...base} cooldownEndsAtMilliseconds={5 * DAY} nowMilliseconds={DAY} />);
    await waitFor(() => expect(fetchExitRequestedAt).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
