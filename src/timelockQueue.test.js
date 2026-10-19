import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const queueScript = readFileSync(resolve(process.cwd(), 'timelock-queue.js'), 'utf8');
const selectorScript = readFileSync(resolve(process.cwd(), 'timelock-selectors.js'), 'utf8');
const bookConfig = readFileSync(resolve(process.cwd(), 'book.toml'), 'utf8');
const page = readFileSync(resolve(process.cwd(), 'book-src/addresses.md'), 'utf8');
const summary = readFileSync(resolve(process.cwd(), 'book-src/SUMMARY.md'), 'utf8');

const TIMELOCK = '0x0fbcC6ba689e4696Dd501F2E750f43729F851517';
const TREASURY = '0x0EaE2d44dfeb2154F60CD702Dc2C9c5aBb090F05';
const REGISTRY = '0x9BfF24a44Bb20F8D1f1dE86EcA56295c5Bb46430';
const NEW_STRATEGY = '0x1111111111111111111111111111111111111111';
const CALL_SCHEDULED = '0x4cf4410cc57040e44862ef0f45f3dd5a5e02db8eb8add648d4b0e236f1d07dca';
const CALL_EXECUTED = '0xc2617efa69bab66782fa219543714338489c4e9e178271560a91b82c3f612b58';
const CANCELLED = '0xbaa1eb22f2a492ba1a5fea61b8df4d27c6c8b5f3971e63bb58fa14ff72eedb70';
const PROPOSER_ROLE = 'b09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1';
const NOW = Date.UTC(2026, 9, 19, 12, 0, 0);

// Real calldata, produced with `cast calldata`.
const ADD_STRATEGY = `0xc9411e22${NEW_STRATEGY.slice(2).padStart(64, '0')}${'0'.repeat(64)}`;
const SET_TIMING = `0x19fe45ca${(1800).toString(16).padStart(64, '0')}${(1200).toString(16).padStart(64, '0')}`;
const GRANT_PROPOSER = `0x2f2ff15d${PROPOSER_ROLE}${NEW_STRATEGY.slice(2).padStart(64, '0')}`;

const pad = (hex) => hex.replace(/^0x/, '').toLowerCase().padStart(64, '0');
const num = (n) => BigInt(n).toString(16).padStart(64, '0');
const id = (n) => `0x${num(n)}`;

function bytesTail(calldata) {
  const body = calldata.replace(/^0x/, '');
  return num(body.length / 2) + body.padEnd(Math.ceil(body.length / 64) * 64, '0');
}

function scheduled({ op, index = 0, target, calldata, delay = 86400, block, at, tx }) {
  return {
    topics: [CALL_SCHEDULED, id(op), id(index)],
    data: `0x${pad(target)}${num(0)}${num(160)}${num(0)}${num(delay)}${bytesTail(calldata)}`,
    block_number: block,
    block_timestamp: new Date(at).toISOString(),
    index: index,
    transaction_hash: tx,
  };
}

function finalEvent(topic, { op, block, tx }) {
  return { topics: [topic, id(op)], data: '0x', block_number: block, block_timestamp: new Date(NOW).toISOString(), index: 0, transaction_hash: tx };
}

const hash = (c) => `0x${c.repeat(64)}`;
const SHORT_STRATEGY = '0x111111\u2060…\u2060111111';

function mountPage() {
  document.body.innerHTML = `
    <div class="address-table"><table><thead><tr><th>USD8 v1 Contracts</th><th>Address</th></tr></thead><tbody>
      <tr><td>Treasury</td><td><a><code>${TREASURY}</code></a></td></tr>
      <tr><td>Registry</td><td><a><code>${REGISTRY}</code></a></td></tr>
      <tr><td>Timelock</td><td><a><code>${TIMELOCK}</code></a></td></tr>
    </tbody></table></div>
    <div id="timelock-queue" data-timelock="${TIMELOCK}" data-explorer="https://etherscan.io" data-index="https://eth.blockscout.com"></div>`;
  window.eval(selectorScript);
  window.eval(queueScript);
  return document.getElementById('timelock-queue');
}

function rows(root) {
  return [...root.querySelectorAll('tbody tr')].map((row) => [...row.cells].map((cell) => cell.textContent));
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'setInterval'] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  delete window.USD8_TIMELOCK_SELECTORS;
});

describe('Timelock Queues', () => {
  it('lists every operation newest first with status, transaction and a decoded description', async () => {
    const executedOp = scheduled({ op: 1, target: TREASURY, calldata: ADD_STRATEGY, block: 100, at: NOW - 5 * 86400e3, tx: hash('a') });
    const cancelledOp = scheduled({ op: 2, target: REGISTRY, calldata: SET_TIMING, block: 110, at: NOW - 4 * 86400e3, tx: hash('b') });
    const readyBatch = [
      scheduled({ op: 3, index: 0, target: TIMELOCK, calldata: GRANT_PROPOSER, block: 120, at: NOW - 2 * 86400e3, tx: hash('c') }),
      scheduled({ op: 3, index: 1, target: TREASURY, calldata: '0xdeadbeef', block: 120, at: NOW - 2 * 86400e3, tx: hash('c') }),
    ];
    const queuedOp = scheduled({ op: 4, target: REGISTRY, calldata: SET_TIMING, block: 130, at: NOW - 2 * 3600e3, tx: hash('d') });
    // Blockscout pages newest first.
    const page1 = { items: [queuedOp, finalEvent(CANCELLED, { op: 2, block: 125, tx: hash('e') }), ...readyBatch.reverse()], next_page_params: { block_number: 120, index: 0 } };
    const page2 = { items: [cancelledOp, finalEvent(CALL_EXECUTED, { op: 1, block: 105, tx: hash('f') }), executedOp], next_page_params: null };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => page1 })
      .mockResolvedValueOnce({ ok: true, json: async () => page2 });
    vi.stubGlobal('fetch', fetchMock);

    const root = mountPage();
    await vi.waitFor(() => expect(root.dataset.state).toBe('loaded'));

    expect(fetchMock).toHaveBeenNthCalledWith(1, `https://eth.blockscout.com/api/v2/addresses/${TIMELOCK}/logs`);
    expect(fetchMock).toHaveBeenNthCalledWith(2, `https://eth.blockscout.com/api/v2/addresses/${TIMELOCK}/logs?block_number=120&index=0`);
    expect([...root.querySelectorAll('th')].map((th) => th.textContent)).toEqual(['Transaction', 'Description', 'Status']);
    const timing = 'Registry · Set Incident Timing Config (config: (phaseWindow: 1800, maxReferenceBlockAge: 1200))';
    expect(rows(root)).toEqual([
      ['0xdddddd…dddddd', timing, 'Queued · 22h left'],
      ['0xcccccc…cccccc', `Timelock · Grant Role (role: PROPOSER_ROLE, account: ${SHORT_STRATEGY})Treasury · Unknown Call 0xdeadbeef`, 'Ready to Execute'],
      ['0xbbbbbb…bbbbbb', timing, 'Cancelled'],
      ['0xaaaaaa…aaaaaa', `Treasury · Add Strategy (s: ${SHORT_STRATEGY}, index: 0)`, 'Executed'],
    ]);
    // Queued and ready get a pulsing dot (colour by status), executed a tick.
    const statuses = [...root.querySelectorAll('tbody tr')].map((row) => row.cells[2]);
    expect(statuses.map((cell) => cell.dataset.status)).toEqual(['queued', 'ready', 'cancelled', 'executed']);
    expect(statuses.map((cell) => cell.firstChild.className)).toEqual(['timelock-status-dot', 'timelock-status-dot', 'timelock-status-dot', 'timelock-status-tick']);
    // Hover shows whole addresses.
    expect(root.querySelectorAll('tbody tr')[3].cells[1].firstChild.title).toBe(`Treasury · Add Strategy (s: ${NEW_STRATEGY}, index: 0)`);
    expect(root.querySelectorAll('tbody tr')[0].cells[0].querySelector('a').href).toBe(`https://etherscan.io/tx/${hash('d')}`);
    expect(root.querySelectorAll('tbody tr')[3].cells[2].querySelector('a').href).toBe(`https://etherscan.io/tx/${hash('f')}`);
    expect(root.querySelectorAll('tbody tr')[1].cells[1].children).toHaveLength(2);
  });

  it('counts down and flips to Ready to Execute without refetching', async () => {
    const op = scheduled({ op: 9, target: TREASURY, calldata: ADD_STRATEGY, block: 1, at: NOW - 86400e3 + 90 * 60e3, tx: hash('9') });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [op], next_page_params: null }) });
    vi.stubGlobal('fetch', fetchMock);
    const root = mountPage();
    await vi.waitFor(() => expect(root.dataset.state).toBe('loaded'));
    expect(rows(root)[0][2]).toBe('Queued · 2h left');

    vi.setSystemTime(NOW + 60 * 60e3);
    vi.advanceTimersByTime(60e3);
    expect(rows(root)[0][2]).toBe('Queued · 30m left');

    vi.setSystemTime(NOW + 91 * 60e3);
    vi.advanceTimersByTime(60e3);
    expect(rows(root)[0][2]).toBe('Ready to Execute');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('says so when nothing has been scheduled', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [], next_page_params: null }) }));
    const root = mountPage();
    await vi.waitFor(() => expect(root.dataset.state).toBe('loaded'));
    // Same table and header as with data; the message is one full-width row.
    expect([...root.querySelectorAll('thead th')].map((th) => th.textContent)).toEqual(['Transaction', 'Description', 'Status']);
    expect(rows(root)).toEqual([['No timelock transactions yet']]);
    expect(root.querySelector('tbody td').colSpan).toBe(3);
  });

  it('fails closed with a retry when the index is unreachable', async () => {
    const op = scheduled({ op: 5, target: TREASURY, calldata: ADD_STRATEGY, block: 1, at: NOW - 3600e3, tx: hash('5') });
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [op], next_page_params: null }) }));
    const root = mountPage();
    await vi.waitFor(() => expect(root.dataset.state).toBe('error'));
    expect([...root.querySelectorAll('thead th')].map((th) => th.textContent)).toEqual(['Transaction', 'Description', 'Status']);
    expect(rows(root)).toEqual([['Timelock transactions could not be loadedRetry']]);

    root.querySelector('button').click();
    await vi.waitFor(() => expect(root.dataset.state).toBe('loaded'));
    expect(rows(root)).toHaveLength(1);
  });

  it('renames the page to System Stats and loads the scripts on the docs', () => {
    expect(summary).toContain('- [System Stats](addresses.md)');
    expect(page).toMatch(/^# System Stats\n\n## Addresses\n/);
    expect(page).toContain('## Timelock Queues');
    expect(page).toContain(`data-timelock="${TIMELOCK}"`);
    expect(bookConfig).toMatch(/additional-js = \[[^\]]*"timelock-selectors\.js", "timelock-queue\.js"\]/);
  });
});
