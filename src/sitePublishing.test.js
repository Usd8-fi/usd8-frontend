import { existsSync, readFileSync } from 'node:fs';
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

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
// Hidden chapters are reachable by direct link only: not in the sitemap or llms.txt.
const HIDDEN_CHAPTERS = ['anti-scam-check'];
const chapterUrls = [...summary.matchAll(/\[[^\]]+\]\(([^)]+)\.md\)/g)]
  .filter(([, chapter]) => !HIDDEN_CHAPTERS.includes(chapter))
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
    for (const hidden of HIDDEN_CHAPTERS) expect(sitemapUrls.filter((url) => url.includes(hidden))).toEqual([]);
    expect(new Set(sitemapUrls).size).toBe(sitemapUrls.length);
  });

  it('publishes an llms.txt that links every documentation chapter', () => {
    const llms = source('public/llms.txt');
    expect(llms.startsWith('# USD8\n\n> ')).toBe(true);
    const llmsUrls = [...llms.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(([, url]) => url);
    for (const chapterUrl of chapterUrls) expect(llmsUrls).toContain(chapterUrl);
    expect(llmsUrls.filter((url) => url.includes('/beta'))).toEqual([]);
    for (const hidden of HIDDEN_CHAPTERS) expect(llmsUrls.filter((url) => url.includes(hidden))).toEqual([]);
  });

  it('builds and publishes from main at the domain root, keeping the custom domain', () => {
    expect(deploy).toContain('if [[ "$branch" != "main" ]]; then');
    expect(deploy).toContain('git push origin main');
    expect(deploy).toContain('node scripts/publish-redirects.mjs docs');
    expect(deploy).toContain('docs/CNAME is not usd8.fi');
    expect(deploy).not.toContain('beta');
  });
});

describe('old URL redirects', () => {
  it('has no /beta/ redirects: the retired path is removed entirely', () => {
    expect(Object.keys(REDIRECTS).filter((path) => path.startsWith('beta/'))).toEqual([]);
  });

  it('forwards the legacy site pages, the booster check to its docs section', () => {
    expect(REDIRECTS['boosters.html']).toBe('/docs/defi-insurance.html#boosters');
    for (const page of ['faqs.html', 'philosophy.html', 'usd8.html', 'contact.html', 'cover-pool.html', 'white-hat-economy.html', 'protected-savings.html', 'help-needed.html']) {
      expect(REDIRECTS[page], page).toMatch(/^\/docs\//);
    }
    // Never shadow a page the app build publishes at the root.
    for (const reserved of ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'llms.txt']) expect(REDIRECTS[reserved]).toBeUndefined();
  });

  it('keeps the old URL fragment and is not indexed', () => {
    const page = redirectPage('/');
    expect(page).toContain('<meta http-equiv="refresh" content="0; url=/" />');
    expect(page).toContain('<meta name="robots" content="noindex" />');
    expect(page).toContain('location.hash');
    expect(redirectPage('/docs/defi-insurance.html#boosters')).toContain("target.indexOf('#') === -1");
  });
});
