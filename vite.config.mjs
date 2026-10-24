import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { defineConfig, loadEnv } from 'vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { appendFileSync, createReadStream, mkdirSync } from 'node:fs';
import { extname } from 'node:path';
import { documentationAssets } from './scripts/documentationAssets.mjs';
import { contentSecurityPolicy, sentryIngestOrigin } from './scripts/contentSecurityPolicy.mjs';

const scoreProxy = {
  target: 'https://j9j79vdvkj.execute-api.eu-central-1.amazonaws.com',
  changeOrigin: true,
  rewrite: path => path.replace(/^\/api/, ''),
};

const claimProxy = {
  target: 'https://u3eb72vdu4.execute-api.eu-central-1.amazonaws.com',
  changeOrigin: true,
  rewrite: path => path.replace(/^\/api\/claims/, ''),
};

const mainnetClaimProxy = {
  target: 'https://c8cnx9estd.execute-api.eu-central-1.amazonaws.com',
  changeOrigin: true,
  rewrite: path => path.replace(/^\/api\/claims-mainnet/, ''),
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

// Dev only: the app POSTs failed protocol reads here so a transient "could not be
// updated" banner can be traced afterwards. Appends JSON lines; never in builds.
const devReadErrorLog = {
  name: 'usd8-dev-read-error-log',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__dev/read-errors', (request, response) => {
      if (request.method !== 'POST') { response.statusCode = 405; response.end(); return; }
      let body = '';
      request.on('data', chunk => { if (body.length < 64 * 1024) body += chunk; });
      request.on('end', () => {
        try {
          const dir = new URL('./node_modules/.cache/', import.meta.url);
          mkdirSync(dir, { recursive: true });
          appendFileSync(new URL('usd8-read-errors.jsonl', dir), `${JSON.stringify({ receivedAt: new Date().toISOString(), ...JSON.parse(body) })}\n`);
          response.statusCode = 204;
        } catch { response.statusCode = 400; }
        response.end();
      });
    });
  },
};

function gitRelease() {
  try {
    return execSync('git rev-parse --short=12 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'unknown';
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const release = `usd8-frontend@${gitRelease()}`;
  // Source maps are built only when they can be uploaded to Sentry, and are
  // deleted after upload so they are never published with the site.
  const uploadSourceMaps = Boolean(env.SENTRY_AUTH_TOKEN && env.VITE_SENTRY_DSN);
  return {
  base: './',
  define: { 'import.meta.env.VITE_APP_RELEASE': JSON.stringify(release) },
  // viem's ESM build by module file; see src/lib/viemLite.js.
  resolve: { alias: { 'viem-esm': fileURLToPath(new URL('./node_modules/viem/_esm', import.meta.url)) } },
  plugins: [
    react(),
    documentationAssetsInDev,
    devReadErrorLog,
    contentSecurityPolicy({ connectOrigins: [sentryIngestOrigin(env.VITE_SENTRY_DSN)] }),
    ...(uploadSourceMaps ? [sentryVitePlugin({
      org: env.SENTRY_ORG || 'usd8fi',
      project: env.SENTRY_PROJECT || 'usd8-frontend',
      authToken: env.SENTRY_AUTH_TOKEN,
      release: { name: release },
      sourcemaps: { filesToDeleteAfterUpload: ['docs/**/*.map'] },
      telemetry: false,
    })] : []),
  ],
  server: {
    hmr: false,
    proxy: {
      '/api/score': scoreProxy,
      '/api/claims-mainnet': mainnetClaimProxy,
      '/api/claims': claimProxy,
      '/docs': {
        target: 'http://127.0.0.1:3000',
        rewrite: (path) => path.replace(/^\/docs/, '') || '/',
      },
    },
  },
  preview: { proxy: { '/api/score': scoreProxy, '/api/claims-mainnet': mainnetClaimProxy, '/api/claims': claimProxy } },
  test: {
    // The existing suites exercise the Sepolia deployment.
    env: { VITE_PROTOCOL_CHAIN_ID: '11155111' },
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: uploadSourceMaps ? 'hidden' : false,
  },
  };
});
