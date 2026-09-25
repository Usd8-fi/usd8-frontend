import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const walletConnector = readFileSync(resolve(process.cwd(), 'src/lib/walletConnector.js'), 'utf8');

describe('wallet connector font loading', () => {
  it('uses the self-hosted site font instead of Reown font assets', () => {
    expect(walletConnector).toContain(`'--w3m-font-family': '"BlexMono Nerd Font Mono", monospace'`);
  });

  it('shows wallets only: no email, social login, swaps, onramp, payments or account features', () => {
    for (const feature of ['email', 'socials', 'swaps', 'onramp', 'emailCapture', 'payWithExchange', 'payments', 'reownAuthentication']) {
      expect(walletConnector).toMatch(new RegExp(`\\b${feature}: false,`));
    }
  });
});
