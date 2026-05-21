'use client'
import { useActionState } from 'react'
import type { AvailableTimeSlot } from '@repo/supabase'
import { createBookingAction, type BookingActionState } from '../actions'

const initialState: BookingActionState = { status: 'idle' }

export function BookingForm({ slots, date }: { slots: AvailableTimeSlot[]; date: string }) {
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState)

  if (state.status === 'success') {
    return (
      <div>
        <h2>Prenotazione confermata!</h2>
        <p>Per annullare la prenotazione, usa questo link:</p>
        <a href={`/booking/cancel/${state.cancellation_token}`}>
          Annulla prenotazione
        </a>
        <p>
          <em>
            Conserva questo link — è il tuo unico modo per cancellare la prenotazione
            (le email di conferma non sono ancora attive).
          </em>
        </p>
        <a href="/">← Torna alla homepage</a>
      </div>
    )
  }

  const hasAvailableSlots = slots.some((s) => s.available_covers > 0)

  return (
    <div>
      <form method="GET" action="/booking">
        <label>
          Data:{' '}
          <input type="date" name="date" defaultValue={date} />
        </label>
        <button type="submit">Aggiorna</button>
      </form>

      {state.status === 'error' && (
        <div role="alert">
          <p>{state.message}</p>
        </div>
      )}

      {slots.length === 0 || !hasAvailableSlots ? (
        <p>Nessun turno disponibile per questa data. Seleziona un&apos;altra data.</p>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="date" value={date} />

          <div>
            <label htmlFor="time_slot_id">Turno</label>
            <select id="time_slot_id" name="time_slot_id" required>
              {slots.map((slot) => (
                <option
                  key={slot.time_slot_id}
                  value={slot.time_slot_id}
                  disabled={slot.available_covers === 0}
                >
                  {slot.label} ({slot.time}) — {slot.available_covers} coperti disponibili
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name">Nome</label>
            <input id="name" type="text" name="name" required />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" required />
          </div>

          <div>
            <label htmlFor="phone">Telefono (opzionale)</label>
            <input id="phone" type="tel" name="phone" />
          </div>

          <div>
            <label htmlFor="covers">Numero di coperti</label>
            <input id="covers" type="number" name="covers" min="1" max="50" required />
          </div>

          <div>
            <label htmlFor="notes">Note (opzionale)</label>
            <textarea id="notes" name="notes" />
          </div>

          <div>
            <label>
              <input type="checkbox" name="gdpr_consent" required />
              {' '}Acconsento al trattamento dei miei dati personali per la gestione della prenotazione.
            </label>
          </div>

          <button type="submit" disabled={isPending}>
            {isPending ? 'Invio in corso…' : 'Prenota'}
          </button>
        </form>
      )}
    </div>
  )
}
