import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FileClaimDialog from './FileClaimDialog.jsx';

const appStyles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

describe('FileClaimDialog', () => {
  it('uses the input-row gap above every popup final action', () => {
    expect(appStyles).toMatch(/\.usd8-dialog-submit-row \{[^}]*margin-top: 72px;/);
    expect(appStyles).toMatch(/\.usd8-dialog-submit-row--withdraw \{[^}]*margin-top: 72px;/);
    expect(appStyles).toMatch(/\.file-claim-submit-row \{[^}]*margin-top: 72px;/);
    expect(appStyles).toMatch(/\.claim-status-actions \{[^}]*padding-top: 72px;/);
  });

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
    expect(screen.getByLabelText('Insured sGHO amount')).toHaveValue(345.123456);
    expect(screen.queryByRole('button', { name: /Use full sGHO balance/ })).not.toBeInTheDocument();
    // Loss size is a personal cap, not a share of anything, so no percentage is offered.
    expect(screen.getByText(/345.12 available/).closest('small')).toHaveTextContent(
      '345.12 available.',
    );
    expect(screen.getByText(/345.12 available/).closest('small'))
      .not.toHaveTextContent('of all token claims');
  });

  it('explains the price-drop requirement below the claim title', () => {
    render(
      <FileClaimDialog
        token="test-msloss"
        insuredTokens={[{ id: 'test-msloss', symbol: 'msLOSS', balance: '500' }]}
        availableScore="128600"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const title = screen.getByRole('heading', { name: 'File a Claim for msLOSS' });
    const learnMore = screen.getByRole('link', { name: 'learn more' });
    const requirement = learnMore.closest('.file-claim-requirement');
    expect(requirement).toHaveTextContent(
      'msLOSS must lose more than 20% of its value against its underlying, '
      + 'measured between its TWAP price immediately before and after the drop. learn more.',
    );
    expect(learnMore).toHaveAttribute('href', './docs/defi-insurance.html');
    expect(title.nextElementSibling).toBe(requirement);
    expect(requirement).toHaveClass('file-claim-requirement');
    expect(appStyles).toMatch(/\.file-claim-requirement \{[^}]*color: #fff;[^}]*font-weight: 400;/);
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
    expect(appStyles).toMatch(/\.file-claim-form-grid \{[\s\S]*grid-template-columns: 350px minmax\(160px, 1fr\);[\s\S]*column-gap: 64px;/);
    expect(appStyles).toMatch(/\.file-claim-field--primary input \{\s*width: 282px;/);
    expect(appStyles).toMatch(/\.file-claim-field--compact input \{\s*width: 160px;/);
    expect(appStyles).toMatch(/\.file-claim-title img \{[\s\S]*width: 34px;[\s\S]*height: 34px;/);
  });

  it('defaults claim inputs to their maximums without available-value links', () => {
    const onSubmit = vi.fn();
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '345' }]}
        availableScore="2344322"
        availableBoosters="12"
        claimTotals={{ insuredTokenAmount: '9655', scoreCommitted: '91428558' }}
        claimBond="10 USD8"
        claimBondAvailable="12.456789"
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    for (const label of [
      'About claim bond',
      'About insurance score to spend',
      'About boosters to burn',
    ]) {
      expect(screen.getByRole('button', { name: label })).toHaveTextContent('?');
    }
    expect(screen.getByRole('tooltip', {
      name: 'Optional. Each Booster will boost the final insurance score by 1%. Unused Boosters will be returned.',
    })).toBeInTheDocument();

    expect(screen.getByLabelText('Insurance score to spend')).toHaveValue('2344322');
    expect(screen.getByLabelText('Boosters to burn')).toHaveValue(12);
    const claimBondField = screen.getByText('Claim bond').closest('.file-claim-field');
    const claimBondAvailable = claimBondField.querySelector('small');
    expect(claimBondAvailable).toHaveTextContent('12.45 available');
    expect(within(claimBondAvailable).queryByRole('button')).not.toBeInTheDocument();
    expect(appStyles).toMatch(/\.file-claim-form-grid \{[^}]*grid-template-columns: 350px minmax\(160px, 1fr\);/);
    expect(appStyles).toMatch(/\.file-claim-field--bond small \{[^}]*white-space: nowrap;/);
    expect(appStyles).toContain('.file-claim-field--primary input');
    expect(appStyles).toContain('width: 282px;');
    expect(screen.queryByRole('button', { name: /Use full sGHO balance/ })).not.toBeInTheDocument();
    expect(screen.getByText(/345 available/).closest('small')).toHaveTextContent(
      '345 available.',
    );
    expect(screen.queryByRole('button', { name: /Use full insurance score/ })).not.toBeInTheDocument();
    expect(screen.getByText(/2344322 available/).closest('small')).toHaveTextContent(
      '2344322 available',
    );
    expect(screen.queryByRole('button', { name: /Use all boosters/ })).not.toBeInTheDocument();
    expect(screen.getByText('12 available')).toBeInTheDocument();

    expect(screen.queryByRole('combobox', { name: 'Approximate incident age' })).not.toBeInTheDocument();

    fireEvent.submit(screen.getByRole('button', { name: 'File Claim' }).closest('form'));
    expect(onSubmit).toHaveBeenCalledWith({
      token: 'aave-sgho',
      amount: '345',
      scoreToSpend: '2344322',
      boosterAmount: '12',
    });
    expect(screen.getByText('10 USD8')).toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('truncates insurance-score inputs to two decimal places', () => {
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
    expect(score).toHaveValue('131239.80');
    fireEvent.change(score, { target: { value: '131,239.8999' } });
    expect(score).toHaveValue('131239.89');
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

    const submit = screen.getByRole('button', { name: 'File Claim' });
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
    const submit = screen.getByRole('button', { name: 'File Claim' });
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

    const submit = screen.getByRole('button', { name: 'File Claim' });
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
    expect(status.querySelector('.usd8-spinner')).toBeInTheDocument();
  });

  it('does not ask for incident timing when joining an already-open incident', () => {
    const onSubmit = vi.fn();
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '345' }]}
        availableScore="128600"
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.queryByRole('combobox', { name: 'Approximate incident age' })).not.toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Insured sGHO amount'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'File Claim' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.not.objectContaining({ incidentAgeHours: expect.anything() }));
  });

  it('keeps score entry visually active and validates no available score on submit', () => {
    render(
      <FileClaimDialog
        token="aave-sgho"
        availableScore="0"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const scoreInput = screen.getByLabelText('Insurance score to spend');
    expect(scoreInput).toBeEnabled();
    fireEvent.change(scoreInput, { target: { value: '12' } });
    expect(scoreInput).toHaveValue('12');
    expect(screen.queryByRole('button', { name: /Use full insurance score/ })).not.toBeInTheDocument();
    expect(scoreInput.closest('.file-claim-field').querySelector('small')).toHaveTextContent('0 available');
    expect(screen.queryByText('No available insurance score to spend.')).not.toBeInTheDocument();
    expect(appStyles).not.toMatch(/\.file-claim-field input:disabled/);
    const submit = screen.getByRole('button', { name: 'File Claim' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(screen.getByRole('alert')).toHaveTextContent('You do not have any available insurance score to spend.');
  });

  it('shows the active claim amounts, lifecycle, and cancellation action', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-01-02T00:00:00Z'));
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const onClose = vi.fn();
    render(
      <FileClaimDialog
        token="aave-sgho"
        insuredTokens={[{ id: 'aave-sgho', symbol: 'sGHO', balance: '400' }]}
        availableScore="128600"
        claimStatus={{
          id: '42',
          stage: 'Claim Open',
          stageIndex: 0,
          daysLeft: 2,
          cancellable: true,
          insuredTokenAmount: '345',
          bondAmount: '10',
          scoreToSpend: '2344322',
          insuredTokenClaimPercentage: '3.4%',
          scoreCommitmentPercentage: '2.5%',
          boosterAmount: '2',
          phaseWindowDays: 3,
          incident: {
            phaseDeadlineMilliseconds: Date.now() + (2 * 24 + 23) * 60 * 60 * 1_000,
            phaseWindowMilliseconds: 3 * 86_400_000,
            root: `0x${'00'.repeat(32)}`,
          },
        }}
        onClose={onClose}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Claim Status for sGHO' });
    expect(appStyles).not.toMatch(/\.file-claim-dialog--status\s*\{/);
    expect(appStyles).toMatch(/\.file-claim-status \{[\s\S]*?margin-top: 76px;/);
    expect(appStyles).toMatch(/\.claim-status-metrics \{[\s\S]*?grid-template-columns: 320px 180px;[\s\S]*?column-gap: 48px;[\s\S]*?row-gap: 72px;/);
    expect(appStyles).toMatch(/\.claim-status-metrics div \{[\s\S]*?gap: 18px;/);
    expect(appStyles).toMatch(/\.claim-status-metrics strong \{[\s\S]*?font: inherit;[\s\S]*?font-size: 28px;/);
    expect(appStyles).toMatch(/\.claim-status-step strong \{[\s\S]*?font: inherit;/);
    expect(appStyles).toMatch(/\.claim-status-step-bar \{[\s\S]*?height: 3px;/);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close claim status' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(within(dialog).getByRole('heading', { name: 'Your Claim Status' })).toBeInTheDocument();
    expect(within(dialog).getByText('Insured Token')).toBeInTheDocument();
    expect(within(dialog).getByText('345 sGHO')).toBeInTheDocument();
    expect(within(dialog).getByText('Claim Bond')).toBeInTheDocument();
    expect(within(dialog).getByText('10 USD8')).toBeInTheDocument();
    expect(within(dialog).getByText('Insurance score to spend')).toBeInTheDocument();
    expect(within(dialog).getByText('2344322')).toBeInTheDocument();
    expect(within(dialog).getByText('2.5% of all score committed')).toBeInTheDocument();
    expect(within(dialog).getByText('Booster to spend')).toBeInTheDocument();
    expect(within(dialog).getByText('2')).toBeInTheDocument();
    expect(within(dialog).getByText('Status')).toBeInTheDocument();
    expect(within(dialog).getByText('Claim Open')).toBeInTheDocument();
    expect(within(dialog).getByText('Settle')).toBeInTheDocument();
    expect(within(dialog).getByText('Payout')).toBeInTheDocument();
    expect(within(dialog).getByText('2 days 23 hours left')).toBeInTheDocument();
    expect(within(dialog).getByText('3 days')).toBeInTheDocument();
    expect(within(dialog).getByText('3-6 days')).toBeInTheDocument();
    const progress = within(dialog).getByRole('progressbar', { name: 'Claim Open progress' });
    expect(progress).toHaveAttribute('aria-valuenow', '1');
    act(() => vi.advanceTimersByTime(86_400_000));
    expect(progress).toHaveAttribute('aria-valuenow', '34');
    expect(within(dialog).getByText('1 day 23 hours left')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel Claim' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ['settlement-open', 'Settle Claim', 'onSettle'],
    ['settlement-expired', 'Return Tokens', 'onReturnTokens'],
    ['payout-open', 'Accept Payout', 'onAcceptPayout'],
    ['payout-expired', 'Cancel Payout and Return Tokens', 'onCancelPayout'],
  ])('renders the correct %s transaction action', (state, label, callbackName) => {
    const callbacks = {
      onSettle: vi.fn(),
      onReturnTokens: vi.fn(),
      onAcceptPayout: vi.fn(),
      onCancelPayout: vi.fn(),
    };
    const root = state.startsWith('payout') ? `0x${'11'.repeat(32)}` : `0x${'00'.repeat(32)}`;
    const deadline = Date.now() - 1_000;
    const phaseWindow = state.endsWith('expired') ? 1 : 86_400_000;
    render(<FileClaimDialog
      token="test-msloss"
      insuredTokens={[{ id: 'test-msloss', symbol: 'msLOSS', balance: '400' }]}
      availableScore="1"
      claimStatus={{
        id: '42', insuredTokenAmount: '345', bondAmount: '10', scoreToSpend: '2344322',
        insuredTokenClaimPercentage: '3%', scoreCommitmentPercentage: '2%', boosterAmount: '2',
        payoutUsd: '$2,003.10', payoutVsLoss: '76%', payoutDetails: [{ amount: '1.2', symbol: 'wstETH', usd: '$1,233.20' }],
        incident: { phaseDeadlineMilliseconds: deadline, phaseWindowMilliseconds: phaseWindow, root },
      }}
      onClose={vi.fn()}
      {...callbacks}
    />);
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(callbacks[callbackName]).toHaveBeenCalledOnce();
    if (state === 'payout-open') {
      expect(screen.getByText('Total Payout USD value')).toBeInTheDocument();
      expect(screen.getByText('$2,003.10')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel Payout and Return Tokens' })).toBeInTheDocument();
    }
  });

  it('renders finished stages as complete with no time remaining', () => {
    const phaseWindow = 3_600_000;
    // Settlement never produced a root and both windows have elapsed.
    const deadline = Date.now() - 8 * 86_400_000;
    render(<FileClaimDialog
      token="test-msloss"
      insuredTokens={[{ id: 'test-msloss', symbol: 'msLOSS', balance: '3500' }]}
      availableScore="257.56"
      claimStatus={{
        id: '1', insuredTokenAmount: '1500', bondAmount: '10', scoreToSpend: '257.56',
        insuredTokenClaimPercentage: '100%', scoreCommitmentPercentage: '100%', boosterAmount: '0',
        phaseWindowDays: 1,
        incident: {
          phaseDeadlineMilliseconds: deadline,
          phaseWindowMilliseconds: phaseWindow,
          root: `0x${'00'.repeat(32)}`,
        },
      }}
      onClose={vi.fn()}
      onReturnTokens={vi.fn()}
    />);

    const dialog = screen.getByRole('dialog', { name: 'Claim Status for msLOSS' });
    expect(within(dialog).getByText('257.56')).toBeInTheDocument();
    expect(within(dialog).getByText('100% of all score committed')).toBeInTheDocument();

    // "Claim Closed" is behind the active stage: filled bar, nothing left to wait for.
    const closed = within(dialog).getByRole('progressbar', { name: 'Claim Closed progress' });
    expect(closed).toHaveAttribute('aria-valuenow', '100');
    expect(closed.parentElement).toHaveClass('claim-status-step--complete');
    expect(within(dialog).getAllByText('0 days 0 hours left')).toHaveLength(2);
    // The future payout stage keeps its nominal duration and stays unfilled.
    expect(within(dialog).getByText('1 days')).toBeInTheDocument();
    expect(within(dialog).queryByRole('progressbar', { name: 'Payout progress' })).toBeNull();
    expect(appStyles).toMatch(/\.claim-status-step--complete \.claim-status-step-bar/);
  });

  it('states one booster-adjusted weight beside the submit button', () => {
    render(
      <FileClaimDialog
        token="test-msloss"
        insuredTokens={[{ id: 'test-msloss', symbol: 'msLOSS', balance: '5000' }]}
        availableScore="1000"
        availableBoosters="5"
        boosterBoostBps={100}
        claimTotals={{ scoreCommitted: '9450' }}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    // 1000 raw x (10000 + 5 x 100)/10000 = 1050 effective; 1050 / (1050 + 9450) = 10%.
    const weight = screen.getByText(/Total insurance score to spend/);
    expect(weight).toHaveTextContent(
      'Total insurance score to spend: 1050 (incl. 5 boosters) — 10% of all score committed atm.',
    );
    // The score field itself no longer carries a share.
    expect(screen.getByText(/1000 available/).closest('small'))
      .not.toHaveTextContent('of all score committed');
    // Loss size is never expressed as a share.
    expect(screen.queryByText(/of all token claims/)).toBeNull();
  });

  it('omits the booster clause when none are committed', () => {
    render(
      <FileClaimDialog
        token="test-msloss"
        insuredTokens={[{ id: 'test-msloss', symbol: 'msLOSS', balance: '5000' }]}
        availableScore="1000"
        availableBoosters="0"
        boosterBoostBps={100}
        claimTotals={{ scoreCommitted: '3000' }}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText(/Total insurance score to spend/)).toHaveTextContent(
      'Total insurance score to spend: 1000 — 25% of all score committed atm.',
    );
  });

  it('spins for payout figures while the settlement loads, then shows them', () => {
    const incident = {
      phaseDeadlineMilliseconds: Date.now() - 1_000,
      phaseWindowMilliseconds: 3_600_000,
      root: `0x${'11'.repeat(32)}`,
    };
    const base = {
      id: '56', insuredTokenAmount: '1000', bondAmount: '10', scoreToSpend: '2000',
      scoreCommitmentPercentage: '66.6%', boosterAmount: '0', incident,
    };
    const { rerender } = render(<FileClaimDialog
      token="test-msloss"
      insuredTokens={[{ id: 'test-msloss', symbol: 'msLOSS', balance: '4000' }]}
      availableScore="1"
      payoutLoading
      claimStatus={{ ...base, payoutUsd: null, payoutVsLoss: null, payoutDetails: [] }}
      onClose={vi.fn()}
    />);

    // Unknown, not unavailable: never show a dash while the artifact is in flight.
    expect(screen.getByRole('status', { name: 'Loading payout value' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading payout comparison' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading payout details' })).toBeInTheDocument();
    expect(screen.getByText('Total Payout USD value').parentElement).not.toHaveTextContent('—');

    rerender(<FileClaimDialog
      token="test-msloss"
      insuredTokens={[{ id: 'test-msloss', symbol: 'msLOSS', balance: '4000' }]}
      availableScore="1"
      claimStatus={{
        ...base,
        payoutUsd: '$663.52',
        payoutVsLoss: '80.0%',
        payoutDetails: [{ amount: '0.0829', symbol: 'wstETH', usd: '' }],
      }}
      onClose={vi.fn()}
    />);

    expect(screen.queryByRole('status', { name: 'Loading payout value' })).toBeNull();
    expect(screen.getByText('$663.52')).toBeInTheDocument();
    expect(screen.getByText('80.0%')).toBeInTheDocument();
  });
});
