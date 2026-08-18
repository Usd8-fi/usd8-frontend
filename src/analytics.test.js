import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const bookConfig = readFileSync(resolve(process.cwd(), 'book.toml'), 'utf8');

describe('Google Analytics', () => {
  it('loads the existing USD8 analytics on the app and every docs page from one source', () => {
    expect(appHtml).toContain('<script type="module" src="./analytics.js"></script>');
    expect(bookConfig).toMatch(/additional-js = \[[^\]]*"analytics\.js"/);

    const analytics = readFileSync(resolve(process.cwd(), 'analytics.js'), 'utf8');
    expect(analytics).toContain("G-XZ3M0DQJ6M");
    expect(analytics).toContain('https://www.googletagmanager.com/gtag/js?id=');
    expect(analytics).toContain("gtag('config', '${gaMeasurementId}')");
  });
});
