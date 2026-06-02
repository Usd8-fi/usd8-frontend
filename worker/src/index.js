import { protocolConfig } from '../../src/config/protocolConfig.js';

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const BALANCE_OF_SELECTOR = '0x70a08231';
const DEFAULT_RPC_URL = 'https://ethereum.publicnode.com';
const DEFAULT_CONFIRMATIONS = 12n;
const DEFAULT_CHUNK_BLOCKS = 50_000n;
const DEFAULT_MAX_RANGES_PER_ASSET = 4;
const ETHEREUM_BLOCKS_PER_DAY = 7_200;
const ALCHEMY_TRANSFER_MAX_COUNT = '0x3e8';

const ASSETS = {
  usd8: {
    token: {
      address: normalizeAddress(protocolConfig.usd8TokenAddress),
      symbol: 'USDC',
      decimals: protocolConfig.usd8TokenDecimals,
    },
    scorePerTokenPerBlock: protocolConfig.usd8HistoryScoreEarningRate,
  },
  sUsd8: {
    token: {
      address: normalizeAddress(protocolConfig.sUsd8TokenAddress),
      symbol: 'USDT',
      decimals: protocolConfig.sUsd8TokenDecimals,
    },
    scorePerTokenPerBlock: protocolConfig.sUsd8HistoryScoreEarningRate,
  },
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });

    try {
      const url = new URL(request.url);
      if (url.pathname === '/health') return jsonResponse(request, env, { ok: true });
      if (url.pathname !== '/score') return jsonResponse(request, env, { error: 'Not found' }, 404);

      const holder = normalizeAddress(url.searchParams.get('address'));
      if (!holder) return jsonResponse(request, env, { error: 'Invalid address' }, 400);

      return jsonResponse(request, env, await getScore(env, holder));
    } catch (error) {
      return jsonResponse(
        request,
        env,
        { error: error?.userMessage || error?.message || 'Score API failed.' },
        500,
      );
    }
  },
};

async function getScore(env, holder) {
  const latestBlock = await getBlockNumber(env);
  const confirmations = readBigInt(env.CONFIRMATIONS, DEFAULT_CONFIRMATIONS);
  const targetBlock = latestBlock > confirmations ? latestBlock - confirmations : latestBlock;
  const results = {};

  for (const [assetKey, asset] of Object.entries(ASSETS)) {
    results[assetKey] = await advanceAssetCheckpoint(env, holder, assetKey, asset, targetBlock);
  }

  const complete = Object.values(results).every((result) => result.complete);
  const usd8HistoryScore = results.usd8.tokenBlockWeight * ASSETS.usd8.scorePerTokenPerBlock;
  const sUsd8HistoryScore = results.sUsd8.tokenBlockWeight * ASSETS.sUsd8.scorePerTokenPerBlock;
  const usd8DailyRate = getDailyScoreRate(ASSETS.usd8);
  const sUsd8DailyRate = getDailyScoreRate(ASSETS.sUsd8);

  return {
    status: complete ? 'complete' : 'syncing',
    values: {
      usd8Balance: complete ? formatDashboardNumber(results.usd8.balance, 2) : '...',
      usd8Rate: formatDashboardNumber(usd8DailyRate, 4),
      usd8HistoryEarned: complete ? formatDashboardNumber(usd8HistoryScore, 0) : '...',
      usd8Insurance: '80%',
      sUsd8Balance: complete ? formatDashboardNumber(results.sUsd8.balance, 2) : '...',
      sUsd8Rate: formatDashboardNumber(sUsd8DailyRate, 4),
      sUsd8HistoryEarned: complete ? formatDashboardNumber(sUsd8HistoryScore, 0) : '...',
      sUsd8Insurance: '80%',
    },
    progress: {
      complete,
      targetBlock: targetBlock.toString(),
      usd8: results.usd8.progress,
      sUsd8: results.sUsd8.progress,
    },
    meta: {
      rates: {
        usd8: ASSETS.usd8.scorePerTokenPerBlock,
        sUsd8: ASSETS.sUsd8.scorePerTokenPerBlock,
      },
      dailyRates: {
        usd8: usd8DailyRate,
        sUsd8: sUsd8DailyRate,
      },
      fromBlocks: {
        usd8: results.usd8.fromBlock.toString(),
        sUsd8: results.sUsd8.fromBlock.toString(),
      },
      processedUntilBlocks: {
        usd8: results.usd8.processedUntilBlock.toString(),
        sUsd8: results.sUsd8.processedUntilBlock.toString(),
      },
      cacheAgeBlocks: {
        usd8: results.usd8.cacheAgeBlocks.toString(),
        sUsd8: results.sUsd8.cacheAgeBlocks.toString(),
      },
      refreshBlockThreshold: getScoreRefreshBlockThreshold().toString(),
    },
  };
}

function getDailyScoreRate(asset) {
  return asset.scorePerTokenPerBlock * ETHEREUM_BLOCKS_PER_DAY;
}

async function advanceAssetCheckpoint(env, holder, assetKey, asset, targetBlock) {
  const checkpoint = await getOrCreateCheckpoint(env, holder, assetKey, asset, targetBlock);
  const chunkBlocks = readBigInt(env.CHUNK_BLOCKS, DEFAULT_CHUNK_BLOCKS);
  const maxRanges = Number(readBigInt(env.MAX_RANGES_PER_ASSET, BigInt(DEFAULT_MAX_RANGES_PER_ASSET)));
  const refreshBlockThreshold = getScoreRefreshBlockThreshold();
  let processedUntilBlock = BigInt(checkpoint.processed_until_block);
  const startingProcessedUntilBlock = processedUntilBlock;
  let balanceRaw = BigInt(checkpoint.balance_raw);
  let rawTokenBlockIntegral = BigInt(checkpoint.raw_token_block_integral);
  let rangesProcessed = 0;
  const startingCacheAgeBlocks = targetBlock > processedUntilBlock ? targetBlock - processedUntilBlock : 0n;
  const refreshTargetBlock = startingCacheAgeBlocks >= refreshBlockThreshold ? targetBlock : processedUntilBlock;

  while (processedUntilBlock < refreshTargetBlock && rangesProcessed < maxRanges) {
    const nextProcessedUntilBlock = minBigInt(processedUntilBlock + chunkBlocks, refreshTargetBlock);
    const step = await processTokenRange(env, asset.token.address, holder, processedUntilBlock, nextProcessedUntilBlock, balanceRaw);

    balanceRaw = step.balanceRaw;
    rawTokenBlockIntegral += step.rawTokenBlockIntegral;
    processedUntilBlock = nextProcessedUntilBlock;
    rangesProcessed += 1;
  }

  if (processedUntilBlock !== startingProcessedUntilBlock) {
    await saveCheckpoint(env, {
      holder,
      assetKey,
      processedUntilBlock,
      balanceRaw,
      rawTokenBlockIntegral,
    });
  }

  const tokenBlockWeight = normalizeTokenBlockIntegral(rawTokenBlockIntegral, asset.token.decimals);
  const complete = processedUntilBlock >= refreshTargetBlock;
  const totalBlocks = refreshTargetBlock > BigInt(checkpoint.from_block) ? refreshTargetBlock - BigInt(checkpoint.from_block) : 0n;
  const processedBlocks = processedUntilBlock > BigInt(checkpoint.from_block) ? processedUntilBlock - BigInt(checkpoint.from_block) : 0n;
  const cacheAgeBlocks = targetBlock > processedUntilBlock ? targetBlock - processedUntilBlock : 0n;

  return {
    complete,
    balance: Number(balanceRaw) / 10 ** asset.token.decimals,
    tokenBlockWeight,
    fromBlock: BigInt(checkpoint.from_block),
    processedUntilBlock,
    cacheAgeBlocks,
    progress: {
      complete,
      processedBlocks: processedBlocks.toString(),
      totalBlocks: totalBlocks.toString(),
      percent: totalBlocks > 0n ? Number((processedBlocks * 10_000n) / totalBlocks) / 100 : 100,
      rangesProcessed,
      cacheAgeBlocks: cacheAgeBlocks.toString(),
      refreshBlockThreshold: refreshBlockThreshold.toString(),
      refreshSkipped: startingCacheAgeBlocks > 0n && startingCacheAgeBlocks < refreshBlockThreshold,
    },
  };
}

function getScoreRefreshBlockThreshold() {
  const threshold = protocolConfig.scoreRefreshBlockThreshold;
  if (typeof threshold === 'bigint') return threshold;
  if (typeof threshold === 'number' && Number.isFinite(threshold) && threshold >= 0) return BigInt(Math.floor(threshold));
  if (typeof threshold === 'string' && threshold) return readBigInt(threshold, 0n);
  return 0n;
}

async function getOrCreateCheckpoint(env, holder, assetKey, asset, targetBlock) {
  const existing = await env.DB.prepare(
    'SELECT * FROM score_checkpoints WHERE holder = ? AND asset_key = ?',
  ).bind(holder, assetKey).first();
  const fromBlock = getDefaultFromBlock(env, asset, targetBlock);

  if (
    existing
    && existing.token_address === asset.token.address
    && existing.from_block === fromBlock.toString()
  ) {
    return existing;
  }

  const initialBalance = await fetchBalanceAt(env, asset.token.address, holder, fromBlock);
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT OR REPLACE INTO score_checkpoints (
      holder,
      asset_key,
      token_address,
      from_block,
      processed_until_block,
      balance_raw,
      raw_token_block_integral,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    holder,
    assetKey,
    asset.token.address,
    fromBlock.toString(),
    fromBlock.toString(),
    initialBalance.toString(),
    '0',
    now,
  ).run();

  return env.DB.prepare(
    'SELECT * FROM score_checkpoints WHERE holder = ? AND asset_key = ?',
  ).bind(holder, assetKey).first();
}

async function processTokenRange(env, token, holder, startBlock, endBlock, startingBalanceRaw) {
  const logs = await fetchTransfers(env, token, holder, startBlock + 1n, endBlock);
  let balanceRaw = startingBalanceRaw;
  let segmentStartBlock = startBlock;
  let rawTokenBlockIntegral = 0n;

  for (const log of logs) {
    if (log.blockNumber > segmentStartBlock) {
      rawTokenBlockIntegral += balanceRaw * (log.blockNumber - segmentStartBlock);
    }

    if (log.from === holder) balanceRaw -= log.value;
    if (log.to === holder) balanceRaw += log.value;
    if (balanceRaw < 0n) throw new Error(`Negative ${token} balance at block ${log.blockNumber}.`);

    segmentStartBlock = log.blockNumber;
  }

  if (endBlock > segmentStartBlock) rawTokenBlockIntegral += balanceRaw * (endBlock - segmentStartBlock);

  return { balanceRaw, rawTokenBlockIntegral };
}

async function fetchTransfers(env, token, holder, fromBlock, toBlock) {
  if (fromBlock > toBlock) return [];

  if (getTransferHistorySource(env) === 'alchemy') {
    return fetchTransfersFromAlchemy(env, token, holder, fromBlock, toBlock);
  }

  return fetchTransfersFromLogs(env, token, holder, fromBlock, toBlock);
}

async function fetchTransfersFromAlchemy(env, token, holder, fromBlock, toBlock) {
  const [outgoing, incoming] = await Promise.all([
    fetchAlchemyTransfersByAddress(env, token, holder, fromBlock, toBlock, 'fromAddress'),
    fetchAlchemyTransfersByAddress(env, token, holder, fromBlock, toBlock, 'toAddress'),
  ]);
  const seen = new Set();

  return [...outgoing, ...incoming]
    .filter((transfer) => {
      const id = transfer.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((a, b) => {
      if (a.blockNumber !== b.blockNumber) return a.blockNumber < b.blockNumber ? -1 : 1;
      if (a.logIndex !== b.logIndex) return a.logIndex < b.logIndex ? -1 : 1;
      return a.id.localeCompare(b.id);
    });
}

async function fetchAlchemyTransfersByAddress(env, token, holder, fromBlock, toBlock, addressField) {
  let pageKey = '';
  const transfers = [];

  do {
    const request = {
      fromBlock: toBlockHex(fromBlock),
      toBlock: toBlockHex(toBlock),
      [addressField]: holder,
      contractAddresses: [token],
      category: ['erc20'],
      withMetadata: false,
      excludeZeroValue: true,
      maxCount: ALCHEMY_TRANSFER_MAX_COUNT,
    };

    if (pageKey) request.pageKey = pageKey;

    const result = await rpc(env, 'alchemy_getAssetTransfers', [request]);
    transfers.push(...(result.transfers || []).map((transfer) => parseAlchemyTransfer(transfer, token)));
    pageKey = result.pageKey || '';
  } while (pageKey);

  return transfers;
}

async function fetchTransfersFromLogs(env, token, holder, fromBlock, toBlock) {
  if (fromBlock > toBlock) return [];

  const holderTopic = addressToTopic(holder);
  const [outgoing, incoming] = await rpcBatch(env, [
    {
      method: 'eth_getLogs',
      params: [{
        address: token,
        topics: [TRANSFER_TOPIC, holderTopic, null],
        fromBlock: toBlockHex(fromBlock),
        toBlock: toBlockHex(toBlock),
      }],
    },
    {
      method: 'eth_getLogs',
      params: [{
        address: token,
        topics: [TRANSFER_TOPIC, null, holderTopic],
        fromBlock: toBlockHex(fromBlock),
        toBlock: toBlockHex(toBlock),
      }],
    },
  ]);
  const seen = new Set();

  return [...outgoing, ...incoming]
    .filter((log) => {
      const id = `${log.transactionHash}:${log.logIndex}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map(parseTransferLog)
    .sort((a, b) => {
      if (a.blockNumber === b.blockNumber) return Number(a.logIndex - b.logIndex);
      return a.blockNumber < b.blockNumber ? -1 : 1;
    });
}

function getTransferHistorySource(env) {
  const configuredSource = String(env.TRANSFER_HISTORY_SOURCE || '').toLowerCase();
  if (configuredSource === 'alchemy' || configuredSource === 'eth_getlogs') return configuredSource;

  const rpcUrl = String(env.ETH_RPC_URL || env.DEFAULT_RPC_URL || '');
  return rpcUrl.includes('alchemy.com') ? 'alchemy' : 'eth_getlogs';
}

async function fetchBalanceAt(env, token, holder, blockNumber) {
  const paddedAddress = holder.slice(2).padStart(64, '0');
  const result = await rpc(env, 'eth_call', [
    { to: token, data: `${BALANCE_OF_SELECTOR}${paddedAddress}` },
    toBlockHex(blockNumber),
  ]);

  return BigInt(result || '0x0');
}

async function getBlockNumber(env) {
  return BigInt(await rpc(env, 'eth_blockNumber', []));
}

async function rpc(env, method, params) {
  const [result] = await rpcBatch(env, [{ method, params }]);
  return result;
}

async function rpcBatch(env, calls) {
  const rpcUrl = env.ETH_RPC_URL || env.DEFAULT_RPC_URL || DEFAULT_RPC_URL;
  const body = calls.map((call, index) => ({
    jsonrpc: '2.0',
    id: index + 1,
    method: call.method,
    params: call.params,
  }));
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body.length === 1 ? body[0] : body),
  });
  const responseText = await response.text();
  let json;

  try {
    json = JSON.parse(responseText);
  } catch {
    throw new Error(responseText || `Ethereum RPC returned HTTP ${response.status}.`);
  }
  const results = Array.isArray(json) ? json : [json];

  return results
    .sort((a, b) => a.id - b.id)
    .map((item) => {
      if (item.error) throw normalizeRpcError(item.error);
      return item.result;
    });
}

async function saveCheckpoint(env, checkpoint) {
  await env.DB.prepare(`
    UPDATE score_checkpoints
    SET processed_until_block = ?,
      balance_raw = ?,
      raw_token_block_integral = ?,
      updated_at = ?
    WHERE holder = ? AND asset_key = ?
  `).bind(
    checkpoint.processedUntilBlock.toString(),
    checkpoint.balanceRaw.toString(),
    checkpoint.rawTokenBlockIntegral.toString(),
    new Date().toISOString(),
    checkpoint.holder,
    checkpoint.assetKey,
  ).run();
}

function normalizeRpcError(error) {
  const message = error?.message || 'Ethereum RPC request failed.';
  const normalized = new Error(message);

  if (
    message.toLowerCase().includes('limit')
    || message.toLowerCase().includes('too many')
    || String(error?.code || '').includes('429')
  ) {
    normalized.userMessage = 'Ethereum RPC rate limit reached while syncing score checkpoints. Try again shortly or use a higher-limit RPC URL.';
  }

  return normalized;
}

function parseTransferLog(log) {
  return {
    id: `${log.transactionHash}:${log.logIndex}`,
    blockNumber: BigInt(log.blockNumber),
    logIndex: BigInt(log.logIndex || '0x0'),
    from: topicToAddress(log.topics[1]),
    to: topicToAddress(log.topics[2]),
    value: BigInt(log.data || '0x0'),
  };
}

function parseAlchemyTransfer(transfer, expectedToken) {
  const rawContractAddress = normalizeAddress(transfer.rawContract?.address || transfer.contractAddress || expectedToken);
  if (rawContractAddress !== expectedToken) throw new Error(`Unexpected transfer token ${rawContractAddress}.`);

  return {
    id: transfer.uniqueId || `${transfer.hash}:${transfer.blockNum}:${transfer.from}:${transfer.to}:${transfer.rawContract?.value || '0x0'}`,
    blockNumber: BigInt(transfer.blockNum),
    logIndex: parseAlchemyLogIndex(transfer.uniqueId),
    from: normalizeAddress(transfer.from),
    to: normalizeAddress(transfer.to),
    value: BigInt(transfer.rawContract?.value || '0x0'),
  };
}

function parseAlchemyLogIndex(uniqueId = '') {
  const match = String(uniqueId).match(/log:(\d+)$/i);
  return match ? BigInt(match[1]) : 0n;
}

function getDefaultFromBlock(_env, _asset, targetBlock) {
  return protocolConfig.scoreStartBlock > targetBlock ? targetBlock : protocolConfig.scoreStartBlock;
}

function normalizeAddress(address) {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return '';
  return address.toLowerCase();
}

function addressToTopic(address) {
  return `0x${address.slice(2).padStart(64, '0')}`;
}

function topicToAddress(topic) {
  return `0x${topic.slice(-40)}`.toLowerCase();
}

function toBlockHex(blockNumber) {
  return `0x${blockNumber.toString(16)}`;
}

function readBigInt(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;

  try {
    const parsed = BigInt(value);
    return parsed >= 0n ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function normalizeTokenBlockIntegral(rawIntegral, decimals) {
  const scale = 10n ** BigInt(decimals);
  const wholeTokenBlocks = rawIntegral / scale;
  const remainder = rawIntegral % scale;
  return Number(wholeTokenBlocks) + Number(remainder) / Number(scale);
}

function formatDashboardNumber(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value) || value <= 0) return '0';

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    useGrouping: false,
  }).format(value);
}

function minBigInt(a, b) {
  return a < b ? a : b;
}

function corsHeaders(request, env) {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = String(env.ALLOWED_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean);
  const allowedOrigin = getAllowedOrigin(origin, allowedOrigins);

  return {
    'access-control-allow-origin': allowedOrigin,
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary': 'Origin',
  };
}

function getAllowedOrigin(origin, allowedOrigins) {
  if (!origin) return allowedOrigins[0] || '*';
  if (allowedOrigins.includes(origin)) return origin;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return origin;

  return allowedOrigins[0] || '*';
}

function jsonResponse(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request, env),
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
