import { afterEach, describe, expect, it, vi } from 'vitest';

const INSURED_TOKEN = '0x6e5eb99a5923bEA10Eb3990Ec8Da84e70007E668';
const REGISTRY = '0x7d09C1e9eE03350A177C2a542E90285B55E8a218';
const DEFI_INSURANCE = '0xC74439a7a3d5Db8A48766A5fc2d200bd2858026d';
const JOB_ID = 'a'.repeat(64);
const SIGNATURE = `0x${'11'.repeat(65)}`;

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
  it('explains when the precheck finds no qualifying price drop', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({
      error: 'PRICE_DROP_NOT_DETECTED',
    }), { status: 422 })));
    const { prepareIncidentOpen } = await loadClaimApi();

    await expect(prepareIncidentOpen(INSURED_TOKEN, {
      chainId: 11155111,
      registry: REGISTRY,
      defiInsurance: DEFI_INSURANCE,
    })).rejects.toThrow('No qualifying 20% price drop was detected.');
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
