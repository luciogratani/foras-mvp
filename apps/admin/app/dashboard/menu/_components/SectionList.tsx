'use client'
import { useState, useTransition, useId, useEffect } from 'react'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Allergen, MenuCategory, MenuItem, MenuSection } from '@repo/supabase'
import { toast } from '@repo/ui'
import { reorderSectionsAction } from '../actions'
import { SectionCard } from './SectionCard'

export function SectionList({
  sections: initialSections,
  categoriesBySection,
  itemsByCategory,
  allergens,
}: {
  sections: MenuSection[]
  categoriesBySection: Record<string, MenuCategory[]>
  itemsByCategory: Record<string, MenuItem[]>
  allergens: Allergen[]
}) {
  const [sections, setSections] = useState(initialSections)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setSections(initialSections)
  }, [initialSections])

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const dndId = useId()

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    const previous = sections
    const reordered = arrayMove(sections, oldIndex, newIndex)
    setSections(reordered)
    startTransition(async () => {
      const res = await reorderSectionsAction(reordered.map((s) => s.id))
      if (!res.ok) {
        setSections(previous)
        toast.error('Riordino non salvato. Riprova.')
      } else {
        toast.success('Ordine aggiornato')
      }
    })
  }

  return (
    <DndContext id={dndId} sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              categories={categoriesBySection[section.id] ?? []}
              itemsByCategory={itemsByCategory}
              allergens={allergens}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
