const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const BALANCE_OF_SELECTOR = '0x70a08231';
const DEFAULT_RPC_URL = 'https://ethereum.publicnode.com';
const DEFAULT_CONFIRMATIONS = 12n;
const DEFAULT_CHUNK_BLOCKS = 1_000n;
const DEFAULT_LOOKBACK_BLOCKS = 2_628_000n;
const DEFAULT_MAX_RANGES_PER_ASSET = 20;
const CHECKPOINT_VERSION = 1;

const ASSETS = {
  usd8: {
    token: {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      symbol: 'USDC',
      decimals: 6,
    },
    deployBlockEnv: 'USD8_DEPLOY_BLOCK',
    defaultDeployBlock: 6_082_465n,
    scorePerTokenPerBlock: 10,
  },
  sUsd8: {
    token: {
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      symbol: 'USDT',
      decimals: 6,
    },
    deployBlockEnv: 'SUSD8_DEPLOY_BLOCK',
    defaultDeployBlock: 4_634_748n,
    scorePerTokenPerBlock: 1,
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

  return {
    status: complete ? 'complete' : 'syncing',
    values: {
      usd8Balance: complete ? formatDashboardNumber(results.usd8.balance, 2) : '...',
      usd8Rate: formatDashboardNumber(ASSETS.usd8.scorePerTokenPerBlock, 0),
      usd8HistoryEarned: complete ? formatDashboardNumber(usd8HistoryScore, 0) : '...',
      usd8Insurance: '80%',
      sUsd8Balance: complete ? formatDashboardNumber(results.sUsd8.balance, 2) : '...',
      sUsd8Rate: formatDashboardNumber(ASSETS.sUsd8.scorePerTokenPerBlock, 0),
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
      fromBlocks: {
        usd8: results.usd8.fromBlock.toString(),
        sUsd8: results.sUsd8.fromBlock.toString(),
      },
      processedUntilBlocks: {
        usd8: results.usd8.processedUntilBlock.toString(),
        sUsd8: results.sUsd8.processedUntilBlock.toString(),
      },
    },
  };
}

async function advanceAssetCheckpoint(env, holder, assetKey, asset, targetBlock) {
  const checkpoint = await getOrCreateCheckpoint(env, holder, assetKey, asset, targetBlock);
  const chunkBlocks = readBigInt(env.CHUNK_BLOCKS, DEFAULT_CHUNK_BLOCKS);
  const maxRanges = Number(readBigInt(env.MAX_RANGES_PER_ASSET, BigInt(DEFAULT_MAX_RANGES_PER_ASSET)));
  let processedUntilBlock = BigInt(checkpoint.processed_until_block);
  let balanceRaw = BigInt(checkpoint.balance_raw);
  let rawTokenBlockIntegral = BigInt(checkpoint.raw_token_block_integral);
  let rangesProcessed = 0;

  while (processedUntilBlock < targetBlock && rangesProcessed < maxRanges) {
    const nextProcessedUntilBlock = minBigInt(processedUntilBlock + chunkBlocks, targetBlock);
    const step = await processTokenRange(env, asset.token.address, holder, processedUntilBlock, nextProcessedUntilBlock, balanceRaw);

    balanceRaw = step.balanceRaw;
    rawTokenBlockIntegral += step.rawTokenBlockIntegral;
    processedUntilBlock = nextProcessedUntilBlock;
    rangesProcessed += 1;
  }

  await saveCheckpoint(env, {
    holder,
    assetKey,
    targetBlock,
    processedUntilBlock,
    balanceRaw,
    rawTokenBlockIntegral,
  });

  const tokenBlockWeight = normalizeTokenBlockIntegral(rawTokenBlockIntegral, asset.token.decimals);
  const complete = processedUntilBlock >= targetBlock;
  const totalBlocks = targetBlock > BigInt(checkpoint.from_block) ? targetBlock - BigInt(checkpoint.from_block) : 0n;
  const processedBlocks = processedUntilBlock > BigInt(checkpoint.from_block) ? processedUntilBlock - BigInt(checkpoint.from_block) : 0n;

  return {
    complete,
    balance: Number(balanceRaw) / 10 ** asset.token.decimals,
    tokenBlockWeight,
    fromBlock: BigInt(checkpoint.from_block),
    processedUntilBlock,
    progress: {
      complete,
      processedBlocks: processedBlocks.toString(),
      totalBlocks: totalBlocks.toString(),
      percent: totalBlocks > 0n ? Number((processedBlocks * 10_000n) / totalBlocks) / 100 : 100,
      rangesProcessed,
    },
  };
}

async function getOrCreateCheckpoint(env, holder, assetKey, asset, targetBlock) {
  const existing = await env.DB.prepare(
    'SELECT * FROM score_checkpoints WHERE holder = ? AND asset_key = ?',
  ).bind(holder, assetKey).first();
  const fromBlock = getDefaultFromBlock(env, asset, targetBlock);

  if (
    existing
    && existing.version === CHECKPOINT_VERSION
    && existing.token_address === asset.token.address
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
      token_symbol,
      decimals,
      score_per_token_per_block,
      from_block,
      processed_until_block,
      target_block,
      balance_raw,
      raw_token_block_integral,
      version,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    holder,
    assetKey,
    asset.token.address,
    asset.token.symbol,
    asset.token.decimals,
    asset.scorePerTokenPerBlock,
    fromBlock.toString(),
    fromBlock.toString(),
    targetBlock.toString(),
    initialBalance.toString(),
    '0',
    CHECKPOINT_VERSION,
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
      target_block = ?,
      balance_raw = ?,
      raw_token_block_integral = ?,
      updated_at = ?
    WHERE holder = ? AND asset_key = ?
  `).bind(
    checkpoint.processedUntilBlock.toString(),
    checkpoint.targetBlock.toString(),
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
    blockNumber: BigInt(log.blockNumber),
    logIndex: BigInt(log.logIndex || '0x0'),
    from: topicToAddress(log.topics[1]),
    to: topicToAddress(log.topics[2]),
    value: BigInt(log.data || '0x0'),
  };
}

function getDefaultFromBlock(env, asset, targetBlock) {
  const deploymentBlock = readBigInt(env[asset.deployBlockEnv], asset.defaultDeployBlock);
  const lookbackBlocks = readBigInt(env.LOOKBACK_BLOCKS, DEFAULT_LOOKBACK_BLOCKS);
  const lookbackStart = targetBlock > lookbackBlocks ? targetBlock - lookbackBlocks : 0n;

  return lookbackStart > deploymentBlock ? lookbackStart : deploymentBlock;
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
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '*';

  return {
    'access-control-allow-origin': allowedOrigin,
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary': 'Origin',
  };
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
