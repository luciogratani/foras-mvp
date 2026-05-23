import { requireTenantClient } from '../../../lib/auth'
import { getBookingsAdmin, getTimeSlotsAdmin } from '@repo/supabase'
import type { BookingAdmin } from '@repo/supabase'
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

  // Fix 2: default to today if no date filter is provided
  const today = new Date().toISOString().slice(0, 10)
  const effectiveDate = params.date ?? today

  const [bookings, timeSlots] = await Promise.all([
    getBookingsAdmin(tenant, { date: effectiveDate, time_slot_id: params.time_slot_id }),
    getTimeSlotsAdmin(tenant),
  ])

  // Fix 1: build lookup maps for sorting
  const slotLookup: Record<string, string> = Object.fromEntries(
    timeSlots.map((s) => [s.id, s.label])
  )
  // slotId → time string (e.g. "12:30") for chronological sort
  const slotTimeLookup: Record<string, string> = Object.fromEntries(
    timeSlots.map((s) => [s.id, s.time])
  )

  // Fix 1: sort helper — date asc, slot time asc, name asc
  function sortBookings(arr: BookingAdmin[]): BookingAdmin[] {
    return [...arr].sort((a, b) => {
      if (a.date < b.date) return -1
      if (a.date > b.date) return 1
      const timeA = slotTimeLookup[a.time_slot_id] ?? ''
      const timeB = slotTimeLookup[b.time_slot_id] ?? ''
      if (timeA < timeB) return -1
      if (timeA > timeB) return 1
      return a.name.localeCompare(b.name)
    })
  }

  const confirmed = sortBookings(bookings.filter((b) => b.status === 'confirmed'))
  const cancelled = sortBookings(bookings.filter((b) => b.status === 'cancelled'))

  const slotOptions = timeSlots.map((s) => ({ id: s.id, label: s.label }))

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Prenotazioni</h1>
      <BookingFilters
        slotOptions={slotOptions}
        currentDate={effectiveDate}
        currentSlotId={params.time_slot_id ?? ''}
      />
      <BookingList
        confirmed={confirmed}
        cancelled={cancelled}
        slotLookup={slotLookup}
        timeSlots={timeSlots}
      />
    </div>
  )
}
