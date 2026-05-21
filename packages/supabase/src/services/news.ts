import type { Tables } from '../types/database'
import type { TenantClient } from '../index'
import type { NewsSlideCreate, NewsSlideUpdate } from '../schemas/news'

export type NewsSlide = Tables<{ schema: 'template' }, 'news_slides'>

export async function getNewsSlidesAdmin(client: TenantClient): Promise<NewsSlide[]> {
  const { data, error } = await client
    .from('news_slides')
    .select('*')
    .order('position', { ascending: true, nullsFirst: false })
    .order('title', { ascending: true })
  if (error) throw new Error(`getNewsSlidesAdmin failed: ${error.message}`)
  return data ?? []
}

export async function createNewsSlide(client: TenantClient, input: NewsSlideCreate): Promise<NewsSlide> {
  const { data, error } = await client
    .from('news_slides')
    .insert(input)
    .select('*')
    .single()
  if (error) throw new Error(`createNewsSlide failed: ${error.message}`)
  return data
}

export async function updateNewsSlide(
  client: TenantClient,
  id: string,
  patch: NewsSlideUpdate
): Promise<NewsSlide> {
  const { data, error } = await client
    .from('news_slides')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(`updateNewsSlide failed: ${error.message}`)
  return data
}

export async function deleteNewsSlide(client: TenantClient, id: string): Promise<void> {
  const { error } = await client.from('news_slides').delete().eq('id', id)
  if (error) throw new Error(`deleteNewsSlide failed: ${error.message}`)
}

export async function reorderNewsSlides(client: TenantClient, orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) =>
      client.from('news_slides').update({ position: i }).eq('id', id)
    )
  )
}
