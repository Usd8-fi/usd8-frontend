import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const bookConfig = readFileSync(resolve(process.cwd(), 'book.toml'), 'utf8');
const docsTheme = readFileSync(resolve(process.cwd(), 'docs-theme.js'), 'utf8');

describe('browser page titles', () => {
  it('uses the exact app and docs titles', () => {
    expect(appHtml).toContain('<title>USD8</title>');
    expect(bookConfig).toContain('title = "USD8 docs"');
    expect(docsTheme).toContain('document.title = "USD8 docs";');
  });
});
