import type { SiteSettings } from '@repo/supabase'

export function Slogan({ settings }: { settings: SiteSettings | null }) {
  if (!settings?.slogan) return null
  return (
    <section className="container mx-auto px-4 py-8">
      <p className="text-xl md:text-2xl text-muted-foreground">{settings.slogan}</p>
    </section>
  )
}
