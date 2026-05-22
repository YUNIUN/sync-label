import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './example',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: '../dist/example',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'sync-label': resolve(__dirname, './src/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['three', 'lodash-es', 'zod'],
  },
});