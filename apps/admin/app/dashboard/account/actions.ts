'use server'
import { cookies, headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { COOKIE_DATI } from '../../../lib/billing/cookie'
import { getAbbonamento, scenarioAbilitato } from '../../../lib/billing/sorgente'
import { getStripe, stripeConfigurato } from '../../../lib/billing/stripe'
import { ROTTA_ACCOUNT } from '../../../lib/billing/rotte'
import type { DatiFatturazione } from '../../../lib/billing/stato'

export type AccountActionState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

const CAMPI: (keyof DatiFatturazione)[] = [
  'ragioneSociale',
  'partitaIva',
  'codiceFiscale',
  'indirizzo',
  'cap',
  'citta',
  'provincia',
  'pec',
  'codiceSdi',
  'emailAmministrativa',
]

/**
 * La partita IVA italiana: 11 cifre, con il controllo di Luhn sull'ultima.
 *
 * Vale la pena farlo qui e non solo con `pattern` sull'input: una P.IVA
 * sbagliata non si scopre subito, si scopre quando la fattura viene scartata
 * dallo SdI — settimane dopo, e con un commercialista di mezzo.
 */
function partitaIvaValida(piva: string): boolean {
  if (!/^\d{11}$/.test(piva)) return false

  let somma = 0
  for (let i = 0; i < 11; i++) {
    const cifra = Number(piva[i])
    if (i % 2 === 0) {
      somma += cifra
    } else {
      const doppio = cifra * 2
      somma += doppio > 9 ? doppio - 9 : doppio
    }
  }
  return somma % 10 === 0
}

function validaDati(dati: Record<string, string>): string | null {
  if (!dati.ragioneSociale) return 'La ragione sociale è obbligatoria.'
  if (!dati.partitaIva) return 'La partita IVA è obbligatoria per la fatturazione.'
  if (!partitaIvaValida(dati.partitaIva)) {
    return 'La partita IVA non è valida: servono 11 cifre e il codice di controllo non torna.'
  }
  // Lo SdI vuole un recapito, e ne basta uno. Chiederli entrambi bloccherebbe
  // chi ne ha davvero solo uno; non chiederne nessuno manda la fattura nel vuoto.
  if (!dati.pec && !dati.codiceSdi) {
    return 'Serve almeno uno fra PEC e codice destinatario SdI per ricevere le fatture.'
  }
  if (dati.codiceSdi && !/^[A-Z0-9]{6,7}$/i.test(dati.codiceSdi)) {
    return 'Il codice destinatario SdI è di 6 o 7 caratteri.'
  }
  if (dati.cap && !/^\d{5}$/.test(dati.cap)) return 'Il CAP è di 5 cifre.'
  return null
}

export async function salvaDatiAziendaliAction(
  _prevState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const dati: Record<string, string> = {}
  for (const campo of CAMPI) {
    dati[campo] = String(formData.get(campo) ?? '').trim()
  }

  const errore = validaDati(dati)
  if (errore) return { status: 'error', message: errore }

  const abbonamento = await getAbbonamento()
  const customerId = abbonamento.stripeCustomerId

  // Con Stripe collegato la fonte di verità è il Customer: si scrive là, e il
  // webhook `customer.updated` riporta la copia sul database. Scriverla anche
  // qui a mano vorrebbe dire due scritture che possono divergere.
  if (stripeConfigurato() && customerId) {
    try {
      await aggiornaCliente(customerId, dati as unknown as DatiFatturazione)
      revalidatePath(ROTTA_ACCOUNT)
      return { status: 'success', message: 'Dati aggiornati.' }
    } catch (err) {
      console.error('[billing] aggiornamento cliente Stripe fallito:', err)
      return {
        status: 'error',
        message: 'Stripe non ha accettato la modifica. Riprova fra poco.',
      }
    }
  }

  if (!scenarioAbilitato()) {
    // Nessun customer Stripe: non c'è dove scriverli, e dirlo è meglio che
    // simulare un salvataggio.
    return {
      status: 'error',
      message:
        'L\'abbonamento non è ancora collegato a Stripe: i dati non hanno dove essere salvati. Scrivici e li configuriamo noi.',
    }
  }

  // Solo in sviluppo: il cookie tiene in piedi il modulo finché Stripe non c'è.
  ;(await cookies()).set(COOKIE_DATI, JSON.stringify(dati), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  })

  revalidatePath(ROTTA_ACCOUNT)
  return { status: 'success', message: 'Dati aggiornati (solo in locale: Stripe non è collegato).' }
}

/**
 * Scrive i dati fiscali sul Customer di Stripe.
 *
 * La P.IVA non è un campo del Customer ma un oggetto a parte (`tax_ids`), e
 * **non si aggiorna**: si cancella e si ricrea. È una stranezza dell'API, non
 * una scelta — un identificativo fiscale per Stripe o è quello giusto o va
 * sostituito.
 *
 * PEC, codice SdI e codice fiscale non hanno un posto loro: vanno nei
 * `metadata`. Stripe non emette fatture elettroniche italiane, quindi quei
 * campi servono a noi, non a lui.
 */
async function aggiornaCliente(customerId: string, dati: DatiFatturazione): Promise<void> {
  const stripe = getStripe()

  await stripe.customers.update(customerId, {
    name: dati.ragioneSociale,
    email: dati.emailAmministrativa || undefined,
    address: {
      line1: dati.indirizzo || undefined,
      postal_code: dati.cap || undefined,
      city: dati.citta || undefined,
      state: dati.provincia || undefined,
      country: 'IT',
    },
    metadata: {
      codice_fiscale: dati.codiceFiscale,
      pec: dati.pec,
      codice_sdi: dati.codiceSdi,
    },
  })

  const piva = `IT${dati.partitaIva}`
  const esistenti = await stripe.customers.listTaxIds(customerId, { limit: 10 })
  const gia = esistenti.data.find((t) => t.value === piva)

  if (!gia) {
    for (const vecchio of esistenti.data) {
      await stripe.customers.deleteTaxId(customerId, vecchio.id)
    }
    await stripe.customers.createTaxId(customerId, { type: 'eu_vat', value: piva })
  }
}

/**
 * Manda l'utente al Customer Portal di Stripe.
 *
 * **Nel gestionale non si raccoglie nessun dato di pagamento.** Si chiede a
 * Stripe un link, ci si manda l'utente, e Stripe gestisce carta, 3D Secure,
 * ricevute e disdetta. Il gestionale non vede mai un numero di carta e resta
 * fuori dall'ambito PCI: è la ragione per cui questa schermata non porta con
 * sé nessun obbligo di conformità.
 *
 * Il `redirect()` di Next lancia per funzionare, quindi sta **fuori** dal
 * try/catch — dentro, verrebbe scambiato per un errore di Stripe.
 */
export async function apriPortaleStripeAction(): Promise<AccountActionState> {
  if (!stripeConfigurato()) {
    return {
      status: 'error',
      message: 'Il portale di pagamento non è ancora collegato. Sarà qui appena Stripe viene attivato.',
    }
  }

  const abbonamento = await getAbbonamento()
  const customerId = abbonamento.stripeCustomerId

  if (!customerId) {
    return {
      status: 'error',
      message: 'Questo abbonamento non è ancora associato a un cliente Stripe. Scrivici e lo colleghiamo.',
    }
  }

  let url: string
  try {
    const origine = await origineRichiesta()
    const sessione = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origine}${ROTTA_ACCOUNT}`,
    })
    url = sessione.url
  } catch (err) {
    console.error('[billing] apertura portale fallita:', err)
    return { status: 'error', message: 'Non è stato possibile aprire il portale. Riprova fra poco.' }
  }

  redirect(url)
}

/**
 * L'indirizzo pubblico del gestionale, per far tornare indietro l'utente dal
 * portale. Si legge dagli header invece di metterlo in una variabile perché
 * l'anteprima Vercel, il dominio del cliente e `localhost` sono tre origini
 * diverse e nessuna delle tre deve rimandare alle altre.
 */
async function origineRichiesta(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3001'
  const protocollo = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${protocollo}://${host}`
}
