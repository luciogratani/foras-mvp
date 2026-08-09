import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { getStripe, stripeConfigurato } from '../../../../lib/billing/stripe'
import {
  leggiAbbonamento,
  schemaDaCustomer,
  scriviAbbonamento,
} from '../../../../lib/billing/deposito'
import { aggiornaClaimAbbonamento } from '../../../../lib/billing/claim'
import {
  idCliente,
  risolviSchema as risolviSchemaCon,
  type RicercheTenant,
} from '../../../../lib/billing/tenant'
import type { MetodoPagamento } from '../../../../lib/billing/stato'

/**
 * L'orecchio del gestionale su Stripe.
 *
 * Stripe non dice a nessuno se hai pagato: chiama questo indirizzo quando
 * qualcosa cambia. È l'unico posto in cui `public.tenant_subscriptions` viene
 * scritta.
 *
 * ## Perché sta qui e non altrove
 *
 * Un endpoint per fork, non uno centrale. Al secondo cliente ogni gestionale
 * ha il suo indirizzo e il suo webhook configurato su Stripe: si replica, non
 * si condivide. Un servizio centrale sarebbe più pulito al decimo cliente, ma
 * oggi sarebbe un secondo posto da deployare e sorvegliare per zero vantaggi.
 *
 * ## Le tre regole che non si possono sbagliare
 *
 * 1. **La firma si verifica sempre**, sul corpo grezzo. Senza, chiunque
 *    conosca l'indirizzo può dichiarare pagato un abbonamento con un `curl`.
 * 2. **Si risponde 200 anche a ciò che non si capisce.** Un 500 fa riprovare
 *    Stripe per giorni e alla fine disattiva il webhook; un evento ignorato
 *    di proposito non è un errore.
 * 3. **Si risponde 500 quando il fallimento è passeggero**: la scrittura sul
 *    database non è andata, o non si è potuto chiedere a Stripe di chi fosse
 *    l'evento. Lì il ritentativo è esattamente quello che serve. Un evento che
 *    non ci riguarda, invece, è un 200.
 */

// Il corpo grezzo è obbligatorio per verificare la firma: qualunque parsing
// prima di `constructEvent` cambia i byte e la verifica fallisce. In App Router
// `req.text()` lo dà così com'è — l'importante è non chiamare `req.json()`.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Gli eventi che ci interessano. Tutto il resto arriva e viene ignorato con un
 * 200: Stripe ne manda decine di tipi, e sottoscriverne pochi sulla dashboard
 * è un filtro che si dimentica di aggiornare.
 */
const EVENTI_GESTITI = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.updated',
])

export async function POST(req: NextRequest) {
  if (!stripeConfigurato()) {
    // Stripe non è collegato: non c'è niente da verificare e niente da
    // scrivere. 503 e non 200, perché se arriva un evento qui significa che
    // qualcuno ha configurato il webhook prima delle chiavi, e va visto.
    return NextResponse.json({ error: 'Stripe non configurato' }, { status: 503 })
  }

  const segreto = process.env.STRIPE_WEBHOOK_SECRET
  if (!segreto) {
    console.error('[stripe] STRIPE_WEBHOOK_SECRET mancante: impossibile verificare la firma')
    return NextResponse.json({ error: 'Webhook non configurato' }, { status: 503 })
  }

  const firma = req.headers.get('stripe-signature')
  if (!firma) {
    return NextResponse.json({ error: 'Firma assente' }, { status: 400 })
  }

  const corpo = await req.text()

  let evento: Stripe.Event
  try {
    evento = getStripe().webhooks.constructEvent(corpo, firma, segreto)
  } catch (err) {
    // Firma sbagliata o corpo alterato. 400 e nient'altro: non si dice cosa
    // non torna, e soprattutto non si scrive niente.
    console.error('[stripe] firma non valida:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Firma non valida' }, { status: 400 })
  }

  if (!EVENTI_GESTITI.has(evento.type)) {
    return NextResponse.json({ ricevuto: true, ignorato: evento.type })
  }

  try {
    await gestisci(evento)
  } catch (err) {
    // Qui il ritentativo di Stripe è desiderabile: la scrittura non è andata,
    // e l'evento non deve andare perso.
    console.error(`[stripe] gestione di ${evento.type} fallita:`, err)
    return NextResponse.json({ error: 'Elaborazione fallita' }, { status: 500 })
  }

  return NextResponse.json({ ricevuto: true })
}

async function gestisci(evento: Stripe.Event): Promise<void> {
  switch (evento.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return gestisciAbbonamento(evento.data.object)
    case 'invoice.paid':
      return gestisciFatturaPagata(evento.data.object)
    case 'invoice.payment_failed':
      return gestisciFatturaFallita(evento.data.object)
    case 'customer.updated':
      return gestisciCliente(evento.data.object)
  }
}

/**
 * Lo stato dell'abbonamento è cambiato: creato, rinnovato, sospeso, disdetto.
 *
 * `ritardo_dal` **non** si tocca qui. Lo stato `past_due` arriva insieme a
 * `invoice.payment_failed`, ed è quello a sapere *quando* è cominciato il
 * ritardo. Scriverlo in due punti significherebbe che l'ultimo dei due a
 * passare sovrascrive l'altro, e l'ordine degli eventi di Stripe non è garantito.
 */
async function gestisciAbbonamento(sub: Stripe.Subscription): Promise<void> {
  const schema = await risolviSchema(sub.customer, sub)
  if (!schema) return

  const disdetto =
    sub.status === 'canceled' || sub.status === 'incomplete_expired'
      ? new Date((sub.canceled_at ?? nowSec()) * 1000).toISOString()
      : null

  const patch: Parameters<typeof scriviAbbonamento>[1] = {
    // `?? undefined` e non `?? null`: se questo evento non porta un customer
    // utilizzabile, il collegamento già salvato NON va cancellato. Vedi
    // `soloValorizzati` in deposito.ts.
    stripe_customer_id: idCliente(sub.customer) ?? undefined,
    stripe_subscription_id: sub.id,
    stripe_status: sub.status,
    prossimo_pagamento: fineperiodo(sub) ?? undefined,
    // Qui invece il null è voluto: un abbonamento non disdetto deve poter
    // cancellare una disdetta precedente.
    disdetto_il: disdetto,
  }

  const prezzo = prezzoDa(sub)
  if (prezzo) {
    patch.prezzo_mensile_centesimi = prezzo.centesimi
    patch.valuta = prezzo.valuta
  }

  const metodo = await leggiMetodo(sub)
  if (metodo) patch.metodo_pagamento = metodo

  // Un abbonamento tornato in regola cancella il ritardo. Serve perché
  // `invoice.paid` non arriva quando il recupero avviene per altre strade
  // (pagamento a mano dalla dashboard, credito applicato).
  if (sub.status === 'active' || sub.status === 'trialing') {
    patch.ritardo_dal = null
  }

  await scriviAbbonamento(schema, patch)
  await aggiornaClaimAbbonamento(schema)
}

/** Pagamento riuscito: il ritardo, se c'era, finisce qui. */
async function gestisciFatturaPagata(fattura: Stripe.Invoice): Promise<void> {
  const schema = await risolviSchema(fattura.customer, null)
  if (!schema) return

  await scriviAbbonamento(schema, {
    ritardo_dal: null,
    stripe_status: 'active',
    stripe_customer_id: idCliente(fattura.customer) ?? undefined,
  })
  await aggiornaClaimAbbonamento(schema)
}

/**
 * Pagamento fallito: parte la tolleranza — **se non è già partita**.
 *
 * È il punto più delicato di tutto il file. Stripe riprova un pagamento
 * fallito tre o quattro volte nell'arco di due settimane, e ogni tentativo
 * genera un altro `invoice.payment_failed`. Se ognuno riscrivesse
 * `ritardo_dal`, i tre giorni ripartirebbero da capo ogni volta e non
 * scadrebbero mai: il blocco non scatterebbe **mai**, per nessuno.
 *
 * Per questo si legge prima e si scrive solo se il campo è vuoto.
 */
async function gestisciFatturaFallita(fattura: Stripe.Invoice): Promise<void> {
  const schema = await risolviSchema(fattura.customer, null)
  if (!schema) return

  const esistente = await leggiAbbonamento(schema)

  await scriviAbbonamento(schema, {
    stripe_status: 'past_due',
    stripe_customer_id: idCliente(fattura.customer) ?? undefined,
    // Solo il PRIMO fallimento fa testo.
    ritardo_dal: esistente?.ritardo_dal ?? new Date().toISOString(),
  })
  await aggiornaClaimAbbonamento(schema)
}

/** Dati fiscali o carta cambiati dal portale di Stripe. */
async function gestisciCliente(cliente: Stripe.Customer): Promise<void> {
  const schema = await risolviSchema(cliente.id, null, cliente)
  if (!schema) return

  await scriviAbbonamento(schema, {
    stripe_customer_id: cliente.id,
    dati_fatturazione: await datiDa(cliente),
  })
}

/**
 * La carta con cui viene addebitato il rinnovo.
 *
 * Stripe la cerca in due posti, in quest'ordine: il metodo predefinito
 * dell'abbonamento, e se manca quello del cliente
 * (`invoice_settings.default_payment_method`). Qui si segue lo stesso ordine,
 * perché mostrare una carta diversa da quella che verrà davvero addebitata
 * sarebbe peggio che non mostrarne nessuna.
 *
 * Nei webhook i riferimenti **non sono espansi**: arrivano come stringhe, e il
 * metodo va richiesto a parte. È il motivo per cui questa funzione fa rete.
 *
 * Ritorna `undefined` — non `null` — quando non si riesce a saperlo: una carta
 * sconosciuta non deve cancellare quella già salvata.
 */
async function leggiMetodo(sub: Stripe.Subscription): Promise<MetodoPagamento | undefined> {
  try {
    const stripe = getStripe()

    let pm = await risolviPm(sub.default_payment_method)

    if (!pm) {
      const id = idCliente(sub.customer)
      if (!id) return undefined
      const cliente = await stripe.customers.retrieve(id)
      if (cliente.deleted) return undefined
      pm = await risolviPm(cliente.invoice_settings?.default_payment_method ?? null)
    }

    const carta = pm?.card
    if (!carta) return undefined

    return {
      marca: carta.brand,
      ultime4: carta.last4,
      scadenzaMese: carta.exp_month,
      scadenzaAnno: carta.exp_year,
    }
  } catch (err) {
    // Non si alza: la carta è un dettaglio di visualizzazione, e far fallire
    // il webhook per questo significherebbe perdere l'aggiornamento dello
    // stato di pagamento, che è la cosa che conta.
    console.error('[stripe] lettura metodo di pagamento fallita:', err)
    return undefined
  }
}

async function risolviPm(
  riferimento: string | Stripe.PaymentMethod | null
): Promise<Stripe.PaymentMethod | null> {
  if (!riferimento) return null
  if (typeof riferimento !== 'string') return riferimento
  return getStripe().paymentMethods.retrieve(riferimento)
}

/**
 * Le due ricerche vere, quelle che toccano il mondo. La logica che le mette in
 * fila sta in `lib/billing/tenant.ts`, dove si può provare senza rete.
 */
const RICERCHE: RicercheTenant = {
  perCustomer: schemaDaCustomer,

  /**
   * `{}` e `null` sono risposte diverse, e la differenza conta: `{}` significa
   * «Stripe ha risposto, questo cliente non è nostro» — il caso normale di
   * `stripe trigger` — mentre `null` significa «non sono riuscito a chiedere».
   * Un cliente cancellato è nel primo gruppo: non ha metadati, ma la risposta
   * è arrivata.
   */
  metadatiCliente: async (id) => {
    try {
      const cliente = await getStripe().customers.retrieve(id)
      return cliente.deleted ? {} : cliente.metadata
    } catch (err) {
      console.error(`[stripe] lettura del customer ${id} fallita:`, err)
      return null
    }
  },
}

/**
 * Il tenant di questo evento, con il log giusto quando non si trova.
 *
 * Tre esiti negativi, tre reazioni diverse — ed è il motivo per cui
 * `risolviSchema` torna un perché invece di un `null` muto:
 *
 * - **`senza-customer`** — evento malformato. Si grida, si ignora.
 * - **`non-nostro`** — Stripe ha risposto e quel cliente non ha `schema_name`.
 *   È il caso atteso con `stripe trigger`, e non è un errore.
 * - **`stripe-muto`** — non si è potuto chiedere. Qui si **alza**, e il
 *   chiamante risponde 500: è un guasto passeggero, e il ritentativo di Stripe
 *   è esattamente ciò che serve. Ingoiarlo con un 200 significherebbe perdere
 *   per sempre il primo evento di un cliente nuovo — cioè proprio l'evento che
 *   crea il collegamento, e senza il quale nessuno degli altri saprà atterrare.
 */
async function risolviSchema(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
  sub: Stripe.Subscription | null,
  cliente?: Stripe.Customer
): Promise<string | null> {
  const esito = await risolviSchemaCon(RICERCHE, customer, sub, cliente)

  // `!== null` e non un `if` di verità: è il confronto con un tipo unità che
  // permette al compilatore di scegliere il ramo giusto dell'unione, e da lì
  // di sapere che `perche` esiste e che i tre casi sotto sono tutti.
  if (esito.schema !== null) return esito.schema

  const id = idCliente(customer)

  switch (esito.perche) {
    case 'senza-customer':
      console.error('[stripe] evento senza customer utilizzabile: impossibile risolvere il tenant')
      return null

    case 'non-nostro':
      console.warn(
        `[stripe] il customer ${id} non ha schema_name nei metadati e non è collegato ad alcun tenant: evento ignorato`
      )
      return null

    case 'stripe-muto':
      throw new Error(
        `Tenant del customer ${id} non risolvibile: Stripe non ha risposto. Evento da ritentare.`
      )
  }
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * La fine del periodo pagato.
 *
 * Nelle API recenti `current_period_end` non sta più sull'abbonamento ma su
 * ogni voce (`items.data[].current_period_end`), perché un abbonamento può
 * contenere righe con periodi diversi. Si prende la più lontana: è la data
 * fino a cui il cliente ha comunque diritto al servizio.
 */
function fineperiodo(sub: Stripe.Subscription): string | null {
  const fini = sub.items?.data
    ?.map((voce) => (voce as { current_period_end?: number }).current_period_end)
    .filter((n): n is number => typeof n === 'number')

  if (!fini || fini.length === 0) return null
  return new Date(Math.max(...fini) * 1000).toISOString()
}

function prezzoDa(sub: Stripe.Subscription): { centesimi: number; valuta: string } | null {
  const voce = sub.items?.data?.[0]
  const prezzo = voce?.price
  if (!prezzo || typeof prezzo.unit_amount !== 'number') return null
  return {
    centesimi: prezzo.unit_amount * (voce.quantity ?? 1),
    valuta: prezzo.currency,
  }
}

/**
 * Dal Customer di Stripe ai nostri campi di fatturazione.
 *
 * ⚠️ `cliente.tax_ids` **non arriva nei webhook**: nel tipo è opzionale perché
 * Stripe lo include solo se lo chiedi espandendolo, e il payload di un evento
 * non lo espande mai. Leggerlo da lì darebbe sempre stringa vuota, e siccome
 * questi dati vengono riscritti interi a ogni `customer.updated`, il risultato
 * sarebbe **cancellare la partita IVA salvata** a ogni modifica fatta dal
 * portale. Va chiesta a parte.
 */
async function datiDa(cliente: Stripe.Customer) {
  const indirizzo = cliente.address
  let piva = ''
  try {
    const elenco = await getStripe().customers.listTaxIds(cliente.id, { limit: 1 })
    piva = elenco.data[0]?.value ?? ''
  } catch (err) {
    console.error('[stripe] lettura partita IVA fallita:', err)
  }

  return {
    ragioneSociale: cliente.name ?? '',
    // Stripe salva la P.IVA europea con il prefisso paese: `IT01234567890`.
    // Il gestionale la mostra e la valida senza.
    partitaIva: piva.replace(/^IT/i, ''),
    codiceFiscale: stringaMeta(cliente.metadata, 'codice_fiscale'),
    indirizzo: indirizzo?.line1 ?? '',
    cap: indirizzo?.postal_code ?? '',
    citta: indirizzo?.city ?? '',
    provincia: indirizzo?.state ?? '',
    pec: stringaMeta(cliente.metadata, 'pec'),
    codiceSdi: stringaMeta(cliente.metadata, 'codice_sdi'),
    emailAmministrativa: cliente.email ?? '',
  }
}

function stringaMeta(meta: Stripe.Metadata | null, chiave: string): string {
  const valore = meta?.[chiave]
  return typeof valore === 'string' ? valore : ''
}
