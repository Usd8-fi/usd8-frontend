import { useEffect, useState } from 'react';
import { readClientFor } from '../lib/chainData.js';
import { PROTOCOL_CHAIN_ID } from '../lib/networkConfig.js';

const POLL_MILLISECONDS = 12_000;

function blockLabel(block) {
  return block ? Number(block.number).toLocaleString('en-US') : '…';
}

/// The TEE only settles against finalized chain state, so settlement is possible
/// once the finalized block's timestamp is past the claim deadline. Show both
/// heads so users can see when that happens instead of retrying too early.
export default function SettlementFinalityNote({ claimDeadlineMilliseconds }) {
  const [heads, setHeads] = useState({ latest: null, finalized: null });

  useEffect(() => {
    let cancelled = false;
    let client;
    try { client = readClientFor(PROTOCOL_CHAIN_ID); } catch { return undefined; }
    const update = () => Promise.all([
      client.getBlock({ blockTag: 'latest' }),
      client.getBlock({ blockTag: 'finalized' }),
    ]).then(([latest, finalized]) => {
      if (!cancelled) setHeads({ latest, finalized });
    }).catch(() => { /* keep the last known heads */ });
    update();
    const timer = window.setInterval(update, POLL_MILLISECONDS);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  const deadline = Number(claimDeadlineMilliseconds);
  const finalizedMilliseconds = heads.finalized ? Number(heads.finalized.timestamp) * 1_000 : null;
  const ready = finalizedMilliseconds !== null && Number.isFinite(deadline) && finalizedMilliseconds > deadline;
  const minutesToGo = finalizedMilliseconds !== null && Number.isFinite(deadline) && !ready
    ? Math.max(1, Math.ceil((deadline - finalizedMilliseconds) / 60_000))
    : null;

  return (
    <p className="settlement-finality-note" aria-live="polite">
      Settlement can start once the finalized block passes the claim deadline.
      <br />
      Current block {blockLabel(heads.latest)} · Finalized block {blockLabel(heads.finalized)}
      {ready ? ' · Ready to settle' : minutesToGo !== null ? ` · about ${minutesToGo} min to go` : ''}
    </p>
  );
}
