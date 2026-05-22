import { requireTenantClient } from '../../../lib/auth'
import { getBookingsAdmin, getTimeSlotsAdmin } from '@repo/supabase'
import { BookingFilters } from './_components/BookingFilters'
import { BookingList } from './_components/BookingList'

export const dynamic = 'force-dynamic'

export default async function PrenotazioniPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; time_slot_id?: string }>
}) {
  const params = await searchParams
  const { tenant } = await requireTenantClient()

  const [bookings, timeSlots] = await Promise.all([
    getBookingsAdmin(tenant, { date: params.date, time_slot_id: params.time_slot_id }),
    getTimeSlotsAdmin(tenant),
  ])

  const slotLookup: Record<string, string> = Object.fromEntries(
    timeSlots.map((s) => [s.id, s.label])
  )

  const confirmed = bookings.filter((b) => b.status === 'confirmed')
  const cancelled = bookings.filter((b) => b.status === 'cancelled')

  const slotOptions = timeSlots.map((s) => ({ id: s.id, label: s.label }))

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Prenotazioni</h1>
      <BookingFilters
        slotOptions={slotOptions}
        currentDate={params.date ?? ''}
        currentSlotId={params.time_slot_id ?? ''}
      />
      <BookingList confirmed={confirmed} cancelled={cancelled} slotLookup={slotLookup} />
    </div>
  )
}
