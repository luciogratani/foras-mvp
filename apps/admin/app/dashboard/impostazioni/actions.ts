'use server'
import { revalidatePath } from 'next/cache'
import { requireTenantClient } from '../../../lib/auth'
import { updateSiteSettings, SiteSettingsUpdateSchema } from '@repo/supabase'

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
