'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import type { AvailableTimeSlot } from '@repo/supabase'
import { localToday } from '@repo/supabase'
import { createBookingAction, type BookingActionState } from '../actions'

const initialState: BookingActionState = { status: 'idle' }

export function BookingForm({ slots, date }: { slots: AvailableTimeSlot[]; date: string }) {
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState)

  const v = state.status === 'error' ? state.values : undefined
  const fe = state.status === 'error' ? state.fieldErrors : undefined

  const [selectedId, setSelectedId] = useState(v?.time_slot_id ?? '')
  const selected = slots.find((s) => s.time_slot_id === selectedId)
  const winStart = selected ? selected.time.substring(0, 5) : ''
  const winEnd = selected?.end_time ? selected.end_time.substring(0, 5) : null
  const hasWindow = winEnd !== null

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
        <Link href="/">← Torna alla homepage</Link>
      </div>
    )
  }

  const today = localToday()
  const hasAvailableSlots = slots.some((s) => s.available_covers > 0)

  return (
    <div>
      <form method="GET" action="/booking">
        <label>
          Data:{' '}
          <input
            type="date"
            name="date"
            min={today}
            defaultValue={date}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
          />
        </label>
      </form>

      {state.status === 'error' && (
        <div role="alert">
          <p>{state.message}</p>
        </div>
      )}

      {slots.length === 0 ? (
        <p>Nessun turno disponibile per questa data (potremmo essere chiusi). Prova un&apos;altra data.</p>
      ) : !hasAvailableSlots ? (
        <p>Tutti i turni sono al completo per questa data. Prova un&apos;altra data.</p>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="date" value={date} />

          <div>
            <label htmlFor="time_slot_id">Turno</label>
            <select
              id="time_slot_id"
              name="time_slot_id"
              required
              defaultValue={v?.time_slot_id ?? ''}
              onChange={(e) => setSelectedId(e.currentTarget.value)}
              aria-describedby={fe?.time_slot_id ? 'time_slot_id-error' : undefined}
            >
              <option value="" disabled>
                Seleziona un turno
              </option>
              {slots.map((slot) => (
                <option
                  key={slot.time_slot_id}
                  value={slot.time_slot_id}
                  disabled={slot.available_covers === 0}
                >
                  {slot.label} ({slot.time.substring(0, 5)}{slot.end_time ? `–${slot.end_time.substring(0, 5)}` : ''})
                  {slot.available_covers === 0 ? ' — Completo' : ''}
                </option>
              ))}
            </select>
            {fe?.time_slot_id && (
              <p id="time_slot_id-error" role="alert">{fe.time_slot_id[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="preferred_time">
              {hasWindow ? 'Orario di arrivo' : 'Orario preferito (facoltativo)'}
            </label>
            <input
              id="preferred_time"
              type="time"
              name="preferred_time"
              required={hasWindow}
              min={hasWindow ? winStart : undefined}
              max={hasWindow ? winEnd : undefined}
              defaultValue={v?.preferred_time}
              aria-describedby={fe?.preferred_time ? 'preferred_time-error' : 'preferred_time-hint'}
            />
            <p id="preferred_time-hint">
              <small>
                {hasWindow
                  ? `Scegli un orario tra ${winStart} e ${winEnd}.`
                  : 'Indicaci a che ora vorresti sederti. Sarà mostrato al gestore come preferenza.'}
              </small>
            </p>
            {fe?.preferred_time && (
              <p id="preferred_time-error" role="alert">{fe.preferred_time[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              type="text"
              name="name"
              required
              defaultValue={v?.name}
              aria-describedby={fe?.name ? 'name-error' : undefined}
            />
            {fe?.name && <p id="name-error" role="alert">{fe.name[0]}</p>}
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              required
              defaultValue={v?.email}
              aria-describedby={fe?.email ? 'email-error' : undefined}
            />
            {fe?.email && <p id="email-error" role="alert">{fe.email[0]}</p>}
          </div>

          <div>
            <label htmlFor="phone">Telefono (opzionale)</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              defaultValue={v?.phone}
              aria-describedby={fe?.phone ? 'phone-error' : undefined}
            />
            {fe?.phone && <p id="phone-error" role="alert">{fe.phone[0]}</p>}
          </div>

          <div>
            <label htmlFor="covers">Numero di coperti</label>
            <input
              id="covers"
              type="number"
              name="covers"
              min="1"
              max="50"
              required
              defaultValue={v?.covers || '2'}
              aria-describedby={fe?.covers ? 'covers-error' : undefined}
            />
            {fe?.covers && <p id="covers-error" role="alert">{fe.covers[0]}</p>}
          </div>

          <div>
            <label htmlFor="notes">Note (opzionale)</label>
            <textarea id="notes" name="notes" defaultValue={v?.notes} />
          </div>

          <div>
            <label>
              <input type="checkbox" name="gdpr_consent" required defaultChecked={v?.gdpr_consent} />
              {' '}Acconsento al trattamento dei miei dati personali per la gestione della prenotazione.
            </label>
            {fe?.gdpr_consent && (
              <p id="gdpr_consent-error" role="alert">
                Devi acconsentire al trattamento dei dati per prenotare.
              </p>
            )}
          </div>

          <button type="submit" disabled={isPending}>
            {isPending ? 'Invio in corso…' : 'Prenota'}
          </button>
        </form>
      )}
    </div>
  )
}
