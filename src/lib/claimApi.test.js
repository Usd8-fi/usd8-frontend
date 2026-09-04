import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';

const INSURED_TOKEN = '0x6e5eb99a5923bEA10Eb3990Ec8Da84e70007E668';
const REGISTRY = '0xB34D92cd05005DF36050370433819597a9BaC693';
const DEFI_INSURANCE = '0x4E346CcD0a46D51ebaE6810d653791982968d502';
const JOB_ID = 'a'.repeat(64);
const SIGNATURE = `0x${'11'.repeat(65)}`;
const SETTLEMENT_ROOT = '0x91cabe04b0bfad6e34acf4d7657edeeeeb76a09500fb629354a6c0d9551b3220';
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
        schemaVersion: 1,
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

async function loadClaimApi() {
  vi.resetModules();
  vi.stubEnv('VITE_CLAIM_API_URL', 'https://claims.example');
  return import('./claimApi.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('prepareIncidentOpen', () => {
  it.each(['production', 'development'])('never embeds a loopback claim API in a %s frontend build', async (mode) => {
    vi.resetModules();
    vi.stubEnv('MODE', mode);
    vi.stubEnv('VITE_CLAIM_API_URL', 'http://127.0.0.1:8788');

    const { CLAIM_API_BASE_URL } = await import('./claimApi.js');

    expect(CLAIM_API_BASE_URL).toBe('https://wmzdww7bxb.execute-api.eu-central-1.amazonaws.com');
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

  it('derives omitted claim proofs from the complete root-bound row set', async () => {
    const root = '0x91cabe04b0bfad6e34acf4d7657edeeeeb76a09500fb629354a6c0d9551b3220';
    const claimant1Leaf = '0x77a0872d78b0f7206252cef20926d46fc24f012f429cccf3c07e8d3f3361964d';
    const claimant2Leaf = '0xcb4fc0164c12adfadd59fd863b1f55a265d6d1d3e80458ac72e6b649e8ca78f9';
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true, jobId: JOB_ID }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        jobId: JOB_ID,
        status: 'completed',
        payload: {
          artifact: {
            schemaVersion: 1,
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
            schemaVersion: 1,
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
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(1_000)
      .mockReturnValueOnce(1_000)
      .mockReturnValueOnce(1_000)
      .mockReturnValue(1_001);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        accepted: true,
        jobId: JOB_ID,
      }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        jobId: JOB_ID,
        status: 'pending',
      }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { prepareSettlement } = await loadClaimApi();

    await expect(prepareSettlement(5n, {
      ...SETTLEMENT_SNAPSHOT,
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
      pollIntervalMs: 0,
      maxWaitMs: 0,
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
