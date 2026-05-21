'use server'
import { revalidatePath } from 'next/cache'
import { requireTenantClient } from '../../../lib/auth'
import {
  createNewsSlide,
  updateNewsSlide,
  deleteNewsSlide,
  reorderNewsSlides,
  NewsSlideCreateSchema,
  NewsSlideUpdateSchema,
} from '@repo/supabase'

export type NewsActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function createSlideAction(
  _prevState: NewsActionState,
  formData: FormData
): Promise<NewsActionState> {
  const { tenant } = await requireTenantClient()
  const raw = {
    title: formData.get('title'),
    body: formData.get('body') || null,
    image_url: formData.get('image_url') || null,
    is_active: formData.get('is_active') === 'true',
  }
  const parsed = NewsSlideCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await createNewsSlide(tenant, parsed.data)
    revalidatePath('/dashboard/news')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Creazione novità fallita. Riprova.' }
  }
}

export async function updateSlideAction(
  _prevState: NewsActionState,
  formData: FormData
): Promise<NewsActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  const raw: Record<string, unknown> = {}
  const title = formData.get('title')
  if (title !== null) {
    raw.title = title
    raw.body = formData.get('body') || null
    raw.image_url = formData.get('image_url') || null
  }
  if (formData.has('is_active')) raw.is_active = formData.get('is_active') === 'true'
  const parsed = NewsSlideUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await updateNewsSlide(tenant, id, parsed.data)
    revalidatePath('/dashboard/news')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Aggiornamento novità fallito. Riprova.' }
  }
}

export async function deleteSlideAction(
  _prevState: NewsActionState,
  formData: FormData
): Promise<NewsActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  try {
    await deleteNewsSlide(tenant, id)
    revalidatePath('/dashboard/news')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Eliminazione novità fallita. Riprova.' }
  }
}

export async function reorderSlidesAction(orderedIds: string[]): Promise<void> {
  const { tenant } = await requireTenantClient()
  await reorderNewsSlides(tenant, orderedIds)
  revalidatePath('/dashboard/news')
}
