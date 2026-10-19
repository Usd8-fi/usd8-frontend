import { describe, expect, it } from 'vitest';
import { custom } from 'viem';
import { sepolia } from 'viem/chains';
import { createReadClient } from './readClient.js';

describe('createReadClient', () => {
  it('exposes only the reads the data layer uses', () => {
    const client = createReadClient({ chain: sepolia, transport: custom({ request: async () => null }) });
    expect(Object.keys(client).sort()).toEqual(['chain', 'getBlock', 'getBlockNumber', 'getLogs', 'multicall', 'readContract']);
  });

  it('sends reads through the configured transport', async () => {
    const methods = [];
    const client = createReadClient({
      chain: sepolia,
      transport: custom({ request: async ({ method }) => { methods.push(method); return '0x2a'; } }),
    });
    expect(await client.getBlockNumber({ cacheTime: 0 })).toBe(42n);
    expect(methods).toEqual(['eth_blockNumber']);
  });
});
