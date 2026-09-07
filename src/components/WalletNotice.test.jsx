import { useDialogFocus } from './useDialogFocus.js';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AvailabilityAction, { CONNECT_WALLET_REASON } from './AvailabilityAction.jsx';
import WalletNoticeProvider, { NoticeMessage } from './WalletNotice.jsx';

function Example({ wallet, onAction }) {
  return <WalletNoticeProvider wallet={wallet}>
    <AvailabilityAction unavailableReason={wallet.connected ? '' : CONNECT_WALLET_REASON} onClick={onAction}>Mint</AvailabilityAction>
    <AvailabilityAction unavailableReason={wallet.connected ? '' : CONNECT_WALLET_REASON} onClick={onAction}>Deposit</AvailabilityAction>
  </WalletNoticeProvider>;
}

describe('shared wallet notice', () => {
  it('reuses one toast outside the layout and connects without performing the blocked action', () => {
    const connect = vi.fn();
    const action = vi.fn();
    render(<Example wallet={{ onConnect: connect }} onAction={action} />);
    const mint = screen.getByRole('button', { name: 'Mint' });
    fireEvent.click(mint);
    const notice = screen.getByRole('alert', { name: 'Wallet connection required' });
    expect(notice.parentElement).toBe(document.body);
    expect(mint.closest('.action-button-shell')).not.toContainElement(notice);
    fireEvent.click(screen.getByRole('button', { name: 'Deposit' }));
    expect(screen.getAllByRole('alert')).toEqual([notice]);
    expect(document.querySelector('.action-validation-warning')).toBeNull();
    fireEvent.click(within(notice).getByRole('button', { name: 'Connect wallet' }));
    expect(connect).toHaveBeenCalledTimes(1);
    expect(action).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('supports dismissal and returns keyboard focus to the most recent action', () => {
    render(<Example wallet={{ onConnect: vi.fn() }} />);
    const mint = screen.getByRole('button', { name: 'Mint' });
    mint.focus();
    fireEvent.click(mint);
    expect(mint).toHaveFocus();
    const dismiss = screen.getByRole('button', { name: 'Dismiss wallet notice' });
    dismiss.focus();
    fireEvent.click(dismiss);
    expect(mint).toHaveFocus();
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.click(mint);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('clears on connection and stays dismissed if the wallet later disconnects', () => {
    const onAction = vi.fn();
    const { rerender } = render(<Example wallet={{ connected: false }} onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mint' }));
    rerender(<Example wallet={{ connected: true }} onAction={onAction} />);
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mint' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    rerender(<Example wallet={{ connected: false }} onAction={onAction} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('explains unavailable wallet configuration instead of offering a dead connection button', () => {
    render(<Example wallet={{ onConnect: vi.fn(), connectUnavailableReason: 'Wallet connection is unavailable.' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mint' }));
    const notice = screen.getByRole('alert');
    expect(notice).toHaveTextContent('Wallet connection is unavailable.');
    expect(within(notice).getByRole('button', { name: 'Connect wallet' })).toBeDisabled();
  });
});

describe('unified notifications', () => {
  it('shows one message at a time, removes resolved errors, and does not reopen dismissed messages on rerender', () => {
    const retry = vi.fn();
    const ExampleNotices = ({ error = 'Score unavailable.', success = '' }) => <WalletNoticeProvider wallet={{ connected: true }}>
      <NoticeMessage message={error} actionLabel="Retry score" onAction={() => retry()} />
      <NoticeMessage message={success} tone="status" label="Transaction status" />
    </WalletNoticeProvider>;
    const { rerender } = render(<ExampleNotices />);
    expect(screen.getByRole('alert')).toHaveTextContent('Score unavailable.');
    rerender(<ExampleNotices success="Transaction confirmed." />);
    expect(document.querySelectorAll('.wallet-notice')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Transaction confirmed.');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Score unavailable.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry score' }));
    expect(retry).toHaveBeenCalledTimes(1);
    rerender(<ExampleNotices success="Transaction confirmed." />);
    expect(document.querySelector('.wallet-notice')).toBeNull();
    rerender(<ExampleNotices error="" success="Another transaction confirmed." />);
    expect(screen.getByRole('status')).toHaveTextContent('Another transaction confirmed.');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('lets a dismissed validation warning be shown again for the same action', () => {
    render(<WalletNoticeProvider wallet={{ connected: true }}>
      <AvailabilityAction unavailableReason="Amount exceeds balance.">Submit</AvailabilityAction>
    </WalletNoticeProvider>);
    const submit = screen.getByRole('button', { name: 'Submit' });
    submit.focus();
    fireEvent.click(submit);
    const dismiss = screen.getByRole('button', { name: 'Dismiss notification' });
    dismiss.focus();
    fireEvent.click(dismiss);
    expect(submit).toHaveFocus();
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.click(submit);
    expect(screen.getByRole('alert')).toHaveTextContent('Amount exceeds balance.');
  });

  it('keeps toast controls reachable in a modal and preserves the message when the modal closes', async () => {
    const close = vi.fn();
    function Dialog() {
      const ref = useDialogFocus(close);
      return <section ref={ref} role="dialog" aria-modal="true" aria-label="Example dialog"><button>Submit</button></section>;
    }
    function ExampleModal({ open = true }) {
      return <WalletNoticeProvider wallet={{ connected: true }}>
        {open ? <Dialog /> : null}
        <NoticeMessage message="Transaction confirmed." tone="status" />
      </WalletNoticeProvider>;
    }
    const { rerender } = render(<ExampleModal />);
    const toast = screen.getByRole('status');
    expect(screen.getByRole('dialog')).toContainElement(toast);
    const dismiss = screen.getByRole('button', { name: 'Dismiss notification' });
    dismiss.focus();
    expect(dismiss).toHaveFocus();
    rerender(<ExampleModal open={false} />);
    await waitFor(() => expect(screen.getByRole('status').parentElement).toBe(document.body));
    rerender(<ExampleModal />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
  });
});
