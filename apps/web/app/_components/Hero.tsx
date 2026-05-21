import type { SiteSettings } from '@repo/supabase'

export function Hero({ settings }: { settings: SiteSettings | null }) {
  const title = settings?.title ?? 'Nome del locale'
  return (
    <section className="relative w-full">
      <div className="aspect-[16/9] w-full bg-muted" aria-hidden="true" />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">{title}</h1>
      </div>
    </section>
  )
}
