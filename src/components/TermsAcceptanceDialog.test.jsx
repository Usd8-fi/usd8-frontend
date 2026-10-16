import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TermsAcceptanceDialog from './TermsAcceptanceDialog.jsx';

describe('TermsAcceptanceDialog', () => {
  it('offers Agree and Disagree with links to the terms and risk disclaimer', () => {
    const onAgree = vi.fn();
    const onDisagree = vi.fn();
    render(<TermsAcceptanceDialog onAgree={onAgree} onDisagree={onDisagree} />);
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', './docs/legal.html#terms');
    expect(screen.getByRole('link', { name: 'Risk Disclaimer' })).toHaveAttribute('href', './docs/legal.html#risk-disclaimer');
    fireEvent.click(screen.getByRole('button', { name: 'Agree' }));
    expect(onAgree).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Disagree' }));
    expect(onDisagree).toHaveBeenCalledTimes(1);
  });

  it('treats Escape as Disagree', () => {
    const onDisagree = vi.fn();
    render(<TermsAcceptanceDialog onAgree={() => {}} onDisagree={onDisagree} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDisagree).toHaveBeenCalled();
  });
});
