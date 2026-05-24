import Link from 'next/link'
import { CalendarDays, Clock, UtensilsCrossed, Users } from 'lucide-react'
import { requireTenantClient } from '../../lib/auth'
import { getDashboardStats } from '@repo/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { tenant, user } = await requireTenantClient()

  const stats = await getDashboardStats(tenant)

  const today = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold capitalize">{today}</h1>
        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prenotazioni oggi</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.todayConfirmed}</p>
            {stats.todayCancelled > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{stats.todayCancelled} cancellate</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coperti oggi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.todayCovers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prossimi 7 giorni</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.upcomingWeek}</p>
            <p className="text-xs text-muted-foreground mt-1">prenotazioni confermate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Turni attivi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeSlots}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Accesso rapido</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard/prenotazioni"
            className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">Prenotazioni</span>
          </Link>
          <Link
            href="/dashboard/menu"
            className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <UtensilsCrossed className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">Menu</span>
          </Link>
          <Link
            href="/dashboard/orari"
            className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
          >
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">Orari & coperti</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
