'use client'
import { useRef, useState } from 'react'
import { useActionState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { NewsSlideAdmin } from '@repo/supabase'
import { Button, Switch } from '@repo/ui'
import { updateSlideAction, type NewsActionState } from '../actions'
import { EditSlideDialog } from './EditSlideDialog'
import { DeleteSlideDialog } from './DeleteSlideDialog'

const idle: NewsActionState = { status: 'idle' }

export function SlideCard({ slide }: { slide: NewsSlideAdmin }) {
  const [, toggleAction, isToggling] = useActionState(updateSlideAction, idle)
  const formRef = useRef<HTMLFormElement>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="shrink-0 cursor-grab text-muted-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
        <div className="min-w-0">
          <span className={`text-sm font-medium ${!slide.is_active ? 'opacity-50' : ''}`}>
            {slide.title}
            {!slide.is_active && (
              <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                inattiva
              </span>
            )}
          </span>
          {slide.body && (
            <p className="max-w-xs truncate text-xs text-muted-foreground">{slide.body}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <form ref={formRef} action={toggleAction}>
          <input type="hidden" name="id" value={slide.id} />
          <input type="hidden" name="is_active" value={(!slide.is_active).toString()} />
          <Switch
            size="sm"
            checked={slide.is_active}
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
        <EditSlideDialog key={`edit-${slide.id}`} slide={slide} onClose={() => setEditOpen(false)} />
      )}
      {deleteOpen && (
        <DeleteSlideDialog
          key={`delete-${slide.id}`}
          slide={slide}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </li>
  )
}
