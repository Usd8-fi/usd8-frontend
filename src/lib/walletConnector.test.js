import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const walletConnector = readFileSync(resolve(process.cwd(), 'src/lib/walletConnector.js'), 'utf8');

describe('wallet connector font loading', () => {
  it('uses the self-hosted site font instead of Reown font assets', () => {
    expect(walletConnector).toContain(`'--w3m-font-family': '"BlexMono Nerd Font Mono", monospace'`);
  });
});
