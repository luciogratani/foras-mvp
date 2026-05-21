import next from 'eslint-config-next'
import tseslint from 'typescript-eslint'

const eslintConfig = [
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/next-env.d.ts'],
  },
  ...next,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
]

export default eslintConfig
