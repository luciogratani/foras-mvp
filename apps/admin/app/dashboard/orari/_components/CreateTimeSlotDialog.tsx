'use client'
import { useEffect, useState } from 'react'
import { useActionState } from 'react'
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
import { createTimeSlotAction, type SettingsActionState } from '../actions'

const idle: SettingsActionState = { status: 'idle' }

export function CreateTimeSlotDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createTimeSlotAction, idle)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuovo turno</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="is_active" value={isActive.toString()} />
          <div className="space-y-1">
            <Label htmlFor="create-slot-label">Nome</Label>
            <Input id="create-slot-label" name="label" required autoFocus placeholder="es. Pranzo" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-slot-time">Orario</Label>
            <Input id="create-slot-time" name="time" type="time" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-slot-covers">Coperti massimi</Label>
            <Input id="create-slot-covers" name="max_covers" type="number" min="1" required />
            <p className="text-xs text-muted-foreground mt-1">
              Coperti totali accettati per questa seduta. Per gestire due sedute a sera
              (es. 19:30 e 21:30), crea due turni separati con il proprio limite ciascuno.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="create-slot-active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="create-slot-active">Visibile sul sito</Label>
          </div>
          {state.status === 'error' && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Annulla
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creazione…' : 'Crea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
