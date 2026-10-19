import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

const TEST_TOKEN = '0x116e4336047c97703f84619de03b6bf893667de1';

describe('mainnet E2E test token stays local', () => {
  it('is not configured without the local dev flag', async () => {
    vi.stubEnv('VITE_PROTOCOL_CHAIN_ID', '1');
    vi.resetModules();
    const { getProtocolNetwork, LOCAL_E2E_TEST_TOKEN } = await import('./lib/networkConfig.js');
    const { COVERED_PROTOCOL_ROWS } = await import('./components/CoveredProtocolsTable.jsx');
    expect(LOCAL_E2E_TEST_TOKEN).toBe(false);
    expect(Object.values(getProtocolNetwork(1).contracts.insuredTokens)).not.toContain(TEST_TOKEN);
    expect(COVERED_PROTOCOL_ROWS.map((row) => row.id)).not.toContain('test-test');
    vi.unstubAllEnvs();
  });

  it('requires both the dev server and the flag, and the flag file is gitignored', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/lib/networkConfig.js'), 'utf8');
    expect(source).toContain("import.meta.env.DEV === true\n  && import.meta.env.VITE_LOCAL_E2E_TEST_TOKEN === '1'");
    expect(source).toContain('...(import.meta.env.DEV && LOCAL_E2E_TEST_TOKEN ?');
    expect(readFileSync(resolve(process.cwd(), 'src/components/CoveredProtocolsTable.jsx'), 'utf8')).toContain('...(import.meta.env.DEV && LOCAL_E2E_TEST_TOKEN ?');
    expect(readFileSync(resolve(process.cwd(), '.gitignore'), 'utf8')).toMatch(/^\.env\.\*\.local$/m);
  });
});
