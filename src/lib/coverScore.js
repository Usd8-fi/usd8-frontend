import { createPublicClient, formatUnits, getAddress, http, parseAbi, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';

const TRANSFER_EVENT = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');
const ERC20_BALANCE_ABI = parseAbi(['function balanceOf(address account) view returns (uint256)']);

const DEFAULT_RPC_URL = 'https://ethereum.publicnode.com';
const DEFAULT_CHUNK_BLOCKS = 1_000n;
const MIN_CHUNK_BLOCKS = 1n;
const DEFAULT_BLOCK_SECONDS = 12n;
const DEFAULT_LOOKBACK_DAYS = 365n;
const DEFAULT_LOOKBACK_BLOCKS = (DEFAULT_LOOKBACK_DAYS * 24n * 60n * 60n) / DEFAULT_BLOCK_SECONDS;
const USDC_DEPLOYMENT_BLOCK = 6_082_465n;
const USDT_DEPLOYMENT_BLOCK = 4_634_748n;
const DEFAULT_USD8_DEPLOY_BLOCK = USDC_DEPLOYMENT_BLOCK;
const DEFAULT_SUSD8_DEPLOY_BLOCK = USDT_DEPLOYMENT_BLOCK;
const USD8_SCORE_PER_TOKEN_PER_BLOCK = 10;
const SUSD8_SCORE_PER_TOKEN_PER_BLOCK = 1;

const USDC_TOKEN = {
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  symbol: 'USDC',
  decimals: 6,
  weight: 1,
};

const USDT_TOKEN = {
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  symbol: 'USDT',
  decimals: 6,
  weight: 1,
};

const SCORE_ASSETS = {
  usd8: {
    token: USDC_TOKEN,
    deployBlockEnv: 'VITE_USD8_DEPLOY_BLOCK',
    defaultDeployBlock: DEFAULT_USD8_DEPLOY_BLOCK,
    scorePerTokenPerBlock: USD8_SCORE_PER_TOKEN_PER_BLOCK,
  },
  sUsd8: {
    token: USDT_TOKEN,
    deployBlockEnv: 'VITE_SUSD8_DEPLOY_BLOCK',
    defaultDeployBlock: DEFAULT_SUSD8_DEPLOY_BLOCK,
    scorePerTokenPerBlock: SUSD8_SCORE_PER_TOKEN_PER_BLOCK,
  },
};

function readEnv(name) {
  return import.meta.env?.[name];
}

function parseBlockValue(value) {
  if (value === undefined || value === null || value === '') return null;
  try {
    const parsed = BigInt(value);
    return parsed >= 0n ? parsed : null;
  } catch {
    return null;
  }
}

function getErrorText(error) {
  const parts = [];
  let current = error;
  let depth = 0;

  while (current && depth < 5) {
    parts.push(current.shortMessage, current.message, current.details, current.name, current.code?.toString());
    current = current.cause;
    depth += 1;
  }

  return parts.filter(Boolean).join(' ').toLowerCase();
}

function isProviderRangeLimitError(error) {
  const text = getErrorText(error);

  return [
    'request exceeds defined limit',
    'defined limit',
    'block range',
    'range limit',
    'query returned more',
    'response size',
    'more than',
  ].some((pattern) => text.includes(pattern));
}

function isProviderLimitError(error) {
  const text = getErrorText(error);

  return isProviderRangeLimitError(error) || [
    'rate limit',
    'too many requests',
    '429',
    'limit exceeded',
  ].some((pattern) => text.includes(pattern));
}

function normalizeCoverScoreError(error) {
  if (!isProviderLimitError(error)) return error;

  const providerError = new Error(
    'Ethereum RPC rejected the history request because it exceeds the provider query limits. Use a dedicated RPC URL or a shorter history window.',
  );
  providerError.name = 'CoverScoreProviderLimitError';
  providerError.cause = error;
  providerError.userMessage = providerError.message;

  return providerError;
}

function getPublicClient() {
  return createPublicClient({
    chain: mainnet,
    transport: http(readEnv('VITE_ETH_RPC_URL') || DEFAULT_RPC_URL, {
      retryCount: 1,
      timeout: 30_000,
    }),
  });
}

function clampStartBlock(startBlock, asofBlock) {
  return startBlock > asofBlock ? asofBlock : startBlock;
}

function getDeploymentBlock(asset) {
  return parseBlockValue(readEnv(asset.deployBlockEnv)) ?? asset.defaultDeployBlock;
}

function getChunkBlocks() {
  const configuredChunkBlocks = parseBlockValue(readEnv('VITE_COVER_SCORE_CHUNK_BLOCKS'));

  if (configuredChunkBlocks !== null && configuredChunkBlocks >= MIN_CHUNK_BLOCKS) return configuredChunkBlocks;
  return DEFAULT_CHUNK_BLOCKS;
}

function getLookbackBlocks() {
  return parseBlockValue(readEnv('VITE_COVER_SCORE_LOOKBACK_BLOCKS')) ?? DEFAULT_LOOKBACK_BLOCKS;
}

function getFromBlock(asofBlock, deploymentBlock) {
  const configuredFromBlock = parseBlockValue(readEnv('VITE_COVER_SCORE_FROM_BLOCK'));
  if (configuredFromBlock !== null) {
    return clampStartBlock(configuredFromBlock > deploymentBlock ? configuredFromBlock : deploymentBlock, asofBlock);
  }

  const lookbackBlocks = getLookbackBlocks();
  const lookbackStart = asofBlock > lookbackBlocks ? asofBlock - lookbackBlocks : 0n;
  return clampStartBlock(lookbackStart > deploymentBlock ? lookbackStart : deploymentBlock, asofBlock);
}

function formatDashboardNumber(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value) || value <= 0) return '0';

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    useGrouping: false,
  }).format(value);
}

function integrateRawTokenBlocks(segments) {
  return segments.reduce((total, segment) => {
    const durationBlocks = segment.endBlock > segment.startBlock ? segment.endBlock - segment.startBlock : 0n;
    return total + segment.balance * durationBlocks;
  }, 0n);
}

function normalizeTokenBlockIntegral(rawIntegral, decimals) {
  const scale = 10n ** BigInt(decimals);
  const wholeTokenBlocks = rawIntegral / scale;
  const remainder = rawIntegral % scale;
  return Number(wholeTokenBlocks) + Number(remainder) / Number(scale);
}

async function fetchBalanceAt(client, token, holder, blockNumber) {
  try {
    return await client.readContract({
      address: token,
      abi: ERC20_BALANCE_ABI,
      functionName: 'balanceOf',
      args: [holder],
      blockNumber,
    });
  } catch {
    return 0n;
  }
}

async function fetchLogsInRange(client, request, fromBlock, toBlock) {
  try {
    return await client.getLogs({ ...request, fromBlock, toBlock });
  } catch (error) {
    if (!isProviderRangeLimitError(error) || fromBlock >= toBlock) throw error;

    const midpoint = fromBlock + ((toBlock - fromBlock) / 2n);
    const first = await fetchLogsInRange(client, request, fromBlock, midpoint);
    const second = await fetchLogsInRange(client, request, midpoint + 1n, toBlock);

    return [...first, ...second];
  }
}

async function fetchTransfers(client, token, holder, asofBlock, fromBlock, chunkBlocks) {
  const logs = [];

  for (let cursor = fromBlock; cursor <= asofBlock; cursor += chunkBlocks) {
    const toBlock = cursor + chunkBlocks - 1n > asofBlock ? asofBlock : cursor + chunkBlocks - 1n;
    const outgoing = await fetchLogsInRange(
      client,
      { address: token, event: TRANSFER_EVENT, args: { from: holder } },
      cursor,
      toBlock,
    );
    const incoming = await fetchLogsInRange(
      client,
      { address: token, event: TRANSFER_EVENT, args: { to: holder } },
      cursor,
      toBlock,
    );

    logs.push(...outgoing, ...incoming);
  }

  const blockNumbers = Array.from(new Set(logs.map((log) => log.blockNumber).filter(Boolean)));
  const blocks = await Promise.all(blockNumbers.map((blockNumber) => client.getBlock({ blockNumber })));
  const timestampByBlock = new Map(blocks.map((block) => [block.number, block.timestamp]));

  return logs
    .map((log) => ({
      blockNumber: log.blockNumber,
      blockTimestamp: timestampByBlock.get(log.blockNumber),
      from: log.args.from,
      to: log.args.to,
      value: log.args.value,
      logIndex: log.logIndex ?? 0,
    }))
    .filter((log) => log.blockNumber !== null && log.blockTimestamp !== undefined && log.from && log.to && log.value !== undefined)
    .sort((a, b) => {
      if (a.blockNumber === b.blockNumber) return a.logIndex - b.logIndex;
      return a.blockNumber < b.blockNumber ? -1 : 1;
    });
}

function buildSegments(token, holder, transfers, asofBlock, asofTimestamp, initialBalance = 0n, fromBlock = 0n, fromBlockTimestamp = 0n) {
  const segments = [];
  let balance = initialBalance;

  if (initialBalance > 0n) {
    const endTimestamp = transfers[0]?.blockTimestamp ?? asofTimestamp;
    if (endTimestamp > fromBlockTimestamp) {
      segments.push({
        token: token.address,
        balance: initialBalance,
        startBlock: fromBlock,
        startTimestamp: fromBlockTimestamp,
        endBlock: transfers[0]?.blockNumber ?? asofBlock,
        endTimestamp,
      });
    }
  }

  for (let index = 0; index < transfers.length; index += 1) {
    const transfer = transfers[index];
    if (getAddress(transfer.from) === holder) balance -= transfer.value;
    if (getAddress(transfer.to) === holder) balance += transfer.value;

    if (balance < 0n) {
      throw new Error(`negative ${token.symbol} balance at block ${transfer.blockNumber}`);
    }

    const next = transfers[index + 1];
    const endTimestamp = next?.blockTimestamp ?? asofTimestamp;
    if (balance > 0n && endTimestamp > transfer.blockTimestamp) {
      segments.push({
        token: token.address,
        balance,
        startBlock: transfer.blockNumber,
        startTimestamp: transfer.blockTimestamp,
        endBlock: next?.blockNumber ?? asofBlock,
        endTimestamp,
      });
    }
  }

  return segments;
}

async function computeStandInScore(holderAddress, asset, client, asofBlock) {
  const holder = getAddress(holderAddress);
  const tokenAddress = getAddress(asset.token.address);
  const deploymentBlock = getDeploymentBlock(asset);
  const fromBlock = getFromBlock(asofBlock, deploymentBlock);
  const chunkBlocks = getChunkBlocks();
  const asofBlockData = await client.getBlock({ blockNumber: asofBlock });

  const fromBlockTimestamp = fromBlock === 0n ? 0n : (await client.getBlock({ blockNumber: fromBlock })).timestamp;
  const [transfers, initialBalance, currentBalance] = await Promise.all([
    fetchTransfers(client, tokenAddress, holder, asofBlock, fromBlock, chunkBlocks),
    fromBlock > 0n ? fetchBalanceAt(client, tokenAddress, holder, fromBlock) : Promise.resolve(0n),
    fetchBalanceAt(client, tokenAddress, holder, asofBlock),
  ]);

  const segments = buildSegments(
    asset.token,
    holder,
    transfers,
    asofBlock,
    asofBlockData.timestamp,
    initialBalance,
    fromBlock,
    fromBlockTimestamp,
  );
  const rawTokenBlockIntegral = integrateRawTokenBlocks(segments);
  const tokenBlockWeight = normalizeTokenBlockIntegral(rawTokenBlockIntegral, asset.token.decimals) * asset.token.weight;
  const balance = Number(formatUnits(currentBalance, asset.token.decimals));

  return {
    balance,
    tokenBlockWeight,
    asofBlock,
    fromBlock,
    deploymentBlock,
    token: asset.token,
  };
}

export async function computeDashboardCoverStats(holderAddress) {
  try {
    const client = getPublicClient();
    const asofBlock = await client.getBlockNumber();
    const [usd8Score, sUsd8Score] = await Promise.all([
      computeStandInScore(holderAddress, SCORE_ASSETS.usd8, client, asofBlock),
      computeStandInScore(holderAddress, SCORE_ASSETS.sUsd8, client, asofBlock),
    ]);
    const usd8HistoryScore = usd8Score.tokenBlockWeight * SCORE_ASSETS.usd8.scorePerTokenPerBlock;
    const sUsd8HistoryScore = sUsd8Score.tokenBlockWeight * SCORE_ASSETS.sUsd8.scorePerTokenPerBlock;

    return {
      values: {
        usd8Balance: formatDashboardNumber(usd8Score.balance, 2),
        usd8Rate: formatDashboardNumber(SCORE_ASSETS.usd8.scorePerTokenPerBlock, 0),
        usd8HistoryEarned: formatDashboardNumber(usd8HistoryScore, 0),
        usd8Insurance: '80%',
        sUsd8Balance: formatDashboardNumber(sUsd8Score.balance, 2),
        sUsd8Rate: formatDashboardNumber(SCORE_ASSETS.sUsd8.scorePerTokenPerBlock, 0),
        sUsd8HistoryEarned: formatDashboardNumber(sUsd8HistoryScore, 0),
        sUsd8Insurance: '80%',
      },
      meta: {
        usd8: usd8Score,
        sUsd8: sUsd8Score,
        rates: {
          usd8: SCORE_ASSETS.usd8.scorePerTokenPerBlock,
          sUsd8: SCORE_ASSETS.sUsd8.scorePerTokenPerBlock,
        },
        deploymentBlocks: {
          usd8: usd8Score.deploymentBlock,
          sUsd8: sUsd8Score.deploymentBlock,
        },
        fromBlocks: {
          usd8: usd8Score.fromBlock,
          sUsd8: sUsd8Score.fromBlock,
        },
      },
    };
  } catch (error) {
    throw normalizeCoverScoreError(error);
  }
}
