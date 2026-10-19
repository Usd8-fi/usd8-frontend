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
const monthLabel = (month, partial) => {
  const name = new Date(`${month}-01T00:00:00Z`).toLocaleString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  return partial ? `${name} (To Date)` : name;
};

function SectionError({ section, label }) {
  if (!section?.error) return null;
  return <p className="sd-empty">{`${label} unavailable: ${section.error}`}{section.data ? ' (showing last good data)' : ''}</p>;
}

function AwsCosts({ section, onRefresh, refreshing }) {
  const data = section?.data;
  const current = data?.months.at(-1);
  const budget = data?.budget;
  return (
    <Panel
      title="AWS Costs"
      note={section ? `Cost Explorer · cached daily · as of ${hhmm(section.updatedAt)}` : ''}
      action={<button type="button" className="sd-action" onClick={onRefresh} disabled={refreshing}>{refreshing ? <LoadingSpinner /> : 'Refresh Costs'}</button>}
    >
      <SectionError section={section} label="AWS costs" />
      {!data ? (!section?.error ? <LoadingSpinner label="Loading AWS costs" /> : null) : (
        <>
          <div className="sd-metrics sd-metrics-4">
            <Metric label="Usage This Month">{dollars(current?.usage) ?? '—'}</Metric>
            <Metric label="Forecast This Month">{dollars(data.forecastMonth) ?? '—'}</Metric>
            <Metric label="Credits Applied">{dollars(current ? -current.credits : null) ?? '—'}</Metric>
            <Metric label="You Pay This Month">{dollars(current?.net === 0 ? 0 : current?.net) ?? '—'}</Metric>
          </div>
          {budget ? (
            <p className="sd-svc-line">
              {`Budget ${budget.name}: ${dollars(budget.actual ?? 0)} of ${dollars(budget.limit)} (usage before credits) · email alerts at `}
              {budget.alerts.map((alert) => `${alert.type === 'Forecasted' ? 'forecast ' : ''}${dollars(alert.threshold)}`).join(', ')}
            </p>
          ) : <p className="sd-svc-line sd-svc-warn">No AWS budget alert configured</p>}
          <div className="sd-svc-grid">
            <table className="sd-scores">
              <thead><tr><th>Month</th><th className="sd-right">Usage</th><th className="sd-right">Credits</th><th className="sd-right">You Pay</th></tr></thead>
              <tbody>
                {data.months.map((month) => (
                  <tr key={month.month}>
                    <td>{monthLabel(month.month, month.partial)}</td>
                    <td className="sd-right">{dollars(month.usage)}</td>
                    <td className="sd-right">{dollars(month.credits === 0 ? 0 : month.credits)}</td>
                    <td className="sd-right">{dollars(Math.abs(month.net) < 0.005 ? 0 : month.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="sd-scores">
              <thead><tr><th>Service (This Month)</th><th className="sd-right">Usage</th></tr></thead>
              <tbody>
                {data.services.filter((row) => row.usage >= 0.01).slice(0, 6).map((row) => (
                  <tr key={row.service}><td>{row.service}</td><td className="sd-right">{dollars(row.usage)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.freeTier?.length ? (
            <table className="sd-scores">
              <thead><tr><th>Free Tier</th><th className="sd-right">Used</th><th className="sd-right">Limit</th><th className="sd-right">Month Forecast</th></tr></thead>
              <tbody>
                {data.freeTier.slice(0, 4).map((row) => (
                  <tr key={`${row.service}-${row.usageType}`} className={row.forecastPercent >= 80 ? 'sd-warn' : ''}>
                    <td>{`${row.service} · ${row.usageType}`}</td>
                    <td className="sd-right">{count(row.used)}</td>
                    <td className="sd-right">{count(row.limit)}</td>
                    <td className="sd-right">{`${row.forecastPercent}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          <p className="sd-svc-foot">Remaining promotional credit balance is not available from the AWS API · each cost refresh calls Cost Explorer ({data.costExplorerCallsPerRefresh} × $0.01)</p>
        </>
      )}
    </Panel>
  );
}

function AwsUsage({ section, now }) {
  const data = section?.data;
  const nowSeconds = Math.floor(now / 1000);
  const pendingKeys = data?.kms.filter((key) => key.state === 'PendingDeletion').length ?? 0;
  return (
    <Panel title="AWS Usage" note={section ? `CloudWatch and service APIs · as of ${hhmm(section.updatedAt)}` : ''}>
      <SectionError section={section} label="AWS usage" />
      {!data ? (!section?.error ? <LoadingSpinner label="Loading AWS usage" /> : null) : (
        <>
          <div className="sd-metrics sd-metrics-4">
            <Metric label="TEE Workers Running">{count(data.ec2.running.length)}</Metric>
            <Metric label="Lambda Concurrency Limit">{count(data.lambdaConcurrency.limit)}</Metric>
            <Metric label="Enclave Images">{`${data.ec2.images.length} · ${data.ec2.snapshotGb} GB snapshots`}</Metric>
            <Metric label="KMS Keys">{`${data.kms.length - pendingKeys} active${pendingKeys ? ` · ${pendingKeys} pending deletion` : ''}`}</Metric>
          </div>
          <table className="sd-scores">
            <thead><tr><th>Lambda Function</th><th className="sd-right">Calls 24h</th><th className="sd-right">Calls 7d</th><th className="sd-right">Errors 7d</th><th className="sd-right">Throttles 7d</th><th className="sd-right">Avg 24h</th></tr></thead>
            <tbody>
              {data.lambdas.map((fn) => (
                <tr key={fn.name} className={fn['7d'].Errors || fn['7d'].Throttles ? 'sd-warn' : ''}>
                  <td className="sd-mono">{fn.name}</td>
                  <td className="sd-right">{count(fn['24h'].Invocations)}</td>
                  <td className="sd-right">{count(fn['7d'].Invocations)}</td>
                  <td className="sd-right">{count(fn['7d'].Errors)}</td>
                  <td className="sd-right">{count(fn['7d'].Throttles)}</td>
                  <td className="sd-right">{fn['24h'].avgMs === null ? '—' : `${fn['24h'].avgMs} ms`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sd-svc-grid">
            <table className="sd-scores">
              <thead><tr><th>API Gateway</th><th className="sd-right">Requests 24h</th><th className="sd-right">7d</th><th className="sd-right">5xx 7d</th></tr></thead>
              <tbody>
                {data.gateways.map((api) => (
                  <tr key={api.id} className={api['7d']['5xx'] ? 'sd-warn' : ''}>
                    <td className="sd-mono" title={api.id}>{api.name}</td>
                    <td className="sd-right">{count(api['24h'].Count)}</td>
                    <td className="sd-right">{count(api['7d'].Count)}</td>
                    <td className="sd-right">{count(api['7d']['5xx'])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="sd-scores">
              <thead><tr><th>Storage</th><th className="sd-right">Objects / Items</th><th className="sd-right">Size</th></tr></thead>
              <tbody>
                {data.s3.map((bucket) => (
                  <tr key={bucket.name}><td className="sd-mono" title={bucket.name}>{`S3 ${bucket.name.replace(/-\d{12}-eu-central-1$/, '')}`}</td>
                    <td className="sd-right">{count(bucket.objects) ?? '—'}</td><td className="sd-right">{formatBytes(bucket.bytes) ?? '—'}</td></tr>
                ))}
                {data.dynamodb.map((table) => (
                  <tr key={table.name}><td className="sd-mono">{`DynamoDB ${table.name}`}</td>
                    <td className="sd-right">{count(table.items)}</td><td className="sd-right">{formatBytes(table.bytes)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.ec2.running.length ? (
            <p className="sd-svc-line">{data.ec2.running.map((instance) => `${instance.id} ${instance.type} ${instance.state} for ${ageText(nowSeconds - Math.floor(Date.parse(instance.launchedAt) / 1000))}`).join(' · ')}</p>
          ) : null}
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

/// External services the protocol depends on. Data comes only from the local
/// dashboard server; anywhere else this section says so and shows nothing.
export default function ExternalServices({ now }) {
  const [state, setState] = useState({ value: null, error: '' });
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const load = () => fetchServices({ signal: controller.signal })
      .then((value) => setState({ value, error: '' }))
      .catch((error) => { if (!controller.signal.aborted) setState((old) => ({ ...old, error: error?.message || 'Unavailable' })); });
    load();
    const stop = onForegroundRefresh(load, { intervalMs: SERVICES_REFRESH_MS, eventGapMs: SERVICES_REFRESH_MS });
    return () => { controller.abort(); stop(); };
  }, []);
  const refreshCosts = () => {
    setRefreshing(true);
    fetchServices({ refresh: ['costs'] })
      .then((value) => setState({ value, error: '' }))
      .catch((error) => setState((old) => ({ ...old, error: error?.message || 'Unavailable' })))
      .finally(() => setRefreshing(false));
  };
  const { value, error } = state;
  if (error === 'LOCAL_ONLY' && !value) {
    return <Panel title="External Services"><p className="sd-empty">External services are shown only by the local dashboard server</p></Panel>;
  }
  if (error && !value) {
    return <Panel title="External Services"><p className="sd-empty">{`External services unavailable: ${error}`}</p></Panel>;
  }
  return (
    <>
      <h2 className="sd-section-title">External Services</h2>
      <AwsCosts section={value?.costs} onRefresh={refreshCosts} refreshing={refreshing} />
      <AwsUsage section={value?.aws} now={now} />
      <Providers drpc={value?.drpc} providers={value?.providers} now={now} />
      <Website section={value?.web} />
    </>
  );
}
