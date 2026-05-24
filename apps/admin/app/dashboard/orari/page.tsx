import { requireTenantClient } from '../../../lib/auth'
import { getSiteSettings, getTimeSlotsAdmin, getClosedDates, getBookingCountsBySlot } from '@repo/supabase'
import type { OpeningHours } from '@repo/supabase'
import { OpeningHoursForm } from './_components/OpeningHoursForm'
import { TimeSlotList } from './_components/TimeSlotList'
import { CreateTimeSlotButton } from './_components/CreateTimeSlotButton'
import { ClosedDatesManager } from './_components/ClosedDatesManager'

export const dynamic = 'force-dynamic'

export default async function OrariPage() {
  const { tenant } = await requireTenantClient()
  const [settings, slots, closedDates, bookingCounts] = await Promise.all([
    getSiteSettings(tenant),
    getTimeSlotsAdmin(tenant),
    getClosedDates(tenant),
    getBookingCountsBySlot(tenant),
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
        <TimeSlotList slots={slots} bookingCounts={bookingCounts} />
      </section>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Chiusure straordinarie</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Giorni in cui il locale è chiuso (ferie, festività, serate private). Le prenotazioni per queste date vengono bloccate automaticamente.
          </p>
        </div>
        <ClosedDatesManager initialClosedDates={closedDates} />
      </section>
    </div>
  )
}
