import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'
import type { Database, TenantClient } from '@repo/supabase'
import { getSupabaseAdmin } from './supabaseAdmin'
import { getSupabaseServerClient } from './supabaseServer'

type SchemaName = Exclude<keyof Database, '__InternalSupabase'>

export class TenantVerificationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TenantVerificationError'
  }
}

export async function getVerifiedTenantClient(session: Session): Promise<TenantClient> {
  const schema = session.user.user_metadata?.schema as string | undefined

  if (!schema) {
    await (await getSupabaseServerClient()).auth.signOut()
    throw new TenantVerificationError('Utente non associato a nessuno schema tenant')
  }

  const { data: tenant, error } = await getSupabaseAdmin()
    .from('tenants')
    .select('schema_name')
    .eq('schema_name', schema)
    .eq('owner_id', session.user.id)
    .maybeSingle()

  if (error || !tenant) {
    await (await getSupabaseServerClient()).auth.signOut()
    throw new TenantVerificationError('Schema non autorizzato per questo utente')
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return createClient<Database, SchemaName>(url, anonKey, {
    db: { schema: schema as SchemaName },
    global: {
      headers: { Authorization: `Bearer ${session.access_token}` },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
