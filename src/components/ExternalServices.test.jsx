import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetchServices: vi.fn() }));
vi.mock('../lib/servicesStatus.js', async importOriginal => ({ ...(await importOriginal()), fetchServices: mocks.fetchServices }));
import ExternalServices from './ExternalServices.jsx';
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
    render(<ExternalServices now={at * 1000} />);
    const costs = await screen.findByRole('region', { name: 'AWS Costs' });
    expect(within(costs).getByText('Aug 2026')).toBeInTheDocument();
    expect(within(costs).getByText('Oct 2026 (To Date)')).toBeInTheDocument();
    expect(within(costs).getByText('$10.12')).toBeInTheDocument();
    expect(within(costs).getByText('$3.93')).toBeInTheDocument();
    expect(within(costs).getByText(/Budget usd8-monthly-usage: \$2\.29 of \$300\.00 .*\$100\.00, \$300\.00, forecast \$100\.00/)).toBeInTheDocument();
    expect(within(costs).getByText('AWS Key Management Service')).toBeInTheDocument();
    expect(within(costs).queryByText('AWS Lambda')).toBeNull();
    const usage = screen.getByRole('region', { name: 'AWS Usage' });
    expect(within(usage).getByText('1 active · 1 pending deletion')).toBeInTheDocument();
    expect(within(usage).getAllByText('usd8-score-api', { selector: 'td' })[0].closest('tr')).toHaveClass('sd-warn');
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
    render(<ExternalServices now={at * 1000} />);
    expect(await screen.findByText('Redirects To usd8.fi (4 of 4 entry URLs)')).toHaveClass('sd-svc-ok');
  });

  it('refreshes Cost Explorer only on request', async () => {
    mocks.fetchServices.mockResolvedValue(SERVICES);
    render(<ExternalServices now={at * 1000} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Refresh Costs' }));
    await waitFor(() => expect(mocks.fetchServices).toHaveBeenLastCalledWith({ refresh: ['costs'] }));
  });

  it('shows dRPC balance and usage once the token is set', async () => {
    mocks.fetchServices.mockResolvedValue({ ...SERVICES, drpc: { updatedAt: at, data: {
      balance: 42.5, day: { requests: 120, cu: 2400, methods: [] },
      month: { requests: 3000, cu: 60000, methods: [{ name: 'eth_call', requests: 2000, cu: 40000 }] } } } });
    render(<ExternalServices now={at * 1000} />);
    const providers = await screen.findByRole('region', { name: 'RPC And Data Providers' });
    expect(await within(providers).findByText('$42.50')).toBeInTheDocument();
    expect(within(providers).getByText('120 / 3000')).toBeInTheDocument();
    expect(within(providers).getByText('eth_call')).toBeInTheDocument();
  });

  it('fails closed outside the local dashboard server', async () => {
    mocks.fetchServices.mockRejectedValue(new Error('LOCAL_ONLY'));
    render(<ExternalServices now={at * 1000} />);
    expect(await screen.findByText('External services are shown only by the local dashboard server')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'AWS Costs' })).toBeNull();
  });

  it('formats without thousands separators', () => {
    expect(count(1000000)).toBe('1000000');
    expect(dollars(2.294)).toBe('$2.29');
    expect(dollars(-7.25)).toBe('-$7.25');
    expect(dollars(-0.001)).toBe('$0.00');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });
});
