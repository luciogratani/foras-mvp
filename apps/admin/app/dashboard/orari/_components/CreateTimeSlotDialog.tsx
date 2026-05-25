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

// Suggerisce una fine = inizio + 2h (clampata a 23:59), così il campo time
// non viene mai mostrato vuoto (evita il rendering "fantasma" del browser).
function suggestEndTime(start: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(start)
  if (!m) return ''
  const total = Math.min(Number(m[1]) * 60 + Number(m[2]) + 120, 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function CreateTimeSlotDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createTimeSlotAction, idle)
  const [isActive, setIsActive] = useState(true)
  const [time, setTime] = useState('')
  const [endTime, setEndTime] = useState('')

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
            <Input
              id="create-slot-time"
              name="time"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.currentTarget.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-slot-end-time">Fine turno (facoltativo)</Label>
            {endTime ? (
              <div className="flex items-center gap-2">
                <Input
                  id="create-slot-end-time"
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
                disabled={!time}
                onClick={() => setEndTime(suggestEndTime(time))}
              >
                + Aggiungi fine turno
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {endTime
                ? 'I clienti scelgono l’orario di arrivo tra l’inizio e questa fine.'
                : time
                  ? 'Orario fisso: i clienti prenotano all’orario d’inizio. Aggiungi una fine per dare una finestra in cui scelgono l’arrivo.'
                  : 'Imposta prima l’orario d’inizio per poter aggiungere una fine.'}
            </p>
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
