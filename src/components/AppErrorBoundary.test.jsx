import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from './AppErrorBoundary.jsx';

function Crash() {
  throw new Error('render failed');
}

afterEach(() => vi.restoreAllMocks());

describe('AppErrorBoundary', () => {
  it('shows a reload screen instead of a blank page when rendering crashes', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<AppErrorBoundary><Crash /></AppErrorBoundary>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong while showing this page.');
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });

  it('renders children normally', () => {
    render(<AppErrorBoundary><p>App</p></AppErrorBoundary>);
    expect(screen.getByText('App')).toBeInTheDocument();
  });
});
