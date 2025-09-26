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
      // Allow any types - disable for faster development
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow unused variables prefixed with underscore
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      // Disable React hooks exhaustive deps warnings for faster development
      'react-hooks/exhaustive-deps': 'off',
      // Allow img elements for now
      '@next/next/no-img-element': 'off',
    },
  },
]

export default eslintConfig
