import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import InfoTooltip from './InfoTooltip.jsx';

describe('InfoTooltip', () => {
  it('renders every tooltip above clipping popup containers by default', () => {
    const { container } = render(
      <div className="usd8-dialog">
        <InfoTooltip ariaLabel="About popup field">Popup help</InfoTooltip>
      </div>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(container.querySelector('.usd8-dialog')).not.toContainElement(tooltip);
    expect(tooltip).toHaveClass('dashboard-help-tooltip--floating');
  });

  it('opens toward the left when the tooltip would cross the right viewport edge', () => {
    render(<InfoTooltip ariaLabel="About test">Tooltip content</InfoTooltip>);
    const wrapper = screen.getByRole('button', { name: 'About test' }).closest('.dashboard-help');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    wrapper.getBoundingClientRect = () => ({ left: 900, right: 914, width: 14, top: 0, bottom: 14, height: 14 });

    fireEvent.pointerEnter(wrapper);

    expect(wrapper).toHaveClass('dashboard-help--align-right');
  });

  it('opens toward the right when there is enough viewport space', () => {
    render(<InfoTooltip ariaLabel="About test">Tooltip content</InfoTooltip>);
    const wrapper = screen.getByRole('button', { name: 'About test' }).closest('.dashboard-help');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    wrapper.getBoundingClientRect = () => ({ left: 100, right: 114, width: 14, top: 0, bottom: 14, height: 14 });

    fireEvent.pointerEnter(wrapper);

    expect(wrapper).not.toHaveClass('dashboard-help--align-right');
  });
});
