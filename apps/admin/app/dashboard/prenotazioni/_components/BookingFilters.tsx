'use client'
import { useRouter, usePathname } from 'next/navigation'
import { localDateOffset } from '@repo/supabase'

type SlotOption = { id: string; label: string }

type Props = {
  slotOptions: SlotOption[]
  currentDate: string
  currentSlotId: string
}

export function BookingFilters({ slotOptions, currentDate, currentSlotId }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const date = (fd.get('date') as string) ?? ''
    const time_slot_id = (fd.get('time_slot_id') as string) ?? ''
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    if (time_slot_id) params.set('time_slot_id', time_slot_id)
    router.push(`${pathname}?${params.toString()}`)
  }

  function goToDate(date: string) {
    router.push(`${pathname}?date=${date}`)
  }

  const today = localDateOffset(0)
  const tomorrow = localDateOffset(1)

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-xs font-medium text-muted-foreground">
            Data
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={currentDate}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="time_slot_id" className="text-xs font-medium text-muted-foreground">
            Turno
          </label>
          <select
            id="time_slot_id"
            name="time_slot_id"
            defaultValue={currentSlotId}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Tutti i turni</option>
            {slotOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Filtra
        </button>
        {(currentDate || currentSlotId) && (
          <button
            type="button"
            onClick={() => goToDate(today)}
            className="h-9 rounded-md border border-input px-4 text-sm text-muted-foreground hover:bg-muted"
          >
            Rimuovi filtri
          </button>
        )}
      </form>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => goToDate(today)}
          className={`h-9 rounded-md border px-4 text-sm font-medium transition-colors ${
            currentDate === today
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input bg-background text-foreground hover:bg-muted'
          }`}
        >
          Oggi
        </button>
        <button
          type="button"
          onClick={() => goToDate(tomorrow)}
          className={`h-9 rounded-md border px-4 text-sm font-medium transition-colors ${
            currentDate === tomorrow
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input bg-background text-foreground hover:bg-muted'
          }`}
        >
          Domani
        </button>
      </div>
    </div>
  )
}
