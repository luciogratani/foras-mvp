'use client'
import { useState } from 'react'
import { useActionState } from 'react'
import type { OpeningHours } from '@repo/supabase'
import { Button, Input, Label, Switch } from '@repo/ui'
import { updateOpeningHoursAction, type SettingsActionState } from '../actions'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
type Day = (typeof DAYS)[number]

const DAY_LABELS: Record<Day, string> = {
  monday: 'Lunedì',
  tuesday: 'Martedì',
  wednesday: 'Mercoledì',
  thursday: 'Giovedì',
  friday: 'Venerdì',
  saturday: 'Sabato',
  sunday: 'Domenica',
}

const idle: SettingsActionState = { status: 'idle' }

export function OpeningHoursForm({ initialHours }: { initialHours: OpeningHours | null }) {
  const [state, formAction, isPending] = useActionState(updateOpeningHoursAction, idle)
  const [closed, setClosed] = useState<Record<Day, boolean>>(() => {
    const init = {} as Record<Day, boolean>
    for (const day of DAYS) {
      init[day] = initialHours?.[day]?.closed ?? true
    }
    return init
  })

  return (
    <form action={formAction} className="space-y-4">
      {DAYS.map((day) => (
        <div key={day} className="flex items-center gap-4">
          <span className="w-28 shrink-0 text-sm font-medium">{DAY_LABELS[day]}</span>
          <div className="flex items-center gap-2">
            <input type="hidden" name={`${day}_closed`} value={closed[day].toString()} />
            <Switch
              id={`${day}-closed`}
              checked={closed[day]}
              onCheckedChange={(v) => setClosed((prev) => ({ ...prev, [day]: v }))}
            />
            <Label htmlFor={`${day}-closed`} className="text-sm text-muted-foreground">
              Chiuso
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`${day}-open`} className="text-sm">
              Apertura
            </Label>
            <Input
              id={`${day}-open`}
              name={`${day}_open`}
              type="time"
              className="w-32"
              defaultValue={initialHours?.[day]?.open?.substring(0, 5) ?? ''}
              disabled={closed[day]}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`${day}-close`} className="text-sm">
              Chiusura
            </Label>
            <Input
              id={`${day}-close`}
              name={`${day}_close`}
              type="time"
              className="w-32"
              defaultValue={initialHours?.[day]?.close?.substring(0, 5) ?? ''}
              disabled={closed[day]}
            />
          </div>
        </div>
      ))}
      {state.status === 'error' && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === 'success' && (
        <p className="text-sm text-green-600">Orari salvati.</p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvataggio…' : 'Salva orari'}
      </Button>
    </form>
  )
}
