import { describe, expect, it } from 'vitest'
import type Stripe from 'stripe'
import { idCliente, risolviSchema, type RicercheTenant } from '../tenant'

/**
 * Di chi è questo evento.
 *
 * ## Perché questo file esiste
 *
 * Questi casi sono un **bug congelato**, come `rotte.test.ts` e
 * `scenario.test.ts`. Fino al 2026-08-09 la risoluzione aveva due strade —
 * metadati dell'evento, poi riga sul database — e il commento sopra la funzione
 * dichiarava che i metadati del Customer funzionavano *«al primo evento, quando
 * la riga sul database non esiste ancora»*.
 *
 * Non funzionavano. Nei webhook Stripe non espande i riferimenti: `sub.customer`
 * è una stringa, quindi `customer.metadata` non esisteva proprio, e `sub.metadata`
 * sono i metadati di un altro oggetto. L'unico evento che vedeva davvero i
 * metadati del cliente era `customer.updated`.
 *
 * Il risultato era che seguendo il runbook alla lettera — `schema_name` nei
 * metadati del Customer, poi crea l'abbonamento — il primo evento di un cliente
 * nuovo non atterrava da nessuna parte, e lo diceva con la stessa riga di log
 * che `STRIPE.md` insegna a considerare normale quando si usa `stripe trigger`.
 * Un guasto e il comportamento atteso, indistinguibili.
 *
 * Il caso che vale più di tutti è **«database vuoto → si chiede a Stripe»**: se
 * un giorno torna rosso, l'onboarding del cliente successivo torna a fallire in
 * silenzio.
 */

/** Un doppio che conta le domande: metà di questi casi sono sull'*ordine*. */
function ricerche(risposte: {
  perCustomer?: string | null
  metadatiCliente?: Stripe.Metadata | null
}): RicercheTenant & { chiamate: { perCustomer: number; metadatiCliente: number } } {
  const chiamate = { perCustomer: 0, metadatiCliente: 0 }
  return {
    chiamate,
    async perCustomer() {
      chiamate.perCustomer += 1
      return risposte.perCustomer ?? null
    },
    async metadatiCliente() {
      chiamate.metadatiCliente += 1
      return risposte.metadatiCliente === undefined ? {} : risposte.metadatiCliente
    },
  }
}

const sub = (metadata: Stripe.Metadata, customer: string | Stripe.Customer = 'cus_1') =>
  ({ metadata, customer }) as unknown as Stripe.Subscription

const cliente = (metadata: Stripe.Metadata, id = 'cus_1') =>
  ({ id, metadata, object: 'customer' }) as unknown as Stripe.Customer

describe('risolviSchema', () => {
  describe('1 · i metadati che l’evento porta con sé', () => {
    it('quelli della subscription vincono su tutto', async () => {
      const r = ricerche({ perCustomer: 'altro' })
      const esito = await risolviSchema(r, 'cus_1', sub({ schema_name: 'acme' }))

      expect(esito).toEqual({ schema: 'acme', via: 'metadati-evento' })
    })

    it('quelli del cliente passato esplicitamente — è il caso di customer.updated', async () => {
      const r = ricerche({})
      const c = cliente({ schema_name: 'acme' })
      const esito = await risolviSchema(r, c.id, null, c)

      expect(esito).toEqual({ schema: 'acme', via: 'metadati-evento' })
    })

    it('quelli del customer espanso, quando per una volta lo è', async () => {
      const r = ricerche({})
      const esito = await risolviSchema(r, cliente({ schema_name: 'acme' }), null)

      expect(esito).toEqual({ schema: 'acme', via: 'metadati-evento' })
    })

    it('non chiede niente a nessuno: né database né Stripe', async () => {
      const r = ricerche({ perCustomer: 'acme' })
      await risolviSchema(r, 'cus_1', sub({ schema_name: 'acme' }))

      expect(r.chiamate).toEqual({ perCustomer: 0, metadatiCliente: 0 })
    })
  })

  describe('2 · la riga già collegata', () => {
    it('senza metadati si passa al database', async () => {
      const r = ricerche({ perCustomer: 'acme' })
      const esito = await risolviSchema(r, 'cus_1', sub({}))

      expect(esito).toEqual({ schema: 'acme', via: 'riga-collegata' })
    })

    it('⚠️ se il database sa, Stripe non si disturba', async () => {
      const r = ricerche({ perCustomer: 'acme' })
      await risolviSchema(r, 'cus_1', null)

      expect(r.chiamate).toEqual({ perCustomer: 1, metadatiCliente: 0 })
    })
  })

  describe('3 · i metadati chiesti a Stripe — la strada che mancava', () => {
    it('⚠️ database vuoto: si chiede il cliente a Stripe e si atterra', async () => {
      const r = ricerche({
        perCustomer: null,
        metadatiCliente: { schema_name: 'acme' },
      })
      const esito = await risolviSchema(r, 'cus_1', sub({}))

      expect(esito).toEqual({ schema: 'acme', via: 'metadati-cliente' })
      expect(r.chiamate).toEqual({ perCustomer: 1, metadatiCliente: 1 })
    })

    it('è il primo evento di un abbonamento appena creato: customer come stringa', async () => {
      const r = ricerche({
        perCustomer: null,
        metadatiCliente: { schema_name: 'acme', pec: 'x@y.it' },
      })
      const esito = await risolviSchema(r, 'cus_nuovo', sub({}, 'cus_nuovo'))

      expect(esito).toEqual({ schema: 'acme', via: 'metadati-cliente' })
    })

    it('la logica vecchia sarebbe rossa qui: è la regressione da impedire', async () => {
      const r = ricerche({ perCustomer: null, metadatiCliente: { schema_name: 'acme' } })
      const evento = sub({})

      // Com'era: solo metadati dell'evento, poi database. Due `null`.
      const vecchia = evento.metadata?.schema_name ?? (await r.perCustomer('cus_1'))
      expect(vecchia ?? null).toBeNull()

      // Com'è.
      expect((await risolviSchema(r, 'cus_1', evento)).schema).toBe('acme')
    })
  })

  describe('quando non si risolve, si dice perché', () => {
    it('nessun customer utilizzabile, e non si chiede niente', async () => {
      const r = ricerche({ perCustomer: 'acme' })
      const esito = await risolviSchema(r, null, null)

      expect(esito).toEqual({ schema: null, perche: 'senza-customer' })
      expect(r.chiamate).toEqual({ perCustomer: 0, metadatiCliente: 0 })
    })

    it('cliente vero ma senza schema_name: non è nostro — è il caso di `stripe trigger`', async () => {
      const r = ricerche({ perCustomer: null, metadatiCliente: {} })
      const esito = await risolviSchema(r, 'cus_finto', sub({}))

      expect(esito).toEqual({ schema: null, perche: 'non-nostro' })
    })

    it('⚠️ Stripe non risponde: è un guasto, e non va confuso col caso sopra', async () => {
      const r = ricerche({ perCustomer: null, metadatiCliente: null })
      const esito = await risolviSchema(r, 'cus_1', sub({}))

      expect(esito).toEqual({ schema: null, perche: 'stripe-muto' })
    })
  })

  describe('i metadati sono scritti a mano, quindi non ci si fida', () => {
    it.each([
      ['una stringa vuota', { schema_name: '' }],
      ['la chiave assente', {}],
    ])('%s → si passa alla strada dopo', async (_nome, metadata) => {
      const r = ricerche({ perCustomer: 'acme' })
      const esito = await risolviSchema(r, 'cus_1', sub(metadata))

      expect(esito).toEqual({ schema: 'acme', via: 'riga-collegata' })
    })

    it('una chiave diversa non è schema_name', async () => {
      const r = ricerche({ perCustomer: null, metadatiCliente: { schemaName: 'acme' } })
      const esito = await risolviSchema(r, 'cus_1', sub({ tenant: 'acme' }))

      expect(esito).toEqual({ schema: null, perche: 'non-nostro' })
    })
  })
})

describe('idCliente', () => {
  it('la stringa è già l’id — la forma normale nei webhook', () => {
    expect(idCliente('cus_1')).toBe('cus_1')
  })

  it('dall’oggetto si prende l’id', () => {
    expect(idCliente(cliente({}, 'cus_2'))).toBe('cus_2')
  })

  it('anche da un cliente cancellato: l’id resta utile per cercarlo', () => {
    const cancellato = { id: 'cus_3', deleted: true } as unknown as Stripe.DeletedCustomer
    expect(idCliente(cancellato)).toBe('cus_3')
  })

  it('null resta null', () => {
    expect(idCliente(null)).toBeNull()
  })
})
