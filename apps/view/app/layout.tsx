import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSiteSettings } from '@repo/supabase'
import { getWebSupabaseAdmin } from '../lib/supabaseAdmin'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const client = getWebSupabaseAdmin()
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  if (!pathname.startsWith('/maintenance')) {
    const settings = await getSiteSettings(getWebSupabaseAdmin())
    if (settings?.maintenance_mode === true) {
      redirect('/maintenance')
    }
  }

  return (
    <html lang="it">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  )
}
