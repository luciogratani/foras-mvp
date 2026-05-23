'use server'
import { revalidatePath } from 'next/cache'
import { requireTenantClient } from '../../../lib/auth'
import { updateSiteSettings, SiteSettingsUpdateSchema } from '@repo/supabase'
import type { Json } from '@repo/supabase'

export type SettingsActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function updateSiteSettingsAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const raw = {
    title: formData.get('title') || undefined,
    description: formData.get('description') || undefined,
    og_image: formData.get('og_image') || null,
    slogan: formData.get('slogan') || null,
    bio: formData.get('bio') || null,
    address: formData.get('address') || null,
    phone: formData.get('phone') || null,
    email: formData.get('email') || null,
    social_whatsapp: formData.get('social_whatsapp') || null,
    social_instagram: formData.get('social_instagram') || null,
    social_facebook: formData.get('social_facebook') || null,
  }
  const parsed = SiteSettingsUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await updateSiteSettings(tenant, parsed.data)
    revalidatePath('/dashboard/impostazioni')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Salvataggio impostazioni fallito. Riprova.' }
  }
}

export async function updateExtraDataAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const raw = formData.get('extra_data') as string
  let parsed: Json
  try {
    parsed = JSON.parse(raw) as Json
  } catch {
    return { status: 'error', message: 'JSON non valido. Correggi prima di salvare.' }
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { status: 'error', message: 'Il valore deve essere un oggetto JSON ({…}).' }
  }
  try {
    await updateSiteSettings(tenant, { extra_data: parsed })
    revalidatePath('/dashboard/impostazioni')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Salvataggio dati avanzati fallito. Riprova.' }
  }
}

export async function updateMaintenanceModeAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const maintenance_mode = formData.get('maintenance_mode') === 'true'
  try {
    await updateSiteSettings(tenant, { maintenance_mode })
    revalidatePath('/dashboard/impostazioni')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Salvataggio modalità manutenzione fallito. Riprova.' }
  }
}
