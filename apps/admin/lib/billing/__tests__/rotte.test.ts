import { describe, expect, it } from 'vitest'
import { ROTTA_ACCOUNT, rottaConsentita } from '../rotte'

/**
 * Quali rotte sopravvivono a un abbonamento sospeso.
 *
 * ## Perché questo file esiste
 *
 * Il 2026-08-07 il confronto era a prefisso per **tutte** le voci, `/dashboard`
 * compreso. Siccome `/dashboard` è il prefisso di ogni rotta del gestionale,
 * `/dashboard/menu` risultava consentita — e con essa tutto il resto. Il proxy
 * non bloccava niente e la sidebar non spegneva niente: l'intero meccanismo
 * era decorativo, e non se ne accorgeva nessuno perché compilava, passava il
 * lint e passava i test che c'erano (che provavano la matematica del tempo,
 * non i percorsi).
 *
 * Questi casi sono quel bug, congelato.
 */
describe('rottaConsentita', () => {
  describe('resta raggiungibile', () => {
    it.each([
      ['/dashboard', 'la dashboard è l\'atterraggio'],
      ['/dashboard/', 'la barra finale non cambia la rotta'],
      [ROTTA_ACCOUNT, 'Account è dove si sistema il pagamento'],
      ['/dashboard/account/', 'idem, con barra'],
      ['/dashboard/account/fatture', 'e tutto ciò che sta sotto Account'],
    ])('%s — %s', (pathname) => {
      expect(rottaConsentita(pathname)).toBe(true)
    })
  })

  describe('viene bloccata', () => {
    it.each([
      '/dashboard/menu',
      '/dashboard/prenotazioni',
      '/dashboard/prenotazioni/oggi',
      '/dashboard/news',
      '/dashboard/orari',
      '/dashboard/impostazioni',
    ])('%s', (pathname) => {
      expect(rottaConsentita(pathname)).toBe(false)
    })
  })

  describe('non si aggira', () => {
    it.each([
      ['/dashboard/accountancy', 'prefisso simile, rotta diversa'],
      ['/dashboard/account-falso', 'idem col trattino'],
      ['/dashboard//menu', 'doppia barra'],
      ['/dashboard/menu/', 'barra finale su una rotta bloccata'],
      ['/dashboardaltro', 'nemmeno un fratello di /dashboard'],
    ])('%s — %s', (pathname) => {
      expect(rottaConsentita(pathname)).toBe(false)
    })
  })

  /**
   * La sidebar e il proxy chiamano questa stessa funzione. Se divergessero, si
   * otterrebbe una voce cliccabile che porta a un redirect, o una voce spenta
   * su una pagina raggiungibile — il peggio di entrambi.
   */
  it('la voce Account della sidebar coincide con la rotta di atterraggio', () => {
    expect(rottaConsentita(ROTTA_ACCOUNT)).toBe(true)
  })
})
