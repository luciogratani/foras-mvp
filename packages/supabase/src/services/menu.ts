import type { Tables } from '../types/database'
import type { TenantClient } from '../index'

export type MenuSection = Tables<{ schema: 'template' }, 'menu_sections'>
export type MenuCategory = Tables<{ schema: 'template' }, 'menu_categories'>
export type MenuItem = Tables<{ schema: 'template' }, 'menu_items'>
export type Allergen = Tables<{ schema: 'template' }, 'allergens'>

export type MenuCategoryWithItems = MenuCategory & { items: MenuItem[] }

export async function getMenuSections(client: TenantClient): Promise<MenuSection[]> {
  const { data, error } = await client
    .from('menu_sections')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
  if (error) throw new Error(`getMenuSections failed: ${error.message}`)
  return data ?? []
}

export async function getMenuBySection(
  client: TenantClient,
  sectionId: string
): Promise<MenuCategoryWithItems[]> {
  // PostgREST !inner would exclude categories with no active items — two queries instead.
  const { data: cats, error: catsErr } = await client
    .from('menu_categories')
    .select('*')
    .eq('section_id', sectionId)
    .eq('is_active', true)
    .order('position', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
  if (catsErr) throw new Error(`getMenuBySection (categories) failed: ${catsErr.message}`)
  if (!cats || cats.length === 0) return []

  const categoryIds = cats.map((c) => c.id)
  const { data: items, error: itemsErr } = await client
    .from('menu_items')
    .select('*')
    .in('category_id', categoryIds)
    .eq('is_active', true)
    .order('position', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
  if (itemsErr) throw new Error(`getMenuBySection (items) failed: ${itemsErr.message}`)

  const byCategory = new Map<string, MenuItem[]>()
  for (const item of items ?? []) {
    const list = byCategory.get(item.category_id) ?? []
    list.push(item)
    byCategory.set(item.category_id, list)
  }

  return cats.map((cat) => ({ ...cat, items: byCategory.get(cat.id) ?? [] }))
}

export async function getAllergens(client: TenantClient): Promise<Allergen[]> {
  const { data, error } = await client
    .from('allergens')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw new Error(`getAllergens failed: ${error.message}`)
  return data ?? []
}
