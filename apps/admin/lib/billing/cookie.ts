/**
 * Ciò che serve **sia** al middleware sia al lato server.
 *
 * `proxy.ts` non può importare `sorgente.ts`, che è `server-only` e legge
 * `next/headers`. Tutto quello che devono sapere entrambi vive qui: una
 * costante o una condizione duplicata a mano fra i due è esattamente il genere
 * di divergenza che si scopre mesi dopo.
 */
export const COOKIE_SCENARIO = 'foras_billing_scenario'

/**
 * **Dove è lecito che lo scenario finto esista.**
 *
 * Un interruttore che spegne il blocco dell'abbonamento è, in produzione, il
 * blocco stesso reso inutile: chi può scrivere un cookie si sblocca da solo.
 *
 * Le tre risposte, in ordine:
 *
 * 1. **sviluppo locale** — `NODE_ENV` non è `production`: sempre ammesso;
 * 2. **anteprima Vercel** — `VERCEL_ENV` vale `preview`, e allora serve **anche**
 *    `FORAS_BILLING_DEV=1`. Le anteprime hanno `NODE_ENV` già a `production` ma
 *    nessun cliente dietro, ed è il caso per cui la variabile è nata;
 * 3. **tutto il resto è produzione**, e la finzione non è ammessa. Punto.
 *
 * ## Perché la prova è positiva e non negativa
 *
 * Prima bastava `FORAS_BILLING_DEV === '1'`, e questo rendeva il blocco
 * **disarmabile da una variabile d'ambiente**: bastava che finisse in Production
 * — copiata da `.env.example`, o aggiunta per provare una cosa e mai tolta — e
 * il gestionale diventava sbloccabile con un cookie, senza che niente lo
 * segnalasse.
 *
 * Adesso la finzione richiede una **prova positiva di non essere in produzione**,
 * e quella prova la dà la piattaforma (`VERCEL_ENV`), non una nostra variabile.
 * La conseguenza pratica: `FORAS_BILLING_DEV=1` messa su Production non fa
 * niente. Non è più una variabile pericolosa, è una variabile inerte.
 *
 * Fuori da Vercel `VERCEL_ENV` non esiste, quindi un'installazione self-hosted
 * ricade nel caso 3 — chiusa. Per uno staging self-hosted la leva giusta è
 * `NODE_ENV`, non questa.
 */
export function scenarioAbilitato(): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  if (process.env.VERCEL_ENV === 'preview') return process.env.FORAS_BILLING_DEV === '1'
  return false
}

/**
 * Dove finiscono i dati aziendali finché non c'è un posto vero in cui metterli.
 *
 * Un modulo che dice «salvato» e non salva niente è peggio di un modulo
 * disabilitato, perché insegna a fidarsi. Un cookie non è persistenza, ma è
 * abbastanza per provare la schermata davvero — e sparisce da solo, il che è
 * esattamente ciò che si vuole da un ponteggio.
 *
 * Quando Stripe entrerà, questi dati diventano il `Customer` (`name`,
 * `tax_id`, `address`, `email`) e questo cookie si cancella.
 */
export const COOKIE_DATI = 'foras_billing_dati'
