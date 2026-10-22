import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (file) => readFileSync(resolve(process.cwd(), file), 'utf8');

describe('mainnet defaults', () => {
  it('falls back to the mainnet explorer for transaction links, never Sepolia', () => {
    const app = source('src/App.jsx');
    expect(app).not.toContain('sepolia.etherscan.io');
    expect(app).toContain("|| 'https://etherscan.io'");
  });

  // The TEE panel lives in the local-only System Dashboard, which is kept out
  // of the repository (gitignored); its checks run only where those files exist.
  it('reads only the PCR hash for the TEE panel, with no signer log scan', () => {
    if (!existsSync(resolve(process.cwd(), 'src/lib/teeStatus.js'))) return;
    const tee = source('src/lib/teeStatus.js');
    expect(tee).not.toMatch(/fetchLogsInChunks|TeeSignerSet/);
    expect(source('src/components/SystemDashboard.jsx')).not.toContain('Accepted Signers');
  });
});
