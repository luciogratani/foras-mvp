'use server'
import {
  createBooking,
  OverbookingError,
  DuplicateBookingError,
  CreateBookingInputSchema,
} from '@repo/supabase'
import { getWebSupabaseAdmin } from '../../lib/supabaseAdmin'

export type BookingActionState =
  | { status: 'idle' }
  | { status: 'success'; cancellation_token: string; booking_id: string }
  | { status: 'error'; message: string }

export async function createBookingAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const rawInput = {
    time_slot_id: formData.get('time_slot_id'),
    date: formData.get('date'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || null,
    covers: Number(formData.get('covers')),
    notes: formData.get('notes') || null,
    gdpr_consent: formData.get('gdpr_consent') === 'on' ? true : false,
  }

  const parsed = CreateBookingInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { status: 'error', message: 'Dati non validi. Controlla i campi e riprova.' }
  }

  try {
    const { id, cancellation_token } = await createBooking(getWebSupabaseAdmin(), parsed.data)
    return { status: 'success', cancellation_token, booking_id: id }
  } catch (err) {
    if (err instanceof OverbookingError) {
      return {
        status: 'error',
        message: 'Non ci sono abbastanza coperti disponibili per il turno selezionato.',
      }
    }
    if (err instanceof DuplicateBookingError) {
      return {
        status: 'error',
        message: 'Esiste già una prenotazione con questa email per il turno e la data selezionati.',
      }
    }
    return { status: 'error', message: 'Si è verificato un errore. Riprova più tardi.' }
  }
}
