'use client'
import { useState, useEffect } from 'react'
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

type DayRange = { open: string; close: string }
type DayState = { closed: boolean; ranges: DayRange[] }

const idle: SettingsActionState = { status: 'idle' }

function initDayState(initialHours: OpeningHours | null, day: Day): DayState {
  const dayData = initialHours?.[day]
  if (!dayData) return { closed: true, ranges: [] }
  return {
    closed: dayData.closed,
    ranges: dayData.ranges ?? [],
  }
}

export function OpeningHoursForm({ initialHours }: { initialHours: OpeningHours | null }) {
  const [state, formAction, isPending] = useActionState(updateOpeningHoursAction, idle)
  const [days, setDays] = useState<Record<Day, DayState>>(() => {
    const init = {} as Record<Day, DayState>
    for (const day of DAYS) {
      init[day] = initDayState(initialHours, day)
    }
    return init
  })

  useEffect(() => {
    const next = {} as Record<Day, DayState>
    for (const day of DAYS) {
      next[day] = initDayState(initialHours, day)
    }
    setDays(next)
  }, [initialHours])

  function toggleClosed(day: Day, value: boolean) {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], closed: value } }))
  }

  function updateRange(day: Day, index: number, field: 'open' | 'close', value: string) {
    setDays((prev) => {
      const ranges = [...prev[day].ranges]
      ranges[index] = { ...ranges[index], [field]: value }
      return { ...prev, [day]: { ...prev[day], ranges } }
    })
  }

  function addRange(day: Day) {
    setDays((prev) => {
      if (prev[day].ranges.length >= 2) return prev
      return { ...prev, [day]: { ...prev[day], ranges: [...prev[day].ranges, { open: '', close: '' }] } }
    })
  }

  function removeRange(day: Day, index: number) {
    setDays((prev) => {
      const ranges = prev[day].ranges.filter((_, i) => i !== index)
      return { ...prev, [day]: { ...prev[day], ranges } }
    })
  }

  return (
    <form action={formAction} className="space-y-6">
      {DAYS.map((day) => {
        const dayState = days[day]
        return (
          <div key={day} className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="w-28 shrink-0 text-sm font-medium">{DAY_LABELS[day]}</span>
              <div className="flex items-center gap-2">
                <input type="hidden" name={`${day}_closed`} value={dayState.closed.toString()} />
                <input type="hidden" name={`${day}_ranges_count`} value={dayState.ranges.length.toString()} />
                <Switch
                  id={`${day}-closed`}
                  checked={dayState.closed}
                  onCheckedChange={(v) => toggleClosed(day, v)}
                />
                <Label htmlFor={`${day}-closed`} className="text-sm text-muted-foreground">
                  Chiuso
                </Label>
              </div>
            </div>

            {!dayState.closed && (
              <div className="ml-32 space-y-2">
                {dayState.ranges.length === 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Nessuna fascia oraria</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addRange(day)}
                    >
                      ＋ Fascia
                    </Button>
                  </div>
                )}

                {dayState.ranges.map((range, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Label className="text-sm">Apertura</Label>
                    <Input
                      name={`${day}_range_${i}_open`}
                      type="time"
                      className="w-32"
                      value={range.open}
                      onChange={(e) => updateRange(day, i, 'open', e.target.value)}
                    />
                    <Label className="text-sm">Chiusura</Label>
                    <Input
                      name={`${day}_range_${i}_close`}
                      type="time"
                      className="w-32"
                      value={range.close}
                      onChange={(e) => updateRange(day, i, 'close', e.target.value)}
                    />
                    {i === 0 && dayState.ranges.length < 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addRange(day)}
                      >
                        ＋ Fascia
                      </Button>
                    )}
                    {i === 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRange(day, i)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
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
