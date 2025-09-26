import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'scripts/**',
      'next-env.d.ts',
    ],
  },
  {
    rules: {
      // Disable quote escaping rules for better DX - these don't affect functionality
      'react/no-unescaped-entities': 'off',
      // Allow any types in specific cases where complex typing isn't worth the effort
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused variables prefixed with underscore
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
]

export default eslintConfig
