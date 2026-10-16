import { useEffect, useRef, useState } from 'react';
import usd8Logo from '../assets/usd8Logo.svg';
import usd8Wordmark from '../assets/usd8-wordmark.svg';
import { fetchActivity } from '../lib/activityFeed.js';
import { cachedData, protocolKey } from '../lib/dataCache.js';
import { onForegroundRefresh } from '../lib/foregroundRefresh.js';
import { getProtocolNetwork, PROTOCOL_CHAIN_ID } from '../lib/networkConfig.js';
import { useSecondClock } from '../lib/secondClock.js';
import { loadSystemDashboard, sumSeries } from '../lib/systemDashboard.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import PercentRing from './PercentRing.jsx';
import './SystemDashboard.css';

// The dashboard is a slow-moving overview: one round of RPC reads per hour
// (and none while the tab is hidden) instead of every 30 seconds.
const REFRESH_MS = 60 * 60_000;
const STALE_AFTER_MS = REFRESH_MS + 10 * 60_000;
// Each pool keeps its asset's colour: blue for wstETH (as on the app's pool
// card), yellow reserved for a future USD8 pool. Others fall back by order.
const ASSET_COLORS = { wsteth: '#6f8cff', usd8: '#ffcc00' };
const FALLBACK_POOL_COLORS = ['#35e6ff', '#ffb53d', '#a78bff', '#ff7a59'];
const poolColor = (pool, index) => ASSET_COLORS[String(pool?.assetSymbol || '').toLowerCase()]
  ?? FALLBACK_POOL_COLORS[index % FALLBACK_POOL_COLORS.length];
const KIND_COLORS = {
  mint: '#35e6ff', redeem: '#35e6ff', deposit: '#ffcc00', save: '#ffcc00', unsave: '#ffcc00',
  exitQueued: '#ffb53d', exitCompleted: '#ffb53d', rewardClaimed: '#a78bff', rewardsAdded: '#a78bff',
  claimFiled: '#ff7a59', claimPaid: '#ff4d5e', incidentSettled: '#ff4d5e',
};
const KIND_LABELS = {
  mint: 'Mint', redeem: 'Redeem', deposit: 'Deposit', save: 'Save', unsave: 'Withdraw', exitQueued: 'Exit Queued',
  exitCompleted: 'Exit Done', rewardClaimed: 'Reward', rewardsAdded: 'Rewards', claimFiled: 'Claim Filed',
  claimPaid: 'Claim Paid', incidentSettled: 'Incident',
};

const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
const usd = value => (value === null || value === undefined ? null : `$${value.toFixed(2)}`);
const token = (value, digits = 4) => (value === null || value === undefined ? null : String(Number(value.toFixed(digits))));
const percent = value => (value === null || value === undefined ? null : `${Number(value.toFixed(1))}%`);

const stamp = seconds => `${new Date(seconds * 1000).toISOString().slice(5, 16).replace('T', ' ')} UTC`;

function hexAlpha(hex, alpha) {
  return `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
}

/// Runs `draw` on a canvas every frame while it is on screen and the tab is
/// visible. Reduced motion draws the finished frame without moving parts.
function useCanvas(draw) {
  const ref = useRef(null);
  const latest = useRef(draw);
  latest.current = draw;
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext?.('2d');
    if (!canvas || !context) return undefined;
    const still = reducedMotion();
    const born = performance.now();
    let visible = true;
    let frame = 0;
    const observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); }) : null;
    observer?.observe(canvas);
    const render = now => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(box.width * ratio);
      const height = Math.round(box.height * ratio);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, box.width, box.height);
      latest.current(context, box.width, box.height, still ? 10_000 : now - born, still);
    };
    const loop = now => {
      if (visible && !document.hidden) render(now);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, []);
  return ref;
}

/// Eases a number toward each new reading. Shows `fallback` while it is unknown.
function AnimatedNumber({ value, format, fallback = null }) {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    if (value === null || value === undefined) return undefined;
    const from = shownRef.current ?? value;
    if (from === value) { shownRef.current = value; setShown(value); return undefined; }
    if (reducedMotion()) { shownRef.current = value; setShown(value); return undefined; }
    const started = performance.now();
    let frame = 0;
    setFlash(count => count + 1);
    const step = now => {
      const k = Math.min(1, (now - started) / 1200);
      const next = from + (value - from) * (1 - (1 - k) ** 3);
      shownRef.current = next;
      setShown(next);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  if (value === null || value === undefined) return fallback;
  return <span key={flash} className={flash ? 'sd-flash' : undefined}>{format(shown ?? value)}</span>;
}

function Metric({ label, children }) {
  return <div className="sd-metric"><span>{label}</span><strong>{children}</strong></div>;
}

function Panel({ title, note, stale, children, className = '' }) {
  return (
    <section className={`sd-panel ${className}`} aria-label={title}>
      <header className="sd-panel-head">
        <h2>{title}</h2>
        {stale ? <span className="sd-stale"><LoadingSpinner />Stale</span> : null}
        {note ? <span className="sd-note">{note}</span> : null}
      </header>
      {children}
    </section>
  );
}

/// Pool value over time with a glowing head, a sweep and a draw-in.
function Sparkline({ points, color }) {
  const ref = useCanvas((context, width, height, time, still) => {
    const draw = Math.min(1, time / 900);
    context.strokeStyle = '#2c2c2c';
    context.lineWidth = 1;
    context.beginPath();
    for (let i = 1; i < 4; i += 1) { context.moveTo(0, (height * i) / 4); context.lineTo(width, (height * i) / 4); }
    context.stroke();
    if (points.length < 2) {
      context.setLineDash([3, 4]);
      context.strokeStyle = hexAlpha(color, 0.6);
      context.beginPath(); context.moveTo(0, height / 2); context.lineTo(width, height / 2); context.stroke();
      context.setLineDash([]);
      return;
    }
    const values = points.map(point => point.v);
    let low = Math.min(...values);
    let high = Math.max(...values);
    const pad = (high - low) * 0.18 || Math.abs(high) * 0.1 || 1;
    low -= pad; high += pad;
    const x = i => (i / (points.length - 1)) * (width - 6);
    const y = v => height - 4 - ((v - low) / (high - low)) * (height - 10);
    const last = Math.floor((points.length - 1) * draw);
    const fill = context.createLinearGradient(0, 0, 0, height);
    fill.addColorStop(0, hexAlpha(color, 0.38)); fill.addColorStop(1, hexAlpha(color, 0));
    context.beginPath(); context.moveTo(0, height);
    for (let i = 0; i <= last; i += 1) context.lineTo(x(i), y(points[i].v));
    context.lineTo(x(last), height); context.closePath(); context.fillStyle = fill; context.fill();
    context.beginPath();
    for (let i = 0; i <= last; i += 1) { if (i) context.lineTo(x(i), y(points[i].v)); else context.moveTo(x(i), y(points[i].v)); }
    context.strokeStyle = color; context.lineWidth = 1.5; context.shadowColor = color; context.shadowBlur = 6; context.stroke(); context.shadowBlur = 0;
    if (draw < 1) return;
    const hx = x(points.length - 1);
    const hy = y(points.at(-1).v);
    if (!still) {
      const pulse = (time / 900) % 1;
      context.beginPath(); context.arc(hx, hy, 3 + pulse * 7, 0, 7); context.strokeStyle = hexAlpha(color, 1 - pulse); context.lineWidth = 1; context.stroke();
      const sweep = ((time / 2800) % 1.5 - 0.25) * width;
      const band = context.createLinearGradient(sweep - 30, 0, sweep + 30, 0);
      band.addColorStop(0, '#ffffff00'); band.addColorStop(0.5, '#ffffff1f'); band.addColorStop(1, '#ffffff00');
      context.fillStyle = band; context.fillRect(sweep - 30, 0, 60, height);
    }
    context.beginPath(); context.arc(hx, hy, 2.6, 0, 7); context.fillStyle = '#fff'; context.shadowColor = color; context.shadowBlur = 8; context.fill(); context.shadowBlur = 0;
  });
  return <canvas ref={ref} className="sd-spark" aria-hidden="true" />;
}

/// Trailing APY per pool: solid 30D, dashed 7D. Hover to scrub; it scans by itself when idle.
function YieldChart({ pools }) {
  const hover = useRef(null);
  const lines = pools.flatMap((pool, index) => [
    { key: `${pool.id}-30`, label: `${pool.assetSymbol} 30D`, color: poolColor(pool, index), dash: false, points: pool.series.apy30 },
    { key: `${pool.id}-7`, label: `${pool.assetSymbol} 7D`, color: poolColor(pool, index), dash: true, points: pool.series.apy7 },
  ]);
  const ref = useCanvas((context, width, height, time, still) => {
    const all = lines.flatMap(line => line.points);
    context.font = '11px "BlexMono Nerd Font Mono", monospace';
    if (!all.length) { context.fillStyle = '#5f5f5f'; context.fillText('No Reward History Yet', 8, height / 2); return; }
    const t0 = Math.min(...all.map(point => point.t));
    const t1 = Math.max(...all.map(point => point.t));
    let low = Math.min(...all.map(point => point.v));
    let high = Math.max(...all.map(point => point.v));
    const pad = (high - low) * 0.2 || Math.max(high * 0.2, 0.5);
    low = Math.max(0, low - pad); high += pad;
    const left = 40; const bottom = height - 18; const top = 8;
    const x = t => left + ((t - t0) / Math.max(1, t1 - t0)) * (width - left - 10);
    const y = v => bottom - ((v - low) / (high - low)) * (bottom - top);
    context.strokeStyle = '#2c2c2c'; context.fillStyle = '#5f5f5f'; context.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) {
      const yy = top + ((bottom - top) * i) / 4;
      context.beginPath(); context.moveTo(left, yy); context.lineTo(width, yy); context.stroke();
      context.fillText(`${(high - ((high - low) * i) / 4).toFixed(high - low < 2 ? 2 : 1)}%`, 2, yy + 3);
    }
    context.fillStyle = '#8a8a8a';
    context.fillText(stamp(t0), left, height - 3);
    const endLabel = stamp(t1);
    context.fillText(endLabel, width - context.measureText(endLabel).width - 4, height - 3);
    const progress = Math.min(1, time / 1100);
    lines.forEach(line => {
      if (!line.points.length) return;
      const shown = line.points.filter(point => point.t <= t0 + (t1 - t0) * progress);
      context.beginPath();
      shown.forEach((point, i) => { if (i) context.lineTo(x(point.t), y(point.v)); else context.moveTo(x(point.t), y(point.v)); });
      context.setLineDash(line.dash ? [5, 4] : []);
      context.strokeStyle = line.color; context.lineWidth = 1.6; context.shadowColor = line.color; context.shadowBlur = 5; context.stroke();
      context.shadowBlur = 0; context.setLineDash([]);
    });
    if (progress < 1) return;
    const cursor = hover.current ?? (still ? 1 : ((time / 9000) % 1.3));
    if (cursor > 1) return;
    // Snap to the nearest real sample so the dots sit exactly on the cursor.
    const wanted = t0 + (t1 - t0) * cursor;
    const ct = all.reduce((best, point) => (Math.abs(point.t - wanted) < Math.abs(best - wanted) ? point.t : best), all[0].t);
    const cx = x(ct);
    context.strokeStyle = hover.current === null ? '#35e6ff66' : '#ffffff99'; context.setLineDash([3, 3]);
    context.beginPath(); context.moveTo(cx, top); context.lineTo(cx, bottom); context.stroke(); context.setLineDash([]);
    let row = 0;
    lines.forEach(line => {
      const near = line.points.reduce((best, point) => (best === null || Math.abs(point.t - ct) < Math.abs(best.t - ct) ? point : best), null);
      if (!near) return;
      context.beginPath(); context.arc(x(near.t), y(near.v), 3, 0, 7); context.fillStyle = line.color; context.fill();
      context.fillStyle = line.color;
      const text = `${line.label} ${Number(near.v.toFixed(1))}%`;
      const textX = cx > width * 0.6 ? cx - context.measureText(text).width - 8 : cx + 8;
      context.fillText(text, textX, top + 12 + row * 14);
      row += 1;
    });
    context.fillStyle = '#35e6ff';
    context.fillText(stamp(ct), cx > width * 0.6 ? cx - context.measureText(stamp(ct)).width - 8 : cx + 8, top + 12 + row * 14);
  });
  return (
    <canvas
      ref={ref} className="sd-lines" aria-label="Trailing APY history for each cover pool"
      onMouseMove={event => { const box = event.currentTarget.getBoundingClientRect(); hover.current = Math.min(1, Math.max(0, (event.clientX - box.left - 40) / Math.max(1, box.width - 50))); }}
      onMouseLeave={() => { hover.current = null; }}
    />
  );
}

function InsuredSupply({ data, stale }) {
  const insured = data?.insured;
  const coverSeries = sumSeries((data?.pools ?? []).map(pool => pool.series.tvl));
  return (
    <Panel title="USD8 Insured Supply" note="Live From Sepolia" stale={stale} className="sd-insured">
      <div className="sd-insured-grid">
        <div>
          <span className="sd-label">Insured Supply</span>
          <div className="sd-big sd-cyan">
            {data ? <><AnimatedNumber value={insured.supply} format={value => value.toFixed(2)} fallback="—" /><small> USD8</small></> : <LoadingSpinner label="Loading insured supply" />}
          </div>
        </div>
        <div className="sd-metrics">
          <Metric label="Max Coverage">
            {data ? <span className="percent-with-ring">{insured.maxCoverageBps === null ? '—' : `${Number((insured.maxCoverageBps / 100).toFixed(2))}%`}
              {insured.maxCoverageBps === null ? null : <PercentRing share={insured.maxCoverageBps / 10_000} />}</span> : <LoadingSpinner />}
          </Metric>
          <Metric label="Total Cover">{data ? <AnimatedNumber value={data.totalCover} format={value => usd(value)} fallback="—" /> : <LoadingSpinner />}</Metric>
        </div>
      </div>
      <span className="sd-label">Total Cover Over Time</span>
      <Sparkline points={coverSeries} color="#ffcc00" />
    </Panel>
  );
}

const ALLOCATION_COLORS = ['#ffcc00', '#6f8cff', '#35e6ff', '#a78bff', '#ffb53d', '#ff7a59'];

function ReserveAllocation({ rows }) {
  if (rows === undefined) return <LoadingSpinner label="Loading reserve allocation" />;
  if (rows === null) return <p className="sd-empty">Allocation unavailable</p>;
  return (
    <div className="sd-allocation">
      <div className="sd-allocation-bar" role="img" aria-label={rows.map(row => `${row.label} ${percent(row.percent) ?? '—'}`).join(', ')}>
        {rows.map((row, index) => (row.percent ? <i key={row.key} style={{ width: `${row.percent}%`, background: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length] }} /> : null))}
      </div>
      <ul className="sd-allocation-list">
        {rows.map((row, index) => (
          <li key={row.key} style={{ '--slice': ALLOCATION_COLORS[index % ALLOCATION_COLORS.length] }}>
            <i /><span>{row.label}</span><b>{percent(row.percent) ?? '—'}</b><em>{row.amount.toFixed(2)} USDC</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Reserve({ data, stale }) {
  const reserve = data?.reserve;
  const supply = data?.insured?.supply ?? null;
  const backing = reserve?.reserve !== null && reserve?.reserve !== undefined && supply ? (reserve.reserve / supply) * 100 : null;
  return (
    <Panel title="USD8 Reserve" note="USDC held by the Treasury" stale={stale}>
      <div className="sd-insured-grid">
        <div>
          <span className="sd-label">Reserve</span>
          <div className="sd-big sd-cyan">
            {data ? <><AnimatedNumber value={reserve?.reserve ?? null} format={value => value.toFixed(2)} fallback="—" /><small> USDC</small></> : <LoadingSpinner label="Loading USD8 reserve" />}
          </div>
        </div>
        <div className="sd-metrics">
          <Metric label="USD8 Supply">{data ? <AnimatedNumber value={supply} format={value => value.toFixed(2)} fallback="—" /> : <LoadingSpinner />}</Metric>
          <Metric label="Reserve ÷ Supply">{data ? (percent(backing) ?? '—') : <LoadingSpinner />}</Metric>
        </div>
      </div>
      <span className="sd-label">Where The Reserve Sits</span>
      <ReserveAllocation rows={data ? reserve?.allocation : undefined} />
      <span className="sd-label">Reserve Over Time</span>
      <Sparkline points={reserve?.series ?? []} color="#35e6ff" />
    </Panel>
  );
}

function EventTape({ items, loading, stale }) {
  return (
    <Panel title="Event Tape" note="Real transactions · explorer index" stale={stale}>
      {loading ? <LoadingSpinner label="Loading recent activity" /> : null}
      {!loading && !items.length ? <p className="sd-empty">No Recent Activity</p> : null}
      <ol className="sd-tape">
        {items.slice(0, 12).map((item, index) => {
          const kind = item.id.split(':')[1];
          const color = KIND_COLORS[kind] || '#fff';
          return (
            <li key={item.id} className="sd-event" style={{ '--i': index, '--kind': color }}>
              <span className="sd-event-block">{item.block === null ? '' : `Block ${item.block}`}</span>
              <span className="sd-event-kind">{KIND_LABELS[kind] || kind}</span>
              <span className="sd-event-text">
                {item.actor ? <span className="sd-actor">{item.actor}</span> : null}{item.actor ? ' ' : ''}{item.action}
                {item.amount ? <b> {item.amount}</b> : null}{item.target ? ` ${item.target}` : ''}
              </span>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

function PoolCard({ pool, color }) {
  const week = pool.apy7 === null ? null : Number.parseFloat(pool.apy7);
  const month = pool.apy30 === null ? null : Number.parseFloat(pool.apy30);
  const better = week !== null && month !== null && week > month ? '7D' : month === null && week !== null ? '7D' : '30D';
  return (
    <article className="sd-pool" style={{ '--pool': color }} aria-label={pool.name}>
      <header><b>{pool.shareSymbol}</b><span>{pool.assetSymbol}</span></header>
      <div className="sd-big"><AnimatedNumber value={pool.tvlUsd} format={value => usd(value)} fallback="—" /></div>
      <div className="sd-apys">
        {[['7D', pool.apy7], ['30D', pool.apy30]].map(([label, value]) => (
          <div key={label} className={better === label ? 'sd-best' : undefined}><span>{label} APY</span><strong>{value ?? '—'}</strong></div>
        ))}
      </div>
      <Sparkline points={pool.series.tvl} color={color} />
      <div className="sd-bar" role="img" aria-label={pool.capacityUncapped ? 'Uncapped pool' : `${pool.capacityPercent}% capacity filled`}>
        <i style={{ width: `${pool.capacityUncapped ? 100 : Math.max(2, pool.capacityPercent ?? 0)}%` }} />
      </div>
      <div className="sd-pool-foot">
        <span>Capacity</span>
        <strong className="percent-with-ring">
          {pool.capacityUncapped ? 'Uncapped' : percent(pool.capacityPercent) ?? '—'}
          {pool.capacityUncapped || pool.capacityPercent === null ? null : <PercentRing share={pool.capacityPercent / 100} />}
        </strong>
      </div>
      <div className="sd-pool-foot"><span>Deposits</span><strong>{token(pool.assets) ?? '—'} {pool.assetSymbol}</strong></div>
    </article>
  );
}

function CoverPools({ data, stale }) {
  return (
    <Panel title="Cover Pools" note="TVL history rebuilt from pool events" stale={stale}>
      {data ? <div className="sd-pools">{data.pools.map((pool, index) => <PoolCard key={pool.id} pool={pool} color={poolColor(pool, index)} />)}</div>
        : <LoadingSpinner label="Loading cover pools" />}
    </Panel>
  );
}

function PoolYield({ data, stale }) {
  return (
    <Panel title="Cover Pool Yield" note="Trailing APY · solid 30D · dashed 7D" stale={stale}>
      {data ? (
        <>
          <div className="sd-legend">{data.pools.map((pool, index) => <span key={pool.id} style={{ '--pool': poolColor(pool, index) }}><i />{pool.assetSymbol}</span>)}</div>
          <YieldChart pools={data.pools} />
        </>
      ) : <LoadingSpinner label="Loading pool yield" />}
    </Panel>
  );
}

function duration(seconds) {
  if (seconds <= 0) return 'Now';
  const days = Math.floor(seconds / 86_400);
  const rest = seconds % 86_400;
  const clock = [Math.floor(rest / 3_600), Math.floor((rest % 3_600) / 60), rest % 60].map(part => String(part).padStart(2, '0')).join(':');
  return days ? `${days}d ${clock}` : clock;
}

const EXIT_STATES = {
  queued: { label: 'Cooldown', color: '#4d8dff' },
  ready: { label: 'Awaiting Settlement', color: '#ffb53d' },
  settled: { label: 'Settled', color: '#34f5a0' },
};

function ExitQueue({ data, stale, now }) {
  const nowSeconds = Math.floor(now / 1000);
  const epochs = data ? data.pools.flatMap(pool => pool.exits.map(exit => ({ ...exit, pool }))) : [];
  const unavailable = data?.pools.some(pool => pool.exitsUnavailable);
  return (
    <Panel title="Cover Pool Withdrawal Exit Queue" note={data?.timing ? `${duration(data.timing.cooldown).split(' ')[0]} cooldown · ${duration(data.timing.interval).split(' ')[0]} batches` : ''} stale={stale}>
      {!data ? <LoadingSpinner label="Loading exit queue" /> : (
        <>
          <div className="sd-exit-summary">
            {data.pools.map((pool, index) => (
              <div key={pool.id} style={{ '--pool': poolColor(pool, index) }}>
                <b>{pool.assetSymbol}</b>
                <Metric label="In Exit Queue">{token(pool.escrowedAssets) ?? '—'} {pool.assetSymbol}<small> {percent(pool.escrowedPercent) ?? ''}</small></Metric>
                <Metric label="Withdrawal Reserve">{token(pool.withdrawalReserve) ?? '—'} {pool.assetSymbol}</Metric>
              </div>
            ))}
          </div>
          {!epochs.length ? <p className="sd-empty">{unavailable ? 'Epoch Detail Unavailable' : 'No Pending Exits'}</p> : null}
          {epochs.map(exit => {
            const state = EXIT_STATES[exit.state];
            return (
              <div className="sd-exit" key={`${exit.pool.id}-${exit.epoch}`} style={{ '--state': state.color }}>
                <div><b>{exit.pool.assetSymbol} Batch</b><span>{new Date(exit.epoch * 1000).toISOString().slice(0, 16).replace('T', ' ')} UTC</span></div>
                <div className="sd-progress"><i className={exit.state === 'queued' ? 'sd-running' : undefined} style={{ width: `${exit.progress * 100}%` }} /></div>
                <div className="sd-right"><span className="sd-chip">{state.label}</span>
                  <span>{exit.state === 'queued' ? duration(exit.epoch - nowSeconds) : `${token(exit.shares)} Shares · ${exit.requests} ${exit.requests === 1 ? 'Request' : 'Requests'}`}</span></div>
              </div>
            );
          })}
        </>
      )}
    </Panel>
  );
}

function useRefreshing(load, key) {
  const [state, setState] = useState({ value: null, error: '', updatedAt: 0 });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    const refresh = async () => {
      if (document.hidden || busy) return;
      busy = true;
      try {
        const value = await load(controller.signal);
        if (!controller.signal.aborted) setState({ value, error: '', updatedAt: Date.now() });
      } catch (error) {
        if (!controller.signal.aborted) setState(old => ({ ...old, error: error?.message || 'Data is unavailable.' }));
      } finally { busy = false; }
    };
    refresh();
    const stop = onForegroundRefresh(refresh, { intervalMs: REFRESH_MS, eventGapMs: REFRESH_MS });
    return () => { controller.abort(); stop(); };
  }, [key, retry]);
  return { ...state, retry: () => setRetry(count => count + 1) };
}

export default function SystemDashboard() {
  const network = getProtocolNetwork(PROTOCOL_CHAIN_ID);
  const system = useRefreshing(signal => loadSystemDashboard(PROTOCOL_CHAIN_ID, { signal, staleTime: REFRESH_MS }), 'system');
  const activity = useRefreshing(signal => cachedData(protocolKey(network, 'activity'),
    ({ signal: querySignal }) => fetchActivity(network, { signal: querySignal }), { signal, staleTime: REFRESH_MS }), 'activity');
  const now = useSecondClock(true);
  const data = system.value;
  const age = data ? Math.max(0, Math.floor((now - system.updatedAt) / 1000)) : 0;
  const stale = Boolean(data) && (Boolean(system.error) || now - system.updatedAt > STALE_AFTER_MS);
  return (
    <main className="sd-page">
      <header className="sd-header">
        <a className="sd-brand" href="#" aria-label="USD8 home">
          <img src={usd8Logo} alt="" /><img className="sd-wordmark" src={usd8Wordmark} alt="USD8.fi" />
        </a>
        <h1>System Dashboard</h1>
        <div className={`sd-status${stale ? ' sd-status-stale' : ''}`} role="status">
          <i />{stale ? 'Stale' : data ? 'Live' : 'Loading'}
          {data ? <span>Block {data.blockNumber} · {age}s ago</span> : null}
        </div>
      </header>

      {system.error && !data ? (
        <div className="sd-error" role="alert">{system.error} <button type="button" onClick={system.retry}>Retry</button></div>
      ) : null}

      <InsuredSupply data={data} stale={stale} />
      <Reserve data={data} stale={stale} />
      <EventTape items={activity.value ?? []} loading={activity.value === null && !activity.error} stale={Boolean(activity.error) && activity.value !== null} />
      <CoverPools data={data} stale={stale} />
      <PoolYield data={data} stale={stale} />
      <ExitQueue data={data} stale={stale} now={now || Date.now()} />
      <a className="sd-back" href="#">Back To App</a>
    </main>
  );
}
