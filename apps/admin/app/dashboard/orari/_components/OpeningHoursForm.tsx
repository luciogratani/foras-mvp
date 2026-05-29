'use client'
import { useEffect, useReducer } from 'react'
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

function initDaysState(initialHours: OpeningHours | null): Record<Day, DayState> {
  const init = {} as Record<Day, DayState>
  for (const day of DAYS) {
    init[day] = initDayState(initialHours, day)
  }
  return init
}

type DaysState = Record<Day, DayState>

type DaysAction =
  | { type: 'reinit'; payload: OpeningHours | null }
  | { type: 'toggleClosed'; day: Day; value: boolean }
  | { type: 'updateRange'; day: Day; index: number; field: 'open' | 'close'; value: string }
  | { type: 'addRange'; day: Day }
  | { type: 'removeRange'; day: Day; index: number }

function daysReducer(state: DaysState, action: DaysAction): DaysState {
  switch (action.type) {
    case 'reinit':
      return initDaysState(action.payload)
    case 'toggleClosed':
      return { ...state, [action.day]: { ...state[action.day], closed: action.value } }
    case 'updateRange': {
      const ranges = [...state[action.day].ranges]
      ranges[action.index] = { ...ranges[action.index], [action.field]: action.value }
      return { ...state, [action.day]: { ...state[action.day], ranges } }
    }
    case 'addRange': {
      if (state[action.day].ranges.length >= 2) return state
      return {
        ...state,
        [action.day]: {
          ...state[action.day],
          ranges: [...state[action.day].ranges, { open: '', close: '' }],
        },
      }
    }
    case 'removeRange': {
      const ranges = state[action.day].ranges.filter((_, i) => i !== action.index)
      return { ...state, [action.day]: { ...state[action.day], ranges } }
    }
  }
}

export function OpeningHoursForm({ initialHours }: { initialHours: OpeningHours | null }) {
  const [state, formAction, isPending] = useActionState(updateOpeningHoursAction, idle)
  const [days, dispatch] = useReducer(daysReducer, initialHours, initDaysState)

  // Re-inizializza lo stato locale quando il Server Component re-flusha dopo un save.
  // dispatch() non è uno setState diretto → la regola react-hooks/set-state-in-effect non scatta.
  useEffect(() => {
    dispatch({ type: 'reinit', payload: initialHours })
  }, [initialHours])

  function toggleClosed(day: Day, value: boolean) {
    dispatch({ type: 'toggleClosed', day, value })
  }

  function updateRange(day: Day, index: number, field: 'open' | 'close', value: string) {
    dispatch({ type: 'updateRange', day, index, field, value })
  }

  function addRange(day: Day) {
    dispatch({ type: 'addRange', day })
  }

  function removeRange(day: Day, index: number) {
    dispatch({ type: 'removeRange', day, index })
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
                  id={`${day}-open`}
                  checked={!dayState.closed}
                  onCheckedChange={(v) => toggleClosed(day, !v)}
                />
                <Label htmlFor={`${day}-open`} className="text-sm text-muted-foreground">
                  {dayState.closed ? 'Chiuso' : 'Aperto'}
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
