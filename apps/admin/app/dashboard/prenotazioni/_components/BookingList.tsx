import type { BookingAdmin } from '@repo/supabase'
import { DeleteBookingDialog } from './DeleteBookingDialog'

type Props = {
  confirmed: BookingAdmin[]
  cancelled: BookingAdmin[]
  slotLookup: Record<string, string>
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
      <td className="py-3 pr-4 text-sm text-muted-foreground">{booking.email}</td>
      <td className="py-3 pr-4 text-sm text-center">{booking.covers}</td>
      <td className="py-3 pr-4 text-sm">{booking.date}</td>
      <td className="py-3 pr-4 text-sm">{slotLabel}</td>
      <td className="py-3 pr-4 text-sm text-center">
        {booking.preferred_time ? booking.preferred_time.substring(0, 5) : '—'}
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

function BookingTable({
  bookings,
  slotLookup,
  showAction,
  muted,
}: {
  bookings: BookingAdmin[]
  slotLookup: Record<string, string>
  showAction: boolean
  muted: boolean
}) {
  return (
    <div className={muted ? 'opacity-60' : undefined}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border text-xs font-medium uppercase text-muted-foreground">
            <th className="pb-2 pr-4">Nome</th>
            <th className="pb-2 pr-4">Email</th>
            <th className="pb-2 pr-4 text-center">Coperti</th>
            <th className="pb-2 pr-4">Data</th>
            <th className="pb-2 pr-4">Turno</th>
            <th className="pb-2 pr-4 text-center">Orario pref.</th>
            <th className="pb-2 text-right">{showAction ? 'Azione' : ''}</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} slotLookup={slotLookup} showAction={showAction} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function BookingList({ confirmed, cancelled, slotLookup }: Props) {
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
            showAction={false}
            muted={true}
          />
        </section>
      )}
    </div>
  )
}
