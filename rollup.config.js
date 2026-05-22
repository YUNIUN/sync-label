import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

// 获取当前工作目录
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  // ES 模块输出配置
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve({
        browser: true,
        extensions: ['.ts', '.js'],
        dedupe: ['tslib']
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        sourceMap: true,
        inlineSources: true,
      }),
    ],
    external: ['three', 'lodash-es', 'zod'],
  },
  // UMD 模块输出配置
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'SyncLabel',
      globals: {
        'three': 'THREE',
        'lodash-es': '_',
        'zod': 'zod'
      },
      sourcemap: true,
    },
    plugins: [
      nodeResolve({
        browser: true,
        extensions: ['.ts', '.js'],
        dedupe: ['tslib']
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        sourceMap: true,
        inlineSources: true,
      }),
    ],
    external: ['three', 'lodash-es', 'zod'],
  },
  // 类型声明文件输出配置
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts({ tsconfig: './tsconfig.build.json' })],
  },
]);