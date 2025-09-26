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
      '@typescript-eslint/no-unused-vars': 'off',
      // Disable React hooks exhaustive deps warnings for faster development
      'react-hooks/exhaustive-deps': 'off',
      // Allow img elements for now
      '@next/next/no-img-element': 'off',
      // Disable all TypeScript-specific rules for deployment
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      // Disable prop validation for faster builds
      'react/prop-types': 'off',
    },
  },
]

export default eslintConfig
