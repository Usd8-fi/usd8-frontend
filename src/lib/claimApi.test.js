import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';

const INSURED_TOKEN = '0x6e5eb99a5923bEA10Eb3990Ec8Da84e70007E668';
const REGISTRY = '0xB34D92cd05005DF36050370433819597a9BaC693';
const DEFI_INSURANCE = '0x4E346CcD0a46D51ebaE6810d653791982968d502';
const JOB_ID = 'a'.repeat(64);
const SIGNATURE = `0x${'11'.repeat(65)}`;
const SETTLEMENT_ROOT = '0xe4b071f66e038500cf6b49655929f4849b072adb31b84a107421a29790dc51ae';
const POOL = '0x55cb69271da9937d0cb3c548409fd3f77586df79';
const OTHER_POOL = '0x8917f4c377dd0e5bd4909d8a00b508f38c0f3f4f';
const POOL_ASSET = '0xdfaf9c1ce55f18ab7850edd84f2175ce734985fa';
const OTHER_POOL_ASSET = '0xbbd327336d5135e146312dd16f2491c1e6ce8822';
const SETTLEMENT_SNAPSHOT = {
  expectedPoolAddrs: [POOL],
  expectedPoolOrder: [POOL_ASSET],
};
const VALID_SETTLEMENT_ROWS = [
  {
    claimId: '9',
    user: '0xed6db48f8cdce82ee37ba8760ceefe569167f3c4',
    amounts: ['147203008757396'],
    scoreSpent: '775090000000000000000',
    boostedScore: '775090000000000000000',
    eligibleAmount: '1000000000000000000',
    eligibleBoosterAmount: '0',
    payoutUsd: '588812035029585798',
    lossUsd: '736015043786982248',
  },
  {
    claimId: '10',
    user: '0x8f20e1aa4b32ed617278e9ed896e9409821e879d',
    amounts: ['147203008757396'],
    scoreSpent: '750651388888889489410',
    boostedScore: '750651388888889489410',
    eligibleAmount: '1000000000000000000',
    eligibleBoosterAmount: '0',
    payoutUsd: '588812035029585798',
    lossUsd: '736015043786982248',
  },
];

function completedSettlementJob(rows = VALID_SETTLEMENT_ROWS) {
  return {
    jobId: JOB_ID,
    status: 'completed',
    payload: {
      artifact: {
        schemaVersion: 2,
        chainId: 11155111,
        registry: REGISTRY,
        defiInsurance: DEFI_INSURANCE,
        incidentId: '5',
        root: SETTLEMENT_ROOT,
        poolAddrs: [POOL],
        poolOrder: [POOL_ASSET],
        poolPayouts: ['368007521893490'],
        rows,
      },
      signature: SIGNATURE,
    },
  };
}

const loadedClients = new Set();
async function loadClaimApi() {
  vi.resetModules();
  vi.stubEnv('VITE_CLAIM_API_URL', 'https://claims.example');
  const api = await import('./claimApi.js');
  const { queryClient } = await import('./dataCache.js');
  loadedClients.add(queryClient);
  return api;
}

afterEach(() => {
  // resetModules creates real clients separate from the shared setup client.
  // Clear their GC timers before restoring the clock; defaults stay isolated.
  for (const client of loadedClients) client.clear();
  loadedClients.clear();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function completedOpeningJob() {
  return { jobId: JOB_ID, status: 'completed', payload: {
    artifact: { schemaVersion: 1, artifactType: 'incidentOpen', chainId: 11155111,
      registry: REGISTRY, defiInsurance: DEFI_INSURANCE, insuredToken: INSURED_TOKEN,
      referenceBlock: 12345678 }, signature: SIGNATURE,
  } };
}

describe('accepted job retention with real QueryClient GC', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-08T12:00:00Z'));
  });

  it.each([
    ['open', 10 * 60_000],
    ['settlement', 21 * 60_000],
  ])('resumes %s after its normal timeout, beyond five-minute GC', async (operation, duration) => {
    const api = await loadClaimApi();
    const { queryClient } = await import('./dataCache.js');
    const options = { ...SETTLEMENT_SNAPSHOT, chainId: 11155111, registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE };
    const prepare = () => operation === 'open'
      ? api.prepareIncidentOpen(INSURED_TOKEN, options) : api.prepareSettlement(5n, options);
    let completed = false;
    vi.stubGlobal('fetch', vi.fn(async (_url, init) => new Response(JSON.stringify(
      init.method === 'POST' ? { accepted: true, jobId: JOB_ID }
        : completed ? (operation === 'open' ? completedOpeningJob() : completedSettlementJob())
          : { jobId: JOB_ID, status: 'pending' },
    ), { status: init.method === 'POST' ? 202 : 200 })));
    queryClient.setQueryData(['unrelated-metric'], 1);
    const timedOut = expect(prepare()).rejects.toThrow(/timed out/i);
    await vi.advanceTimersByTimeAsync(5 * 60_000 + 1);
    expect(queryClient.getQueryData(['unrelated-metric'])).toBeUndefined();
    const handle = queryClient.getQueryCache().find({ queryKey: ['claim-job', operation], exact: false });
    const expiresAt = handle?.state.data.expiresAt;
    await vi.advanceTimersByTimeAsync(duration - (5 * 60_000 + 1));
    await timedOut;
    expect(handle?.state.data.jobId).toBe(JOB_ID);
    expect(handle.getObserversCount()).toBe(0);
    expect(queryClient.getQueryData(handle.queryKey)?.expiresAt).toBe(expiresAt);
    completed = true;
    fetch.mockClear();
    await prepare();
    expect(fetch.mock.calls.map(([url, init]) => [url, init.method ?? 'GET']))
      .toEqual([[`https://claims.example/jobs/${JOB_ID}`, 'GET']]);
    expect(queryClient.getQueryCache().findAll({ queryKey: ['claim-job', operation] }))
      .toHaveLength(operation === 'open' ? 0 : 1);
    if (operation === 'settlement') {
      await vi.advanceTimersByTimeAsync(5 * 60_000 + 1);
      await prepare();
      expect(fetch.mock.calls.every(([, init]) => (init.method ?? 'GET') === 'GET')).toBe(true);
      expect(handle.state.data.expiresAt).toBe(expiresAt);
    }
  });
});

describe('accepted handle expiry and advisory boundaries', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-08T12:00:00Z'));
  });

  it.each(['open', 'settlement'])('expires %s at one hour without polling extending retention', async (operation) => {
    const api = await loadClaimApi();
    const { queryClient } = await import('./dataCache.js');
    const start = Date.now();
    const options = { ...SETTLEMENT_SNAPSHOT, chainId: 11155111, registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE };
    const controller = new AbortController();
    const prepare = (extra = {}) => operation === 'open'
      ? api.prepareIncidentOpen(INSURED_TOKEN, { ...options, ...extra })
      : api.prepareSettlement(5n, { ...options, ...extra });
    vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
      if (init.method === 'POST') return new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 });
      controller.abort();
      throw new DOMException('Aborted', 'AbortError');
    }));
    await expect(prepare({ signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    const handle = queryClient.getQueryCache().find({ queryKey: ['claim-job'], exact: false });
    expect(handle.state.data.expiresAt).toBe(start + 3_600_000);
    await vi.advanceTimersByTimeAsync(3_600_000 - 1);
    expect(queryClient.getQueryData(handle.queryKey)?.jobId).toBe(JOB_ID);
    // Move wall time only: explicit expiry must reject even before GC executes.
    vi.setSystemTime(start + 3_600_000);
    fetch.mockClear();
    fetch.mockImplementation(async (_url, init) => new Response(JSON.stringify(
      init.method === 'POST' ? { accepted: true, jobId: JOB_ID }
        : operation === 'open' ? completedOpeningJob() : completedSettlementJob(),
    ), { status: init.method === 'POST' ? 202 : 200 }));
    await prepare();
    expect(fetch.mock.calls.map(([, init]) => init.method ?? 'GET')).toEqual(['POST', 'GET']);
  });

  it('never POSTs an expired settlement handle when an onchain root requires immutable retrieval', async () => {
    const { prepareSettlement } = await loadClaimApi();
    const options = { ...SETTLEMENT_SNAPSHOT, chainId: 11155111, registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE };
    vi.stubGlobal('fetch', vi.fn(async (_url, init) => new Response(JSON.stringify(
      init.method === 'POST' ? { accepted: true, jobId: JOB_ID } : completedSettlementJob(),
    ), { status: init.method === 'POST' ? 202 : 200 })));
    await prepareSettlement(5n, options);
    await vi.advanceTimersByTimeAsync(3_600_000);
    const { queryClient } = await import('./dataCache.js');
    expect(queryClient.getQueryCache().findAll({ queryKey: ['claim-job'] })).toHaveLength(0);
    fetch.mockClear();
    fetch.mockResolvedValue(new Response(null, { status: 404 }));
    await expect(prepareSettlement(5n, { ...options, expectedRoot: SETTLEMENT_ROOT })).rejects.toThrow(/no immutable settlement/);
    expect(fetch.mock.calls).toHaveLength(1);
    expect(fetch.mock.calls[0][0]).toContain('/settlements/');
    expect(fetch.mock.calls[0][1].method).toBe('GET');
  });

  it.each(['mismatched', 'expired'])('ignores a %s advisory during throttling', async (kind) => {
    const { prepareIncidentOpen } = await loadClaimApi();
    const checkedAt = Math.floor(Date.now() / 1000) - (kind === 'expired' ? 3600 : 0);
    const advisory = { schemaVersion: 1, chainId: 11155111, registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE, insuredToken: kind === 'mismatched' ? POOL_ASSET : INSURED_TOKEN,
      displayOnly: true, stale: false, snapshot: { checkedAt, expiresAt: checkedAt + 3600,
        configuration: 'c'.repeat(64), result: { outcome: 'noDrop' } } };
    const onAdvisory = vi.fn();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ advisory }), { status: 429 })));
    const rejected = expect(prepareIncidentOpen(INSURED_TOKEN, { chainId: 11155111,
      registry: REGISTRY, defiInsurance: DEFI_INSURANCE, previousAdvisory: advisory,
      onAdvisory, maxWaitMs: 100 })).rejects.toThrow(/no previous result/);
    await vi.advanceTimersByTimeAsync(100);
    await rejected;
    expect(onAdvisory).not.toHaveBeenCalled();
  });

  it('replaces a negative advisory with a positive check but still requires a completed authorization', async () => {
    const { prepareIncidentOpen } = await loadClaimApi();
    const checkedAt = Math.floor(Date.now() / 1000);
    const negative = { schemaVersion: 1, chainId: 11155111, registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE, insuredToken: INSURED_TOKEN, displayOnly: true, stale: false,
      snapshot: { checkedAt, expiresAt: checkedAt + 3600, configuration: 'c'.repeat(64), result: { outcome: 'noDrop' } } };
    const positive = { ...negative, snapshot: { ...negative.snapshot,
      result: { outcome: 'qualifying', referenceBlock: 123, observationBlock: 456 } } };
    const onAdvisory = vi.fn();
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID, advisory: positive }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(completedOpeningJob()))));
    await expect(prepareIncidentOpen(INSURED_TOKEN, { chainId: 11155111, registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE, previousAdvisory: negative, onAdvisory }))
      .resolves.toEqual({ referenceBlock: 12345678n, signature: SIGNATURE });
    expect(onAdvisory).toHaveBeenCalledWith(positive);
    expect(fetch.mock.calls.map(([, init]) => init.method ?? 'GET')).toEqual(['POST', 'GET']);
  });
});

describe('prepareIncidentOpen', () => {
  it('reports first-time throttle at the deadline as busy, without fabricated authorization', async () => {
    const { prepareIncidentOpen } = await loadClaimApi();
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => {
      now = 1100;
      return new Response('{}', { status: 429 });
    }));
    await expect(prepareIncidentOpen(INSURED_TOKEN, {
      chainId: 11155111, registry: REGISTRY, defiInsurance: DEFI_INSURANCE, maxWaitMs: 100,
    })).rejects.toMatchObject({ name: 'ClaimServiceBusyError', message: expect.stringMatching(/no previous result/) });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('resumes an accepted opening job after abort without another POST', async () => {
    const { prepareIncidentOpen } = await loadClaimApi();
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockImplementationOnce(() => { controller.abort(); throw new DOMException('Aborted', 'AbortError'); })
      .mockResolvedValueOnce(new Response(JSON.stringify({ jobId: JOB_ID, status: 'completed', payload: {
        artifact: { schemaVersion: 1, artifactType: 'incidentOpen', chainId: 11155111, registry: REGISTRY,
          defiInsurance: DEFI_INSURANCE, insuredToken: INSURED_TOKEN, referenceBlock: 12345678 }, signature: SIGNATURE,
      } }))));
    const options = { chainId: 11155111, registry: REGISTRY, defiInsurance: DEFI_INSURANCE, pollIntervalMs: 0 };
    await expect(prepareIncidentOpen(INSURED_TOKEN, { ...options, signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    await expect(prepareIncidentOpen(INSURED_TOKEN, options)).resolves.toEqual({ referenceBlock: 12345678n, signature: SIGNATURE });
    expect(fetch.mock.calls.filter(([, options]) => options.method === 'POST')).toHaveLength(1);
  });

  it('retains a bound negative advisory for display during a gateway throttle, never as authorization', async () => {
    const { prepareIncidentOpen } = await loadClaimApi();
    const checkedAt = Math.floor(Date.now() / 1000);
    const advisory = { schemaVersion: 1, chainId: 11155111, registry: REGISTRY, defiInsurance: DEFI_INSURANCE,
      insuredToken: INSURED_TOKEN, displayOnly: true, stale: false,
      snapshot: { checkedAt, expiresAt: checkedAt + 3600, configuration: 'c'.repeat(64), result: { outcome: 'noDrop' } } };
    const onAdvisory = vi.fn(); const onStatus = vi.fn();
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'PRICE_DROP_NOT_DETECTED', advisory }), { status: 422 }))
      .mockResolvedValueOnce(new Response('{}', { status: 429, headers: { 'retry-after': '60' } })));
    const options = { chainId: 11155111, registry: REGISTRY, defiInsurance: DEFI_INSURANCE, onAdvisory, onStatus };
    await expect(prepareIncidentOpen(INSURED_TOKEN, options)).rejects.toThrow(/No qualifying/);
    expect(onAdvisory).toHaveBeenCalledWith(advisory);
    await expect(prepareIncidentOpen(INSURED_TOKEN, { ...options, previousAdvisory: advisory, maxWaitMs: 10 })).rejects.toThrow(/busy/i);
    expect(onStatus).toHaveBeenLastCalledWith(expect.stringMatching(/busy.*stale.*no qualifying.*display only/i));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('does not POST when the shared deadline is already exhausted', async () => {
    const { prepareIncidentOpen } = await loadClaimApi();
    vi.stubGlobal('fetch', vi.fn());
    await expect(prepareIncidentOpen(INSURED_TOKEN, {
      chainId: 11155111, registry: REGISTRY, defiInsurance: DEFI_INSURANCE, maxWaitMs: 0,
    })).rejects.toThrow(/timed out/i);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(['production', 'development'])('never embeds a loopback claim API in a %s frontend build', async (mode) => {
    vi.resetModules();
    vi.stubEnv('MODE', mode);
    vi.stubEnv('VITE_CLAIM_API_URL', 'http://127.0.0.1:8788');

    const { claimApiBaseUrl } = await import('./claimContext.js');

    expect(claimApiBaseUrl('usd8.fi')).toBe('https://wmzdww7bxb.execute-api.eu-central-1.amazonaws.com');
    expect(claimApiBaseUrl('127.0.0.1')).toBe('/api/claims');
  });

  it('uses the same-origin claim proxy on loopback hosts and the public API on the live site', async () => {
    const { claimApiBaseUrl } = await import('./claimContext.js');
    for (const hostname of ['localhost', '127.0.0.1', '[::1]', '::1']) {
      expect(claimApiBaseUrl(hostname, '')).toBe('/api/claims');
    }
    expect(claimApiBaseUrl('usd8.fi', '')).toBe('https://wmzdww7bxb.execute-api.eu-central-1.amazonaws.com');
    expect(claimApiBaseUrl('localhost', 'https://claims.example')).toBe('https://claims.example');
  });

  it.each([
    [new TypeError('Failed to fetch'), 'Could not reach the claim verification service'],
    [new DOMException('The operation timed out', 'TimeoutError'), 'The claim verification service took too long to respond'],
  ])('explains claim service transport failures (%s)', async (failure, message) => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(failure));
    const { prepareIncidentOpen } = await loadClaimApi();
    await expect(prepareIncidentOpen(INSURED_TOKEN, {
      chainId: 11155111, registry: REGISTRY, defiInsurance: DEFI_INSURANCE,
    })).rejects.toThrow(message);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('explains when the precheck finds no qualifying price drop', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({
      error: 'PRICE_DROP_NOT_DETECTED',
    }), { status: 422 })));
    const { prepareIncidentOpen } = await loadClaimApi();

    await expect(prepareIncidentOpen(INSURED_TOKEN, {
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
    })).rejects.toThrow(
      'No qualifying >20% price drop was detected.',
    );
  });

  it('starts an incident-open job, polls it, and returns a bound authorization', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jobId: JOB_ID, status: 'pending', apiVerified: false }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        jobId: JOB_ID,
        status: 'completed',
        apiVerified: false,
        payload: {
          artifact: {
            schemaVersion: 1,
            artifactType: 'incidentOpen',
            chainId: 11155111,
            registry: REGISTRY,
            defiInsurance: DEFI_INSURANCE,
            insuredToken: INSURED_TOKEN,
            referenceBlock: 12345678,
          },
          signature: SIGNATURE,
        },
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { prepareIncidentOpen } = await loadClaimApi();

    const authorization = await prepareIncidentOpen(INSURED_TOKEN, {
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      idempotencyKey: 'claim-test-1',
      pollIntervalMs: 0,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://claims.example/jobs/open', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ insuredToken: INSURED_TOKEN }),
      headers: expect.objectContaining({ 'Idempotency-Key': 'claim-test-1' }),
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, `https://claims.example/jobs/${JOB_ID}`, expect.any(Object));
    expect(authorization).toEqual({ referenceBlock: 12345678n, signature: SIGNATURE });
  });

  it('retries a transient 429 while starting an incident-open job', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        jobId: JOB_ID,
        status: 'completed',
        payload: {
          artifact: {
            schemaVersion: 1,
            artifactType: 'incidentOpen',
            chainId: 11155111,
            registry: REGISTRY,
            defiInsurance: DEFI_INSURANCE,
            insuredToken: INSURED_TOKEN,
            referenceBlock: 12345678,
          },
          signature: SIGNATURE,
        },
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { prepareIncidentOpen } = await loadClaimApi();

    await expect(prepareIncidentOpen(INSURED_TOKEN, {
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
    })).resolves.toEqual({ referenceBlock: 12345678n, signature: SIGNATURE });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('retries a transient 429 while polling an incident-open job', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        jobId: JOB_ID,
        status: 'completed',
        payload: {
          artifact: {
            schemaVersion: 1,
            artifactType: 'incidentOpen',
            chainId: 11155111,
            registry: REGISTRY,
            defiInsurance: DEFI_INSURANCE,
            insuredToken: INSURED_TOKEN,
            referenceBlock: 12345678,
          },
          signature: SIGNATURE,
        },
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { prepareIncidentOpen } = await loadClaimApi();

    await expect(prepareIncidentOpen(INSURED_TOKEN, {
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
    })).resolves.toEqual({ referenceBlock: 12345678n, signature: SIGNATURE });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('rejects an artifact bound to another insurance contract', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        jobId: JOB_ID,
        status: 'completed',
        apiVerified: false,
        payload: {
          artifact: {
            schemaVersion: 1,
            artifactType: 'incidentOpen',
            chainId: 11155111,
            registry: REGISTRY,
            defiInsurance: '0x0000000000000000000000000000000000000001',
            insuredToken: INSURED_TOKEN,
            referenceBlock: 12345678,
          },
          signature: SIGNATURE,
        },
      }), { status: 200 })));
    const { prepareIncidentOpen } = await loadClaimApi();

    await expect(prepareIncidentOpen(INSURED_TOKEN, {
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      idempotencyKey: 'claim-test-2',
      pollIntervalMs: 0,
    })).rejects.toThrow('Claim service returned an authorization for another insurance contract.');
  });
});

describe('prepareSettlement', () => {
  it('reconnects to a completed accepted job without another POST', async () => {
    const { prepareSettlement } = await loadClaimApi();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockImplementation(() => Promise.resolve(new Response(JSON.stringify(completedSettlementJob()))));
    vi.stubGlobal('fetch', fetchMock);
    const options = { ...SETTLEMENT_SNAPSHOT, chainId: 11155111, registry: REGISTRY, defiInsurance: DEFI_INSURANCE, pollIntervalMs: 0 };
    const first = await prepareSettlement(5n, options);
    const second = await prepareSettlement(5n, options);
    expect(second.root).toBe(first.root);
    expect(fetchMock.mock.calls.filter(([, options]) => options.method === 'POST')).toHaveLength(1);
  });
  it('explains when settlement is waiting for finalized chain state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({
      error: 'SETTLEMENT_NOT_ELIGIBLE',
    }), { status: 422 })));
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      expectedRoot: `0x${'00'.repeat(32)}`,
    })).rejects.toThrow(
      'Settlement is not available at the finalized chain state yet. Please wait for network finality and try again.',
    );
  });

  it.each([undefined, null, '-1', '1.5', '0x03', 3, (2n ** 256n).toString()])(
    'rejects missing or malformed eligible booster quantities (%s)', async (quantity) => {
      const job = completedSettlementJob(VALID_SETTLEMENT_ROWS.map(row => ({ ...row })));
      job.payload.artifact.rows[0].eligibleBoosterAmount = quantity;
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(job))));
      const { prepareSettlement } = await loadClaimApi();
      await expect(prepareSettlement(5n, {
        ...SETTLEMENT_SNAPSHOT, chainId: 11155111, registry: REGISTRY, defiInsurance: DEFI_INSURANCE,
        expectedRoot: SETTLEMENT_ROOT, pollIntervalMs: 0,
      })).rejects.toThrow('invalid eligible booster amount');
    },
  );

  it.each(['old-schema', 'tampered-quantity'])('rejects %s settlements', async (reason) => {
    const job = completedSettlementJob(VALID_SETTLEMENT_ROWS.map(row => ({ ...row })));
    if (reason === 'old-schema') job.payload.artifact.schemaVersion = 1;
    else job.payload.artifact.rows[0].eligibleBoosterAmount = '3';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(job))));
    const { prepareSettlement } = await loadClaimApi();
    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT, chainId: 11155111, registry: REGISTRY, defiInsurance: DEFI_INSURANCE,
      expectedRoot: SETTLEMENT_ROOT, pollIntervalMs: 0,
    })).rejects.toThrow('invalid settlement');
  });

  it('keeps polling past the 1,200-second production parent bound', async () => {
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(1_000)
      .mockReturnValueOnce(1_000)
      .mockReturnValue(1_201_001);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(completedSettlementJob()), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
    })).resolves.toMatchObject({ root: SETTLEMENT_ROOT });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not reuse a settlement cached for a different standing root', async () => {
    const { matchesSettlementContext } = await loadClaimApi();
    const cached = { incidentId: '5', root: SETTLEMENT_ROOT };

    expect(matchesSettlementContext(cached, '5', SETTLEMENT_ROOT)).toBe(true);
    expect(matchesSettlementContext(cached, '5', `0x${'22'.repeat(32)}`)).toBe(false);
  });

  it('retrieves a standing-root artifact without knowing or launching its job', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(
      JSON.stringify(completedSettlementJob()),
      { status: 200 },
    ));
    vi.stubGlobal('fetch', fetchMock);
    const { prepareSettlement } = await loadClaimApi();

    const settlement = await prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      expectedRoot: SETTLEMENT_ROOT,
      pollIntervalMs: 0,
    });

    expect(settlement).toMatchObject({
      root: SETTLEMENT_ROOT,
      source: {
        route: `https://claims.example/settlements/11155111/${REGISTRY.toLowerCase()}/${DEFI_INSURANCE.toLowerCase()}/5/${SETTLEMENT_ROOT}`,
        jobId: JOB_ID,
      },
    });
    expect(settlement.source).not.toHaveProperty('idempotencyKey');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://claims.example/settlements/11155111/${REGISTRY.toLowerCase()}/${DEFI_INSURANCE.toLowerCase()}/5/${SETTLEMENT_ROOT}`,
      expect.objectContaining({ method: 'GET', cache: 'no-store' }),
    );
  });

  it('reuses only verified immutable artifacts and fetches again when the root changes', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify(completedSettlementJob()), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { prepareSettlement } = await loadClaimApi();
    const options = { ...SETTLEMENT_SNAPSHOT, chainId: 11155111, registry: REGISTRY, defiInsurance: DEFI_INSURANCE, expectedRoot: SETTLEMENT_ROOT };
    const first = await prepareSettlement(5n, options);
    expect(await prepareSettlement(5n, options)).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await expect(prepareSettlement(5n, { ...options, expectedRoot: '0x' + '22'.repeat(32) })).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await expect(prepareSettlement(5n, { ...options, expectedRoot: '0x' + '22'.repeat(32) })).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('derives omitted claim proofs from the complete root-bound row set', async () => {
    const root = '0xe4b071f66e038500cf6b49655929f4849b072adb31b84a107421a29790dc51ae';
    const claimant1Leaf = '0x0e3a2005907c8f4f030d191fa81300d6e7ccb036b2e0c7ea4a422aa4bd59957f';
    const claimant2Leaf = '0xfe535ae76748e68a650098c8195d9379b669c3c56530bbae0644b506adb1dfd9';
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        jobId: JOB_ID,
        status: 'completed',
        payload: {
          artifact: {
            schemaVersion: 2,
            chainId: 11155111,
            registry: REGISTRY,
            defiInsurance: DEFI_INSURANCE,
            incidentId: '5',
            root,
            poolAddrs: [POOL],
            poolOrder: [POOL_ASSET],
            poolPayouts: ['368007521893490'],
            rows: [
              {
                claimId: '9',
                user: '0xed6db48f8cdce82ee37ba8760ceefe569167f3c4',
                amounts: ['147203008757396'],
                scoreSpent: '775090000000000000000',
                boostedScore: '775090000000000000000',
                eligibleAmount: '1000000000000000000',
                eligibleBoosterAmount: '0',
                payoutUsd: '588812035029585798',
                lossUsd: '736015043786982248',
              },
              {
                claimId: '10',
                user: '0x8f20e1aa4b32ed617278e9ed896e9409821e879d',
                amounts: ['147203008757396'],
                scoreSpent: '750651388888889489410',
                boostedScore: '750651388888889489410',
                eligibleAmount: '1000000000000000000',
                eligibleBoosterAmount: '0',
                payoutUsd: '588812035029585798',
                lossUsd: '736015043786982248',
              },
            ],
          },
          signature: SIGNATURE,
        },
      }), { status: 200 })));
    const { prepareSettlement } = await loadClaimApi();

    const settlement = await prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      idempotencyKey: 'settlement-test-1',
      pollIntervalMs: 0,
    });

    expect(settlement.root).toBe(root);
    expect(settlement.rows.map(({ claimId, proof }) => ({ claimId, proof }))).toEqual([
      { claimId: '9', proof: [claimant2Leaf] },
      { claimId: '10', proof: [claimant1Leaf] },
    ]);
    // Enclave-reported valuation is surfaced for display. It is NOT part of the
    // Merkle leaf, so it is informational only — the payout the contract enforces
    // is `amounts`, which is committed and proven.
    expect(settlement.rows[0].payoutUsd).toBe(588812035029585798n);
    expect(settlement.rows[0].lossUsd).toBe(736015043786982248n);
    expect(settlement.source).toEqual({
      route: `https://claims.example/jobs/${JOB_ID}`,
      jobId: JOB_ID,
      idempotencyKey: 'settlement-test-1',
    });
  });

  it('accepts the signed proposed root while the authoritative onchain root is zero', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(completedSettlementJob()), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      expectedRoot: `0x${'00'.repeat(32)}`,
      pollIntervalMs: 0,
    })).resolves.toMatchObject({ root: SETTLEMENT_ROOT });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects omitted proofs when the complete row set does not match the signed root', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        jobId: JOB_ID,
        status: 'completed',
        payload: {
          artifact: {
            schemaVersion: 2,
            chainId: 11155111,
            registry: REGISTRY,
            defiInsurance: DEFI_INSURANCE,
            incidentId: '5',
            root: `0x${'00'.repeat(32)}`,
            poolAddrs: [POOL],
            poolOrder: [POOL_ASSET],
            poolPayouts: ['368007521893490'],
            rows: [{
              claimId: '9',
              user: '0xed6db48f8cdce82ee37ba8760ceefe569167f3c4',
              amounts: ['147203008757396'],
              scoreSpent: '775090000000000000000',
              boostedScore: '775090000000000000000',
              eligibleAmount: '1000000000000000000',
              eligibleBoosterAmount: '0',
              payoutUsd: '588812035029585798',
              lossUsd: '736015043786982248',
            }],
          },
          signature: SIGNATURE,
        },
      }), { status: 200 })));
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
    })).rejects.toThrow('Claim service returned an invalid settlement proof.');
  });

  it('fails closed when the immutable route has no nonzero expected-root artifact', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      expectedRoot: SETTLEMENT_ROOT,
      pollIntervalMs: 0,
    })).rejects.toThrow('Claim service returned no immutable settlement artifact for the expected root.');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://claims.example/settlements/11155111/${REGISTRY.toLowerCase()}/${DEFI_INSURANCE.toLowerCase()}/5/${SETTLEMENT_ROOT}`,
      expect.objectContaining({ method: 'GET', cache: 'no-store' }),
    );
  });

  it('steps to the next deterministic attempt key after a stored failed terminal', async () => {
    // A spent key replays its terminal without relaunching, so walking past it is
    // free; the next key is derived identically by every claimant.
    const fetchMock = vi.fn((url, init) => Promise.resolve(init?.method === 'POST'
      ? new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 })
      : new Response(JSON.stringify({ jobId: JOB_ID, status: 'failed' }), { status: 200 })));
    vi.stubGlobal('fetch', fetchMock);
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 1,
      maxWaitMs: 200,
    })).rejects.toThrow('Claim settlement failed.');

    const keys = fetchMock.mock.calls
      .filter(([, init]) => init?.method === 'POST')
      .map(([, init]) => init.headers['Idempotency-Key']);
    expect(keys[0]).toBe('usd8-settlement-11155111-5');
    expect(keys[1]).toBe('usd8-settlement-11155111-5-2');
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('launches at most one job per call even with attempts left on the ladder', async () => {
    // Spent keys report their terminal immediately; a key that runs is ours, and
    // its failure ends the walk rather than launching the next attempt.
    let posts = 0;
    let ownPolls = 0;
    const body = (status) => new Response(JSON.stringify({ jobId: JOB_ID, status }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn((url, init) => {
      if (init?.method === 'POST') {
        posts += 1;
        return Promise.resolve(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }));
      }
      if (posts === 1) return Promise.resolve(body('failed'));
      ownPolls += 1;
      return Promise.resolve(body(ownPolls === 1 ? 'running' : 'failed'));
    }));
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 1,
      maxWaitMs: 300,
    })).rejects.toThrow('Claim settlement failed.');

    expect(posts).toBe(2);
  });

  it('surfaces the enclave failure code so the cause is visible', async () => {
    vi.stubGlobal('fetch', vi.fn((url, init) => Promise.resolve(init?.method === 'POST'
      ? new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 })
      : new Response(JSON.stringify({
        jobId: JOB_ID, status: 'failed', payload: { code: 'SETTLEMENT_FINALITY_FAILED' },
      }), { status: 200 }))));
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 1,
      maxWaitMs: 200,
    })).rejects.toThrow('Claim settlement failed (SETTLEMENT_FINALITY_FAILED).');
  });
  it('rejects a settlement whose payout vectors do not match its asset order', async () => {
    const completed = completedSettlementJob();
    completed.payload.artifact.poolOrder = [];
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(completed), { status: 200 })));
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
    })).rejects.toThrow('Claim service returned an invalid settlement pool order.');
  });

  it('rejects a settlement whose pool addresses do not match the onchain incident snapshot', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(
      JSON.stringify(completedSettlementJob()),
      { status: 200 },
    )));
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      expectedRoot: SETTLEMENT_ROOT,
      expectedPoolAddrs: [OTHER_POOL],
      expectedPoolOrder: [POOL_ASSET],
      pollIntervalMs: 0,
    })).rejects.toThrow('Claim service returned a settlement for another pool snapshot.');
  });

  it('rejects a settlement whose asset order does not match the onchain incident snapshot', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(
      JSON.stringify(completedSettlementJob()),
      { status: 200 },
    )));
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      expectedRoot: SETTLEMENT_ROOT,
      expectedPoolAddrs: [POOL],
      expectedPoolOrder: [OTHER_POOL_ASSET],
      pollIntervalMs: 0,
    })).rejects.toThrow('Claim service returned a settlement for another asset order.');
  });

  it('does not submit a retry when polling expires without a failed terminal', async () => {
    let now = 1_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        accepted: true,
        jobId: JOB_ID,
      }), { status: 202 }))
      .mockImplementationOnce(() => { now = 1_002; return Promise.resolve(new Response(JSON.stringify({ jobId: JOB_ID, status: 'pending' }), { status: 200 })); });
    vi.stubGlobal('fetch', fetchMock);
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
      maxWaitMs: 1,
    })).rejects.toThrow('Claim settlement timed out. Please try again.');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].headers['Idempotency-Key'])
      .toBe('usd8-settlement-11155111-5');
  });

  it('rejects noncanonical uint256 text before deriving proofs', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(completedSettlementJob([
        { ...VALID_SETTLEMENT_ROWS[0], claimId: '09' },
        VALID_SETTLEMENT_ROWS[1],
      ])), { status: 200 })));
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
    })).rejects.toThrow('Claim service returned invalid claim id.');
  });

  it('rejects overlong uint256 text before invoking BigInt', async () => {
    const overlong = '9'.repeat(79);
    const rows = VALID_SETTLEMENT_ROWS.map((row, index) => (
      index === 0 ? { ...row, scoreSpent: overlong } : row
    ));
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(completedSettlementJob(rows)), { status: 200 })));
    const nativeBigInt = globalThis.BigInt;
    const bigintSpy = vi.fn((value) => nativeBigInt(value));
    vi.stubGlobal('BigInt', bigintSpy);
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
    })).rejects.toThrow('invalid score spent');
    expect(bigintSpy).not.toHaveBeenCalledWith(overlong);
  });

  it('retrieves and verifies an integrity-bound downloaded terminal', async () => {
    const terminal = JSON.stringify({ schemaVersion: 1, ...completedSettlementJob() });
    const bytes = new TextEncoder().encode(terminal);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        jobId: JOB_ID,
        status: 'completed',
        download: {
          url: 'https://usd8-results.s3.eu-central-1.amazonaws.com/result.json',
          sha256,
          bytes: bytes.length,
          expiresInSeconds: 300,
        },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(bytes, {
        status: 200,
        headers: { 'content-length': String(bytes.length) },
      })));
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
    })).resolves.toMatchObject({ root: SETTLEMENT_ROOT });
  });

  it('authenticates an exact 64 MiB chunked terminal without Content-Length', async () => {
    const limit = 64 * 1024 * 1024;
    const terminal = new TextEncoder().encode(JSON.stringify({ schemaVersion: 1, ...completedSettlementJob() }));
    const padding = new Uint8Array(1024 * 1024).fill(32);
    const hash = createHash('sha256').update(terminal);
    let remaining = limit - terminal.length;
    while (remaining) {
      const chunk = padding.subarray(0, Math.min(remaining, padding.length));
      hash.update(chunk);
      remaining -= chunk.length;
    }
    remaining = limit - terminal.length;
    let first = true;
    const stream = new ReadableStream({ pull(controller) {
      if (first) { first = false; controller.enqueue(terminal); }
      else if (remaining) {
        const chunk = padding.subarray(0, Math.min(remaining, padding.length));
        remaining -= chunk.length;
        controller.enqueue(chunk);
      } else controller.close();
    } });
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jobId: JOB_ID, status: 'completed', download: {
        url: 'https://usd8-results.s3.eu-central-1.amazonaws.com/result.json',
        sha256: hash.digest('hex'), bytes: limit, expiresInSeconds: 300,
      } })))
      .mockResolvedValueOnce(new Response(stream)));
    const { prepareSettlement } = await loadClaimApi();
    await expect(prepareSettlement(5n, { ...SETTLEMENT_SNAPSHOT, chainId: 11155111,
      registry: REGISTRY, defiInsurance: DEFI_INSURANCE, pollIntervalMs: 0,
    })).resolves.toMatchObject({ root: SETTLEMENT_ROOT });
  });

  it.each(['absent', 'lying'])('cancels streamed bytes over the 64 MiB cap with %s Content-Length', async (header) => {
    const limit = 64 * 1024 * 1024;
    const chunk = new Uint8Array(1024 * 1024);
    let sent = 0;
    const cancel = vi.fn();
    const stream = new ReadableStream({ pull(controller) {
      sent += 1;
      controller.enqueue(sent <= 64 ? chunk : new Uint8Array(1));
    }, cancel });
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jobId: JOB_ID, status: 'completed', download: {
        url: 'https://usd8-results.s3.eu-central-1.amazonaws.com/result.json',
        sha256: '00'.repeat(32), bytes: limit, expiresInSeconds: 300,
      } })))
      .mockResolvedValueOnce(new Response(stream, { headers: header === 'lying' ? { 'content-length': String(limit) } : {} })));
    const { prepareSettlement } = await loadClaimApi();
    await expect(prepareSettlement(5n, { ...SETTLEMENT_SNAPSHOT, chainId: 11155111,
      registry: REGISTRY, defiInsurance: DEFI_INSURANCE, pollIntervalMs: 0,
    })).rejects.toThrow('corrupt settlement download');
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('rejects a declared result above 64 MiB before downloading', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jobId: JOB_ID, status: 'completed', download: {
        url: 'https://usd8-results.s3.eu-central-1.amazonaws.com/result.json',
        sha256: '00'.repeat(32), bytes: 64 * 1024 * 1024 + 1, expiresInSeconds: 300,
      } }))));
    const { prepareSettlement } = await loadClaimApi();
    await expect(prepareSettlement(5n, { ...SETTLEMENT_SNAPSHOT, chainId: 11155111,
      registry: REGISTRY, defiInsurance: DEFI_INSURANCE, pollIntervalMs: 0,
    })).rejects.toThrow('invalid settlement download');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each(['truncated', 'wrong-job', 'wrong-schema', 'wrong-status', 'invalid-json', 'wrong-chain'])('rejects integrity-bound %s downloaded terminals', async (mode) => {
    const terminal = { schemaVersion: 1, ...completedSettlementJob() };
    if (mode === 'wrong-job') terminal.jobId = 'b'.repeat(64);
    if (mode === 'wrong-schema') terminal.schemaVersion = 2;
    if (mode === 'wrong-status') terminal.status = 'pending';
    if (mode === 'wrong-chain') terminal.payload.artifact.chainId = 1;
    const bytes = new TextEncoder().encode(mode === 'invalid-json' ? '{' : JSON.stringify(terminal));
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jobId: JOB_ID, status: 'completed', download: {
        url: 'https://usd8-results.s3.eu-central-1.amazonaws.com/result.json',
        sha256: createHash('sha256').update(bytes).digest('hex'),
        bytes: bytes.length + (mode === 'truncated' ? 1 : 0), expiresInSeconds: 300,
      } })))
      .mockResolvedValueOnce(new Response(bytes)));
    const { prepareSettlement } = await loadClaimApi();
    await expect(prepareSettlement(5n, { ...SETTLEMENT_SNAPSHOT, chainId: 11155111,
      registry: REGISTRY, defiInsurance: DEFI_INSURANCE, pollIntervalMs: 0,
    })).rejects.toThrow();
  });

  it('rejects a downloaded terminal with the wrong digest', async () => {
    const terminal = JSON.stringify({ schemaVersion: 1, ...completedSettlementJob() });
    const bytes = new TextEncoder().encode(terminal);
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        jobId: JOB_ID,
        status: 'completed',
        download: {
          url: 'https://usd8-results.s3.eu-central-1.amazonaws.com/result.json',
          sha256: '00'.repeat(32),
          bytes: bytes.length,
          expiresInSeconds: 300,
        },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(bytes, { status: 200 })));
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
    })).rejects.toThrow('Claim service returned a corrupt settlement download.');
  });
});
