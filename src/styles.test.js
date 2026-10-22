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

  it('pauses the activity ticker on hover only for devices that can hover (touch taps stick :hover on iOS)', () => {
    const root = postcss.parse(appStyles, { from: 'src/styles.css' });
    const pauses = [];
    root.walkDecls('animation-play-state', (decl) => {
      if (!decl.parent.selector.includes('.activity-ticker')) return;
      const media = decl.parent.parent.type === 'atrule' ? decl.parent.parent.params : null;
      pauses.push({ selector: decl.parent.selector, media });
    });
    const hoverPause = pauses.filter((p) => p.selector.includes(':hover'));
    expect(hoverPause.length).toBeGreaterThan(0);
    for (const p of hoverPause) expect(p.media).toBe('(hover: hover)');
    // Focus pauses must be focus-visible (keyboard), never :focus-within, which a tap can leave behind.
    for (const p of pauses) expect(p.selector).not.toContain('focus-within');
  });
});
