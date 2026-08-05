import Image from 'next/image'
import type { NewsSlide } from '@repo/supabase'

export function NewsSection({ news }: { news: NewsSlide[] }) {
  if (news.length === 0) return null
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Novità</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {news.map((slide) => (
          <article key={slide.id} className="flex flex-col gap-3">
            {slide.image_url && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            )}
            <h3 className="text-lg font-semibold">{slide.title}</h3>
            {slide.body && <p className="text-sm text-muted-foreground">{slide.body}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}
