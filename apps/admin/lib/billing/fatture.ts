import 'server-only'
import type { Fattura, StatoFattura } from './stato'
import { getStripe, stripeConfigurato } from './stripe'

/**
 * Le fatture, lette da Stripe al momento.
 *
 * Non stanno in tabella di proposito. La pagina Account si apre raramente,
 * l'elenco cambia una volta al mese, e Stripe è sempre più aggiornato di
 * qualunque copia. Sincronizzarle vorrebbe dire un secondo flusso da tenere in
 * piedi — con i suoi eventi, i suoi ritardi e i suoi disallineamenti — per un
 * dato che possiamo semplicemente chiedere.
 *
 * Il prezzo è una chiamata di rete su una pagina sola. Se un giorno diventasse
 * un problema, la risposta giusta sarebbe una cache breve, non una tabella.
 */
export async function getFatture(customerId: string | null, quante = 12): Promise<Fattura[]> {
  if (!customerId || !stripeConfigurato()) return []

  try {
    const elenco = await getStripe().invoices.list({
      customer: customerId,
      limit: quante,
    })

    return elenco.data.map(daStripe)
  } catch (err) {
    // Stripe irraggiungibile non deve rompere la pagina: la sezione mostra
    // «nessuna fattura» ed è un peccato veniale, mentre un 500 su Account
    // sarebbe una porta chiusa proprio a chi sta cercando di pagare.
    console.error('[billing] lettura fatture fallita:', err)
    return []
  }
}

function daStripe(f: {
  id?: string
  number?: string | null
  created: number
  amount_due: number
  amount_paid: number
  status?: string | null
  invoice_pdf?: string | null
}): Fattura {
  return {
    id: f.id ?? `sconosciuta_${f.created}`,
    // Le bozze non hanno ancora un numero: si mostra un trattino invece di un
    // id tecnico, che al gestore non direbbe niente.
    numero: f.number ?? '—',
    data: new Date(f.created * 1000).toISOString(),
    // `amount_due` e non `amount_paid`: su una fattura fallita il secondo è
    // zero, e mostrare «0,00 €» accanto a «Fallita» farebbe pensare che non
    // fosse dovuto niente.
    importoCentesimi: f.amount_due,
    stato: statoDa(f.status),
    urlPdf: f.invoice_pdf ?? null,
  }
}

function statoDa(stato: string | null | undefined): StatoFattura {
  switch (stato) {
    case 'paid':
      return 'pagata'
    case 'uncollectible':
    case 'void':
      return 'fallita'
    default:
      // `open` e `draft`. Una fattura aperta può essere un pagamento in corso
      // o uno fallito in attesa del prossimo tentativo: da qui non si distingue,
      // e «in attesa» è vero in entrambi i casi.
      return 'aperta'
  }
}
