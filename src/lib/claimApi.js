import {
  concatHex, encodeAbiParameters, getAddress, isAddress, isHex, keccak256, size,
} from 'viem';

const DEFAULT_CLAIM_API_URL = 'https://wmzdww7bxb.execute-api.eu-central-1.amazonaws.com';

function claimApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_CLAIM_API_URL;
  if (configuredUrl) {
    try {
      const hostname = new URL(configuredUrl).hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        return DEFAULT_CLAIM_API_URL;
      }
    } catch {
      // Preserve the configured value so requests fail closed with a visible error.
    }
  }
  return configuredUrl || DEFAULT_CLAIM_API_URL;
}

export const CLAIM_API_BASE_URL = claimApiBaseUrl().replace(/\/$/, '');
export const claimApiConfigured = Boolean(CLAIM_API_BASE_URL);

export function matchesSettlementContext(settlement, incidentId, root) {
  return settlement?.incidentId === String(incidentId)
    && typeof settlement.root === 'string'
    && typeof root === 'string'
    && settlement.root.toLowerCase() === root.toLowerCase();
}

const JOB_ID_PATTERN = /^[0-9a-f]{64}$/;
const DEFAULT_POLL_INTERVAL_MS = 3_000;
const DEFAULT_OPEN_MAX_WAIT_MS = 10 * 60 * 1_000;
const DEFAULT_SETTLEMENT_MAX_WAIT_MS = 21 * 60 * 1_000;
const MAX_SETTLEMENT_ATTEMPTS = 8;

function terminalFailure(terminal) {
  throw new Error(`Claim settlement ${terminal}.`);
}
const MAX_DOWNLOADED_RESULT_BYTES = 16 * 1024 * 1024;
const MAX_UINT256 = (1n << 256n) - 1n;
const MAX_UINT256_DECIMAL = MAX_UINT256.toString();
const ZERO_ROOT = `0x${'00'.repeat(32)}`;

function apiError(status) {
  // The eligibility window is stated up front in the dialog, so it is not repeated here.
  if (status === 422) return new Error('No qualifying >20% price drop was detected.');
  if (status === 409) return new Error('An incident is already active. Close and reopen this claim.');
  if (status === 429) return new Error('Claim verification service is busy. Please wait a moment and try again.');
  return new Error(status === 503
    ? 'Claim verification service is temporarily unavailable.'
    : `Claim verification request failed (${status}).`);
}

function canonicalAddress(value, label) {
  if (!isAddress(value)) throw new Error(`Claim service returned an invalid ${label}.`);
  return getAddress(value);
}

function sameAddress(left, right) {
  return canonicalAddress(left, 'address').toLowerCase() === canonicalAddress(right, 'address').toLowerCase();
}

function canonicalPoolSnapshot(poolAddrs, poolOrder, message) {
  if (!Array.isArray(poolAddrs) || poolAddrs.length === 0
      || !Array.isArray(poolOrder) || poolOrder.length !== poolAddrs.length) {
    throw new Error(message);
  }
  let canonicalPoolAddrs;
  let canonicalPoolOrder;
  try {
    canonicalPoolAddrs = poolAddrs.map((pool) => canonicalAddress(pool, 'settlement pool address'));
    canonicalPoolOrder = poolOrder.map((asset) => canonicalAddress(asset, 'settlement pool order'));
  } catch {
    throw new Error(message);
  }
  if (new Set(canonicalPoolAddrs.map((pool) => pool.toLowerCase())).size !== canonicalPoolAddrs.length
      || new Set(canonicalPoolOrder.map((asset) => asset.toLowerCase())).size !== canonicalPoolOrder.length) {
    throw new Error(message);
  }
  return { poolAddrs: canonicalPoolAddrs, poolOrder: canonicalPoolOrder };
}

function validJobId(value) {
  return typeof value === 'string' && JOB_ID_PATTERN.test(value);
}

function wait(milliseconds, signal) {
  if (milliseconds === 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, milliseconds);
    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new DOMException('The operation was aborted.', 'AbortError'));
    }, { once: true });
  });
}

function rateLimitRetryDelay(response, fallbackMilliseconds) {
  const retryAfter = response.headers.get('retry-after');
  const retryAfterSeconds = retryAfter === null ? Number.NaN : Number(retryAfter);
  return Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0
    ? retryAfterSeconds * 1_000
    : fallbackMilliseconds;
}

async function fetchWithRateLimitRetry(url, options, {
  deadline,
  retryIntervalMs,
  signal,
}) {
  while (true) {
    const response = await fetch(url, options);
    if (response.status !== 429) return response;
    const remainingMilliseconds = deadline - Date.now();
    if (remainingMilliseconds <= 0) throw apiError(429);
    await wait(Math.min(
      rateLimitRetryDelay(response, retryIntervalMs),
      remainingMilliseconds,
    ), signal);
  }
}

function validateAuthorization(payload, expected) {
  const artifact = payload?.artifact;
  if (artifact?.schemaVersion !== 1 || artifact?.artifactType !== 'incidentOpen') {
    throw new Error('Claim service returned an invalid incident authorization.');
  }
  if (Number(artifact.chainId) !== expected.chainId) {
    throw new Error('Claim service returned an authorization for another network.');
  }
  if (!sameAddress(artifact.registry, expected.registry)) {
    throw new Error('Claim service returned an authorization for another Registry.');
  }
  if (!sameAddress(artifact.defiInsurance, expected.defiInsurance)) {
    throw new Error('Claim service returned an authorization for another insurance contract.');
  }
  if (!sameAddress(artifact.insuredToken, expected.insuredToken)) {
    throw new Error('Claim service returned an authorization for another insured token.');
  }
  if (!Number.isSafeInteger(artifact.referenceBlock) || artifact.referenceBlock <= 0) {
    throw new Error('Claim service returned an invalid reference block.');
  }
  if (!isHex(payload.signature, { strict: true }) || size(payload.signature) !== 65) {
    throw new Error('Claim service returned an invalid TEE signature.');
  }
  return {
    referenceBlock: BigInt(artifact.referenceBlock),
    signature: payload.signature,
  };
}

function uint256Decimal(value, label) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)$/.test(value)) {
    throw new Error(`Claim service returned invalid ${label}.`);
  }
  if (
    value.length > MAX_UINT256_DECIMAL.length
    || (value.length === MAX_UINT256_DECIMAL.length && value > MAX_UINT256_DECIMAL)
  ) throw new Error(`Claim service returned invalid ${label}.`);
  const parsed = BigInt(value);
  if (parsed > MAX_UINT256) throw new Error(`Claim service returned invalid ${label}.`);
  return parsed;
}

function decimalArray(values, label) {
  if (!Array.isArray(values)) throw new Error(`Claim service returned invalid ${label}.`);
  return values.map((value) => uint256Decimal(value, label));
}

function settlementProofs(incidentId, rows, expectedRoot) {
  if (rows.length === 0) throw new Error('Claim service returned an invalid settlement proof.');
  const claims = new Set();
  const leaves = rows.map((row) => {
    if (claims.has(row.claimId)) {
      throw new Error('Claim service returned an invalid settlement proof.');
    }
    claims.add(row.claimId);
    const encoded = encodeAbiParameters([
      { type: 'uint256' }, { type: 'uint256' }, { type: 'address' }, { type: 'uint256[]' },
      { type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' },
    ], [
      BigInt(incidentId), BigInt(row.claimId), canonicalAddress(row.user, 'claim user'), row.amounts,
      row.scoreSpent, row.boostedScore, row.eligibleAmount,
    ]);
    return { claimId: row.claimId, hash: keccak256(keccak256(encoded)) };
  }).sort((left, right) => (left.hash < right.hash ? -1 : left.hash > right.hash ? 1 : 0));

  const tree = Array(2 * leaves.length - 1);
  const indexes = new Map();
  leaves.forEach(({ claimId, hash }, leafIndex) => {
    const index = tree.length - 1 - leafIndex;
    tree[index] = hash;
    indexes.set(claimId, index);
  });
  for (let index = tree.length - leaves.length - 1; index >= 0; index -= 1) {
    const pair = [tree[2 * index + 1], tree[2 * index + 2]].sort();
    tree[index] = keccak256(concatHex(pair));
  }
  if (tree[0].toLowerCase() !== expectedRoot.toLowerCase()) {
    throw new Error('Claim service returned an invalid settlement proof.');
  }

  return new Map([...indexes].map(([claimId, initialIndex]) => {
    const proof = [];
    let index = initialIndex;
    while (index > 0) {
      proof.push(tree[index % 2 === 0 ? index - 1 : index + 1]);
      index = Math.floor((index - 1) / 2);
    }
    return [claimId, proof];
  }));
}

async function downloadedTerminal(download, expectedJobId, signal) {
  if (!download || typeof download !== 'object'
      || !/^[0-9a-f]{64}$/.test(download.sha256)
      || !Number.isSafeInteger(download.bytes) || download.bytes <= 0
      || download.bytes > MAX_DOWNLOADED_RESULT_BYTES
      || !Number.isSafeInteger(download.expiresInSeconds)
      || download.expiresInSeconds <= 0 || download.expiresInSeconds > 3_600) {
    throw new Error('Claim service returned an invalid settlement download.');
  }
  let url;
  try {
    url = new URL(download.url);
  } catch {
    throw new Error('Claim service returned an invalid settlement download.');
  }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || url.port
      || (host !== 'amazonaws.com' && !host.endsWith('.amazonaws.com'))) {
    throw new Error('Claim service returned an invalid settlement download.');
  }

  const response = await fetch(url.href, {
    method: 'GET',
    headers: { accept: 'application/json' },
    credentials: 'omit',
    redirect: 'error',
    referrerPolicy: 'no-referrer',
    signal,
  });
  if (!response.ok || !response.body) throw new Error('Claim settlement download failed.');
  const contentLength = response.headers.get('content-length');
  if (contentLength !== null
      && (!/^(0|[1-9]\d*)$/.test(contentLength) || Number(contentLength) !== download.bytes)) {
    throw new Error('Claim service returned a corrupt settlement download.');
  }

  const chunks = [];
  const reader = response.body.getReader();
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > download.bytes || total > MAX_DOWNLOADED_RESULT_BYTES) {
      await reader.cancel();
      throw new Error('Claim service returned a corrupt settlement download.');
    }
    chunks.push(value);
  }
  if (total !== download.bytes) throw new Error('Claim service returned a corrupt settlement download.');

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const digest = [...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes))]
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
  if (digest !== download.sha256) throw new Error('Claim service returned a corrupt settlement download.');

  let terminal;
  try {
    terminal = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new Error('Claim service returned a corrupt settlement download.');
  }
  if (terminal?.schemaVersion !== 1 || terminal.jobId !== expectedJobId
      || terminal.status !== 'completed' || !terminal.payload || typeof terminal.payload !== 'object') {
    throw new Error('Claim service returned an invalid settlement download.');
  }
  return terminal.payload;
}

async function completedSettlementPayload(job, expectedJobId, signal) {
  if (!validJobId(job?.jobId)) {
    throw new Error('Claim service returned an invalid completed job.');
  }
  if (expectedJobId !== undefined && job.jobId !== expectedJobId) {
    throw new Error('Claim service returned another job.');
  }
  if (job.status !== 'completed'
      || (job.payload === undefined) === (job.download === undefined)) {
    throw new Error('Claim service returned an invalid completed job.');
  }
  return job.payload === undefined
    ? downloadedTerminal(job.download, job.jobId, signal)
    : job.payload;
}

function validateSettlement(payload, expected) {
  const artifact = payload?.artifact;
  const artifactIncidentId = uint256Decimal(artifact?.incidentId, 'incident id');
  if (artifact?.schemaVersion !== 1) throw new Error('Claim service returned an invalid settlement.');
  if (!Number.isSafeInteger(artifact.chainId) || artifact.chainId !== expected.chainId
      || !sameAddress(artifact.registry, expected.registry)
      || !sameAddress(artifact.defiInsurance, expected.defiInsurance)
      || artifactIncidentId !== expected.incidentId) {
    throw new Error('Claim service returned a settlement for another incident.');
  }
  if (!isHex(artifact.root, { strict: true }) || size(artifact.root) !== 32) {
    throw new Error('Claim service returned an invalid settlement root.');
  }
  if (!isHex(payload.signature, { strict: true }) || size(payload.signature) !== 65) {
    throw new Error('Claim service returned an invalid settlement signature.');
  }
  const poolPayouts = decimalArray(artifact.poolPayouts, 'pool payouts');
  const { poolAddrs, poolOrder } = canonicalPoolSnapshot(
    artifact.poolAddrs,
    artifact.poolOrder,
    'Claim service returned an invalid settlement pool order.',
  );
  if (poolOrder.length !== poolPayouts.length) {
    throw new Error('Claim service returned an invalid settlement pool order.');
  }
  if (poolAddrs.length !== expected.poolAddrs.length
      || poolAddrs.some((pool, index) => pool.toLowerCase() !== expected.poolAddrs[index].toLowerCase())) {
    throw new Error('Claim service returned a settlement for another pool snapshot.');
  }
  if (poolOrder.length !== expected.poolOrder.length
      || poolOrder.some((asset, index) => asset.toLowerCase() !== expected.poolOrder[index].toLowerCase())) {
    throw new Error('Claim service returned a settlement for another asset order.');
  }
  if (expected.expectedRoot !== undefined) {
    if (!isHex(expected.expectedRoot, { strict: true }) || size(expected.expectedRoot) !== 32) {
      throw new Error('Invalid expected settlement root.');
    }
    // Before the first settlement write the authoritative on-chain root is zero.
    // In that state the completed, signed artifact defines the proposed nonzero
    // root. Once a root is standing, retrieval must remain bound to it exactly.
    if (expected.expectedRoot.toLowerCase() !== ZERO_ROOT
        && expected.expectedRoot.toLowerCase() !== artifact.root.toLowerCase()) {
      throw new Error('Claim service returned a settlement for another root.');
    }
  }
  const rows = Array.isArray(artifact.rows) ? artifact.rows.map((row) => ({
    claimId: uint256Decimal(row.claimId, 'claim id').toString(),
    user: canonicalAddress(row.user, 'claim user'),
    amounts: decimalArray(row.amounts, 'claim payout amounts'),
    scoreSpent: uint256Decimal(row.scoreSpent, 'score spent'),
    boostedScore: uint256Decimal(row.boostedScore, 'boosted score'),
    eligibleAmount: uint256Decimal(row.eligibleAmount, 'eligible amount'),
    // Valuation the enclave reported. Not committed in the Merkle leaf, so this is
    // informational only — the contract verifies amounts/score/eligibleAmount.
    payoutUsd: row.payoutUsd === undefined ? undefined : uint256Decimal(row.payoutUsd, 'payout USD'),
    lossUsd: row.lossUsd === undefined ? undefined : uint256Decimal(row.lossUsd, 'loss USD'),
    proof: row.proof,
  })) : [];
  if (rows.some((row) => row.amounts.length !== poolOrder.length)) {
    throw new Error('Claim service returned an invalid settlement pool order.');
  }
  const derivedProofs = settlementProofs(artifactIncidentId, rows, artifact.root);
  rows.forEach((row) => {
    const derived = derivedProofs.get(row.claimId);
    if (row.proof !== undefined && (!Array.isArray(row.proof)
      || row.proof.some((item) => !isHex(item, { strict: true }) || size(item) !== 32)
      || row.proof.length !== derived.length
      || row.proof.some((item, index) => item.toLowerCase() !== derived[index].toLowerCase()))) {
      throw new Error('Claim service returned an invalid settlement proof.');
    }
    row.proof = derived;
  });
  return {
    root: artifact.root,
    poolAddrs,
    poolOrder,
    poolPayouts,
    rows,
    signature: payload.signature,
  };
}

export async function prepareSettlement(incidentId, {
  chainId,
  registry,
  defiInsurance,
  expectedRoot,
  expectedPoolAddrs,
  expectedPoolOrder,
  idempotencyKey,
  signal,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  maxWaitMs = DEFAULT_SETTLEMENT_MAX_WAIT_MS,
} = {}) {
  if (!claimApiConfigured) throw new Error('Claim verification service is not configured.');
  const incidentIdText = typeof incidentId === 'bigint' ? String(incidentId) : incidentId;
  if (typeof incidentIdText !== 'string' || !/^[1-9]\d*$/.test(incidentIdText)
      || BigInt(incidentIdText) > MAX_UINT256) throw new Error('Invalid incident id.');
  const canonicalIncidentId = BigInt(incidentIdText);
  const expectedPoolSnapshot = canonicalPoolSnapshot(
    expectedPoolAddrs,
    expectedPoolOrder,
    'Invalid expected settlement pool snapshot.',
  );
  const deadline = Date.now() + maxWaitMs;
  if (expectedRoot !== undefined) {
    if (!isHex(expectedRoot, { strict: true }) || size(expectedRoot) !== 32) {
      throw new Error('Invalid expected settlement root.');
    }
    if (expectedRoot.toLowerCase() !== ZERO_ROOT) {
      const settlementUrl = [
        CLAIM_API_BASE_URL,
        'settlements',
        chainId,
        canonicalAddress(registry, 'Registry').toLowerCase(),
        canonicalAddress(defiInsurance, 'insurance contract').toLowerCase(),
        incidentIdText,
        expectedRoot.toLowerCase(),
      ].join('/');
      const lookupResponse = await fetchWithRateLimitRetry(settlementUrl, {
        method: 'GET',
        headers: { accept: 'application/json' },
        cache: 'no-store',
        signal,
      }, { deadline, retryIntervalMs: pollIntervalMs, signal });
      if (lookupResponse.ok) {
        const job = await lookupResponse.json();
        const payload = await completedSettlementPayload(job, undefined, signal);
        return {
          ...validateSettlement(payload, {
            chainId,
            registry,
            defiInsurance,
            incidentId: canonicalIncidentId,
            expectedRoot,
            ...expectedPoolSnapshot,
          }),
          source: { route: settlementUrl, jobId: job.jobId },
        };
      }
      if (lookupResponse.status === 404) {
        throw new Error('Claim service returned no immutable settlement artifact for the expected root.');
      }
      throw apiError(lookupResponse.status);
    }
  }
  // Terminals are immutable, so one key is one attempt. Walk a deterministic
  // ladder: every claimant derives the same keys, so retries still converge on a
  // single job. Re-POSTing a key that already failed does not relaunch it, so
  // stepping past spent attempts costs nothing.
  const canonicalKey = `usd8-settlement-${chainId}-${incidentIdText}`;
  const attemptKeys = idempotencyKey === undefined
    ? Array.from(
      { length: MAX_SETTLEMENT_ATTEMPTS },
      (_, attempt) => (attempt === 0 ? canonicalKey : `${canonicalKey}-${attempt + 1}`),
    )
    : [idempotencyKey];
  let spentTerminal = '';

  for (const attemptKey of attemptKeys) {
    if (Date.now() > deadline) break;
    const response = await fetchWithRateLimitRetry(`${CLAIM_API_BASE_URL}/jobs/settlement`, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', 'Idempotency-Key': attemptKey },
      body: JSON.stringify({ incidentId: incidentIdText }),
      signal,
    }, { deadline, retryIntervalMs: pollIntervalMs, signal });
    if (!response.ok) throw apiError(response.status);
    const accepted = await response.json();
    if (accepted?.accepted !== true || !validJobId(accepted.jobId)) throw new Error('Claim verification service returned an invalid job.');
    const jobUrl = `${CLAIM_API_BASE_URL}/jobs/${accepted.jobId}`;
    spentTerminal = '';
    // A key already spent before this call reports its terminal on the first poll.
    // Anything that runs is a job this call launched, and its failure is final —
    // stepping further would launch another instance per attempt.
    let launchedHere = false;
    while (Date.now() <= deadline) {
      const pollResponse = await fetchWithRateLimitRetry(jobUrl, {
        headers: { accept: 'application/json' }, cache: 'no-store', signal,
      }, { deadline, retryIntervalMs: pollIntervalMs, signal });
      if (!pollResponse.ok) throw apiError(pollResponse.status);
      const job = await pollResponse.json();
      if (job?.jobId !== accepted.jobId) throw new Error('Claim service returned another job.');
      if (job.status === 'completed') {
        const payload = await completedSettlementPayload(job, accepted.jobId, signal);
        return {
          ...validateSettlement(payload, {
            chainId,
            registry,
            defiInsurance,
            incidentId: canonicalIncidentId,
            expectedRoot,
            ...expectedPoolSnapshot,
          }),
          source: { route: jobUrl, jobId: accepted.jobId, idempotencyKey: attemptKey },
        };
      }
      if (job.status === 'failed' || job.status === 'expired') {
        const code = typeof job.payload?.code === 'string' ? ` (${job.payload.code})` : '';
        spentTerminal = `${job.status}${code}`;
        if (launchedHere) return terminalFailure(spentTerminal);
        break;
      }
      if (job.status !== 'pending' && job.status !== 'running') throw new Error('Claim service returned an invalid job status.');
      launchedHere = true;
      await wait(pollIntervalMs, signal);
    }
    if (!spentTerminal) break;
  }
  if (spentTerminal) return terminalFailure(spentTerminal);
  throw new Error('Claim settlement timed out. Please try again.');
}

export async function prepareIncidentOpen(insuredToken, {
  chainId,
  registry,
  defiInsurance,
  idempotencyKey = crypto.randomUUID(),
  signal,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  maxWaitMs = DEFAULT_OPEN_MAX_WAIT_MS,
} = {}) {
  if (!claimApiConfigured) throw new Error('Claim verification service is not configured.');
  const canonicalToken = canonicalAddress(insuredToken, 'insured token');
  const deadline = Date.now() + maxWaitMs;
  const response = await fetchWithRateLimitRetry(`${CLAIM_API_BASE_URL}/jobs/open`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ insuredToken: canonicalToken }),
    signal,
  }, {
    deadline,
    retryIntervalMs: pollIntervalMs,
    signal,
  });
  if (!response.ok) throw apiError(response.status);
  const accepted = await response.json();
  if (accepted?.accepted !== true || !validJobId(accepted.jobId)) {
    throw new Error('Claim verification service returned an invalid job.');
  }

  while (Date.now() <= deadline) {
    const pollResponse = await fetchWithRateLimitRetry(`${CLAIM_API_BASE_URL}/jobs/${accepted.jobId}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
      signal,
    }, {
      deadline,
      retryIntervalMs: pollIntervalMs,
      signal,
    });
    if (!pollResponse.ok) throw apiError(pollResponse.status);
    const job = await pollResponse.json();
    if (job?.jobId !== accepted.jobId) throw new Error('Claim service returned another job.');
    if (job.status === 'completed') {
      return validateAuthorization(job.payload, {
        chainId,
        registry,
        defiInsurance,
        insuredToken: canonicalToken,
      });
    }
    if (job.status === 'failed' || job.status === 'expired') {
      const code = typeof job.payload?.code === 'string' ? ` (${job.payload.code})` : '';
      throw new Error(`Claim verification ${job.status}${code}.`);
    }
    if (job.status !== 'pending' && job.status !== 'running') {
      throw new Error('Claim service returned an invalid job status.');
    }
    await wait(pollIntervalMs, signal);
  }
  throw new Error('Claim verification timed out. Please try again.');
}
