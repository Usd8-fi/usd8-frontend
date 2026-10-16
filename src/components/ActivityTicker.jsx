import { useEffect, useState } from 'react';
import { cachedData, protocolKey } from '../lib/dataCache.js';
import { fetchActivity } from '../lib/activityFeed.js';
import { onForegroundRefresh } from '../lib/foregroundRefresh.js';
import { getProtocolNetwork, PROTOCOL_CHAIN_ID } from '../lib/networkConfig.js';

const REFRESH_MS = 60_000;
const SPEED_PX_PER_SECOND = 55;
const MIN_CYCLE_PX = 1400;

function Entry({ item, explorer, interactive }) {
  const content = (
    <>
      {item.actor ? <span className="activity-ticker-actor">{item.actor}</span> : null}
      {' '}{item.action}
      {item.amount ? <>{' '}<b>{item.amount}</b></> : null}
      {item.target ? ` ${item.target}` : ''}
      {item.block === null ? null : <span className="activity-ticker-age"> · block {item.block}</span>}
    </>
  );
  return (
    <li className="activity-ticker-item">
      {explorer
        ? <a href={`${explorer}/tx/${item.hash}`} target="_blank" rel="noreferrer" tabIndex={interactive ? undefined : -1}>{content}</a>
        : content}
    </li>
  );
}

/// One-line, right-to-left marquee of the latest protocol actions. Hidden until
/// real activity has loaded and when the index is unreachable, so it never shows
/// invented or stale-looking entries.
export default function ActivityTicker() {
  const network = getProtocolNetwork(PROTOCOL_CHAIN_ID);
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (!network?.explorerApiUrl) return undefined;
    const controller = new AbortController();
    let loading = false;
    const refresh = async () => {
      if (document.hidden || loading) return;
      loading = true;
      try {
        const next = await cachedData(protocolKey(network, 'activity'), ({ signal }) => fetchActivity(network, { signal }), {
          signal: controller.signal, staleTime: REFRESH_MS / 2,
        });
        if (!controller.signal.aborted) setItems(next);
      } catch { /* keep the last real entries; each shows its own block */ }
      finally { loading = false; }
    };
    refresh();
    const stop = onForegroundRefresh(refresh, { intervalMs: REFRESH_MS });
    return () => { controller.abort(); stop(); };
  }, [network]);
  if (!items.length) return null;
  const explorer = network.chain.blockExplorers?.default.url;
  const characters = items.reduce((sum, item) => sum + `${item.actor || ''} ${item.action} ${item.amount || ''} ${item.target || ''} · block 00000000`.length, 0);
  const cyclePixels = Math.max(MIN_CYCLE_PX, characters * 7.3 + items.length * 56);
  return (
    <aside className="activity-ticker" aria-label="Recent protocol activity">
      <div className="activity-ticker-track" style={{ '--ticker-seconds': `${Math.round(cyclePixels / SPEED_PX_PER_SECOND)}s` }}>
        <ul className="activity-ticker-list">
          {items.map(item => <Entry key={item.id} item={item} explorer={explorer} interactive />)}
        </ul>
        <ul className="activity-ticker-list activity-ticker-copy" aria-hidden="true">
          {items.map(item => <Entry key={item.id} item={item} explorer={explorer} />)}
        </ul>
      </div>
    </aside>
  );
}
