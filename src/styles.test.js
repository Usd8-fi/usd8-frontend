import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const appStyles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

describe('styles.css', () => {
  // The other suites read this file as a string, so a syntax error only ever
  // surfaced at build time. Parse it here instead.
  it('parses as valid CSS', () => {
    expect(() => postcss.parse(appStyles, { from: 'src/styles.css' })).not.toThrow();
  });

  it('defines shared selectors once at the top level', () => {
    // Media-query overrides are legitimate duplicates, so only count root rules.
    const root = postcss.parse(appStyles, { from: 'src/styles.css' });
    const counts = new Map();
    root.walkRules((rule) => {
      if (rule.parent.type !== 'root') return;
      counts.set(rule.selector, (counts.get(rule.selector) || 0) + 1);
    });
    expect(counts.get('.usd8-spinner')).toBe(1);
    expect(counts.get('.action-button-shell')).toBe(1);
  });
});
