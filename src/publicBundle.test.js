import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// Walks the *static* import graph of the public (no-wallet) entry. Dynamic
// `import()` edges — the wallet runtime, claim API, dialogs — are excluded
// because they only load on demand.
const SRC = path.join(process.cwd(), 'src');
const STATIC_IMPORT = /^\s*(?:import|export)\s[^;]*?from\s*['"]([^'"]+)['"]/gm;

function publicModules(entry = 'main.jsx') {
  const seen = new Map();
  const visit = (file) => {
    if (seen.has(file)) return;
    const source = fs.readFileSync(file, 'utf8');
    seen.set(file, source);
    for (const [, spec] of source.matchAll(STATIC_IMPORT)) {
      if (!spec.startsWith('.')) continue;
      const target = path.resolve(path.dirname(file), spec.split('?')[0]);
      if (/\.(jsx?|mjs)$/.test(target) && fs.existsSync(target)) visit(target);
    }
  };
  visit(path.join(SRC, entry));
  return seen;
}

describe('public page bundle boundary', () => {
  const modules = publicModules();

  it('reaches the landing data layer but not the wallet runtime', () => {
    const names = [...modules.keys()].map(file => path.relative(SRC, file));
    expect(names).toEqual(expect.arrayContaining(['PublicApp.jsx', 'lib/chainData.js', 'lib/readClient.js']));
    expect(names).not.toContain('WalletApp.jsx');
    expect(names).not.toContain('App.jsx');
  });

  it('never imports the viem barrel, which drags signatures and secp256k1 onto first load', () => {
    const offenders = [...modules]
      .filter(([, source]) => /from\s*['"](viem|viem\/(?!_esm)[^'"]*|ox(\/[^'"]*)?|abitype)['"]/.test(source))
      .map(([file]) => path.relative(SRC, file));
    expect(offenders).toEqual([]);
  });
});
