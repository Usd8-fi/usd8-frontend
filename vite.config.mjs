import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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

export default defineConfig({
  base: './',
  plugins: [react()],
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
