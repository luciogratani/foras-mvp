/**
 * bookings.test.ts
 *
 * Integration tests for the booking service layer against a real ephemeral
 * Postgres instance (provided by the TEST_DATABASE_URL env var).
 *
 * Schema provisioning uses create_schema_from_template.sql verbatim (no
 * modifications to the SQL file — it is consumed as-is per spec).
 *
 * Covered paths:
 *   - createBooking: capacity / overbooking guard
 *   - createBooking: booking-window enforcement (time-window slots)
 *   - createBooking: duplicate unique-constraint violation
 *   - getAvailableTimeSlots: closed dates block all slots
 *   - getAvailableTimeSlots: opening-hours ranges filter slots
 *   - cancelBookingByToken: happy path + idempotent on already-cancelled
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Pool } from 'pg'

import {
  getAvailableTimeSlots,
  createBooking,
  cancelBookingByToken,
  OverbookingError,
  DuplicateBookingError,
  BookingWindowError,
} from '../services/bookings'
import { localNow, localToday } from '../lib/clock'
import type { TenantClient } from '../index'
import { createPgMockClient } from './helpers/pg-mock-client'
import {
  getTestPool,
  bootstrapHarness,
  provisionSchema,
  dropSchema,
} from './helpers/setup-db'

// ── constants ──────────────────────────────────────────────────────────────
const SCHEMA = 'test_bookings_' + Date.now()
const OWNER_UUID = '00000000-0000-0000-0001-' + Date.now().toString().padStart(12, '0').slice(0, 12)

let pool: Pool
let client: TenantClient

// ── helpers ────────────────────────────────────────────────────────────────

/** Execute raw SQL directly (for test fixture setup) */
async function rawQuery(sql: string, params?: unknown[]) {
  const c = await pool.connect()
  try {
    return await c.query(sql, params as never[])
  } finally {
    c.release()
  }
}

async function getSlotId(label: string): Promise<string> {
  const res = await rawQuery(
    `SELECT id FROM "${SCHEMA}".time_slots WHERE label = $1 LIMIT 1`,
    [label]
  )
  if (!res.rows[0]) throw new Error(`Slot not found: ${label}`)
  return res.rows[0].id as string
}

async function getSiteSettingsId(): Promise<string> {
  const res = await rawQuery(`SELECT id FROM "${SCHEMA}".site_settings LIMIT 1`)
  if (!res.rows[0]) throw new Error('site_settings row not found')
  return res.rows[0].id as string
}

/** Set opening_hours directly so we can control which days/ranges are open */
async function setOpeningHours(hours: Record<string, unknown>) {
  const id = await getSiteSettingsId()
  await rawQuery(
    `UPDATE "${SCHEMA}".site_settings SET opening_hours = $1 WHERE id = $2`,
    [JSON.stringify(hours), id]
  )
}

/** Add a closed_date entry */
async function addClosedDate(date: string, endDate?: string) {
  if (endDate) {
    await rawQuery(
      `INSERT INTO "${SCHEMA}".closed_dates (date, end_date) VALUES ($1, $2) ON CONFLICT (date) DO UPDATE SET end_date = $2`,
      [date, endDate]
    )
  } else {
    await rawQuery(
      `INSERT INTO "${SCHEMA}".closed_dates (date) VALUES ($1) ON CONFLICT (date) DO NOTHING`,
      [date]
    )
  }
}

async function removeClosedDate(date: string) {
  await rawQuery(`DELETE FROM "${SCHEMA}".closed_dates WHERE date = $1`, [date])
}

/** Insert a custom time_slot for test purposes */
async function insertSlot(label: string, time: string, maxCovers: number, endTime?: string): Promise<string> {
  const res = await rawQuery(
    `INSERT INTO "${SCHEMA}".time_slots (label, time, end_time, max_covers, is_active)
     VALUES ($1, $2, $3, $4, true) RETURNING id`,
    [label, time, endTime ?? null, maxCovers]
  )
  return res.rows[0].id as string
}

/** Delete a time_slot + its bookings */
async function removeSlot(id: string) {
  await rawQuery(`DELETE FROM "${SCHEMA}".bookings WHERE time_slot_id = $1`, [id])
  await rawQuery(`DELETE FROM "${SCHEMA}".time_slots WHERE id = $1`, [id])
}

/** Remove test bookings from a slot on a date */
async function clearBookings(slotId: string, date: string) {
  await rawQuery(
    `DELETE FROM "${SCHEMA}".bookings WHERE time_slot_id = $1 AND date = $2`,
    [slotId, date]
  )
}

// ── lifecycle ──────────────────────────────────────────────────────────────

beforeAll(async () => {
  pool = getTestPool()
  await bootstrapHarness(pool)
  await provisionSchema(pool, SCHEMA, OWNER_UUID)

  // The mock client runs as superuser (bypasses RLS) — same as service_role in prod.
  client = createPgMockClient(pool, SCHEMA) as unknown as TenantClient

  // Set opening_hours to: every day open 00:00–23:59 with no ranges (unrestricted)
  // so tests don't fail due to "day closed" by default.
  const allOpen: Record<string, unknown> = {}
  for (const day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
    allOpen[day] = { closed: false, ranges: [] }
  }
  await setOpeningHours(allOpen)
}, 60_000)

afterAll(async () => {
  await dropSchema(pool, SCHEMA)
  await pool.end()
}, 30_000)

// ── test suites ────────────────────────────────────────────────────────────

describe('getAvailableTimeSlots', () => {
  it('returns empty array for past dates', async () => {
    const result = await getAvailableTimeSlots(client, '2000-01-01')
    expect(result).toEqual([])
  })

  it('returns empty array when date is in a closed_date range', async () => {
    const target = '2099-06-15'
    await addClosedDate(target)
    try {
      const result = await getAvailableTimeSlots(client, target)
      expect(result).toEqual([])
    } finally {
      await removeClosedDate(target)
    }
  })

  it('returns empty array when closed_date covers a range including the date', async () => {
    const target = '2099-07-10'
    await addClosedDate('2099-07-08', '2099-07-12')
    try {
      const result = await getAvailableTimeSlots(client, target)
      expect(result).toEqual([])
    } finally {
      await removeClosedDate('2099-07-08')
    }
  })

  it('returns empty array when opening_hours marks the day as closed', async () => {
    // Mark *the actual weekday* of testDate as closed — derive it the same way the
    // service does (getUTCDay on the date-only string) so the test can't drift on a
    // wrong hardcoded weekday.
    const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
    const testDate = '2099-09-01'
    const targetDay = DAY_NAMES[new Date(testDate).getUTCDay()]

    const allOpenExceptTarget: Record<string, unknown> = {}
    for (const day of DAY_NAMES) {
      allOpenExceptTarget[day] = day === targetDay
        ? { closed: true, ranges: [] }
        : { closed: false, ranges: [] }
    }
    await setOpeningHours(allOpenExceptTarget)

    try {
      const result = await getAvailableTimeSlots(client, testDate)
      expect(result).toEqual([])
    } finally {
      // restore all-open
      const allOpen: Record<string, unknown> = {}
      for (const day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
        allOpen[day] = { closed: false, ranges: [] }
      }
      await setOpeningHours(allOpen)
    }
  })

  it('filters slots outside opening-hours ranges', async () => {
    // Create a slot at 08:00 and a slot at 20:00
    const earlySlot = await insertSlot('EarlyTest', '08:00', 10)
    const eveningSlot = await insertSlot('EveningTest', '20:00', 10)

    // Restrict *the actual weekday* of testDate to 18:00–23:00 — derive the day the
    // same way the service does, so the test can't drift on a wrong hardcoded day.
    const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
    const testDate = '2099-09-06'
    const rangeDay = DAY_NAMES[new Date(testDate).getUTCDay()]
    const restricted: Record<string, unknown> = {}
    for (const day of DAY_NAMES) {
      restricted[day] = day === rangeDay
        ? { closed: false, ranges: [{ open: '18:00', close: '23:00' }] }
        : { closed: false, ranges: [] }
    }
    await setOpeningHours(restricted)

    try {
      const result = await getAvailableTimeSlots(client, testDate)
      const ids = result.map((s) => s.time_slot_id)
      expect(ids).not.toContain(earlySlot) // 08:00 is outside 18:00–23:00
      expect(ids).toContain(eveningSlot)   // 20:00 is inside 18:00–23:00
    } finally {
      await removeSlot(earlySlot)
      await removeSlot(eveningSlot)
      const allOpen: Record<string, unknown> = {}
      for (const day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
        allOpen[day] = { closed: false, ranges: [] }
      }
      await setOpeningHours(allOpen)
    }
  })

  it('keeps slots inside an opening-hours range that crosses midnight', async () => {
    // Regressione: con orari tipo 15:00–02:00 il confronto diretto
    // `time >= open && time < close` è insoddisfacibile e svuotava la lista.
    // Caso reale: University, aperto 15:00–02:00 tutti i giorni.
    // Vedi docs/fixes/2026-08-05-fasce-oltre-mezzanotte.md
    const afternoonSlot = await insertSlot('OvernightAfternoon', '14:00', 10) // fuori
    const eveningSlot = await insertSlot('OvernightEvening', '20:00', 10) // dentro, pre-mezzanotte
    const nightSlot = await insertSlot('OvernightNight', '01:00', 10) // dentro, post-mezzanotte

    const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
    const testDate = '2099-09-06'
    const rangeDay = DAY_NAMES[new Date(testDate).getUTCDay()]
    const overnight: Record<string, unknown> = {}
    for (const day of DAY_NAMES) {
      overnight[day] = day === rangeDay
        ? { closed: false, ranges: [{ open: '15:00', close: '02:00' }] }
        : { closed: false, ranges: [] }
    }
    await setOpeningHours(overnight)

    try {
      const result = await getAvailableTimeSlots(client, testDate)
      const ids = result.map((s) => s.time_slot_id)
      expect(ids).toContain(eveningSlot) // 20:00 → dentro 15:00–02:00
      expect(ids).toContain(nightSlot) // 01:00 → dentro, dopo la mezzanotte
      expect(ids).not.toContain(afternoonSlot) // 14:00 → locale ancora chiuso
    } finally {
      await removeSlot(afternoonSlot)
      await removeSlot(eveningSlot)
      await removeSlot(nightSlot)
      const allOpen: Record<string, unknown> = {}
      for (const day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
        allOpen[day] = { closed: false, ranges: [] }
      }
      await setOpeningHours(allOpen)
    }
  })

  it('returns available_covers accounting for existing confirmed bookings', async () => {
    const slotId = await insertSlot('CapacityTest', '19:00', 10)
    const testDate = '2099-08-20'

    // Insert 4 confirmed covers directly
    await rawQuery(
      `INSERT INTO "${SCHEMA}".bookings
         (time_slot_id, date, name, email, covers, gdpr_consent, status)
       VALUES ($1, $2, 'Test', 'cap@test.example', 4, true, 'confirmed')`,
      [slotId, testDate]
    )

    try {
      const result = await getAvailableTimeSlots(client, testDate)
      const slot = result.find((s) => s.time_slot_id === slotId)
      expect(slot).toBeDefined()
      expect(slot!.booked_covers).toBe(4)
      expect(slot!.available_covers).toBe(6) // 10 - 4
    } finally {
      await clearBookings(slotId, testDate)
      await removeSlot(slotId)
    }
  })
})

describe('createBooking', () => {
  it('creates a booking and returns id + cancellation_token', async () => {
    const slotId = await getSlotId('Pranzo')
    const testDate = '2099-10-01'

    const result = await createBooking(client, {
      time_slot_id: slotId,
      date: testDate,
      name: 'Test User',
      email: 'create@test.example',
      covers: 2,
      gdpr_consent: true,
    })

    expect(result.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(result.cancellation_token).toMatch(/^[0-9a-f-]{36}$/)

    await clearBookings(slotId, testDate)
  })

  it('throws OverbookingError when requested covers exceed availability', async () => {
    const slotId = await insertSlot('OverbookTest', '21:00', 3)
    const testDate = '2099-10-15'

    // Fill all 3 slots
    await rawQuery(
      `INSERT INTO "${SCHEMA}".bookings
         (time_slot_id, date, name, email, covers, gdpr_consent, status)
       VALUES ($1, $2, 'Filler', 'fill@test.example', 3, true, 'confirmed')`,
      [slotId, testDate]
    )

    try {
      await expect(
        createBooking(client, {
          time_slot_id: slotId,
          date: testDate,
          name: 'Overflow',
          email: 'over@test.example',
          covers: 1,
          gdpr_consent: true,
        })
      ).rejects.toThrow(OverbookingError)
    } finally {
      await clearBookings(slotId, testDate)
      await removeSlot(slotId)
    }
  })

  it('throws OverbookingError for partial overbooking (remaining < requested)', async () => {
    const slotId = await insertSlot('PartialOverbook', '22:00', 5)
    const testDate = '2099-10-20'

    // 4 of 5 booked
    await rawQuery(
      `INSERT INTO "${SCHEMA}".bookings
         (time_slot_id, date, name, email, covers, gdpr_consent, status)
       VALUES ($1, $2, 'Partial', 'partial@test.example', 4, true, 'confirmed')`,
      [slotId, testDate]
    )

    try {
      // Try to book 2 (only 1 left)
      await expect(
        createBooking(client, {
          time_slot_id: slotId,
          date: testDate,
          name: 'TooMany',
          email: 'toomany@test.example',
          covers: 2,
          gdpr_consent: true,
        })
      ).rejects.toThrow(OverbookingError)
    } finally {
      await clearBookings(slotId, testDate)
      await removeSlot(slotId)
    }
  })

  it('throws DuplicateBookingError on same email + slot + date', async () => {
    const slotId = await getSlotId('Pranzo')
    const testDate = '2099-11-01'

    // First booking succeeds
    await createBooking(client, {
      time_slot_id: slotId,
      date: testDate,
      name: 'Dup User',
      email: 'dup@test.example',
      covers: 1,
      gdpr_consent: true,
    })

    try {
      // Second booking with same email+slot+date should fail
      await expect(
        createBooking(client, {
          time_slot_id: slotId,
          date: testDate,
          name: 'Dup User 2',
          email: 'dup@test.example', // same email
          covers: 1,
          gdpr_consent: true,
        })
      ).rejects.toThrow(DuplicateBookingError)
    } finally {
      await clearBookings(slotId, testDate)
    }
  })

  it('throws BookingWindowError when slot has end_time and preferred_time is missing', async () => {
    const slotId = await insertSlot('WindowedSlot', '19:00', 20, '21:00')
    const testDate = '2099-12-01'

    try {
      await expect(
        createBooking(client, {
          time_slot_id: slotId,
          date: testDate,
          name: 'Window Test',
          email: 'window@test.example',
          covers: 2,
          gdpr_consent: true,
          // preferred_time intentionally omitted
        })
      ).rejects.toThrow(BookingWindowError)
    } finally {
      await removeSlot(slotId)
    }
  })

  it('throws BookingWindowError when preferred_time is outside the window', async () => {
    const slotId = await insertSlot('WindowedSlot2', '19:00', 20, '21:00')
    const testDate = '2099-12-05'

    try {
      await expect(
        createBooking(client, {
          time_slot_id: slotId,
          date: testDate,
          name: 'Window Bad',
          email: 'winbad@test.example',
          covers: 1,
          gdpr_consent: true,
          preferred_time: '22:00', // after end_time 21:00
        })
      ).rejects.toThrow(BookingWindowError)
    } finally {
      await removeSlot(slotId)
    }
  })

  it('accepts booking when preferred_time is within the window', async () => {
    const slotId = await insertSlot('WindowedSlot3', '19:00', 20, '21:00')
    const testDate = '2099-12-10'

    try {
      const result = await createBooking(client, {
        time_slot_id: slotId,
        date: testDate,
        name: 'Window OK',
        email: 'winok@test.example',
        covers: 1,
        gdpr_consent: true,
        preferred_time: '19:30',
      })
      expect(result.id).toBeTruthy()
    } finally {
      await clearBookings(slotId, testDate)
      await removeSlot(slotId)
    }
  })

  it('accepts an arrival exactly at end_time (last arrival, inclusive)', async () => {
    // Caso reale University: turno 19:00–23:00, "fino alle 23" incluse.
    const slotId = await insertSlot('InclusiveEnd', '19:00', 20, '23:00')
    const testDate = '2099-12-13'

    try {
      const result = await createBooking(client, {
        time_slot_id: slotId,
        date: testDate,
        name: 'Ultimo arrivo',
        email: 'ultimo@test.example',
        covers: 2,
        gdpr_consent: true,
        preferred_time: '23:00',
      })
      expect(result.id).toBeTruthy()
    } finally {
      await clearBookings(slotId, testDate)
      await removeSlot(slotId)
    }
  })

  it('accepts an arrival after midnight when the slot window crosses midnight', async () => {
    // Turno 22:00–01:00: l'arrivo alle 00:30 è dentro la finestra.
    // Prima del fix era rifiutato, e il turno stesso non era nemmeno salvabile.
    const slotId = await insertSlot('OvernightWindow', '22:00', 20, '01:00')
    const testDate = '2099-12-11'

    try {
      const result = await createBooking(client, {
        time_slot_id: slotId,
        date: testDate,
        name: 'Arrivo notturno',
        email: 'notte@test.example',
        covers: 2,
        gdpr_consent: true,
        preferred_time: '00:30',
      })
      expect(result.id).toBeTruthy()
    } finally {
      await clearBookings(slotId, testDate)
      await removeSlot(slotId)
    }
  })

  it('rejects an arrival outside a slot window that crosses midnight', async () => {
    const slotId = await insertSlot('OvernightWindowReject', '22:00', 20, '01:00')
    const testDate = '2099-12-12'

    try {
      await expect(
        createBooking(client, {
          time_slot_id: slotId,
          date: testDate,
          name: 'Arrivo fuori finestra',
          email: 'fuori@test.example',
          covers: 2,
          gdpr_consent: true,
          preferred_time: '03:00', // il turno è già finito alle 01:00
        })
      ).rejects.toThrow(BookingWindowError)
    } finally {
      await clearBookings(slotId, testDate)
      await removeSlot(slotId)
    }
  })

  it('rejects bookings for past dates', async () => {
    const slotId = await getSlotId('Cena')
    await expect(
      createBooking(client, {
        time_slot_id: slotId,
        date: '2000-01-01',
        name: 'Past',
        email: 'past@test.example',
        covers: 1,
        gdpr_consent: true,
      })
    ).rejects.toThrow(/passata/)
  })
})

describe('createBooking — arrivo nel passato, per la data odierna', () => {
  // Questi sono i PRIMI test della suite che esercitano `date === today`.
  // Tutti gli altri usano il 2099: il ramo "oggi" di getAvailableTimeSlots non
  // era mai stato eseguito, ed è il motivo per cui il bug della finestra è
  // sopravvissuto a due fix consecutivi sugli orari.
  //
  // La finestra 00:00–23:59 è scelta per essere stabile a qualunque ora giri il
  // test: il turno è sempre visibile e ogni orario del giorno cade dentro la
  // finestra dichiarata, così l'unica cosa sotto esame è il confronto con adesso.

  const adesso = () => localNow()

  it('rifiuta un orario di arrivo già passato', async () => {
    if (adesso() === '00:00') return // unico minuto in cui non esiste un "prima"
    const slotId = await insertSlot('OggiPassato', '00:00', 10, '23:59')
    const oggi = localToday()
    try {
      await expect(
        createBooking(client, {
          time_slot_id: slotId,
          date: oggi,
          name: 'Test Passato',
          email: 'passato@example.com',
          phone: null,
          covers: 2,
          notes: null,
          preferred_time: '00:00',
          gdpr_consent: true,
        })
      ).rejects.toThrow(BookingWindowError)
    } finally {
      await clearBookings(slotId, oggi)
      await removeSlot(slotId)
    }
  })

  it('accetta un orario di arrivo ancora da venire', async () => {
    if (adesso() >= '23:59') return
    const slotId = await insertSlot('OggiFuturo', '00:00', 10, '23:59')
    const oggi = localToday()
    try {
      const res = await createBooking(client, {
        time_slot_id: slotId,
        date: oggi,
        name: 'Test Futuro',
        email: 'futuro@example.com',
        phone: null,
        covers: 2,
        notes: null,
        preferred_time: '23:59',
        gdpr_consent: true,
      })
      expect(res.id).toBeTruthy()
    } finally {
      await clearBookings(slotId, oggi)
      await removeSlot(slotId)
    }
  })

  it('un turno-finestra resta prenotabile oggi anche dopo il suo inizio', async () => {
    // La regressione osservata in produzione: prima del fix questo turno
    // spariva dall'elenco e createBooking falliva con "time_slot non disponibile".
    if (adesso() === '00:00' || adesso() >= '23:59') return
    const slotId = await insertSlot('OggiIniziato', '00:00', 10, '23:59')
    const oggi = localToday()
    try {
      const disponibili = await getAvailableTimeSlots(client, oggi)
      expect(disponibili.some((s) => s.time_slot_id === slotId)).toBe(true)
    } finally {
      await removeSlot(slotId)
    }
  })
})

describe('cancelBookingByToken', () => {
  it('cancels a confirmed booking and returns cancelled: true', async () => {
    const slotId = await getSlotId('Pranzo')
    const testDate = '2099-11-15'

    const { cancellation_token } = await createBooking(client, {
      time_slot_id: slotId,
      date: testDate,
      name: 'Cancel Me',
      email: 'cancel@test.example',
      covers: 1,
      gdpr_consent: true,
    })

    const result = await cancelBookingByToken(client, cancellation_token)
    expect(result.cancelled).toBe(true)
    expect(result.booking_id).toBeTruthy()

    // Verify status in DB
    const check = await rawQuery(
      `SELECT status FROM "${SCHEMA}".bookings WHERE cancellation_token = $1`,
      [cancellation_token]
    )
    expect(check.rows[0]?.status).toBe('cancelled')

    await clearBookings(slotId, testDate)
  })

  it('returns cancelled: false when token does not exist', async () => {
    const fakeToken = '00000000-0000-0000-0000-000000000000'
    const result = await cancelBookingByToken(client, fakeToken)
    expect(result.cancelled).toBe(false)
  })

  it('returns cancelled: false when booking is already cancelled (idempotent)', async () => {
    const slotId = await getSlotId('Cena')
    const testDate = '2099-11-20'

    const { cancellation_token } = await createBooking(client, {
      time_slot_id: slotId,
      date: testDate,
      name: 'Already Cancelled',
      email: 'alreadycancel@test.example',
      covers: 1,
      gdpr_consent: true,
    })

    // Cancel once
    await cancelBookingByToken(client, cancellation_token)
    // Cancel again — should not throw, returns false
    const result = await cancelBookingByToken(client, cancellation_token)
    expect(result.cancelled).toBe(false)

    await clearBookings(slotId, testDate)
  })
})
