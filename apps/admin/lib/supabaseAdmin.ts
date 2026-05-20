import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type AdminDatabase = {
  public: {
    Tables: {
      tenants: {
        Row: {
          schema_name: string
          owner_id: string
          created_at: string
        }
        Insert: {
          schema_name: string
          owner_id: string
          created_at?: string
        }
        Update: {
          schema_name?: string
          owner_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type SupabaseAdminClient = SupabaseClient<AdminDatabase, 'public'>

let cached: SupabaseAdminClient | undefined

export function getSupabaseAdmin(): SupabaseAdminClient {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin env vars: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
        '(Supabase dashboard → project → Settings → API → service_role). ' +
        'SUPABASE_SERVICE_ROLE_KEY must be server-only — never NEXT_PUBLIC_, never in the client bundle.'
    )
  }

  cached = createClient<AdminDatabase, 'public'>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: { schema: 'public' },
  })

  return cached
}
