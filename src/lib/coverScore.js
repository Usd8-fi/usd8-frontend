import { createPublicClient, formatUnits, getAddress, http, parseAbi, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';
import { protocolConfig } from '../config/protocolConfig.js';

const TRANSFER_EVENT = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');
const ERC20_BALANCE_ABI = parseAbi(['function balanceOf(address account) view returns (uint256)']);

const DEFAULT_RPC_URL = 'https://ethereum.publicnode.com';
const DEFAULT_CHUNK_BLOCKS = 1_000n;
const DEFAULT_SCORE_API_POLL_MS = 1_500;
const DEFAULT_SCORE_API_MAX_POLLS = 120;
const ETHEREUM_BLOCKS_PER_DAY = 7_200;

const USDC_TOKEN = {
  address: protocolConfig.usd8TokenAddress,
  symbol: 'USDC',
  decimals: protocolConfig.usd8TokenDecimals,
  weight: 1,
};

const USDT_TOKEN = {
  address: protocolConfig.sUsd8TokenAddress,
  symbol: 'USDT',
  decimals: protocolConfig.sUsd8TokenDecimals,
  weight: 1,
};

const SCORE_ASSETS = {
  usd8: {
    token: USDC_TOKEN,
    scorePerTokenPerBlock: protocolConfig.usd8HistoryScoreEarningRate,
  },
  sUsd8: {
    token: USDT_TOKEN,
    scorePerTokenPerBlock: protocolConfig.sUsd8HistoryScoreEarningRate,
  },
};

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getScoreApiUrl() {
  const url = protocolConfig.scoreApiUrl;
  return url ? String(url).replace(/\/+$/, '') : '';
}

async function computeDashboardCoverStatsFromApi(holderAddress, scoreApiUrl) {
  for (let attempt = 0; attempt < DEFAULT_SCORE_API_MAX_POLLS; attempt += 1) {
    const response = await fetch(`${scoreApiUrl}/score?address=${encodeURIComponent(holderAddress)}`, {
      headers: { accept: 'application/json' },
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(payload.error || `Score API request failed with status ${response.status}.`);
    if (payload.status === 'complete') {
      return {
        values: payload.values,
        meta: payload.meta,
      };
    }

    await sleep(DEFAULT_SCORE_API_POLL_MS);
  }

  throw new Error('Score sync is still running. Keep the dashboard open or try again in a few minutes.');
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
    transport: http(DEFAULT_RPC_URL, {
      retryCount: 1,
      timeout: 30_000,
    }),
  });
}

function clampStartBlock(startBlock, asofBlock) {
  return startBlock > asofBlock ? asofBlock : startBlock;
}

function getChunkBlocks() {
  return DEFAULT_CHUNK_BLOCKS;
}

function getFromBlock(asofBlock) {
  return clampStartBlock(protocolConfig.scoreStartBlock, asofBlock);
}

function getDailyScoreRate(asset) {
  return asset.scorePerTokenPerBlock * ETHEREUM_BLOCKS_PER_DAY;
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
  const fromBlock = getFromBlock(asofBlock);
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
    token: asset.token,
  };
}

async function computeDashboardCoverStatsFromRpc(holderAddress) {
  try {
    const client = getPublicClient();
    const asofBlock = await client.getBlockNumber();
    const [usd8Score, sUsd8Score] = await Promise.all([
      computeStandInScore(holderAddress, SCORE_ASSETS.usd8, client, asofBlock),
      computeStandInScore(holderAddress, SCORE_ASSETS.sUsd8, client, asofBlock),
    ]);
    const usd8HistoryScore = usd8Score.tokenBlockWeight * SCORE_ASSETS.usd8.scorePerTokenPerBlock;
    const sUsd8HistoryScore = sUsd8Score.tokenBlockWeight * SCORE_ASSETS.sUsd8.scorePerTokenPerBlock;
    const usd8DailyRate = getDailyScoreRate(SCORE_ASSETS.usd8);
    const sUsd8DailyRate = getDailyScoreRate(SCORE_ASSETS.sUsd8);

    return {
      values: {
        usd8Balance: formatDashboardNumber(usd8Score.balance, 2),
        usd8Rate: formatDashboardNumber(usd8DailyRate, 4),
        usd8HistoryEarned: formatDashboardNumber(usd8HistoryScore, 0),
        usd8Insurance: '80%',
        sUsd8Balance: formatDashboardNumber(sUsd8Score.balance, 2),
        sUsd8Rate: formatDashboardNumber(sUsd8DailyRate, 4),
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
        dailyRates: {
          usd8: usd8DailyRate,
          sUsd8: sUsd8DailyRate,
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

export async function computeDashboardCoverStats(holderAddress) {
  const scoreApiUrl = getScoreApiUrl();
  if (scoreApiUrl) return computeDashboardCoverStatsFromApi(holderAddress, scoreApiUrl);

  return computeDashboardCoverStatsFromRpc(holderAddress);
}
