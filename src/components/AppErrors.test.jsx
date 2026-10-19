import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetchAppErrors: vi.fn() }));
vi.mock('../lib/appErrors.js', async importOriginal => ({ ...(await importOriginal()), fetchAppErrors: mocks.fetchAppErrors }));
import AppErrors from './AppErrors.jsx';
import { agoText, areaLabel, errorTotals, lastDays, safeSentryLink } from '../lib/appErrors.js';

const NOW = Date.parse('2026-10-18T10:00:00Z');
const DAYS = ['2026-10-16', '2026-10-17', '2026-10-18'];
const summary = (unresolved) => ({
  updatedAt: '2026-10-18T09:59:00Z',
  data: {
    project: 'usd8fi/usd8-frontend',
    projectLink: 'https://usd8fi.sentry.io/issues/?project=1',
    unresolved,
    unresolvedTruncated: false,
    daily: { data: { days: DAYS, byOutcome: { accepted: [0, 2, 3], rate_limited: [0, 0, 1] } } },
    sessions: { data: { total: 40, crashFreeRate: 0.975 } },
  },
});
const ISSUE = {
  id: 'USD8-FRONTEND-7', title: 'TypeError: x is undefined', culprit: 'claimFlow(App)', unhandled: true, events: 5,
  firstSeen: '2026-10-17T10:00:00Z', lastSeen: '2026-10-18T09:30:00Z', link: 'https://usd8fi.sentry.io/issues/77/',
  area: 'claim-file', release: 'usd8-frontend@abc123', browsers: [{ value: 'Chrome 158', count: 5 }], pages: [{ value: 'https://usd8.fi/', count: 5 }],
};

// No beforeEach clear/reset: in Vitest 4.1 that turns the handled rejection
// below into a test failure. Every test sets its own response instead.

describe('AppErrors', () => {
  it('shows totals, daily bars and unresolved issues linked to Sentry', async () => {
    mocks.fetchAppErrors.mockResolvedValue(summary([ISSUE]));
    render(<AppErrors now={NOW} />);
    const panel = await screen.findByRole('region', { name: 'Frontend Errors' });
    expect(within(panel).getByText('Errors Today (UTC)').nextSibling).toHaveTextContent('3');
    expect(within(panel).getByText('Errors Last 14 Days').nextSibling).toHaveTextContent('5 · 1 dropped');
    expect(within(panel).getByText('Crash-Free Sessions').nextSibling).toHaveTextContent('97.50% · 40 sessions');
    expect(within(panel).getByRole('img', { name: /Errors per day: 2026-10-16 0, 2026-10-17 2, 2026-10-18 3/ })).toBeInTheDocument();
    const link = within(panel).getByRole('link', { name: 'TypeError: x is undefined' });
    expect(link).toHaveAttribute('href', 'https://usd8fi.sentry.io/issues/77/');
    expect(within(panel).getByText('File Claim')).toBeInTheDocument();
    expect(within(panel).getByText('30m ago')).toBeInTheDocument();
    expect(within(panel).getByText('abc123')).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Refresh Errors' })).toBeEnabled();
  });

  it('renders hostile error text as text and never links outside Sentry', async () => {
    mocks.fetchAppErrors.mockResolvedValue(summary([{ ...ISSUE, title: '<img src=x onerror="alert(1)">', link: 'javascript:alert(1)' }]));
    const { container } = render(<AppErrors now={NOW} />);
    expect(await screen.findByText('<img src=x onerror="alert(1)">')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('link', { name: /img/ })).toBeNull();
  });

  it('says when there are no unresolved errors', async () => {
    mocks.fetchAppErrors.mockResolvedValue(summary([]));
    render(<AppErrors now={NOW} />);
    expect(await screen.findByText('No unresolved errors')).toBeInTheDocument();
  });

  it('is shown only by the local dashboard server', async () => {
    mocks.fetchAppErrors.mockImplementation(() => Promise.reject(new Error('LOCAL_ONLY')));
    render(<AppErrors now={NOW} />);
    expect(await screen.findByText('App errors are shown only by the local dashboard server')).toBeInTheDocument();
  });

  it('reports an unavailable source', async () => {
    mocks.fetchAppErrors.mockImplementation(() => Promise.reject(new Error('Sentry API 401 for projects/usd8fi/usd8-frontend/issues/')));
    render(<AppErrors now={NOW} />);
    await waitFor(() => expect(screen.getByText(/App errors unavailable: Sentry API 401/)).toBeInTheDocument());
  });
});

describe('app error helpers', () => {
  it('links only to the USD8 Sentry organization', () => {
    expect(safeSentryLink('https://usd8fi.sentry.io/issues/1/')).toBe('https://usd8fi.sentry.io/issues/1/');
    expect(safeSentryLink('https://evil.example/issues/1/')).toBeNull();
    expect(safeSentryLink('javascript:alert(1)')).toBeNull();
  });

  it('labels areas and ages', () => {
    expect(areaLabel('score-load')).toBe('Score Load');
    expect(areaLabel(null)).toBe('—');
    expect(areaLabel('new-area')).toBe('new-area');
    expect(agoText('2026-10-18T09:59:30Z', NOW)).toBe('30s ago');
    expect(agoText('2026-10-16T10:00:00Z', NOW)).toBe('2d ago');
    expect(agoText(null, NOW)).toBe('—');
  });

  it('keeps exactly the last 14 days of the 15 buckets Sentry returns', () => {
    const days = Array.from({ length: 15 }, (_, i) => `2026-10-${String(4 + i).padStart(2, '0')}`);
    const daily = lastDays({ days, byOutcome: { accepted: days.map((_, i) => (i === 0 ? 9 : 1)) } });
    expect(daily.days).toHaveLength(14);
    expect(daily.days[0]).toBe('2026-10-05');
    expect(errorTotals({ unresolved: [], daily: { data: { days, byOutcome: { accepted: days.map((_, i) => (i === 0 ? 9 : 1)) } } } }).total14d).toBe(14);
  });

  it('returns null totals when a source is unavailable', () => {
    expect(errorTotals({ unresolved: [], daily: { error: 'x' }, sessions: { error: 'y' } }))
      .toEqual({ unresolved: 0, today: null, total14d: null, dropped: null, sessions: null, crashFreePercent: null, lastSeen: null });
  });
});
