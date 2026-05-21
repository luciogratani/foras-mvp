import { requireTenantClient } from '../../../lib/auth'
import { getMenuSectionsAdmin, getMenuCategoriesAdmin } from '@repo/supabase'
import { SectionCard } from './_components/SectionCard'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const { tenant } = await requireTenantClient()
  const sections = await getMenuSectionsAdmin(tenant)
  const categoriesBySection = await Promise.all(
    sections.map((s) => getMenuCategoriesAdmin(tenant, s.id))
  )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Menu</h1>
      <div className="space-y-4">
        {sections.map((section, i) => (
          <SectionCard
            key={section.id}
            section={section}
            categories={categoriesBySection[i] ?? []}
          />
        ))}
      </div>
    </div>
  )
}
