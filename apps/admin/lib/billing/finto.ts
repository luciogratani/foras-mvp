/**
 * I dati finti dell'abbonamento, uno scenario per stato.
 *
 * Esistono per una ragione sola: far vedere e provare le schermate prima che
 * Stripe esista. Quando Stripe entrerà, questo file si cancella e
 * `sorgente.ts` smette di importarlo — nient'altro lo conosce.
 *
 * Le date sono **relative all'istante**, non scritte a mano: uno scenario con
 * date fisse scade da solo e dopo tre giorni mostra un ritardo già sospeso
 * anche quando volevi vedere il banner.
 *
 * I valori qui dentro sono **dimostrativi e volutamente anonimi**: questo file
 * vive nel template e lo vede ogni fork, quindi non deve contenere il nome né
 * il prezzo di un cliente vero. Chi apre lo scenario deve capire a colpo
 * d'occhio che sta guardando dati finti.
 */
import type { Fattura, RecordAbbonamento, StatoAbbonamento } from './stato'

const GIORNO_MS = 24 * 60 * 60 * 1000

/** Prezzo dimostrativo. Quello vero e' un dato per tenant, non una costante di prodotto. */
const PREZZO_DIMOSTRATIVO_CENTESIMI = 7900

const DATI_FATTURAZIONE = {
  ragioneSociale: 'Bar Esempio S.r.l.',
  partitaIva: '',
  codiceFiscale: '',
  indirizzo: '',
  cap: '',
  citta: '',
  provincia: '',
  pec: '',
  codiceSdi: '',
  emailAmministrativa: '',
}

const METODO_PAGAMENTO = {
  marca: 'visa',
  ultime4: '4242',
  scadenzaMese: 11,
  scadenzaAnno: 2028,
}

function fattura(
  ora: number,
  mesiFa: number,
  stato: Fattura['stato'],
  progressivo: number
): Fattura {
  const data = new Date(ora)
  data.setMonth(data.getMonth() - mesiFa)
  return {
    id: `in_finta_${progressivo}`,
    numero: `FORAS-2026-${String(progressivo).padStart(4, '0')}`,
    data: data.toISOString(),
    importoCentesimi: PREZZO_DIMOSTRATIVO_CENTESIMI,
    stato,
    // Nessun PDF finto: un link che non scarica niente è peggio di un
    // trattino, perché insegna a fidarsi di un bottone rotto.
    urlPdf: null,
  }
}

export function recordFinto(stato: StatoAbbonamento, ora: number = Date.now()): RecordAbbonamento {
  const base = {
    configurato: true,
    stripeCustomerId: null,
    prezzoMensileCentesimi: PREZZO_DIMOSTRATIVO_CENTESIMI,
    disdettoIl: null,
    metodoPagamento: METODO_PAGAMENTO,
    datiFatturazione: DATI_FATTURAZIONE,
  }

  if (stato === 'attivo') {
    return {
      ...base,
      prossimoPagamento: new Date(ora + 18 * GIORNO_MS).toISOString(),
      ritardoDal: null,
      fatture: [
        fattura(ora, 0, 'pagata', 4),
        fattura(ora, 1, 'pagata', 3),
        fattura(ora, 2, 'pagata', 2),
        fattura(ora, 3, 'pagata', 1),
      ],
    }
  }

  if (stato === 'in_ritardo') {
    // Un giorno e mezzo fa: restano 1 giorno pieno e qualche ora. È lo
    // scenario interessante, perché mostra il plurale al singolare.
    return {
      ...base,
      prossimoPagamento: new Date(ora - 1.5 * GIORNO_MS).toISOString(),
      ritardoDal: new Date(ora - 1.5 * GIORNO_MS).toISOString(),
      fatture: [
        fattura(ora, 0, 'fallita', 4),
        fattura(ora, 1, 'pagata', 3),
        fattura(ora, 2, 'pagata', 2),
        fattura(ora, 3, 'pagata', 1),
      ],
    }
  }

  return {
    ...base,
    prossimoPagamento: new Date(ora - 9 * GIORNO_MS).toISOString(),
    ritardoDal: new Date(ora - 9 * GIORNO_MS).toISOString(),
    fatture: [
      fattura(ora, 0, 'fallita', 4),
      fattura(ora, 1, 'fallita', 3),
      fattura(ora, 2, 'pagata', 2),
      fattura(ora, 3, 'pagata', 1),
    ],
  }
}
