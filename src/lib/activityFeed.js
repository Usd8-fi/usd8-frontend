import { fetchJson } from './requestUtils.js';

// Recent protocol actions for the bottom ticker. Everything comes from the
// explorer's HTTP index (transactions and token transfers of our own contracts),
// so the ticker costs no RPC calls. Entries are real, successful transactions;
// nothing is simulated, and an unreachable index yields no ticker at all.

export const ACTIVITY_LIMIT = 20;
const FRACTION_DIGITS = 4;
const ZERO = '0x0000000000000000000000000000000000000000';

// Selector and ABI name of each function we announce. Explorers return the
// decoded name for verified contracts and the raw selector otherwise.
const ACTIONS = Object.freeze({
  treasury: [
    { kind: 'mint', selector: '0x8d097228', name: 'mintUSD8' },
    { kind: 'redeem', selector: '0xd2840edb', name: 'redeemUSD8' },
  ],
  pool: [
    { kind: 'deposit', selector: '0x6e553f65', name: 'deposit' },
    { kind: 'exitQueued', selector: '0xaa2f892d', name: 'requestRedeem' },
    { kind: 'exitCompleted', selector: '0x59d76fe7', name: 'completeRedeem' },
    { kind: 'rewardClaimed', selector: '0xb88a802f', name: 'claimReward' },
    { kind: 'rewardsAdded', selector: '0x94419e75', name: 'receiveProfitDistribution' },
  ],
  insurance: [
    { kind: 'claimFiled', selector: '0x7dd2ac69', name: 'fileClaim' },
    { kind: 'claimPaid', selector: '0x2ebab592', name: 'finalizeClaim' },
    { kind: 'incidentSettled', selector: null, name: 'settleIncident' },
  ],
  vault: [
    { kind: 'save', selector: '0x6e553f65', name: 'deposit' },
    { kind: 'unsave', selector: '0xba087652', name: 'redeem' },
    { kind: 'unsave', selector: '0xb460af94', name: 'withdraw' },
  ],
});

export function shortAddress(address) {
  return /^0x[0-9a-fA-F]{40}$/.test(address || '') ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;
}

/// Exact, truncated decimal. No grouping separators, trailing zeros trimmed.
export function formatTokenAmount(raw, decimals) {
  let units;
  try { units = BigInt(raw); } catch { return null; }
  if (units <= 0n || !Number.isSafeInteger(decimals) || decimals < 0 || decimals > 36) return null;
  const scale = 10n ** BigInt(decimals);
  const whole = units / scale;
  const fraction = String(units % scale).padStart(decimals, '0').slice(0, FRACTION_DIGITS).replace(/0+$/, '');
  if (whole === 0n && !fraction) return `<0.${'0'.repeat(FRACTION_DIGITS - 1)}1`;
  return fraction ? `${whole}.${fraction}` : String(whole);
}

function lower(value) { return typeof value === 'string' ? value.toLowerCase() : ''; }

function classify(role, method) {
  return ACTIONS[role].find(action => method && (action.selector === method || action.name === method)) || null;
}

function describe(kind, { pool, amount, symbol }) {
  const asset = pool?.assetSymbol || 'cover';
  const quantity = amount ? `${amount} ${symbol || ''}`.trim() : null;
  const coverPool = `the ${asset} cover pool`;
  switch (kind) {
    case 'mint': return { action: 'minted', amount: quantity || null, target: amount ? null : 'USD8' };
    case 'redeem': return { action: 'redeemed', amount: quantity, target: amount ? null : 'USD8' };
    case 'deposit': return { action: 'deposited', amount: quantity, target: `into ${coverPool}` };
    case 'exitQueued': return { action: 'queued an exit from', amount: null, target: coverPool };
    case 'exitCompleted': return { action: 'completed an exit', amount: quantity, target: `from ${coverPool}` };
    case 'rewardClaimed': return { action: 'claimed', amount: quantity, target: `rewards from ${coverPool}` };
    case 'rewardsAdded': return { action: 'rewards added:', amount: quantity, target: `to ${coverPool}`, anonymous: true };
    case 'claimFiled': return { action: 'filed a claim', amount: null, target: null };
    // A finalized claim with no transfer to the claimant paid nothing; say so plainly.
    case 'claimPaid': return { action: quantity ? 'received a claim payout' : 'finalized a claim', amount: quantity, target: null };
    case 'incidentSettled': return { action: 'incident settled', amount: null, target: null, anonymous: true };
    case 'save': return { action: 'saved', amount: quantity, target: 'into sUSD8' };
    case 'unsave': return { action: 'withdrew', amount: quantity, target: 'from sUSD8' };
    default: return null;
  }
}

function transferAmount(kind, transfers, pool, { actor, pools = [] } = {}) {
  const poolAddress = lower(pool?.address);
  const poolAddresses = new Set(pools.map(item => lower(item.address)));
  const pick = {
    mint: item => item.type === 'token_minting',
    redeem: item => item.type === 'token_burning',
    deposit: item => lower(item.to) === poolAddress && lower(item.from) !== ZERO,
    exitCompleted: item => lower(item.from) === poolAddress && item.type === 'token_transfer',
    rewardClaimed: item => lower(item.from) === poolAddress && item.type === 'token_transfer',
    rewardsAdded: item => lower(item.to) === poolAddress && lower(item.from) !== ZERO,
    // The claimant's own payout; the fee receiver's share is a separate transfer.
    claimPaid: item => poolAddresses.has(lower(item.from)) && lower(item.to) === lower(actor) && item.type === 'token_transfer',
    save: item => item.type === 'token_transfer',
    unsave: item => item.type === 'token_transfer',
  }[kind];
  const match = pick ? transfers.find(pick) : null;
  const amount = match ? formatTokenAmount(match.value, match.decimals) : null;
  return amount ? { amount, symbol: match.symbol } : {};
}

function parseTransfers(payload) {
  const byHash = new Map();
  for (const item of Array.isArray(payload?.items) ? payload.items : []) {
    const hash = lower(item?.transaction_hash || item?.tx_hash);
    if (!hash) continue;
    const decimals = Number(item?.total?.decimals ?? item?.token?.decimals);
    const entry = {
      type: item.type, from: item.from?.hash, to: item.to?.hash,
      value: item.total?.value, decimals, symbol: item.token?.symbol,
    };
    byHash.set(hash, [...(byHash.get(hash) || []), entry]);
  }
  return byHash;
}

function parseTransactions(payload, address, role, context) {
  const rows = [];
  for (const item of Array.isArray(payload?.items) ? payload.items : []) {
    if (item?.status !== 'ok' || item?.result !== 'success') continue;
    if (lower(item.to?.hash) !== lower(address)) continue;
    const action = classify(role, item.method);
    const at = Date.parse(item.timestamp);
    if (!action || !item.hash || !Number.isFinite(at)) continue;
    const block = Number.isSafeInteger(item.block_number) ? item.block_number : null;
    rows.push({ hash: lower(item.hash), at, block, actor: item.from?.hash, action, ...context });
  }
  return rows;
}

/// Newest-first list of recent actions, or `[]` when the network has no
/// explorer index. Rejects only when every request failed.
export async function fetchActivity(network, { signal } = {}) {
  const api = network?.explorerApiUrl;
  if (!api) return [];
  const { contracts } = network;
  const txUrl = address => `${api}/addresses/${address}/transactions`;
  const transferUrl = address => `${api}/addresses/${address}/token-transfers`;
  const sources = [
    { type: 'tx', role: 'treasury', address: contracts.treasury },
    { type: 'tx', role: 'insurance', address: contracts.defiInsurance },
    { type: 'transfers', address: contracts.usd8, url: `${api}/tokens/${contracts.usd8}/transfers` },
    ...contracts.coverPools.flatMap(pool => [
      { type: 'tx', role: 'pool', address: pool.address, pool },
      { type: 'transfers', address: pool.address, url: transferUrl(pool.address) },
    ]),
    ...(contracts.savingsVault ? [
      { type: 'tx', role: 'vault', address: contracts.savingsVault },
      { type: 'transfers', address: contracts.savingsVault, url: transferUrl(contracts.savingsVault) },
    ] : []),
  ].filter(source => source.address);
  const settled = await Promise.allSettled(sources.map(source => fetchJson(source.url || txUrl(source.address), { signal })));
  if (signal?.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
  if (settled.every(result => result.status === 'rejected')) throw settled[0].reason;
  const transfers = new Map();
  const rows = [];
  settled.forEach((result, index) => {
    if (result.status !== 'fulfilled') return;
    const source = sources[index];
    if (source.type === 'transfers') {
      parseTransfers(result.value).forEach((list, hash) => transfers.set(hash, [...(transfers.get(hash) || []), ...list]));
    } else rows.push(...parseTransactions(result.value, source.address, source.role, { pool: source.pool }));
  });
  const seen = new Set();
  return rows
    .sort((a, b) => b.at - a.at)
    .flatMap(row => {
      const id = `${row.hash}:${row.action.kind}`;
      if (seen.has(id)) return [];
      seen.add(id);
      const text = describe(row.action.kind, { pool: row.pool, ...transferAmount(row.action.kind, transfers.get(row.hash) || [], row.pool, { actor: row.actor, pools: contracts.coverPools }) });
      if (!text) return [];
      return [{ id, hash: row.hash, at: row.at, block: row.block, actor: text.anonymous ? null : shortAddress(row.actor), ...text }];
    })
    .slice(0, ACTIVITY_LIMIT);
}
