import { createPublicClient, formatUnits, getAddress, http, parseAbi, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';

const TRANSFER_EVENT = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');
const ERC20_BALANCE_ABI = parseAbi(['function balanceOf(address account) view returns (uint256)']);

const DEFAULT_RPC_URL = 'https://ethereum.publicnode.com';
const DEFAULT_CHUNK_BLOCKS = 10_000n;
const DEFAULT_LOOKBACK_BLOCKS = 10_000n;
const DEFAULT_BLOCK_SECONDS = 12;

const USDC_TOKEN = {
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  symbol: 'USDC',
  decimals: 6,
  weight: 1,
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

function getPublicClient() {
  return createPublicClient({
    chain: mainnet,
    transport: http(readEnv('VITE_ETH_RPC_URL') || DEFAULT_RPC_URL, {
      retryCount: 1,
      timeout: 30_000,
    }),
  });
}

function getFromBlock(asofBlock) {
  const configuredFromBlock = parseBlockValue(readEnv('VITE_COVER_SCORE_FROM_BLOCK'));
  if (configuredFromBlock !== null) return configuredFromBlock > asofBlock ? asofBlock : configuredFromBlock;

  const lookbackBlocks = parseBlockValue(readEnv('VITE_COVER_SCORE_LOOKBACK_BLOCKS')) ?? DEFAULT_LOOKBACK_BLOCKS;
  return asofBlock > lookbackBlocks ? asofBlock - lookbackBlocks : 0n;
}

function formatDashboardNumber(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value) || value <= 0) return '0';

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    useGrouping: false,
  }).format(value);
}

function integrateRaw(segments) {
  return segments.reduce((total, segment) => total + segment.balance * segment.durationSeconds, 0n);
}

function normalizeIntegral(rawIntegral, decimals) {
  const scale = 10n ** BigInt(decimals);
  const wholeTokenSeconds = rawIntegral / scale;
  const remainder = rawIntegral % scale;
  return Number(wholeTokenSeconds) + Number(remainder) / Number(scale);
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

async function fetchTransfers(client, token, holder, asofBlock, fromBlock, chunkBlocks) {
  const logs = [];

  for (let cursor = fromBlock; cursor <= asofBlock; cursor += chunkBlocks + 1n) {
    const toBlock = cursor + chunkBlocks > asofBlock ? asofBlock : cursor + chunkBlocks;
    const [outgoing, incoming] = await Promise.all([
      client.getLogs({ address: token, event: TRANSFER_EVENT, args: { from: holder }, fromBlock: cursor, toBlock }),
      client.getLogs({ address: token, event: TRANSFER_EVENT, args: { to: holder }, fromBlock: cursor, toBlock }),
    ]);
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
        token,
        balance: initialBalance,
        startBlock: fromBlock,
        startTimestamp: fromBlockTimestamp,
        endBlock: transfers[0]?.blockNumber ?? asofBlock,
        endTimestamp,
        durationSeconds: endTimestamp - fromBlockTimestamp,
      });
    }
  }

  for (let index = 0; index < transfers.length; index += 1) {
    const transfer = transfers[index];
    if (getAddress(transfer.from) === holder) balance -= transfer.value;
    if (getAddress(transfer.to) === holder) balance += transfer.value;

    if (balance < 0n) {
      throw new Error(`negative ${USDC_TOKEN.symbol} balance at block ${transfer.blockNumber}`);
    }

    const next = transfers[index + 1];
    const endTimestamp = next?.blockTimestamp ?? asofTimestamp;
    if (balance > 0n && endTimestamp > transfer.blockTimestamp) {
      segments.push({
        token,
        balance,
        startBlock: transfer.blockNumber,
        startTimestamp: transfer.blockTimestamp,
        endBlock: next?.blockNumber ?? asofBlock,
        endTimestamp,
        durationSeconds: endTimestamp - transfer.blockTimestamp,
      });
    }
  }

  return segments;
}

async function computeUsdcStandInScore(holderAddress) {
  const holder = getAddress(holderAddress);
  const tokenAddress = getAddress(USDC_TOKEN.address);
  const client = getPublicClient();
  const asofBlock = await client.getBlockNumber();
  const fromBlock = getFromBlock(asofBlock);
  const chunkBlocks = parseBlockValue(readEnv('VITE_COVER_SCORE_CHUNK_BLOCKS')) ?? DEFAULT_CHUNK_BLOCKS;
  const [asofBlockData, previousBlockData] = await Promise.all([
    client.getBlock({ blockNumber: asofBlock }),
    asofBlock > 0n ? client.getBlock({ blockNumber: asofBlock - 1n }) : null,
  ]);

  const fromBlockTimestamp = fromBlock === 0n ? 0n : (await client.getBlock({ blockNumber: fromBlock })).timestamp;
  const [transfers, initialBalance, currentBalance] = await Promise.all([
    fetchTransfers(client, tokenAddress, holder, asofBlock, fromBlock, chunkBlocks),
    fromBlock > 0n ? fetchBalanceAt(client, tokenAddress, holder, fromBlock) : Promise.resolve(0n),
    fetchBalanceAt(client, tokenAddress, holder, asofBlock),
  ]);

  const segments = buildSegments(
    tokenAddress,
    holder,
    transfers,
    asofBlock,
    asofBlockData.timestamp,
    initialBalance,
    fromBlock,
    fromBlockTimestamp,
  );
  const rawIntegral = integrateRaw(segments);
  const rawWeight = normalizeIntegral(rawIntegral, USDC_TOKEN.decimals) * USDC_TOKEN.weight;
  const blockSeconds = previousBlockData ? Number(asofBlockData.timestamp - previousBlockData.timestamp) : DEFAULT_BLOCK_SECONDS;
  const ratePerTokenPerBlock = Math.max(blockSeconds || DEFAULT_BLOCK_SECONDS, 1) * USDC_TOKEN.weight;
  const balance = Number(formatUnits(currentBalance, USDC_TOKEN.decimals));

  return {
    balance,
    ratePerTokenPerBlock,
    rawWeight,
    asofBlock,
    fromBlock,
    token: USDC_TOKEN,
  };
}

export async function computeDashboardCoverStats(holderAddress) {
  const usdcScore = await computeUsdcStandInScore(holderAddress);
  const balance = formatDashboardNumber(usdcScore.balance, 2);
  const rate = formatDashboardNumber(usdcScore.ratePerTokenPerBlock, 0);
  const historyScore = formatDashboardNumber(usdcScore.rawWeight, 0);

  return {
    values: {
      usd8Balance: balance,
      usd8Rate: rate,
      usd8HistoryEarned: historyScore,
      usd8Insurance: '80%',
      sUsd8Balance: balance,
      sUsd8Rate: rate,
      sUsd8HistoryEarned: historyScore,
      sUsd8Insurance: '80%',
    },
    meta: usdcScore,
  };
}
