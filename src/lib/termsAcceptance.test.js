import { describe, expect, it, vi } from 'vitest';
import { hasAcceptedTerms, recordTermsAcceptance, rememberTermsAccepted, TERMS_VERSION } from './termsAcceptance.js';

function memoryStorage() {
  const data = {};
  return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = String(v); }, data };
}

describe('terms acceptance', () => {
  it('remembers acceptance per address and terms version only', () => {
    const storage = memoryStorage();
    const address = '0xB446b0c85cc4ef5f5Ebf495C4FDD38eCc5284176';
    expect(hasAcceptedTerms(address, storage)).toBe(false);
    rememberTermsAccepted(address, storage);
    expect(hasAcceptedTerms(address.toLowerCase(), storage)).toBe(true);
    expect(hasAcceptedTerms('0x0000000000000000000000000000000000000001', storage)).toBe(false);
    storage.setItem('usd8.termsAccepted', JSON.stringify({ [address.toLowerCase()]: '2000-01-01' }));
    expect(hasAcceptedTerms(address, storage)).toBe(false);
    storage.setItem('usd8.termsAccepted', 'not json');
    expect(hasAcceptedTerms(address, storage)).toBe(false);
  });

  it('records acceptance without a signature and never throws', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 204 }));
    await expect(recordTermsAcceptance('0xabc', { fetchImpl })).resolves.toBe(true);
    const [, options] = fetchImpl.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ address: '0xabc', termsVersion: TERMS_VERSION });

    const failing = vi.fn(async () => { throw new Error('offline'); });
    await expect(recordTermsAcceptance('0xabc', { fetchImpl: failing, attempts: 2, delayMs: 0 })).resolves.toBe(false);
    expect(failing).toHaveBeenCalledTimes(2);
  });
});
