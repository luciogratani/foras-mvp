'use client'
import { useState, useRef, useTransition, useEffect, useId } from 'react'
import { useActionState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronRight, ChevronDown } from 'lucide-react'
import type { Allergen, MenuSection, MenuCategory, MenuItem } from '@repo/supabase'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Switch,
} from '@repo/ui'
import { updateSectionAction, reorderCategoriesAction, type MenuActionState } from '../actions'
import { CategoryRow } from './CategoryRow'
import { RenameSectionDialog } from './RenameSectionDialog'
import { CreateCategoryDialog } from './CreateCategoryDialog'
import { EditCategoryDialog } from './EditCategoryDialog'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'

const idle: MenuActionState = { status: 'idle' }

export function SectionCard({
  section,
  categories,
  itemsByCategory,
  allergens,
}: {
  section: MenuSection
  categories: MenuCategory[]
  itemsByCategory: Record<string, MenuItem[]>
  allergens: Allergen[]
}) {
  const [open, setOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<MenuCategory | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<MenuCategory | null>(null)
  const [cats, setCats] = useState(categories)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setCats(categories)
  }, [categories])

  const [, toggleAction, isToggling] = useActionState(updateSectionAction, idle)
  const sectionFormRef = useRef<HTMLFormElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const sensors = useSensors(useSensor(PointerSensor))
  const catsDndId = useId()

  // Total item count across all categories of this section (active + inactive)
  const totalItems = categories.reduce(
    (sum, cat) => sum + (itemsByCategory[cat.id]?.length ?? 0),
    0,
  )

  function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = cats.findIndex((c) => c.id === active.id)
    const newIndex = cats.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(cats, oldIndex, newIndex)
    setCats(reordered)
    startTransition(() => {
      void reorderCategoriesAction(reordered.map((c) => c.id))
    })
  }

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card className={!section.is_active ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
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
                  aria-label={open ? `Comprimi sezione ${section.name}` : `Espandi sezione ${section.name}`}
                  className="flex items-center gap-1 text-left"
                  onClick={() => setOpen((v) => !v)}
                >
                  {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="flex items-center gap-2 text-base font-semibold">
                    {section.name}
                    {!section.is_active && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                        Inattiva
                      </span>
                    )}
                    <span className="text-xs font-normal text-muted-foreground">
                      {totalItems} {totalItems === 1 ? 'voce' : 'voci'}
                    </span>
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <form ref={sectionFormRef} action={toggleAction}>
                  <input type="hidden" name="id" value={section.id} />
                  <input type="hidden" name="is_active" value={(!section.is_active).toString()} />
                  <Switch
                    checked={section.is_active}
                    disabled={isToggling}
                    onCheckedChange={() => sectionFormRef.current?.requestSubmit()}
                    aria-label="Visibile sul sito"
                    title="Visibile sul sito"
                  />
                </form>
                <Button variant="outline" size="sm" onClick={() => setRenameOpen(true)}>
                  Rinomina
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Banner "sezione disattivata" always visible even when collapsed,
              so the user knows why the section appears greyed out at a glance. */}
          {!section.is_active && (
            <div className="px-6 pb-2">
              <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                Sezione disattivata: categorie e voci qui dentro <strong>non compaiono sul sito</strong>,
                anche se risultano attive.
              </p>
            </div>
          )}

          {/* Body — mounted only when expanded */}
          {open && (
            <CardContent>
              {cats.length === 0 ? (
                <p className="mb-3 text-sm text-muted-foreground">
                  Nessuna categoria. Aggiungine una.
                </p>
              ) : (
                <DndContext id={catsDndId} sensors={sensors} onDragEnd={handleCategoryDragEnd}>
                  <SortableContext items={cats.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <ul className="mb-3 space-y-3">
                      {cats.map((cat) => (
                        <CategoryRow
                          key={cat.id}
                          category={cat}
                          items={itemsByCategory[cat.id] ?? []}
                          allergens={allergens}
                          sectionActive={section.is_active}
                          onEdit={setEditCategory}
                          onDelete={setDeleteCategory}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                + Aggiungi categoria
              </Button>
            </CardContent>
          )}
        </Card>
      </div>

      {renameOpen && (
        <RenameSectionDialog
          key={`rename-${section.id}`}
          section={section}
          onClose={() => setRenameOpen(false)}
        />
      )}
      {createOpen && (
        <CreateCategoryDialog
          key={`create-${section.id}`}
          sectionId={section.id}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editCategory && (
        <EditCategoryDialog
          key={editCategory.id}
          category={editCategory}
          onClose={() => setEditCategory(null)}
        />
      )}
      {deleteCategory && (
        <DeleteCategoryDialog
          key={`delete-${deleteCategory.id}`}
          category={deleteCategory}
          onClose={() => setDeleteCategory(null)}
        />
      )}
    </>
  )
}
