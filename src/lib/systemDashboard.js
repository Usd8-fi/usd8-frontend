import { cachedData, checkAbort, protocolKey } from './dataCache.js';
import { calculateTrailingRewardApr, fetchLandingChainData, fetchTrailingRewardApr, readClientFor } from './chainData.js';
import { multicall } from './snapshotReads.js';
import { erc20Abi } from './abis.js';
import { poolAbi } from './readAbis.js';
import { fetchJson } from './requestUtils.js';
import { formatUnits, zeroAddress } from './viemLite.js';
import { fetchLogsInChunks } from './history.js';
import { getProtocolNetwork } from './networkConfig.js';
import { UNKNOWN_VALUE } from './units.js';

// Everything on the system dashboard is read from the chain or the explorer
// index. Nothing is simulated: a value that cannot be read is null, and the
// page shows it as unavailable.

export const SERIES_POINTS = 48;
const MIN_WINDOW_SECONDS = 60 * 60;
const REQUEST_REDEEM = { selector: '0xaa2f892d', name: 'requestRedeem' };
const MAX_EXIT_REQUESTERS = 50;

const treasuryReserveAbi = [
  { type: 'function', name: 'getReserveBalance', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'strategiesLength', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'strategies', stateMutability: 'view', inputs: [{ name: '', type: 'uint256' }], outputs: [{ name: '', type: 'address' }] },
];
const strategyAbi = [
  { type: 'function', name: 'totalAssets', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'vault', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
];
const nameAbi = [{ type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] }];
const shortAddress = (address) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/// Where the reserve sits: idle USDC in the Treasury plus each approved
/// strategy's reported assets, in withdrawal order. Mirrors the sum inside
/// `getReserveBalance()`; a strategy that cannot be read fails the whole read.
async function readReserveAllocation(client, network, blockNumber) {
  const treasury = network.contracts.treasury;
  const [idle, count] = await Promise.all([
    client.readContract({ address: network.contracts.usdc, abi: erc20Abi, functionName: 'balanceOf', args: [treasury], blockNumber }),
    client.readContract({ address: treasury, abi: treasuryReserveAbi, functionName: 'strategiesLength', blockNumber }),
  ]);
  const addresses = await Promise.all(Array.from({ length: Number(count) }, (_, index) => client.readContract({
    address: treasury, abi: treasuryReserveAbi, functionName: 'strategies', args: [BigInt(index)], blockNumber,
  })));
  const strategies = await Promise.all(addresses.map(async (address) => {
    const assets = await client.readContract({ address, abi: strategyAbi, functionName: 'totalAssets', blockNumber });
    // Label by the strategy's target vault name when it exposes one (ERC4626Strategy).
    const vault = await client.readContract({ address, abi: strategyAbi, functionName: 'vault', blockNumber }).catch(() => null);
    const name = vault ? await client.readContract({ address: vault, abi: nameAbi, functionName: 'name', blockNumber }).catch(() => null) : null;
    return { key: address.toLowerCase(), label: name || `Strategy ${shortAddress(address)}`, address, assets };
  }));
  const rows = [{ key: 'idle', label: 'Idle USDC (Treasury)', address: treasury, assets: idle }, ...strategies];
  const total = rows.reduce((sum, row) => sum + row.assets, 0n);
  return rows.map((row) => ({
    key: row.key, label: row.label, address: row.address,
    amount: toNumber(row.assets, USDC_DECIMALS),
    percent: total > 0n ? Number((row.assets * 1_000_000n) / total) / 10_000 : null,
  }));
}
const treasuryFlowEvents = [
  { type: 'event', name: 'Minted', inputs: [
    { name: 'user', type: 'address', indexed: true }, { name: 'usdcAmount', type: 'uint256', indexed: false },
    { name: 'usd8Amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Redeemed', inputs: [
    { name: 'user', type: 'address', indexed: true }, { name: 'usd8Amount', type: 'uint256', indexed: false },
    { name: 'usdcAmount', type: 'uint256', indexed: false }] },
];
const USDC_DECIMALS = 6;

/// USD8 reserve (USDC held by the Treasury and its strategies) over time.
/// Anchored to the live `getReserveBalance()` and walked back through the
/// Treasury's own Minted / Redeemed events, so the last point is exact and
/// earlier points reflect real USDC flows. Strategy yield between flows is not
/// back-filled, so history before the latest flow can understate it slightly.
export function reserveSeries({ flows, current, nowSeconds, startSeconds, points = SERIES_POINTS }) {
  if (current === null || !Number.isFinite(nowSeconds)) return [];
  const from = Number.isFinite(startSeconds) && startSeconds < nowSeconds ? startSeconds : nowSeconds;
  const span = nowSeconds - from;
  const count = span <= 0 ? 1 : Math.min(points, Math.max(2, Math.ceil(span / 3_600) + 1));
  const sorted = [...flows].sort((a, b) => a.timestamp - b.timestamp);
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? nowSeconds : Math.round(from + (span * i) / (count - 1));
    const after = sorted.filter((flow) => flow.timestamp > t).reduce((sum, flow) => sum + flow.delta, 0n);
    const value = current - after;
    return { t, v: toNumber(value > 0n ? value : 0n, USDC_DECIMALS) };
  });
}

async function readReserve(client, network, signal) {
  const treasury = network.contracts.treasury;
  const head = await client.getBlock({ blockTag: 'latest' });
  checkAbort(signal);
  const [current, allocation] = await Promise.all([
    client.readContract({ address: treasury, abi: treasuryReserveAbi, functionName: 'getReserveBalance', blockNumber: head.number }),
    readReserveAllocation(client, network, head.number).catch(() => { checkAbort(signal); return null; }),
  ]);
  const deployBlock = network.contracts.treasuryDeployBlock;
  if (deployBlock === undefined) {
    return { reserve: toNumber(current, USDC_DECIMALS), allocation, series: [] };
  }
  const logs = await fetchLogsInChunks(client, { address: treasury, events: treasuryFlowEvents }, BigInt(deployBlock), head.number, { signal });
  const blockNumbers = [...new Set([BigInt(deployBlock), ...logs.map((log) => log.blockNumber)])];
  const blocks = await Promise.all(blockNumbers.map((blockNumber) => client.getBlock({ blockNumber })));
  const timeOf = new Map(blocks.map((block) => [block.number, Number(block.timestamp)]));
  const flows = logs.map((log) => ({
    timestamp: timeOf.get(log.blockNumber),
    delta: log.eventName === 'Minted' ? log.args.usdcAmount : -log.args.usdcAmount,
  }));
  return {
    reserve: toNumber(current, USDC_DECIMALS),
    allocation,
    series: reserveSeries({ flows, current, nowSeconds: Number(head.timestamp), startSeconds: timeOf.get(BigInt(deployBlock)) }),
  };
}

const registryTimingAbi = [{
  type: 'function', name: 'exitTimingConfig', stateMutability: 'view', inputs: [],
  outputs: [{ name: 'config', type: 'tuple', components: [
    { name: 'unstakeCooldown', type: 'uint64' }, { name: 'exitBatchInterval', type: 'uint64' },
  ] }],
}];
const poolQueueAbi = [
  { type: 'function', name: 'withdrawalReserve', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'nextExitEpochIndex', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
];

const toNumber = (value, decimals = 18) => Number(formatUnits(value, decimals));
const success = result => (result?.status === 'success' ? result.result : null);

/// Pool assets over time, rebuilt from the pool's own replayed events.
function assetsAt(events, timestamp) {
  let assets = 0n;
  [...events].sort((a, b) => a.timestamp - b.timestamp || a.logIndex - b.logIndex).forEach(event => {
    if (event.timestamp > timestamp) return;
    if (event.type === 'deposit') assets += event.assets;
    if (event.type === 'exit' || event.type === 'claim') assets = event.assets >= assets ? 0n : assets - event.assets;
  });
  return assets;
}

/// Evenly spaced history of pool value (USD) and trailing 7D / 30D APY, derived
/// from the events already fetched for the APY figure, so it costs no requests.
export function trailingSeries({ events, nowSeconds, rewardsSince, price, priceDecimals, points = SERIES_POINTS }) {
  const empty = { tvl: [], apy7: [], apy30: [] };
  if (!events?.length || !Number.isFinite(nowSeconds)) return empty;
  const usdPerAsset = Number(price) / 10 ** Number(priceDecimals);
  const first = Math.min(...events.map(event => event.timestamp));
  const grid = (from) => {
    const span = nowSeconds - from;
    if (span <= 0) return [nowSeconds];
    const count = Math.min(points, Math.max(2, Math.ceil(span / 3_600) + 1));
    return Array.from({ length: count }, (_, i) => Math.round(from + (span * i) / (count - 1)));
  };
  const tvl = grid(first).map(t => ({ t, v: toNumber(assetsAt(events, t)) * usdPerAsset }));
  const apy = (windowSeconds, from) => grid(from).flatMap(t => {
    if (t - rewardsSince < MIN_WINDOW_SECONDS) return [];
    const value = calculateTrailingRewardApr({
      events: events.filter(event => event.timestamp <= t), nowSeconds: t, windowSeconds,
      deploymentTimestamp: rewardsSince, currentAssetUsdPrice: BigInt(price), priceDecimals,
    });
    const number = Number.parseFloat(value);
    return value === UNKNOWN_VALUE || !Number.isFinite(number) ? [] : [{ t, v: number }];
  });
  const start = rewardsSince === undefined ? first : Math.max(first, rewardsSince);
  return { tvl, apy7: apy(7 * 86_400, start), apy30: apy(30 * 86_400, start) };
}

/// Groups live exit requests into their batch epochs and classifies each one.
/// `requests` are { shares, exitEpoch } per requester; `epochs` maps an epoch
/// timestamp to the pool's settled receipt (totalAssets stays 0 until settled).
export function exitEpochRows({ requests, epochs, nowSeconds, cooldownSeconds, intervalSeconds }) {
  const byEpoch = new Map();
  requests.filter(request => request.shares > 0n).forEach(request => {
    const row = byEpoch.get(request.exitEpoch) || { epoch: request.exitEpoch, shares: 0n, requests: 0 };
    row.shares += request.shares;
    row.requests += 1;
    byEpoch.set(request.exitEpoch, row);
  });
  const window = cooldownSeconds + intervalSeconds;
  return [...byEpoch.values()].sort((a, b) => a.epoch - b.epoch).map(row => {
    const receipt = epochs.get(row.epoch);
    const settled = Boolean(receipt && (receipt.totalAssets > 0n || receipt.remainingShares > 0n));
    const state = settled ? 'settled' : nowSeconds >= row.epoch ? 'ready' : 'queued';
    const progress = settled || state === 'ready' ? 1
      : Math.max(0, Math.min(1, (nowSeconds - (row.epoch - window)) / window));
    return { ...row, state, progress, settledAssets: settled ? receipt.totalAssets : null };
  });
}

async function exitRequesters(network, pool, signal) {
  const api = network.explorerApiUrl;
  if (!api) return null;
  const page = await fetchJson(`${api}/addresses/${pool.address}/transactions`, { signal });
  const users = new Set();
  (Array.isArray(page?.items) ? page.items : []).forEach(item => {
    const method = item?.method;
    if (item?.status !== 'ok' || item?.result !== 'success') return;
    if (method !== REQUEST_REDEEM.selector && method !== REQUEST_REDEEM.name) return;
    if (/^0x[0-9a-fA-F]{40}$/.test(item.from?.hash || '')) users.add(item.from.hash);
  });
  return [...users].slice(0, MAX_EXIT_REQUESTERS);
}

async function readExitQueue(client, network, pool, nowSeconds, timing, signal) {
  let users;
  try { users = await exitRequesters(network, pool, signal); } catch { checkAbort(signal); users = null; }
  if (users === null) return { rows: [], unavailable: true };
  if (!users.length) return { rows: [], unavailable: false };
  const requestResults = await multicall(client, { allowFailure: true, contracts: users.map(user => (
    { address: pool.address, abi: poolAbi, functionName: 'exitRequests', args: [user] })) });
  checkAbort(signal);
  const requests = requestResults.flatMap(result => {
    const value = success(result);
    return value ? [{ shares: value[0], exitEpoch: Number(value[1]) }] : [];
  });
  const epochTimes = [...new Set(requests.filter(request => request.shares > 0n).map(request => request.exitEpoch))];
  const epochResults = epochTimes.length ? await multicall(client, { allowFailure: true, contracts: epochTimes.map(epoch => (
    { address: pool.address, abi: poolAbi, functionName: 'exitEpochs', args: [BigInt(epoch)] })) }) : [];
  checkAbort(signal);
  const epochs = new Map(epochTimes.flatMap((epoch, index) => {
    const value = success(epochResults[index]);
    return value ? [[epoch, { totalShares: value[0], totalAssets: value[1], remainingShares: value[2], remainingAssets: value[3] }]] : [];
  }));
  const unresolved = epochTimes.some(epoch => !epochs.has(epoch));
  return {
    rows: exitEpochRows({ requests, epochs, nowSeconds, cooldownSeconds: timing.cooldown, intervalSeconds: timing.interval })
      .map(row => ({ ...row, shares: toNumber(row.shares), settledAssets: row.settledAssets === null ? null : toNumber(row.settledAssets) })),
    unavailable: unresolved,
  };
}

async function readPool(landingPool, extras, { chainId, signal }) {
  const price = landingPool.usdPrice === undefined ? null : Number(landingPool.usdPrice) / 10 ** Number(landingPool.priceDecimals);
  const assets = extras.totalAssets === null ? null : toNumber(extras.totalAssets);
  let trailing = null;
  if (landingPool.usdPrice !== undefined && landingPool.earningsPeriodFinishMilliseconds !== 0) {
    trailing = await fetchTrailingRewardApr(landingPool.address, BigInt(landingPool.usdPrice), landingPool.priceDecimals, chainId, { signal })
      .catch(() => { checkAbort(signal); return null; });
  }
  const history = trailing?.history;
  const series = history?.rewardsSince === undefined || !history
    ? { tvl: [], apy7: [], apy30: [] }
    : trailingSeries({ ...history, price: landingPool.usdPrice, priceDecimals: landingPool.priceDecimals });
  const percent = value => (value === null || value === undefined || value === UNKNOWN_VALUE ? null : value);
  const escrowed = extras.escrowedShares;
  const supply = extras.totalSupply;
  return {
    id: landingPool.id, name: landingPool.name, address: landingPool.address, assetSymbol: landingPool.assetSymbol,
    shareSymbol: landingPool.shareSymbol, price, assets,
    tvlUsd: assets !== null && price !== null ? assets * price : null,
    capacityPercent: landingPool.capacityUncapped ? null : landingPool.capacityPercent,
    capacityUncapped: Boolean(landingPool.capacityUncapped),
    apy30: percent(landingPool.earningsPeriodFinishMilliseconds === 0 ? '0.0%' : trailing?.apy),
    apy7: percent(landingPool.earningsPeriodFinishMilliseconds === 0 ? '0.0%' : trailing?.apy7d),
    apy30WindowSeconds: trailing?.windowSeconds ?? null,
    apy7WindowSeconds: trailing?.apy7dWindowSeconds ?? null,
    series,
    escrowedAssets: escrowed !== null && supply !== null && supply > 0n && extras.totalAssets !== null
      ? toNumber((escrowed * extras.totalAssets) / supply) : null,
    escrowedPercent: escrowed !== null && supply !== null && supply > 0n ? Number((escrowed * 10_000n) / supply) / 100 : null,
    withdrawalReserve: extras.reserve === null ? null : toNumber(extras.reserve),
  };
}

export async function fetchSystemDashboard(chainId, { signal } = {}) {
  const network = getProtocolNetwork(chainId);
  if (!network) throw new Error('The protocol is not deployed on this network.');
  const client = readClientFor(chainId);
  const landing = await fetchLandingChainData(zeroAddress, chainId, { signal });
  checkAbort(signal);
  const { contracts } = network;
  const calls = [
    { address: contracts.usd8, abi: erc20Abi, functionName: 'totalSupply' },
    { address: contracts.registry, abi: registryTimingAbi, functionName: 'exitTimingConfig' },
    ...landing.pools.flatMap(pool => [
      { address: pool.address, abi: poolAbi, functionName: 'totalAssets' },
      { address: pool.address, abi: poolAbi, functionName: 'totalSupply' },
      { address: pool.address, abi: poolAbi, functionName: 'balanceOf', args: [pool.address] },
      { address: pool.address, abi: poolQueueAbi, functionName: 'withdrawalReserve' },
    ]),
  ];
  const results = await multicall(client, { contracts: calls, allowFailure: true });
  checkAbort(signal);
  const supplyRaw = success(results[0]);
  const timingRaw = success(results[1]);
  const timing = timingRaw ? { cooldown: Number(timingRaw.unstakeCooldown), interval: Number(timingRaw.exitBatchInterval) } : null;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const pools = await Promise.all(landing.pools.map(async (pool, index) => {
    const base = 2 + index * 4;
    const extras = {
      totalAssets: success(results[base]), totalSupply: success(results[base + 1]),
      escrowedShares: success(results[base + 2]), reserve: success(results[base + 3]),
    };
    const [data, queue] = await Promise.all([
      readPool(pool, extras, { chainId, signal }),
      timing ? readExitQueue(client, network, pool, nowSeconds, timing, signal).catch(() => { checkAbort(signal); return { rows: [], unavailable: true }; })
        : Promise.resolve({ rows: [], unavailable: true }),
    ]);
    return { ...data, exits: queue.rows, exitsUnavailable: queue.unavailable };
  }));
  const reserve = await readReserve(client, network, signal).catch(() => { checkAbort(signal); return { reserve: null, series: [] }; });
  const coverage = landing.insurance?.tokens?.usd8;
  const maxCoverageBps = coverage?.enabled ? Number(coverage.maxCoverageBps) : null;
  const supply = supplyRaw === null ? null : toNumber(supplyRaw);
  const totalCover = pools.every(pool => pool.tvlUsd !== null) ? pools.reduce((sum, pool) => sum + pool.tvlUsd, 0) : null;
  return {
    updatedAt: Date.now(), blockNumber: landing.blockNumber, timing,
    insured: {
      symbol: 'USD8', supply, maxCoverageBps,
      exposure: supply !== null && Number.isFinite(maxCoverageBps) ? (supply * maxCoverageBps) / 10_000 : null,
    },
    reserve,
    totalCover, pools,
  };
}

export function loadSystemDashboard(chainId, { signal, staleTime = 15_000 } = {}) {
  const network = getProtocolNetwork(chainId);
  return cachedData(protocolKey(network, 'system-dashboard'), ({ signal: querySignal }) => fetchSystemDashboard(chainId, { signal: querySignal }),
    { signal, staleTime });
}

/// Adds several pools' value-over-time series onto one evenly spaced timeline.
/// Each pool contributes its last known value; a pool that did not exist yet adds 0.
export function sumSeries(seriesList, points = SERIES_POINTS) {
  const lists = seriesList.filter(list => list.length);
  if (!lists.length) return [];
  const start = Math.min(...lists.map(list => list[0].t));
  const end = Math.max(...lists.map(list => list.at(-1).t));
  if (end <= start) return [{ t: end, v: lists.reduce((sum, list) => sum + list.at(-1).v, 0) }];
  return Array.from({ length: points }, (_, i) => {
    const t = Math.round(start + ((end - start) * i) / (points - 1));
    const v = lists.reduce((sum, list) => {
      const known = list.filter(point => point.t <= t).at(-1);
      return sum + (known ? known.v : 0);
    }, 0);
    return { t, v };
  });
}
