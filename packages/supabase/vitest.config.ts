import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Use node environment — no DOM needed for service-layer tests
    environment: 'node',
    // Each test file gets its own worker to avoid schema-name collisions
    pool: 'forks',
    // Tests require a live Postgres — set TEST_DATABASE_URL in CI / locally.
    testTimeout: 30_000,
    hookTimeout: 60_000,
    include: ['src/__tests__/**/*.test.ts'],
    // TypeScript handled by Vite's esbuild transform; tsconfig.test.json relaxes
    // strict rules that are not useful for test helper code.
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
  resolve: {
    alias: {},
  },
})
