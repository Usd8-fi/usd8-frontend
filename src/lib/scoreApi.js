import { formatUnits, getAddress, isAddress } from 'viem';
import { sepolia } from './viemLite.js';
import { getProtocolNetwork } from './networkConfig.js';

export const DEFAULT_SCORE_API_URL = 'https://j9j79vdvkj.execute-api.eu-central-1.amazonaws.com';

export function scoreApiBaseUrl(hostname = globalThis.location?.hostname, override = import.meta.env.VITE_SCORE_API_URL) {
  if (override) return override.replace(/\/$/, '');
  return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname) ? '/api' : DEFAULT_SCORE_API_URL;
}

const SCORE_DECIMALS = 18;
const LEGACY_SEPOLIA_CHAIN_ID = sepolia.id;

function requiredString(payload, key) {
  const value = payload?.[key];
  if (typeof value !== 'string' || !value) {
    throw new Error(`Score API response is missing ${key}`);
  }
  return value;
}

function scoreValue(payload, key) {
  return formatUnits(BigInt(requiredString(payload, key)), SCORE_DECIMALS);
}

function tokenScores(payload, grossEarnedScore, grossScorePerSecond) {
  if (!Array.isArray(payload?.tokenScores) || payload.tokenScores.length === 0) {
    throw new Error('Score API response is missing tokenScores');
  }
  const rawScores = payload.tokenScores.map((item) => ({
    token: getAddress(requiredString(item, 'token')),
    balance: requiredString(item, 'balance'),
    grossEarnedScore: requiredString(item, 'grossEarnedScore'),
    grossScorePerSecond: requiredString(item, 'grossScorePerSecond'),
  }));
  if (rawScores.reduce((total, item) => total + BigInt(item.grossEarnedScore), 0n) !== BigInt(grossEarnedScore)) {
    throw new Error('Score API token scores do not equal total score');
  }
  if (rawScores.reduce((total, item) => total + BigInt(item.grossScorePerSecond), 0n) !== BigInt(grossScorePerSecond)) {
    throw new Error('Score API token rates do not equal total rate');
  }
  return rawScores.map((item) => ({
    token: item.token,
    balance: BigInt(item.balance).toString(),
    grossEarnedScore: formatUnits(BigInt(item.grossEarnedScore), SCORE_DECIMALS),
    grossScorePerSecond: formatUnits(BigInt(item.grossScorePerSecond), SCORE_DECIMALS),
  }));
}

export async function fetchInsuranceScore(account, { chainId, signal, refresh = false } = {}) {
  if (!isAddress(account)) throw new Error('Invalid wallet address');
  if (!Number.isSafeInteger(chainId) || chainId <= 0) throw new Error('Invalid score network');

  const canonicalAccount = getAddress(account);
  const expectedChainId = String(chainId);
  // The deployed API Gateway only exposes /score/{address}; the Lambda still supports
  // /score/{chainId}/{address} for future multi-chain gateways.
  const scorePath = chainId === LEGACY_SEPOLIA_CHAIN_ID
    ? `/score/${canonicalAccount}`
    : `/score/${expectedChainId}/${canonicalAccount}`;
  const expectedRegistry = getProtocolNetwork(chainId)?.contracts?.registry?.toLowerCase();
  const request = async (bypassCache) => {
    const response = await fetch(`${scoreApiBaseUrl()}${scorePath}${refresh ? '?refresh=1' : ''}`, {
      ...(refresh || bypassCache ? { cache: 'no-store' } : {}),
      headers: { accept: 'application/json' },
      signal,
    });
    if (!response.ok) {
      throw new Error(response.status === 503 ? 'Insurance Score is temporarily unavailable' : `Insurance Score request failed (${response.status})`);
    }
    return response.json();
  };
  const wrongDeployment = (value) => Boolean(expectedRegistry)
    && typeof value?.registry === 'string'
    && value.registry.toLowerCase() !== expectedRegistry;

  let payload = await request(false);
  // A browser-cached snapshot can outlive a redeploy (it is cacheable until the
  // next UTC day). Never mix another deployment's score with this one.
  if (wrongDeployment(payload)) payload = await request(true);
  if (wrongDeployment(payload)) throw new Error('Score API returned a different deployment');
  if (String(payload.chainId) !== expectedChainId) {
    throw new Error(`Unexpected score API network: ${payload.chainId ?? 'unknown'}`);
  }
  if (requiredString(payload, 'account').toLowerCase() !== canonicalAccount.toLowerCase()) {
    throw new Error('Score API returned a different account');
  }

  const snapshotTimestamp = Number(requiredString(payload, 'snapshotTimestamp'));
  if (!Number.isSafeInteger(snapshotTimestamp) || snapshotTimestamp <= 0) {
    throw new Error('Score API returned an invalid snapshot timestamp');
  }
  const grossEarnedScore = requiredString(payload, 'grossEarnedScore');
  const grossScorePerSecond = requiredString(payload, 'grossScorePerSecond');

  return {
    ...payload,
    chainId: expectedChainId,
    snapshotTimestamp,
    grossEarnedScore: formatUnits(BigInt(grossEarnedScore), SCORE_DECIMALS),
    maturedGrossEarnedScore: scoreValue(payload, 'maturedGrossEarnedScore'),
    scoreSpent: scoreValue(payload, 'scoreSpent'),
    availableScore: scoreValue(payload, 'availableScore'),
    grossScorePerSecond: formatUnits(BigInt(grossScorePerSecond), SCORE_DECIMALS),
    maturingScorePerSecond: scoreValue(payload, 'maturingScorePerSecond'),
    tokenScores: tokenScores(payload, grossEarnedScore, grossScorePerSecond),
  };
}

/// Every account score the score service has stored for this deployment, as
/// last saved (no recalculation). Each row carries the time its score is as of.
export async function fetchScoreList(chainId = LEGACY_SEPOLIA_CHAIN_ID, { signal } = {}) {
  const path = chainId === LEGACY_SEPOLIA_CHAIN_ID ? '/scores' : `/scores/${chainId}`;
  const response = await fetch(`${scoreApiBaseUrl()}${path}`, { headers: { accept: 'application/json' }, signal });
  if (!response.ok) throw new Error(`Score list request failed (${response.status})`);
  const payload = await response.json();
  const expectedRegistry = getProtocolNetwork(chainId)?.contracts?.registry?.toLowerCase();
  if (!expectedRegistry || String(payload?.registry || '').toLowerCase() !== expectedRegistry) {
    throw new Error('Score list is for a different deployment');
  }
  if (!Array.isArray(payload.accounts)) throw new Error('Score list is malformed');
  const score = (value) => Number(formatUnits(BigInt(value), SCORE_DECIMALS));
  return payload.accounts.map((row) => ({
    account: String(row.account),
    total: score(row.grossEarnedScore),
    available: score(row.availableScore),
    spent: score(row.scoreSpent),
    updatedAtSeconds: Number(row.snapshotTimestamp) || null,
  }));
}
