import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const bookConfig = readFileSync(resolve(process.cwd(), 'book.toml'), 'utf8');
const docsTheme = readFileSync(resolve(process.cwd(), 'docs-theme.js'), 'utf8');
const description = 'USD8 is a stablecoin with built-in DeFi insurance, onchain claims, and permissionless cover pools.';

describe('browser page titles', () => {
  it('uses the exact app and docs titles', () => {
    expect(appHtml).toContain('<title>USD8</title>');
    expect(bookConfig).toContain('title = "USD8 docs"');
    expect(docsTheme).toContain('document.title = "USD8 docs";');
  });

  it('publishes canonical search and social metadata for the beta app', () => {
    expect(appHtml).toContain(`<meta name="description" content="${description}" />`);
    expect(appHtml).toContain('<link rel="canonical" href="https://usd8.fi/beta/" />');
    expect(appHtml).toContain('<meta property="og:type" content="website" />');
    expect(appHtml).toContain('<meta property="og:title" content="USD8" />');
    expect(appHtml).toContain(`<meta property="og:description" content="${description}" />`);
    expect(appHtml).toContain('<meta property="og:url" content="https://usd8.fi/beta/" />');
    expect(appHtml).toContain('<meta property="og:image" content="https://usd8.fi/beta/og-image.png" />');
    expect(appHtml).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(appHtml).toContain('<meta name="twitter:image" content="https://usd8.fi/beta/og-image.png" />');
  });

  it('ships a 1200 by 630 PNG social preview', () => {
    const imagePath = resolve(process.cwd(), 'public/og-image.png');
    expect(existsSync(imagePath)).toBe(true);
    const image = readFileSync(imagePath);
    expect(image.subarray(1, 4).toString()).toBe('PNG');
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  });
});
