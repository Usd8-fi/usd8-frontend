import { describe, expect, it, vi } from 'vitest';
import { fetchLogsInChunks, incrementalLogs, poolHistory } from './history.js';
import { mapLimited } from './requestUtils.js';

describe('bounded history', () => {
  it('caps concurrent RPC requests at four and rejects excessive ranges before reading', async () => {
    let running = 0; let maximum = 0;
    const client = { getLogs: vi.fn(async () => { running++; maximum = Math.max(maximum, running); await Promise.resolve(); running--; return []; }) };
    await fetchLogsInChunks(client, {}, 0n, 99_999n);
    expect(maximum).toBe(4);
    expect(client.getLogs).toHaveBeenCalledTimes(10);
    await expect(fetchLogsInChunks(client, {}, 0n, 99_999_999_999n)).rejects.toThrow('too large');
    expect(client.getLogs).toHaveBeenCalledTimes(10);
  });
  it('retains stable logs, re-reads the tail, and discards a reorged checkpoint', async () => {
    const client = { getLogs: vi.fn().mockResolvedValueOnce([{ blockNumber: 10n }, { blockNumber: 300n }]).mockResolvedValueOnce([{ blockNumber: 310n }]).mockResolvedValueOnce([{ blockNumber: 20n }]), getBlock: vi.fn().mockResolvedValue({ hash: '0xaaa' }) };
    await incrementalLogs(client, 'test', {}, 0n, 300n);
    const next = await incrementalLogs(client, 'test', {}, 0n, 310n);
    expect(next).toEqual([{ blockNumber: 10n }, { blockNumber: 310n }]);
    expect(client.getLogs).toHaveBeenLastCalledWith({ fromBlock: 173n, toBlock: 310n });
    client.getBlock.mockResolvedValue({ hash: '0xbbb' });
    expect(await incrementalLogs(client, 'test', {}, 0n, 320n)).toEqual([{ blockNumber: 20n }]);
    expect(client.getLogs).toHaveBeenLastCalledWith({ fromBlock: 0n, toBlock: 320n });
  });
  it('stops scheduling work after cancellation', async () => {
    const controller = new AbortController();
    const run = vi.fn(async () => { controller.abort(); });
    await expect(mapLimited([1, 2, 3], run, { signal: controller.signal, concurrency: 1 })).rejects.toMatchObject({ name: 'AbortError' });
    expect(run).toHaveBeenCalledTimes(1);
  });
  it('fetches only the new APR tail while preserving the original history seed', async () => {
    const client = { getBlock: vi.fn().mockResolvedValue({ hash: '0xaaa' }) };
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ block_number: 300 }, { block_number: 10 }], next_page_params: null }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ block_number: 310 }, { block_number: 10 }], next_page_params: { page: 2 } }) });
    vi.stubGlobal('fetch', fetcher);
    await poolHistory(client, 1, '0xaa', 'https://explorer.example');
    const next = await poolHistory(client, 1, '0xaa', 'https://explorer.example');
    expect(next).toEqual([{ block_number: 10 }, { block_number: 310 }]);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
