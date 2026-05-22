'use server'
import { revalidatePath } from 'next/cache'
import { requireTenantClient } from '../../../lib/auth'
import {
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  updateSiteSettings,
  addClosedDate,
  removeClosedDate,
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
  } catch (err) {
    const raw = err instanceof Error ? err.message : ''
    if (raw.includes('bookings_time_slot_id_fkey')) {
      return { status: 'error', message: 'Impossibile eliminare: esistono prenotazioni per questo turno.' }
    }
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
    const count = parseInt(formData.get(`${day}_ranges_count`) as string || '0', 10)
    const ranges: { open: string; close: string }[] = []
    if (!closed) {
      for (let i = 0; i < Math.min(count, 2); i++) {
        const open = formData.get(`${day}_range_${i}_open`) as string | null
        const close = formData.get(`${day}_range_${i}_close`) as string | null
        if (open && close) ranges.push({ open, close })
      }
    }
    hours[day] = { closed, ranges }
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

export async function addClosedDateAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const date = formData.get('date') as string
  const reason = (formData.get('reason') as string) || undefined
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { status: 'error', message: 'Data non valida.' }
  }
  try {
    await addClosedDate(tenant, date, reason)
    revalidatePath('/dashboard/orari')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Data già presente o errore di salvataggio.' }
  }
}

export async function removeClosedDateAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  try {
    await removeClosedDate(tenant, id)
    revalidatePath('/dashboard/orari')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Rimozione fallita. Riprova.' }
  }
}
