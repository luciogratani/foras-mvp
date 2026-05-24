import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '../../lib/supabaseServer'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@repo/ui'
import { AppSidebar } from './_components/AppSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/?reason=unauthenticated')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  return (
    <SidebarProvider>
      <AppSidebar email={user.email} siteUrl={siteUrl} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
