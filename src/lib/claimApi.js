import { getAddress, isAddress, isHex, size } from 'viem';

const DEFAULT_CLAIM_API_URL = 'https://wmzdww7bxb.execute-api.eu-central-1.amazonaws.com';

function claimApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_CLAIM_API_URL;
  if (import.meta.env.MODE === 'production' && configuredUrl) {
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

const JOB_ID_PATTERN = /^[0-9a-f]{64}$/;
const DEFAULT_POLL_INTERVAL_MS = 3_000;
const DEFAULT_MAX_WAIT_MS = 10 * 60 * 1_000;

function apiError(status) {
  if (status === 422) return new Error('No qualifying 20% price drop was detected.');
  if (status === 409) return new Error('An incident is already active. Close and reopen this claim.');
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

export async function prepareIncidentOpen(insuredToken, {
  chainId,
  registry,
  defiInsurance,
  idempotencyKey = crypto.randomUUID(),
  signal,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  maxWaitMs = DEFAULT_MAX_WAIT_MS,
} = {}) {
  if (!claimApiConfigured) throw new Error('Claim verification service is not configured.');
  const canonicalToken = canonicalAddress(insuredToken, 'insured token');
  const response = await fetch(`${CLAIM_API_BASE_URL}/jobs/open`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ insuredToken: canonicalToken }),
    signal,
  });
  if (!response.ok) throw apiError(response.status);
  const accepted = await response.json();
  if (accepted?.accepted !== true || !validJobId(accepted.jobId)) {
    throw new Error('Claim verification service returned an invalid job.');
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt <= maxWaitMs) {
    const pollResponse = await fetch(`${CLAIM_API_BASE_URL}/jobs/${accepted.jobId}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
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
