'use server'
import { revalidatePath } from 'next/cache'
import { requireTenantClient } from '../../../lib/auth'
import {
  updateMenuSection,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuSections,
  reorderMenuCategories,
  reorderMenuItems,
  MenuSectionUpdateSchema,
  MenuCategoryCreateSchema,
  MenuCategoryUpdateSchema,
  MenuItemCreateSchema,
  MenuItemUpdateSchema,
} from '@repo/supabase'

export type MenuActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function updateSectionAction(
  _prevState: MenuActionState,
  formData: FormData
): Promise<MenuActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  const raw: Record<string, unknown> = {}
  const nameVal = formData.get('name')
  if (nameVal !== null && nameVal !== '') raw.name = nameVal
  if (formData.has('is_active')) raw.is_active = formData.get('is_active') === 'true'
  const parsed = MenuSectionUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await updateMenuSection(tenant, id, parsed.data)
    revalidatePath('/dashboard/menu')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Aggiornamento sezione fallito. Riprova.' }
  }
}

export async function createCategoryAction(
  _prevState: MenuActionState,
  formData: FormData
): Promise<MenuActionState> {
  const { tenant } = await requireTenantClient()
  const raw = {
    section_id: formData.get('section_id'),
    name: formData.get('name'),
    is_active: formData.get('is_active') === 'true',
  }
  const parsed = MenuCategoryCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await createMenuCategory(tenant, parsed.data)
    revalidatePath('/dashboard/menu')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Creazione categoria fallita. Riprova.' }
  }
}

export async function updateCategoryAction(
  _prevState: MenuActionState,
  formData: FormData
): Promise<MenuActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  const raw: Record<string, unknown> = {}
  const nameVal = formData.get('name')
  if (nameVal !== null && nameVal !== '') raw.name = nameVal
  if (formData.has('is_active')) raw.is_active = formData.get('is_active') === 'true'
  const parsed = MenuCategoryUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await updateMenuCategory(tenant, id, parsed.data)
    revalidatePath('/dashboard/menu')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Aggiornamento categoria fallito. Riprova.' }
  }
}

export async function deleteCategoryAction(
  _prevState: MenuActionState,
  formData: FormData
): Promise<MenuActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  try {
    await deleteMenuCategory(tenant, id)
    revalidatePath('/dashboard/menu')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Eliminazione categoria fallita. Riprova.' }
  }
}

export async function createItemAction(
  _prevState: MenuActionState,
  formData: FormData
): Promise<MenuActionState> {
  const { tenant } = await requireTenantClient()
  const raw = {
    category_id: formData.get('category_id'),
    name: formData.get('name'),
    price: formData.get('price'),
    description: formData.get('description') || null,
    image_url: formData.get('image_url') || null,
    allergen_ids: formData.getAll('allergen_ids'),
    is_active: formData.get('is_active') === 'true',
  }
  const parsed = MenuItemCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await createMenuItem(tenant, parsed.data)
    revalidatePath('/dashboard/menu')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Creazione item fallita. Riprova.' }
  }
}

export async function updateItemAction(
  _prevState: MenuActionState,
  formData: FormData
): Promise<MenuActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  const raw: Record<string, unknown> = {}
  // The is_active toggle in CategoryRow submits only id + is_active; the full
  // edit dialog always submits `name`, which is what tells the two apart.
  const name = formData.get('name')
  if (name !== null) {
    raw.name = name
    raw.price = formData.get('price')
    raw.description = formData.get('description') || null
    raw.image_url = formData.get('image_url') || null
    raw.allergen_ids = formData.getAll('allergen_ids')
  }
  if (formData.has('is_active')) raw.is_active = formData.get('is_active') === 'true'
  const parsed = MenuItemUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await updateMenuItem(tenant, id, parsed.data)
    revalidatePath('/dashboard/menu')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Aggiornamento item fallito. Riprova.' }
  }
}

export async function deleteItemAction(
  _prevState: MenuActionState,
  formData: FormData
): Promise<MenuActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  try {
    await deleteMenuItem(tenant, id)
    revalidatePath('/dashboard/menu')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Eliminazione item fallita. Riprova.' }
  }
}

export async function reorderSectionsAction(orderedIds: string[]): Promise<void> {
  const { tenant } = await requireTenantClient()
  await reorderMenuSections(tenant, orderedIds)
  revalidatePath('/dashboard/menu')
}

export async function reorderCategoriesAction(orderedIds: string[]): Promise<void> {
  const { tenant } = await requireTenantClient()
  await reorderMenuCategories(tenant, orderedIds)
  revalidatePath('/dashboard/menu')
}

export async function reorderItemsAction(orderedIds: string[]): Promise<void> {
  const { tenant } = await requireTenantClient()
  await reorderMenuItems(tenant, orderedIds)
  revalidatePath('/dashboard/menu')
}
