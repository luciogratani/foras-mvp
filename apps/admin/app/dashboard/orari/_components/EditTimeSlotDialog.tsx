'use client'
import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import type { TimeSlotAdmin } from '@repo/supabase'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
} from '@repo/ui'
import { updateTimeSlotAction, type SettingsActionState } from '../actions'

const idle: SettingsActionState = { status: 'idle' }

export function EditTimeSlotDialog({
  slot,
  onClose,
}: {
  slot: TimeSlotAdmin
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(updateTimeSlotAction, idle)
  const [isActive, setIsActive] = useState(slot.is_active)

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica turno</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={slot.id} />
          <input type="hidden" name="is_active" value={isActive.toString()} />
          <div className="space-y-1">
            <Label htmlFor="edit-slot-label">Nome</Label>
            <Input
              id="edit-slot-label"
              name="label"
              defaultValue={slot.label}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-slot-time">Orario</Label>
            <Input
              id="edit-slot-time"
              name="time"
              type="time"
              defaultValue={slot.time.substring(0, 5)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-slot-covers">Coperti massimi</Label>
            <Input
              id="edit-slot-covers"
              name="max_covers"
              type="number"
              min="1"
              defaultValue={slot.max_covers}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Coperti totali accettati per questa seduta. Per gestire due sedute a sera
              (es. 19:30 e 21:30), crea due turni separati con il proprio limite ciascuno.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="edit-slot-active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="edit-slot-active">Visibile sul sito</Label>
          </div>
          {state.status === 'error' && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Annulla
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvataggio…' : 'Salva'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
