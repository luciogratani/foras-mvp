/**
 * Il vocabolario dell'abbonamento, e l'unico posto in cui si decide in che
 * stato è un cliente.
 *
 * Qui dentro non c'è niente di Stripe e niente di Next: sono tipi e una
 * funzione pura. È voluto. Quando Stripe entrerà davvero, il webhook scriverà
 * un `RecordAbbonamento` in `public.tenant_subscriptions` e questo file non
 * cambierà di una riga — cambierà solo chi glielo passa.
 *
 * La decisione di tenere lo stato in `public` e mai nello schema del tenant è
 * del 2026-08-05 (DECISIONLOG). Il motivo è che è un dato di business di foras:
 * nello schema tenant il gestore ne sarebbe owner via RLS e potrebbe
 * manometterlo.
 */

/** Quanti giorni passano fra il primo pagamento fallito e il blocco. */
export const GIORNI_TOLLERANZA = 3

const GIORNO_MS = 24 * 60 * 60 * 1000

export type StatoAbbonamento =
  /** Pagato e in regola. Il gestionale funziona tutto. */
  | 'attivo'
  /** Un pagamento è fallito, ma la tolleranza non è finita. Avvisa, non blocca. */
  | 'in_ritardo'
  /** Tolleranza scaduta. Il gestionale è bloccato; il sito pubblico no, mai. */
  | 'sospeso'

export type StatoFattura = 'pagata' | 'fallita' | 'aperta'

export type Fattura = {
  id: string
  /** Il numero che il cliente vede sul documento, non l'id tecnico. */
  numero: string
  /** ISO 8601. */
  data: string
  importoCentesimi: number
  stato: StatoFattura
  /**
   * L'`invoice_pdf` di Stripe. È `null` finché la fattura non è emessa:
   * un link assente è uno stato legittimo, non un errore.
   */
  urlPdf: string | null
}

export type MetodoPagamento = {
  /** `visa`, `mastercard`, … — come lo scrive Stripe, minuscolo. */
  marca: string
  ultime4: string
  scadenzaMese: number
  scadenzaAnno: number
}

export type DatiFatturazione = {
  ragioneSociale: string
  partitaIva: string
  codiceFiscale: string
  indirizzo: string
  cap: string
  citta: string
  provincia: string
  /**
   * Fatturazione elettronica: serve almeno uno fra PEC e codice SDI.
   * Non è una regola tecnica, è come funziona l'Agenzia delle Entrate.
   */
  pec: string
  codiceSdi: string
  emailAmministrativa: string
}

/**
 * La riga di `public.tenant_subscriptions` come sarà. È quello che il webhook
 * di Stripe scrive: fatti grezzi, nessuno stato calcolato.
 *
 * Lo stato *non* si salva. Si deriva dall'orologio a ogni lettura, perché uno
 * stato salvato invecchia in silenzio: se nessuno lo ricalcola, un cliente
 * fermo da un mese risulta ancora «in ritardo da ieri».
 */
export type RecordAbbonamento = {
  /**
   * Falso quando il tenant **non ha ancora una riga** in
   * `public.tenant_subscriptions`, o quando Stripe non è collegato.
   *
   * Non è la stessa cosa di «non ha pagato», ed è la distinzione che tiene i
   * clienti dentro il loro gestionale: oggi nessuno ha una riga, e nessuno
   * deve risultare bloccato per questo. Un abbonamento non configurato non
   * blocca mai — al massimo lo si dice, in Account.
   */
  configurato: boolean
  /**
   * Il Customer di Stripe. Serve per aprire il portale e per chiedere le
   * fatture: senza, quelle due cose non si possono fare e la pagina lo dice.
   */
  stripeCustomerId: string | null
  /** Il prezzo è per tenant: lo decidi tu cliente per cliente. */
  prezzoMensileCentesimi: number
  /** ISO 8601. Fine del periodo pagato — `current_period_end` di Stripe. */
  prossimoPagamento: string | null
  /**
   * ISO 8601 del **primo** pagamento fallito ancora non recuperato, `null` se
   * è tutto in regola. È l'unico campo da cui dipendono ritardo e blocco.
   */
  ritardoDal: string | null
  /**
   * Disdetta esplicita: blocca subito, senza tolleranza. La tolleranza serve a
   * una carta che non passa, non a chi ha deciso di andarsene.
   */
  disdettoIl: string | null
  metodoPagamento: MetodoPagamento | null
  datiFatturazione: DatiFatturazione | null
  fatture: Fattura[]
}

/** Quello che la UI consuma: il record più ciò che si ricava dall'orologio. */
export type Abbonamento = RecordAbbonamento & {
  stato: StatoAbbonamento
  /** ISO 8601: quando scade la tolleranza. `null` se non c'è un ritardo. */
  scadenzaTolleranza: string | null
  /**
   * Giorni interi che restano prima del blocco. 0 significa «oggi è l'ultimo
   * giorno», non «è già bloccato» — per quello c'è `stato`.
   */
  giorniResidui: number
}

/**
 * Da record a stato. Pura: l'istante entra come parametro e non si legge mai
 * `Date.now()` qui dentro, così il caso «mancano due ore alla mezzanotte del
 * terzo giorno» si prova senza toccare l'orologio di sistema.
 */
export function componiAbbonamento(
  record: RecordAbbonamento,
  ora: number = Date.now()
): Abbonamento {
  // Un abbonamento che non esiste ancora non può essere in ritardo. Questa
  // riga sta PRIMA di tutto il resto di proposito: è la garanzia che il
  // gestionale di un cliente non ancora configurato non si spenga mai.
  if (!record.configurato) {
    return { ...record, stato: 'attivo', scadenzaTolleranza: null, giorniResidui: 0 }
  }

  if (record.disdettoIl) {
    return { ...record, stato: 'sospeso', scadenzaTolleranza: null, giorniResidui: 0 }
  }

  if (!record.ritardoDal) {
    return { ...record, stato: 'attivo', scadenzaTolleranza: null, giorniResidui: 0 }
  }

  const inizio = Date.parse(record.ritardoDal)
  // Una data illeggibile non deve chiudere fuori un cliente che paga: nel
  // dubbio si lascia entrare e si sbaglia dalla parte del cliente.
  if (Number.isNaN(inizio)) {
    return { ...record, stato: 'attivo', scadenzaTolleranza: null, giorniResidui: 0 }
  }

  const scadenza = inizio + GIORNI_TOLLERANZA * GIORNO_MS
  const mancano = scadenza - ora

  return {
    ...record,
    stato: mancano > 0 ? 'in_ritardo' : 'sospeso',
    scadenzaTolleranza: new Date(scadenza).toISOString(),
    giorniResidui: mancano > 0 ? Math.floor(mancano / GIORNO_MS) : 0,
  }
}

/** Vero quando il gestionale va bloccato. Un posto solo per rispondere. */
export function abbonamentoBloccante(stato: StatoAbbonamento): boolean {
  return stato === 'sospeso'
}

/**
 * Ciò che il webhook copia nei metadati dell'utente perché `proxy.ts` possa
 * decidere senza toccare il database.
 *
 * Sono **fatti con una data**, non uno stato già calcolato, e la differenza è
 * tutto: uno stato salvato al momento del fallimento direbbe «in ritardo» per
 * sempre, perché fra il primo e il terzo giorno non succede niente che possa
 * riscriverlo. L'orologio avanza da solo, gli eventi no.
 */
export type ClaimAbbonamento = {
  configurato: boolean
  ritardoDal: string | null
  disdettoIl: string | null
}

/**
 * Lo stato a partire dal claim, con la **stessa** funzione che lo calcola dal
 * database. È il motivo per cui le due strade non possono divergere.
 *
 * Un claim assente o malformato vale «non configurato», cioè non blocca: il
 * middleware sbaglia dalla parte del cliente, come tutto il resto.
 */
export function statoDaClaim(grezzo: unknown, ora: number = Date.now()): StatoAbbonamento {
  if (!grezzo || typeof grezzo !== 'object') return 'attivo'

  const c = grezzo as Partial<ClaimAbbonamento>
  if (c.configurato !== true) return 'attivo'

  return componiAbbonamento(
    {
      configurato: true,
      stripeCustomerId: null,
      prezzoMensileCentesimi: 0,
      prossimoPagamento: null,
      ritardoDal: typeof c.ritardoDal === 'string' ? c.ritardoDal : null,
      disdettoIl: typeof c.disdettoIl === 'string' ? c.disdettoIl : null,
      metodoPagamento: null,
      datiFatturazione: null,
      fatture: [],
    },
    ora
  ).stato
}

export function formattaEuro(centesimi: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(centesimi / 100)
}

export function formattaData(iso: string | null): string {
  if (!iso) return '—'
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return '—'
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Rome',
  }).format(t)
}
