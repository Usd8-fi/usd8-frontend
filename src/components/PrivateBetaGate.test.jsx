import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PrivateBetaGate, { PRIVATE_BETA_STORAGE_KEY } from './PrivateBetaGate.jsx';

const protectedPage = <p>Protected USD8 app</p>;

function submitCode(code) {
  fireEvent.change(screen.getByLabelText('Private Beta Invitation Code'), { target: { value: code } });
  fireEvent.click(screen.getByRole('button', { name: 'Access beta' }));
}

// Test-only code; the real one lives only in the untracked .env.local as a hash.
const TEST_CODE = '1357';
const TEST_CODE_SHA256 = 'f3e055913a0b1eb0f07317896f9a1bc466b9a50db85a7f882f3ffde9ffb23aca';

// Test-only partner-link token (sha256 of 'testlink9'); the real one lives only in .env.local as a hash.
const TEST_LINK = 'testlink9';
const TEST_LINK_SHA256 = '0f1eeb80e9633e3c955afb9f9c1c79913bf4596272f692506f18307b3d0aea0e';

beforeEach(() => {
  localStorage.clear();
  vi.stubEnv('VITE_PRIVATE_BETA_CODE_SHA256', TEST_CODE_SHA256);
  vi.stubEnv('VITE_PRIVATE_BETA_LINK_SHA256', TEST_LINK_SHA256);
});
afterEach(() => {
  vi.unstubAllEnvs();
  window.history.replaceState(null, '', '/');
});

describe('PrivateBetaGate partner link', () => {
  it('opens the app from the partner link and keeps the link shareable', async () => {
    window.history.replaceState(null, '', `/?access=${TEST_LINK}#cover-pools`);
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);

    expect(screen.queryByLabelText('Private Beta Invitation Code')).not.toBeInTheDocument();
    expect(await screen.findByText('Protected USD8 app')).toBeInTheDocument();
    expect(localStorage.getItem(PRIVATE_BETA_STORAGE_KEY)).toBe('granted');
    expect(window.location.search).toBe(`?access=${TEST_LINK}`);
    expect(window.location.hash).toBe('#cover-pools');
  });

  it('works alongside other query parameters', async () => {
    window.history.replaceState(null, '', `/?utm_source=partner&access=${TEST_LINK}`);
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);

    expect(await screen.findByText('Protected USD8 app')).toBeInTheDocument();
    expect(window.location.search).toBe(`?utm_source=partner&access=${TEST_LINK}`);
  });

  it('shows the code screen for a wrong token', async () => {
    window.history.replaceState(null, '', '/?access=wrongtoken');
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);

    expect(await screen.findByLabelText('Private Beta Invitation Code')).toBeInTheDocument();
    expect(screen.queryByText('Protected USD8 app')).not.toBeInTheDocument();
    expect(localStorage.getItem(PRIVATE_BETA_STORAGE_KEY)).toBeNull();
  });

  it('accepts no partner link when no link hash is configured', async () => {
    vi.stubEnv('VITE_PRIVATE_BETA_LINK_SHA256', '');
    window.history.replaceState(null, '', `/?access=${TEST_LINK}`);
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);

    expect(await screen.findByLabelText('Private Beta Invitation Code')).toBeInTheDocument();
    expect(localStorage.getItem(PRIVATE_BETA_STORAGE_KEY)).toBeNull();
  });

  it('does not accept the invitation code itself as a partner link', async () => {
    window.history.replaceState(null, '', `/?access=${TEST_CODE}`);
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);

    expect(await screen.findByLabelText('Private Beta Invitation Code')).toBeInTheDocument();
  });
});

describe('PrivateBetaGate', () => {
  it('shows the invitation code form directly before the app', () => {
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);

    // Two lines: logo + USD8 wordmark, then the invitation-code label.
    const brand = screen.getByRole('heading', { name: 'USD8' });
    expect(brand.querySelectorAll('img')).toHaveLength(2);
    expect(screen.queryByRole('heading', { name: 'USD8 Private Beta' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Private Beta Invitation Code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Access beta' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Access private beta' })).not.toBeInTheDocument();
    expect(screen.queryByText('Protected USD8 app')).not.toBeInTheDocument();
  });

  it('tells visitors where to get an invitation code, with links to Telegram and X', () => {
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);

    const help = screen.getByText(/Get a code from our/).closest('p');
    expect(help).toHaveTextContent('Get a code from our Telegram or X DM');
    const button = screen.getByRole('button', { name: 'Access beta' });
    expect(button.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const telegram = screen.getByRole('link', { name: 'Telegram' });
    expect(telegram).toHaveAttribute('href', 'https://t.me/+e84i2oYk1ao1MTk1');
    expect(telegram).toHaveAttribute('target', '_blank');
    expect(telegram).toHaveAttribute('rel', 'noreferrer');
    const x = screen.getByRole('link', { name: 'X DM' });
    expect(x).toHaveAttribute('href', 'https://x.com/usd8_fi');
    expect(x).toHaveAttribute('target', '_blank');
    expect(x).toHaveAttribute('rel', 'noreferrer');
  });

  it('rejects a wrong invitation code', async () => {
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);
    submitCode('1111');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid invitation code.');
    expect(screen.queryByText('Protected USD8 app')).not.toBeInTheDocument();
  });

  it('opens the app with the right invitation code and remembers access', async () => {
    const { unmount } = render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);
    submitCode(TEST_CODE);

    expect(await screen.findByText('Protected USD8 app')).toBeInTheDocument();
    expect(localStorage.getItem(PRIVATE_BETA_STORAGE_KEY)).toBe('granted');

    unmount();
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);
    expect(screen.getByText('Protected USD8 app')).toBeInTheDocument();
  });

  it('accepts letters and digits only, up to 32 characters', () => {
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);
    const input = screen.getByLabelText('Private Beta Invitation Code');
    fireEvent.change(input, { target: { value: 'aB3-x 9!' } });
    expect(input).toHaveValue('aB3x9');

    fireEvent.change(input, { target: { value: 'k'.repeat(40) } });
    expect(input).toHaveValue('k'.repeat(32));
  });

  it('accepts no code when the hash is not configured', async () => {
    vi.stubEnv('VITE_PRIVATE_BETA_CODE_SHA256', '');
    render(<PrivateBetaGate>{protectedPage}</PrivateBetaGate>);
    submitCode(TEST_CODE);

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid invitation code.');
    expect(screen.queryByText('Protected USD8 app')).not.toBeInTheDocument();
  });
});
