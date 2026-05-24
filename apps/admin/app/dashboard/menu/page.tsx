import { requireTenantClient } from '../../../lib/auth'
import {
  getMenuSectionsAdmin,
  getMenuCategoriesAdmin,
  getMenuItemsAdmin,
  getAllergens,
} from '@repo/supabase'
import type { MenuItem } from '@repo/supabase'
import { SectionList } from './_components/SectionList'
import { ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const { tenant } = await requireTenantClient()
  const sections = await getMenuSectionsAdmin(tenant)
  const categoriesBySection = await Promise.all(
    sections.map((s) => getMenuCategoriesAdmin(tenant, s.id))
  )
  const allCategories = categoriesBySection.flat()
  const [itemsLists, allergens] = await Promise.all([
    Promise.all(allCategories.map((c) => getMenuItemsAdmin(tenant, c.id))),
    getAllergens(tenant),
  ])
  const itemsByCategory: Record<string, MenuItem[]> = {}
  allCategories.forEach((c, i) => {
    itemsByCategory[c.id] = itemsLists[i] ?? []
  })

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Menu</h1>
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
          >
            <ExternalLink size={14} />
            Vedi sul sito
          </a>
        )}
      </div>
      <SectionList
        sections={sections}
        categoriesBySection={Object.fromEntries(sections.map((s, i) => [s.id, categoriesBySection[i] ?? []]))}
        itemsByCategory={itemsByCategory}
        allergens={allergens}
      />
    </div>
  )
}
