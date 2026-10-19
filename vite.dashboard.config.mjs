// Builds the System Dashboard as a standalone local app (not part of usd8.fi).
// Output: $USD8_DASHBOARD_OUT (default ~/defi-dashboard/usd8), served at /usd8/.
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: fileURLToPath(new URL('./dashboard', import.meta.url)),
  base: './',
  envDir: fileURLToPath(new URL('.', import.meta.url)),
  define: {
    'import.meta.env.VITE_PROTOCOL_CHAIN_ID': JSON.stringify('1'),
    'import.meta.env.VITE_TEE_STATUS_URL': JSON.stringify('/tee-status/'),
  },
  resolve: { alias: { 'viem-esm': fileURLToPath(new URL('./node_modules/viem/_esm', import.meta.url)) } },
  plugins: [react()],
  build: {
    outDir: process.env.USD8_DASHBOARD_OUT || join(homedir(), 'defi-dashboard', 'usd8'),
    emptyOutDir: true,
  },
});
