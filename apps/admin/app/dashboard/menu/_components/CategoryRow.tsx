'use client'
import { useRef, useState, useTransition } from 'react'
import { useActionState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { Allergen, MenuCategory, MenuItem } from '@repo/supabase'
import { Button, Switch } from '@repo/ui'
import { updateCategoryAction, updateItemAction, reorderItemsAction, type MenuActionState } from '../actions'
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
  const [localItems, setLocalItems] = useState(items)
  const [, startTransition] = useTransition()

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const itemSensors = useSensors(useSensor(PointerSensor))

  function handleItemDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setLocalItems((prev) => {
      const oldIndex = prev.findIndex((it) => it.id === active.id)
      const newIndex = prev.findIndex((it) => it.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      startTransition(() => {
        void reorderItemsAction(reordered.map((it) => it.id))
      })
      return reordered
    })
  }

  return (
    <li ref={setNodeRef} style={style} className="rounded-md border">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab text-muted-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <span className={`text-sm font-medium ${!category.is_active ? 'opacity-50' : ''}`}>
            {category.name}
            {!category.is_active && (
              <span className="ml-2 text-xs text-muted-foreground">(inattiva)</span>
            )}
          </span>
        </div>
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
        {localItems.length === 0 ? (
          <p className="mb-2 text-sm text-muted-foreground">Nessun item.</p>
        ) : (
          <DndContext sensors={itemSensors} onDragEnd={handleItemDragEnd}>
            <SortableContext items={localItems.map((it) => it.id)} strategy={verticalListSortingStrategy}>
              <ul className="mb-2 space-y-1">
                {localItems.map((item) => (
                  <ItemRow key={item.id} item={item} onEdit={setEditItem} onDelete={setDeleteItem} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 rounded border px-2 py-1.5"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <span className={`text-sm ${!item.is_active ? 'opacity-50' : ''}`}>
          {item.name}
          <span className="ml-2 text-muted-foreground">€{Number(item.price).toFixed(2)}</span>
          {!item.is_active && (
            <span className="ml-2 text-xs text-muted-foreground">(inattivo)</span>
          )}
        </span>
      </div>
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
