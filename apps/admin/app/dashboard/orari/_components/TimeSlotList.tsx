'use client'
import { useState, useEffect } from 'react'
import type { TimeSlotAdmin } from '@repo/supabase'
import { TimeSlotCard } from './TimeSlotCard'

export function TimeSlotList({ slots }: { slots: TimeSlotAdmin[] }) {
  const [localSlots, setLocalSlots] = useState(slots)

  useEffect(() => {
    setLocalSlots(slots)
  }, [slots])

  if (localSlots.length === 0) {
    return <p className="text-sm text-muted-foreground">Nessun turno. Aggiungine uno.</p>
  }

  return (
    <ul className="space-y-2">
      {localSlots.map((slot) => (
        <TimeSlotCard key={slot.id} slot={slot} />
      ))}
    </ul>
  )
}
