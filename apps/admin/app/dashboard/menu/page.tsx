import { requireTenantClient } from '../../../lib/auth'
import {
  getMenuSectionsAdmin,
  getMenuCategoriesAdmin,
  getMenuItemsAdmin,
  getAllergens,
} from '@repo/supabase'
import type { MenuItem } from '@repo/supabase'
import { SectionList } from './_components/SectionList'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
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
      <h1 className="mb-6 text-2xl font-semibold">Menu</h1>
      <SectionList
        sections={sections}
        categoriesBySection={Object.fromEntries(sections.map((s, i) => [s.id, categoriesBySection[i] ?? []]))}
        itemsByCategory={itemsByCategory}
        allergens={allergens}
      />
    </div>
  )
}
