'use server'
import { revalidatePath } from 'next/cache'
import { requireTenantClient } from '../../../lib/auth'
import {
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  updateSiteSettings,
  TimeSlotCreateSchema,
  TimeSlotUpdateSchema,
  OpeningHoursSchema,
} from '@repo/supabase'

export type SettingsActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function createTimeSlotAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const raw = {
    label: formData.get('label'),
    time: formData.get('time'),
    max_covers: formData.get('max_covers'),
    is_active: formData.get('is_active') === 'true',
  }
  const parsed = TimeSlotCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await createTimeSlot(tenant, parsed.data)
    revalidatePath('/dashboard/orari')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Creazione turno fallita. Riprova.' }
  }
}

export async function updateTimeSlotAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  const raw: Record<string, unknown> = {}
  const label = formData.get('label')
  if (label !== null) {
    raw.label = label
    raw.time = formData.get('time')
    raw.max_covers = formData.get('max_covers')
  }
  if (formData.has('is_active')) raw.is_active = formData.get('is_active') === 'true'
  const parsed = TimeSlotUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await updateTimeSlot(tenant, id, parsed.data)
    revalidatePath('/dashboard/orari')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Aggiornamento turno fallito. Riprova.' }
  }
}

export async function deleteTimeSlotAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  try {
    await deleteTimeSlot(tenant, id)
    revalidatePath('/dashboard/orari')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Eliminazione turno fallita. Riprova.' }
  }
}

export async function updateOpeningHoursAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const hours: Record<string, unknown> = {}
  for (const day of DAYS) {
    const closed = formData.get(`${day}_closed`) === 'true'
    hours[day] = {
      closed,
      open: closed ? null : formData.get(`${day}_open`) || null,
      close: closed ? null : formData.get(`${day}_close`) || null,
    }
  }
  const parsed = OpeningHoursSchema.safeParse(hours)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Dati non validi.' }
  }
  try {
    await updateSiteSettings(tenant, { opening_hours: parsed.data })
    revalidatePath('/dashboard/orari')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Salvataggio orari fallito. Riprova.' }
  }
}
