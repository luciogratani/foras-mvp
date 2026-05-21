'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui'
import type { NewsSlide } from '@repo/supabase'

const STORAGE_KEY = 'foras_news_popup_shown'

export function NewsPopup({ news }: { news: NewsSlide[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (news.length === 0) return
    if (typeof window === 'undefined') return
    if (window.sessionStorage.getItem(STORAGE_KEY)) return
    setOpen(true)
  }, [news.length])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next && typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, '1')
    }
  }

  if (news.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novità</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {news.map((slide) => (
            <article key={slide.id} className="space-y-3">
              {slide.image_url && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={slide.image_url}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold">{slide.title}</h3>
              {slide.body && <p className="text-sm text-muted-foreground">{slide.body}</p>}
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
