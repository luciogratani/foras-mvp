import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database, TenantClient } from '@repo/supabase'

type SchemaName = Exclude<keyof Database, '__InternalSupabase'>

let cached: TenantClient | undefined

export function getWebSupabaseAdmin(): TenantClient {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA

  if (!url || !serviceRoleKey || !schema) {
    throw new Error(
      'Missing env vars for web admin client: NEXT_PUBLIC_SUPABASE_URL, ' +
      'NEXT_PUBLIC_SUPABASE_SCHEMA, SUPABASE_SERVICE_ROLE_KEY (server-only)'
    )
  }

  cached = createClient<Database, SchemaName>(url, serviceRoleKey, {
    db: { schema: schema as SchemaName },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return cached
}
