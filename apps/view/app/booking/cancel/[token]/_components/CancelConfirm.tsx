'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { confirmCancelAction, type CancelActionState } from '../actions'

const initialState: CancelActionState = { status: 'idle' }

type Props = {
  token: string
  name: string
  dateLabel: string
  slotLabel: string | null
  slotTime: string | null
  covers: number
}

export function CancelConfirm({ token, name, dateLabel, slotLabel, slotTime, covers }: Props) {
  const [state, formAction, isPending] = useActionState(confirmCancelAction, initialState)

  if (state.status === 'cancelled') {
    return (
      <div>
        <p>Prenotazione annullata con successo. I coperti sono stati liberati.</p>
        <Link href="/">← Torna alla homepage</Link>
      </div>
    )
  }

  if (state.status === 'not_found') {
    return (
      <div>
        <p>Link già utilizzato o prenotazione non trovata.</p>
        <Link href="/">← Torna alla homepage</Link>
      </div>
    )
  }

  return (
    <div>
      {state.status === 'error' && (
        <p role="alert">Si è verificato un errore. Riprova più tardi.</p>
      )}
      <p>Stai per annullare questa prenotazione:</p>
      <ul>
        <li>Nome: {name}</li>
        <li>Data: {dateLabel}</li>
        {slotLabel && <li>Turno: {slotLabel}{slotTime ? ` (${slotTime})` : ''}</li>}
        <li>Coperti: {covers}</li>
      </ul>
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Annullamento…' : 'Conferma annullamento'}
        </button>
      </form>
      <p>
        <Link href="/">No, torna alla homepage</Link>
      </p>
    </div>
  )
}
