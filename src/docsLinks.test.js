import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const bookRoot = resolve(process.cwd(), 'book-src');
const publicRoot = resolve(process.cwd(), 'public');
const summary = readFileSync(resolve(bookRoot, 'SUMMARY.md'), 'utf8');
const docsTheme = readFileSync(resolve(process.cwd(), 'docs-theme.js'), 'utf8');
const chapters = new Set(
  [...summary.matchAll(/\[[^\]]+\]\(([^)#]+\.md)\)/g)]
    .map(([, target]) => resolve(bookRoot, target)),
);

function headingIds(markdown) {
  return new Set(
    markdown.split('\n')
      .filter((line) => /^#{1,6}\s+/.test(line))
      .map((line) => line.replace(/^#{1,6}\s+/, '').trim().toLowerCase()
        .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
        .replace(/\s+/g, '-')),
  );
}

describe('mdBook links', () => {
  it('adds a beta badge beside the docs logo linking to the beta FAQ', () => {
    document.body.innerHTML = '<aside id="mdbook-sidebar"><div class="sidebar-scrollbox"><ol class="chapter"></ol></div></aside>';
    window.eval(docsTheme);
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(document.querySelector('.sidebar-brand .sidebar-logo')).not.toBeNull();
    expect(document.querySelector('.sidebar-brand .sidebar-beta-link')?.getAttribute('href')).toBe(
      'faqs.html#whats-different-in-beta',
    );
    expect(document.querySelector('.sidebar-app-link a')).toHaveAttribute('target', '_blank');
    expect(document.querySelector('.sidebar-app-link a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('automatically unfolds the beta FAQ when opened through the beta link', () => {
    window.history.replaceState({}, '', '/docs/faqs.html#whats-different-in-beta');
    document.body.innerHTML = `
      <main>
        <h1 class="faq-title">FAQs</h1>
        <h2 id="whats-different-in-beta"><a class="header" href="#whats-different-in-beta">What's different in beta?</a></h2>
        <p>Beta answer</p>
      </main>
    `;

    window.eval(docsTheme);
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const question = document.querySelector('#whats-different-in-beta .faq-question');
    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(document.querySelector('#whats-different-in-beta + .faq-answer')).not.toHaveAttribute('hidden');
    window.history.replaceState({}, '', '/');
  });

  it('keeps every local chapter link inside the generated book', () => {
    const broken = [];

    for (const chapter of chapters) {
      const markdown = readFileSync(chapter, 'utf8');
      for (const [, href] of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        if (/^(?:https?:|mailto:|#)/.test(href)) continue;
        const [path, fragment] = href.split('#');
        const target = resolve(dirname(chapter), path);
        if (!chapters.has(target)) {
          broken.push(`${chapter}: ${href} is not a chapter in SUMMARY.md`);
          continue;
        }
        if (fragment && !headingIds(readFileSync(target, 'utf8')).has(fragment)) {
          broken.push(`${chapter}: ${href} has no matching heading`);
        }
      }
    }

    expect(broken).toEqual([]);
  });

  it('keeps every root-relative documentation asset in public', () => {
    const broken = [];

    for (const chapter of chapters) {
      const markdown = readFileSync(chapter, 'utf8');
      for (const [, asset] of markdown.matchAll(/<(?:img|script|link)\b[^>]*(?:src|href)="(\/[^"#?]+)"/g)) {
        if (!existsSync(resolve(publicRoot, asset.slice(1)))) {
          broken.push(`${chapter}: ${asset} is missing from public`);
        }
      }
    }

    expect(broken).toEqual([]);
  });
});
