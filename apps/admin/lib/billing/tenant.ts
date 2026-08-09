import type Stripe from 'stripe'

/**
 * **Da customer Stripe a schema del tenant.** È la domanda che il webhook si fa
 * per prima e a cui deve saper rispondere sempre, perché tutto il resto —
 * scrivere lo stato, aggiornare il claim, bloccare o sbloccare — dipende dal
 * sapere *di chi* è l'evento che è appena arrivato.
 *
 * ## Perché sta qui e non dentro `route.ts`
 *
 * Perché così si può provare. `deposito.ts` e `stripe.ts` importano entrambi
 * `server-only`, che **lancia** appena lo si carica fuori da un Server
 * Component: un test che importasse la versione cablata morirebbe all'import,
 * prima ancora di arrivare a un `expect`. Le due ricerche che toccano il mondo
 * arrivano quindi da fuori, e questo file resta logica pura — niente rete,
 * niente database, girabile nel job *static checks* della CI.
 *
 * ## Le tre strade, in quest'ordine
 *
 * 1. **I metadati che l'evento porta con sé.** Gratis, nessuna chiamata.
 * 2. **La riga già collegata**, cercata per `stripe_customer_id`. Una query
 *    locale, ed è la strada normale dal secondo evento in poi.
 * 3. **I metadati del Customer, chiesti a Stripe.** Una chiamata di rete, fatta
 *    solo quando le prime due non sanno rispondere.
 *
 * ## Perché la (3) esiste — il difetto che chiude
 *
 * Prima le strade erano due, e il commento sopra la funzione dichiarava che i
 * metadati del Customer erano *«la strada che funziona al primo evento, quando
 * la riga sul database non esiste ancora»*. **Non era vero**, e non lo era in
 * modo silenzioso.
 *
 * Nei payload dei webhook Stripe non espande mai i riferimenti: `sub.customer`
 * e `fattura.customer` arrivano come **stringhe**, non come oggetti. Quindi i
 * metadati del Customer erano leggibili in un caso solo — `customer.updated`,
 * dove l'oggetto dell'evento *è* il cliente. Per gli altri cinque eventi
 * restavano `sub.metadata` (che sono i metadati della *subscription*, un altro
 * oggetto) e la riga sul database, che al primo evento non esiste ancora.
 *
 * Conseguenza: seguendo il runbook alla lettera — `schema_name` nei metadati
 * del Customer, poi si crea l'abbonamento — il primo evento non trovava dove
 * atterrare e finiva in un `console.warn`. Cioè esattamente il fallimento
 * silenzioso che quel commento diceva di aver evitato, e per il quale il
 * runbook chiedeva quei metadati.
 *
 * ## Perché la (3) viene dopo la (2) e non prima
 *
 * Perché la riga sul database è **il collegamento vero**, e una volta stabilito
 * non va rimesso in discussione da una chiamata di rete a ogni evento. Chiedere
 * a Stripe costa latenza dentro un webhook, dove il tempo è quello che separa
 * un 200 da un ritentativo. Sull'ordine inverso ogni rinnovo pagherebbe una
 * chiamata in più per un'informazione che avevamo già in casa.
 */

/**
 * Le due domande che questa funzione non sa farsi da sola.
 *
 * `metadatiCliente` distingue **due `null` diversi**, e la distinzione è tutta
 * qui: `{}` significa «ho chiesto a Stripe, e questo cliente non ha
 * `schema_name`» — cioè non è nostro, ed è il caso normale di `stripe trigger`.
 * `null` significa «non sono riuscito a chiedere», che è un guasto. Collassarli
 * rimetterebbe un guasto e una condizione attesa sulla stessa riga di log, che
 * è metà del difetto che questo file esiste per chiudere.
 */
export type RicercheTenant = {
  /** Il tenant già collegato a questo customer, o `null` se non ce n'è. */
  perCustomer: (customerId: string) => Promise<string | null>
  /** I metadati del Customer su Stripe. `null` **solo** se non si è potuto chiedere. */
  metadatiCliente: (customerId: string) => Promise<Stripe.Metadata | null>
}

/**
 * L'esito, con il *perché*. Non è decorazione: chi chiama deve poter scrivere
 * tre righe di log diverse per tre situazioni che vogliono tre reazioni diverse
 * — ignorare, allarmarsi, o farsi ritentare da Stripe.
 */
export type EsitoTenant =
  | { schema: string; via: 'metadati-evento' | 'riga-collegata' | 'metadati-cliente' }
  | { schema: null; perche: 'senza-customer' | 'non-nostro' | 'stripe-muto' }

export async function risolviSchema(
  ricerche: RicercheTenant,
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
  sub: Stripe.Subscription | null,
  cliente?: Stripe.Customer
): Promise<EsitoTenant> {
  // 1. Quello che l'evento porta già con sé. Nessuna chiamata, nessun costo.
  const daEvento =
    metaSchema(sub?.metadata) ??
    metaSchema(cliente?.metadata) ??
    metaSchema(espanso(customer)?.metadata)

  if (daEvento) return { schema: daEvento, via: 'metadati-evento' }

  const id = idCliente(customer)
  if (!id) return { schema: null, perche: 'senza-customer' }

  // 2. Il collegamento già stabilito. È la strada normale dal secondo evento.
  const collegato = await ricerche.perCustomer(id)
  if (collegato) return { schema: collegato, via: 'riga-collegata' }

  // 3. Solo adesso si disturba Stripe: è il primo evento di un cliente nuovo,
  //    oppure il cliente non è nostro. Sono i due casi che si assomigliano, e
  //    l'unico modo di distinguerli è chiedere.
  const metadati = await ricerche.metadatiCliente(id)
  if (!metadati) return { schema: null, perche: 'stripe-muto' }

  const daCliente = metaSchema(metadati)
  if (daCliente) return { schema: daCliente, via: 'metadati-cliente' }

  return { schema: null, perche: 'non-nostro' }
}

/**
 * `schema_name` dai metadati, se c'è ed è una stringa non vuota.
 *
 * I metadati di Stripe sono un sacchetto libero riempito a mano dalla
 * dashboard: una chiave scritta storta o un valore vuoto sono più probabili di
 * quanto sembri, e non devono diventare uno schema chiamato `""`.
 */
function metaSchema(meta: Stripe.Metadata | null | undefined): string | null {
  const valore = meta?.schema_name
  return typeof valore === 'string' && valore ? valore : null
}

/**
 * Il customer come oggetto, ma solo se lo è davvero e non è cancellato.
 *
 * Nei webhook è quasi sempre una stringa — è tutto il motivo per cui questo
 * file esiste — ma la firma di Stripe ammette l'oggetto espanso, e quando c'è
 * va usato invece di chiederlo di nuovo.
 */
function espanso(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): Stripe.Customer | null {
  if (!customer || typeof customer !== 'object' || customer.deleted) return null
  return customer
}

/** L'id del customer, che arrivi come stringa o come oggetto. */
export function idCliente(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): string | null {
  if (!customer) return null
  return typeof customer === 'string' ? customer : customer.id
}
