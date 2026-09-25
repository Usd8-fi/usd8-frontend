import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COVERED_PROTOCOL_ROWS } from './components/CoveredProtocolsTable.jsx';

const root = resolve(process.cwd(), 'src');
function sourceFiles(dir) {
  return readdirSync(resolve(root, dir || '.'), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(`${path}/`);
    return /\.(jsx?|css)$/.test(entry.name) && !/\.test\./.test(entry.name) ? [path] : [];
  });
}

describe('self-hosted images', () => {
  it('serves every covered-token icon from the site instead of a third-party host', () => {
    for (const row of COVERED_PROTOCOL_ROWS) expect(row.iconSrc).not.toMatch(/^https?:/);
  });

  it('makes no third-party image requests from application source', () => {
    for (const file of sourceFiles('')) {
      expect(readFileSync(resolve(root, file), 'utf8'), file).not.toMatch(/https:\/\/[^'"\s]+\.(png|jpe?g|svg|webp|gif)/);
    }
  });
});
