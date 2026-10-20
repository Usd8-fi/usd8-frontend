import { cachedData, protocolKey } from './dataCache.js';
import { getProtocolNetwork, PROTOCOL_CHAIN_ID } from './networkConfig.js';
import { fetchJson } from './requestUtils.js';

/// keccak256("RedeemRequested(address,uint256)"), emitted by the cover pool's requestRedeem.
export const REDEEM_REQUESTED_TOPIC = '0xa1a009bfa4d4ebaf046d2b27cbc657074cb3b637a247a3dbdf767eda4955efc2';

const topicFor = (account) => `0x${account.toLowerCase().replace(/^0x/, '').padStart(64, '0')}`;

/// When the account's live exit request was filed, in milliseconds. The pool
/// stores only the exit's end (its batch epoch), so the start comes from the
/// account's latest RedeemRequested log, read from the Blockscout index in one
/// HTTP request (no RPC). Returns null when it cannot be determined.
export function latestRequestBefore(logs, cooldownEndsAtMilliseconds) {
  const times = (Array.isArray(logs) ? logs : [])
    .map((log) => Number.parseInt(log?.timeStamp, 16) * 1_000)
    .filter((time) => Number.isFinite(time) && time > 0 && time < cooldownEndsAtMilliseconds);
  return times.length ? Math.max(...times) : null;
}

export async function fetchExitRequestedAt({ poolAddress, account, cooldownEndsAtMilliseconds, signal,
  network = getProtocolNetwork(PROTOCOL_CHAIN_ID) }) {
  if (!network?.explorerApiUrl || !poolAddress || !account || !(cooldownEndsAtMilliseconds > 0)) return null;
  const pool = network.contracts.coverPools.find((entry) => entry.address.toLowerCase() === poolAddress.toLowerCase());
  // The exit's end identifies the request, so the cached start never goes stale.
  return cachedData(protocolKey(network, 'exit-request', poolAddress.toLowerCase(), account.toLowerCase(), cooldownEndsAtMilliseconds),
    async ({ signal: querySignal }) => {
      const url = new URL(network.explorerApiUrl.replace(/\/api\/v2\/?$/, '/api'));
      url.searchParams.set('module', 'logs');
      url.searchParams.set('action', 'getLogs');
      url.searchParams.set('fromBlock', String(pool?.deployBlock ?? 0));
      url.searchParams.set('toBlock', 'latest');
      url.searchParams.set('address', poolAddress);
      url.searchParams.set('topic0', REDEEM_REQUESTED_TOPIC);
      url.searchParams.set('topic1', topicFor(account));
      url.searchParams.set('topic0_1_opr', 'and');
      const payload = await fetchJson(url, { signal: querySignal });
      return latestRequestBefore(payload?.result, cooldownEndsAtMilliseconds);
    }, { signal, staleTime: Infinity });
}

/// Share of the cooldown that has elapsed, 0-100 (null when either end is unknown).
export function cooldownProgressPercent(requestedAtMilliseconds, endsAtMilliseconds, nowMilliseconds) {
  const start = Number(requestedAtMilliseconds);
  const end = Number(endsAtMilliseconds);
  if (!(start > 0) || !(end > start)) return null;
  return Math.min(100, Math.max(0, ((nowMilliseconds - start) / (end - start)) * 100));
}
