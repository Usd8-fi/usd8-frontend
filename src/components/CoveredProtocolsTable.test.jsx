import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CoveredProtocolsTable from './CoveredProtocolsTable.jsx';

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
