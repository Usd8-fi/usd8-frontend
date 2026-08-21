import { createPublicClient, formatUnits, http } from 'viem';
import { getNetwork, getProtocolNetwork, SEPOLIA_CONTRACTS } from './networkConfig.js';

const clients = new Map();

function protocolUnavailableError(chainId) {
  const network = getNetwork(chainId);
  return new Error(network ? `USD8 is not deployed on ${network.name}` : 'USD8 is not deployed on the selected network');
}

export function publicClientFor(chainId) {
  const network = getProtocolNetwork(chainId);
  if (!network) throw protocolUnavailableError(chainId);

  let client = clients.get(network.id);
  if (!client) {
    client = createPublicClient({
      chain: network.chain,
      transport: http(network.rpcUrl, { timeout: 15_000 }),
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
];

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
];

const defiInsuranceAbi = [
  {
    type: 'function',
    name: 'activeIncidentId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

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

function formattedAnnualRewardRate(rewardRate, assetAmount, price, priceDecimals) {
  if (assetAmount === 0n || price <= 0n) return '—';
  const poolValue = (assetAmount * price) / (10n ** BigInt(priceDecimals));
  if (poolValue === 0n) return '—';
  const annualReward = rewardRate * 365n * 24n * 60n * 60n;
  const basisPoints = (annualReward * 10_000n + poolValue / 2n) / poolValue;
  const percent = Number(basisPoints) / 100;
  return `${percent.toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
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
  ];

  const [usdc, usd8, savings, coverAsset, poolShares, totalAssets, depositCap, earnings, shareDecimals, rewardRate, [, wstEthUsdPrice], wstEthUsdDecimals, activeIncidentId, totalSupply, escrowedShares, periodFinish, [pendingExitShares, exitEpoch], sGho, sUsds, msloss] = await client.multicall({
    contracts: calls,
    allowFailure: false,
  });

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

  return {
    activeIncidentId: activeIncidentId.toString(),
    scoreBalances: {
      usd8: usd8.toString(),
      savings: savings.toString(),
    },
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
      apy: formattedAnnualRewardRate(rewardRate, totalAssets, wstEthUsdPrice, wstEthUsdDecimals),
      tvl: formattedUsd(totalAssets, wstEthUsdPrice, wstEthUsdDecimals),
      capacityPercent: Math.min(100, capacityPercent),
      capacityUncapped: depositCap === zero,
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
