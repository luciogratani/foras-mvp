import type { SiteSettings } from '@repo/supabase'

export function Bio({ settings }: { settings: SiteSettings | null }) {
  if (!settings?.bio) return null
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Chi siamo</h2>
      <p className="text-base leading-relaxed whitespace-pre-line">{settings.bio}</p>
    </section>
  )
}
