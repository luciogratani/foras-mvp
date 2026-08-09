import { afterEach, describe, expect, it, vi } from 'vitest'
import { scenarioAbilitato } from '../cookie'

/**
 * Dove è lecito che lo scenario finto esista.
 *
 * Questi casi sono un **bug congelato**: il 2026-08-08 la condizione era
 * `NODE_ENV !== 'production' || FORAS_BILLING_DEV === '1'`, e bastava che quella
 * variabile finisse fra le env di Production — copiata da `.env.example`, o
 * aggiunta per provare una cosa e mai tolta — perché il blocco dell'abbonamento
 * diventasse scavalcabile con un cookie, in silenzio.
 *
 * Il caso che vale più di tutti è `produzione vera, flag acceso → false`: se un
 * giorno torna verde con la logica vecchia, il blocco è di nuovo decorativo.
 */

afterEach(() => {
  vi.unstubAllEnvs()
})

function ambiente(nodeEnv: string, vercelEnv?: string, flag?: string) {
  vi.stubEnv('NODE_ENV', nodeEnv)
  vi.stubEnv('VERCEL_ENV', vercelEnv)
  vi.stubEnv('FORAS_BILLING_DEV', flag)
}

describe('scenarioAbilitato', () => {
  describe('sviluppo locale — sempre ammesso, senza bisogno della variabile', () => {
    it('development, nessun flag', () => {
      ambiente('development')
      expect(scenarioAbilitato()).toBe(true)
    })

    it('test, nessun flag', () => {
      ambiente('test')
      expect(scenarioAbilitato()).toBe(true)
    })
  })

  describe('anteprima Vercel — ammesso, ma solo con il flag esplicito', () => {
    it('preview + flag a 1', () => {
      ambiente('production', 'preview', '1')
      expect(scenarioAbilitato()).toBe(true)
    })

    it('preview senza flag: la finzione non si accende da sola', () => {
      ambiente('production', 'preview')
      expect(scenarioAbilitato()).toBe(false)
    })

    it("il flag vale solo se è esattamente '1'", () => {
      for (const valore of ['true', 'yes', '0', '', 'si']) {
        ambiente('production', 'preview', valore)
        expect(scenarioAbilitato(), `flag="${valore}"`).toBe(false)
      }
    })
  })

  describe('produzione — mai, e la variabile non può niente', () => {
    it('⚠️ produzione Vercel con il flag acceso resta CHIUSA', () => {
      ambiente('production', 'production', '1')
      expect(scenarioAbilitato()).toBe(false)
    })

    it('self-hosted (nessun VERCEL_ENV) con il flag acceso resta CHIUSO', () => {
      ambiente('production', undefined, '1')
      expect(scenarioAbilitato()).toBe(false)
    })

    it('un VERCEL_ENV sconosciuto non apre nulla', () => {
      ambiente('production', 'staging', '1')
      expect(scenarioAbilitato()).toBe(false)
    })
  })

  it('la logica vecchia sarebbe rossa qui: è la regressione da impedire', () => {
    ambiente('production', 'production', '1')

    const vecchia =
      process.env.NODE_ENV !== 'production' || process.env.FORAS_BILLING_DEV === '1'

    expect(vecchia).toBe(true) // com'era
    expect(scenarioAbilitato()).toBe(false) // com'è
  })
})
