import { describe, expect, it } from 'vitest'
import {
  componiAbbonamento,
  statoDaClaim,
  GIORNI_TOLLERANZA,
  type RecordAbbonamento,
} from '../stato'

/**
 * La derivazione dello stato dell'abbonamento.
 *
 * Tutto qui dentro è puro e riceve l'istante come parametro: nessun test tocca
 * l'orologio di sistema, ed è per questo che si può provare «un millisecondo
 * prima della scadenza» senza trucchi.
 */

const G = 24 * 60 * 60 * 1000
const ORA = Date.parse('2026-08-07T12:00:00Z')

function record(patch: Partial<RecordAbbonamento> = {}): RecordAbbonamento {
  return {
    configurato: true,
    stripeCustomerId: null,
    prezzoMensileCentesimi: 7900,
    prossimoPagamento: null,
    ritardoDal: null,
    disdettoIl: null,
    metodoPagamento: null,
    datiFatturazione: null,
    fatture: [],
    ...patch,
  }
}

const iso = (delta: number) => new Date(ORA - delta).toISOString()

describe('componiAbbonamento', () => {
  it('dichiara una tolleranza di 3 giorni', () => {
    expect(GIORNI_TOLLERANZA).toBe(3)
  })

  it('senza ritardo è attivo', () => {
    expect(componiAbbonamento(record(), ORA).stato).toBe('attivo')
  })

  it('una disdetta blocca subito, senza tolleranza', () => {
    // I 3 giorni servono a una carta che non passa, non a chi se ne va.
    expect(componiAbbonamento(record({ disdettoIl: iso(0) }), ORA).stato).toBe('sospeso')
  })

  it('una data illeggibile non chiude fuori nessuno', () => {
    expect(componiAbbonamento(record({ ritardoDal: 'bue' }), ORA).stato).toBe('attivo')
  })

  /**
   * Il caso di oggi, e il più importante: nessun cliente ha una riga in
   * `public.tenant_subscriptions`, e sono tutti online. Se l'assenza valesse
   * come insolvenza, il gestionale si spegnerebbe da solo al primo deploy.
   */
  describe('non configurato non blocca MAI', () => {
    it('nemmeno con un ritardo di novanta giorni', () => {
      const a = componiAbbonamento(record({ configurato: false, ritardoDal: iso(90 * G) }), ORA)
      expect(a.stato).toBe('attivo')
    })

    it('nemmeno con una disdetta', () => {
      const a = componiAbbonamento(record({ configurato: false, disdettoIl: iso(90 * G) }), ORA)
      expect(a.stato).toBe('attivo')
    })
  })

  describe('i bordi dei tre giorni', () => {
    it.each([
      ['appena fallito', 0, 'in_ritardo', 3],
      ['dopo 1 giorno', 1 * G, 'in_ritardo', 2],
      ['dopo 2 giorni', 2 * G, 'in_ritardo', 1],
      ['1 ms prima della scadenza', 3 * G - 1, 'in_ritardo', 0],
      ['alla scadenza esatta', 3 * G, 'sospeso', 0],
      ['1 ms dopo la scadenza', 3 * G + 1, 'sospeso', 0],
      ['dopo 10 giorni', 10 * G, 'sospeso', 0],
    ])('%s → %s, %i giorni residui', (_nome, delta, stato, giorni) => {
      const a = componiAbbonamento(record({ ritardoDal: iso(delta as number) }), ORA)
      expect(a.stato).toBe(stato)
      expect(a.giorniResidui).toBe(giorni)
    })
  })
})

describe('statoDaClaim', () => {
  /**
   * Il claim è la copia che `proxy.ts` legge dai metadati dell'utente per non
   * interrogare il database a ogni navigazione. Se dicesse una cosa diversa
   * dal database, il blocco e ciò che si vede a schermo divergerebbero.
   */
  it.each([
    [0, 'in_ritardo'],
    [1 * G, 'in_ritardo'],
    [3 * G - 1, 'in_ritardo'],
    [3 * G, 'sospeso'],
    [10 * G, 'sospeso'],
  ])('a %i ms dal fallimento dice la stessa cosa del database', (delta, atteso) => {
    const ritardoDal = iso(delta as number)
    const daDatabase = componiAbbonamento(record({ ritardoDal }), ORA).stato
    const daClaim = statoDaClaim({ configurato: true, ritardoDal, disdettoIl: null }, ORA)

    expect(daClaim).toBe(daDatabase)
    expect(daClaim).toBe(atteso)
  })

  /**
   * Il bug che questa sessione ha commesso e corretto: il claim viene scritto
   * UNA volta, quando il pagamento fallisce, e poi **nessun evento lo
   * riscrive** per tre giorni. Salvarci dentro lo stato già calcolato avrebbe
   * significato «in ritardo» per sempre, e un blocco che non scatta mai.
   * Salvandoci la data, il tempo lavora da solo.
   */
  describe('invecchia da solo, senza nuovi eventi', () => {
    const claim = { configurato: true, ritardoDal: iso(0), disdettoIl: null }

    it.each([
      ['subito', 0, 'in_ritardo'],
      ['due giorni dopo', 2 * G, 'in_ritardo'],
      ['quattro giorni dopo', 4 * G, 'sospeso'],
    ])('%s → %s', (_nome, avanti, atteso) => {
      expect(statoDaClaim(claim, ORA + (avanti as number))).toBe(atteso)
    })
  })

  describe('assente o manomesso non blocca nessuno', () => {
    it.each([
      ['assente', undefined],
      ['null', null],
      ['una stringa', 'sospeso'],
      ['senza configurato', { ritardoDal: iso(90 * G) }],
      ['con tipi sbagliati', { configurato: true, ritardoDal: 42, disdettoIl: null }],
    ])('%s → attivo', (_nome, claim) => {
      expect(statoDaClaim(claim, ORA)).toBe('attivo')
    })
  })

  it('una disdetta nel claim blocca subito', () => {
    expect(
      statoDaClaim({ configurato: true, ritardoDal: null, disdettoIl: iso(0) }, ORA)
    ).toBe('sospeso')
  })
})
