'use client'
import { useRef, useState } from 'react'
import { useActionState } from 'react'
import type { Allergen, MenuCategory, MenuItem } from '@repo/supabase'
import { Button, Switch } from '@repo/ui'
import { updateCategoryAction, updateItemAction, type MenuActionState } from '../actions'
import { CreateItemDialog } from './CreateItemDialog'
import { EditItemDialog } from './EditItemDialog'
import { DeleteItemDialog } from './DeleteItemDialog'

const idle: MenuActionState = { status: 'idle' }

export function CategoryRow({
  category,
  items,
  allergens,
  onEdit,
  onDelete,
}: {
  category: MenuCategory
  items: MenuItem[]
  allergens: Allergen[]
  onEdit: (cat: MenuCategory) => void
  onDelete: (cat: MenuCategory) => void
}) {
  const [, toggleAction, isToggling] = useActionState(updateCategoryAction, idle)
  const formRef = useRef<HTMLFormElement>(null)
  const [createItemOpen, setCreateItemOpen] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null)

  return (
    <li className="rounded-md border">
      <div className="flex items-center justify-between px-3 py-2">
        <span className={`text-sm font-medium ${!category.is_active ? 'opacity-50' : ''}`}>
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
      </div>

      <div className="border-t px-3 py-2">
        {items.length === 0 ? (
          <p className="mb-2 text-sm text-muted-foreground">Nessun item.</p>
        ) : (
          <ul className="mb-2 space-y-1">
            {items.map((item) => (
              <ItemRow key={item.id} item={item} onEdit={setEditItem} onDelete={setDeleteItem} />
            ))}
          </ul>
        )}
        <Button variant="outline" size="sm" onClick={() => setCreateItemOpen(true)}>
          + Aggiungi item
        </Button>
      </div>

      {createItemOpen && (
        <CreateItemDialog
          key={`create-item-${category.id}`}
          categoryId={category.id}
          allergens={allergens}
          onClose={() => setCreateItemOpen(false)}
        />
      )}
      {editItem && (
        <EditItemDialog
          key={editItem.id}
          item={editItem}
          allergens={allergens}
          onClose={() => setEditItem(null)}
        />
      )}
      {deleteItem && (
        <DeleteItemDialog
          key={`delete-item-${deleteItem.id}`}
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
        />
      )}
    </li>
  )
}

function ItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
}) {
  const [, toggleAction, isToggling] = useActionState(updateItemAction, idle)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <li className="flex items-center justify-between gap-2 rounded border px-2 py-1.5">
      <span className={`text-sm ${!item.is_active ? 'opacity-50' : ''}`}>
        {item.name}
        <span className="ml-2 text-muted-foreground">€{Number(item.price).toFixed(2)}</span>
        {!item.is_active && (
          <span className="ml-2 text-xs text-muted-foreground">(inattivo)</span>
        )}
      </span>
      <div className="flex items-center gap-2">
        <form ref={formRef} action={toggleAction}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="is_active" value={(!item.is_active).toString()} />
          <Switch
            size="sm"
            checked={item.is_active}
            disabled={isToggling}
            onCheckedChange={() => formRef.current?.requestSubmit()}
          />
        </form>
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
          Modifica
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
          Elimina
        </Button>
      </div>
    </li>
  )
}
