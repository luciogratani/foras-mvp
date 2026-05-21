'use client'
import { useState, useTransition, useId, useEffect } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { NewsSlideAdmin } from '@repo/supabase'
import { reorderSlidesAction } from '../actions'
import { SlideCard } from './SlideCard'

export function SlideList({ slides: initialSlides }: { slides: NewsSlideAdmin[] }) {
  const [slides, setSlides] = useState(initialSlides)
  const [, startTransition] = useTransition()
  const dndId = useId()

  useEffect(() => {
    setSlides(initialSlides)
  }, [initialSlides])

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = slides.findIndex((s) => s.id === active.id)
    const newIndex = slides.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(slides, oldIndex, newIndex)
    setSlides(reordered)
    startTransition(() => {
      void reorderSlidesAction(reordered.map((s) => s.id))
    })
  }

  if (slides.length === 0) {
    return <p className="text-sm text-muted-foreground">Nessuna novità. Aggiungine una.</p>
  }

  return (
    <DndContext id={dndId} sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {slides.map((slide) => (
            <SlideCard key={slide.id} slide={slide} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
