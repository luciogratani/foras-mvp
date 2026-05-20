import type { Tables } from '../types/database'
import type { TenantClient } from '../index'

export type SiteSettings = Tables<{ schema: 'template' }, 'site_settings'>
export type NewsSlide = Tables<{ schema: 'template' }, 'news_slides'>

export async function getSiteSettings(client: TenantClient): Promise<SiteSettings | null> {
  const { data, error } = await client.from('site_settings').select('*').limit(1).maybeSingle()
  if (error) throw new Error(`getSiteSettings failed: ${error.message}`)
  return data
}

export async function getActiveNews(client: TenantClient): Promise<NewsSlide[]> {
  const { data, error } = await client
    .from('news_slides')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true, nullsFirst: false })
    .order('title', { ascending: true })
  if (error) throw new Error(`getActiveNews failed: ${error.message}`)
  return data ?? []
}
