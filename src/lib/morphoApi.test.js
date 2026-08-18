import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MORPHO_API_URL,
  MORPHO_VAULT_ADDRESS,
  MORPHO_VAULT_URL,
  fetchMorphoVault,
} from './morphoApi.js';

afterEach(() => vi.restoreAllMocks());

describe('fetchMorphoVault', () => {
  it('loads APY and link data from the same configured Morpho placeholder vault', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          vaultByAddress: {
            address: '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
            name: 'Steakhouse USDC',
            asset: { symbol: 'USDC', decimals: 6 },
            state: { netApy: 0.03314085447112559, totalAssets: 75978990159523 },
          },
        },
      }),
    });

    const result = await fetchMorphoVault();

    expect(MORPHO_VAULT_ADDRESS).toBe('0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB');
    expect(MORPHO_VAULT_URL).toBe(
      'https://app.morpho.org/ethereum/vault/0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
    );
    expect(fetchMock).toHaveBeenCalledWith(MORPHO_API_URL, expect.objectContaining({ method: 'POST' }));
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.variables).toEqual({ address: MORPHO_VAULT_ADDRESS, chainId: 1 });
    expect(result).toEqual({
      address: MORPHO_VAULT_ADDRESS,
      name: 'Steakhouse USDC',
      balance: '$75.98M',
      apy: '3.3%',
    });
  });
});
