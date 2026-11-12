import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CoveredProtocolsTable from './CoveredProtocolsTable.jsx';
import { getProtocolNetwork, NETWORKS, PROTOCOL_CHAIN_ID } from '../lib/networkConfig.js';

const circumference = 2 * Math.PI * 8;
const arcOf = container => container.querySelector('.percent-ring-arc');

describe('max coverage ring', () => {
  it('draws the covered share of the circle beside the percentage', () => {
    const { container } = render(<CoveredProtocolsTable insuredTokenStates={{ usd8: { enabled: true, maxCoverageBps: '8000' } }} />);
    expect(screen.getByText('80%')).toBeInTheDocument();
    const [filled, total] = arcOf(container).getAttribute('stroke-dasharray').split(' ').map(Number);
    expect(filled / total).toBeCloseTo(0.8, 3);
    expect(total).toBeCloseTo(circumference, 2);
    expect(container.querySelector('.percent-ring')).toHaveAttribute('aria-hidden', 'true');
    // The ring follows the percentage.
    const cell = container.querySelector('.percent-with-ring');
    expect(cell.firstChild.textContent).toBe('80%');
    expect(cell.lastChild).toBe(container.querySelector('.percent-ring'));
  });

  it('shows no ring for an invalid or unavailable coverage', () => {
    const { container } = render(<CoveredProtocolsTable insuredTokenStates={{ usd8: { enabled: true, maxCoverageBps: '12000' } }} />);
    expect(container.querySelector('.percent-ring')).toBeNull();
  });
});

describe('insured token site link', () => {
  it('links the token name to its own protocol page and shows no Etherscan icon', () => {
    render(<CoveredProtocolsTable insuredTokenStates={{ 'morpho-steakusdc': { enabled: true, maxCoverageBps: '7000' } }} />);
    const link = screen.getByRole('link', { name: 'Open Morpho Steakhouse USDC steakUSDC on its own site' });
    expect(link).toHaveAttribute('href', 'https://app.morpho.org/ethereum/vault/0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveTextContent('Morpho Steakhouse USDC steakUSDC');
    expect(screen.queryByTitle('View on Etherscan')).toBeNull();
  });

  it('links ssftUSD to the Flying Tulip ftUSD page', () => {
    render(<CoveredProtocolsTable insuredTokenStates={{ 'flyingtulip-ssftusd': { enabled: true, maxCoverageBps: '8000' } }} />);
    const link = screen.getByRole('link', { name: 'Open Flying Tulip Stable Staked ftUSD ssftUSD on its own site' });
    expect(link).toHaveAttribute('href', 'https://flyingtulip.com/ftusd/');
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('leaves USD8 unlinked', () => {
    render(<CoveredProtocolsTable insuredTokenStates={{ usd8: { enabled: true, maxCoverageBps: '8000' } }} />);
    expect(screen.queryByRole('link', { name: /USD8/ })).toBeNull();
    expect(screen.getByText('USD8')).toBeInTheDocument();
  });
});

describe('row order', () => {
  it('lists the highest max coverage first and keeps listing order on ties', () => {
    const { container } = render(<CoveredProtocolsTable insuredTokenStates={{
      'morpho-steakusdc': { enabled: true, maxCoverageBps: '7000' },
      usd8: { enabled: true, maxCoverageBps: '8000' },
      'flyingtulip-ssftusd': { enabled: true, maxCoverageBps: '8000' },
      'sky-susds': { enabled: true, maxCoverageBps: '9000' },
    }} />);
    const symbols = [...container.querySelectorAll('tbody tr')].map((row) => row.textContent);
    expect(symbols.map((text) => ['sUSDS', 'ssftUSD', 'steakUSDC', 'USD8'].find((symbol) => text.includes(symbol))))
      .toEqual(['sUSDS', 'USD8', 'ssftUSD', 'steakUSDC']);
  });
});

describe('mainnet insured tokens', () => {
  it('lists USD8, sGHO (not legacy stkGHO), sUSDS, steakUSDC, ssftUSD, wstETH and rETH', () => {
    expect(NETWORKS[1].contracts.insuredTokens).toMatchObject({
      usd8: '0x2fe01f5e235eeab9045066f873f531de20f31947',
      'aave-sgho': '0xe1753f2e00940cc31213dd92013cf019dfe4ca1d',
      'sky-susds': '0xa3931d71877c0e7a3148cb7eb4463524fec27fbd',
      'morpho-steakusdc': '0xbeef01735c132ada46aa9aa4c54623caa92a64cb',
      'flyingtulip-ssftusd': '0x232128844e5af56fd4b3f8bf97e08ab477282ab5',
      'lido-wsteth': '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      'rocketpool-reth': '0xae78736cd615f374d3085123a210448e74fc6393',
    });
    expect(Object.values(NETWORKS[1].contracts.insuredTokens)).not.toContain('0x1a88df1cfe15af22b3c4c783d4e6f7f9e0c1885d');
  });
});
