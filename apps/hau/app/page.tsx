import type { Case, Page, PageHeroBlock, SelectedWorksBlock } from '@/content/types'
import homeData from '@/content/pages/home.json'
import casesData from '@/content/cases.json'
import { Hero } from './_components/Hero'
import { SelectedWorks } from './_components/SelectedWorks'

const home = homeData as Page
const cases = casesData as Case[]

/**
 * Home (`.page_content` è già fornito dal layout). Legge i blocchi ACF da
 * `home.json` — `page_hero` e `selected_works` — e li rende con i componenti
 * dedicati, fedeli al mirror. I `selected_cases` (slug) sono risolti qui
 * contro `cases.json`, preservandone l'ordine e scartando eventuali slug non
 * trovati.
 */
export default function HomePage() {
  const hero = home.blocks.find((b): b is PageHeroBlock => b.acf_fc_layout === 'page_hero')
  const selected = home.blocks.find(
    (b): b is SelectedWorksBlock => b.acf_fc_layout === 'selected_works',
  )

  const bySlug = new Map(cases.map((c) => [c.slug, c]))
  const selectedCases = selected
    ? selected.selected_cases
        .map((slug) => bySlug.get(slug))
        .filter((c): c is Case => c !== undefined)
    : []

  return (
    <>
      {hero && <Hero block={hero} />}
      {selected && <SelectedWorks block={selected} cases={selectedCases} />}
    </>
  )
}
