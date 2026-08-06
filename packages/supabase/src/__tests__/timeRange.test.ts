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
import {
  isTimeWithinRange,
  isTimeWithinWindow,
  isOvernightRange,
  isSlotStillOpenToday,
} from '../lib/timeRange'

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

describe('isTimeWithinWindow — finestra di prenotazione (estremo finale incluso)', () => {
  // Caso reale di University: si prenota dalle 19:00 alle 23:00, 23:00 comprese.
  const start = '19:00'
  const end = '23:00'

  it('include l’ultimo arrivo dichiarato dal gestore', () => {
    expect(isTimeWithinWindow('23:00', start, end)).toBe(true)
  })

  it('include l’orario di inizio e gli orari interni', () => {
    expect(isTimeWithinWindow('19:00', start, end)).toBe(true)
    expect(isTimeWithinWindow('21:15', start, end)).toBe(true)
  })

  it('esclude ciò che sta fuori', () => {
    expect(isTimeWithinWindow('18:59', start, end)).toBe(false)
    expect(isTimeWithinWindow('23:01', start, end)).toBe(false)
    expect(isTimeWithinWindow('02:00', start, end)).toBe(false)
  })

  it('differisce da isTimeWithinRange solo sull’estremo finale', () => {
    expect(isTimeWithinRange('23:00', start, end)).toBe(false) // fascia: chiuso
    expect(isTimeWithinWindow('23:00', start, end)).toBe(true) // finestra: ultimo arrivo
    for (const t of ['19:00', '20:30', '22:59', '18:00', '23:30']) {
      expect(isTimeWithinWindow(t, start, end)).toBe(isTimeWithinRange(t, start, end))
    }
  })

  it('include l’estremo finale anche su finestra che scavalca la mezzanotte', () => {
    expect(isTimeWithinWindow('01:00', '22:00', '01:00')).toBe(true)
    expect(isTimeWithinWindow('23:30', '22:00', '01:00')).toBe(true)
    expect(isTimeWithinWindow('01:01', '22:00', '01:00')).toBe(false)
    expect(isTimeWithinWindow('21:59', '22:00', '01:00')).toBe(false)
  })

  it('estremi coincidenti descrivono un istante solo', () => {
    expect(isTimeWithinWindow('19:00', '19:00', '19:00')).toBe(true)
    expect(isTimeWithinWindow('19:01', '19:00', '19:00')).toBe(false)
  })

  it('normalizza HH:MM:SS', () => {
    expect(isTimeWithinWindow('23:00:00', '19:00:00', '23:00:00')).toBe(true)
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

describe('isSlotStillOpenToday', () => {
  const fisso = (time: string) => ({ time, end_time: null })
  const finestra = (time: string, end_time: string) => ({ time, end_time })

  describe('turno a orario fisso (end_time null) — comportamento storico', () => {
    it('è prenotabile prima del turno', () => {
      expect(isSlotStillOpenToday(fisso('20:00:00'), '18:30')).toBe(true)
    })

    it('è prenotabile nell istante esatto del turno', () => {
      expect(isSlotStillOpenToday(fisso('20:00:00'), '20:00')).toBe(true)
    })

    it('NON è più prenotabile un minuto dopo', () => {
      expect(isSlotStillOpenToday(fisso('20:00:00'), '20:01')).toBe(false)
    })
  })

  describe('turno a finestra di arrivo — la regressione', () => {
    // Il caso reale osservato in produzione il 2026-08-06 alle 19:21:
    // il sito dichiarava il locale chiuso perché il turno era "già iniziato".
    it('resta prenotabile DOPO l inizio, finché la finestra è aperta', () => {
      expect(isSlotStillOpenToday(finestra('19:00:00', '23:00:00'), '19:21')).toBe(true)
      expect(isSlotStillOpenToday(finestra('19:00:00', '23:00:00'), '22:59')).toBe(true)
    })

    it('è prenotabile fino all ultimo arrivo INCLUSO', () => {
      expect(isSlotStillOpenToday(finestra('19:00:00', '23:00:00'), '23:00')).toBe(true)
    })

    it('non è più prenotabile un minuto dopo l ultimo arrivo', () => {
      expect(isSlotStillOpenToday(finestra('19:00:00', '23:00:00'), '23:01')).toBe(false)
    })

    it('è prenotabile molto prima che la finestra si apra', () => {
      expect(isSlotStillOpenToday(finestra('19:00:00', '23:00:00'), '09:00')).toBe(true)
    })
  })

  describe('finestra che scavalca la mezzanotte', () => {
    // L ultimo arrivo cade il giorno dopo: dentro la giornata non scade mai.
    it('è prenotabile a metà giornata', () => {
      expect(isSlotStillOpenToday(finestra('22:00:00', '01:00:00'), '12:00')).toBe(true)
    })

    it('è prenotabile dentro la finestra, prima di mezzanotte', () => {
      expect(isSlotStillOpenToday(finestra('22:00:00', '01:00:00'), '23:30')).toBe(true)
    })

    it('è prenotabile anche dopo la chiusura di ieri, per la finestra di stasera', () => {
      expect(isSlotStillOpenToday(finestra('22:00:00', '01:00:00'), '02:00')).toBe(true)
    })
  })

  describe('normalizzazione degli orari', () => {
    // Il DB ritorna "HH:MM:SS", il clock "HH:MM". Senza hhmm su ENTRAMBI i lati
    // il confronto direbbe che "20:00:00" viene dopo "20:00", e il turno
    // sparirebbe nel suo stesso istante di inizio.
    it('tratta "20:00:00" e "20:00" come lo stesso istante', () => {
      expect(isSlotStillOpenToday(fisso('20:00:00'), '20:00')).toBe(true)
      expect(isSlotStillOpenToday({ time: '20:00', end_time: null }, '20:00')).toBe(true)
    })

    it('normalizza anche end_time', () => {
      expect(isSlotStillOpenToday(finestra('19:00', '23:00'), '23:00')).toBe(true)
      expect(isSlotStillOpenToday(finestra('19:00:00', '23:00:00'), '23:00:00')).toBe(true)
    })
  })
})
