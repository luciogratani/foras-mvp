import { createSupabaseClient, getSiteSettings, getActiveNews } from '@repo/supabase'
import { Hero } from './_components/Hero'
import { Slogan } from './_components/Slogan'
import { Bio } from './_components/Bio'
import { OpeningHours } from './_components/OpeningHours'
import { NewsSection } from './_components/NewsSection'
import { Footer } from './_components/Footer'

// SSR per-request: senza questa direttiva Next prerenderizza la home come
// statica e congela i dati di site_settings/news_slides al build. I contenuti
// sono gestiti dal backoffice e devono essere visibili senza rebuild.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const client = createSupabaseClient()
  const [settings, news] = await Promise.all([
    getSiteSettings(client),
    getActiveNews(client),
  ])

  return (
    <main className="min-h-screen flex flex-col">
      <Hero settings={settings} />
      <Slogan settings={settings} />
      <Bio settings={settings} />
      <OpeningHours settings={settings} />
      <NewsSection news={news} />
      <Footer settings={settings} />
    </main>
  )
}
