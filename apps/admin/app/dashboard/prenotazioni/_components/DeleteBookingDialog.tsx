'use client'
import { useActionState, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui'
import { Button } from '@repo/ui'
import { cancelBookingAction, type BookingActionState } from '../actions'

type Props = {
  id: string
  name: string
  date: string
  slotLabel: string
}

const initialState: BookingActionState = { status: 'idle' }

export function DeleteBookingDialog({ id, name, date, slotLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(cancelBookingAction, initialState)

  useEffect(() => {
    if (state.status === 'success') setOpen(false)
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Cancella
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancella prenotazione</DialogTitle>
          <DialogDescription>
            Stai per cancellare la prenotazione di <strong>{name}</strong> per il {date} — turno{' '}
            <strong>{slotLabel}</strong>. Questa azione non è reversibile.
          </DialogDescription>
        </DialogHeader>
        {state.status === 'error' && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <Button variant="destructive" type="submit" disabled={pending}>
              {pending ? 'Cancellazione…' : 'Conferma cancellazione'}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
