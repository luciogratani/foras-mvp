'use client'
import { useActionState } from 'react'
import type { ClosedDate } from '@repo/supabase'
import { Button, Input, Label } from '@repo/ui'
import { addClosedDateAction, removeClosedDateAction, type SettingsActionState } from '../actions'

const idle: SettingsActionState = { status: 'idle' }

function formatDateIT(date: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date + 'T12:00:00'))
}

function RemoveClosedDateForm({ id }: { id: string }) {
  const [, formAction, isPending] = useActionState(removeClosedDateAction, idle)
  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? 'Rimozione…' : 'Rimuovi'}
      </Button>
    </form>
  )
}

export function ClosedDatesManager({
  initialClosedDates,
}: {
  initialClosedDates: ClosedDate[]
}) {
  const [addState, addFormAction, addPending] = useActionState(addClosedDateAction, idle)

  return (
    <div className="space-y-6">
      {/* Lista chiusure esistenti */}
      {initialClosedDates.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessuna chiusura straordinaria impostata.</p>
      ) : (
        <ul className="space-y-2">
          {initialClosedDates.map((cd) => (
            <li key={cd.id} className="flex items-center justify-between gap-4 border-b border-border py-2">
              <div>
                <span className="text-sm font-medium">{formatDateIT(cd.date)}</span>
                {cd.reason && (
                  <span className="ml-2 text-sm text-muted-foreground">— {cd.reason}</span>
                )}
              </div>
              <RemoveClosedDateForm id={cd.id} />
            </li>
          ))}
        </ul>
      )}

      {/* Form aggiunta */}
      <form action={addFormAction} className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="closed-date">Data</Label>
            <Input id="closed-date" name="date" type="date" required className="w-44" />
          </div>
          <div className="space-y-1 flex-1 min-w-48">
            <Label htmlFor="closed-reason">Motivo (opzionale)</Label>
            <Input
              id="closed-reason"
              name="reason"
              type="text"
              maxLength={100}
              placeholder="es. Ferie estive"
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={addPending}>
            {addPending ? 'Aggiunta…' : 'Aggiungi'}
          </Button>
        </div>
        {addState.status === 'error' && (
          <p className="text-sm text-destructive">{addState.message}</p>
        )}
        {addState.status === 'success' && (
          <p className="text-sm text-green-600">Chiusura aggiunta.</p>
        )}
      </form>
    </div>
  )
}
