'use client'
import { useRef, useState, useTransition, useEffect, useId } from 'react'
import { useActionState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronRight, ChevronDown } from 'lucide-react'
import type { Allergen, MenuCategory, MenuItem } from '@repo/supabase'
import { Button, Switch, toast } from '@repo/ui'
import { updateCategoryAction, updateItemAction, reorderItemsAction, type MenuActionState } from '../actions'
import { CreateItemDialog } from './CreateItemDialog'
import { EditItemDialog } from './EditItemDialog'
import { DeleteItemDialog } from './DeleteItemDialog'

const idle: MenuActionState = { status: 'idle' }

export function CategoryRow({
  category,
  items,
  allergens,
  sectionActive,
  onEdit,
  onDelete,
}: {
  category: MenuCategory
  items: MenuItem[]
  allergens: Allergen[]
  sectionActive: boolean
  onEdit: (cat: MenuCategory) => void
  onDelete: (cat: MenuCategory) => void
}) {
  const [open, setOpen] = useState(false)
  const [toggleState, toggleAction, isToggling] = useActionState(updateCategoryAction, idle)
  const formRef = useRef<HTMLFormElement>(null)
  const [createItemOpen, setCreateItemOpen] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null)
  const [localItems, setLocalItems] = useState(items)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  // Toast sul toggle attivo/inattivo categoria — evita il toast al primo render (status 'idle')
  useEffect(() => {
    if (toggleState.status === 'success') {
      toast.success('Modifica salvata')
    } else if (toggleState.status === 'error') {
      toast.error(toggleState.message ?? 'Operazione non riuscita')
    }
  }, [toggleState])

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const itemSensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const itemsDndId = useId()

  function handleItemDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = localItems.findIndex((it) => it.id === active.id)
    const newIndex = localItems.findIndex((it) => it.id === over.id)
    const previous = localItems
    const reordered = arrayMove(localItems, oldIndex, newIndex)
    setLocalItems(reordered)
    startTransition(async () => {
      const res = await reorderItemsAction(reordered.map((it) => it.id))
      if (!res.ok) {
        setLocalItems(previous)
        toast.error('Riordino non salvato. Riprova.')
      } else {
        toast.success('Ordine aggiornato')
      }
    })
  }

  const itemCount = items.length

  return (
    <li ref={setNodeRef} style={style} className="rounded-md border">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          {/* DnD grip — handles drag only, no toggle */}
          <button
            type="button"
            className="cursor-grab text-muted-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          {/* Accordion toggle — distinct from the grip */}
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? `Comprimi categoria ${category.name}` : `Espandi categoria ${category.name}`}
            className="flex items-center gap-1 text-left"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className={`text-sm font-medium ${!category.is_active ? 'opacity-50' : ''}`}>
              {category.name}
              {!category.is_active && (
                <span className="ml-2 text-xs text-muted-foreground">(inattiva)</span>
              )}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              · {itemCount} {itemCount === 1 ? 'voce' : 'voci'}
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <form ref={formRef} action={toggleAction}>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="is_active" value={(!category.is_active).toString()} />
            <Switch
              checked={category.is_active}
              disabled={isToggling}
              onCheckedChange={() => formRef.current?.requestSubmit()}
              aria-label="Visibile sul sito"
              title="Visibile sul sito"
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

      {/* Body — mounted only when expanded */}
      {open && (
        <div className="border-t px-3 py-2">
          {sectionActive && !category.is_active && localItems.length > 0 && (
            <p className="mb-2 text-xs text-muted-foreground">
              Categoria disattivata: le voci qui sotto <strong>non compaiono sul sito</strong>.
            </p>
          )}
          {localItems.length === 0 ? (
            <p className="mb-2 text-sm text-muted-foreground">Nessun item.</p>
          ) : (
            <DndContext id={itemsDndId} sensors={itemSensors} onDragEnd={handleItemDragEnd}>
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
      )}

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
  const [toggleState, toggleAction, isToggling] = useActionState(updateItemAction, idle)
  const formRef = useRef<HTMLFormElement>(null)

  // Toast sul toggle attivo/inattivo voce — evita il toast al primo render (status 'idle')
  useEffect(() => {
    if (toggleState.status === 'success') {
      toast.success('Modifica salvata')
    } else if (toggleState.status === 'error') {
      toast.error(toggleState.message ?? 'Operazione non riuscita')
    }
  }, [toggleState])
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
            aria-label="Visibile sul sito"
            title="Visibile sul sito"
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
