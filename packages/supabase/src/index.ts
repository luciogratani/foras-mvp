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

type SchemaName = Exclude<keyof Database, '__InternalSupabase'>

// supabase-js 2.106 widened SupabaseClient's generics: createClient<DB, Schema>()
// returns SupabaseClient<DB, Schema, Schema>. The schema name must be passed as
// the 3rd arg too, or this alias no longer matches what createClient produces.
export type TenantClient = SupabaseClient<Database, SchemaName, SchemaName>

export { getSiteSettings, getActiveNews } from './services/site'
export type { SiteSettings, NewsSlide } from './services/site'

export { getMenuSections, getMenuBySection, getAllergens } from './services/menu'
export type { MenuSection, MenuCategory, MenuItem, Allergen, MenuCategoryWithItems } from './services/menu'

export {
  getAvailableTimeSlots,
  createBooking,
  cancelBookingByToken,
  OverbookingError,
  DuplicateBookingError,
} from './services/bookings'
export type { TimeSlot, Booking, AvailableTimeSlot } from './services/bookings'

export { CreateBookingInputSchema, CancelBookingTokenSchema } from './schemas/bookings'
export type { CreateBookingInput } from './schemas/bookings'
