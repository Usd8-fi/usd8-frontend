import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AvailabilityAction from './AvailabilityAction.jsx';

const appStyles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

describe('AvailabilityAction', () => {
  it('sizes every small note identically', () => {
    // One shared rule; no per-class font-size copies to drift apart.
    const [, selectors, body] = appStyles.match(/Every small note[^*]*\*\/\s*([^{]+)\{([^}]*)\}/);
    expect(body).toContain('font-size: 13px');
    [
      '.usd8-dialog-amount small',
      '.usd8-dialog-output small',
      '.usd8-dialog-withdraw-balances',
      '.file-claim-field small',
      '.file-claim-requirement',
      '.file-claim-weight',
      '.usd8-dialog-status',
      '.action-validation-warning',
      '.covered-protocols-warning',
      '.claim-status-metrics small',
      '.claim-status-step small',
    ].forEach((selector) => expect(selectors).toContain(selector));
    // Declared once, so the sizes cannot drift apart.
    expect(appStyles.match(/font-size: 13px;/g)).toHaveLength(1);
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

  it('keeps the button at its own size when a warning sits beside it', () => {
    // The warning previously refused to shrink or wrap, so the button absorbed it.
    expect(appStyles).toMatch(/\.action-button-shell > button \{[^}]*flex: 0 0 auto;/);
    expect(appStyles).toMatch(/\.usd8-dialog-submit \{[^}]*flex: 0 0 auto;[^}]*white-space: nowrap;/);
    // Messages always claim a full line, so placement never depends on text length.
    expect(appStyles).toMatch(
      /\.action-validation-warning,\s*\.usd8-dialog-status,\s*\.file-claim-weight \{[^}]*flex-basis: 100%;/,
    );
    expect(appStyles).toMatch(/\.action-button-shell \{[^}]*flex-wrap: wrap;/);
    expect(appStyles).toMatch(/\.usd8-dialog-submit-row \{[^}]*flex-wrap: wrap;/);
  });

  it('uses one spinner element everywhere and shows no thousands separators', () => {
    // A single class, so pool metrics, payout figures and transaction status all
    // render the same indicator.
    expect(appStyles).toMatch(/\.usd8-spinner \{[^}]*animation: usd8-spin/);
    expect(appStyles).not.toContain('insurance-score-spinner');
    expect(appStyles).not.toContain('usd8-dialog-status-spinner');
    expect(appStyles.match(/@keyframes usd8-spin/g)).toHaveLength(1);
  });
});
