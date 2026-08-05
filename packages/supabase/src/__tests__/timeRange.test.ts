/**
 * timeRange.test.ts — copertura della logica delle fasce orarie.
 *
 * Test puri: nessun database, nessuna fixture. Girano ovunque, anche senza
 * TEST_DATABASE_URL, ed è di proposito — la regressione che hanno colto
 * (fasce oltre la mezzanotte sempre vuote) era invisibile perché l'unico
 * test esistente sulle fasce usava `ranges: []`.
 *
 * Vedi docs/fixes/2026-08-05-fasce-oltre-mezzanotte.md
 */

import { describe, it, expect } from 'vitest'
import { isTimeWithinRange, isOvernightRange } from '../lib/timeRange'

describe('isOvernightRange', () => {
  it('riconosce una fascia normale', () => {
    expect(isOvernightRange('12:00', '15:00')).toBe(false)
    expect(isOvernightRange('09:00', '23:59')).toBe(false)
  })

  it('riconosce una fascia che scavalca la mezzanotte', () => {
    expect(isOvernightRange('15:00', '02:00')).toBe(true)
    expect(isOvernightRange('22:00', '04:00')).toBe(true)
    expect(isOvernightRange('23:59', '00:01')).toBe(true)
  })

  it('non considera overnight due estremi coincidenti', () => {
    expect(isOvernightRange('15:00', '15:00')).toBe(false)
  })

  it('accetta anche il formato HH:MM:SS del database', () => {
    expect(isOvernightRange('15:00:00', '02:00:00')).toBe(true)
    expect(isOvernightRange('12:00:00', '15:00:00')).toBe(false)
  })
})

describe('isTimeWithinRange — fascia normale', () => {
  const open = '12:00'
  const close = '15:00'

  it('include l’estremo di apertura ed esclude quello di chiusura', () => {
    expect(isTimeWithinRange('12:00', open, close)).toBe(true)
    expect(isTimeWithinRange('15:00', open, close)).toBe(false)
  })

  it('include un orario interno', () => {
    expect(isTimeWithinRange('13:30', open, close)).toBe(true)
  })

  it('esclude gli orari fuori dalla fascia', () => {
    expect(isTimeWithinRange('11:59', open, close)).toBe(false)
    expect(isTimeWithinRange('20:00', open, close)).toBe(false)
    expect(isTimeWithinRange('00:30', open, close)).toBe(false)
  })
})

describe('isTimeWithinRange — fascia oltre la mezzanotte', () => {
  // Il caso reale di University: aperto 15:00–02:00.
  const open = '15:00'
  const close = '02:00'

  it('include la sera, prima della mezzanotte', () => {
    expect(isTimeWithinRange('15:00', open, close)).toBe(true)
    expect(isTimeWithinRange('20:00', open, close)).toBe(true)
    expect(isTimeWithinRange('23:59', open, close)).toBe(true)
  })

  it('include la notte, dopo la mezzanotte', () => {
    expect(isTimeWithinRange('00:00', open, close)).toBe(true)
    expect(isTimeWithinRange('01:59', open, close)).toBe(true)
  })

  it('esclude l’orario di chiusura e le ore di locale chiuso', () => {
    expect(isTimeWithinRange('02:00', open, close)).toBe(false)
    expect(isTimeWithinRange('08:00', open, close)).toBe(false)
    expect(isTimeWithinRange('14:59', open, close)).toBe(false)
  })

  it('regressione: il confronto diretto escludeva ogni orario', () => {
    // Prima del fix la condizione era `t >= open && t < close`, che per una
    // fascia overnight è insoddisfacibile: nessun orario poteva passare.
    const orari = ['15:00', '18:30', '20:00', '23:00', '00:30', '01:45']
    const vecchiaLogica = orari.filter((t) => t >= open && t < close)
    const nuovaLogica = orari.filter((t) => isTimeWithinRange(t, open, close))

    expect(vecchiaLogica).toHaveLength(0)
    expect(nuovaLogica).toEqual(orari)
  })
})

describe('isTimeWithinRange — casi limite', () => {
  it('estremi coincidenti = durata zero, nessun orario dentro', () => {
    expect(isTimeWithinRange('15:00', '15:00', '15:00')).toBe(false)
    expect(isTimeWithinRange('20:00', '15:00', '15:00')).toBe(false)
  })

  it('normalizza HH:MM:SS, come arriva dal database', () => {
    expect(isTimeWithinRange('20:00:00', '15:00', '02:00')).toBe(true)
    expect(isTimeWithinRange('20:00:00', '15:00:00', '02:00:00')).toBe(true)
    expect(isTimeWithinRange('14:00:00', '15:00:00', '02:00:00')).toBe(false)
  })

  it('fascia che copre quasi tutte le 24 ore', () => {
    expect(isTimeWithinRange('12:00', '06:00', '05:59')).toBe(true)
    expect(isTimeWithinRange('05:59', '06:00', '05:59')).toBe(false)
  })
})
