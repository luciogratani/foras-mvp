import type { SiteSettings } from '@repo/supabase'

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const mapsUrl = settings?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
    : null
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <p className="font-semibold">{settings?.title ?? 'Nome del locale'}</p>
          {settings?.address && (
            <p className="text-muted-foreground">
              {mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {settings.address}
                </a>
              ) : (
                settings.address
              )}
            </p>
          )}
        </div>
        <div className="space-y-1">
          {settings?.phone && <p>Tel: <a href={`tel:${settings.phone}`} className="hover:underline">{settings.phone}</a></p>}
          {settings?.email && <p>Email: <a href={`mailto:${settings.email}`} className="hover:underline">{settings.email}</a></p>}
        </div>
        <div className="text-muted-foreground">
          © {new Date().getFullYear()} {settings?.title ?? 'Foras'}
        </div>
      </div>
    </footer>
  )
}
