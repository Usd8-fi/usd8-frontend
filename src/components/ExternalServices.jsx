import { useEffect, useState } from 'react';
import { onForegroundRefresh } from '../lib/foregroundRefresh.js';
import { count, dollars, fetchServices, formatBytes } from '../lib/servicesStatus.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import { Metric, Panel } from './SystemDashboardParts.jsx';

// The local server caches each source (Cost Explorer daily, the rest for
// minutes), so polling it every 5 minutes costs nothing extra.
const SERVICES_REFRESH_MS = 5 * 60_000;
const DRPC_TOKEN_COMMAND = 'security add-generic-password -a "$USER" -s usd8-drpc-stats-token -w';

const utc = (seconds) => `${new Date(seconds * 1000).toISOString().slice(5, 16).replace('T', ' ')} UTC`;
const hhmm = (seconds) => `${new Date(seconds * 1000).toISOString().slice(11, 16)} UTC`;
function ageText(seconds) {
  if (seconds === null || seconds === undefined) return '—';
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))}m`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86_400)}d ${Math.round((seconds % 86_400) / 3600)}h`;
}

function SectionError({ section, label }) {
  if (!section?.error) return null;
  return <p className="sd-empty">{`${label} unavailable: ${section.error}`}{section.data ? ' (showing last good data)' : ''}</p>;
}

/// One AWS panel: this month's bill on top, then live usage as a few totals.
/// Detail rows appear only when something needs attention.
function Aws({ costs, usage, onRefresh, refreshing, now }) {
  const bill = costs?.data;
  const live = usage?.data;
  const current = bill?.months.at(-1);
  const budget = bill?.budget;
  const nowSeconds = Math.floor(now / 1000);
  const sum = (rows, read) => (rows ?? []).reduce((total, row) => total + (Number(read(row)) || 0), 0);
  const failingLambdas = (live?.lambdas ?? []).filter((fn) => fn['7d'].Errors || fn['7d'].Throttles);
  const failingGateways = (live?.gateways ?? []).filter((api) => api['7d']['5xx']);
  const freeTierWarnings = (bill?.freeTier ?? []).filter((row) => row.forecastPercent >= 80);
  const notes = [
    costs ? `costs as of ${hhmm(costs.updatedAt)}` : '',
    usage ? `usage as of ${hhmm(usage.updatedAt)}` : '',
  ].filter(Boolean).join(' · ');
  return (
    <Panel
      title="AWS"
      note={notes}
      action={<button type="button" className="sd-action" onClick={onRefresh} disabled={refreshing}>{refreshing ? <LoadingSpinner /> : 'Refresh Costs'}</button>}
    >
      <SectionError section={costs} label="AWS costs" />
      <SectionError section={usage} label="AWS usage" />
      {!bill ? (!costs?.error ? <LoadingSpinner label="Loading AWS costs" /> : null) : (
        <div className="sd-metrics sd-metrics-4">
          <Metric label="Cost This Month">{dollars(current?.usage) ?? '—'}</Metric>
          <Metric label="Forecast This Month">{dollars(bill.forecastMonth) ?? '—'}</Metric>
          <Metric label="Credits Applied">{dollars(current ? -current.credits : null) ?? '—'}</Metric>
          <Metric label="You Pay This Month">{dollars(current?.net === 0 ? 0 : current?.net) ?? '—'}</Metric>
        </div>
      )}
      {!live ? (!usage?.error ? <LoadingSpinner label="Loading AWS usage" /> : null) : (
        <div className="sd-metrics sd-metrics-4">
          <Metric label="TEE Workers Running">{count(live.ec2.running.length)}</Metric>
          <Metric label="Lambda Calls 24h">{count(sum(live.lambdas, (fn) => fn['24h'].Invocations))}</Metric>
          <Metric label="Errors 7d">{count(sum(live.lambdas, (fn) => fn['7d'].Errors + fn['7d'].Throttles) + sum(live.gateways, (api) => api['7d']['5xx']))}</Metric>
          <Metric label="Storage">{formatBytes(sum(live.s3, (bucket) => bucket.bytes) + sum(live.dynamodb, (table) => table.bytes)) ?? '—'}</Metric>
        </div>
      )}
      {bill ? (
        <table className="sd-scores">
          <thead><tr><th>Cost By Service (This Month)</th><th className="sd-right">Cost</th></tr></thead>
          <tbody>
            {bill.services.filter((row) => row.usage >= 0.01).slice(0, 6).map((row) => (
              <tr key={row.service}><td>{row.service}</td><td className="sd-right">{dollars(row.usage)}</td></tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {failingLambdas.length || failingGateways.length ? (
        <p className="sd-svc-line sd-svc-warn">
          {[...failingLambdas.map((fn) => `${fn.name}: ${fn['7d'].Errors} errors, ${fn['7d'].Throttles} throttles (7d)`),
            ...failingGateways.map((api) => `${api.name}: ${api['7d']['5xx']} 5xx (7d)`)].join(' · ')}
        </p>
      ) : null}
      {freeTierWarnings.length ? (
        <p className="sd-svc-line sd-svc-warn">{freeTierWarnings.map((row) => `Free tier ${row.service} · ${row.usageType}: ${row.forecastPercent}% forecast this month`).join(' · ')}</p>
      ) : null}
      {live?.ec2.running.length ? (
        <p className="sd-svc-line">{live.ec2.running.map((instance) => `${instance.id} ${instance.type} running for ${ageText(nowSeconds - Math.floor(Date.parse(instance.launchedAt) / 1000))}`).join(' · ')}</p>
      ) : null}
      {bill ? (
        budget ? (
          <p className="sd-svc-foot">{`Budget ${budget.name}: ${dollars(budget.actual ?? 0)} of ${dollars(budget.limit)} before credits · each cost refresh calls Cost Explorer (${bill.costExplorerCallsPerRefresh} × $0.01)`}</p>
        ) : <p className="sd-svc-line sd-svc-warn">No AWS budget alert configured</p>
      ) : null}
    </Panel>
  );
}

const dayLabel = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/// Google Analytics (GA4, read-only): live visitors, today, yesterday, and a
/// static 30-day daily-visitors chart. Bars carry their values as tooltips.
function Analytics({ section, onRefresh, refreshing }) {
  const data = section?.data;
  const days = data?.days ?? [];
  const peak = Math.max(1, ...days.map((day) => day.visitors));
  return (
    <Panel
      title="Website Visitors"
      note={section ? `Google Analytics · as of ${hhmm(section.updatedAt)}` : 'Google Analytics'}
      action={<button type="button" className="sd-action" onClick={onRefresh} disabled={refreshing}>{refreshing ? <LoadingSpinner /> : 'Refresh'}</button>}
    >
      <SectionError section={section} label="Google Analytics" />
      {!data ? (!section?.error ? <LoadingSpinner label="Loading Google Analytics" /> : null) : (
        <>
          <div className="sd-metrics sd-metrics-4">
            <Metric label="Live Now">{count(data.liveVisitors)}</Metric>
            <Metric label="Today">{count(data.today?.visitors ?? 0)}</Metric>
            <Metric label="Yesterday">{count(data.yesterday?.visitors ?? 0)}</Metric>
            <Metric label="Visitors 30D">{count(data.visitors30d)}</Metric>
          </div>
          <div className="sd-ga-chart" role="img" aria-label={`Daily visitors, past ${days.length} days`}>
            {days.map((day) => (
              <span key={day.date} className="sd-ga-bar" title={`${dayLabel(day.date)}: ${day.visitors} visitors, ${day.views} views`}>
                <span className="sd-ga-fill" style={{ height: `${(day.visitors / peak) * 100}%` }}>
                  <span className="sd-ga-value">{day.visitors}</span>
                </span>
              </span>
            ))}
          </div>
          {days.length ? (
            <div className="sd-ga-axis"><span>{dayLabel(days[0].date)}</span><span>{`Peak ${peak}/day`}</span><span>{dayLabel(days.at(-1).date)}</span></div>
          ) : null}
          <p className="sd-svc-foot">
            {`${count(data.views30d)} page views in 30 days`}
            {data.liveCountries?.length ? ` · live: ${data.liveCountries.map((row) => `${row.country} ${row.visitors}`).join(', ')}` : ''}
            {' · today fills in as Google processes it (a few hours behind); Live Now is the last 30 minutes'}
          </p>
        </>
      )}
    </Panel>
  );
}

function Providers({ drpc, providers, now }) {
  const nowSeconds = Math.floor(now / 1000);
  const d = drpc?.data;
  const p = providers?.data;
  const tokenMissing = drpc?.error === 'TOKEN_NOT_SET';
  return (
    <Panel title="RPC And Data Providers" note={providers ? `as of ${hhmm(providers.updatedAt)}` : ''}>
      <span className="sd-label">dRPC (Paid, TEE And Job API)</span>
      {tokenMissing ? (
        <p className="sd-svc-line">
          Add your dRPC Statistics API token (dRPC Dashboard → Settings → Statistics API) to the macOS Keychain to show balance and usage:
          <code className="sd-svc-code">{DRPC_TOKEN_COMMAND}</code>
        </p>
      ) : (
        <>
          <SectionError section={drpc} label="dRPC statistics" />
          {!d ? (!drpc?.error ? <LoadingSpinner label="Loading dRPC statistics" /> : null) : (
            <>
              <div className="sd-metrics sd-metrics-4">
                <Metric label="Balance">{d.balance === null || d.balance === undefined ? '—' : `$${Number(d.balance).toFixed(2)}`}</Metric>
                <Metric label="Requests 24h / 30d">{`${count(d.day.requests)} / ${count(d.month.requests)}`}</Metric>
                <Metric label="Compute Units 24h">{count(d.day.cu)}</Metric>
                <Metric label="Compute Units 30d">{count(d.month.cu)}</Metric>
              </div>
              {d.month.methods.length ? (
                <table className="sd-scores">
                  <thead><tr><th>Top Methods (30d)</th><th className="sd-right">Requests</th><th className="sd-right">Compute Units</th></tr></thead>
                  <tbody>{d.month.methods.slice(0, 5).map((row) => (
                    <tr key={row.name}><td className="sd-mono">{row.name}</td><td className="sd-right">{count(row.requests)}</td><td className="sd-right">{count(row.cu)}</td></tr>
                  ))}</tbody>
                </table>
              ) : null}
            </>
          )}
        </>
      )}
      <SectionError section={providers} label="Provider checks" />
      {!p ? (!providers?.error ? <LoadingSpinner label="Checking providers" /> : null) : (
        <div className="sd-svc-grid">
          <table className="sd-scores">
            <thead><tr><th>Free Provider</th><th>Used For</th><th>Status</th><th className="sd-right">Latency</th></tr></thead>
            <tbody>{p.providers.map((row) => (
              <tr key={row.name} className={row.ok ? '' : 'sd-warn'}>
                <td>{row.name}</td><td>{row.role}</td>
                <td title={row.detail}>{row.ok ? <span className="sd-svc-ok">Up</span> : 'Down'}</td>
                <td className="sd-right">{row.ms === null ? '—' : `${row.ms} ms`}</td>
              </tr>
            ))}</tbody>
          </table>
          <table className="sd-scores">
            <thead><tr><th>Chainlink Feed</th><th className="sd-right">Last Update</th><th className="sd-right">TEE Limit</th></tr></thead>
            <tbody>{p.feeds.map((feed) => (
              <tr key={feed.name} className={feed.ok ? '' : 'sd-warn'}>
                <td title={feed.address}>{feed.name}</td>
                <td className="sd-right">{feed.updatedAt ? `${ageText(nowSeconds - feed.updatedAt)} ago` : '—'}</td>
                <td className="sd-right">{feed.limitSeconds ? ageText(feed.limitSeconds) : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <p className="sd-svc-foot">PublicNode, Tenderly, Blockscout and Morpho publish no usage or billing API; their rows are live health checks</p>
    </Panel>
  );
}

function Website({ section }) {
  const data = section?.data;
  const pages = data?.pages;
  const wwwCovered = pages?.certDomains?.includes('www.usd8.fi');
  const soon = (days, limit) => (days !== null && days !== undefined && days < limit ? 'sd-svc-warn' : '');
  return (
    <Panel title="Website And Domain" note={section ? `GitHub Pages, RDAP and live redirect checks · as of ${hhmm(section.updatedAt)}` : ''}>
      <SectionError section={section} label="Website status" />
      {!data ? (!section?.error ? <LoadingSpinner label="Loading website status" /> : null) : (
        <>
          <div className="sd-metrics sd-metrics-4">
            <Metric label="GitHub Pages Build">{pages?.error ? '—' : `${pages.status === 'built' ? 'Built' : pages.status} · ${pages.builtAt ? utc(Math.floor(Date.parse(pages.builtAt) / 1000)) : '—'}`}</Metric>
            <Metric label="Pages Certificate">{pages?.error ? '—' : `${pages.certState === 'approved' ? 'Approved' : pages.certState} · expires ${pages.certExpires ?? '—'}`}</Metric>
            <Metric label="Certificate Covers">{pages?.error ? '—' : <span className={wwwCovered ? '' : 'sd-svc-warn'}>{`${pages.certDomains.join(', ') || '—'}${wwwCovered ? '' : ' (www.usd8.fi pending)'}`}</span>}</Metric>
            <Metric label="HTTPS Enforced">{pages?.error ? '—' : pages.httpsEnforced ? 'Yes' : <span className="sd-svc-warn">No</span>}</Metric>
          </div>
          <table className="sd-scores">
            <thead><tr><th>Domain</th><th>Registrar</th><th className="sd-right">Registration Expires</th><th className="sd-right">TLS Certificate</th><th>Status</th></tr></thead>
            <tbody>
              {(data.domains ?? []).map((domain) => {
                const redirectBroken = domain.role === 'redirect' && !domain.redirectOk;
                return (
                  <tr key={domain.name} className={redirectBroken || (domain.daysLeft ?? 999) < 30 ? 'sd-warn' : ''}>
                    <td>{domain.name}</td>
                    <td>{domain.registrar ?? '—'}</td>
                    <td className={`sd-right ${soon(domain.daysLeft, 60)}`}>{domain.expires ? `${domain.expires.slice(0, 10)} · ${domain.daysLeft} days${domain.rdapStale ? ' (cached)' : ''}` : '—'}</td>
                    <td className={`sd-right ${soon(domain.certDaysLeft, 14)}`}>{domain.certExpires ? `${domain.certExpires} · ${domain.certDaysLeft} days` : '—'}</td>
                    <td title={(domain.redirects ?? []).map((check) => `${check.from} → ${check.final ?? check.error}`).join('\n')}>
                      {domain.role === 'site' ? 'Main Site'
                        : domain.redirectOk ? <span className="sd-svc-ok">{`Redirects To usd8.fi (${domain.redirects.length} of ${domain.redirects.length} entry URLs)`}</span>
                          : `Redirect Broken (${(domain.redirects ?? []).filter((check) => check.ok).length} of ${(domain.redirects ?? []).length} OK)`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </Panel>
  );
}

/// Loads the local dashboard server's services summary once for the whole page,
/// so Website Traffic and External Services can sit in different places.
export function useServices() {
  const [state, setState] = useState({ value: null, error: '' });
  const [refreshing, setRefreshing] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const load = () => fetchServices({ signal: controller.signal })
      .then((value) => setState({ value, error: '' }))
      .catch((error) => { if (!controller.signal.aborted) setState((old) => ({ ...old, error: error?.message || 'Unavailable' })); });
    load();
    const stop = onForegroundRefresh(load, { intervalMs: SERVICES_REFRESH_MS, eventGapMs: SERVICES_REFRESH_MS });
    return () => { controller.abort(); stop(); };
  }, []);
  const refresh = (section) => {
    setRefreshing(section);
    fetchServices({ refresh: [section] })
      .then((value) => setState({ value, error: '' }))
      .catch((error) => setState((old) => ({ ...old, error: error?.message || 'Unavailable' })))
      .finally(() => setRefreshing(''));
  };
  return { ...state, refreshing, refresh };
}

/// Website visitors from Google Analytics (local dashboard server only).
export function WebsiteTraffic({ services }) {
  const analytics = services.value?.analytics;
  if (!analytics) return null;
  return (
    <>
      <h2 className="sd-section-title">Website Traffic</h2>
      <Analytics section={analytics} onRefresh={() => services.refresh('analytics')} refreshing={services.refreshing === 'analytics'} />
    </>
  );
}

/// External services the protocol depends on. Data comes only from the local
/// dashboard server; anywhere else this section says so and shows nothing.
export default function ExternalServices({ now, services }) {
  const { value, error } = services;
  if (error === 'LOCAL_ONLY' && !value) {
    return <Panel title="External Services"><p className="sd-empty">External services are shown only by the local dashboard server</p></Panel>;
  }
  if (error && !value) {
    return <Panel title="External Services"><p className="sd-empty">{`External services unavailable: ${error}`}</p></Panel>;
  }
  return (
    <>
      <h2 className="sd-section-title">External Services</h2>
      <Aws costs={value?.costs} usage={value?.aws} onRefresh={() => services.refresh('costs')} refreshing={services.refreshing === 'costs'} now={now} />
      <Providers drpc={value?.drpc} providers={value?.providers} now={now} />
      <Website section={value?.web} />
    </>
  );
}
