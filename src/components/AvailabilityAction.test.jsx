import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AvailabilityAction from './AvailabilityAction.jsx';

const appStyles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

describe('AvailabilityAction', () => {
  it('keeps validation warnings on one line', () => {
    expect(appStyles).toMatch(/\.action-validation-warning \{[^}]*white-space: nowrap;/);
  });

  it('keeps blocked actions clickable and shows the reason beside the button after click', () => {
    const onClick = vi.fn();
    render(
      <AvailabilityAction type="button" unavailableReason="Amount exceeds your available balance." onClick={onClick}>
        submit
      </AvailabilityAction>,
    );

    const button = screen.getByRole('button', { name: 'submit' });
    expect(button).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Amount exceeds your available balance.');
    expect(button.closest('.action-button-shell')).toContainElement(screen.getByRole('alert'));
  });

  it('clears a displayed warning when its reset key changes', () => {
    const { rerender } = render(
      <AvailabilityAction type="button" unavailableReason="Enter an amount." warningResetKey="">
        submit
      </AvailabilityAction>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <AvailabilityAction type="button" unavailableReason="Enter an amount." warningResetKey="1">
        submit
      </AvailabilityAction>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('preserves a real pending disabled state', () => {
    render(<AvailabilityAction type="button" disabled>submit</AvailabilityAction>);
    expect(screen.getByRole('button', { name: 'submit' })).toBeDisabled();
  });
});
