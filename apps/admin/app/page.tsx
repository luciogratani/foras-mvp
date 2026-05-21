import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '../lib/supabaseServer'
import LoginForm from './_components/login-form'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </main>
  )
}
