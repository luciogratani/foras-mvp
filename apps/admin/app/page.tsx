import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '../lib/supabaseServer'
import LoginForm from './_components/login-form'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main>
      <h1>Foras — admin login</h1>
      <LoginForm />
    </main>
  )
}
