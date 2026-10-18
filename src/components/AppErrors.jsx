import { useEffect, useState } from 'react';
import { agoText, areaLabel, errorTotals, fetchAppErrors, lastDays, safeSentryLink } from '../lib/appErrors.js';
import { onForegroundRefresh } from '../lib/foregroundRefresh.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import { Metric, Panel } from './SystemDashboardParts.jsx';

// The local server caches Sentry for 2 minutes; poll every 5 like External Services.
const ERRORS_REFRESH_MS = 5 * 60_000;

function DailyBars({ days, counts }) {
  const max = Math.max(1, ...counts);
  return (
    <div className="sd-err-bars" role="img" aria-label={`Errors per day: ${days.map((day, index) => `${day} ${counts[index]}`).join(', ')}`}>
      {counts.map((value, index) => (
        <div key={days[index]} className="sd-err-bar" title={`${days[index]}: ${value}`}>
          <i style={{ height: `${(value / max) * 100}%` }} className={value ? '' : 'sd-err-zero'} />
          <span>{days[index].slice(8)}</span>
        </div>
      ))}
    </div>
  );
}

function IssueRow({ issue, now }) {
  const link = safeSentryLink(issue.link);
  const tags = [issue.release?.replace('usd8-frontend@', ''), ...(issue.browsers ?? []).map((b) => b.value), issue.pages?.[0]?.value].filter(Boolean);
  return (
    <tr>
      <td>
        <div className="sd-err-title">{link ? <a href={link} target="_blank" rel="noreferrer">{issue.title}</a> : issue.title}</div>
        <small>{`${issue.id} · ${issue.culprit}`}{issue.unhandled ? <span className="sd-svc-warn">{' · Unhandled'}</span> : null}</small>
      </td>
      <td>{areaLabel(issue.area)}</td>
      <td className="sd-right">{String(issue.events)}</td>
      <td className="sd-right">{agoText(issue.firstSeen, now)}</td>
      <td className="sd-right">{agoText(issue.lastSeen, now)}</td>
      <td>{tags.map((tag) => <span key={tag} className="sd-err-tag">{tag}</span>)}</td>
    </tr>
  );
}

/// USD8 frontend errors reported to Sentry. Data comes only from the local
/// dashboard server; anywhere else this section says so and shows nothing.
export default function AppErrors({ now }) {
  const [state, setState] = useState({ value: null, error: '' });
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const load = () => fetchAppErrors({ signal: controller.signal })
      .then((value) => setState({ value, error: '' }))
      .catch((error) => { if (!controller.signal.aborted) setState((old) => ({ ...old, error: error?.message || 'Unavailable' })); });
    load();
    const stop = onForegroundRefresh(load, { intervalMs: ERRORS_REFRESH_MS, eventGapMs: ERRORS_REFRESH_MS });
    return () => { controller.abort(); stop(); };
  }, []);
  const refresh = () => {
    setRefreshing(true);
    fetchAppErrors({ refresh: true })
      .then((value) => setState({ value, error: '' }))
      .catch((error) => setState((old) => ({ ...old, error: error?.message || 'Unavailable' })))
      .finally(() => setRefreshing(false));
  };
  const { value, error } = state;
  const data = value?.data;
  const totals = errorTotals(data);
  const updated = value?.updatedAt ? agoText(value.updatedAt, now) : null;
  const daily = lastDays(data?.daily?.data);
  return (
    <>
      <h2 className="sd-section-title">App Errors</h2>
      <Panel
        title="Frontend Errors"
        note={data ? `Sentry ${data.project} · updated ${updated}${value.error ? ` · last refresh failed: ${value.error}` : ''}` : ''}
        action={data ? <button type="button" className="sd-action" onClick={refresh} disabled={refreshing}>{refreshing ? <LoadingSpinner /> : 'Refresh Errors'}</button> : null}
      >
        {error === 'LOCAL_ONLY' && !data ? <p className="sd-empty">App errors are shown only by the local dashboard server</p>
          : error && !data ? <p className="sd-empty">{`App errors unavailable: ${error}`}</p>
            : !data ? <LoadingSpinner label="Loading app errors" /> : (
              <>
                <div className="sd-metrics sd-metrics-4">
                  <Metric label="Unresolved Issues">{totals.unresolved === null ? '—' : `${totals.unresolved}${data.unresolvedTruncated ? '+' : ''}`}</Metric>
                  <Metric label="Errors Today (UTC)">{totals.today === null ? '—' : String(totals.today)}</Metric>
                  <Metric label="Errors Last 14 Days">{totals.total14d === null ? '—' : `${totals.total14d}${totals.dropped ? ` · ${totals.dropped} dropped` : ''}`}</Metric>
                  <Metric label="Crash-Free Sessions">{totals.crashFreePercent === null ? '—' : `${totals.crashFreePercent.toFixed(2)}% · ${totals.sessions} ${totals.sessions === 1 ? 'session' : 'sessions'}`}</Metric>
                </div>
                {daily?.days?.length ? <DailyBars days={daily.days} counts={daily.byOutcome.accepted} />
                  : data.daily?.error ? <p className="sd-empty">{`Daily errors unavailable: ${data.daily.error}`}</p> : null}
                {data.unresolved.length ? (
                  <table className="sd-scores sd-err-table">
                    <thead><tr><th>Issue</th><th>Area</th><th className="sd-right">Events</th><th className="sd-right">First Seen</th><th className="sd-right">Last Seen</th><th>Release · Browser · Page</th></tr></thead>
                    <tbody>{data.unresolved.map((issue) => <IssueRow key={issue.id} issue={issue} now={now} />)}</tbody>
                  </table>
                ) : <p className="sd-empty sd-svc-ok">No unresolved errors</p>}
                <p className="sd-svc-foot">
                  {totals.lastSeen ? `Last error ${agoText(totals.lastSeen, now)} · ` : ''}
                  {'Resolve or ignore issues in '}
                  <a href={data.projectLink?.startsWith('https://usd8fi.sentry.io/') ? data.projectLink : 'https://usd8fi.sentry.io/issues/'} target="_blank" rel="noreferrer">Sentry</a>
                  {' · wallet rejections are not reported · addresses are shortened in the browser'}
                </p>
              </>
            )}
      </Panel>
    </>
  );
}
