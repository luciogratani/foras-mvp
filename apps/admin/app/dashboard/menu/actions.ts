'use server'
import { revalidatePath } from 'next/cache'
import { requireTenantClient } from '../../../lib/auth'
import {
  updateMenuSection,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  MenuSectionUpdateSchema,
  MenuCategoryCreateSchema,
  MenuCategoryUpdateSchema,
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
