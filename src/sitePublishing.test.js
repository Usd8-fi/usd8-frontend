import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REDIRECTS, redirectPage } from '../scripts/publish-redirects.mjs';

const root = process.cwd();
const source = (path) => {
  const fullPath = resolve(root, path);
  return existsSync(fullPath) ? readFileSync(fullPath, 'utf8') : '';
};
const robots = source('public/robots.txt');
const sitemap = source('public/sitemap.xml');
const summary = source('book-src/SUMMARY.md');
const deploy = source('deploy.sh');

const validatePublishScope = (paths, { nullSeparated = false } = {}) => {
  const separator = nullSeparated ? '\0' : '\n';
  return spawnSync(
    process.execPath,
    [resolve(root, 'scripts/publish-scope.mjs'), ...(nullSeparated ? ['--null'] : [])],
    { cwd: root, encoding: 'utf8', input: `${paths.join(separator)}${separator}` },
  );
};

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
const chapterUrls = [...summary.matchAll(/\[[^\]]+\]\(([^)]+)\.md\)/g)]
  .map(([, chapter]) => `https://usd8.fi/docs/${chapter === 'usd8' ? '' : `${chapter}.html`}`);

describe('search crawler publication', () => {
  it('publishes a root crawler policy with the canonical sitemap', () => {
    expect(robots).toBe([
      'User-agent: *',
      'Allow: /',
      'Sitemap: https://usd8.fi/sitemap.xml',
      '',
    ].join('\n'));
  });

  it('includes the site root and every documentation chapter, with no retired /beta/ URLs', () => {
    expect(sitemapUrls).toContain('https://usd8.fi/');
    expect(sitemapUrls.filter((url) => url.includes('/beta'))).toEqual([]);
    for (const chapterUrl of chapterUrls) expect(sitemapUrls).toContain(chapterUrl);
    expect(new Set(sitemapUrls).size).toBe(sitemapUrls.length);
  });

  it('publishes the whole site at the domain root, keeping the custom domain', () => {
    expect(deploy).toContain('rm -rf "$wt/docs"');
    expect(deploy).toContain('git archive HEAD docs | tar -x -C "$wt/docs" --strip-components=1');
    expect(deploy).toContain('cp "$wt/docs/CNAME" "$cname"');
    expect(deploy).toContain('cp "$cname" "$wt/docs/CNAME"');
    expect(deploy).toContain('node scripts/publish-redirects.mjs "$wt/docs"');
    expect(deploy).toContain('node scripts/publish-scope.mjs');
    expect(deploy).not.toContain('docs/beta');
  });

  it('allows any site output under docs/ but never the CNAME or paths outside docs/', () => {
    expect(validatePublishScope([
      'docs/index.html',
      'docs/404.html',
      'docs/assets/app.js',
      'docs/docs/faqs.html',
      'docs/beta/index.html',
      'docs/robots.txt',
      'docs/sitemap.xml',
    ], { nullSeparated: true }).status).toBe(0);

    for (const path of ['docs/CNAME', 'deploy.sh', 'src/App.jsx', 'docsx/index.html', 'docs/../deploy.sh']) {
      const result = validatePublishScope([path]);
      expect(result.status, path).toBe(1);
      expect(result.stderr, path).toContain(path);
    }
  });
});

describe('old URL redirects', () => {
  it('forwards the retired /beta/ app and every beta docs page to the root', () => {
    expect(REDIRECTS['beta/index.html']).toBe('/');
    expect(REDIRECTS['beta/docs/index.html']).toBe('/docs/');
    for (const [, chapter] of summary.matchAll(/\[[^\]]+\]\(([^)]+)\.md\)/g)) {
      expect(REDIRECTS[`beta/docs/${chapter}.html`], chapter).toBe(`/docs/${chapter}.html`);
    }
  });

  it('forwards the legacy site pages, the booster check to its docs section', () => {
    expect(REDIRECTS['boosters.html']).toBe('/docs/defi-insurance.html#boosters');
    for (const page of ['faqs.html', 'philosophy.html', 'usd8.html', 'contact.html', 'cover-pool.html', 'white-hat-economy.html', 'protected-savings.html', 'help-needed.html']) {
      expect(REDIRECTS[page], page).toMatch(/^\/docs\//);
    }
    // Never shadow a page the app build publishes at the root.
    for (const reserved of ['index.html', '404.html', 'robots.txt', 'sitemap.xml']) expect(REDIRECTS[reserved]).toBeUndefined();
  });

  it('keeps the old URL fragment and is not indexed', () => {
    const page = redirectPage('/');
    expect(page).toContain('<meta http-equiv="refresh" content="0; url=/" />');
    expect(page).toContain('<meta name="robots" content="noindex" />');
    expect(page).toContain('location.hash');
    expect(redirectPage('/docs/defi-insurance.html#boosters')).toContain("target.indexOf('#') === -1");
  });
});
