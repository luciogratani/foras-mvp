import { requireTenantClient } from '../../../lib/auth'
import { getSiteSettings, getTimeSlotsAdmin } from '@repo/supabase'
import type { OpeningHours } from '@repo/supabase'
import { OpeningHoursForm } from './_components/OpeningHoursForm'
import { TimeSlotList } from './_components/TimeSlotList'
import { CreateTimeSlotButton } from './_components/CreateTimeSlotButton'

export const dynamic = 'force-dynamic'

export default async function OrariPage() {
  const { tenant } = await requireTenantClient()
  const [settings, slots] = await Promise.all([
    getSiteSettings(tenant),
    getTimeSlotsAdmin(tenant),
  ])

  return (
    <div className="space-y-10 p-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Orari di apertura</h1>
        <OpeningHoursForm initialHours={(settings?.opening_hours as OpeningHours | null) ?? null} />
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Turni prenotazione</h2>
          <CreateTimeSlotButton />
        </div>
        <TimeSlotList slots={slots} />
      </section>
    </div>
  )
}
