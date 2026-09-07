import { exitAssetAmount } from './poolWithdrawal.js';
import { historicalClaimIds as readHistoricalClaimIds } from './claimHistory.js';
import { snapshotReads } from './snapshotReads.js';
import { cachedData, checkAbort, protocolKey, queryClient } from './dataCache.js';
import { fetchJson, mapLimited } from './requestUtils.js';
import { fetchLogsInChunks, incrementalLogs, poolHistory } from './history.js';
export { fetchLogsInChunks } from './history.js';
import { poolAbi, defiInsuranceAbi, priceOracleAbi, claimRegisteredEvent, claimCancelledEvent } from './readAbis.js';
import { createPublicClient, formatUnits, http, zeroAddress } from 'viem';
import { getNetwork, getProtocolNetwork, SEPOLIA_CONTRACTS } from './networkConfig.js';
import { erc1155Abi, erc20Abi, registryBoosterAbi } from './abis.js';
import { boostedScore, WAD } from './units.js';

export { erc20Abi };

const clients = new Map();
const TRAILING_WINDOW_SECONDS = 30 * 24 * 60 * 60;
const SEPOLIA_BLOCKSCOUT_URL = 'https://eth-sepolia.blockscout.com/api/v2';

const SEPOLIA_BLOCK_SECONDS = 12n;
const UNKNOWN_VALUE = '—';
// Public Sepolia endpoints cap eth_getLogs spans — the default endpoint rejects
// anything wider than 30k blocks — so every log read is chunked below this width.
const LOG_QUERY_BLOCK_RANGE = 10_000n;

function protocolUnavailableError(chainId) {
  const network = getNetwork(chainId);
  return new Error(network ? `USD8 is not deployed on ${network.name}` : 'USD8 is not deployed on the selected network');
}

function throwIfRequestAborted(signal) {
  if (!signal?.aborted) return;
  const error = new Error('Wallet snapshot request aborted.');
  error.name = 'AbortError';
  throw error;
}

export function rpcTransportFor(rpcUrl) {
  return http(rpcUrl, { timeout: 15_000 });
}

export function publicClientFor(chainId) {
  const network = getProtocolNetwork(chainId);
  if (!network) throw protocolUnavailableError(chainId);

  let client = clients.get(network.id);
  if (!client) {
    client = createPublicClient({
      chain: network.chain,
      transport: rpcTransportFor(network.rpcUrl),
    });
    clients.set(network.id, client);
  }
  return client;
}

export { SEPOLIA_CONTRACTS };

const erc20TransferEvent = erc20Abi.find((item) => item.type === 'event' && item.name === 'Transfer');

const registryScoreSpentAbi = [{
  type: 'function',
  name: 'scoreSpent',
  stateMutability: 'view',
  inputs: [{ name: 'account', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }],
}];

const registryScoreAbi = [{
  type: 'function',
  name: 'getScoredRateHistory',
  stateMutability: 'view',
  inputs: [{ name: 'token', type: 'address' }],
  outputs: [{
    name: '',
    type: 'tuple[]',
    components: [
      { name: 'fromBlock', type: 'uint64' },
      { name: 'rate', type: 'uint128' },
    ],
  }],
}];

export async function fetchBoosterBalance(client, registry, account, policy, blockNumber) {
  const [collection, tokenId] = policy || await client.readContract({
    address: registry,
    abi: registryBoosterAbi,
    functionName: 'boosterConfig',
  });
  if (collection === zeroAddress) return 0n;
  return client.readContract({
    address: collection,
    abi: erc1155Abi,
    functionName: 'balanceOf',
    args: [account, tokenId],
    ...(blockNumber === undefined ? {} : { blockNumber }),
  });
}

async function holdingWindowBlocks(client, address, blockNumber) {
  const params = await client.readContract({ address, abi: defiInsuranceAbi, functionName: 'settlementParams', blockNumber });
  const blocks = params?.minHoldingRequired ?? params?.[1];
  return typeof blocks === 'bigint' && blocks > 0n ? blocks.toString() : null;
}

function currentScorePerSecond(balance, rateHistory) {
  const rate = rateHistory.at(-1)?.rate ?? 0n;
  return balance * rate / WAD / SEPOLIA_BLOCK_SECONDS;
}

async function latestIndexedBalanceChangeTimestampMilliseconds(token, account, fromBlock, signal) {
  const url = new URL(`${SEPOLIA_BLOCKSCOUT_URL}/addresses/${account}/token-transfers`);
  url.searchParams.set('type', 'ERC-20');
  url.searchParams.set('token', token);
  const payload = await fetchJson(url, { signal });
  const transfer = Array.isArray(payload?.items)
    ? payload.items.find((item) => (
      item?.token?.address_hash?.toLowerCase() === token.toLowerCase()
      && Number.isSafeInteger(item.block_number)
      && BigInt(item.block_number) >= fromBlock
      && Number.isFinite(Date.parse(item.timestamp))
    ))
    : null;
  return transfer ? Date.parse(transfer.timestamp) : null;
}

async function latestBalanceChangeTimestampMilliseconds(
  client,
  token,
  account,
  fromBlock,
  fallbackTimestampMilliseconds,
  signal,
  snapshotBlock,
) {
  try {
    const indexedTimestamp = await latestIndexedBalanceChangeTimestampMilliseconds(
      token,
      account,
      fromBlock,
      signal,
    );
    if (indexedTimestamp !== null) return indexedTimestamp;
  } catch {
    checkAbort(signal);
    // Fall through to RPC logs when the explorer index is unavailable or behind.
  }
  try {
    let toBlock = snapshotBlock ?? await client.getBlockNumber();
    let chunks = 0;
    while (toBlock >= fromBlock && chunks++ < 12) {
      checkAbort(signal);
      const chunkFromBlock = toBlock - fromBlock + 1n > LOG_QUERY_BLOCK_RANGE
        ? toBlock - LOG_QUERY_BLOCK_RANGE + 1n
        : fromBlock;
      const [sent, received] = await Promise.all([
        client.getLogs({
          address: token,
          event: erc20TransferEvent,
          args: { from: account },
          fromBlock: chunkFromBlock,
          toBlock,
        }),
        client.getLogs({
          address: token,
          event: erc20TransferEvent,
          args: { to: account },
          fromBlock: chunkFromBlock,
          toBlock,
        }),
      ]);
      const latest = [...sent, ...received]
        .filter((log) => typeof log.blockNumber === 'bigint')
        .sort((left, right) => (
          left.blockNumber === right.blockNumber
            ? Number(right.logIndex ?? 0) - Number(left.logIndex ?? 0)
            : left.blockNumber > right.blockNumber ? -1 : 1
        ))[0];
      if (latest) {
        const block = await client.getBlock({ blockNumber: latest.blockNumber });
        return Number(block.timestamp) * 1_000;
      }
      if (chunkFromBlock === fromBlock) break;
      toBlock = chunkFromBlock - 1n;
    }
    return fallbackTimestampMilliseconds;
  } catch {
    checkAbort(signal);
    return fallbackTimestampMilliseconds;
  }
}

function formatted(value, decimals = 18, maximumFractionDigits = decimals) {
  const [whole, fraction = ''] = formatUnits(value, decimals).split('.');
  const visible = fraction.slice(0, maximumFractionDigits).replace(/0+$/, '');
  return visible ? `${whole}.${visible}` : whole;
}

function insuranceCoverageCap(value) {
  if ((typeof value !== 'bigint' && typeof value !== 'number')
    || (typeof value === 'number' && (!Number.isSafeInteger(value) || value < 0))) {
    throw new Error('Invalid insurance coverage cap.');
  }
  const cap = BigInt(value);
  if (cap <= 0n || cap > 10_000n) throw new Error('Invalid insurance coverage cap.');
  return cap;
}

function insuranceTokenState(tokenId, address, config, claimantCoverageCapBps) {
  const rawCoverageBps = config?.maxCoverageBps ?? config?.[0];
  if ((typeof rawCoverageBps !== 'bigint' && typeof rawCoverageBps !== 'number')
    || (typeof rawCoverageBps === 'number'
      && (!Number.isSafeInteger(rawCoverageBps) || rawCoverageBps < 0))) {
    throw new Error(`Invalid insurance configuration for ${tokenId}.`);
  }
  const maxCoverageBps = BigInt(rawCoverageBps);
  if (maxCoverageBps < 0n || maxCoverageBps > claimantCoverageCapBps) {
    throw new Error(`Invalid insurance configuration for ${tokenId}.`);
  }
  return {
    address: address.toLowerCase(),
    enabled: maxCoverageBps !== 0n,
    maxCoverageBps: maxCoverageBps.toString(),
  };
}

// A live claim is always part of its own total, so a zero denominator means the
// registration logs were unavailable, not that the share is zero. Report the gap
// rather than an impossible 0%.
function claimPercentage(amount, total) {
  if (total === 0n) return UNKNOWN_VALUE;
  const tenths = (amount * 1_000n) / total;
  return `${tenths / 10n}.${tenths % 10n}%`;
}

function formattedUsd(assetAmount, price, priceDecimals) {
  if (price <= 0n) return '—';
  const value = Number(formatUnits(assetAmount * price, 18 + Number(priceDecimals)));
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    useGrouping: false,
  });
}

export function calculateTrailingRewardApr({
  events,
  nowSeconds,
  windowSeconds,
  deploymentTimestamp,
  currentAssetUsdPrice,
  priceDecimals,
}) {
  if (currentAssetUsdPrice <= 0n) return '—';
  const windowStart = Math.max(deploymentTimestamp, nowSeconds - windowSeconds);
  let cursor = deploymentTimestamp;
  let assets = 0n;
  let rewardRate = 0n;
  let periodFinish = 0;
  let assetSeconds = 0n;
  let accruedRewards = 0n;

  const integrateUntil = (timestamp) => {
    const end = Math.min(timestamp, nowSeconds);
    const start = Math.max(cursor, windowStart);
    if (end > start) {
      assetSeconds += assets * BigInt(end - start);
      const rewardEnd = Math.min(end, periodFinish);
      if (rewardEnd > start) accruedRewards += rewardRate * BigInt(rewardEnd - start);
    }
    cursor = timestamp;
  };

  [...events]
    .sort((a, b) => a.timestamp - b.timestamp || a.logIndex - b.logIndex)
    .forEach((event) => {
      integrateUntil(event.timestamp);
      if (event.type === 'deposit') assets += event.assets;
      if (event.type === 'exit' || event.type === 'claim') {
        assets = event.assets >= assets ? 0n : assets - event.assets;
      }
      if (event.type === 'reward') {
        rewardRate = event.rate;
        periodFinish = event.periodFinish;
      }
    });
  integrateUntil(nowSeconds);

  const poolValueSeconds = (assetSeconds * currentAssetUsdPrice) / (10n ** BigInt(priceDecimals));
  if (poolValueSeconds === 0n) return '—';
  const annualSeconds = 365n * 24n * 60n * 60n;
  const basisPoints = (accruedRewards * annualSeconds * 10_000n + poolValueSeconds / 2n) / poolValueSeconds;
  const percent = Number(basisPoints) / 100;
  return `${percent.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    useGrouping: false,
  })}%`;
}

export async function fetchTrailingRewardApr(poolAddress, price, priceDecimals, chainId, { signal } = {}) {
  const network = getProtocolNetwork(chainId);
  const logs = await cachedData(protocolKey(network, 'apr-history', poolAddress.toLowerCase()),
    ({ signal: querySignal }) => poolHistory(publicClientFor(chainId), chainId, poolAddress, SEPOLIA_BLOCKSCOUT_URL, { signal: querySignal }),
    { signal, staleTime: 5 * 60_000 });
  const valueOf = (log, name) => log.decoded?.parameters?.find((parameter) => parameter.name === name)?.value;
  const events = logs.flatMap((log) => {
    const timestamp = Math.floor(Date.parse(log.block_timestamp) / 1_000);
    const logIndex = Number(log.index);
    const method = log.decoded?.method_call || '';
    if (method.startsWith('Deposit(')) {
      return [{ timestamp, logIndex, type: 'deposit', assets: BigInt(valueOf(log, 'assets')) }];
    }
    if (method.startsWith('ExitEpochSettled(')) {
      return [{ timestamp, logIndex, type: 'exit', assets: BigInt(valueOf(log, 'assets')) }];
    }
    if (method.startsWith('ClaimPaid(')) {
      return [{ timestamp, logIndex, type: 'claim', assets: BigInt(valueOf(log, 'amount')) }];
    }
    if (method.startsWith('RewardNotified(')) {
      return [{
        timestamp,
        logIndex,
        type: 'reward',
        rate: BigInt(valueOf(log, 'newRate')),
        periodFinish: Number(valueOf(log, 'newPeriodFinish')),
      }];
    }
    return [];
  });
  const deploymentTimestamp = Math.min(...logs.map((log) => Math.floor(Date.parse(log.block_timestamp) / 1_000)));
  const value = calculateTrailingRewardApr({
    events,
    nowSeconds: Math.floor(Date.now() / 1_000),
    windowSeconds: TRAILING_WINDOW_SECONDS,
    deploymentTimestamp,
    currentAssetUsdPrice: price,
    priceDecimals,
  });
  return value;
}

/// Resolves the full snapshot, but invokes `onPartial` with balances and pool
/// figures as soon as they are known — before the Blockscout APR walk and the
/// incident reads, which are far slower and not needed to render the wallet.
export async function fetchLandingChainData(account, chainId, { signal, onPartial, refresh = false, resources, minBlock } = {}) {
  const network = getProtocolNetwork(chainId);
  if (!network) throw protocolUnavailableError(chainId);
  throwIfRequestAborted(signal);
  const { contracts } = network;
  const client = publicClientFor(chainId);
  const zero = 0n;
  const hasAccount = Boolean(account) && account.toLowerCase() !== zeroAddress;
  account = hasAccount ? account.toLowerCase() : zeroAddress;
  let blockNumber = await cachedData(protocolKey(network, 'block'), () => client.getBlockNumber({ cacheTime: 0 }), { signal, staleTime: refresh ? 0 : 15_000 });
  if (minBlock !== undefined && blockNumber < minBlock) blockNumber = minBlock;
  checkAbort(signal);
  const insuredTokenEntries = Object.entries(contracts.insuredTokens);
  const coverPools = contracts.coverPools;
  const FIXED_READS = 12;
  const POOL_READS = 13;
  // Fixed account/protocol reads first, then a fixed-width block per cover pool
  // so adding a pool cannot shift the earlier positions.
  const landingCalls = [
    { address: contracts.usdc, abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.usd8, abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.savingsVault, abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'activeIncidentId' },
    { address: contracts.insuredTokens['aave-sgho'], abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.insuredTokens['sky-susds'], abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.insuredTokens['test-msloss'], abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.registry, abi: registryScoreAbi, functionName: 'getScoredRateHistory', args: [contracts.usd8] },
    { address: contracts.registry, abi: registryScoreAbi, functionName: 'getScoredRateHistory', args: [contracts.savingsVault] },
    { address: contracts.registry, abi: registryBoosterAbi, functionName: 'boosterConfig' },
    { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'nextIncidentId' },
    { address: contracts.registry, abi: registryScoreSpentAbi, functionName: 'scoreSpent', args: [account] },
    ...coverPools.flatMap((pool) => [
      { address: pool.asset, abi: erc20Abi, functionName: 'balanceOf', args: [account] },
      { address: pool.address, abi: poolAbi, functionName: 'balanceOf', args: [account] },
      { address: pool.address, abi: poolAbi, functionName: 'totalAssets' },
      { address: pool.address, abi: poolAbi, functionName: 'depositCap' },
      { address: pool.address, abi: poolAbi, functionName: 'earned', args: [account] },
      { address: pool.address, abi: poolAbi, functionName: 'decimals' },
      { address: pool.address, abi: poolAbi, functionName: 'rewardRate' },
      { address: pool.address, abi: poolAbi, functionName: 'totalSupply' },
      { address: pool.address, abi: poolAbi, functionName: 'balanceOf', args: [pool.address] },
      { address: pool.address, abi: poolAbi, functionName: 'periodFinish' },
      { address: pool.address, abi: poolAbi, functionName: 'exitRequests', args: [account] },
      { address: pool.usdOracle, abi: priceOracleAbi, functionName: 'latestRoundData' },
      { address: pool.usdOracle, abi: priceOracleAbi, functionName: 'decimals' },
    ]),
  ];

  const insuranceCalls = [
    {
      address: contracts.defiInsurance,
      abi: defiInsuranceAbi,
      functionName: 'MAX_CLAIMANT_COVERAGE_BPS',
    },
    ...insuredTokenEntries.map(([, insuredToken]) => ({
      address: contracts.defiInsurance,
      abi: defiInsuranceAbi,
      functionName: 'getInsuredToken',
      args: [insuredToken],
    })),
  ];

  const allCalls = [...landingCalls, ...insuranceCalls];
  const fixedResources = ['account-balances', 'account-balances', 'account-balances', 'head',
    'account-balances', 'account-balances', 'account-balances', 'configuration', 'configuration', 'configuration', 'head', 'account-balances'];
  const poolAccountOffsets = [0, 1, 4, 10];
  const descriptors = allCalls.map((call, index) => {
    let resource = index < FIXED_READS ? fixedResources[index] : 'configuration';
    if (index >= FIXED_READS && index < landingCalls.length) {
      const poolIndex = Math.floor((index - FIXED_READS) / POOL_READS);
      const offset = (index - FIXED_READS) % POOL_READS;
      resource = `${poolAccountOffsets.includes(offset) ? 'account-pool' : 'pool'}:${coverPools[poolIndex].id}`;
    }
    const fallback = call.functionName === 'exitRequests' ? [0n, 0n]
      : call.functionName === 'latestRoundData' ? [0n, 0n, 0n, 0n, 0n]
      : call.functionName === 'boosterConfig' ? [zeroAddress, 0n, 0n]
      : call.functionName === 'getScoredRateHistory' ? [] : 0n;
    return { call, resource, fallback, index };
  });
  const selected = descriptors.filter(entry => hasAccount || !entry.resource.startsWith('account'));
  // Retrying the incident's archived settlement parameters also needs the
  // current incident ID and configuration required to reconstruct that cache.
  const requestedResources = resources?.includes('incident-settlement-params')
    ? [...new Set([...resources, 'head', 'configuration'])]
    : resources;
  const readResult = await snapshotReads(client, network, selected, {
    account, signal, blockNumber, refresh, resources: requestedResources,
  });
  const landingValues = descriptors.map(entry => entry.fallback);
  selected.forEach((entry, index) => { landingValues[entry.index] = readResult.values[index]; });
  const resourceErrors = readResult.errors;
  if (resourceErrors.head) throw new Error(resourceErrors.head);
  throwIfRequestAborted(signal);
  const [usdc, usd8, savings, activeIncidentId, sGho, sUsds, msloss,
    usd8ScoreRates, savingsScoreRates, boosterPolicy, nextIncidentId,
    onchainScoreSpent] = landingValues.slice(0, FIXED_READS);
  const poolReads = coverPools.map((config, index) => {
    const [assetBalance, shares, totalAssets, depositCap, earned, shareDecimals, rewardRate,
      totalSupply, escrowedShares, periodFinish, [pendingExitShares, exitEpoch],
      [, assetUsdPrice], assetUsdDecimals] = landingValues.slice(
      FIXED_READS + index * POOL_READS,
      FIXED_READS + (index + 1) * POOL_READS,
    );
    return {
      config,
      assetBalance,
      shares,
      totalAssets,
      depositCap,
      earned,
      shareDecimals,
      rewardRate,
      totalSupply,
      escrowedShares,
      periodFinish,
      pendingExitShares,
      exitEpoch,
      assetUsdPrice,
      assetUsdDecimals,
    };
  });
  const [rawClaimantCoverageCapBps, ...insuranceValues] = landingValues.slice(landingCalls.length);
  const insuranceTokens = resourceErrors.configuration ? {} : Object.fromEntries(insuredTokenEntries.map(
    ([tokenId, insuredToken], index) => [tokenId, insuranceTokenState(tokenId, insuredToken, insuranceValues[index], insuranceCoverageCap(rawClaimantCoverageCapBps))],
  ));
  const scoreBalancesSnapshotTimestampMilliseconds = Date.now();
  // Timestamp history is optional enrichment; never gate usable balances on it.
  const usd8BalanceChangeTimestamp = usd8 === zero ? 0 : scoreBalancesSnapshotTimestampMilliseconds;
  const savingsBalanceChangeTimestamp = savings === zero ? 0 : scoreBalancesSnapshotTimestampMilliseconds;
  const [minHoldingRequiredBlocks, boosterBalance, claimBond] = await Promise.all([
    cachedData(protocolKey(network, 'settlement-params'),
      () => holdingWindowBlocks(client, contracts.defiInsurance, blockNumber), { signal, staleTime: refresh ? 0 : 60_000 })
      .catch(error => { checkAbort(signal); resourceErrors['settlement-params'] = error.message; return null; }),
    hasAccount && !resourceErrors.configuration
      ? cachedData(protocolKey(network, 'account-boosters', account, boosterPolicy[0], String(boosterPolicy[1])),
        () => fetchBoosterBalance(client, contracts.registry, account, boosterPolicy, blockNumber), { signal, staleTime: refresh && (!resources || resources.includes('incident')) ? 0 : 15_000 })
        .catch(error => { checkAbort(signal); resourceErrors.boosters = error.message; return null; }) : 0n,
    cachedData(protocolKey(network, 'claim-bond'), () => client.readContract({ address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'claimBondAmount', blockNumber }), { signal, staleTime: refresh ? 0 : 60_000 })
      .catch(error => { checkAbort(signal); resourceErrors['claim-bond'] = error.message; return null; }),
  ]);

  // Depend on balances from the multicall above but not on each other, so the
  // savings conversion and every pool's conversion/exit read resolve together.
  const derivedCalls = [
    savings === zero ? null : {
      address: contracts.savingsVault, abi: poolAbi, functionName: 'convertToAssets', args: [savings],
    },
    ...poolReads.flatMap((read) => [
      read.shares === zero ? null : {
        address: read.config.address, abi: poolAbi, functionName: 'convertToAssets', args: [read.shares],
      },
      read.pendingExitShares === zero ? null : {
        address: read.config.address, abi: poolAbi, functionName: 'exitEpochs', args: [read.exitEpoch],
      },
      read.pendingExitShares === zero ? null : {
        address: read.config.address, abi: poolAbi, functionName: 'convertToAssets', args: [read.pendingExitShares],
      },
    ]),
  ];
  const derivedDescriptors = derivedCalls.flatMap((call, index) => call ? [{ call,
    resource: index === 0 ? 'account-savings-conversion' : `account-pool-derived:${coverPools[Math.floor((index - 1) / 3)].id}`,
    fallback: call.functionName === 'exitEpochs' ? [0n, 0n, 0n, 0n] : 0n,
  }] : []);
  for (const descriptor of derivedDescriptors) descriptor.cacheScope = derivedDescriptors.filter(item => item.resource === descriptor.resource).map(item => item.call.args.map(String).join(',')).join('|');
  const derivedResult = await snapshotReads(client, network, derivedDescriptors, { account, blockNumber, signal, refresh,
    resources: resources?.flatMap(resource => resource === 'account-balances' ? [resource, 'account-savings-conversion']
      : resource.startsWith('account-pool:') ? [resource, resource.replace('account-pool:', 'account-pool-derived:')] : [resource]),
  });
  Object.assign(resourceErrors, derivedResult.errors);
  const derived = derivedResult.values;
  let derivedIndex = 0;
  const savingsAssets = savings === zero ? zero : derived[derivedIndex++];

  const pools = poolReads.map((read) => {
    const depositedAssets = read.shares === zero ? zero : derived[derivedIndex++];
    const exitEpoch = read.pendingExitShares === zero
      ? [zero, zero, zero, zero]
      : derived[derivedIndex++];
    const pendingEstimate = read.pendingExitShares === zero ? zero : derived[derivedIndex++];
    const remainingExitShares = exitEpoch[2];
    const exitAssets = read.pendingExitShares === zero ? zero : exitAssetAmount(read.pendingExitShares, exitEpoch,
      read.pendingExitShares === read.totalSupply ? read.totalAssets : pendingEstimate);
    const conversionUnavailable = Boolean(resourceErrors[`account-pool-derived:${read.config.id}`]);
    const exitMatured = Date.now() >= Number(read.exitEpoch) * 1_000;
    const exitAvailable = read.pendingExitShares > zero
      && (remainingExitShares > zero || (exitMatured && activeIncidentId === zero));
    const capacityPercent = read.depositCap === zero
      ? 0
      : Number((read.totalAssets * 10_000n) / read.depositCap) / 100;
    const earningShares = read.totalSupply > read.escrowedShares
      ? read.totalSupply - read.escrowedShares
      : zero;
    const earningsPerSecond = earningShares === zero
      ? zero
      : (read.shares * read.rewardRate) / earningShares;
    const shareDecimals = Number(read.shareDecimals);
    return {
      id: read.config.id,
      name: read.config.name,
      address: read.config.address,
      asset: read.config.asset,
      assetSymbol: read.config.assetSymbol,
      shareSymbol: read.config.shareSymbol,
      assetBalance: formatted(read.assetBalance),
      apy: null,
      tvl: formattedUsd(read.totalAssets, read.assetUsdPrice, read.assetUsdDecimals),
      capacityPercent: Math.min(100, capacityPercent),
      capacityUncapped: read.depositCap === zero,
      remainingDepositCapacity: read.depositCap === zero
        ? ''
        : formatted(read.depositCap > read.totalAssets ? read.depositCap - read.totalAssets : zero),
      assets: formatted(read.totalAssets),
      // Display only; two decimals keeps the card readable.
      deposit: formatted(depositedAssets, 18, 2),
      availableForCooldownAssets: conversionUnavailable ? null : formatUnits(depositedAssets, 18),
      availableForWithdrawAssets: conversionUnavailable ? null : formatUnits(exitAvailable ? exitAssets : zero, 18),
      inCooldownAssets: conversionUnavailable ? null : formatUnits(exitAvailable ? zero : exitAssets, 18),
      exitSettled: remainingExitShares > zero,
      withdrawalQuote: resourceErrors[`pool:${read.config.id}`] ? null : { totalAssets: read.totalAssets.toString(), totalSupply: read.totalSupply.toString() },
      availableForCooldown: formatUnits(read.shares, shareDecimals),
      availableForWithdraw: formatted(exitAvailable ? read.pendingExitShares : zero, shareDecimals),
      inCooldown: formatted(exitAvailable ? zero : read.pendingExitShares, shareDecimals),
      cooldownEndsAtMilliseconds: read.pendingExitShares > zero ? Number(read.exitEpoch) * 1_000 : 0,
      earnings: formatted(read.earned, 18, 1),
      earningsExact: formatUnits(read.earned, 18),
      earningsPerSecond: formatUnits(earningsPerSecond, 18),
      earningsSnapshotTimestampMilliseconds: Date.now(),
      earningsPeriodFinishMilliseconds: Number(read.periodFinish) * 1_000,
      hasEarnings: read.earned > zero,
      shareDecimals,
    };
  });

  const snapshot = ({ pools: poolExtras, ...extra } = {}) => ({
    blockNumber: blockNumber.toString(),
    updatedAt: readResult.updatedAt,
    resourceErrors,
    scoreHistoryInputs: { usd8FromBlock: String(usd8ScoreRates[0]?.fromBlock ?? 0n), savingsFromBlock: String(savingsScoreRates[0]?.fromBlock ?? 0n) },
    activeIncidentId: activeIncidentId.toString(),
    incident: null,
    claim: null,
    insurance: { tokens: insuranceTokens, minHoldingRequiredBlocks, claimBond: claimBond === null ? null : formatted(claimBond) },
    scoreBalances: resourceErrors['account-balances'] ? null : { usd8: usd8.toString(), savings: savings.toString() },
    // The score snapshot lags a spend until it finalizes, so the app compares
    // this against the snapshot's own scoreSpent to know when to re-fetch.
    scoreSpent: onchainScoreSpent.toString(),
    scoreRatesPerSecond: resourceErrors['account-balances'] || resourceErrors.configuration ? null : {
      usd8: formatUnits(currentScorePerSecond(usd8, usd8ScoreRates), 18),
      savings: formatUnits(currentScorePerSecond(savings, savingsScoreRates), 18),
    },
    scoreBalanceChangeTimestampMilliseconds: {
      usd8: usd8BalanceChangeTimestamp,
      savings: savingsBalanceChangeTimestamp,
    },
    scoreBalancesSnapshotTimestampMilliseconds,
    balances: resourceErrors['account-balances'] ? { usdc: '—', usd8: '—', savings: '—', savingsAssets: '—', insuredTokens: {} } : {
      usdc: formatted(usdc, 6),
      usd8: formatted(usd8),
      savings: formatted(savings),
      savingsAssets: resourceErrors['account-savings-conversion'] ? '—' : formatted(savingsAssets),
      coverAsset: pools[0]?.assetBalance ?? '0',
      poolShares: pools[0]?.availableForCooldown ?? '0',
      boosters: boosterBalance === null ? '—' : boosterBalance.toString(),
      insuredTokens: {
        'aave-sgho': formatted(sGho),
        'sky-susds': formatted(sUsds),
        'test-msloss': formatted(msloss),
      },
    },
    pools: pools.map((pool, index) => ({ ...pool,
      usdPrice: poolReads[index].assetUsdPrice.toString(), priceDecimals: Number(poolReads[index].assetUsdDecimals),
      ...(resourceErrors[`pool:${pool.id}`] ? { tvl: null, capacityPercent: null, apy: '—', dataUnavailable: true } : {}),
      ...(resourceErrors[`account-pool:${pool.id}`] || resourceErrors[`account-pool-derived:${pool.id}`] ? { deposit: '—', earnings: '—', assetBalance: '—', dataUnavailable: true } : {}),
      ...poolExtras?.[index] })),
    ...extra,
  });
  onPartial?.(snapshot());

  const headBlock = blockNumber;
  throwIfRequestAborted(signal);

  const incidentKey = protocolKey(network, 'incident', account);
  const incidentRequested = !resources
    || resources.includes('incident')
    || resources.includes('incident-settlement-params');
  if (refresh && incidentRequested) {
    await queryClient.cancelQueries({ queryKey: incidentKey, exact: true });
    await queryClient.invalidateQueries({ queryKey: incidentKey, exact: true, refetchType: 'none' });
  }
  const cachedIncident = queryClient.getQueryData(incidentKey);
  const { incident, claim } = resources && !incidentRequested && cachedIncident
    ? cachedIncident : await cachedData(incidentKey, ({ signal: querySignal }) => readIncident({
      client, contracts, account, hasAccount, activeIncidentId, nextIncidentId, boosterPolicy,
      chainId, headBlock, blockNumber, signal: querySignal,
      onIncidentHoldingWindowError: error => { resourceErrors['incident-settlement-params'] = error.shortMessage || error.message; },
      onIncident: extra => { if (!signal?.aborted) onPartial?.(snapshot({ ...extra, incidentReady: true })); },
    }), { signal }).catch(error => {
      checkAbort(signal);
      resourceErrors.incident = error.shortMessage || error.message;
      return { incident: null, claim: null };
    });

  throwIfRequestAborted(signal);

  return snapshot({ incident, claim });
}

async function readIncident({ client, contracts, account, hasAccount, activeIncidentId, nextIncidentId, boosterPolicy, chainId, headBlock, blockNumber, signal, onIncident, onIncidentHoldingWindowError }) {
  const zero = 0n;
  let incident = null;
  let claim = null;
  let displayedIncidentId = activeIncidentId;
  let historicalClaimId = zero;
  let historicalClaimState = null;
  if (hasAccount && displayedIncidentId === zero) {
    if (nextIncidentId > 10_001n) throw new Error('Claim history exceeds the supported range.');
    const historicalIncidentIds = Array.from({ length: Math.max(0, Number(nextIncidentId - 1n)) }, (_, index) => BigInt(index + 1));
    if (historicalIncidentIds.length > 0) {
      const historicalClaimIds = await readHistoricalClaimIds(client, `${chainId}:${contracts.defiInsurance}:${account}`, nextIncidentId, blockNumber, ids => client.multicall({
        contracts: ids.map((incidentId) => ({
          address: contracts.defiInsurance,
          abi: defiInsuranceAbi,
          functionName: 'claimIdByIncidentAndUser',
          args: [incidentId, account],
        })),
        allowFailure: false, blockNumber,
      }), { signal });
      const candidates = historicalIncidentIds
        .map((incidentId, index) => ({ incidentId, claimId: historicalClaimIds[index] }))
        .filter(({ claimId }) => claimId !== zero)
        .reverse();
      if (candidates.length > 0) {
        const candidateChunks = [];
        for (let offset = 0; offset < candidates.length; offset += 128) candidateChunks.push(candidates.slice(offset, offset + 128));
        const candidateStates = (await mapLimited(candidateChunks, chunk => client.multicall({
          contracts: chunk.map(({ claimId }) => ({
            address: contracts.defiInsurance,
            abi: defiInsuranceAbi,
            functionName: 'claims',
            args: [claimId],
          })),
          allowFailure: false, blockNumber,
        }), { signal, concurrency: 2 })).flat();
        const unresolvedIndex = candidateStates.findIndex((state) => state[5] === false);
        if (unresolvedIndex >= 0) {
          displayedIncidentId = candidates[unresolvedIndex].incidentId;
          historicalClaimId = candidates[unresolvedIndex].claimId;
          historicalClaimState = candidateStates[unresolvedIndex];
        }
      }
    }
  }
  if (displayedIncidentId !== zero) {
    const incidentValues = await client.multicall({
      contracts: [
        { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'incidents', args: [displayedIncidentId] },
        { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'incidentPhaseWindow', args: [displayedIncidentId] },
        ...(hasAccount ? [{ address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'claimIdByIncidentAndUser', args: [displayedIncidentId, account] }] : []),
        { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'incidentPools', args: [displayedIncidentId] },
      ],
      allowFailure: false, blockNumber,
    });
    const [incidentState, phaseWindow] = incidentValues;
    const mappedClaimId = hasAccount ? incidentValues[2] : 0n;
    const rawIncidentPools = incidentValues[hasAccount ? 3 : 2];
    const claimId = historicalClaimId === zero ? mappedClaimId : historicalClaimId;
    const poolAddrs = rawIncidentPools.map((pool) => String(pool).toLowerCase());
    if (poolAddrs.length === 0 || new Set(poolAddrs).size !== poolAddrs.length) {
      throw new Error('Invalid incident pool snapshot.');
    }
    const poolOrder = (await client.multicall({
      contracts: poolAddrs.map((pool) => ({
        address: pool,
        abi: poolAbi,
        functionName: 'asset',
      })),
      allowFailure: false, blockNumber,
    })).map((asset) => String(asset).toLowerCase());
    throwIfRequestAborted(signal);
    if (poolOrder.length !== poolAddrs.length || new Set(poolOrder).size !== poolOrder.length) {
      throw new Error('Invalid incident asset order.');
    }
    const [tokenAddress, , , openBlock, phaseDeadline, root, unresolvedClaims] = incidentState;
    const tokenId = Object.entries(contracts.insuredTokens)
      .find(([, address]) => address.toLowerCase() === tokenAddress.toLowerCase())?.[0] || '';
    const boosterBoostBps = boosterPolicy[2] ?? 0;
    incident = {
      id: displayedIncidentId.toString(),
      tokenId,
      tokenAddress: tokenAddress.toLowerCase(),
      minHoldingRequiredBlocks: await holdingWindowBlocks(client, contracts.defiInsurance, openBlock)
        .catch(error => { checkAbort(signal); onIncidentHoldingWindowError?.(error); return null; }),
      phaseDeadlineMilliseconds: Number(phaseDeadline) * 1_000,
      phaseWindowMilliseconds: Number(phaseWindow) * 1_000,
      root,
      unresolvedClaims: unresolvedClaims.toString(),
      totalScoreCommitted: UNKNOWN_VALUE,
      boosterBoostBps: Number(boosterBoostBps),
      poolAddrs,
      poolOrder,
    };

    if (claimId !== zero) {
      const claimState = historicalClaimState || (await client.multicall({
        contracts: [{ address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'claims', args: [claimId] }],
        allowFailure: false, blockNumber,
      }))[0];
      const [, claimIncidentId, insuredTokenAmount, boosterAmount, bondAmount, resolved] = claimState;
      claim = {
        id: claimId.toString(),
        incidentId: claimIncidentId.toString(),
        insuredTokenAmount: formatted(insuredTokenAmount),
        bondAmount: formatted(bondAmount),
        boosterAmount: boosterAmount.toString(),
        scoreToSpend: UNKNOWN_VALUE,
        scoreCommitmentPercentage: UNKNOWN_VALUE,
        resolved,
      };
    }
    onIncident?.({ incident, claim });
    const claimLogs = await incrementalLogs(client, `claims:${chainId}:${contracts.defiInsurance}:${displayedIncidentId}`, {
      address: contracts.defiInsurance,
      events: [claimRegisteredEvent, claimCancelledEvent],
    }, openBlock, headBlock, { signal }).catch(() => { checkAbort(signal); return []; });
    const cancelledClaimIds = new Set(
      claimLogs
        .filter((log) => log.eventName === 'ClaimCancelled')
        .map((log) => log.args.claimId.toString()),
    );
    const activeRegistrations = claimLogs.filter((log) => (
      log.eventName === 'ClaimRegistered'
      && log.args.incidentId === displayedIncidentId
      && !cancelledClaimIds.has(log.args.claimId.toString())
    ));
    const totalScoreCommitted = activeRegistrations.reduce(
      (total, log) => total + boostedScore(log.args.scoreToSpend, log.args.boosterAmount, boosterBoostBps),
      zero,
    );
    incident = { ...incident, totalScoreCommitted: claimLogs.length ? formatUnits(totalScoreCommitted, 18) : UNKNOWN_VALUE };
    if (claim) {
      const scoreToSpend = activeRegistrations.find(log => log.args.claimId === claimId)?.args.scoreToSpend;
      claim = { ...claim, scoreToSpend: scoreToSpend === undefined ? UNKNOWN_VALUE : formatted(scoreToSpend),
        scoreCommitmentPercentage: scoreToSpend === undefined ? UNKNOWN_VALUE : claimPercentage(boostedScore(scoreToSpend, BigInt(claim.boosterAmount), boosterBoostBps), totalScoreCommitted) };
    }

  }

  return { incident, claim };
}

export async function fetchLandingAnalytics(snapshot, account, chainId, { signal } = {}) {
  const pools = await Promise.all((snapshot.pools || []).map(async pool => ({ id: pool.id,
    apy: pool.usdPrice === undefined ? pool.apy : await fetchTrailingRewardApr(pool.address, BigInt(pool.usdPrice), pool.priceDecimals, chainId, { signal }).catch(error => { checkAbort(signal); return '—'; }),
  })));
  return { pools };
}

export async function fetchScoreHistory(snapshot, account, chainId, { signal } = {}) {
  if (!account || account === zeroAddress || !snapshot.scoreHistoryInputs || !snapshot.scoreBalances) return null;
  const network = getProtocolNetwork(chainId);
  const timestamps = await Promise.all(['usd8', 'savings'].map(token => {
    const balance = snapshot.scoreBalances[token];
    if (balance === '0') return 0;
    const address = token === 'usd8' ? network.contracts.usd8 : network.contracts.savingsVault;
    return cachedData(protocolKey(network, 'score-history', account.toLowerCase(), address, balance),
      ({ signal: querySignal }) => latestBalanceChangeTimestampMilliseconds(publicClientFor(chainId), address, account,
        BigInt(snapshot.scoreHistoryInputs[`${token}FromBlock`]), snapshot.scoreBalancesSnapshotTimestampMilliseconds,
        querySignal, BigInt(snapshot.blockNumber)), { signal, staleTime: 60_000 });
  }));
  return { usd8: timestamps[0], savings: timestamps[1] };
}
