import WalletNoticeProvider, { NoticeMessage } from './components/WalletNotice.jsx';
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { zeroAddress } from 'viem';
import { useAccount, useChainId, useSwitchChain, useWriteContract } from 'wagmi';
import { CONNECT_WALLET_REASON } from './components/AvailabilityAction.jsx';
import { COVERED_PROTOCOL_ROWS } from './components/CoveredProtocolsTable.jsx';
const FileClaimDialog = lazy(() => import('./components/FileClaimDialog.jsx'));
import USD8Landing from './components/USD8Landing.jsx';
import { fetchLandingChainData, fetchLandingAnalytics, fetchScoreHistory } from './lib/chainData.js';
import { transactionClientFor } from './lib/transactionClient.js';
import { mergeSnapshot } from './lib/mergeSnapshot.js';
import { readErrorMessage, resourceErrorMessage } from './lib/readErrorMessage.js';
import { cachedData } from './lib/dataCache.js';
import { poolWriteAbi, treasuryWriteAbi, claimWriteAbi } from './lib/writeAbis.js';
import { erc1155Abi, erc20Abi, registryBoosterAbi } from './lib/abis.js';
import { formatUsdWad, groupDecimalString, percentOfWad, UNKNOWN_VALUE } from './lib/units.js';
import { poolHasEarnings } from './lib/livePoolEarnings.js';
import { fetchMorphoVault } from './lib/morphoApi.js';
import { getNetwork, getProtocolNetwork, PROTOCOL_CHAIN_ID } from './lib/networkConfig.js';
import { onForegroundRefresh } from './lib/foregroundRefresh.js';
import { claimApiConfigured, matchesSettlementContext } from './lib/claimContext.js';
const prepareIncidentOpen = (...args) => import('./lib/claimApi.js').then(api => api.prepareIncidentOpen(...args));
const prepareSettlement = (...args) => import('./lib/claimApi.js').then(api => api.prepareSettlement(...args));
import { claimLifecycle } from './lib/claimLifecycle.js';
import { fetchInsuranceScore } from './lib/scoreApi.js';
import { useActionStatus } from './lib/actionStatus.js';
import { isWaitingStatus, parseTokenAmount } from './lib/actionRules.js';
import {
  hasCurrentBalanceScoreRate,
  scoreBalanceRefreshKey,
  scoreSnapshotStale,
  scoreWithCurrentBalanceRates,
  scoreWithTokenBreakdown,
} from './lib/scoreRules.js';
import { matchesSettlementTopology, normalizedAddressOrder, settlementPayoutDetails } from './lib/settlement.js';
import { PoolActionDialog, Usd8ActionDialog } from './components/TransactionDialogs.jsx';
import { walletConnectorConfigured } from './lib/walletConnector.js';

function cachedInsuranceScore(account, { chainId, signal, fresh = false, refresh = false }) {
  return cachedData(['insurance-score', chainId, account.toLowerCase()], ({ signal: querySignal }) => fetchInsuranceScore(account, { chainId, signal: querySignal, ...(refresh || fresh ? { refresh: true } : {}) }), { signal, staleTime: fresh || refresh ? 0 : 60_000 });
}

const EMPTY_CHAIN_DATA = {
  activeIncidentId: '0',
  incident: null,
  claim: null,
  insurance: { tokens: {} },
  scoreBalances: null,
  scoreRatesPerSecond: null,
  scoreBalanceChangeTimestampMilliseconds: null,
  scoreBalancesSnapshotTimestampMilliseconds: 0,
  balances: {
    usdc: '0', usd8: '0', savings: '0', savingsAssets: '0', coverAsset: '0', poolShares: '0', insuredTokens: {},
  },
  pools: [],
};
const EMPTY_SAVINGS_VAULT = { balance: UNKNOWN_VALUE, apy: UNKNOWN_VALUE };
const CLAIM_TOKEN_ROWS = COVERED_PROTOCOL_ROWS;
const EMPTY_SCORE = {
  grossEarnedScore: '0',
  grossScorePerSecond: '0',
  availableScore: '0',
  maturingScorePerSecond: '0',
  usd8Score: '0',
  usd8ScorePerSecond: '0',
  sUsd8Score: '0',
  sUsd8ScorePerSecond: '0',
};
const WALLET_CONNECT_UNAVAILABLE_REASON = 'Wallet connection is unavailable until VITE_REOWN_PROJECT_ID is configured.';

export default function App({ autoConnect = false }) {
  const { address = '', isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { open } = useAppKit();
  const connected = isConnected && Boolean(address);
  const activeNetwork = getNetwork(chainId);
  const protocolNetwork = getProtocolNetwork(chainId);
  const walletScopeKey = [
    chainId,
    connected ? address.toLowerCase() : zeroAddress,
    protocolNetwork?.contracts.defiInsurance?.toLowerCase() || '',
  ].join(':');
  const protocolUnavailableReason = connected && !protocolNetwork
    ? `USD8 is not deployed on ${activeNetwork?.name || 'this network'}.`
    : '';
  const [connecting, setConnecting] = useState(false);
  const [quoteRate, setQuoteRate] = useState(null);
  useEffect(() => { if (autoConnect && !connected) open({ view: 'Connect' }); }, [autoConnect]);
  const [score, setScore] = useState(null);
  const [scoreStatus, setScoreStatus] = useState('idle');
  const [scoreError, setScoreError] = useState('');
  const [scoreRetry, setScoreRetry] = useState(0);
  const scoreRetryForcesRefresh = useRef(false);
  const scoreRefreshAttempt = useRef('');
  const [scoreRefreshCompletedKey, setScoreRefreshCompletedKey] = useState('');
  const [chainData, setChainData] = useState(EMPTY_CHAIN_DATA);
  const [chainDataStatus, setChainDataStatus] = useState('idle');
  const [dataError, setDataError] = useState('');
  const [operationBusy, setOperationBusy] = useState(false);
  const operation = useRef(null);
  const [transaction, setTransaction] = useState(null);
  const dataController = useRef(null);
  const enrichmentController = useRef(null);
  const foregroundRefreshing = useRef(false);
  const chainDataRequestGeneration = useRef(0);
  const [savingsVault, setSavingsVault] = useState(EMPTY_SAVINGS_VAULT);
  const [usd8Action, setUsd8Action] = useState(null);
  const [poolAction, setPoolAction] = useState(null);
  const [poolActionId, setPoolActionId] = useState('');
  const [claimSelection, setClaimToken] = useState(null);
  const claimToken = claimSelection?.walletScopeKey === walletScopeKey
    ? claimSelection.token
    : null;
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSettlement, setClaimSettlement] = useState(null);
  const claimAbortController = useRef(null);
  const claimAdvisory = useRef(null);
  const walletScopeRef = useRef(walletScopeKey);
  walletScopeRef.current = walletScopeKey;
  const inCurrentWalletScope = () => walletScopeRef.current === walletScopeKey;
  const [usd8Status, usd8StatusLine] = useActionStatus(inCurrentWalletScope);
  const [poolStatus, poolStatusLine] = useActionStatus(inCurrentWalletScope);
  // Claim flows check wallet scope and abort state themselves at each step.
  const [claimStatus, claimStatusLine] = useActionStatus();
  const claimContextKey = [
    walletScopeKey,
    chainData.incident?.id || '',
    chainData.claim?.id || '',
    chainData.incident?.root?.toLowerCase() || '',
    normalizedAddressOrder(chainData.incident?.poolAddrs).join(','),
    normalizedAddressOrder(chainData.incident?.poolOrder).join(','),
  ].join(':');
  const claimContextRef = useRef(claimContextKey);
  claimContextRef.current = claimContextKey;

  useLayoutEffect(() => {
    chainDataRequestGeneration.current += 1;
    dataController.current?.abort();
    enrichmentController.current?.abort();
    operation.current = null;
    setOperationBusy(false);
    setTransaction(null);
    setQuoteRate(null);
    claimAbortController.current?.abort();
    claimAbortController.current = null;
    setScore(null);
    setScoreError('');
    setScoreStatus(connected && activeNetwork?.scoreAvailable ? 'loading' : 'idle');
    setScoreRefreshCompletedKey('');
    setChainData(EMPTY_CHAIN_DATA);
    setChainDataStatus(protocolNetwork ? 'loading' : 'idle');
    setDataError('');
    setClaimToken(null);
    setClaimSettlement(null);
    claimStatusLine.clear();
    setClaimSubmitting(false);
    setUsd8Action(null);
    usd8StatusLine.clear();
    setPoolAction(null);
    poolStatusLine.clear();
  }, [walletScopeKey]);

  useEffect(() => {
    const controller = new AbortController();
    cachedData(['morpho-vault'], ({ signal }) => fetchMorphoVault({ signal }), { signal: controller.signal, staleTime: 300_000 })
      .then(setSavingsVault)
      .catch((error) => {
        if (error.name !== 'AbortError') setSavingsVault(EMPTY_SAVINGS_VAULT);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    chainDataRequestGeneration.current += 1;
    const requestedWalletScope = walletScopeKey;
    if (!activeNetwork) {
      setScore(null);
      setScoreStatus('idle');
      setScoreRefreshCompletedKey('');
      setChainData(EMPTY_CHAIN_DATA);
      setChainDataStatus('idle');
      return undefined;
    }

    if (protocolNetwork) loadChainData(walletScopeKey).catch(() => {});
    else { setChainData(EMPTY_CHAIN_DATA); setChainDataStatus('idle'); }
  }, [address, chainId, connected]);

  useEffect(() => {
    if (!connected || !activeNetwork?.scoreAvailable) return;
    const controller = new AbortController();
    const requestedWalletScope = walletScopeKey;
    setScoreStatus('loading');
    setScoreError('');
    cachedInsuranceScore(address, { chainId: activeNetwork.id, signal: controller.signal, refresh: scoreRetryForcesRefresh.current })
      .then(nextScore => {
        if (controller.signal.aborted || walletScopeRef.current !== requestedWalletScope) return;
        setScore(scoreWithTokenBreakdown(nextScore, activeNetwork.contracts));
        setScoreStatus('ready');
      })
      .catch(error => {
        if (controller.signal.aborted || walletScopeRef.current !== requestedWalletScope || error.name === 'AbortError') return;
        setScoreStatus('error');
        setScoreError('Insurance Score could not be loaded. Retry to get your available score.');
      });
    return () => controller.abort();
  }, [walletScopeKey, scoreRetry]);

  useEffect(() => {
    if (scoreStatus !== 'error') return;
    // Automatic recovery must reuse the daily snapshot: forcing a refresh re-runs the
    // multi-second cold replay that failed in the first place.
    const retry = () => {
      if (document.hidden) return;
      scoreRetryForcesRefresh.current = false;
      setScoreRetry(value => value + 1);
    };
    const timer = setInterval(retry, 30_000);
    window.addEventListener('online', retry);
    return () => { clearInterval(timer); window.removeEventListener('online', retry); };
  }, [scoreStatus]);

  useEffect(() => {
    const root = chainData.incident?.root;
    if (!claimToken || !chainData.claim || !protocolNetwork || !root || claimStatus.failed
        || root === `0x${'00'.repeat(32)}`
        || (claimSettlement?.contextKey === claimContextKey
          && matchesSettlementContext(claimSettlement, chainData.incident.id, root)
          && matchesSettlementTopology(claimSettlement.value, chainData.incident))) return undefined;
    const requestedContextKey = claimContextKey;
    const controller = new AbortController();
    claimStatusLine.show('Loading proof-backed payout details.');
    prepareSettlement(chainData.incident.id, {
      chainId: protocolNetwork.id,
      registry: protocolNetwork.contracts.registry,
      defiInsurance: protocolNetwork.contracts.defiInsurance,
      expectedRoot: root,
      expectedPoolAddrs: chainData.incident.poolAddrs,
      expectedPoolOrder: chainData.incident.poolOrder,
      signal: controller.signal,
    }).then((value) => {
      if (controller.signal.aborted || claimContextRef.current !== requestedContextKey) return;
      setClaimSettlement({
        contextKey: requestedContextKey,
        incidentId: chainData.incident.id,
        claimId: chainData.claim.id,
        root,
        value,
      });
      claimStatusLine.clear();
    }).catch((error) => {
      if (claimContextRef.current === requestedContextKey && error?.name !== 'AbortError') {
        claimStatusLine.fail(error?.message || 'Payout details are temporarily unavailable.');
      }
    });
    return () => controller.abort();
  }, [claimToken, claimContextKey, protocolNetwork, claimSettlement?.contextKey, claimStatus.failed]);

  useEffect(() => {
    if (!connected || !activeNetwork?.scoreAvailable || scoreStatus !== 'ready') {
      scoreRefreshAttempt.current = '';
      setScoreRefreshCompletedKey('');
      return undefined;
    }
    const refreshKey = scoreBalanceRefreshKey(
      score,
      chainData,
      activeNetwork.contracts,
      activeNetwork.id,
      address,
    );
    if (!refreshKey) {
      scoreRefreshAttempt.current = '';
      setScoreRefreshCompletedKey('');
      return undefined;
    }
    if (scoreRefreshAttempt.current === refreshKey) return undefined;
    scoreRefreshAttempt.current = refreshKey;
    setScoreRefreshCompletedKey('');

    const requestedWalletScope = walletScopeKey;
    const controller = new AbortController();
    cachedInsuranceScore(address, {
      chainId: activeNetwork.id,
      refresh: true,
      signal: controller.signal,
    })
      .then((nextScore) => {
        if (walletScopeRef.current !== requestedWalletScope
            || scoreRefreshAttempt.current !== refreshKey) return;
        setScore(scoreWithTokenBreakdown(nextScore, activeNetwork.contracts));
        setScoreError('');
      })
      .catch((error) => {
        if (walletScopeRef.current === requestedWalletScope
            && scoreRefreshAttempt.current === refreshKey
            && error.name !== 'AbortError') {
          setScoreError('Insurance Score could not be refreshed. Retry to update your available score.');
        }
      })
      .finally(() => {
        if (walletScopeRef.current === requestedWalletScope
            && scoreRefreshAttempt.current === refreshKey) {
          setScoreRefreshCompletedKey(refreshKey);
        }
      });
    return () => controller.abort();
  }, [address, connected, activeNetwork, chainData.scoreBalances, score, scoreStatus, walletScopeKey]);

  async function connect() {
    if (!walletConnectorConfigured) return;
    setConnecting(true);
    try {
      await open({ view: 'Connect' });
    } catch (error) {
      setDataError(error?.shortMessage || error?.message || 'Wallet connection failed.');
    } finally {
      setConnecting(false);
    }
  }

  function assertCurrentWalletScope(expectedWalletScope = walletScopeKey) {
    if (walletScopeRef.current === expectedWalletScope) return;
    const error = new Error('Wallet account or network changed. Review the current state and try again.');
    error.name = 'WalletScopeChangedError';
    throw error;
  }

  async function runOperation(run) {
    if (operation.current) return;
    const id = Symbol('operation');
    operation.current = id;
    setTransaction(null);
    usd8StatusLine.clear();
    poolStatusLine.clear();
    claimStatusLine.clear();
    const controller = new AbortController();
    claimAbortController.current = controller;
    setOperationBusy(true);
    try { return await run(); }
    finally {
      if (claimAbortController.current === controller) claimAbortController.current = null;
      if (operation.current === id) { operation.current = null; setOperationBusy(false); }
    }
  }

  async function loadChainData(expectedWalletScope = walletScopeKey, options = {}) {
    assertCurrentWalletScope(expectedWalletScope);
    if (!protocolNetwork) return;
    const generation = ++chainDataRequestGeneration.current;
    dataController.current?.abort();
    const controller = new AbortController();
    dataController.current = controller;
    const current = () => !controller.signal.aborted && generation === chainDataRequestGeneration.current
      && walletScopeRef.current === expectedWalletScope;
    setChainDataStatus('loading');
    let enrichmentStarted = false;
    const apply = (next, partial = false) => {
      if (!current()) return;
      setChainData(previous => mergeSnapshot(previous, partial && !next.incidentReady
        ? { ...next, incident: previous.incident, claim: previous.claim } : next));
      setChainDataStatus(partial ? 'partial' : 'ready');
      setDataError(resourceErrorMessage(next.resourceErrors, 'Some balances or protocol data could not be updated. Retry to update it.'));
    };
    try {
      const next = await fetchLandingChainData(connected ? address : zeroAddress, protocolNetwork.id, {
        ...options, signal: controller.signal, onPartial: partial => {
          apply(partial, true);
          if (enrichmentStarted) return;
          enrichmentStarted = true;
          if (enrichmentController.current) return;
          const enrichment = new AbortController();
          enrichmentController.current = enrichment;
          const valid = () => walletScopeRef.current === expectedWalletScope && !enrichment.signal.aborted;
          const analyticsRequest = fetchLandingAnalytics(partial, address, protocolNetwork.id, { signal: enrichment.signal }).then(extra => {
            if (valid()) setChainData(previous => ({ ...previous, pools: previous.pools.map(pool => ({ ...pool, ...extra.pools.find(p => p.id === pool.id) })) }));
          }).catch(() => {});
          const historyRequest = fetchScoreHistory(partial, connected ? address : zeroAddress, protocolNetwork.id, { signal: enrichment.signal }).then(timestamps => {
            if (valid() && timestamps) setChainData(previous => previous.scoreBalances?.usd8 === partial.scoreBalances?.usd8 && previous.scoreBalances?.savings === partial.scoreBalances?.savings ? { ...previous, scoreBalanceChangeTimestampMilliseconds: timestamps } : previous);
          }).catch(() => {});
          Promise.allSettled([analyticsRequest, historyRequest]).then(() => {
            if (enrichmentController.current === enrichment) enrichmentController.current = null;
          });
        },
      });
      apply(next);
      return current() ? next : undefined;
    } catch (error) {
      if (current()) {
        setChainDataStatus('error');
        setChainData(previous => previous.updatedAt ? previous : { ...previous, balances: { usdc: UNKNOWN_VALUE, usd8: UNKNOWN_VALUE, savings: UNKNOWN_VALUE, savingsAssets: UNKNOWN_VALUE, insuredTokens: {} } });
        setDataError(readErrorMessage(error));
      }
      throw error;
    }
  }

  function refreshChainData(expectedWalletScope = walletScopeKey, options = {}) {
    return loadChainData(expectedWalletScope, { refresh: true, ...options });
  }

  useEffect(() => {
    const refresh = () => {
      if (document.hidden || foregroundRefreshing.current || operation.current || !protocolNetwork) return;
      foregroundRefreshing.current = true;
      loadChainData(walletScopeKey).catch(() => {}).finally(() => { foregroundRefreshing.current = false; });
    };
    const stopRefreshing = onForegroundRefresh(refresh);
    return () => {
      stopRefreshing();
      dataController.current?.abort();
      enrichmentController.current?.abort();
    };
  }, [walletScopeKey]);

  // Pools come from config, so their cards render immediately; the chain read
  // only fills in the numbers.
  const displayedPools = chainData.pools?.length
    ? chainData.pools
    : (protocolNetwork?.contracts.coverPools || []).map((pool) => ({
      ...pool,
      assetBalance: '0',
      apy: null,
      tvl: null,
      capacityPercent: null,
      capacityUncapped: false,
      deposit: '0',
      earnings: '0',
      hasEarnings: false,
      shareDecimals: 21,
    }));
  const activePool = chainData.pools?.find((pool) => pool.id === poolActionId)
    || chainData.pools?.[0]
    || null;


  function selectedPool(network) {
    const pool = network.contracts.coverPools.find((entry) => entry.id === poolActionId)
      || network.contracts.coverPools[0];
    if (!pool) throw new Error('No cover pool is configured on this network.');
    return pool;
  }

  function requireProtocolNetwork() {
    if (!protocolNetwork) throw new Error(protocolUnavailableReason || 'USD8 is not deployed on the selected network.');
    return protocolNetwork;
  }

  async function submitTransaction(
    request,
    pendingMessage,
    setStatus,
    expectedWalletScope = walletScopeKey,
    minBlock,
  ) {
    assertCurrentWalletScope(expectedWalletScope);
    const network = requireProtocolNetwork();
    const client = transactionClientFor(network.id);
    setTransaction({ phase: 'wallet', message: pendingMessage, chainId: network.id });
    setStatus(pendingMessage);
    try {
    let blockNumber;
    if (minBlock !== undefined) {
      // Pin the estimate after approvals without freezing it before TEE verification.
      blockNumber = await client.getBlockNumber({ cacheTime: 0 });
      assertCurrentWalletScope(expectedWalletScope);
      if (blockNumber < minBlock) blockNumber = minBlock;
    }
    const estimatedGas = await client.estimateContractGas({ account: address, ...request, blockNumber });
    assertCurrentWalletScope(expectedWalletScope);
    const gas = estimatedGas + estimatedGas / 2n;
    const hash = await writeContractAsync({ account: address, chainId: network.id, ...request, gas });
    if (!hash) throw new Error('Transaction cancelled in your wallet.');
    if (walletScopeRef.current === expectedWalletScope) {
      setTransaction({ phase: 'pending', hash, chainId: network.id });
      setStatus(`Transaction submitted: ${hash.slice(0, 10)}…${hash.slice(-4)}`);
    }
    let receipt;
    try {
      receipt = await client.waitForTransactionReceipt({ hash });
    } catch (cause) {
      const error = new Error('The transaction was submitted, but its confirmation could not be checked. View the transaction status before retrying.', { cause });
      error.name = 'TransactionConfirmationError';
      throw error;
    }
    if (receipt.status !== 'success') throw new Error('Transaction reverted.');
    if (walletScopeRef.current === expectedWalletScope) {
      setTransaction({ phase: 'confirmed', hash, chainId: network.id });
      if (!['approve', 'setApprovalForAll'].includes(request.functionName)) {
        const pool = network.contracts.coverPools.find(pool => pool.address.toLowerCase() === request.address.toLowerCase());
        const resources = pool ? ['account-balances', `account-pool:${pool.id}`, `pool:${pool.id}`, 'head']
          : ['mintUSD8', 'redeemUSD8'].includes(request.functionName) ? ['account-balances'] : undefined;
        try { await refreshChainData(expectedWalletScope, { resources, minBlock: receipt.blockNumber }); }
        catch { if (walletScopeRef.current === expectedWalletScope) setTransaction({ phase: 'confirmed', hash, chainId: network.id, refreshError: true }); }
      }
    }
    return receipt;
    } catch (error) {
      if (walletScopeRef.current === expectedWalletScope) setTransaction(previous => ({ ...previous, phase: 'failed', message: error.shortMessage || error.message }));
      throw error;
    }
  }

  async function depositToPool(raw) {
    const network = requireProtocolNetwork();
    const client = transactionClientFor(network.id);
    const pool = selectedPool(network);
    const amount = parseTokenAmount(raw, 18);
    if (amount <= 0n) throw new Error('Deposit amount must be positive.');
    const allowance = await client.readContract({
      address: pool.asset,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [address, pool.address],
    });
    if (allowance < amount) {
      await submitTransaction({
        address: pool.asset,
        abi: erc20Abi,
        functionName: 'approve',
        args: [pool.address, amount],
      }, `Approve ${pool.assetSymbol} in your wallet.`, poolStatusLine.show);
    }
    await submitTransaction({
      address: pool.address,
      abi: poolWriteAbi,
      functionName: 'deposit',
      args: [amount, address],
    }, 'Confirm the cover-pool deposit in your wallet.', poolStatusLine.show);
    poolStatusLine.show(`Deposit confirmed on ${network.name}.`);
    return true;
  }

  async function startPoolCooldown(raw) {
    const network = requireProtocolNetwork();
    const pool = selectedPool(network);
    const shares = parseTokenAmount(raw, activePool?.shareDecimals ?? 21);
    if (shares <= 0n) throw new Error('Enter a share amount greater than zero.');
    const expectedWalletScope = walletScopeKey;
    const balance = await transactionClientFor(network.id).readContract({ address: pool.address, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
    assertCurrentWalletScope(expectedWalletScope);
    if (shares > balance) throw new Error('Your pool share balance has changed. Refresh the amount and try again.');
    await submitTransaction({
      address: pool.address,
      abi: poolWriteAbi,
      functionName: 'requestRedeem',
      args: [shares],
    }, 'Confirm the cooldown request in your wallet.', poolStatusLine.show);
    poolStatusLine.show('Cooldown started. This amount stops earning and may decrease if the pool pays claims before your exit settles.');
    return true;
  }

  async function completePoolWithdrawal() {
    const network = requireProtocolNetwork();
    await submitTransaction({
      address: selectedPool(network).address,
      abi: poolWriteAbi,
      functionName: 'completeRedeem',
      args: [address],
    }, 'Complete the matured withdrawal in your wallet.', poolStatusLine.show);
    poolStatusLine.show(`Withdrawal completed on ${network.name}.`);
    return true;
  }

  async function claimPoolRewards() {
    const network = requireProtocolNetwork();
    await submitTransaction({
      address: selectedPool(network).address,
      abi: poolWriteAbi,
      functionName: 'claimReward',
      args: [],
    }, 'Confirm the USD8 reward claim in your wallet.', poolStatusLine.show);
    poolStatusLine.show(`Rewards claimed on ${network.name}.`);
    return true;
  }

  function openPoolAction(action, poolId) {
    if (!connected || !protocolNetwork) return;
    poolStatusLine.clear();
    setPoolActionId(poolId);
    setPoolAction(action);
  }

  async function submitPoolAction(action, raw) {
    try {
      poolStatusLine.clear();
      if (action === 'deposit') await depositToPool(raw);
      else if (action === 'startCooldown') await startPoolCooldown(raw);
      else if (action === 'withdraw') await completePoolWithdrawal();
      else if (action === 'claimReward') await claimPoolRewards();
    } catch (error) {
      poolStatusLine.fail(error?.shortMessage || error?.message || 'Transaction failed.');
    }
  }

  function fileClaimAction(row) {
    if (!connected) return;
    claimStatusLine.clear();
    setClaimToken({ walletScopeKey, token: row });
  }

  async function submitClaim({ token, amount: rawAmount, scoreToSpend: rawScore, boosterAmount: rawBoosters }) {
    if (claimSubmitting) return;
    if (activeIncidentDetailsLoading) {
      throw new Error('Incident details are still loading. Refresh before filing a claim.');
    }
    const expectedWalletScope = walletScopeKey;
    assertCurrentWalletScope(expectedWalletScope);
    const controller = new AbortController();
    claimAbortController.current = controller;
    const assertCurrentClaimOperation = () => {
      assertCurrentWalletScope(expectedWalletScope);
      if (controller.signal.aborted || claimAbortController.current !== controller) {
        const error = new Error('Wallet account or network changed.');
        error.name = 'AbortError';
        throw error;
      }
    };
    const setCurrentClaimStatus = (message) => {
      assertCurrentClaimOperation();
      claimStatusLine.show(message);
    };
    let claimStep = 'requirements';
    let minBlock = 0n;
    const confirmedApprovals = [];
    const finishApproval = (label, receipt) => {
      assertCurrentClaimOperation();
      if (receipt.blockNumber > minBlock) minBlock = receipt.blockNumber;
      confirmedApprovals.push(label);
      claimStep = 'requirements';
      // An approval hash must not be attached to a later offchain failure.
      setTransaction(null);
    };
    setTransaction(null);
    setClaimSubmitting(true);
    claimStatusLine.show('Checking current incident and claim requirements.');
    try {
      const network = requireProtocolNetwork();
      const { contracts } = network;
      const client = transactionClientFor(network.id);
      const insuredToken = contracts.insuredTokens?.[token];
      if (!insuredToken) throw new Error('This token is not enabled for claims on the selected network.');
      const claimTokenSymbol = CLAIM_TOKEN_ROWS.find((row) => row.id === token)?.symbol || token;
      const ensureCurrentlyInsured = async () => {
        const listed = await client.readContract({
          address: contracts.defiInsurance,
          abi: claimWriteAbi,
          functionName: 'isInsuredToken',
          args: [insuredToken],
        });
        if (listed !== true) {
          throw new Error(`${claimTokenSymbol} is no longer enabled for new claims on ${network.name}.`);
        }
      };
      await ensureCurrentlyInsured();
      assertCurrentClaimOperation();

      const insuredTokenAmount = parseTokenAmount(rawAmount, 18);
      const scoreToSpend = parseTokenAmount(rawScore, 18);
      if (!/^\d+$/.test(String(rawBoosters ?? ''))) throw new Error('Please enter a valid Booster amount.');
      const boosterAmount = BigInt(rawBoosters);
      if (insuredTokenAmount <= 0n) throw new Error('Insured token amount must be positive.');
      if (scoreToSpend <= 0n) throw new Error('Insurance score to spend must be positive.');

      let activeIncidentId = await client.readContract({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'activeIncidentId',
      });
      assertCurrentClaimOperation();
      if (activeIncidentId !== 0n
        && String(actionableIncident?.id ?? '') !== activeIncidentId.toString()) {
        throw new Error('The active incident changed. Refresh its details before filing a claim.');
      }
      const claimBondAmount = await client.readContract({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'claimBondAmount',
      });
      assertCurrentClaimOperation();
      const usd8Balance = parseTokenAmount(String(chainData.balances.usd8).replace(/,/g, ''), 18);
      const usd8Required = insuredToken.toLowerCase() === contracts.usd8.toLowerCase()
        ? insuredTokenAmount + claimBondAmount
        : claimBondAmount;
      if (usd8Required > usd8Balance) {
        throw new Error(insuredToken.toLowerCase() === contracts.usd8.toLowerCase()
          ? 'Insufficient USD8 balance for the insured amount and claim bond.'
          : 'Insufficient USD8 balance for the claim bond.');
      }
      let referenceBlock = 0n;
      let signature = '0x';
      let authorization = null;
      const prepareFirstIncident = async () => {
        claimStep = 'verification';
        setCurrentClaimStatus('Verifying incident in the TEE. First claim may take several minutes, please wait.');
        return prepareIncidentOpen(insuredToken, {
          chainId: network.id,
          registry: contracts.registry,
          defiInsurance: contracts.defiInsurance,
          signal: controller.signal,
          previousAdvisory: claimAdvisory.current,
          onAdvisory: (advisory) => { assertCurrentClaimOperation(); claimAdvisory.current = advisory; },
          onStatus: setCurrentClaimStatus,
        });
      };
      const approvals = insuredToken.toLowerCase() === contracts.usd8.toLowerCase()
        ? [[contracts.usd8, insuredTokenAmount + claimBondAmount]]
        : [
          [insuredToken, insuredTokenAmount],
          [contracts.usd8, claimBondAmount],
        ];
      // Do not launch approval side effects from a stale landing snapshot.
      await ensureCurrentlyInsured();
      assertCurrentClaimOperation();
      for (const [approvalToken, requiredAmount] of approvals) {
        const allowance = await client.readContract({
          address: approvalToken,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address, contracts.defiInsurance],
        });
        assertCurrentClaimOperation();
        if (allowance < requiredAmount) {
          claimStep = 'token-approval';
          const receipt = await submitTransaction({
            address: approvalToken,
            abi: erc20Abi,
            functionName: 'approve',
            args: [contracts.defiInsurance, requiredAmount],
          }, 'Approve token in your wallet.', setCurrentClaimStatus, expectedWalletScope);
          finishApproval('Token approval', receipt);
        }
      }

      if (boosterAmount > 0n) {
        const [boosterCollection, boosterTokenId] = await client.readContract({
          address: contracts.registry,
          abi: registryBoosterAbi,
          functionName: 'boosterConfig',
        });
        assertCurrentClaimOperation();
        if (boosterCollection === zeroAddress) throw new Error('Boosters are not enabled for claims.');
        const currentBoosterBalance = await client.readContract({
          address: boosterCollection,
          abi: erc1155Abi,
          functionName: 'balanceOf',
          args: [address, boosterTokenId],
        });
        assertCurrentClaimOperation();
        if (currentBoosterBalance < boosterAmount) throw new Error('Insufficient Booster balance.');
        const boostersApproved = await client.readContract({
          address: boosterCollection,
          abi: erc1155Abi,
          functionName: 'isApprovedForAll',
          args: [address, contracts.defiInsurance],
        });
        assertCurrentClaimOperation();
        if (!boostersApproved) {
          claimStep = 'booster-approval';
          const receipt = await submitTransaction({
            address: boosterCollection,
            abi: erc1155Abi,
            functionName: 'setApprovalForAll',
            args: [contracts.defiInsurance, true],
          }, 'Approve Boosters in your wallet.', setCurrentClaimStatus, expectedWalletScope);
          finishApproval('Booster approval', receipt);
        }
      }

      // Opening authorizations are block-bounded. Obtain one only after every
      // prerequisite approval is confirmed so wallet latency cannot age it out.
      setCurrentClaimStatus('Checking the incident before filing your claim.');
      await ensureCurrentlyInsured();
      assertCurrentClaimOperation();
      activeIncidentId = await client.readContract({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'activeIncidentId',
      });
      assertCurrentClaimOperation();
      if (activeIncidentId === 0n) {
        if (!authorization) authorization = await prepareFirstIncident();
        assertCurrentClaimOperation();
        claimStep = 'requirements';
        activeIncidentId = await client.readContract({
          address: contracts.defiInsurance,
          abi: claimWriteAbi,
          functionName: 'activeIncidentId',
        });
        assertCurrentClaimOperation();
        if (activeIncidentId === 0n) {
          referenceBlock = authorization.referenceBlock;
          signature = authorization.signature;
          if (referenceBlock >= minBlock) minBlock = referenceBlock + 1n;
        }
      }

      claimStep = 'submission';
      await submitTransaction({
        address: contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'fileClaim',
        args: [insuredToken, insuredTokenAmount, scoreToSpend, boosterAmount, referenceBlock, signature],
      }, 'Confirm the claim in your wallet.', setCurrentClaimStatus, expectedWalletScope, minBlock);
      assertCurrentClaimOperation();
      if (walletScopeRef.current === expectedWalletScope) {
        claimStatusLine.show(`Claim confirmed on ${network.name}.`);
      }
    } catch (error) {
      if (claimAbortController.current === controller
        && walletScopeRef.current === expectedWalletScope
        && error?.name !== 'AbortError') {
        let stepLabel = {
          requirements: 'Claim requirements check failed',
          'token-approval': 'Token approval failed',
          'booster-approval': 'Booster approval failed',
          verification: 'Claim verification failed',
          submission: 'Claim transaction failed',
        }[claimStep];
        if (error?.name === 'TransactionConfirmationError') {
          stepLabel = stepLabel.replace('failed', 'confirmation unavailable');
        }
        let reason = error?.shortMessage || error?.message || 'Please try again.';
        if (/failed to fetch|fetch failed|networkerror|load failed/i.test(reason)) {
          reason = claimStep === 'verification'
            ? 'Could not reach the claim verification service. Check your connection and try again.'
            : 'Could not connect to the blockchain. Check your connection and try again.';
        }
        const approvals = [...new Set(confirmedApprovals)].map(label => `${label} confirmed.`).join(' ');
        const outcome = claimStep !== 'submission' ? 'No claim transaction was submitted.' : '';
        if (error?.name === 'ClaimServiceBusyError') {
          claimStatusLine.show([reason, approvals, outcome].filter(Boolean).join(' '));
        } else {
          claimStatusLine.fail([`${stepLabel}: ${reason}`, approvals, outcome].filter(Boolean).join(' '));
        }
      }
    } finally {
      if (claimAbortController.current === controller) {
        claimAbortController.current = null;
        if (walletScopeRef.current === expectedWalletScope) setClaimSubmitting(false);
      }
    }
  }

  async function cancelClaim() {
    const expectedWalletScope = walletScopeKey;
    try {
      assertCurrentWalletScope(expectedWalletScope);
      const network = requireProtocolNetwork();
      const initialClaimId = chainData.claim?.id;
      const initialIncidentId = chainData.incident?.id;
      claimStatusLine.clear();
      const latestChainData = await refreshChainData(expectedWalletScope);
      const latestClaim = latestChainData?.claim;
      if (!latestClaim) throw new Error('This account no longer has an unresolved claim to cancel.');
      if (latestClaim.resolved) throw new Error('This claim has already been resolved.');
      if (latestClaim.id !== initialClaimId || latestChainData.incident?.id !== initialIncidentId) {
        throw new Error('The active claim changed. Review the current claim before cancelling.');
      }
      if (claimLifecycle(latestChainData.incident).state !== 'claim-open') {
        throw new Error('This claim can no longer be cancelled. Review its current lifecycle state.');
      }
      assertCurrentWalletScope(expectedWalletScope);
      await submitTransaction({
        address: network.contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'cancelClaim',
        args: [],
      }, 'Confirm claim cancellation in your wallet.', claimStatusLine.show, expectedWalletScope);
      if (walletScopeRef.current !== expectedWalletScope) return;
      setClaimToken(null);
      claimStatusLine.clear();
    } catch (error) {
      if (walletScopeRef.current !== expectedWalletScope) return;
      claimStatusLine.fail(error?.shortMessage || error?.message || 'Claim cancellation failed.');
    }
  }

  async function settlementArtifact() {
    const requestedContextKey = claimContextKey;
    if (claimSettlement?.contextKey === requestedContextKey
        && matchesSettlementContext(claimSettlement, chainData.incident?.id, chainData.incident?.root)
        && matchesSettlementTopology(claimSettlement.value, chainData.incident)) {
      return claimSettlement.value;
    }
    const network = requireProtocolNetwork();
    const value = await prepareSettlement(chainData.incident.id, {
      signal: claimAbortController.current?.signal,
      chainId: network.id,
      registry: network.contracts.registry,
      defiInsurance: network.contracts.defiInsurance,
      expectedRoot: chainData.incident.root,
      expectedPoolAddrs: chainData.incident.poolAddrs,
      expectedPoolOrder: chainData.incident.poolOrder,
    });
    if (claimContextRef.current !== requestedContextKey) {
      const error = new Error('Wallet account or claim changed while payout details were loading.');
      error.name = 'AbortError';
      throw error;
    }
    setClaimSettlement({
      contextKey: requestedContextKey,
      incidentId: chainData.incident.id,
      claimId: chainData.claim?.id ?? null,
      root: chainData.incident.root,
      value,
    });
    return value;
  }

  async function settleClaim() {
    const expectedWalletScope = walletScopeKey;
    try {
      assertCurrentWalletScope(expectedWalletScope);
      const network = requireProtocolNetwork();
      const initialIncidentId = chainData.incident?.id;
      const initialRoot = chainData.incident?.root;
      const beforePreparation = await refreshChainData(expectedWalletScope);
      if (beforePreparation?.incident?.id !== initialIncidentId
          || beforePreparation?.incident?.root?.toLowerCase() !== initialRoot?.toLowerCase()
          || claimLifecycle(beforePreparation?.incident).state !== 'settlement-open') {
        throw new Error('The incident settlement state changed while the settlement was prepared.');
      }
      assertCurrentWalletScope(expectedWalletScope);
      claimStatusLine.show('Preparing the TEE settlement. This may take several minutes.');
      const settlement = await settlementArtifact();
      const latestChainData = await refreshChainData(expectedWalletScope);
      const latestIncident = latestChainData?.incident;
      if (latestIncident?.id !== initialIncidentId
          || latestIncident?.root?.toLowerCase() !== initialRoot?.toLowerCase()
          || claimLifecycle(latestIncident).state !== 'settlement-open'
          || !matchesSettlementTopology(settlement, latestIncident)) {
        throw new Error('The incident settlement state changed while the settlement was prepared.');
      }
      assertCurrentWalletScope(expectedWalletScope);
      await submitTransaction({
        address: network.contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'settleIncident',
        args: [settlement.root, settlement.poolPayouts, settlement.signature],
      }, 'Confirm claim settlement in your wallet.', claimStatusLine.show, expectedWalletScope);
      if (walletScopeRef.current === expectedWalletScope) {
        claimStatusLine.show(`Settlement confirmed on ${network.name}.`);
      }
    } catch (error) {
      if (walletScopeRef.current !== expectedWalletScope) return;
      claimStatusLine.fail(error?.shortMessage || error?.message || 'Claim settlement failed.');
    }
  }

  async function finalizeCurrentClaim(acceptPayout) {
    const expectedWalletScope = walletScopeKey;
    try {
      assertCurrentWalletScope(expectedWalletScope);
      const network = requireProtocolNetwork();
      const initialClaimId = chainData.claim?.id;
      const initialIncidentId = chainData.incident?.id;
      const initialRoot = chainData.incident?.root;
      const lifecycle = claimLifecycle(chainData.incident);
      claimStatusLine.clear();
      const settlement = lifecycle.state === 'payout-open' || lifecycle.state === 'payout-expired'
        ? await settlementArtifact()
        : null;
      const latestChainData = await refreshChainData(expectedWalletScope);
      const latestClaim = latestChainData?.claim;
      const latestIncident = latestChainData?.incident;
      if (!latestClaim) throw new Error('This account no longer has an unresolved claim to finalize.');
      if (latestClaim.resolved) throw new Error('This claim has already been resolved.');
      if (latestClaim.id !== initialClaimId || latestIncident?.id !== initialIncidentId) {
        throw new Error('The active claim changed while payout details were loading. Review the current claim and try again.');
      }

      const latestLifecycle = claimLifecycle(latestIncident);
      let row = null;
      if (lifecycle.state === 'payout-open' || lifecycle.state === 'payout-expired') {
        if (latestIncident.root?.toLowerCase() !== initialRoot?.toLowerCase()
            || (latestLifecycle.state !== 'payout-open' && latestLifecycle.state !== 'payout-expired')
            || !matchesSettlementTopology(settlement, latestIncident)) {
          throw new Error('The payout state changed while details were loading. Review the current claim and try again.');
        }
        row = settlement.rows.find((candidate) => candidate.claimId === latestClaim.id);
        if (!row) throw new Error('The settlement does not contain this claim.');
        if (row.eligibleBoosterAmount > BigInt(latestClaim.boosterAmount)) {
          throw new Error('The settlement booster amount exceeds this claim\'s escrow.');
        }
      }
      assertCurrentWalletScope(expectedWalletScope);
      await submitTransaction({
        address: network.contracts.defiInsurance,
        abi: claimWriteAbi,
        functionName: 'finalizeClaim',
        args: row
          ? [BigInt(latestClaim.id), acceptPayout, row.amounts, row.scoreSpent, row.boostedScore, row.eligibleAmount, row.eligibleBoosterAmount, row.proof]
          : [BigInt(latestClaim.id), false, [], 0n, 0n, 0n, 0n, []],
      }, acceptPayout ? 'Confirm payout acceptance in your wallet.' : 'Confirm token return in your wallet.', claimStatusLine.show, expectedWalletScope);
      if (walletScopeRef.current !== expectedWalletScope) return;
      setClaimToken(null);
      claimStatusLine.clear();
    } catch (error) {
      if (walletScopeRef.current !== expectedWalletScope) return;
      const messages = {
        FinalizeNotOpen: 'Payout acceptance is not open. Refresh the claim status to check the payout or token-return window.',
        InvalidProof: 'The settlement proof is invalid. Refresh payout details before trying again.',
        EligibleExceedsEscrow: 'The settlement eligibility exceeds the escrowed tokens or boosters. Refresh payout details before trying again.',
        InvalidBoostedScore: 'The settlement payout weight does not match its eligible boosters. Refresh payout details before trying again.',
        UnauthorizedClaim: 'This wallet cannot finalize this claim. Check the connected account and refresh.',
        ClaimAlreadyResolved: 'This claim has already been resolved. Refresh the claim status.',
        PayoutCapExceeded: 'The payout exceeds the pool’s remaining payout allowance. Refresh payout details before trying again.',
      };
      let reason;
      const seen = new Set();
      for (let cause = error; cause && !seen.has(cause); cause = cause.cause) {
        seen.add(cause);
        reason = messages[cause.data?.errorName];
        if (reason) break;
      }
      claimStatusLine.fail(reason || error?.shortMessage || error?.message || 'Claim finalization failed.');
    }
  }

  async function openUsd8Action(action) {
    if (!connected || !protocolNetwork) return;
    usd8StatusLine.clear();
    setUsd8Action(action);
    if (action === 'redeem') {
      setQuoteRate(null);
      try {
        const rate = await transactionClientFor(protocolNetwork.id).readContract({ address: protocolNetwork.contracts.treasury, abi: treasuryWriteAbi, functionName: 'usd8ToUsdcRate' });
        if (walletScopeRef.current === walletScopeKey) setQuoteRate(rate);
      } catch { usd8StatusLine.show('Could not load the redemption quote. Reopen the dialog to retry.'); }
    }
  }

  async function submitUsd8Action(action, raw) {
    try {
      usd8StatusLine.clear();
      const network = requireProtocolNetwork();
      const client = transactionClientFor(network.id);
      const { contracts } = network;
      const amount = parseTokenAmount(raw, action === 'mint' ? 6 : 18);
      if (amount <= 0n) throw new Error(`${action === 'mint' ? 'Mint' : 'Redemption'} amount must be positive.`);
      if (action === 'redeem') {
        const rate = await client.readContract({
          address: contracts.treasury,
          abi: treasuryWriteAbi,
          functionName: 'usd8ToUsdcRate',
        });
        assertCurrentWalletScope(walletScopeKey);
        if (rate !== quoteRate) { setQuoteRate(rate); usd8StatusLine.show('The redemption quote changed. Review the updated output and submit again.'); return; }
        const minUsdcOut = amount * rate / 1_000_000_000_000_000_000_000_000_000_000n;
        await submitTransaction({
          address: contracts.treasury,
          abi: treasuryWriteAbi,
          functionName: 'redeemUSD8',
          args: [amount, minUsdcOut],
        }, 'Confirm the USD8 redemption in your wallet.', usd8StatusLine.show);
        usd8StatusLine.show(`Redemption confirmed on ${network.name}.`);
        return;
      }

      const allowance = await client.readContract({
        address: contracts.usdc,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, contracts.treasury],
      });
      if (allowance < amount) {
        await submitTransaction({
          address: contracts.usdc,
          abi: erc20Abi,
          functionName: 'approve',
          args: [contracts.treasury, amount],
        }, 'Approve USDC in your wallet.', usd8StatusLine.show);
      }
      await submitTransaction({
        address: contracts.treasury,
        abi: treasuryWriteAbi,
        functionName: 'mintUSD8',
        args: [amount],
      }, 'Confirm the USD8 mint in your wallet.', usd8StatusLine.show);
      usd8StatusLine.show(`Mint confirmed on ${network.name}.`);
    } catch (error) {
      usd8StatusLine.fail(error?.shortMessage || error?.message || 'Transaction failed.');
    }
  }

  function dataUnavailableFor(resources) {
    return chainDataStatus === 'error' || resources.some(resource => chainData.resourceErrors?.[resource])
      ? 'Refresh unavailable data before continuing.' : '';
  }

  const scoreNeedsBalanceRefresh = connected
    && scoreStatus === 'ready'
    && chainDataStatus === 'ready'
    && scoreSnapshotStale(score, chainData, activeNetwork?.contracts);
  const canSimulateCurrentScore = connected
    && chainDataStatus === 'ready'
    && chainData.scoreBalancesSnapshotTimestampMilliseconds > 0
    && hasCurrentBalanceScoreRate(chainData.scoreRatesPerSecond);
  const currentScoreRefreshKey = scoreNeedsBalanceRefresh
    ? scoreBalanceRefreshKey(score, chainData, activeNetwork.contracts, activeNetwork.id, address)
    : '';
  const displayedScoreStatus = canSimulateCurrentScore && scoreStatus !== 'ready'
    ? 'ready'
    : connected
    && protocolNetwork
    && (chainDataStatus === 'loading'
      || (scoreStatus === 'ready'
        && scoreNeedsBalanceRefresh
        && scoreRefreshCompletedKey !== currentScoreRefreshKey))
    ? 'loading'
    : scoreStatus;
  const scoreStatusForDisplay = connected
    && activeNetwork?.scoreAvailable
    && displayedScoreStatus === 'idle'
    ? 'loading'
    : displayedScoreStatus;
  const balancesLoading = connected
    && Boolean(protocolNetwork)
    && chainDataStatus === 'loading' && !chainData.updatedAt;
  const poolLoading = Boolean(protocolNetwork)
    && chainDataStatus !== 'ready'
    && chainDataStatus !== 'error';
  const displayedScore = scoreNeedsBalanceRefresh
    && scoreRefreshCompletedKey === currentScoreRefreshKey
    ? scoreWithCurrentBalanceRates(
      score,
      chainData.scoreRatesPerSecond,
      chainData.scoreBalanceChangeTimestampMilliseconds,
      chainData.scoreBalancesSnapshotTimestampMilliseconds,
    )
    : canSimulateCurrentScore && !score
      ? scoreWithCurrentBalanceRates(
        { ...EMPTY_SCORE, availableScore: null, maturingScorePerSecond: null },
        chainData.scoreRatesPerSecond,
        chainData.scoreBalanceChangeTimestampMilliseconds,
        chainData.scoreBalancesSnapshotTimestampMilliseconds,
      )
    : score;
  const selectedSettlementRow = chainData.claim
      && claimSettlement?.contextKey === claimContextKey
      && matchesSettlementContext(claimSettlement, chainData.incident?.id, chainData.incident?.root)
      && matchesSettlementTopology(claimSettlement.value, chainData.incident)
    ? claimSettlement.value.rows.find((row) => row.claimId === chainData.claim.id)
    : null;
  // A resolved claim needs no action, and a settled incident delists its token, so
  // the row should disappear rather than keep offering a payout button.
  const unresolvedClaim = chainData.claim && !chainData.claim.resolved ? chainData.claim : null;
  // Only a claim of your own that is already resolved removes the row; with no
  // claim the incident stays visible so anyone can still see or join it.
  const activeIncidentDetailsLoading = Boolean(
    chainDataStatus !== 'ready'
      && chainData.activeIncidentId
      && chainData.activeIncidentId !== '0'
      && String(chainData.incident?.id ?? '') !== String(chainData.activeIncidentId),
  );
  const actionableIncident = chainData.claim?.resolved ? null : chainData.incident;

  // The settlement artifact is still being fetched, so the payout figures are
  // unknown rather than unavailable.
  const payoutLoading = Boolean(unresolvedClaim)
    && !selectedSettlementRow
    && !claimStatus.failed;
  const boostersToBurn = selectedSettlementRow?.eligibleBoosterAmount !== undefined
    && selectedSettlementRow.eligibleBoosterAmount <= BigInt(chainData.claim.boosterAmount)
    ? (selectedSettlementRow.eligibleAmount > 0n && selectedSettlementRow.scoreSpent > 0n
      ? selectedSettlementRow.eligibleBoosterAmount : 0n)
    : null;
  const settledScoreShare = selectedSettlementRow
    ? percentOfWad(
      selectedSettlementRow.boostedScore,
      claimSettlement.value.rows.reduce((total, row) => total + row.boostedScore, 0n),
    )
    : null;
  const selectedClaimStatus = claimToken
    && unresolvedClaim
    && chainData.incident?.tokenId === claimToken.id
    ? {
      ...unresolvedClaim,
      ...claimLifecycle(chainData.incident),
      incident: chainData.incident,
      insuredTokenAmount: groupDecimalString(chainData.claim.insuredTokenAmount),
      bondAmount: groupDecimalString(chainData.claim.bondAmount),
      boosterAmount: groupDecimalString(chainData.claim.boosterAmount),
      boostersToBurn: boostersToBurn === null ? null : groupDecimalString(boostersToBurn.toString()),
      scoreToSpend: groupDecimalString(chainData.claim.scoreToSpend),
      // Mirrors finalizeClaim's `eligible`: without it every payout branch is a no-op,
      // the bond goes to the treasury, and accepting does nothing a decline would not.
      payoutEligible: selectedSettlementRow
        ? selectedSettlementRow.eligibleAmount > 0n && selectedSettlementRow.scoreSpent > 0n
        : null,
      // Once settled, weight by the enclave's boosted scores: ineligible claims are
      // zeroed there, so the filed-claim total overstates the denominator.
      scoreCommitmentPercentage: settledScoreShare || chainData.claim.scoreCommitmentPercentage,
      payoutUsd: selectedSettlementRow?.payoutUsd === undefined
        ? null
        : formatUsdWad(selectedSettlementRow.payoutUsd),
      payoutVsLoss: selectedSettlementRow?.payoutUsd === undefined
        || !selectedSettlementRow?.lossUsd
        ? null
        : percentOfWad(selectedSettlementRow.payoutUsd, selectedSettlementRow.lossUsd),
      payoutDetails: settlementPayoutDetails(
        selectedSettlementRow?.amounts || [],
        claimSettlement?.value?.poolOrder || [],
        protocolNetwork?.payoutAssets,
      ),
    }
    : null;
  const insuredTokenStates = chainData.insurance?.tokens || {};
  const currentClaimTokenRows = CLAIM_TOKEN_ROWS.filter((row) => (
    insuredTokenStates[row.id]?.enabled || row.id === actionableIncident?.tokenId
  ));

  const statusMessage = claimStatus.message || usd8Status.message || poolStatus.message;

  return (
    <WalletNoticeProvider key={walletScopeKey} wallet={{ connected, connecting, onConnect: connect, connectUnavailableReason: !walletConnectorConfigured ? WALLET_CONNECT_UNAVAILABLE_REASON : '' }}>
      <NoticeMessage
        message={transaction?.refreshError ? `${statusMessage || 'Transaction confirmed.'} Transaction confirmed. Balances could not be refreshed.` : statusMessage || (transaction ? (transaction.phase === 'confirmed' ? 'Transaction confirmed.' : transaction.message) : '')}
        actionLabel={transaction?.refreshError ? 'Retry Refresh' : undefined}
        onAction={() => refreshChainData().then(() => setTransaction(previous => previous ? ({ ...previous, refreshError: false }) : previous)).catch(() => {})}
        tone={transaction?.refreshError || claimStatus.failed || usd8Status.failed || poolStatus.failed || transaction?.phase === 'failed' ? 'error' : 'status'}
        label={claimStatus.message ? 'Claim submission status' : 'Transaction status'}
        busy={operationBusy && transaction?.phase !== 'confirmed' && transaction?.phase !== 'failed'}
        href={transaction?.hash ? `${getNetwork(transaction.chainId)?.chain.blockExplorers?.default.url || 'https://sepolia.etherscan.io'}/tx/${transaction.hash}` : undefined}
      />
      <NoticeMessage message={scoreError} actionLabel="Retry Score" onAction={() => {
        scoreRetryForcesRefresh.current = true;
        setScoreRetry(value => value + 1);
      }} />
      <USD8Landing
        wallet={{
          address,
          connected,
          connecting,
          networkName: activeNetwork?.name || (connected ? `Chain ${chainId}` : ''),
          networkUnavailableReason: protocolUnavailableReason,
          connectUnavailableReason: !connected && !walletConnectorConfigured ? WALLET_CONNECT_UNAVAILABLE_REASON : '',
          onConnect: connect,
          onDisconnect: () => open({ view: 'Account' }).catch(error => setDataError(error?.message || 'Wallet details could not be opened.')),
          onSwitchNetwork: () => switchChainAsync({ chainId: PROTOCOL_CHAIN_ID }).catch(error => setDataError(error.shortMessage || error.message)),
        }}
        score={connected ? displayedScore : EMPTY_SCORE}
        scoreStatus={connected ? scoreStatusForDisplay : 'ready'}
        availableScoreLoading={connected && (scoreStatus === 'loading' || (scoreStatus !== 'error' && scoreStatusForDisplay === 'loading'))}
        balances={connected ? chainData.balances : EMPTY_CHAIN_DATA.balances}
        balancesLoading={balancesLoading}
        savingsVault={savingsVault}
        pools={displayedPools}
        poolLoading={poolLoading}
        dataError={transaction?.refreshError ? '' : dataError}
        updatedAt={chainData.updatedAt}
        onRetry={() => { setDataError(''); refreshChainData(walletScopeKey, { resources: Object.keys(chainData.resourceErrors || {}).length ? Object.keys(chainData.resourceErrors) : undefined }).catch(() => {}); }}
        incident={actionableIncident}
        insuredTokenStates={insuredTokenStates}
        scoreMaturitySeconds={chainData.insurance?.scoreMaturitySeconds}
        onFileClaim={fileClaimAction}
        fileClaimUnavailableReason={connected ? protocolUnavailableReason || (chainDataStatus === 'error' ? 'Refresh unavailable data before continuing.' : '') : CONNECT_WALLET_REASON}
        onPoolAction={openPoolAction}
        onUsd8Action={openUsd8Action}
      />
      {connected && claimToken ? (
        <Suspense fallback={<div role="status">Loading claim details…</div>}><FileClaimDialog
          token={claimToken.id}
          insuredTokens={currentClaimTokenRows.map((row) => ({
            id: row.id,
            symbol: row.symbol,
            iconSrc: row.iconSrc,
            address: protocolNetwork?.contracts.insuredTokens?.[row.id],
            balance: row.id === 'usd8'
              ? chainData.balances.usd8
              : row.id === 'susd8'
                ? chainData.balances.savings
                : chainData.balances.insuredTokens?.[row.id] || '0',
          }))}
          availableScore={score?.availableScore ?? '0'}
          availableBoosters={chainData.balances.boosters || '0'}
          minHoldingRequiredBlocks={actionableIncident?.tokenId === claimToken.id
            ? actionableIncident.minHoldingRequiredBlocks : chainData.insurance?.minHoldingRequiredBlocks}
          claimBond={chainData.insurance?.claimBond === undefined || chainData.insurance?.claimBond === null ? '— USD8' : `${chainData.insurance.claimBond} USD8`}
          claimBondAvailable={chainData.balances.usd8}
          claimTotals={{ scoreCommitted: chainData.incident?.totalScoreCommitted || '0' }}
          boosterBoostBps={chainData.incident?.boosterBoostBps ?? chainData.insurance?.boosterBoostBps ?? 0}
          claimStatus={selectedClaimStatus}
          incident={actionableIncident?.tokenId === claimToken.id ? actionableIncident : null}
          payoutLoading={payoutLoading}
          submitUnavailableReason={(!score ? 'Insurance Score is unavailable. Retry to load it before filing a claim.' : '') || (activeIncidentDetailsLoading
            ? 'Incident details are still loading. Refresh before filing a claim.'
            : '') || (actionableIncident?.tokenId === claimToken.id && actionableIncident.minHoldingRequiredBlocks == null
            ? 'Holding window is unavailable. Refresh before filing a claim.'
            : '') || dataUnavailableFor(['configuration', 'account-balances', 'boosters', 'claim-bond', 'head', 'incident', 'incident-settlement-params']) || ( !protocolNetwork?.contracts.insuredTokens?.[claimToken.id]
            || !insuredTokenStates[claimToken.id]?.enabled
            ? `${claimToken.symbol} is not enabled for claims on ${protocolNetwork?.name || 'the selected network'}.`
            : (operationBusy
              ? 'Claim preparation is in progress.'
              : ((!chainData.activeIncidentId || chainData.activeIncidentId === '0') && !claimApiConfigured
                ? 'Claim verification service is not configured.'
                : '')))}
          statusMessage=""
          statusTone={claimStatus.failed
            ? 'warning'
            : (isWaitingStatus(claimStatus.message) ? 'loading' : 'neutral')}
          onClearStatus={() => {
            claimStatusLine.clear();
          }}
          onClose={() => {
            claimAbortController.current?.abort();
            claimStatusLine.clear();
            setClaimToken(null);
          }}
          onCancel={(...args) => runOperation(() => cancelClaim(...args))}
          onSettle={(...args) => runOperation(() => settleClaim(...args))}
          onReturnTokens={() => runOperation(() => finalizeCurrentClaim(false))}
          onAcceptPayout={() => runOperation(() => finalizeCurrentClaim(true))}
          onCancelPayout={() => runOperation(() => finalizeCurrentClaim(false))}
          onSubmit={(...args) => runOperation(() => submitClaim(...args))}
        /></Suspense>
      ) : null}
      {connected && usd8Action ? (
        <Usd8ActionDialog
          quoteRate={quoteRate}
          mode={usd8Action}
          usdcBalance={chainData.balances.usdc}
          usd8Balance={chainData.balances.usd8}
          onInputChange={() => usd8StatusLine.clear()}

          onClose={() => {
            usd8StatusLine.clear();
            setUsd8Action(null);
          }}
          onSubmit={(...args) => runOperation(() => submitUsd8Action(...args))}
          submitUnavailableReason={protocolUnavailableReason || (operationBusy ? 'A transaction is already in progress.' : '') || dataUnavailableFor(['account-balances'])}
        />
      ) : null}
      {connected && poolAction ? (
        <PoolActionDialog
          mode={poolAction}
          poolName={activePool?.name || 'cover pool'}
          assetSymbol={activePool?.assetSymbol || ''}
          shareSymbol={activePool?.shareSymbol || ''}
          shareDecimals={activePool?.shareDecimals ?? 21}
          withdrawalQuote={activePool?.withdrawalQuote}
          coverAssetBalance={activePool?.assetBalance || '0'}
          activeIncidentId={chainData.activeIncidentId}
          capacityUncapped={activePool?.capacityUncapped}
          remainingDepositCapacity={activePool?.remainingDepositCapacity}
          poolShareBalance={activePool?.availableForCooldown || '0'}
          availableForCooldown={activePool?.availableForCooldown}
          availableForCooldownAssets={activePool?.availableForCooldownAssets}
          availableForWithdrawAssets={activePool?.availableForWithdrawAssets}
          inCooldownAssets={activePool?.inCooldownAssets}
          exitSettled={activePool?.exitSettled}
          availableForWithdraw={activePool?.availableForWithdraw}
          inCooldown={activePool?.inCooldown}
          cooldownEndsAtMilliseconds={activePool?.cooldownEndsAtMilliseconds}
          exitCooldownSeconds={chainData.insurance?.exitCooldownSeconds}
          earningsPool={activePool}
          hasEarnings={poolHasEarnings(activePool)}
          onInputChange={() => poolStatusLine.clear()}

          onClose={() => {
            poolStatusLine.clear();
            setPoolAction(null);
          }}
          onSubmit={(...args) => runOperation(() => submitPoolAction(...args))}
          submitUnavailableReason={protocolUnavailableReason || (operationBusy ? 'A transaction is already in progress.' : '') || dataUnavailableFor(['head', `pool:${activePool?.id}`, `account-pool:${activePool?.id}`, `account-pool-derived:${activePool?.id}`])}
        />
      ) : null}
    </WalletNoticeProvider>
  );
}
