import { defineConfig } from 'vitest/config'

/**
 * I test del gestionale.
 *
 * A differenza di quelli di `@repo/supabase`, **non serve nessun database**:
 * qui si prova solo logica pura — la derivazione dello stato dell'abbonamento
 * e il filtro delle rotte. È deliberato, ed è la ragione per cui possono
 * girare nel job "static checks" della CI insieme a tsc e lint, invece che nel
 * job pesante che deve prima tirare su Postgres.
 *
 * Un test che ha bisogno di un database è un test che prima o poi qualcuno
 * salta.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/__tests__/**/*.test.ts'],
  },
})
