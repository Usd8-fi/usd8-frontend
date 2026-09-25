import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const source = (path) => readFileSync(resolve(root, path), 'utf8');
const asset = (name) => resolve(root, 'src/assets', name);

const variants = [
  'booster-600.webp',
  'booster-1200.webp',
  'my-avatar-200.webp',
  'my-avatar-400.webp',
  'tyche-300.webp',
  'tyche-600.webp',
];

describe('documentation image delivery', () => {
  it('replaces multi-megabyte source images with budgeted WebP variants', () => {
    for (const name of variants) {
      expect(existsSync(asset(name)), `${name} should exist`).toBe(true);
      expect(statSync(asset(name)).size, `${name} should stay below 450 KB`).toBeLessThanOrEqual(450_000);
    }

    expect(existsSync(asset('booster.png'))).toBe(false);
    expect(existsSync(asset('my_avatar.png'))).toBe(false);
    expect(existsSync(asset('tyche.png'))).toBe(false);
  });

  it('publishes the optimized variants and removes legacy copies from the build', () => {
    for (const name of variants) {
      expect(existsSync(resolve(root, 'docs/assets', name)), `${name} should be published`).toBe(true);
    }

    expect(existsSync(resolve(root, 'docs/assets/booster.png'))).toBe(false);
    expect(existsSync(resolve(root, 'docs/assets/my_avatar.png'))).toBe(false);
    expect(existsSync(resolve(root, 'docs/assets/tyche.png'))).toBe(false);
  });

  it('serves responsive variants with intrinsic dimensions', () => {
    const boosters = source('book-src/boosters.md');
    const insurance = source('book-src/defi-insurance.md');
    const contact = source('book-src/contact.md');
    const philosophy = source('book-src/philosophy.md');

    expect(boosters).toContain('src="../assets/booster-600.webp"');
    expect(boosters).toContain('srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w"');
    expect(boosters).toContain('width="600" height="578"');

    expect(insurance).toContain('src="../assets/booster-600.webp"');
    expect(insurance).toContain('loading="lazy"');
    expect(insurance).toContain('width="300" height="289"');

    expect(contact).toContain('srcset="../assets/my-avatar-200.webp 200w, ../assets/my-avatar-400.webp 400w"');
    expect(contact).toContain('width="200" height="200"');

    expect(philosophy).toContain('srcset="../assets/tyche-300.webp 300w, ../assets/tyche-600.webp 600w"');
    expect(philosophy).toContain('width="300" height="415"');
  });

  it('lazy-loads only the historical images below the philosophy introduction', () => {
    const philosophy = source('book-src/philosophy.md');
    expect(philosophy).toContain('src="../assets/thomas_gresham.jpg" width="500" height="265" loading="lazy"');
    expect(philosophy).toContain('src="../assets/murrayRothbard.jpg" width="800" height="444" loading="lazy"');
    expect(philosophy.match(/loading="lazy"/g)).toHaveLength(2);
  });

  it('gives every documentation image meaningful alternative text', () => {
    const markdownFiles = readdirSync(resolve(root, 'book-src'))
      .filter((name) => name.endsWith('.md'))
      .map((name) => source(`book-src/${name}`));

    for (const markdown of markdownFiles) {
      for (const [tag] of markdown.matchAll(/<img\b[^>]*>/g)) {
        expect(tag).toMatch(/\balt="[^"]+"/);
      }
      for (const [, alt] of markdown.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)) {
        expect(alt.trim()).not.toBe('');
      }
    }

    expect(source('book-src/boosters.md')).toContain('alt="USD8 Booster NFT artwork"');
    expect(source('book-src/defi-insurance.md')).toContain('alt="USD8 Booster NFT artwork"');
    expect(source('book-src/contact.md')).toContain('alt="Illustrated avatar of the USD8 core developer"');
    expect(source('book-src/philosophy.md')).toContain('alt="Classical bust of Tyche framed by a cyan triangle"');
    expect(source('book-src/philosophy.md')).toContain('alt="Portrait of Sir Thomas Gresham"');
    expect(source('book-src/philosophy.md')).toContain('alt="Portrait of Murray Rothbard"');
  });
});
