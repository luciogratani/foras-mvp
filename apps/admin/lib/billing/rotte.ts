/**
 * Quali rotte del gestionale sopravvivono a un abbonamento sospeso.
 *
 * Sta in un file suo perché serve in due posti che non possono importarsi a
 * vicenda: la sidebar (client) e `proxy.ts` (middleware). Due elenchi che
 * divergono darebbero il peggiore dei risultati — una voce cliccabile che
 * porta a un redirect, o una voce spenta su una pagina raggiungibile.
 */

/** Dove si atterra quando si prova a entrare in una rotta bloccata. */
export const ROTTA_ACCOUNT = '/dashboard/account'

/**
 * Le rotte che restano raggiungibili a gestionale sospeso.
 *
 * Confermate da Lucio il 2026-08-07 dopo averle provate a mano. `Account` è
 * obbligata: è dove si sistema il pagamento ed è dove manda il popup di
 * blocco. `Dashboard` è l'atterraggio — lasciarla fuori vorrebbe dire che chi
 * entra trova tutto spento prima ancora di leggere il popup.
 *
 * ## Perché `esatta` esiste, e non è un dettaglio
 *
 * `/dashboard` è il **prefisso di ogni altra rotta** del gestionale. Trattarlo
 * come gli altri, cioè lasciando passare anche i suoi discendenti, significa
 * che `/dashboard/menu` risulta consentita — e con essa tutto il resto. Il
 * blocco smette di bloccare, e la sidebar smette di spegnere le voci, senza
 * che niente si rompa in modo visibile.
 *
 * È esattamente il bug che c'era qui il 2026-08-07: un `startsWith` di troppo,
 * e l'intero meccanismo era decorativo.
 */
const ROTTE_SEMPRE_ATTIVE: readonly { percorso: string; esatta: boolean }[] = [
  // L'atterraggio, e SOLO l'atterraggio.
  { percorso: '/dashboard', esatta: true },
  // Account e tutto quello che ci sta sotto.
  { percorso: ROTTA_ACCOUNT, esatta: false },
]

export function rottaConsentita(pathname: string): boolean {
  // Un percorso con la barra finale è lo stesso percorso: `/dashboard/` non
  // deve diventare una scorciatoia per aggirare il confronto esatto.
  const pulito = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  return ROTTE_SEMPRE_ATTIVE.some(({ percorso, esatta }) =>
    esatta ? pulito === percorso : pulito === percorso || pulito.startsWith(`${percorso}/`)
  )
}
