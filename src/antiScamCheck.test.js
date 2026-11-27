import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const root = process.cwd();
const script = readFileSync(resolve(root, 'anti-scam-check.js'), 'utf8');
const branding = readFileSync(resolve(root, 'book-src/branding.md'), 'utf8');
const page = branding.slice(branding.indexOf('## Anti-Scam Check'));
const css = readFileSync(resolve(root, 'theme/css/usd8-docs.css'), 'utf8');
const bookToml = readFileSync(resolve(root, 'book.toml'), 'utf8');

const flush = () => new Promise((done) => setTimeout(done, 20));

describe('Anti-Scam Check section on the Branding and Assets page', () => {
  beforeAll(() => {
    document.body.innerHTML = page;
    window.eval(script);
  });

  it('sits at the bottom of Branding and Assets, which stays indexable, and the old page redirects there', () => {
    expect(bookToml).toContain('"anti-scam-check.js"');
    expect(branding.startsWith('# Branding and Assets\n')).toBe(true);
    expect(page.startsWith('## Anti-Scam Check\n')).toBe(true);
    expect(page.slice(3)).not.toMatch(/^## /m);
    expect(bookToml).toContain('"/anti-scam-check.html" = "branding.html#anti-scam-check"');
    expect(css).not.toContain('anti-scam-check.html');
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('stores the official handles only as SHA-256 digests (1 Telegram, 3 X, 1 email)', () => {
    const { official } = window.usd8AntiScam;
    expect(official.telegram).toHaveLength(1);
    expect(official.x).toHaveLength(3);
    expect(official.email).toHaveLength(1);
    for (const digest of [...official.telegram, ...official.x, ...official.email]) expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(script).not.toMatch(/@usd8\.fi/);
    // Test-only handles below; the real ones never appear in source.
    official.telegram.push(createHash('sha256').update('telegram:usd8_test_tg').digest('hex'));
    official.x.push(createHash('sha256').update('x:usd8_test_x').digest('hex'));
    official.email.push(createHash('sha256').update('email:test@usd8.example').digest('hex'));
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
    ['email', 'test@usd8.example', 'official'],
    ['email', ' Test@USD8.example ', 'official'],
    ['email', 'mailto:test@usd8.example', 'official'],
    ['email', 'Rick <test@usd8.example>', 'official'],
    ['email', 'test@usd8-example.com', 'unknown'],
    ['email', 'tests@usd8.example', 'unknown'],
    ['email', 'usd8_test_x', 'invalid'],
    ['email', 'test@usd8', 'invalid'],
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

    const email = document.querySelector('[data-platform="email"]');
    expect(email.querySelector('.anti-scam-prefix')).toBeNull();
    email.querySelector('input').value = 'test@usd8.example';
    email.querySelector('button').click();
    await flush();
    expect(email.querySelector('.anti-scam-result').textContent).toBe('test@usd8.example is an official USD8 email address.');
    email.querySelector('input').value = 'rick@usd8-fi.com';
    email.querySelector('button').click();
    await flush();
    expect(email.querySelector('.anti-scam-result').textContent).toMatch(/^rick@usd8-fi\.com is not an official USD8 email address\./);
  });
});
