import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseServerClient } from '../../lib/supabaseServer'

const navLinks = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Menu', href: '/dashboard/menu' },
  { label: 'Novità', href: '/dashboard/news' },
  { label: 'Orari & coperti', href: '/dashboard/orari' },
  { label: 'Impostazioni', href: '/dashboard/impostazioni' },
  { label: 'Prenotazioni', href: '/dashboard/prenotazioni' },
]

async function logout() {
  'use server'
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/?reason=unauthenticated')

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-muted/40 flex flex-col">
        <div className="px-4 py-6">
          <p className="text-sm font-semibold text-foreground mb-6">Foras Admin</p>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto px-4 py-4 border-t border-border">
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors text-left"
            >
              Esci
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
