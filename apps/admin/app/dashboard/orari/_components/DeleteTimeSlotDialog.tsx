'use client'
import { useEffect } from 'react'
import { useActionState } from 'react'
import type { TimeSlotAdmin } from '@repo/supabase'
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
  onClose,
}: {
  slot: TimeSlotAdmin
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(deleteTimeSlotAction, idle)

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Elimina turno</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare il turno{' '}
            <span className="font-semibold">{slot.label}</span>? Questa azione non è reversibile.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={slot.id} />
          {state.status === 'error' && (
            <p className="text-sm text-destructive mb-4">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Annulla
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Eliminazione…' : 'Elimina'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
