import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const root = process.cwd();
const script = readFileSync(resolve(root, 'anti-scam-check.js'), 'utf8');
const page = readFileSync(resolve(root, 'book-src/anti-scam-check.md'), 'utf8');
const css = readFileSync(resolve(root, 'theme/css/usd8-docs.css'), 'utf8');
const bookToml = readFileSync(resolve(root, 'book.toml'), 'utf8');

const flush = () => new Promise((done) => setTimeout(done, 20));

describe('Anti-Scam Check docs page', () => {
  beforeAll(() => {
    document.body.innerHTML = page;
    window.eval(script);
  });

  it('is loaded by mdBook and hidden from the sidebar, page arrows and search', () => {
    expect(bookToml).toContain('"anti-scam-check.js"');
    expect(css).toContain('#mdbook-sidebar li:has(> .chapter-link-wrapper > a[href$="anti-scam-check.html"])');
    expect(css).toContain('a.nav-chapters[href$="anti-scam-check.html"]');
    expect(css).toContain('#mdbook-searchresults li:has(a[href*="anti-scam-check.html"])');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });

  it('stores the official handles only as SHA-256 digests (1 Telegram, 2 X)', () => {
    const { official } = window.usd8AntiScam;
    expect(official.telegram).toHaveLength(1);
    expect(official.x).toHaveLength(2);
    for (const digest of [...official.telegram, ...official.x]) expect(digest).toMatch(/^[0-9a-f]{64}$/);
    // Test-only handles below; the real ones never appear in source.
    official.telegram.push(createHash('sha256').update('telegram:usd8_test_tg').digest('hex'));
    official.x.push(createHash('sha256').update('x:usd8_test_x').digest('hex'));
  });

  it.each([
    ['telegram', 'usd8_test_tg', 'official'],
    ['telegram', '@USD8_Test_TG', 'official'],
    ['telegram', 'https://t.me/usd8_test_tg', 'official'],
    ['telegram', 'usd8_test_tgg', 'unknown'],
    ['telegram', 'usd8_test_x', 'unknown'],
    ['telegram', 'abc', 'invalid'],
    ['x', 'usd8_test_x', 'official'],
    ['x', '@USD8_Test_X', 'official'],
    ['x', 'https://x.com/usd8_test_x?s=20', 'official'],
    ['x', 'twitter.com/usd8_test_x', 'official'],
    ['x', 'usd8testx', 'unknown'],
    ['x', 'usd8_test_tg', 'unknown'],
    ['x', 'bad handle!', 'invalid'],
  ])('%s %s -> %s', async (platform, value, state) => {
    expect((await window.usd8AntiScam.verify(platform, value)).state).toBe(state);
  });

  it('shows the verdict inline under the matching input', async () => {
    const telegram = document.querySelector('[data-platform="telegram"]');
    telegram.querySelector('input').value = 'usd8_test_tg';
    telegram.querySelector('button').click();
    await flush();
    const result = telegram.querySelector('.anti-scam-result');
    expect(result.dataset.state).toBe('official');
    expect(result.textContent).toBe('@usd8_test_tg is an official USD8 Telegram account.');

    const x = document.querySelector('[data-platform="x"]');
    x.querySelector('input').value = 'usd8_fl';
    x.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await flush();
    expect(x.querySelector('.anti-scam-result').dataset.state).toBe('unknown');
    expect(x.querySelector('.anti-scam-result').textContent).toMatch(/^@usd8_fl is not an official USD8 X account\./);

    x.querySelector('input').dispatchEvent(new Event('input'));
    expect(x.querySelector('.anti-scam-result').textContent).toBe('');
  });
});
