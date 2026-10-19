import { checkAbort } from './dataCache.js';
import { mapLimited } from './requestUtils.js';

const accounts = new Map();
export function clearClaimHistory() { accounts.clear(); }

const CHUNK = 128;
// Re-verify the whole history periodically so a chain reorg cannot leave a
// stale mapping in a long-lived tab.
export const CLAIM_HISTORY_TTL_MILLISECONDS = 10 * 60_000;

function chunks(items) {
  const result = [];
  for (let offset = 0; offset < items.length; offset += CHUNK) result.push(items.slice(offset, offset + CHUNK));
  return result;
}

// Only called while no incident is active. A claim ID for an incident can only
// be added or cleared while that incident is active, and a resolved claim never
// becomes unresolved, so earlier incidents' claim IDs are read once and resolved
// claims are not read again. A refresh with nothing unresolved makes no calls.
// Returns the newest unresolved claim with its state, or null.
export async function unresolvedHistoricalClaim({ key, account, nextIncidentId, readClaimIds, readClaims, signal, now = Date.now() }) {
  const count = Number(nextIncidentId - 1n);
  if (!Number.isSafeInteger(count) || count < 0 || count > 10_000) {
    throw new Error('Claim history exceeds the supported range. Contact support to load this claim.');
  }
  let known = accounts.get(key);
  // A lower incident count means a different deployment or a reset chain.
  if (!known || count < known.through || now - known.verifiedAt >= CLAIM_HISTORY_TTL_MILLISECONDS) {
    known = { through: 0, claims: [], resolved: new Set(), verifiedAt: now };
  }
  const newIds = Array.from({ length: count - known.through }, (_, index) => BigInt(known.through + index + 1));
  const newClaimIds = (await mapLimited(chunks(newIds), readClaimIds, { signal, concurrency: 2 })).flat();
  checkAbort(signal);
  const claims = [...known.claims, ...newIds
    .map((incidentId, index) => ({ incidentId, claimId: newClaimIds[index] }))
    .filter(({ claimId }) => claimId !== 0n)];
  const open = claims.filter(({ claimId }) => !known.resolved.has(claimId)).reverse();
  const states = (await mapLimited(chunks(open), chunk => readClaims(chunk.map(({ claimId }) => claimId)), { signal, concurrency: 2 })).flat();
  checkAbort(signal);
  const resolved = new Set(known.resolved);
  let unresolved = null;
  for (const [index, candidate] of open.entries()) {
    const state = states[index];
    if (state?.[5] === true) resolved.add(candidate.claimId);
    else if (!unresolved) unresolved = { ...candidate, state };
  }
  accounts.delete(key);
  accounts.set(key, { through: count, claims, resolved, verifiedAt: known.verifiedAt });
  while (accounts.size > 8) accounts.delete(accounts.keys().next().value);
  return unresolved;
}
