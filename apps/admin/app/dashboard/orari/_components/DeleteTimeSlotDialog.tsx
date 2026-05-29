'use client'
import { useEffect } from 'react'
import { useActionState } from 'react'
import type { TimeSlotAdmin, SlotBookingCounts } from '@repo/supabase'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui'
import { deleteTimeSlotAction, type SettingsActionState } from '../actions'

const idle: SettingsActionState = { status: 'idle' }

export function DeleteTimeSlotDialog({
  slot,
  counts,
  onClose,
}: {
  slot: TimeSlotAdmin
  counts: SlotBookingCounts
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(deleteTimeSlotAction, idle)
  // La FK bookings_time_slot_id_fkey blocca l'eliminazione finché esiste anche
  // una sola prenotazione collegata (incluse cancellate/passate dello storico).
  const blocked = counts.total > 0

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Elimina turno</DialogTitle>
          <DialogDescription>
            {blocked ? (
              <>
                Il turno <span className="font-semibold">{slot.label}</span> non può essere
                eliminato.
              </>
            ) : (
              <>
                Sei sicuro di voler eliminare il turno{' '}
                <span className="font-semibold">{slot.label}</span>? Questa azione non è reversibile.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {blocked && (
          <div className="rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-900 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-200">
            <p className="font-medium">
              {counts.total} prenotazion{counts.total === 1 ? 'e' : 'i'} collegat
              {counts.total === 1 ? 'a' : 'e'} a questo turno
              {counts.upcoming > 0 && (
                <> (di cui {counts.upcoming} in arrivo)</>
              )}.
            </p>
            <p className="mt-1">
              Le prenotazioni — anche passate o cancellate — restano nello storico, quindi il turno
              non è eliminabile. Per toglierlo dal sito usa l&apos;interruttore{' '}
              <strong>«Visibile sul sito»</strong>: le prenotazioni esistenti restano valide.
            </p>
          </div>
        )}
        <form action={formAction}>
          <input type="hidden" name="id" value={slot.id} />
          {state.status === 'error' && (
            <p className="text-sm text-destructive mb-4">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {blocked ? 'Chiudi' : 'Annulla'}
            </Button>
            {!blocked && (
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? 'Eliminazione…' : 'Elimina'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
