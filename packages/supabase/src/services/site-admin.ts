import type { Tables, TablesUpdate } from '../types/database'
import type { TenantClient } from '../index'
import type { SiteSettings } from './site'
import type { TimeSlotCreate, TimeSlotUpdate, SiteSettingsUpdate } from '../schemas/settings'

export type TimeSlotAdmin = Tables<{ schema: 'template' }, 'time_slots'>

export async function getTimeSlotsAdmin(client: TenantClient): Promise<TimeSlotAdmin[]> {
  const { data, error } = await client
    .from('time_slots')
    .select('*')
    .order('time', { ascending: true })
  if (error) throw new Error(`getTimeSlotsAdmin failed: ${error.message}`)
  return data ?? []
}

export async function createTimeSlot(client: TenantClient, input: TimeSlotCreate): Promise<TimeSlotAdmin> {
  const { data, error } = await client
    .from('time_slots')
    .insert(input)
    .select('*')
    .single()
  if (error) throw new Error(`createTimeSlot failed: ${error.message}`)
  return data
}

export async function updateTimeSlot(
  client: TenantClient,
  id: string,
  patch: TimeSlotUpdate
): Promise<TimeSlotAdmin> {
  const { data, error } = await client
    .from('time_slots')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(`updateTimeSlot failed: ${error.message}`)
  return data
}

export async function deleteTimeSlot(client: TenantClient, id: string): Promise<void> {
  const { error } = await client.from('time_slots').delete().eq('id', id)
  if (error) throw new Error(`deleteTimeSlot failed: ${error.message}`)
}

export async function updateSiteSettings(
  client: TenantClient,
  patch: SiteSettingsUpdate
): Promise<SiteSettings> {
  const { data, error } = await client
    .from('site_settings')
    .update(patch as unknown as TablesUpdate<{ schema: 'template' }, 'site_settings'>)
    .not('id', 'is', null)
    .select('*')
    .single()
  if (error) throw new Error(`updateSiteSettings failed: ${error.message}`)
  return data
}

export type ClosedDate = Tables<{ schema: 'template' }, 'closed_dates'>

export async function getClosedDates(client: TenantClient): Promise<ClosedDate[]> {
  const { data, error } = await client
    .from('closed_dates')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw new Error(`getClosedDates failed: ${error.message}`)
  return data ?? []
}

export async function addClosedDate(
  client: TenantClient,
  date: string,
  reason?: string,
  end_date?: string
): Promise<ClosedDate> {
  const { data, error } = await client
    .from('closed_dates')
    .insert({ date, reason: reason ?? null, end_date: end_date ?? null })
    .select('*')
    .single()
  if (error) throw new Error(`addClosedDate failed: ${error.message}`)
  return data
}

export async function removeClosedDate(client: TenantClient, id: string): Promise<void> {
  const { error } = await client.from('closed_dates').delete().eq('id', id)
  if (error) throw new Error(`removeClosedDate failed: ${error.message}`)
}
