import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      'no-useless-assignment': 'warn',
      '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^node:'], ['^@?\\w'], ['^@/'], ['^\\.'], ['^\\u0000']],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    ignores: ['dist/**'],
  },
);
