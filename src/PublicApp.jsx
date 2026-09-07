import { CONNECT_WALLET_REASON } from './components/AvailabilityAction.jsx';
import { useEffect, useState } from 'react';
import { zeroAddress } from 'viem';
import USD8Landing from './components/USD8Landing.jsx';
import { fetchLandingChainData, fetchLandingAnalytics } from './lib/chainData.js';
import { cachedData } from './lib/dataCache.js';
import { fetchMorphoVault } from './lib/morphoApi.js';
import { getProtocolNetwork } from './lib/networkConfig.js';
import { mergeSnapshot } from './lib/mergeSnapshot.js';

export default function PublicApp({ onConnect, connecting = false, connectError = '' }) {
  const network = getProtocolNetwork(11155111);
  const [data, setData] = useState({ pools: network.contracts.coverPools.map(pool => ({ ...pool, tvl: null, apy: null, capacityPercent: null })) });
  const [vault, setVault] = useState({});
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    let analyticsPending = false;
    const apply = next => { if (!controller.signal.aborted) setData(old => mergeSnapshot(old, next)); };
    const refresh = async () => {
      if (document.hidden || loading) return;
      loading = true;
      try {
        const next = await fetchLandingChainData(zeroAddress, network.id, { signal: controller.signal, onPartial: apply, refresh: retry > 0 });
        apply(next);
        if (!controller.signal.aborted) setError(Object.keys(next.resourceErrors || {}).length ? 'Some data is unavailable. Retry to update it.' : '');
        if (!analyticsPending) {
          analyticsPending = true;
          fetchLandingAnalytics(next, zeroAddress, network.id, { signal: controller.signal }).then(extra => {
            if (!controller.signal.aborted) setData(old => ({ ...old, pools: old.pools.map(pool => ({ ...pool, ...extra.pools.find(item => item.id === pool.id) })) }));
          }).catch(() => {}).finally(() => { analyticsPending = false; });
        }
      } catch (error) { if (!controller.signal.aborted) setError(error.shortMessage || error.message); }
      finally { loading = false; }
    };
    refresh();
    cachedData(['morpho-vault'], ({ signal }) => fetchMorphoVault({ signal }), { signal: controller.signal, staleTime: 300_000 }).then(next => {
      if (!controller.signal.aborted) setVault(next);
    }).catch(() => {});
    const timer = setInterval(refresh, 30_000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('online', refresh); };
  }, [retry]);
  return <USD8Landing wallet={{ connected: false, connecting, onConnect }}
    scoreStatus="ready" pools={data.pools} poolLoading={!data.updatedAt && !error}
    savingsVault={vault} dataError={connectError || error} updatedAt={data.updatedAt}
    onRetry={() => setRetry(value => value + 1)} insuredTokenStates={data.insurance?.tokens}
    incident={data.incident} fileClaimUnavailableReason={CONNECT_WALLET_REASON} />;
}
