import type { Metadata } from 'next'
import { createSupabaseClient, getSiteSettings } from '@repo/supabase'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const client = createSupabaseClient()
  const settings = await getSiteSettings(client)

  const title = settings?.title ?? 'Foras'
  const description = settings?.description ?? 'Sito web del locale'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(settings?.og_image ? { images: [{ url: settings.og_image }] } : {}),
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  )
}
