import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

export { createSupabaseClient } from './client'
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from './types/database'
export { Constants } from './types/database'
export type { SupabaseClient } from '@supabase/supabase-js'

export type TenantClient = SupabaseClient<Database, Exclude<keyof Database, '__InternalSupabase'>>

export { getSiteSettings, getActiveNews } from './services/site'
export type { SiteSettings, NewsSlide } from './services/site'

export { getMenuSections, getMenuBySection, getAllergens } from './services/menu'
export type { MenuSection, MenuCategory, MenuItem, Allergen, MenuCategoryWithItems } from './services/menu'
