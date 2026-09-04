import { createPublicClient, formatUnits, http, zeroAddress } from 'viem';
import { getNetwork, getProtocolNetwork, SEPOLIA_CONTRACTS } from './networkConfig.js';
import { erc1155Abi, erc20Abi, registryBoosterAbi } from './abis.js';
import { boostedScore, WAD } from './units.js';

export { erc20Abi };

const clients = new Map();
const TRAILING_WINDOW_SECONDS = 30 * 24 * 60 * 60;
const SEPOLIA_BLOCKSCOUT_URL = 'https://eth-sepolia.blockscout.com/api/v2';
const trailingAprCache = new Map();
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

export async function fetchBoosterBalance(client, registry, account) {
  const [collection, tokenId] = await client.readContract({
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
  });
}

function currentScorePerSecond(balance, rateHistory) {
  const rate = rateHistory.at(-1)?.rate ?? 0n;
  return balance * rate / WAD / SEPOLIA_BLOCK_SECONDS;
}

async function latestIndexedBalanceChangeTimestampMilliseconds(token, account, fromBlock) {
  const url = new URL(`${SEPOLIA_BLOCKSCOUT_URL}/addresses/${account}/token-transfers`);
  url.searchParams.set('type', 'ERC-20');
  url.searchParams.set('token', token);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Blockscout token transfers failed (${response.status})`);
  const payload = await response.json();
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
) {
  try {
    const indexedTimestamp = await latestIndexedBalanceChangeTimestampMilliseconds(
      token,
      account,
      fromBlock,
    );
    if (indexedTimestamp !== null) return indexedTimestamp;
  } catch {
    // Fall through to RPC logs when the explorer index is unavailable or behind.
  }
  try {
    let toBlock = await client.getBlockNumber();
    while (toBlock >= fromBlock) {
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
    return fallbackTimestampMilliseconds;
  }
}

/// Read logs across an arbitrary span in provider-safe chunks. An unchunked span
/// is rejected outright by capped endpoints, which would otherwise be swallowed
/// and reported as "no claims filed".
export async function fetchLogsInChunks(client, request, fromBlock, toBlock) {
  const ranges = [];
  for (let start = fromBlock; start <= toBlock; start += LOG_QUERY_BLOCK_RANGE) {
    const end = start + LOG_QUERY_BLOCK_RANGE - 1n;
    ranges.push({ fromBlock: start, toBlock: end > toBlock ? toBlock : end });
  }
  const pages = await Promise.all(ranges.map((range) => client.getLogs({ ...request, ...range })));
  return pages.flat();
}

const poolAbi = [
  ...erc20Abi,
  {
    type: 'function',
    name: 'asset',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'totalAssets',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'depositCap',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'convertToAssets',
    stateMutability: 'view',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'earned',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'rewardRate',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'periodFinish',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'exitRequests',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'shares', type: 'uint256' }, { name: 'exitEpoch', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'exitEpochs',
    stateMutability: 'view',
    inputs: [{ name: 'exitEpoch', type: 'uint64' }],
    outputs: [
      { name: 'totalShares', type: 'uint256' },
      { name: 'totalAssets', type: 'uint256' },
      { name: 'remainingShares', type: 'uint256' },
      { name: 'remainingAssets', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'Deposit',
    inputs: [
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'assets', type: 'uint256' },
      { indexed: false, name: 'shares', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ExitEpochSettled',
    inputs: [
      { indexed: true, name: 'exitEpoch', type: 'uint64' },
      { indexed: false, name: 'shares', type: 'uint256' },
      { indexed: false, name: 'assets', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ClaimPaid',
    inputs: [
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'RewardNotified',
    inputs: [
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'newRate', type: 'uint128' },
      { indexed: false, name: 'newPeriodFinish', type: 'uint64' },
    ],
  },
];

const defiInsuranceAbi = [
  {
    type: 'function',
    name: 'MAX_CLAIMANT_COVERAGE_BPS',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getInsuredToken',
    stateMutability: 'view',
    inputs: [{ name: 'insuredToken', type: 'address' }],
    outputs: [{
      name: 'config',
      type: 'tuple',
      components: [
        { name: 'maxCoverageBps', type: 'uint16' },
        { name: 'underlyingPriceOracle', type: 'address' },
        { name: 'underlyingConversionAddress', type: 'address' },
        { name: 'underlyingConversionCallData', type: 'bytes' },
      ],
    }],
  },
  {
    type: 'function',
    name: 'activeIncidentId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'nextIncidentId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'incidents',
    stateMutability: 'view',
    inputs: [{ name: 'incidentId', type: 'uint256' }],
    outputs: [
      { name: 'insuredToken', type: 'address' },
      { name: 'resolvedAt', type: 'uint64' },
      { name: 'referenceBlock', type: 'uint64' },
      { name: 'openBlock', type: 'uint64' },
      { name: 'phaseDeadline', type: 'uint64' },
      { name: 'root', type: 'bytes32' },
      { name: 'unresolvedClaims', type: 'uint256' },
      { name: 'claimSetHash', type: 'bytes32' },
      { name: 'teePcrHash', type: 'bytes32' },
    ],
  },
  {
    type: 'function',
    name: 'incidentPhaseWindow',
    stateMutability: 'view',
    inputs: [{ name: 'incidentId', type: 'uint256' }],
    outputs: [{ name: 'phaseWindow', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'incidentPools',
    stateMutability: 'view',
    inputs: [{ name: 'incidentId', type: 'uint256' }],
    outputs: [{ name: 'pools', type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'claimIdByIncidentAndUser',
    stateMutability: 'view',
    inputs: [{ name: 'incidentId', type: 'uint256' }, { name: 'account', type: 'address' }],
    outputs: [{ name: 'claimId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'claims',
    stateMutability: 'view',
    inputs: [{ name: 'claimId', type: 'uint256' }],
    outputs: [
      { name: 'user', type: 'address' },
      { name: 'incidentId', type: 'uint64' },
      { name: 'insuredTokenAmount', type: 'uint128' },
      { name: 'boosterAmount', type: 'uint128' },
      { name: 'bondAmount', type: 'uint128' },
      { name: 'resolved', type: 'bool' },
    ],
  },
  {
    type: 'event',
    name: 'ClaimRegistered',
    inputs: [
      { indexed: true, name: 'claimId', type: 'uint256' },
      { indexed: true, name: 'incidentId', type: 'uint256' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'insuredTokenAmount', type: 'uint128' },
      { indexed: false, name: 'scoreToSpend', type: 'uint256' },
      { indexed: false, name: 'boosterAmount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ClaimCancelled',
    inputs: [
      { indexed: true, name: 'claimId', type: 'uint256' },
      { indexed: true, name: 'user', type: 'address' },
    ],
  },
];
const claimRegisteredEvent = defiInsuranceAbi.find((item) => item.type === 'event' && item.name === 'ClaimRegistered');
const claimCancelledEvent = defiInsuranceAbi.find((item) => item.type === 'event' && item.name === 'ClaimCancelled');

const priceOracleAbi = [
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'latestRoundData',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' },
    ],
  },
];

function formatted(value, decimals = 18, maximumFractionDigits = 4) {
  const decimal = Number(formatUnits(value, decimals));
  if (!Number.isFinite(decimal)) return '0';
  return decimal.toLocaleString('en-US', { maximumFractionDigits, useGrouping: false });
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

async function fetchTrailingRewardApr(poolAddress, price, priceDecimals) {
  const cacheKey = `${poolAddress}:${price}:${priceDecimals}`;
  const cached = trailingAprCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 60_000) return cached.value;

  let nextUrl = `${SEPOLIA_BLOCKSCOUT_URL}/addresses/${poolAddress}/logs`;
  const logs = [];
  while (nextUrl) {
    const response = await fetch(nextUrl);
    if (!response.ok) throw new Error(`Cover pool history unavailable (${response.status})`);
    const page = await response.json();
    logs.push(...page.items);
    if (!page.next_page_params) {
      nextUrl = '';
    } else {
      const url = new URL(`${SEPOLIA_BLOCKSCOUT_URL}/addresses/${poolAddress}/logs`);
      Object.entries(page.next_page_params).forEach(([key, value]) => url.searchParams.set(key, value));
      nextUrl = url.toString();
    }
  }

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
  trailingAprCache.set(cacheKey, { timestamp: Date.now(), value });
  return value;
}

/// Resolves the full snapshot, but invokes `onPartial` with balances and pool
/// figures as soon as they are known — before the Blockscout APR walk and the
/// incident reads, which are far slower and not needed to render the wallet.
export async function fetchLandingChainData(account, chainId, { signal, onPartial } = {}) {
  const network = getProtocolNetwork(chainId);
  if (!network) throw protocolUnavailableError(chainId);
  throwIfRequestAborted(signal);
  const { contracts } = network;
  const client = publicClientFor(chainId);
  const zero = 0n;
  const insuredTokenEntries = Object.entries(contracts.insuredTokens);
  const coverPools = contracts.coverPools;
  const FIXED_READS = 11;
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

  const [
    landingValues,
    boosterBalance,
  ] = await Promise.all([
    client.multicall({
      contracts: [...landingCalls, ...insuranceCalls],
      allowFailure: false,
    }),
    fetchBoosterBalance(client, contracts.registry, account),
  ]);
  throwIfRequestAborted(signal);
  const [usdc, usd8, savings, activeIncidentId, sGho, sUsds, msloss,
    usd8ScoreRates, savingsScoreRates, boosterPolicy, nextIncidentId] = landingValues.slice(0, FIXED_READS);
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
  const claimantCoverageCapBps = insuranceCoverageCap(rawClaimantCoverageCapBps);
  const insuranceTokens = Object.fromEntries(insuredTokenEntries.map(
    ([tokenId, insuredToken], index) => [
      tokenId,
      insuranceTokenState(tokenId, insuredToken, insuranceValues[index], claimantCoverageCapBps),
    ],
  ));
  const scoreBalancesSnapshotTimestampMilliseconds = Date.now();
  const [usd8BalanceChangeTimestamp, savingsBalanceChangeTimestamp] = await Promise.all([
    usd8 === zero
      ? 0
      : latestBalanceChangeTimestampMilliseconds(
        client,
        contracts.usd8,
        account,
        usd8ScoreRates[0]?.fromBlock ?? 0n,
        scoreBalancesSnapshotTimestampMilliseconds,
      ),
    savings === zero
      ? 0
      : latestBalanceChangeTimestampMilliseconds(
        client,
        contracts.savingsVault,
        account,
        savingsScoreRates[0]?.fromBlock ?? 0n,
        scoreBalancesSnapshotTimestampMilliseconds,
      ),
  ]);
  throwIfRequestAborted(signal);

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
    ]),
  ];
  const derived = derivedCalls.some(Boolean)
    ? await client.multicall({ contracts: derivedCalls.filter(Boolean), allowFailure: false })
    : [];
  let derivedIndex = 0;
  const savingsAssets = savings === zero ? zero : derived[derivedIndex++];

  const pools = poolReads.map((read) => {
    const depositedAssets = read.shares === zero ? zero : derived[derivedIndex++];
    const [, , remainingExitShares] = read.pendingExitShares === zero
      ? [zero, zero, zero, zero]
      : derived[derivedIndex++];
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
      availableForCooldown: formatted(read.shares, shareDecimals),
      availableForWithdraw: formatted(exitAvailable ? read.pendingExitShares : zero, shareDecimals),
      inCooldown: formatted(exitAvailable ? zero : read.pendingExitShares, shareDecimals),
      cooldownEndsAtMilliseconds: read.pendingExitShares > zero ? Number(read.exitEpoch) * 1_000 : 0,
      earnings: formatted(read.earned),
      earningsExact: formatUnits(read.earned, 18),
      earningsPerSecond: formatUnits(earningsPerSecond, 18),
      earningsSnapshotTimestampMilliseconds: Date.now(),
      earningsPeriodFinishMilliseconds: Number(read.periodFinish) * 1_000,
      hasEarnings: read.earned > zero,
      shareDecimals,
    };
  });

  const snapshot = ({ pools: poolExtras, ...extra } = {}) => ({
    activeIncidentId: activeIncidentId.toString(),
    incident: null,
    claim: null,
    insurance: { tokens: insuranceTokens },
    scoreBalances: { usd8: usd8.toString(), savings: savings.toString() },
    scoreRatesPerSecond: {
      usd8: formatUnits(currentScorePerSecond(usd8, usd8ScoreRates), 18),
      savings: formatUnits(currentScorePerSecond(savings, savingsScoreRates), 18),
    },
    scoreBalanceChangeTimestampMilliseconds: {
      usd8: usd8BalanceChangeTimestamp,
      savings: savingsBalanceChangeTimestamp,
    },
    scoreBalancesSnapshotTimestampMilliseconds,
    balances: {
      usdc: formatted(usdc, 6),
      usd8: formatted(usd8),
      savings: formatted(savings),
      savingsAssets: formatted(savingsAssets),
      coverAsset: pools[0]?.assetBalance ?? '0',
      poolShares: pools[0]?.availableForCooldown ?? '0',
      boosters: boosterBalance.toString(),
      insuredTokens: {
        'aave-sgho': formatted(sGho),
        'sky-susds': formatted(sUsds),
        'test-msloss': formatted(msloss),
      },
    },
    pools: pools.map((pool, index) => ({ ...pool, ...poolExtras?.[index] })),
    ...extra,
  });
  onPartial?.(snapshot());

  // The APR walk is slow and independent of the incident reads below, so it runs
  // alongside the head-block lookup those reads need.
  const [poolAprs, headBlock] = await Promise.all([
    Promise.all(poolReads.map((read) => fetchTrailingRewardApr(
      read.config.address, read.assetUsdPrice, read.assetUsdDecimals,
    ).catch(() => '—'))),
    client.getBlockNumber(),
  ]);
  throwIfRequestAborted(signal);

  let incident = null;
  let claim = null;
  let displayedIncidentId = activeIncidentId;
  let historicalClaimId = zero;
  let historicalClaimState = null;
  if (displayedIncidentId === zero) {
    const historicalIncidentIds = Array.from(
      { length: Math.max(0, Number(nextIncidentId - 1n)) },
      (_, index) => BigInt(index + 1),
    );
    if (historicalIncidentIds.length > 0) {
      const historicalClaimIds = await client.multicall({
        contracts: historicalIncidentIds.map((incidentId) => ({
          address: contracts.defiInsurance,
          abi: defiInsuranceAbi,
          functionName: 'claimIdByIncidentAndUser',
          args: [incidentId, account],
        })),
        allowFailure: false,
      });
      const candidates = historicalIncidentIds
        .map((incidentId, index) => ({ incidentId, claimId: historicalClaimIds[index] }))
        .filter(({ claimId }) => claimId !== zero)
        .reverse();
      if (candidates.length > 0) {
        const candidateStates = await client.multicall({
          contracts: candidates.map(({ claimId }) => ({
            address: contracts.defiInsurance,
            abi: defiInsuranceAbi,
            functionName: 'claims',
            args: [claimId],
          })),
          allowFailure: false,
        });
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
    const [incidentState, phaseWindow, mappedClaimId, rawIncidentPools] = await client.multicall({
      contracts: [
        { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'incidents', args: [displayedIncidentId] },
        { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'incidentPhaseWindow', args: [displayedIncidentId] },
        { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'claimIdByIncidentAndUser', args: [displayedIncidentId, account] },
        { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'incidentPools', args: [displayedIncidentId] },
      ],
      allowFailure: false,
    });
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
      allowFailure: false,
    })).map((asset) => String(asset).toLowerCase());
    throwIfRequestAborted(signal);
    if (poolOrder.length !== poolAddrs.length || new Set(poolOrder).size !== poolOrder.length) {
      throw new Error('Invalid incident asset order.');
    }
    const [tokenAddress, , , openBlock, phaseDeadline, root, unresolvedClaims] = incidentState;
    const tokenId = Object.entries(contracts.insuredTokens)
      .find(([, address]) => address.toLowerCase() === tokenAddress.toLowerCase())?.[0] || '';
    const claimLogs = await fetchLogsInChunks(client, {
      address: contracts.defiInsurance,
      events: [claimRegisteredEvent, claimCancelledEvent],
    }, openBlock, headBlock).catch(() => []);
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
    const boosterBoostBps = boosterPolicy[2] ?? 0;
    const totalScoreCommitted = activeRegistrations.reduce(
      (total, log) => total + boostedScore(log.args.scoreToSpend, log.args.boosterAmount, boosterBoostBps),
      zero,
    );
    incident = {
      id: displayedIncidentId.toString(),
      tokenId,
      tokenAddress: tokenAddress.toLowerCase(),
      phaseDeadlineMilliseconds: Number(phaseDeadline) * 1_000,
      phaseWindowMilliseconds: Number(phaseWindow) * 1_000,
      root,
      unresolvedClaims: unresolvedClaims.toString(),
      totalScoreCommitted: formatUnits(totalScoreCommitted, 18),
      boosterBoostBps: Number(boosterBoostBps),
      poolAddrs,
      poolOrder,
    };

    if (claimId !== zero) {
      const claimState = historicalClaimState || (await client.multicall({
        contracts: [{ address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'claims', args: [claimId] }],
        allowFailure: false,
      }))[0];
      const [, claimIncidentId, insuredTokenAmount, boosterAmount, bondAmount, resolved] = claimState;
      const registration = activeRegistrations.find((log) => log.args.claimId === claimId);
      // Score committed lives only in the registration event. Without it the
      // amount is unknown — never zero — so fall back to the escrow the contract
      // still reports rather than inventing a share of nothing.
      const scoreToSpend = registration?.args?.scoreToSpend;
      claim = {
        id: claimId.toString(),
        incidentId: claimIncidentId.toString(),
        insuredTokenAmount: formatted(insuredTokenAmount),
        bondAmount: formatted(bondAmount),
        boosterAmount: boosterAmount.toString(),
        scoreToSpend: scoreToSpend === undefined ? UNKNOWN_VALUE : formatted(scoreToSpend),
        scoreCommitmentPercentage: scoreToSpend === undefined
          ? UNKNOWN_VALUE
          : claimPercentage(boostedScore(scoreToSpend, boosterAmount, boosterBoostBps), totalScoreCommitted),
        resolved,
      };
    }
  }

  throwIfRequestAborted(signal);

  return snapshot({ incident, claim, pools: poolAprs.map((apy) => ({ apy })) });
}
