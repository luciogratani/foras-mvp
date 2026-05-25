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

// Suggerisce una fine = inizio + 2h (clampata a 23:59), così il campo time
// non viene mai mostrato vuoto (evita il rendering "fantasma" del browser).
function suggestEndTime(start: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(start)
  if (!m) return ''
  const total = Math.min(Number(m[1]) * 60 + Number(m[2]) + 120, 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function EditTimeSlotDialog({
  slot,
  onClose,
}: {
  slot: TimeSlotAdmin
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(updateTimeSlotAction, idle)
  const [isActive, setIsActive] = useState(slot.is_active)
  const [endTime, setEndTime] = useState(slot.end_time?.substring(0, 5) ?? '')

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
            <Label htmlFor="edit-slot-end-time">Fine turno (facoltativo)</Label>
            {endTime ? (
              <div className="flex items-center gap-2">
                <Input
                  id="edit-slot-end-time"
                  name="end_time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.currentTarget.value)}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => setEndTime('')}>
                  Rimuovi
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEndTime(suggestEndTime(slot.time.substring(0, 5)))}
              >
                + Aggiungi fine turno
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {endTime
                ? 'I clienti scelgono l’orario di arrivo tra l’inizio e questa fine.'
                : 'Orario fisso: i clienti prenotano all’orario d’inizio. Aggiungi una fine per dare una finestra in cui scelgono l’arrivo.'}
            </p>
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
