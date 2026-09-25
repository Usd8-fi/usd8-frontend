import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

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
  .map(([, chapter]) => `https://usd8.fi/beta/docs/${chapter === 'usd8' ? '' : `${chapter}.html`}`);

describe('search crawler publication', () => {
  it('publishes a root crawler policy with the canonical sitemap', () => {
    expect(robots).toBe([
      'User-agent: *',
      'Allow: /',
      'Sitemap: https://usd8.fi/sitemap.xml',
      '',
    ].join('\n'));
  });

  it('includes the public site, beta app, and every documentation chapter', () => {
    expect(sitemapUrls).toContain('https://usd8.fi/');
    expect(sitemapUrls).toContain('https://usd8.fi/beta/');
    for (const chapterUrl of chapterUrls) expect(sitemapUrls).toContain(chapterUrl);
    expect(new Set(sitemapUrls).size).toBe(sitemapUrls.length);
  });

  it('publishes crawler files at the domain root without widening the release scope', () => {
    expect(deploy).toContain('cp "$wt/docs/beta/robots.txt" "$wt/docs/robots.txt"');
    expect(deploy).toContain('cp "$wt/docs/beta/sitemap.xml" "$wt/docs/sitemap.xml"');
    expect(deploy).toContain('node scripts/publish-scope.mjs');
  });

  it('allows only beta output and the two root crawler files', () => {
    expect(validatePublishScope([
      'docs/beta/index.html',
      'docs/beta/assets/app.js',
      'docs/robots.txt',
      'docs/sitemap.xml',
    ], { nullSeparated: true }).status).toBe(0);

    for (const path of ['docs/index.html', 'docs/404.html', 'deploy.sh', 'docs/robots.txt.bak', ' docs/robots.txt', 'docs/beta-evil/index.html']) {
      const result = validatePublishScope([path]);
      expect(result.status, path).toBe(1);
      expect(result.stderr, path).toContain(path);
    }
  });
});
