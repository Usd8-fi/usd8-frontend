import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = path => readFileSync(resolve(root, path), 'utf8');
const WEIGHTS = ['ExtraLight', 'Regular', 'SemiBold'];

describe('self-hosted BlexMono fonts', () => {
  it('ships Latin-subset files instead of the megabyte Nerd Font icon sets', () => {
    for (const weight of WEIGHTS) {
      const size = statSync(resolve(root, `public/assets/fonts/BlexMonoNerdFontMono-${weight}.woff2`)).size;
      expect(size).toBeGreaterThan(10_000);
      expect(size).toBeLessThan(60_000);
    }
  });

  it('preloads the body weight so text paints in the final font', () => {
    expect(read('index.html')).toMatch(/<link rel="preload" href="\/assets\/fonts\/BlexMonoNerdFontMono-Regular\.woff2" as="font" type="font\/woff2" crossorigin \/>/);
  });

  it('loads docs fonts relative to the published site, not the domain root', () => {
    const css = read('theme/css/usd8-docs.css');
    for (const weight of WEIGHTS) {
      expect(css).toContain(`url("../../../assets/fonts/BlexMonoNerdFontMono-${weight}.woff2")`);
    }
    expect(css).not.toContain('url("/assets/fonts/');
  });
});
