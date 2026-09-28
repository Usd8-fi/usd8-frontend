import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createReadStream } from 'node:fs';
import { extname } from 'node:path';
import { documentationAssets } from './scripts/documentationAssets.mjs';

const scoreProxy = {
  target: 'https://j9j79vdvkj.execute-api.eu-central-1.amazonaws.com',
  changeOrigin: true,
  rewrite: path => path.replace(/^\/api/, ''),
};

const claimProxy = {
  target: 'https://wmzdww7bxb.execute-api.eu-central-1.amazonaws.com',
  changeOrigin: true,
  rewrite: path => path.replace(/^\/api\/claims/, ''),
};

const documentationAssetTypes = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

// Dev only: the docs (proxied from mdBook) load ../assets/<name>, which the build
// copies into docs/assets. Serve the same files straight from src/assets.
const documentationAssetsInDev = {
  name: 'usd8-documentation-assets',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const name = request.url?.split('?')[0].match(/^\/assets\/([^/]+)$/)?.[1];
      if (!name || !documentationAssets.includes(name)) return next();
      response.setHeader('Content-Type', documentationAssetTypes[extname(name)] ?? 'application/octet-stream');
      createReadStream(new URL(`./src/assets/${name}`, import.meta.url)).pipe(response);
    });
  },
};

export default defineConfig({
  base: './',
  // viem's ESM build by module file; see src/lib/viemLite.js.
  resolve: { alias: { 'viem-esm': fileURLToPath(new URL('./node_modules/viem/_esm', import.meta.url)) } },
  plugins: [react(), documentationAssetsInDev],
  server: {
    hmr: false,
    proxy: {
      '/api/score': scoreProxy,
      '/api/claims': claimProxy,
      '/docs': {
        target: 'http://127.0.0.1:3000',
        rewrite: (path) => path.replace(/^\/docs/, '') || '/',
      },
    },
  },
  preview: { proxy: { '/api/score': scoreProxy, '/api/claims': claimProxy } },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
