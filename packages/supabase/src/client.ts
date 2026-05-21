import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

type SchemaName = Exclude<keyof Database, '__InternalSupabase'>

export function createSupabaseClient(): SupabaseClient<Database, SchemaName, SchemaName> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA

  if (!url || !anonKey || !schema) {
    throw new Error(
      'Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ' +
        'and NEXT_PUBLIC_SUPABASE_SCHEMA (Supabase dashboard → project → Settings → API)'
    )
  }

  return createClient<Database, SchemaName>(url, anonKey, { db: { schema: schema as SchemaName } })
}
