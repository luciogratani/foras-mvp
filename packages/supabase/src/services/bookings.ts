import type { Tables } from '../types/database'
import type { TenantClient } from '../index'
import type { OpeningHours } from '../schemas/settings'
import {
  CreateBookingInputSchema,
  CancelBookingTokenSchema,
  type CreateBookingInput,
} from '../schemas/bookings'

export type TimeSlot = Tables<{ schema: 'template' }, 'time_slots'>
export type Booking = Tables<{ schema: 'template' }, 'bookings'>

export type AvailableTimeSlot = {
  time_slot_id: string
  label: string
  time: string
  max_covers: number
  booked_covers: number
  available_covers: number
}

export class OverbookingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OverbookingError'
  }
}

export class DuplicateBookingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DuplicateBookingError'
  }
}

/**
 * Per una data, ritorna i turni attivi con i coperti residui.
 *
 * Richiede un client privilegiato (auth.uid() IS NOT NULL): la RLS attuale
 * blocca SELECT su bookings ad anon. Il consumer server-side è responsabile
 * di passare un client istanziato con SUPABASE_SERVICE_ROLE_KEY.
 * Vedi decision-log: "2026-05-21 — bookings lato pubblico — service_role server-side, no RPC".
 */
export async function getAvailableTimeSlots(
  client: TenantClient,
  date: string
): Promise<AvailableTimeSlot[]> {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const currentTime = now.toISOString().slice(11, 16)
  if (date < today) return []

  const [slotsRes, bookedRes, settingsRes, closedDateRes] = await Promise.all([
    client.from('time_slots').select('*').eq('is_active', true).order('time', { ascending: true }),
    client
      .from('bookings')
      .select('time_slot_id, covers')
      .eq('date', date)
      .eq('status', 'confirmed'),
    client.from('site_settings').select('opening_hours').limit(1).maybeSingle(),
    client
      .from('closed_dates')
      .select('id')
      .lte('date', date)
      .or(`end_date.is.null,end_date.gte.${date}`)
      .limit(1)
      .maybeSingle(),
  ])

  if (slotsRes.error) throw new Error(`getAvailableTimeSlots (slots) failed: ${slotsRes.error.message}`)
  if (bookedRes.error) throw new Error(`getAvailableTimeSlots (bookings) failed: ${bookedRes.error.message}`)
  if (settingsRes.error) throw new Error(`getAvailableTimeSlots (settings) failed: ${settingsRes.error.message}`)
  if (closedDateRes.error) throw new Error(`getAvailableTimeSlots (closed_dates) failed: ${closedDateRes.error.message}`)

  // data chiusa straordinariamente → nessun turno disponibile
  if (closedDateRes.data) return []

  const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
  const dayKey = DAY_NAMES[new Date(date).getUTCDay()]
  const hours = settingsRes.data?.opening_hours as OpeningHours | null | undefined
  if (hours?.[dayKey]?.closed === true) return []

  const dayHours = hours?.[dayKey]
  const ranges = dayHours?.ranges ?? []
  const slots = (slotsRes.data ?? []).filter((slot) => {
    if (date === today && slot.time < currentTime) return false
    // se ranges è vuoto e il giorno non è closed, nessuna restrizione oraria
    if (ranges.length === 0) return true
    // il turno deve cadere all'interno di almeno una fascia
    return ranges.some((r) => slot.time >= r.open && slot.time < r.close)
  })

  const bookedBySlot = new Map<string, number>()
  for (const row of bookedRes.data ?? []) {
    bookedBySlot.set(row.time_slot_id, (bookedBySlot.get(row.time_slot_id) ?? 0) + row.covers)
  }

  return slots.map((slot) => {
    const booked_covers = bookedBySlot.get(slot.id) ?? 0
    return {
      time_slot_id: slot.id,
      label: slot.label,
      time: slot.time,
      max_covers: slot.max_covers,
      booked_covers,
      available_covers: Math.max(0, slot.max_covers - booked_covers),
    }
  })
}

/**
 * Crea una prenotazione. Il controllo capacità richiede un client privilegiato
 * (SELECT su bookings bloccato ad anon — stessa ragione di getAvailableTimeSlots).
 *
 * RACE CONDITION NOTA (MVP): il controllo capacità + insert non è atomico.
 * Un overbooking soft è possibile con due inserimenti simultanei sullo stesso
 * slot in pochi millisecondi. L'unique constraint è il vero rate-limit; questa
 * limitazione è accettabile per MVP. Trigger di revisione = primo caso reale
 * di overbooking osservato in produzione.
 */
export async function createBooking(
  client: TenantClient,
  input: CreateBookingInput
): Promise<{ id: string; cancellation_token: string }> {
  const parsed = CreateBookingInputSchema.parse(input)

  const today = new Date().toISOString().slice(0, 10)
  if (parsed.date < today) throw new Error('Non è possibile prenotare per una data passata')

  const slots = await getAvailableTimeSlots(client, parsed.date)
  const slot = slots.find((s) => s.time_slot_id === parsed.time_slot_id)
  if (!slot) throw new Error('time_slot non disponibile')
  if (slot.available_covers < parsed.covers) {
    throw new OverbookingError(
      `Coperti insufficienti: richiesti ${parsed.covers}, disponibili ${slot.available_covers}`
    )
  }

  const { data, error } = await client
    .from('bookings')
    .insert(parsed)
    .select('id, cancellation_token')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new DuplicateBookingError(
        `Prenotazione duplicata: esiste già una prenotazione per questa email su questo turno e data`
      )
    }
    throw new Error(`createBooking failed: ${error.message}`)
  }

  return { id: data.id, cancellation_token: data.cancellation_token }
}

export type BookingAdmin = Tables<{ schema: 'template' }, 'bookings'>

export async function getBookingsAdmin(
  client: TenantClient,
  filters?: { date?: string; time_slot_id?: string }
): Promise<BookingAdmin[]> {
  let query = client
    .from('bookings')
    .select('*')
    .order('date', { ascending: false })
    .order('time_slot_id', { ascending: true })

  if (filters?.date) query = query.eq('date', filters.date)
  if (filters?.time_slot_id) query = query.eq('time_slot_id', filters.time_slot_id)

  const { data, error } = await query
  if (error) throw new Error(`getBookingsAdmin failed: ${error.message}`)
  return data ?? []
}

export async function cancelBookingAdmin(client: TenantClient, id: string): Promise<void> {
  const { error } = await client
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
  if (error) throw new Error(`cancelBookingAdmin failed: ${error.message}`)
}

/**
 * Cancella una prenotazione confermata dato il suo token.
 *
 * Richiede client privilegiato (RLS: bookings_admin_update).
 * Non throw per token non trovato: è un esito normale per un link riusato.
 */
export async function cancelBookingByToken(
  client: TenantClient,
  token: string
): Promise<{ cancelled: boolean; booking_id?: string }> {
  CancelBookingTokenSchema.parse(token)

  const { data, error } = await client
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('cancellation_token', token)
    .eq('status', 'confirmed')
    .select('id')
    .maybeSingle()

  if (error) throw new Error(`cancelBookingByToken failed: ${error.message}`)

  if (data?.id) return { cancelled: true, booking_id: data.id }
  return { cancelled: false }
}
