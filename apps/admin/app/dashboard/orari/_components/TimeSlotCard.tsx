'use client'
import { useRef, useState } from 'react'
import { useActionState } from 'react'
import type { TimeSlotAdmin } from '@repo/supabase'
import { Button, Switch } from '@repo/ui'
import { updateTimeSlotAction, type SettingsActionState } from '../actions'
import { EditTimeSlotDialog } from './EditTimeSlotDialog'
import { DeleteTimeSlotDialog } from './DeleteTimeSlotDialog'

const idle: SettingsActionState = { status: 'idle' }

export function TimeSlotCard({ slot }: { slot: TimeSlotAdmin }) {
  const [, toggleAction, isToggling] = useActionState(updateTimeSlotAction, idle)
  const formRef = useRef<HTMLFormElement>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <li className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
      <div className="min-w-0">
        <span className={`text-sm font-medium ${!slot.is_active ? 'opacity-50' : ''}`}>
          {slot.label}
          {!slot.is_active && (
            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
              inattivo
            </span>
          )}
        </span>
        <p className="text-xs text-muted-foreground">
          {slot.time.substring(0, 5)} — {slot.max_covers} coperti
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <form ref={formRef} action={toggleAction}>
          <input type="hidden" name="id" value={slot.id} />
          <input type="hidden" name="is_active" value={(!slot.is_active).toString()} />
          <Switch
            size="sm"
            checked={slot.is_active}
            disabled={isToggling}
            onCheckedChange={() => formRef.current?.requestSubmit()}
          />
        </form>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          Modifica
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
          Elimina
        </Button>
      </div>

      {editOpen && (
        <EditTimeSlotDialog key={`edit-${slot.id}`} slot={slot} onClose={() => setEditOpen(false)} />
      )}
      {deleteOpen && (
        <DeleteTimeSlotDialog
          key={`delete-${slot.id}`}
          slot={slot}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </li>
  )
}
