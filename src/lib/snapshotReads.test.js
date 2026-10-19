import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TimeoutError } from 'viem';
import { queryClient } from './dataCache.js';
import { snapshotReads } from './snapshotReads.js';

const network = { id: 11155111, contracts: { registry: '0x01', defiInsurance: '0x02' } };
const descriptors = [{ resource: 'head', call: { functionName: 'activeIncidentId' }, fallback: 0n }];
const RPC_MESSAGE = 'RPC error: Unable to read blockchain data. The RPC request failed or timed out. Please try again.';

beforeEach(() => queryClient.clear());

describe('snapshot RPC errors', () => {
  it('identifies a timed-out RPC instead of displaying the generic viem timeout', async () => {
    const cause = new TimeoutError({ url: 'https://rpc.example/private-key', body: { method: 'eth_call' } });
    const error = Object.assign(new Error('Contract read failed'), { name: 'ContractFunctionExecutionError', cause });
    const client = { multicall: vi.fn().mockRejectedValue(error) };
    const result = await snapshotReads(client, network, descriptors, { account: '0x00' });
    expect(result.errors.head).toBe(RPC_MESSAGE);
    expect(result.values).toEqual([0n]);
    expect(result.blockNumber).toBeUndefined();
    expect(client.multicall).toHaveBeenCalledTimes(1);
    expect(result.errors.head).not.toContain('private-key');
  });
});
