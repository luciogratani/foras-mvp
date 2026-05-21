'use client'
import { useRef } from 'react'
import { useActionState } from 'react'
import type { MenuCategory } from '@repo/supabase'
import { Button, Switch } from '@repo/ui'
import { updateCategoryAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: MenuCategory
  onEdit: (cat: MenuCategory) => void
  onDelete: (cat: MenuCategory) => void
}) {
  const [, toggleAction, isToggling] = useActionState(updateCategoryAction, idle)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <li className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className={`text-sm ${!category.is_active ? 'opacity-50' : ''}`}>
        {category.name}
        {!category.is_active && (
          <span className="ml-2 text-xs text-muted-foreground">(inattiva)</span>
        )}
      </span>
      <div className="flex items-center gap-2">
        <form ref={formRef} action={toggleAction}>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="is_active" value={(!category.is_active).toString()} />
          <Switch
            checked={category.is_active}
            disabled={isToggling}
            onCheckedChange={() => formRef.current?.requestSubmit()}
          />
        </form>
        <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
          Modifica
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(category)}>
          Elimina
        </Button>
      </div>
    </li>
  )
}
