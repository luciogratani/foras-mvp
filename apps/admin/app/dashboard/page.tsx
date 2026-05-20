import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '../../lib/supabaseServer'
import { getVerifiedTenantClient, TenantVerificationError } from '../../lib/auth'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/?reason=unauthenticated')
  }

  let schemaName: string
  try {
    const tenant = await getVerifiedTenantClient(session)
    schemaName = (await tenant.from('menu_sections').select('id').limit(1).maybeSingle()).error
      ? '(query failed — RLS or empty schema)'
      : (session.user.user_metadata?.schema as string)
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
      <p>Utente: {session.user.email ?? session.user.id}</p>
    </main>
  )
}
