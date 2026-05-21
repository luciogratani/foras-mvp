import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '../../lib/supabaseServer'
import { getVerifiedTenantClient, TenantVerificationError } from '../../lib/auth'

async function logout() {
  'use server'
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/?reason=unauthenticated')

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/?reason=unauthenticated')

  let schemaName: string
  try {
    const tenant = await getVerifiedTenantClient(user, session.access_token)
    const probe = await tenant.from('menu_sections').select('id').limit(1).maybeSingle()
    schemaName = probe.error
      ? '(query failed — RLS or empty schema)'
      : (user.user_metadata?.schema as string)
  } catch (err) {
    if (err instanceof TenantVerificationError) {
      redirect('/?reason=tenant-mismatch')
    }
    throw err
  }

  return (
    <main>
      <h1>Foras — dashboard</h1>
      <p>Verified tenant schema: <code>{schemaName}</code></p>
      <p>Utente: {user.email ?? user.id}</p>
      <form action={logout}>
        <button type="submit">Esci</button>
      </form>
    </main>
  )
}
