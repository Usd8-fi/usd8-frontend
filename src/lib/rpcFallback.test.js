import { afterEach, describe, expect, it, vi } from 'vitest';
import { rpcTransportFor } from './chainData.js';
import { getNetwork } from './networkConfig.js';
import { mainnet } from './viemLite.js';

const PRIMARY = 'https://primary.example/';
const BACKUP = 'https://backup.example/';

function stubFetch(handler) {
  const calls = [];
  vi.stubGlobal('fetch', vi.fn(async (url, init) => {
    calls.push(String(url));
    return handler(String(url), JSON.parse(init.body));
  }));
  return calls;
}
const ok = (body) => new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: '0x1' }), { status: 200, headers: { 'content-type': 'application/json' } });

afterEach(() => vi.unstubAllGlobals());

describe('mainnet RPC fallback', () => {
  it('configures a second public mainnet RPC behind the primary', () => {
    const network = getNetwork(1);
    expect(network.rpcUrl).toBe('https://ethereum-rpc.publicnode.com');
    expect(network.rpcFallbackUrls).toEqual(['https://mainnet.gateway.tenderly.co']);
  });

  it('uses only the primary while it answers', async () => {
    const calls = stubFetch((url, body) => ok(body));
    const transport = rpcTransportFor(PRIMARY, [BACKUP])({ chain: mainnet, retryCount: 0 });
    await expect(transport.request({ method: 'eth_chainId' })).resolves.toBe('0x1');
    expect(calls).toEqual([PRIMARY]);
  });

  it('switches to the backup when the primary is rate limited or down', async () => {
    const calls = stubFetch((url, body) => (url === PRIMARY ? new Response('busy', { status: 429 }) : ok(body)));
    const transport = rpcTransportFor(PRIMARY, [BACKUP])({ chain: mainnet, retryCount: 0 });
    await expect(transport.request({ method: 'eth_chainId' })).resolves.toBe('0x1');
    expect(calls.at(-1)).toBe(BACKUP);
  });

  it('does not fall back on a contract revert', async () => {
    const calls = stubFetch((url, body) => new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, error: { code: 3, message: 'execution reverted' } }), { status: 200, headers: { 'content-type': 'application/json' } }));
    const transport = rpcTransportFor(PRIMARY, [BACKUP])({ chain: mainnet, retryCount: 0 });
    await expect(transport.request({ method: 'eth_call', params: [{ to: '0x0000000000000000000000000000000000000001', data: '0x' }, 'latest'] })).rejects.toThrow();
    expect(calls.every((url) => url === PRIMARY)).toBe(true);
  });

  it('keeps a single endpoint as a plain transport', () => {
    expect(rpcTransportFor(PRIMARY)({ chain: mainnet }).config.type).toBe('http');
    expect(rpcTransportFor(PRIMARY, [BACKUP])({ chain: mainnet }).config.type).toBe('fallback');
  });
});
