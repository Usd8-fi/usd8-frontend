import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetchServices: vi.fn() }));
vi.mock('../lib/servicesStatus.js', async importOriginal => ({ ...(await importOriginal()), fetchServices: mocks.fetchServices }));
import ExternalServices, { useServices, WebsiteTraffic } from './ExternalServices.jsx';

function Page({ now }) {
  const services = useServices();
  return <><WebsiteTraffic services={services} /><ExternalServices now={now} services={services} /></>;
}
import { count, dollars, formatBytes } from '../lib/servicesStatus.js';

const at = 1792310000;
const SERVICES = {
  generatedAt: at,
  costs: { updatedAt: at, data: {
    months: [
      { month: '2026-08', usage: 10.12, credits: -10.12, net: 0, partial: false },
      { month: '2026-09', usage: 4.95, credits: -4.95, net: -0, partial: false },
      { month: '2026-10', usage: 2.29, credits: -2.29, net: 0, partial: true },
    ],
    services: [{ service: 'AWS Key Management Service', usage: 1.15 }, { service: 'AWS Lambda', usage: 0 }],
    forecastMonth: 3.93,
    budget: { name: 'usd8-monthly-usage', limit: 300, includesCredits: false, actual: 2.29, forecast: 3.93,
      alerts: [{ type: 'Actual', threshold: 100 }, { type: 'Actual', threshold: 300 }, { type: 'Forecasted', threshold: 100 }] },
    freeTier: [{ service: 'AWS Lambda', usageType: 'Request', unit: 'Request', used: 4867, limit: 1000000, forecastPercent: 0.9 }],
    costExplorerCallsPerRefresh: 3,
  } },
  aws: { updatedAt: at, data: {
    lambdas: [{ name: 'usd8-score-api', '24h': { Invocations: 167, Errors: 0, Throttles: 0, avgMs: 492 }, '7d': { Invocations: 289, Errors: 0, Throttles: 10, avgMs: 614 } }],
    gateways: [{ id: 'j9j79vdvkj', name: 'usd8-score-api', '24h': { Count: 178, '4xx': 3, '5xx': 0 }, '7d': { Count: 300, '4xx': 5, '5xx': 0 } }],
    s3: [{ name: 'usd8-tee-jobs-mainnet-919437049909-eu-central-1', bytes: 1500, objects: 3 }],
    ec2: { running: [], images: [{ id: 'ami-03c91d587c052afe0', name: 'usd8-mainnet', createdAt: '2026-10-17' }], snapshotGb: 50, snapshots: 1 },
    dynamodb: [{ name: 'usd8-score-checkpoints', items: 113, bytes: 40000 }],
    kms: [{ id: 'a', state: 'Enabled' }, { id: 'b', state: 'PendingDeletion' }],
    lambdaConcurrency: { limit: 1000, unreserved: 1000 },
  } },
  drpc: { updatedAt: at, error: 'TOKEN_NOT_SET' },
  providers: { updatedAt: at, data: {
    providers: [{ name: 'PublicNode', role: 'Site primary RPC (free)', ok: true, ms: 106, detail: 'block 1' },
      { name: 'Blockscout', role: 'Activity (free)', ok: false, ms: null, detail: 'timeout' }],
    feeds: [{ name: 'USDC / USD', address: '0x8f', updatedAt: at - 7200, ageSeconds: 7200, limitSeconds: 129600, ok: true }],
  } },
  analytics: { updatedAt: at, data: {
    days: Array.from({ length: 30 }, (_, i) => ({ date: `2026-09-${String(i + 1).padStart(2, '0')}`, visitors: i === 28 ? 41 : 2, views: 5 })),
    today: { date: '2026-09-30', visitors: 7, views: 9 }, yesterday: { date: '2026-09-29', visitors: 41, views: 80 },
    visitors30d: 135, views30d: 503, liveVisitors: 4, liveCountries: [{ country: 'Germany', visitors: 3 }, { country: 'Netherlands', visitors: 1 }],
  } },
  web: { updatedAt: at, data: {
    pages: { domain: 'usd8.fi', status: 'built', builtAt: '2026-10-18T07:22:50Z', httpsEnforced: true, certState: 'approved', certDomains: ['usd8.fi'], certExpires: '2026-11-24' },
    domains: [
      { name: 'usd8.fi', role: 'site', expires: '2027-08-12T12:50:10+03:00', daysLeft: 298, registrar: 'Hostinger', certExpires: '2026-11-24', certDaysLeft: 37 },
      { name: 'usd8.finance', role: 'redirect', expires: '2027-06-22T19:43:39.512Z', daysLeft: 247, registrar: 'Porkbun LLC', certExpires: '2026-12-22', certDaysLeft: 65,
        redirectOk: false, redirects: [{ from: 'http://usd8.finance/', final: 'https://usd8.fi/', ok: true }, { from: 'https://www.usd8.finance/', error: 'timeout', ok: false }] },
    ],
  } },
};

beforeEach(() => { mocks.fetchServices.mockReset(); });

describe('ExternalServices', () => {
  it('shows the AWS bill, budget, usage, providers and website status', async () => {
    mocks.fetchServices.mockResolvedValue(SERVICES);
    render(<Page now={at * 1000} />);
    const aws = await screen.findByRole('region', { name: 'AWS' });
    // Bill: this month only, no month-by-month table.
    expect(within(aws).getAllByText('$2.29').length).toBeGreaterThan(0);
    expect(within(aws).getByText('$3.93')).toBeInTheDocument();
    expect(within(aws).queryByText('Aug 2026')).toBeNull();
    expect(within(aws).getByText(/Budget usd8-monthly-usage: \$2\.29 of \$300\.00 before credits/)).toBeInTheDocument();
    expect(within(aws).getByText('AWS Key Management Service')).toBeInTheDocument();
    expect(within(aws).queryByText('AWS Lambda')).toBeNull();
    // Usage folded into totals; detail only for what needs attention.
    expect(within(aws).getByText('167')).toBeInTheDocument();
    expect(within(aws).getByText('10')).toBeInTheDocument();
    expect(within(aws).getByText(formatBytes(41500))).toBeInTheDocument();
    expect(within(aws).getByText('usd8-score-api: 0 errors, 10 throttles (7d)')).toHaveClass('sd-svc-warn');
    expect(screen.queryByRole('region', { name: 'AWS Usage' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'AWS Costs' })).toBeNull();

    const providers = screen.getByRole('region', { name: 'RPC And Data Providers' });
    expect(within(providers).getByText(/security add-generic-password -a "\$USER" -s usd8-drpc-stats-token -w/)).toBeInTheDocument();
    expect(within(providers).getByText('Blockscout').closest('tr')).toHaveClass('sd-warn');
    expect(within(providers).getByText('2h 0m ago')).toBeInTheDocument();
    const web = screen.getByRole('region', { name: 'Website And Domain' });
    expect(within(web).getByText('usd8.fi (www.usd8.fi pending)')).toHaveClass('sd-svc-warn');
    expect(within(web).getByText('2027-08-12 · 298 days')).toBeInTheDocument();
    expect(within(web).getByText('Main Site')).toBeInTheDocument();
    expect(within(web).getByText('Porkbun LLC')).toBeInTheDocument();
    expect(within(web).getByText('Redirect Broken (1 of 2 OK)').closest('tr')).toHaveClass('sd-warn');
  });

  it('shows a healthy redirect domain in green', async () => {
    const ok = { ...SERVICES, web: { ...SERVICES.web, data: { ...SERVICES.web.data, domains: [{ ...SERVICES.web.data.domains[1], redirectOk: true,
      redirects: [1, 2, 3, 4].map((n) => ({ from: `u${n}`, final: 'https://usd8.fi/', ok: true })) }] } } };
    mocks.fetchServices.mockResolvedValue(ok);
    render(<Page now={at * 1000} />);
    expect(await screen.findByText('Redirects To usd8.fi (4 of 4 entry URLs)')).toHaveClass('sd-svc-ok');
  });

  it('refreshes Cost Explorer only on request', async () => {
    mocks.fetchServices.mockResolvedValue(SERVICES);
    render(<Page now={at * 1000} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Refresh Costs' }));
    await waitFor(() => expect(mocks.fetchServices).toHaveBeenLastCalledWith({ refresh: ['costs'] }));
  });

  it('shows dRPC balance and usage once the token is set', async () => {
    mocks.fetchServices.mockResolvedValue({ ...SERVICES, drpc: { updatedAt: at, data: {
      balance: 42.5, day: { requests: 120, cu: 2400, methods: [] },
      month: { requests: 3000, cu: 60000, methods: [{ name: 'eth_call', requests: 2000, cu: 40000 }] } } } });
    render(<Page now={at * 1000} />);
    const providers = await screen.findByRole('region', { name: 'RPC And Data Providers' });
    expect(await within(providers).findByText('$42.50')).toBeInTheDocument();
    expect(within(providers).getByText('120 / 3000')).toBeInTheDocument();
    expect(within(providers).getByText('eth_call')).toBeInTheDocument();
  });

  it('fails closed outside the local dashboard server', async () => {
    mocks.fetchServices.mockRejectedValue(new Error('LOCAL_ONLY'));
    render(<Page now={at * 1000} />);
    expect(await screen.findByText('External services are shown only by the local dashboard server')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'AWS' })).toBeNull();
  });

  it('formats without thousands separators', () => {
    expect(count(1000000)).toBe('1000000');
    expect(dollars(2.294)).toBe('$2.29');
    expect(dollars(-7.25)).toBe('-$7.25');
    expect(dollars(-0.001)).toBe('$0.00');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });
  it('shows website visitors: live, today, yesterday, 30-day total and a 30-day daily chart', async () => {
    mocks.fetchServices.mockResolvedValue(SERVICES);
    render(<Page now={at * 1000} />);
    const ga = await screen.findByRole('region', { name: 'Website Visitors' });
    expect(within(ga).getByText('Live Now').nextSibling).toHaveTextContent('4');
    expect(within(ga).getByText('Today').nextSibling).toHaveTextContent('7');
    expect(within(ga).getByText('Yesterday').nextSibling).toHaveTextContent('41');
    expect(within(ga).getByText('Visitors 30D').nextSibling).toHaveTextContent('135');
    expect(within(ga).getByRole('img', { name: 'Daily visitors, past 30 days' }).children).toHaveLength(30);
    expect(within(ga).getByText('Peak 41/day')).toBeInTheDocument();
    // Every bar is labelled with its own visitor count.
    const values = [...within(ga).getByRole('img', { name: 'Daily visitors, past 30 days' }).querySelectorAll('.sd-ga-value')].map((node) => node.textContent);
    expect(values).toHaveLength(30);
    expect(values[28]).toBe('41');
    expect(values[0]).toBe('2');
    expect(within(ga).getByText(/live: Germany 3, Netherlands 1/)).toBeInTheDocument();
  });
});
