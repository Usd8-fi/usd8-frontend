import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CSP_DIRECTIVES, cspContent } from '../scripts/contentSecurityPolicy.mjs';
import { NETWORKS } from './lib/networkConfig.js';

const allowed = (origin) => CSP_DIRECTIVES['connect-src'].some((entry) => {
  if (entry === origin) return true;
  const wildcard = entry.match(/^(https?|wss):\/\/\*\.(.+)$/);
  return Boolean(wildcard) && origin.startsWith(`${wildcard[1]}://`) && origin.endsWith(`.${wildcard[2]}`);
});

// Every hard-coded USD8 service origin in the app source.
const serviceOrigins = () => {
  const dir = resolve(process.cwd(), 'src/lib');
  const origins = new Set();
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.js') && !name.includes('.test.'))) {
    for (const [origin] of readFileSync(resolve(dir, file), 'utf8').matchAll(/https:\/\/[a-z0-9-]+\.(?:execute-api|lambda-url)\.[a-z0-9.-]+?\.(?:amazonaws\.com|on\.aws)/g)) origins.add(origin);
  }
  return [...origins];
};

describe('content security policy', () => {
  it('allows every RPC endpoint the networks are configured with', () => {
    for (const network of Object.values(NETWORKS)) {
      for (const url of [network.rpcUrl, ...(network.rpcFallbackUrls || []), network.explorerApiUrl].filter(Boolean)) {
        expect(allowed(new URL(url).origin), url).toBe(true);
      }
    }
  });

  it('allows every USD8 API the app calls (score, claims, terms, TEE status)', () => {
    const origins = serviceOrigins();
    expect(origins.length).toBeGreaterThanOrEqual(5);
    for (const origin of origins) expect(allowed(origin), origin).toBe(true);
  });

  it('keeps scripts locked to the site and Google Tag Manager, with no inline or eval', () => {
    expect(CSP_DIRECTIVES['script-src']).toEqual(["'self'", 'https://www.googletagmanager.com']);
    const policy = cspContent();
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
  });

  it('is injected into the production build only', () => {
    const config = readFileSync(resolve(process.cwd(), 'vite.config.mjs'), 'utf8');
    expect(config).toContain('contentSecurityPolicy()');
    expect(readFileSync(resolve(process.cwd(), 'scripts/contentSecurityPolicy.mjs'), 'utf8')).toContain("apply: 'build'");
  });
});
