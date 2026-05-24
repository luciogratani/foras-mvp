import type { Tables } from '../types/database'
import type { TenantClient } from '../index'
import type {
  MenuSectionUpdate,
  MenuCategoryCreate,
  MenuCategoryUpdate,
  MenuItemCreate,
  MenuItemUpdate,
} from '../schemas/menu'

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

export async function getMenuSectionsAdmin(client: TenantClient): Promise<MenuSection[]> {
  const { data, error } = await client
    .from('menu_sections')
    .select('*')
    .order('position', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
  if (error) throw new Error(`getMenuSectionsAdmin failed: ${error.message}`)
  return data ?? []
}

export async function getMenuCategoriesAdmin(
  client: TenantClient,
  sectionId: string
): Promise<MenuCategory[]> {
  const { data, error } = await client
    .from('menu_categories')
    .select('*')
    .eq('section_id', sectionId)
    .order('position', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
  if (error) throw new Error(`getMenuCategoriesAdmin failed: ${error.message}`)
  return data ?? []
}

export async function updateMenuSection(
  client: TenantClient,
  id: string,
  patch: MenuSectionUpdate
): Promise<MenuSection> {
  const { data, error } = await client
    .from('menu_sections')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(`updateMenuSection failed: ${error.message}`)
  return data
}

export async function createMenuCategory(
  client: TenantClient,
  input: MenuCategoryCreate
): Promise<MenuCategory> {
  const { data, error } = await client
    .from('menu_categories')
    .insert(input)
    .select('*')
    .single()
  if (error) throw new Error(`createMenuCategory failed: ${error.message}`)
  return data
}

export async function updateMenuCategory(
  client: TenantClient,
  id: string,
  patch: MenuCategoryUpdate
): Promise<MenuCategory> {
  const { data, error } = await client
    .from('menu_categories')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(`updateMenuCategory failed: ${error.message}`)
  return data
}

export async function deleteMenuCategory(client: TenantClient, id: string): Promise<void> {
  const { error } = await client.from('menu_categories').delete().eq('id', id)
  if (error) throw new Error(`deleteMenuCategory failed: ${error.message}`)
}

export async function getMenuItemsAdmin(
  client: TenantClient,
  categoryId: string
): Promise<MenuItem[]> {
  const { data, error } = await client
    .from('menu_items')
    .select('*')
    .eq('category_id', categoryId)
    .order('position', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
  if (error) throw new Error(`getMenuItemsAdmin failed: ${error.message}`)
  return data ?? []
}

export async function createMenuItem(
  client: TenantClient,
  input: MenuItemCreate
): Promise<MenuItem> {
  const { data, error } = await client
    .from('menu_items')
    .insert(input)
    .select('*')
    .single()
  if (error) throw new Error(`createMenuItem failed: ${error.message}`)
  return data
}

export async function updateMenuItem(
  client: TenantClient,
  id: string,
  patch: MenuItemUpdate
): Promise<MenuItem> {
  const { data, error } = await client
    .from('menu_items')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(`updateMenuItem failed: ${error.message}`)
  return data
}

export async function deleteMenuItem(client: TenantClient, id: string): Promise<void> {
  const { error } = await client.from('menu_items').delete().eq('id', id)
  if (error) throw new Error(`deleteMenuItem failed: ${error.message}`)
}

export async function reorderMenuSections(client: TenantClient, orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) =>
      client.from('menu_sections').update({ position: i }).eq('id', id)
    )
  )
}

export async function reorderMenuCategories(client: TenantClient, orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) =>
      client.from('menu_categories').update({ position: i }).eq('id', id)
    )
  )
}

export async function reorderMenuItems(client: TenantClient, orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) =>
      client.from('menu_items').update({ position: i }).eq('id', id)
    )
  )
}

export async function moveItemToCategory(
  client: TenantClient,
  itemId: string,
  newCategoryId: string
): Promise<void> {
  // 1. Fetch the current item to get its category_id
  const { data: item, error: itemErr } = await client
    .from('menu_items')
    .select('id, category_id')
    .eq('id', itemId)
    .single()
  if (itemErr) throw new Error(`moveItemToCategory (fetch item) failed: ${itemErr.message}`)

  // 2. Fetch section_id of the source category
  const { data: srcCat, error: srcErr } = await client
    .from('menu_categories')
    .select('id, section_id')
    .eq('id', item.category_id)
    .single()
  if (srcErr) throw new Error(`moveItemToCategory (fetch source category) failed: ${srcErr.message}`)

  // 3. Fetch section_id of the destination category
  const { data: dstCat, error: dstErr } = await client
    .from('menu_categories')
    .select('id, section_id')
    .eq('id', newCategoryId)
    .single()
  if (dstErr) throw new Error(`moveItemToCategory (fetch destination category) failed: ${dstErr.message}`)

  // 4. Guard: only allow moves within the same section
  if (srcCat.section_id !== dstCat.section_id) {
    throw new Error('moveItemToCategory: spostamento consentito solo nella stessa sezione')
  }

  // 5. Compute the next position in the destination category (append to end)
  const { data: dstItems, error: posErr } = await client
    .from('menu_items')
    .select('position')
    .eq('category_id', newCategoryId)
    .order('position', { ascending: false, nullsFirst: false })
    .limit(1)
  if (posErr) throw new Error(`moveItemToCategory (fetch max position) failed: ${posErr.message}`)
  const maxPosition = dstItems && dstItems.length > 0 && dstItems[0].position != null
    ? dstItems[0].position
    : -1
  const newPosition = maxPosition + 1

  // 6. Update the item: new category and new position
  const { error: updateErr } = await client
    .from('menu_items')
    .update({ category_id: newCategoryId, position: newPosition })
    .eq('id', itemId)
  if (updateErr) throw new Error(`moveItemToCategory (update item) failed: ${updateErr.message}`)
}
