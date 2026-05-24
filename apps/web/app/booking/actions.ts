'use server'
import { after } from 'next/server'
import {
  createBooking,
  OverbookingError,
  DuplicateBookingError,
  CreateBookingInputSchema,
} from '@repo/supabase'
import { getWebSupabaseAdmin } from '../../lib/supabaseAdmin'
import { notifyBooking } from '../../lib/notifyBooking'

export type BookingFieldErrors = Record<string, string[] | undefined>

export type BookingValues = {
  time_slot_id: string
  name: string
  email: string
  phone: string
  covers: string
  notes: string
  preferred_time: string
  gdpr_consent: boolean
}

export type BookingActionState =
  | { status: 'idle' }
  | { status: 'success'; cancellation_token: string; booking_id: string }
  | {
      status: 'error'
      message: string
      fieldErrors?: BookingFieldErrors
      values?: BookingValues
    }

export async function createBookingAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  // Valori grezzi ripopolati nel form in caso di errore (no form azzerato).
  const values: BookingValues = {
    time_slot_id: String(formData.get('time_slot_id') ?? ''),
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    covers: String(formData.get('covers') ?? ''),
    notes: String(formData.get('notes') ?? ''),
    preferred_time: String(formData.get('preferred_time') ?? ''),
    gdpr_consent: formData.get('gdpr_consent') === 'on',
  }

  const rawInput = {
    time_slot_id: formData.get('time_slot_id'),
    date: formData.get('date'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || null,
    covers: Number(formData.get('covers')),
    notes: formData.get('notes') || null,
    preferred_time: formData.get('preferred_time') || null,
    gdpr_consent: formData.get('gdpr_consent') === 'on' ? true : false,
  }

  const parsed = CreateBookingInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Controlla i campi evidenziati e riprova.',
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    }
  }

  try {
    const { id, cancellation_token } = await createBooking(getWebSupabaseAdmin(), parsed.data)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    after(() => notifyBooking(id, siteUrl))
    return { status: 'success', cancellation_token, booking_id: id }
  } catch (err) {
    if (err instanceof OverbookingError) {
      return {
        status: 'error',
        message: 'Non ci sono abbastanza coperti disponibili per il turno selezionato.',
        values,
      }
    }
    if (err instanceof DuplicateBookingError) {
      return {
        status: 'error',
        message: 'Esiste già una prenotazione con questa email per il turno e la data selezionati.',
        values,
      }
    }
    return { status: 'error', message: 'Si è verificato un errore. Riprova più tardi.', values }
  }
}
