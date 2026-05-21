import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

export type SupabaseSsrClient = SupabaseClient

export async function getSupabaseServerClient(): Promise<SupabaseSsrClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // cookies() is read-only in Server Components; writes happen in
          // Route Handlers / Server Actions / the proxy. Safe to ignore here —
          // the proxy refreshes the session and persists cookies on the response.
        }
      },
    },
  })
}
