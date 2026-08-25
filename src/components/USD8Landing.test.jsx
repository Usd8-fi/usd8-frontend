import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import coverWsteth from '../assets/cover-wsteth.png';
import sUsd8Logo from '../assets/sUSD8.svg';
import USD8Landing from './USD8Landing.jsx';

const wallet = {
  address: '',
  connected: false,
  connecting: false,
  onConnect: vi.fn(),
  onDisconnect: vi.fn(),
};

afterEach(() => {
  vi.useRealTimers();
  window.localStorage.clear();
});

function availabilityTooltip(button) {
  return document.getElementById(button.getAttribute('aria-describedby'));
}

describe('USD8 landing navigation', () => {
  it('shows the connected network beside the shortened wallet address', () => {
    render(
      <USD8Landing
        wallet={{
          ...wallet,
          address: '0x1234567890abcdef1234567890abcdef12345678',
          connected: true,
          networkName: 'Sepolia',
        }}
      />,
    );

    expect(screen.getByRole('button', { name: /disconnect wallet/i })).toHaveTextContent('0x1234...5678 Sepolia');
  });

  it('shows the USD8.fi header wordmark and the shared footer links', () => {
    render(<USD8Landing wallet={wallet} />);

    expect(within(screen.getByRole('link', { name: 'USD8 home' })).getByText('USD8.fi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'beta' })).toHaveAttribute(
      'href',
      './docs/faqs.html#whats-different-in-beta',
    );

    const footer = screen.getByRole('contentinfo');
    const footerNav = within(footer).getByRole('navigation', { name: 'Footer' });
    for (const label of [
      'Docs',
      'Github',
      'Telegram',
      'X.com',
      'DeFi Insurance',
      'Cover Pools',
      'FAQs',
      'Transparency',
      'Contacts',
      'Legal',
    ]) {
      expect(within(footerNav).getByRole('link', { name: label })).toBeInTheDocument();
    }
    expect(within(footerNav).getByText('Audit Report')).toBeInTheDocument();
    expect(within(footerNav).queryByRole('link', { name: 'Audit Report' })).not.toBeInTheDocument();
    expect(within(footerNav).queryByRole('link', { name: 'Risk disclaimer' })).not.toBeInTheDocument();
    expect(within(footerNav).getByRole('link', { name: 'Docs' })).toHaveAttribute('href', './docs/');
    expect(within(footerNav).getByRole('link', { name: 'Github' })).toHaveAttribute('href', 'https://github.com/Usd8-fi/usd8-core');
    expect(within(footerNav).getByRole('link', { name: 'Telegram' })).toHaveAttribute('href', 'https://t.me/+e84i2oYk1ao1MTk1');
    expect(within(footerNav).getByRole('link', { name: 'X.com' })).toHaveAttribute('href', 'https://x.com/usd8_fi');
    expect(within(footerNav).getByRole('link', { name: 'DeFi Insurance' })).toHaveAttribute(
      'href',
      './docs/defi-insurance.html',
    );
    expect(within(footerNav).getByRole('link', { name: 'Cover Pools' })).toHaveAttribute(
      'href',
      './docs/cover-pools.html',
    );
    expect(within(footerNav).getByRole('link', { name: 'FAQs' })).toHaveAttribute('href', './docs/faqs.html');
    expect(within(footerNav).getByRole('link', { name: 'Transparency' })).toHaveAttribute(
      'href',
      './docs/transparency.html',
    );
    expect(within(footerNav).getByRole('link', { name: 'Contacts' })).toHaveAttribute(
      'href',
      './docs/usd8.html#contact',
    );
    expect(within(footerNav).getByRole('link', { name: 'Legal' })).toHaveAttribute(
      'href',
      './docs/legal.html',
    );
    expect(within(footerNav).getByRole('link', { name: 'Transparency' }).compareDocumentPosition(
      within(footerNav).getByRole('link', { name: 'Contacts' }),
    ) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(footerNav).getByRole('link', { name: 'Contacts' }).compareDocumentPosition(
      within(footerNav).getByRole('link', { name: 'Legal' }),
    ) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('defaults to Defi Insurance and exposes only the two product links', () => {
    render(<USD8Landing wallet={wallet} />);

    const nav = screen.getByRole('navigation', { name: 'USD8 products' });
    const tabs = within(nav).getAllByRole('button');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent('Defi Insurance');
    expect(tabs[0]).toHaveAttribute('aria-current', 'page');
    expect(tabs[1]).toHaveTextContent('Cover Pools');
    expect(screen.getByRole('heading', { name: 'Defi Insurance' })).toBeInTheDocument();
  });

  it('advances cover-pool earnings locally until the reward period ends', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(20_000));
    render(
      <USD8Landing
        wallet={{ ...wallet, connected: true }}
        pool={{
          earnings: '1',
          earningsExact: '1',
          earningsPerSecond: '0.00002',
          earningsSnapshotTimestampMilliseconds: 20_000,
          earningsPeriodFinishMilliseconds: 22_000,
          hasEarnings: true,
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    const earnings = screen.getByText('Your Earnings').nextElementSibling;
    expect(earnings).toHaveTextContent('1.00000 USD8');

    act(() => vi.advanceTimersByTime(1_000));
    expect(earnings).toHaveTextContent('1.00002 USD8');

    act(() => vi.advanceTimersByTime(2_000));
    expect(earnings).toHaveTextContent('1.00004 USD8');
  });

  it('switches to the cover-pool design without navigating away', () => {
    render(<USD8Landing wallet={wallet} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));

    expect(screen.getByRole('heading', { name: 'Cover Pools' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'risk involved' })).toHaveAttribute('href', './docs/cover-pools.html');
    expect(screen.getByText('wstEth Cover Pool')).toBeInTheDocument();
  });

  it('restores the selected product after a refresh', () => {
    const { unmount } = render(<USD8Landing wallet={wallet} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    expect(window.localStorage.getItem('usd8-active-product')).toBe('pools');

    unmount();
    render(<USD8Landing wallet={wallet} />);

    expect(screen.getByRole('heading', { name: 'Cover Pools' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cover Pools' })).toHaveAttribute('aria-current', 'page');
  });

  it('uses the wstETH artwork on the cover-pool card', () => {
    render(<USD8Landing wallet={wallet} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));

    const poolCard = screen.getByRole('heading', { name: 'wstEth Cover Pool' }).closest('section');
    expect(poolCard.querySelector('img')).toHaveAttribute('src', coverWsteth);
  });

  it('uses the wide cover-pool layout with capacity beside the headline metrics', () => {
    render(<USD8Landing wallet={wallet} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));

    const poolCard = screen.getByRole('heading', { name: 'wstEth Cover Pool' }).closest('section');
    const overview = poolCard.querySelector('.cover-pool-overview');
    expect(overview).not.toBeNull();
    expect(overview.children[0]).toHaveClass('cover-pool-metrics');
    expect(overview.children[1]).toHaveClass('cover-pool-capacity-metric');
    expect(poolCard.querySelector('.cover-pool-actions').children).toHaveLength(3);
  });

  it('keeps wallet actions clickable and explains blockers beside each clicked action', () => {
    const onUsd8Action = vi.fn();
    const onFileClaim = vi.fn();
    const onPoolAction = vi.fn();
    render(
      <USD8Landing
        wallet={wallet}
        onUsd8Action={onUsd8Action}
        onFileClaim={onFileClaim}
        onPoolAction={onPoolAction}
      />,
    );

    const mint = screen.getByRole('button', { name: 'mint' });
    const redeem = screen.getByRole('button', { name: 'redeem' });
    const claimButtons = screen.getAllByRole('button', { name: /file claim/i });
    for (const button of [mint, redeem, ...claimButtons]) {
      expect(button).toBeEnabled();
      fireEvent.click(button);
      expect(availabilityTooltip(button)).toHaveTextContent('Please connect your wallet first.');
    }

    expect(onUsd8Action).not.toHaveBeenCalled();
    expect(onFileClaim).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    expect(screen.queryByRole('button', { name: 'start cooldown' })).not.toBeInTheDocument();
    for (const action of ['deposit', 'withdraw', 'withdraw earnings']) {
      const button = screen.getByRole('button', { name: action });
      expect(button).toBeEnabled();
      fireEvent.click(button);
      expect(availabilityTooltip(button)).toHaveTextContent('Please connect your wallet first.');
    }
    expect(onPoolAction).not.toHaveBeenCalled();
  });

  it('shows zero for disconnected wallet scores', () => {
    render(<USD8Landing wallet={wallet} />);

    for (const label of screen.getAllByText('Score earned')) {
      expect(label.nextElementSibling).toHaveTextContent('0');
    }
  });

  it('shows the front-page USD8 balance as a static whole number', () => {
    render(
      <USD8Landing
        wallet={{ ...wallet, connected: true }}
        balances={{ usd8: '1,234.5678', savings: '0' }}
      />,
    );

    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    expect(within(usd8Card).getByText('Your Balance').nextElementSibling).toHaveTextContent('1,235');
    expect(within(usd8Card).getByText('Your Balance').nextElementSibling).not.toHaveTextContent('1,234.5678');
  });

  it('floors scores to one decimal and groups thousands without abbreviating them', () => {
    render(
      <USD8Landing
        wallet={{ ...wallet, connected: true }}
        score={{
          grossEarnedScore: '7123.99',
          availableScore: '7123456.99',
          usd8Score: '7123.699',
          sUsd8Score: '1234567.899',
        }}
      />,
    );

    expect(screen.getByText('Total Insurance Score').parentElement).toHaveTextContent('7,123.9');
    expect(screen.getByText('Available Score').parentElement).toHaveTextContent('7,123,456.9');
    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    const savingsCard = screen.getByRole('heading', { name: 'sUSD8 Savings USD8 (Morpho)' }).closest('article');
    expect(within(usd8Card).getByText('Score earned').nextElementSibling).toHaveTextContent('7,123.6');
    expect(within(savingsCard).getByText('Score earned').nextElementSibling).toHaveTextContent('1,234,567.8');
  });

  it('advances total, available, USD8, and sUSD8 score locally every second', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(20_000));
    render(
      <USD8Landing
        wallet={{ ...wallet, connected: true }}
        score={{
          snapshotTimestamp: 20,
          grossEarnedScore: '128600',
          grossScorePerSecond: '0.2',
          availableScore: '96400',
          maturingScorePerSecond: '0.1',
          usd8Score: '84200',
          usd8ScorePerSecond: '0.1',
          sUsd8Score: '44400',
          sUsd8ScorePerSecond: '0.1',
        }}
      />,
    );

    const total = screen.getByText('Total Insurance Score').parentElement;
    const available = screen.getByText('Available Score').parentElement;
    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    const savingsCard = screen.getByRole('heading', { name: 'sUSD8 Savings USD8 (Morpho)' }).closest('article');
    expect(total).toHaveTextContent('128,600.0');
    expect(available).toHaveTextContent('96,400.0');
    expect(within(usd8Card).getByText('Score earned').nextElementSibling).toHaveTextContent('84,200.0');
    expect(within(savingsCard).getByText('Score earned').nextElementSibling).toHaveTextContent('44,400.0');

    act(() => vi.advanceTimersByTime(1_000));

    expect(total).toHaveTextContent('128,600.2');
    expect(available).toHaveTextContent('96,400.1');
    expect(within(usd8Card).getByText('Score earned').nextElementSibling).toHaveTextContent('84,200.1');
    expect(within(savingsCard).getByText('Score earned').nextElementSibling).toHaveTextContent('44,400.1');
  });


  it('adds only enough decimals for each score to visibly advance every second', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(20_000));
    render(
      <USD8Landing
        wallet={{ ...wallet, connected: true }}
        score={{
          snapshotTimestamp: 20,
          grossEarnedScore: '12.9',
          grossScorePerSecond: '0.000231481481481481',
          availableScore: '12.9',
          maturingScorePerSecond: '0.023148148148148148',
          usd8Score: '12.9',
          usd8ScorePerSecond: '0.1',
          sUsd8Score: '12.9',
          sUsd8ScorePerSecond: '0',
        }}
        scoreStatus="ready"
        balances={{ usd8: '20', savings: '0' }}
        savingsVault={{ apy: '3.24%' }}
      />,
    );

    const total = screen.getByText('Total Insurance Score').parentElement;
    const available = screen.getByText('Available Score').parentElement;
    const usd8Card = screen.getByRole('heading', { name: 'USD8' }).closest('article');
    const savingsCard = screen.getByRole('heading', { name: 'sUSD8 Savings USD8 (Morpho)' }).closest('article');
    expect(total).toHaveTextContent('12.9000');
    expect(available).toHaveTextContent('12.90');
    expect(within(usd8Card).getByText('Score earned').nextElementSibling).toHaveTextContent('12.9');
    expect(within(savingsCard).getByText('Score earned').nextElementSibling).toHaveTextContent('12.9');

    act(() => vi.advanceTimersByTime(1_000));

    expect(total).toHaveTextContent('12.9002');
    expect(available).toHaveTextContent('12.92');
    expect(within(usd8Card).getByText('Score earned').nextElementSibling).toHaveTextContent('13.0');
  });

  it('explains score and pool metrics with question-mark tooltips', () => {
    render(<USD8Landing wallet={wallet} />);

    expect(screen.getByRole('button', { name: 'About total insurance score' })).toHaveTextContent('?');
    const scoreRateHelp = screen.getAllByRole('button', { name: 'About score rate' });
    expect(scoreRateHelp).toHaveLength(2);
    expect(scoreRateHelp[0].closest('dd')).toHaveTextContent('1 per USD8 per day');
    expect(scoreRateHelp[1].closest('dd')).toHaveTextContent('0.1 per sUSD8 per day');
    expect(screen.getByRole('tooltip', {
      name: 'You get 1 score per day for every USD8 you hold. Rewarded every block.',
    })).toBeInTheDocument();
    expect(screen.getByRole('tooltip', {
      name: 'You get 0.1 score per day for every sUSD8 you hold. Rewarded every block.',
    })).toBeInTheDocument();
    expect(screen.getByRole('tooltip', {
      name: 'Your total insurance score earned across all holdings. Score updates may be delayed by around 13–19 minutes while Ethereum blocks finalize.',
    })).toBeInTheDocument();
    expect(screen.getByRole('tooltip', { name: /score becomes available to use after seven days, minus any score already spent on claims/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'About coverage limits' })).toHaveLength(2);
    expect(screen.getAllByRole('tooltip', { name: /subject to the amount available in the cover pools/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'About available score' })).toHaveTextContent('?');

    fireEvent.click(screen.getByRole('button', { name: 'Cover Pools' }));
    expect(screen.getByRole('button', { name: 'About 30-day earnings APR' })).toHaveTextContent('?');
    expect(screen.getByRole('tooltip', {
      name: 'USD8 earnings accrued over the past 30 days, annualized against average pool value. Earnings represented by this APR are delivered in USD8.',
    })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About your earnings' })).toHaveTextContent('?');
    expect(screen.getByRole('tooltip', {
      name: 'Earnings are paid in USD8, not wstETH. Earnings are not exposed to insurance claims and can be withdrawn at any time.',
    })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About capacity filled' })).toHaveTextContent('?');
  });
});

describe('Free insurance table', () => {
  it('shows max coverage as 80% and explains the payout limits', () => {
    render(<USD8Landing wallet={wallet} />);

    const table = screen.getByRole('table', { name: 'Insured tokens' });
    expect(screen.getByRole('button', { name: 'About insured token' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About max coverage' })).toBeInTheDocument();
    expect(screen.getByText(/asset eligible for a claim after a covered loss incident/i)).toBeInTheDocument();
    expect(within(table).getAllByText('80%')).toHaveLength(6);
    const testTokenRow = within(table).getByRole('button', { name: 'File claim for test-msloss' }).closest('tr');
    expect(testTokenRow).toHaveTextContent('Sepolia Test LossmsLOSS');
    expect(testTokenRow.querySelector('.table-token-icon')).toHaveAttribute('src');
    expect(screen.getByText(/maximum reimbursement possible: 80% of the insured token's underlying value/i)).toBeInTheDocument();
    expect(screen.getByText(/actual payout depends on the user's insurance score and cover pool limits/i)).toBeInTheDocument();
  });

  it('uses the insured-token sUSD8 artwork for the savings vault card', () => {
    render(<USD8Landing wallet={wallet} />);

    const savingsCard = screen.getByRole('heading', { name: 'sUSD8 Savings USD8 (Morpho)' }).closest('article');
    expect(savingsCard.querySelector('img')).toHaveAttribute('src', sUsd8Logo);
  });

  it('shows the connected wallet savings balance and Morpho APY on the savings card', () => {
    render(
      <USD8Landing
        wallet={{ ...wallet, connected: true }}
        balances={{ savings: '42.5', savingsAssets: '45.25' }}
        savingsVault={{ balance: '$76.94M', apy: '3.24%' }}
      />,
    );

    const savingsCard = screen.getByRole('heading', { name: 'sUSD8 Savings USD8 (Morpho)' }).closest('article');
    expect(within(savingsCard).getByText('Your Deposit (USD8)')).toBeInTheDocument();
    expect(within(savingsCard).getByText('45')).toBeInTheDocument();
    expect(within(savingsCard).queryByText('42.5')).not.toBeInTheDocument();
    expect(within(savingsCard).queryByText('$76.94M')).not.toBeInTheDocument();
    expect(within(savingsCard).queryByText(/USDC/)).not.toBeInTheDocument();
    expect(within(savingsCard).getByText('3.24%')).toBeInTheDocument();
    expect(within(savingsCard).getByRole('link', { name: 'Go to Morpho' })).toHaveAttribute(
      'href',
      'https://app.morpho.org/ethereum/vault/0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
    );
    expect(within(savingsCard).queryByRole('button', { name: 'deposit' })).not.toBeInTheDocument();
    expect(within(savingsCard).queryByRole('button', { name: 'withdraw' })).not.toBeInTheDocument();
  });

  it('reuses the insured-token rows without exposing contract addresses', () => {
    render(<USD8Landing wallet={wallet} />);

    const table = screen.getByRole('table', { name: 'Insured tokens' });
    expect(within(table).getByText('Max Coverage')).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Claim' })).toBeInTheDocument();
    expect(within(table).getAllByRole('button', { name: /file claim/i }).length).toBeGreaterThan(0);
    expect(within(table).queryByText('Address')).not.toBeInTheDocument();
    expect(within(table).queryByText(/0x[a-f0-9]{40}/i)).not.toBeInTheDocument();
  });

  it('shows the active token claim phase and live days remaining on its action', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-01-15T00:00:00Z'));
    const now = Date.now();

    render(
      <USD8Landing
        wallet={{ ...wallet, connected: true }}
        incident={{
          tokenId: 'test-msloss',
          phaseDeadlineMilliseconds: now + (2 * 24 + 23) * 60 * 60 * 1_000,
          phaseWindowMilliseconds: 3 * 24 * 60 * 60 * 1_000,
          root: `0x${'00'.repeat(32)}`,
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Claim Open (2d 23h left) for test-msloss' }))
      .toHaveTextContent('Claim Open (2d 23h left)');
    expect(screen.getAllByRole('button', { name: /file claim for/i })).toHaveLength(5);
    expect(screen.getAllByRole('button', { name: /file claim for/i }).every((button) => button.textContent === 'File Claim')).toBe(true);
    expect(screen.getByRole('button', { name: 'Claim Open (2d 23h left) for test-msloss' }))
      .toHaveClass('dashboard-table-action-button--claim-status');
  });

  it('moves the active token action through settlement and payout phases', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-01-15T00:00:00Z'));
    const now = Date.now();
    const common = {
      tokenId: 'test-msloss',
      phaseWindowMilliseconds: 3 * 24 * 60 * 60 * 1_000,
    };
    const { rerender } = render(
      <USD8Landing
        wallet={{ ...wallet, connected: true }}
        incident={{
          ...common,
          phaseDeadlineMilliseconds: now - 24 * 60 * 60 * 1_000,
          root: `0x${'00'.repeat(32)}`,
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Settle Claims (2d 0h left) for test-msloss' })).toBeInTheDocument();

    rerender(
      <USD8Landing
        wallet={{ ...wallet, connected: true }}
        incident={{
          ...common,
          phaseDeadlineMilliseconds: now - 24 * 60 * 60 * 1_000,
          root: `0x${'11'.repeat(32)}`,
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Finalise Payout (2d 0h left) for test-msloss' })).toBeInTheDocument();
  });

  it('omits Lido stETH from the insured-token list', () => {
    render(<USD8Landing wallet={wallet} />);

    const table = screen.getByRole('table', { name: 'Insured tokens' });
    expect(within(table).queryByText('Lido stETH')).not.toBeInTheDocument();
  });
});
