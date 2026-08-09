import 'server-only'
import Stripe from 'stripe'

/**
 * Il client Stripe, costruito una volta sola e solo se serve.
 *
 * Tutto il resto del gestionale chiede prima `stripeConfigurato()` e poi
 * `getStripe()`. Il motivo è che finché le chiavi non ci sono il gestionale
 * deve **funzionare lo stesso**: il cliente è online, e un `throw` all'avvio per una
 * variabile d'ambiente mancante spegnerebbe la gestione del menù per colpa di
 * un abbonamento che nessuno sta ancora pagando.
 */

let cached: Stripe | undefined

/**
 * Vero solo se c'è una chiave segreta. È la domanda che separa «Stripe è
 * collegato» da «non ancora», e va fatta prima di ogni chiamata.
 */
export function stripeConfigurato(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/** Vero se le chiavi sono di test (`sk_test_…`). Serve a marcarlo a schermo. */
export function stripeInProva(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test_')
}

export function getStripe(): Stripe {
  if (cached) return cached

  const chiave = process.env.STRIPE_SECRET_KEY
  if (!chiave) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY. Dashboard Stripe → Sviluppatori → Chiavi API → chiave segreta. ' +
        'SERVER ONLY — mai NEXT_PUBLIC_, mai nel bundle client. ' +
        'Chiama stripeConfigurato() prima di getStripe().'
    )
  }

  cached = new Stripe(chiave, {
    // La versione dell'API si fissa qui e non si lascia decidere all'account.
    // Senza, il giorno in cui Stripe aggiorna la versione predefinita della
    // dashboard cambiano le forme degli oggetti sotto i piedi del codice, e
    // succede senza un deploy — cioè senza niente da guardare nel diff.
    // È la versione che questo SDK (stripe 22.4.0) fissa per conto suo: i tipi
    // TypeScript descrivono ESATTAMENTE questa, quindi scriverne un'altra
    // farebbe mentire il compilatore. Si cambia insieme al pacchetto, mai da sola.
    apiVersion: '2026-07-29.dahlia',
    // Un errore di rete verso Stripe non deve far cadere una pagina: si
    // riprova due volte e poi si degrada.
    maxNetworkRetries: 2,
    timeout: 8000,
    // Identifica l'applicazione nei log di Stripe, non il cliente che la usa.
    // Niente `url`: questo file sta nel template e ogni fork ha il proprio
    // dominio, quindi un indirizzo scritto qui direbbe a Stripe il nome di un
    // cliente al posto del nostro — e sarebbe sbagliato per tutti gli altri.
    appInfo: { name: 'foras-admin' },
  })

  return cached
}
