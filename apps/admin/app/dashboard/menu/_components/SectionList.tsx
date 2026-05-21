'use client'
import { useState, useTransition } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Allergen, MenuCategory, MenuItem, MenuSection } from '@repo/supabase'
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
  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id)
      const newIndex = prev.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      startTransition(() => {
        void reorderSectionsAction(reordered.map((s) => s.id))
      })
      return reordered
    })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
