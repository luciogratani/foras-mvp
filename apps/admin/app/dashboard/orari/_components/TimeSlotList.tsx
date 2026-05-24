'use client'
import { useState, useEffect } from 'react'
import type { TimeSlotAdmin, SlotBookingCounts } from '@repo/supabase'
import { TimeSlotCard } from './TimeSlotCard'

const EMPTY_COUNTS: SlotBookingCounts = { total: 0, upcoming: 0 }

export function TimeSlotList({
  slots,
  bookingCounts,
}: {
  slots: TimeSlotAdmin[]
  bookingCounts: Record<string, SlotBookingCounts>
}) {
  const [localSlots, setLocalSlots] = useState(slots)
  const [archivedOpen, setArchivedOpen] = useState(false)

  useEffect(() => {
    setLocalSlots(slots)
  }, [slots])

  const active = localSlots.filter((s) => s.archived_at === null)
  const archived = localSlots.filter((s) => s.archived_at !== null)

  return (
    <div className="space-y-4">
      {active.length === 0 && archived.length === 0 && (
        <p className="text-sm text-muted-foreground">Nessun turno. Aggiungine uno.</p>
      )}
      {active.length === 0 && archived.length > 0 && (
        <p className="text-sm text-muted-foreground">Nessun turno attivo.</p>
      )}
      {active.length > 0 && (
        <ul className="space-y-2">
          {active.map((slot) => (
            <TimeSlotCard key={slot.id} slot={slot} counts={bookingCounts[slot.id] ?? EMPTY_COUNTS} />
          ))}
        </ul>
      )}
      {archived.length > 0 && (
        <div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setArchivedOpen((o) => !o)}
          >
            <span>{archivedOpen ? '▾' : '▸'}</span>
            <span>Turni archiviati ({archived.length})</span>
          </button>
          {archivedOpen && (
            <ul className="mt-2 space-y-2">
              {archived.map((slot) => (
                <TimeSlotCard
                  key={slot.id}
                  slot={slot}
                  counts={bookingCounts[slot.id] ?? EMPTY_COUNTS}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
