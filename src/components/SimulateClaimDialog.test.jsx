import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SimulateClaimDialog from './SimulateClaimDialog.jsx';

vi.mock('../lib/chainData.js', () => ({ readClientFor: () => ({}) }));
vi.mock('../lib/viemLite.js', async (importOriginal) => ({
  ...(await importOriginal()),
  readContract: vi.fn(() => Promise.reject(new Error('offline'))),
}));

const WAD = 10n ** 18n;

describe('SimulateClaimDialog', () => {
  it('estimates payout from claimed value and score weight only', () => {
    render(
      <SimulateClaimDialog
        onClose={() => {}}
        insuredTokens={[{ id: 'test-msloss', symbol: 'msLOSS', maxCoverageBps: 8000 }]}
        pools={[{ id: 'wsteth', symbol: 'wstETH', balance: 10n * WAD, price: 400_000_000_000n, priceDecimals: 8, assetDecimals: 18 }]}
      />,
    );
    // Defaults: $2,000 loss, 85% weight. $40k pool -> $16k budget; 85% = $13,600,
    // capped at 80% of $2,000 = $1,600 (0.4 wstETH).
    expect(screen.getByLabelText('Loss Value (USD)')).toHaveValue('2000');
    expect(screen.getByLabelText('Your Score Weight')).toHaveValue('85');
    expect(screen.getByText('$16,000.00')).toBeTruthy();
    expect(screen.getAllByText('$1,600.00').length).toBeGreaterThan(0);
    expect(screen.getByText('0.4 wstETH')).toBeTruthy();

    // $10k loss at 20% weight = $3,200 (cap $8,000).
    fireEvent.change(screen.getByLabelText('Loss Value (USD)'), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText('Your Score Weight'), { target: { value: '20' } });
    expect(screen.getAllByText('$3,200.00').length).toBeGreaterThan(0);
    expect(screen.getByText('0.8 wstETH')).toBeTruthy();
    expect(screen.queryByText('Cover Pool Value')).toBeNull();
    expect(screen.queryByLabelText('Boosters')).toBeNull();

    fireEvent.change(screen.getByLabelText('Your Score Weight'), { target: { value: '100' } });
    expect(screen.getAllByText('$8,000.00').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Limited by/)).toBeNull();
    expect(screen.getByText('Cover Pool Budget')).toBeTruthy();
    expect(screen.getByText('B. Loss Cap (80%)')).toBeTruthy();
    expect(screen.getByLabelText('Loss Value (USD)')).toBeTruthy();
  });

  it('switches the insured token, applies its coverage and excludes its circular cover pool', () => {
    const msLoss = '0x00000000000000000000000000000000000000aa';
    render(
      <SimulateClaimDialog
        onClose={() => {}}
        insuredTokens={[
          { id: 'usd8', symbol: 'USD8', address: '0x00000000000000000000000000000000000000cc', maxCoverageBps: 8000 },
          { id: 'test-msloss', symbol: 'msLOSS', address: msLoss, maxCoverageBps: 5000 },
        ]}
        pools={[
          { id: 'wsteth', symbol: 'wstETH', asset: '0x00000000000000000000000000000000000000bb', balance: 10n * WAD, price: 400_000_000_000n, priceDecimals: 8, assetDecimals: 18 },
          { id: 'msloss', symbol: 'msLOSS', asset: msLoss, balance: 40_000n * WAD, price: 100_000_000n, priceDecimals: 8, assetDecimals: 18 },
        ]}
      />,
    );
    const select = screen.getByLabelText('Insured Token');
    expect(select).toHaveValue('usd8');
    expect([...select.options].map((option) => option.textContent)).toEqual(['USD8', 'msLOSS']);
    // USD8: both pools count ($80k) -> $32k claimant budget.
    expect(screen.getByText('$32,000.00')).toBeTruthy();
    expect(screen.queryByText('Excluded')).toBeNull();

    fireEvent.change(select, { target: { value: 'test-msloss' } });
    // msLOSS: its own pool is excluded -> $40k -> $16k budget; cap 50% of $2,000 = $1,000.
    expect(screen.getByText('$16,000.00')).toBeTruthy();
    expect(screen.getByText('B. Loss Cap (50%)')).toBeTruthy();
    expect(screen.getAllByText('$1,000.00').length).toBeGreaterThan(0);
    expect(screen.getByText('0.25 wstETH')).toBeTruthy();
    expect(screen.getByText('Excluded')).toBeTruthy();
    expect(screen.queryByText(/holds msLOSS itself/)).toBeNull();
    // The loss value and score weight are unchanged by the switch.
    expect(screen.getByLabelText('Loss Value (USD)')).toHaveValue('2000');
    expect(screen.getByLabelText('Your Score Weight')).toHaveValue('85');
  });
});
