import { formatUnits, getAddress, isAddress } from 'viem';

export const SCORE_API_BASE_URL = (
  import.meta.env.VITE_SCORE_API_URL
  || 'https://j9j79vdvkj.execute-api.eu-central-1.amazonaws.com'
).replace(/\/$/, '');

const SCORE_DECIMALS = 18;
const LEGACY_SEPOLIA_CHAIN_ID = 11_155_111;

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
  const response = await fetch(`${SCORE_API_BASE_URL}${scorePath}${refresh ? '?refresh=1' : ''}`, {
    ...(refresh ? { cache: 'no-store' } : {}),
    headers: { accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(response.status === 503 ? 'Insurance Score is temporarily unavailable' : `Insurance Score request failed (${response.status})`);
  }

  const payload = await response.json();
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
