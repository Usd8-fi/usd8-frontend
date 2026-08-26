import { createPublicClient, fallback, formatUnits, http } from 'viem';
import { getNetwork, getProtocolNetwork, SEPOLIA_CONTRACTS } from './networkConfig.js';

const clients = new Map();
const TRAILING_WINDOW_SECONDS = 30 * 24 * 60 * 60;
const SEPOLIA_BLOCKSCOUT_URL = 'https://eth-sepolia.blockscout.com/api/v2';
const trailingAprCache = new Map();
const SCORE_SCALE = 10n ** 18n;
const SEPOLIA_BLOCK_SECONDS = 12n;

function protocolUnavailableError(chainId) {
  const network = getNetwork(chainId);
  return new Error(network ? `USD8 is not deployed on ${network.name}` : 'USD8 is not deployed on the selected network');
}

export function rpcTransportFor(rpcUrls) {
  const transports = rpcUrls.map((rpcUrl) => http(rpcUrl, { timeout: 15_000 }));
  return transports.length === 1 ? transports[0] : fallback(transports);
}

export function publicClientFor(chainId) {
  const network = getProtocolNetwork(chainId);
  if (!network) throw protocolUnavailableError(chainId);

  let client = clients.get(network.id);
  if (!client) {
    client = createPublicClient({
      chain: network.chain,
      transport: rpcTransportFor(network.rpcUrls),
    });
    clients.set(network.id, client);
  }
  return client;
}

// Compatibility export for callers that explicitly operate on the canonical Sepolia deployment.
export const publicClient = publicClientFor(11155111);
export { SEPOLIA_CONTRACTS };

export const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
  },
];

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

function currentScorePerSecond(balance, rateHistory) {
  const rate = rateHistory.at(-1)?.rate ?? 0n;
  return balance * rate / SCORE_SCALE / SEPOLIA_BLOCK_SECONDS;
}

async function latestBalanceChangeTimestampMilliseconds(
  client,
  token,
  account,
  fromBlock,
  fallbackTimestampMilliseconds,
) {
  try {
    const [sent, received] = await Promise.all([
      client.getLogs({
        address: token,
        event: erc20TransferEvent,
        args: { from: account },
        fromBlock,
        toBlock: 'latest',
      }),
      client.getLogs({
        address: token,
        event: erc20TransferEvent,
        args: { to: account },
        fromBlock,
        toBlock: 'latest',
      }),
    ]);
    const latest = [...sent, ...received]
      .filter((log) => typeof log.blockNumber === 'bigint')
      .sort((left, right) => (
        left.blockNumber === right.blockNumber
          ? Number(right.logIndex ?? 0) - Number(left.logIndex ?? 0)
          : left.blockNumber > right.blockNumber ? -1 : 1
      ))[0];
    if (!latest) return fallbackTimestampMilliseconds;
    const block = await client.getBlock({ blockNumber: latest.blockNumber });
    return Number(block.timestamp) * 1_000;
  } catch {
    return fallbackTimestampMilliseconds;
  }
}

export const poolAbi = [
  ...erc20Abi,
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
    name: 'activeIncidentId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
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
  return decimal.toLocaleString('en-US', { maximumFractionDigits });
}

function claimPercentage(amount, total) {
  if (total === 0n) return '0%';
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
  })}%`;
}

async function fetchTrailingRewardApr(contracts, price, priceDecimals) {
  const cacheKey = `${contracts.coverPool}:${price}:${priceDecimals}`;
  const cached = trailingAprCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 60_000) return cached.value;

  let nextUrl = `${SEPOLIA_BLOCKSCOUT_URL}/addresses/${contracts.coverPool}/logs`;
  const logs = [];
  while (nextUrl) {
    const response = await fetch(nextUrl);
    if (!response.ok) throw new Error(`Cover pool history unavailable (${response.status})`);
    const page = await response.json();
    logs.push(...page.items);
    if (!page.next_page_params) {
      nextUrl = '';
    } else {
      const url = new URL(`${SEPOLIA_BLOCKSCOUT_URL}/addresses/${contracts.coverPool}/logs`);
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

export async function fetchLandingChainData(account, chainId) {
  const network = getProtocolNetwork(chainId);
  if (!network) throw protocolUnavailableError(chainId);
  const { contracts } = network;
  const client = publicClientFor(chainId);
  const zero = 0n;
  const calls = [
    { address: contracts.usdc, abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.usd8, abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.savingsVault, abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.coverAsset, abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.coverPool, abi: poolAbi, functionName: 'balanceOf', args: [account] },
    { address: contracts.coverPool, abi: poolAbi, functionName: 'totalAssets' },
    { address: contracts.coverPool, abi: poolAbi, functionName: 'depositCap' },
    { address: contracts.coverPool, abi: poolAbi, functionName: 'earned', args: [account] },
    { address: contracts.coverPool, abi: poolAbi, functionName: 'decimals' },
    { address: contracts.coverPool, abi: poolAbi, functionName: 'rewardRate' },
    { address: contracts.coverAssetUsdOracle, abi: priceOracleAbi, functionName: 'latestRoundData' },
    { address: contracts.coverAssetUsdOracle, abi: priceOracleAbi, functionName: 'decimals' },
    { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'activeIncidentId' },
    { address: contracts.coverPool, abi: poolAbi, functionName: 'totalSupply' },
    { address: contracts.coverPool, abi: poolAbi, functionName: 'balanceOf', args: [contracts.coverPool] },
    { address: contracts.coverPool, abi: poolAbi, functionName: 'periodFinish' },
    { address: contracts.coverPool, abi: poolAbi, functionName: 'exitRequests', args: [account] },
    { address: contracts.insuredTokens['aave-sgho'], abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.insuredTokens['sky-susds'], abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.insuredTokens['test-msloss'], abi: erc20Abi, functionName: 'balanceOf', args: [account] },
    { address: contracts.registry, abi: registryScoreAbi, functionName: 'getScoredRateHistory', args: [contracts.usd8] },
    { address: contracts.registry, abi: registryScoreAbi, functionName: 'getScoredRateHistory', args: [contracts.savingsVault] },
  ];

  const [usdc, usd8, savings, coverAsset, poolShares, totalAssets, depositCap, earnings, shareDecimals, rewardRate, [, wstEthUsdPrice], wstEthUsdDecimals, activeIncidentId, totalSupply, escrowedShares, periodFinish, [pendingExitShares, exitEpoch], sGho, sUsds, msloss, usd8ScoreRates, savingsScoreRates] = await client.multicall({
    contracts: calls,
    allowFailure: false,
  });
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

  const savingsAssets = savings === zero
    ? zero
    : await client.readContract({
      address: contracts.savingsVault,
      abi: poolAbi,
      functionName: 'convertToAssets',
      args: [savings],
    });
  const depositedAssets = poolShares === zero
    ? zero
    : await client.readContract({
      address: contracts.coverPool,
      abi: poolAbi,
      functionName: 'convertToAssets',
      args: [poolShares],
    });
  const [, , remainingExitShares] = pendingExitShares === zero
    ? [zero, zero, zero, zero]
    : await client.readContract({
      address: contracts.coverPool,
      abi: poolAbi,
      functionName: 'exitEpochs',
      args: [exitEpoch],
    });
  const exitMatured = Date.now() >= Number(exitEpoch) * 1_000;
  const exitAvailable = pendingExitShares > zero
    && (remainingExitShares > zero || (exitMatured && activeIncidentId === zero));
  const capacityPercent = depositCap === zero
    ? 0
    : Number((totalAssets * 10_000n) / depositCap) / 100;
  const earningShares = totalSupply > escrowedShares ? totalSupply - escrowedShares : zero;
  const earningsPerSecond = earningShares === zero
    ? zero
    : (poolShares * rewardRate) / earningShares;
  const trailingRewardApr = await fetchTrailingRewardApr(
    contracts,
    wstEthUsdPrice,
    wstEthUsdDecimals,
  ).catch(() => '—');

  let incident = null;
  let claim = null;
  if (activeIncidentId !== zero) {
    const [incidentState, phaseWindow, claimId] = await client.multicall({
      contracts: [
        { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'incidents', args: [activeIncidentId] },
        { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'incidentPhaseWindow', args: [activeIncidentId] },
        { address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'claimIdByIncidentAndUser', args: [activeIncidentId, account] },
      ],
      allowFailure: false,
    });
    const [tokenAddress, , , openBlock, phaseDeadline, root, unresolvedClaims] = incidentState;
    const tokenId = Object.entries(contracts.insuredTokens)
      .find(([, address]) => address.toLowerCase() === tokenAddress.toLowerCase())?.[0] || '';
    const claimLogs = await client.getLogs({
      address: contracts.defiInsurance,
      events: [claimRegisteredEvent, claimCancelledEvent],
      fromBlock: openBlock,
      toBlock: 'latest',
    }).catch(() => []);
    const cancelledClaimIds = new Set(
      claimLogs
        .filter((log) => log.eventName === 'ClaimCancelled')
        .map((log) => log.args.claimId.toString()),
    );
    const activeRegistrations = claimLogs.filter((log) => (
      log.eventName === 'ClaimRegistered'
      && log.args.incidentId === activeIncidentId
      && !cancelledClaimIds.has(log.args.claimId.toString())
    ));
    const totalInsuredTokenClaims = activeRegistrations.reduce(
      (total, log) => total + log.args.insuredTokenAmount,
      zero,
    );
    const totalScoreCommitted = activeRegistrations.reduce(
      (total, log) => total + log.args.scoreToSpend,
      zero,
    );
    incident = {
      id: activeIncidentId.toString(),
      tokenId,
      tokenAddress: tokenAddress.toLowerCase(),
      phaseDeadlineMilliseconds: Number(phaseDeadline) * 1_000,
      phaseWindowMilliseconds: Number(phaseWindow) * 1_000,
      root,
      unresolvedClaims: unresolvedClaims.toString(),
      totalInsuredTokenClaims: formatUnits(totalInsuredTokenClaims, 18),
      totalScoreCommitted: formatUnits(totalScoreCommitted, 18),
    };

    if (claimId !== zero) {
      const [[, claimIncidentId, insuredTokenAmount, boosterAmount, bondAmount, resolved]] = await client.multicall({
        contracts: [{ address: contracts.defiInsurance, abi: defiInsuranceAbi, functionName: 'claims', args: [claimId] }],
        allowFailure: false,
      });
      const registration = activeRegistrations.find((log) => log.args.claimId === claimId);
      const scoreToSpend = registration?.args?.scoreToSpend || zero;
      claim = {
        id: claimId.toString(),
        incidentId: claimIncidentId.toString(),
        insuredTokenAmount: formatted(insuredTokenAmount),
        bondAmount: formatted(bondAmount),
        boosterAmount: boosterAmount.toString(),
        scoreToSpend: formatted(scoreToSpend),
        insuredTokenClaimPercentage: claimPercentage(insuredTokenAmount, totalInsuredTokenClaims),
        scoreCommitmentPercentage: claimPercentage(scoreToSpend, totalScoreCommitted),
        resolved,
      };
    }
  }

  return {
    activeIncidentId: activeIncidentId.toString(),
    incident,
    claim,
    scoreBalances: {
      usd8: usd8.toString(),
      savings: savings.toString(),
    },
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
      coverAsset: formatted(coverAsset),
      poolShares: formatted(poolShares, Number(shareDecimals)),
      insuredTokens: {
        'aave-sgho': formatted(sGho),
        'sky-susds': formatted(sUsds),
        'test-msloss': formatted(msloss),
      },
    },
    pool: {
      apy: trailingRewardApr,
      tvl: formattedUsd(totalAssets, wstEthUsdPrice, wstEthUsdDecimals),
      capacityPercent: Math.min(100, capacityPercent),
      capacityUncapped: depositCap === zero,
      remainingDepositCapacity: depositCap === zero
        ? ''
        : formatted(depositCap > totalAssets ? depositCap - totalAssets : zero),
      assets: formatted(totalAssets),
      deposit: formatted(depositedAssets),
      availableForCooldown: formatted(poolShares, Number(shareDecimals)),
      availableForWithdraw: formatted(exitAvailable ? pendingExitShares : zero, Number(shareDecimals)),
      inCooldown: formatted(exitAvailable ? zero : pendingExitShares, Number(shareDecimals)),
      cooldownEndsAtMilliseconds: pendingExitShares > zero ? Number(exitEpoch) * 1_000 : 0,
      earnings: formatted(earnings),
      earningsExact: formatUnits(earnings, 18),
      earningsPerSecond: formatUnits(earningsPerSecond, 18),
      earningsSnapshotTimestampMilliseconds: Date.now(),
      earningsPeriodFinishMilliseconds: Number(periodFinish) * 1_000,
      hasEarnings: earnings > zero,
      shareDecimals: Number(shareDecimals),
    },
  };
}
