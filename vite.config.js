import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    hmr: false,
    proxy: {
      '/docs': {
        target: 'http://127.0.0.1:3000',
        rewrite: (path) => path.replace(/^\/docs/, '') || '/',
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
