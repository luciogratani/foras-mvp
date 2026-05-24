'use client'
import { useRef, useState, useTransition } from 'react'
import { useActionState } from 'react'
import type { TimeSlotAdmin, SlotBookingCounts } from '@repo/supabase'
import { Button, Switch, toast } from '@repo/ui'
import { updateTimeSlotAction, setTimeSlotArchivedAction, type SettingsActionState } from '../actions'
import { EditTimeSlotDialog } from './EditTimeSlotDialog'
import { DeleteTimeSlotDialog } from './DeleteTimeSlotDialog'

const idle: SettingsActionState = { status: 'idle' }

export function TimeSlotCard({
  slot,
  counts,
}: {
  slot: TimeSlotAdmin
  counts: SlotBookingCounts
}) {
  const [, toggleAction, isToggling] = useActionState(updateTimeSlotAction, idle)
  const formRef = useRef<HTMLFormElement>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [archivePending, startArchiveTransition] = useTransition()

  function handleArchive(archived: boolean) {
    const fd = new FormData()
    fd.set('id', slot.id)
    fd.set('archived', archived.toString())
    startArchiveTransition(async () => {
      const res = await setTimeSlotArchivedAction({ status: 'idle' }, fd)
      if (res.status === 'success') {
        toast.success(archived ? 'Turno archiviato' : 'Turno ripristinato', {
          description: slot.label,
          duration: 4000,
        })
      } else if (res.status === 'error') {
        toast.error(res.message)
      }
    })
  }

  if (slot.archived_at !== null) {
    return (
      <li className="flex items-center justify-between gap-2 rounded-md border border-dashed px-3 py-2 opacity-60">
        <div className="min-w-0">
          <span className="text-sm font-medium">
            {slot.label}
            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
              archiviato
            </span>
          </span>
          <p className="text-xs text-muted-foreground">
            {slot.time.substring(0, 5)} — {slot.max_covers} coperti
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={archivePending}
            onClick={() => handleArchive(false)}
          >
            {archivePending ? 'Ripristino…' : 'Ripristina'}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            Elimina
          </Button>
        </div>

        {deleteOpen && (
          <DeleteTimeSlotDialog
            key={`delete-${slot.id}`}
            slot={slot}
            counts={counts}
            onClose={() => setDeleteOpen(false)}
          />
        )}
      </li>
    )
  }

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
          {counts.upcoming > 0 && (
            <span className="ml-2 text-foreground">
              · {counts.upcoming} prenotazion{counts.upcoming === 1 ? 'e' : 'i'} in arrivo
            </span>
          )}
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
            aria-label="Visibile sul sito"
            title="Visibile sul sito"
          />
        </form>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          Modifica
        </Button>
        {counts.total === 0 ? (
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            Elimina
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={archivePending}
            onClick={() => handleArchive(true)}
          >
            {archivePending ? 'Archiviazione…' : 'Archivia'}
          </Button>
        )}
      </div>

      {editOpen && (
        <EditTimeSlotDialog key={`edit-${slot.id}`} slot={slot} onClose={() => setEditOpen(false)} />
      )}
      {deleteOpen && (
        <DeleteTimeSlotDialog
          key={`delete-${slot.id}`}
          slot={slot}
          counts={counts}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </li>
  )
}
