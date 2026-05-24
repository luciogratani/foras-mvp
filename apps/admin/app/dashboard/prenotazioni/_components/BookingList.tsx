import { Fragment } from 'react'
import type { BookingAdmin, TimeSlotAdmin } from '@repo/supabase'
import { DeleteBookingDialog } from './DeleteBookingDialog'

type Props = {
  confirmed: BookingAdmin[]
  cancelled: BookingAdmin[]
  slotLookup: Record<string, string>
  timeSlots: TimeSlotAdmin[]
}

function BookingRow({
  booking,
  slotLookup,
  showAction,
}: {
  booking: BookingAdmin
  slotLookup: Record<string, string>
  showAction: boolean
}) {
  const slotLabel = slotLookup[booking.time_slot_id] ?? booking.time_slot_id
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4 text-sm font-medium">{booking.name}</td>
      <td className="py-3 pr-4 text-sm text-muted-foreground">
        {booking.phone ? (
          <a href={`tel:${booking.phone}`} className="hover:underline">
            {booking.phone}
          </a>
        ) : null}
      </td>
      <td className="py-3 pr-4 text-sm text-center">{booking.covers}</td>
      <td className="py-3 pr-4 text-sm">{booking.date}</td>
      <td className="py-3 pr-4 text-sm">{slotLabel}</td>
      <td className="py-3 pr-4 text-sm text-center">
        {booking.preferred_time ? booking.preferred_time.substring(0, 5) : null}
      </td>
      <td className="py-3 pr-4 text-sm text-muted-foreground">
        {booking.notes ?? null}
      </td>
      <td className="py-3 text-right">
        {showAction && (
          <DeleteBookingDialog
            id={booking.id}
            name={booking.name}
            date={booking.date}
            slotLabel={slotLabel}
          />
        )}
      </td>
    </tr>
  )
}

/** Fix 4: header row that shows slot label + booked/max_covers */
function SlotHeader({
  label,
  bookedCovers,
  maxCovers,
  colSpan,
}: {
  label: string
  bookedCovers: number
  maxCovers: number
  colSpan: number
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="pt-5 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
      >
        {label} — {bookedCovers}/{maxCovers}
      </td>
    </tr>
  )
}

const TABLE_COLS = 8 // Nome · Telefono · Coperti · Data · Turno · Orario pref. · Note · Azioni

function BookingTable({
  bookings,
  slotLookup,
  timeSlots,
  showAction,
  muted,
}: {
  bookings: BookingAdmin[]
  slotLookup: Record<string, string>
  timeSlots: TimeSlotAdmin[]
  showAction: boolean
  muted: boolean
}) {
  // Fix 4: group bookings by time_slot_id, preserving sort order
  const slotIds: string[] = []
  const bySlot = new Map<string, BookingAdmin[]>()
  for (const b of bookings) {
    if (!bySlot.has(b.time_slot_id)) {
      slotIds.push(b.time_slot_id)
      bySlot.set(b.time_slot_id, [])
    }
    bySlot.get(b.time_slot_id)!.push(b)
  }

  // Build a lookup for max_covers
  const slotMaxCovers: Record<string, number> = Object.fromEntries(
    timeSlots.map((s) => [s.id, s.max_covers])
  )

  const hasMultipleSlots = slotIds.length > 1

  return (
    <div className={muted ? 'opacity-60' : undefined}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border text-xs font-medium uppercase text-muted-foreground">
            <th className="pb-2 pr-4">Nome</th>
            <th className="pb-2 pr-4">Telefono</th>
            <th className="pb-2 pr-4 text-center">Coperti</th>
            <th className="pb-2 pr-4">Data</th>
            <th className="pb-2 pr-4">Turno</th>
            <th className="pb-2 pr-4 text-center">Orario pref.</th>
            <th className="pb-2 pr-4">Note</th>
            <th className="pb-2 text-right">{showAction ? 'Azione' : ''}</th>
          </tr>
        </thead>
        <tbody>
          {slotIds.map((slotId) => {
            const rows = bySlot.get(slotId) ?? []
            const bookedCovers = rows
              .filter((b) => b.status === 'confirmed')
              .reduce((sum, b) => sum + b.covers, 0)
            const label = slotLookup[slotId] ?? slotId
            const maxCovers = slotMaxCovers[slotId] ?? 0

            return (
              <Fragment key={slotId}>
                {hasMultipleSlots && (
                  <SlotHeader
                    label={label}
                    bookedCovers={bookedCovers}
                    maxCovers={maxCovers}
                    colSpan={TABLE_COLS}
                  />
                )}
                {rows.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    slotLookup={slotLookup}
                    showAction={showAction}
                  />
                ))}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function BookingList({ confirmed, cancelled, slotLookup, timeSlots }: Props) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-base font-semibold">Prenotazioni confermate</h2>
        {confirmed.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nessuna prenotazione confermata per i filtri selezionati.
          </p>
        ) : (
          <BookingTable
            bookings={confirmed}
            slotLookup={slotLookup}
            timeSlots={timeSlots}
            showAction={true}
            muted={false}
          />
        )}
      </section>

      {cancelled.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-muted-foreground">
            Storico cancellazioni
          </h2>
          <BookingTable
            bookings={cancelled}
            slotLookup={slotLookup}
            timeSlots={timeSlots}
            showAction={false}
            muted={true}
          />
        </section>
      )}
    </div>
  )
}
