import {
  createSupabaseClient,
  getSiteSettings,
  getActiveNews,
  getMenuSections,
  getMenuBySection,
  getAllergens,
} from '@repo/supabase'
import type { MenuCategoryWithItems, MenuSection } from '@repo/supabase'
import { Hero } from './_components/Hero'
import { Slogan } from './_components/Slogan'
import { Bio } from './_components/Bio'
import { OpeningHours } from './_components/OpeningHours'
import { NewsSection } from './_components/NewsSection'
import { Footer } from './_components/Footer'
import { MenuClient } from './_components/MenuClient'
import { NewsPopup } from './_components/NewsPopup'
import { Gallery } from './_components/Gallery'

// SSR per-request: senza questa direttiva Next prerenderizza la home come
// statica e congela i dati di site_settings/news_slides al build. I contenuti
// sono gestiti dal backoffice e devono essere visibili senza rebuild.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const client = createSupabaseClient()
  const [settings, news, sections, allergens] = await Promise.all([
    getSiteSettings(client),
    getActiveNews(client),
    getMenuSections(client),
    getAllergens(client),
  ])

  const categoriesBySection: Record<string, MenuCategoryWithItems[]> = {}
  await Promise.all(
    sections.map(async (s: MenuSection) => {
      categoriesBySection[s.id] = await getMenuBySection(client, s.id)
    })
  )

  return (
    <main className="min-h-screen flex flex-col">
      <Hero settings={settings} />
      <Slogan settings={settings} />
      <Bio settings={settings} />
      <MenuClient sections={sections} categoriesBySection={categoriesBySection} allergens={allergens} />
      <Gallery />
      <OpeningHours settings={settings} />
      <NewsSection news={news} />
      <NewsPopup news={news} />
      <Footer settings={settings} />
    </main>
  )
}
