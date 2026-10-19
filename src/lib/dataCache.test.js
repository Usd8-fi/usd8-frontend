import { describe, expect, it, vi } from 'vitest';
import { cachedData, protocolKey } from './dataCache.js';
import { MULTICALL3_ADDRESS, MULTICALL_BATCH_BYTES, snapshotReads } from './snapshotReads.js';

const network = { id: 1, contracts: { registry: '0xAA', defiInsurance: '0xBB' } };
const descriptors = [
  { resource: 'account-balances', call: { functionName: 'balanceOf' }, fallback: 0n },
  { resource: 'pool:a', call: { functionName: 'totalAssets' }, fallback: 0n },
];
const ok = result => ({ status: 'success', result });

describe('resource snapshots', () => {
  it('batches cold resources, reuses warm reads, and refreshes only affected contracts at the receipt block', async () => {
    const client = { multicall: vi.fn().mockResolvedValueOnce([ok(4n), ok(20n)]).mockResolvedValueOnce([ok(8n)]) };
    const options = { account: '0x123', blockNumber: 100n };
    expect((await snapshotReads(client, network, descriptors, options)).values).toEqual([4n, 20n]);
    await snapshotReads(client, network, descriptors, options);
    expect(client.multicall).toHaveBeenCalledTimes(1);
    const updated = await snapshotReads(client, network, descriptors, { ...options, blockNumber: 101n, refresh: true, resources: ['account-balances'] });
    expect(updated.values).toEqual([8n, 20n]);
    expect(client.multicall).toHaveBeenLastCalledWith({ contracts: [descriptors[0].call], allowFailure: true, blockNumber: 101n, batchSize: MULTICALL_BATCH_BYTES });
  });
  it('reads the latest block inside the same batch instead of a separate eth_blockNumber call', async () => {
    const client = { multicall: vi.fn().mockResolvedValue([ok(4n), ok(20n), ok(250n)]), getBlockNumber: vi.fn() };
    const result = await snapshotReads(client, { ...network, id: 11 }, descriptors, { account: '0x123' });
    expect(result.values).toEqual([4n, 20n]);
    expect(result.blockNumber).toBe(250n);
    expect(client.getBlockNumber).not.toHaveBeenCalled();
    expect(client.multicall).toHaveBeenCalledTimes(1);
    const { contracts, blockNumber, batchSize } = client.multicall.mock.calls[0][0];
    expect(contracts.at(-1)).toMatchObject({ address: MULTICALL3_ADDRESS, functionName: 'getBlockNumber' });
    expect(blockNumber).toBeUndefined();
    expect(batchSize).toBe(MULTICALL_BATCH_BYTES);
  });
  it('repeats the batch at the receipt block when the node answers from behind it', async () => {
    const client = { multicall: vi.fn().mockResolvedValueOnce([ok(1n), ok(2n), ok(99n)]).mockResolvedValueOnce([ok(4n), ok(20n)]) };
    const result = await snapshotReads(client, { ...network, id: 12 }, descriptors, { account: '0x123', minBlock: 100n });
    expect(result.values).toEqual([4n, 20n]);
    expect(result.blockNumber).toBe(100n);
    expect(client.multicall).toHaveBeenCalledTimes(2);
    expect(client.multicall.mock.calls[1][0].blockNumber).toBe(100n);
  });
  it('keeps successful wallet data when a pool read fails', async () => {
    const client = { multicall: vi.fn().mockResolvedValue([ok(4n), { status: 'failure', error: new Error('pool offline') }]) };
    const result = await snapshotReads(client, network, descriptors, { account: '0x123', blockNumber: 100n });
    expect(result.values).toEqual([4n, 0n]);
    expect(result.errors).toEqual({ 'pool:a': 'pool offline' });
  });
  it('isolates accounts and chains while sharing public pool reads', async () => {
    const client = { multicall: vi.fn().mockResolvedValueOnce([ok(4n), ok(20n)]).mockResolvedValueOnce([ok(7n)]).mockResolvedValueOnce([ok(8n), ok(9n)]) };
    await snapshotReads(client, network, descriptors, { account: '0x123', blockNumber: 100n });
    expect((await snapshotReads(client, network, descriptors, { account: '0x456', blockNumber: 100n })).values).toEqual([7n, 20n]);
    expect((await snapshotReads(client, { ...network, id: 2 }, descriptors, { account: '0x123', blockNumber: 100n })).values).toEqual([8n, 9n]);
  });
});

describe('shared requests', () => {
  it('deduplicates in-flight requests without one subscriber aborting another', async () => {
    let resolve;
    let querySignal;
    const fetcher = vi.fn(({ signal }) => { querySignal = signal; return new Promise(done => { resolve = done; }); });
    const first = new AbortController();
    const key = protocolKey(network, 'test');
    const a = cachedData(key, fetcher, { signal: first.signal });
    const b = cachedData(key, fetcher);
    const rejected = expect(a).rejects.toMatchObject({ name: 'AbortError' });
    first.abort();
    await rejected;
    expect(querySignal.aborted).toBe(false);
    resolve(42);
    expect(await b).toBe(42);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('aborts the underlying query when its last subscriber leaves', async () => {
    let signal;
    const controller = new AbortController();
    const request = cachedData(['aborted'], context => { signal = context.signal; return new Promise(() => {}); }, { signal: controller.signal });
    const rejected = expect(request).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await rejected;
    expect(signal.aborted).toBe(true);
  });
});
