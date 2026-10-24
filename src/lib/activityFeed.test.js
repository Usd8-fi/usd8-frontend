import { toFunctionSelector } from 'viem';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatTokenAmount, fetchActivity, shortAddress } from './activityFeed.js';
import { getProtocolNetwork, PROTOCOL_CHAIN_ID } from './networkConfig.js';
import { poolWriteAbi, treasuryWriteAbi, claimWriteAbi } from './writeAbis.js';

const network = getProtocolNetwork(PROTOCOL_CHAIN_ID);
const { treasury, defiInsurance, usd8 } = network.contracts;
const pool = network.contracts.coverPools[0];
const user = '0x8ca72D405CFa5128f2623AAB437A8741c57983a7';
const other = '0xB446b0c85cc4ef5f5Ebf495C4FDD38eCc5284176';
const hash = n => `0x${String(n).padStart(64, '0')}`;
const tx = (n, to, method, extra = {}) => ({
  hash: hash(n), block_number: 1000 + n, timestamp: `2026-10-15T0${n}:00:00.000000Z`, status: 'ok', result: 'success',
  method, from: { hash: user }, to: { hash: to }, ...extra,
});
const transfer = (n, from, to, value, type = 'token_transfer', symbol = 'USD8') => ({
  transaction_hash: hash(n), type, from: { hash: from }, to: { hash: to },
  total: { value, decimals: '18' }, token: { symbol, decimals: '18' },
});

function mockIndex(routes) {
  const fetchMock = vi.fn(async (url) => {
    const path = String(url).replace(network.explorerApiUrl, '');
    const body = routes[path];
    if (body === undefined) return { ok: false, status: 404, json: async () => ({}) };
    return { ok: true, json: async () => ({ items: body }) };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
afterEach(() => vi.unstubAllGlobals());

describe('activity selectors', () => {
  it('match the function ABIs the app calls', () => {
    const selector = (abi, name) => toFunctionSelector(abi.find(item => item.name === name));
    expect(selector(treasuryWriteAbi, 'mintUSD8')).toBe('0x8d097228');
    expect(selector(treasuryWriteAbi, 'redeemUSD8')).toBe('0xd2840edb');
    expect(selector(poolWriteAbi, 'deposit')).toBe('0x6e553f65');
    expect(selector(poolWriteAbi, 'requestRedeem')).toBe('0xaa2f892d');
    expect(selector(poolWriteAbi, 'completeRedeem')).toBe('0x59d76fe7');
    expect(selector(poolWriteAbi, 'claimReward')).toBe('0xb88a802f');
    expect(selector(claimWriteAbi, 'fileClaim')).toBe('0x7dd2ac69');
    expect(selector(claimWriteAbi, 'finalizeClaim')).toBe('0x2ebab592');
    expect(toFunctionSelector('receiveProfitDistribution(uint256)')).toBe('0x94419e75');
  });
});

describe('formatting', () => {
  it('truncates exactly, with no grouping', () => {
    expect(formatTokenAmount('20000000000000000000', 18)).toBe('20');
    expect(formatTokenAmount('1234567890000000000000', 18)).toBe('1234.5678');
    expect(formatTokenAmount('999999999999999999', 18)).toBe('0.9999');
    expect(formatTokenAmount('1', 18)).toBe('<0.0001');
    expect(formatTokenAmount('0', 18)).toBeNull();
    expect(formatTokenAmount('nope', 18)).toBeNull();
    expect(formatTokenAmount('5', 'x')).toBeNull();
  });
  it('shortens addresses', () => {
    expect(shortAddress(user)).toBe('0x8ca7…83a7');
    expect(shortAddress('bad')).toBeNull();
  });
});

describe('fetchActivity', () => {
  const routes = () => ({
    [`/addresses/${treasury}/transactions`]: [tx(1, treasury, '0x8d097228'), tx(2, treasury, '0xd2840edb', { from: { hash: other } })],
    [`/addresses/${defiInsurance}/transactions`]: [tx(5, defiInsurance, 'settleIncident'), tx(6, defiInsurance, '0x2ebab592')],
    [`/addresses/${pool.address}/transactions`]: [
      tx(3, pool.address, '0x6e553f65'), tx(4, pool.address, '0x94419e75', { from: { hash: other } }),
      tx(7, pool.address, 'requestRedeem'), tx(8, pool.address, '0xdeadbeef'),
      { ...tx(9, pool.address, '0x6e553f65'), status: 'error', result: 'out_of_gas' },
      tx(9, '0x0000000000000000000000000000000000000001', '0x6e553f65'),
    ],
    [`/tokens/${usd8}/transfers`]: [
      transfer(1, '0x0000000000000000000000000000000000000000', user, '20000000000000000000', 'token_minting'),
      transfer(2, other, '0x0000000000000000000000000000000000000000', '5500000000000000000', 'token_burning'),
      transfer(4, other, pool.address, '10000000000000000000'),
    ],
    [`/addresses/${pool.address}/token-transfers`]: [
      transfer(6, pool.address, '0x00000000000000000000000000000000000fee01', '1000000000000000000', 'token_transfer', 'wstETH'),
      transfer(6, pool.address, user, '4000000000000000000', 'token_transfer', 'wstETH'),
      transfer(3, user, pool.address, '9000000000000000000', 'token_transfer', 'wstETH'),
      transfer(4, other, pool.address, '10000000000000000000'),
    ],
  });

  it('builds a newest-first feed of real, successful actions with amounts', async () => {
    mockIndex(routes());
    const feed = await fetchActivity(network);
    expect(feed.map(item => item.hash)).toEqual([7, 6, 5, 4, 3, 2, 1].map(hash));
    const line = item => [item.actor, item.action, item.amount, item.target].filter(Boolean).join(' ');
    expect(feed.find(item => item.hash === hash(1)).block).toBe(1001);
    expect(line(feed.find(item => item.hash === hash(1)))).toBe('0x8ca7…83a7 minted 20 USD8');
    expect(line(feed.find(item => item.hash === hash(2)))).toBe('0xB446…4176 redeemed 5.5 USD8');
    expect(line(feed.find(item => item.hash === hash(3)))).toBe('0x8ca7…83a7 deposited 9 wstETH into the wstETH cover pool');
    expect(line(feed.find(item => item.hash === hash(4)))).toBe('rewards added: 10 USD8 to the wstETH cover pool');
    expect(line(feed.find(item => item.hash === hash(5)))).toBe('incident settled');
    expect(line(feed.find(item => item.hash === hash(6)))).toBe('0x8ca7…83a7 received a claim payout 4 wstETH');
    expect(line(feed.find(item => item.hash === hash(7)))).toBe('0x8ca7…83a7 queued an exit from the wstETH cover pool');
  });

  it('skips failed, unknown and foreign transactions', async () => {
    mockIndex(routes());
    const feed = await fetchActivity(network);
    expect(feed.some(item => item.hash === hash(9))).toBe(false);
    expect(feed.some(item => item.hash === hash(8))).toBe(false);
  });

  it('still lists actions when the amount index is unavailable', async () => {
    const all = routes();
    delete all[`/tokens/${usd8}/transfers`];
    mockIndex(all);
    const feed = await fetchActivity(network);
    const mint = feed.find(item => item.hash === hash(1));
    expect(mint.amount).toBeNull();
    expect(mint.target).toBe('USD8');
  });

  it('rejects when nothing could be read and is empty without an index', async () => {
    mockIndex({});
    await expect(fetchActivity(network)).rejects.toThrow();
    expect(await fetchActivity({ ...network, explorerApiUrl: undefined })).toEqual([]);
  });

  it('makes only explorer HTTP requests, one per source', async () => {
    const fetchMock = mockIndex(routes());
    await fetchActivity(network);
    // treasury + insurance + USD8 transfers + 2 per cover pool
    expect(fetchMock).toHaveBeenCalledTimes(3 + 2 * network.contracts.coverPools.length);
  });
});
