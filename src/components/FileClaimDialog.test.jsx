import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FileClaimDialog from './FileClaimDialog.jsx';

const appStyles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

describe('FileClaimDialog', () => {
  it('keeps the modal internally scrollable when the browser is shorter than the form', () => {
    expect(appStyles).toMatch(/\.file-claim-dialog \{[\s\S]*max-height: calc\(100vh - 56px\);[\s\S]*overflow-y: auto;/);
  });

  it('renders help tooltips outside the scrolling modal so they cannot be clipped', () => {
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '345' }]}
        availableScore="128600"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'File claim for sGHO' });
    const trigger = screen.getByRole('button', { name: 'About claim bond' });
    fireEvent.pointerEnter(trigger.closest('.dashboard-help'));
    const tooltip = screen.getByRole('tooltip', {
      name: 'A 10 USD8 anti-spam bond is required to file. It will not be returned if you are not eligible for a claim.',
    });

    expect(dialog).not.toContainElement(tooltip);
    expect(tooltip).toHaveClass('dashboard-help-tooltip--floating', 'dashboard-help-tooltip--visible');
    expect(appStyles).toMatch(/\.dashboard-help-tooltip--floating \{[\s\S]*position: fixed;[\s\S]*z-index: 2000;/);
  });

  it('locks the claim to the token chosen from the insured-token table', () => {
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[
          { id: 'usd8', symbol: 'USD8', balance: '12.456789', iconSrc: '/usd8.svg' },
          { id: 'aave-sgho', symbol: 'sGHO', balance: '345.123456', iconSrc: '/sgho.svg' },
        ]}
        availableScore="128600"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const title = screen.getByRole('heading', { name: 'File a Claim for sGHO' });
    expect(within(title).getByRole('img', { name: 'sGHO' })).toHaveAttribute('src', '/sgho.svg');
    expect(screen.queryByRole('combobox', { name: 'Insured token' })).not.toBeInTheDocument();
    expect(screen.getByText('sGHO Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Insured sGHO amount')).toHaveValue(1);
    const available = screen.getByRole('button', { name: 'Use full sGHO balance 345.123456' });
    expect(available).toHaveTextContent('345.12 available');
    fireEvent.click(available);
    expect(screen.getByLabelText('Insured sGHO amount')).toHaveValue(345.123456);
  });

  it('uses wide primary inputs and aligned compact secondary fields', () => {
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '345', iconSrc: '/sgho.svg' }]}
        availableScore="2344322"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Insured sGHO amount').closest('.file-claim-field')).toHaveClass('file-claim-field--primary');
    expect(screen.getByLabelText('Insurance score to spend').closest('.file-claim-field')).toHaveClass('file-claim-field--primary');
    expect(screen.getByLabelText('Boosters to burn').closest('.file-claim-field')).toHaveClass('file-claim-field--compact');
    expect(appStyles).toMatch(/\.file-claim-field--primary input \{\s*width: 282px;/);
    expect(appStyles).toMatch(/\.file-claim-field--compact input \{\s*width: 180px;/);
    expect(appStyles).toMatch(/\.file-claim-title img \{[\s\S]*width: 34px;[\s\S]*height: 34px;/);
  });

  it('defaults score to the maximum, boosters to zero, and collects the first-claim incident age', () => {
    const onSubmit = vi.fn();
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '345' }]}
        availableScore="2344322"
        availableBoosters="12"
        claimBond="10 USD8"
        claimBondAvailable="12.456789"
        maxIncidentAgeHours={144}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    for (const label of [
      'About claim bond',
      'About insurance score to spend',
      'About boosters to burn',
      'About incident time',
    ]) {
      expect(screen.getByRole('button', { name: label })).toHaveTextContent('?');
    }

    expect(screen.getByRole('tooltip', {
      name: /Claims can only be made for qualifying drops within the past six days\./,
    })).toBeInTheDocument();

    expect(screen.getByLabelText('Insurance score to spend')).toHaveValue('2344322');
    expect(screen.getByLabelText('Boosters to burn')).toHaveValue(0);
    const claimBondField = screen.getByText('Claim bond').closest('.file-claim-field');
    const claimBondAvailable = claimBondField.querySelector('small');
    expect(claimBondAvailable).toHaveTextContent('12.45 available');
    expect(within(claimBondAvailable).queryByRole('button')).not.toBeInTheDocument();
    expect(appStyles).toContain('.file-claim-field--primary input');
    expect(appStyles).toContain('width: 282px;');
    fireEvent.click(screen.getByRole('button', { name: 'Use full insurance score 2344322' }));
    expect(screen.getByLabelText('Insurance score to spend')).toHaveValue('2344322');
    fireEvent.click(screen.getByRole('button', { name: 'Use all boosters 12' }));
    expect(screen.getByLabelText('Boosters to burn')).toHaveValue(12);

    const incidentAge = screen.getByRole('combobox', { name: 'Approximate incident age' });
    expect(within(incidentAge).getAllByRole('option').map((option) => option.textContent)).toEqual([
      '1 day ago',
      '2 days ago',
      '3 days ago',
      '4 days ago',
      '5 days ago',
      '6 days ago',
    ]);
    expect(within(incidentAge).queryByRole('option', { name: /hour/ })).not.toBeInTheDocument();
    expect(within(incidentAge).getByRole('option', { name: '1 day ago' })).toBeInTheDocument();
    expect(within(incidentAge).getByRole('option', { name: '6 days ago' })).toBeInTheDocument();
    fireEvent.change(incidentAge, { target: { value: '48' } });

    fireEvent.change(screen.getByLabelText('Insured sGHO amount'), { target: { value: '345' } });
    fireEvent.submit(screen.getByRole('button', { name: 'file claim' }).closest('form'));
    expect(onSubmit).toHaveBeenCalledWith({
      token: 'aave-sgho',
      amount: '345',
      scoreToSpend: '2344322',
      boosterAmount: '12',
      incidentAgeHours: 48,
    });
    expect(screen.getByText('10 USD8')).toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('always displays a dot as the insurance-score decimal separator', () => {
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '345' }]}
        availableScore="131239.805234839977557855"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const score = screen.getByLabelText('Insurance score to spend');
    expect(score).toHaveAttribute('type', 'text');
    expect(score).toHaveValue('131239.805234839977557855');
    fireEvent.change(score, { target: { value: '131,239.8' } });
    expect(score).toHaveValue('131239.8');
  });

  it('explains that an ineligible claimant loses the anti-spam claim bond', () => {
    render(
      <FileClaimDialog
        token="aave-sgho"
        availableScore="1"
        claimBond="10 USD8"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('tooltip', {
      name: 'A 10 USD8 anti-spam bond is required to file. It will not be returned if you are not eligible for a claim.',
    })).toBeInTheDocument();
  });

  it('explains missing required fields on the file-claim button', () => {
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '1' }]}
        availableScore="128600"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const submit = screen.getByRole('button', { name: 'file claim' });
    fireEvent.change(screen.getByLabelText('Insured sGHO amount'), { target: { value: '' } });
    expect(screen.getByLabelText('Insured sGHO amount')).toHaveValue(null);
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(document.getElementById(submit.getAttribute('aria-describedby')))
      .toHaveTextContent('Enter the sGHO amount you want to claim for.');

    fireEvent.change(screen.getByLabelText('Insured sGHO amount'), { target: { value: '1' } });
    expect(document.getElementById(submit.getAttribute('aria-describedby'))).toBeNull();
  });

  it('prevents claiming more insured tokens than the wallet balance', () => {
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '345.123456789' }]}
        availableScore="128600"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Insured sGHO amount'), { target: { value: '345.1234567891' } });
    const submit = screen.getByRole('button', { name: 'file claim' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(document.getElementById(submit.getAttribute('aria-describedby')))
      .toHaveTextContent('The sGHO amount exceeds your available balance.');
  });

  it('shows claim submission failures beside the button and clears them when the user edits an input', () => {
    const onClearStatus = vi.fn();
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '345' }]}
        availableScore="128600"
        statusMessage="No qualifying 20% price drop was detected."
        statusTone="warning"
        onClearStatus={onClearStatus}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const submit = screen.getByRole('button', { name: 'file claim' });
    const warning = screen.getByRole('alert');
    expect(submit.closest('.file-claim-submit-row')).toContainElement(warning);
    expect(warning).toHaveTextContent('No qualifying 20% price drop was detected.');
    expect(warning).toHaveClass('usd8-dialog-status--warning');

    fireEvent.change(screen.getByLabelText('Insured sGHO amount'), { target: { value: '2' } });
    expect(onClearStatus).toHaveBeenCalledOnce();
  });

  it('shows a spinner while the TEE verifies the price drop', () => {
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '345' }]}
        availableScore="128600"
        statusMessage="Verifying incident in the TEE. First claim may take several minutes."
        statusTone="loading"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const status = screen.getByLabelText('Claim submission status');
    expect(status).toHaveTextContent('Verifying incident in the TEE. First claim may take several minutes.');
    expect(status.querySelector('.usd8-dialog-status-spinner')).toBeInTheDocument();
  });

  it('omits incident timing when joining an already-open incident', () => {
    const onSubmit = vi.fn();
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '345' }]}
        availableScore="128600"
        requiresIncidentTime={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.queryByRole('combobox', { name: 'Approximate incident age' })).not.toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Insured sGHO amount'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'file claim' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ incidentAgeHours: null }));
  });

  it('prevents score entry when no insurance score is available', () => {
    render(
      <FileClaimDialog
        token="aave-sgho"
        availableScore="0"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Insurance score to spend')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Use full insurance score 0' })).not.toBeInTheDocument();
    expect(screen.getByText('No available insurance score to spend.')).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: 'file claim' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(screen.getByRole('alert')).toHaveTextContent('You do not have any available insurance score to spend.');
  });

  it('opens directly to the active-claim status state', () => {
    const onSubmit = vi.fn();
    render(
      <FileClaimDialog
        token="wstETH"
        availableScore="128.6K"
        claimStatus={{ id: 'CP-042', stage: 'Challenge window', daysLeft: 3 }}
        submitUnavailableReason="No public TEE incident-open route is deployed."
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'File claim for wstETH' });
    expect(within(dialog).getByRole('heading', { name: 'Claim Status for wstETH' })).toBeInTheDocument();
    expect(within(dialog).getByText('CP-042')).toBeInTheDocument();
    expect(within(dialog).getByText('Challenge window')).toBeInTheDocument();
    expect(within(dialog).getByText('3 days left')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
