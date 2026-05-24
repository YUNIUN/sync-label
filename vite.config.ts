import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SYNC_LABEL',
      fileName: (format) => `index.${format}.js`
    },
  },
  plugins: [
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
    }),
  ],
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