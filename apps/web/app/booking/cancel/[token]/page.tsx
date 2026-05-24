import { getBookingByToken, CancelBookingTokenSchema } from '@repo/supabase'
import { getWebSupabaseAdmin } from '../../../../lib/supabaseAdmin'
import { CancelConfirm } from './_components/CancelConfirm'

export const dynamic = 'force-dynamic'

export default async function CancelBookingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const parsed = CancelBookingTokenSchema.safeParse(token)
  if (!parsed.success) {
    return (
      <main>
        <h1>Link non valido</h1>
        <p>Questo link di annullamento non è valido.</p>
        <a href="/">← Torna alla homepage</a>
      </main>
    )
  }

  let booking
  try {
    booking = await getBookingByToken(getWebSupabaseAdmin(), parsed.data)
  } catch {
    return (
      <main>
        <h1>Errore</h1>
        <p>Si è verificato un errore. Riprova più tardi.</p>
        <a href="/">← Torna alla homepage</a>
      </main>
    )
  }

  if (!booking) {
    return (
      <main>
        <h1>Prenotazione non trovata</h1>
        <p>Nessuna prenotazione corrisponde a questo link.</p>
        <a href="/">← Torna alla homepage</a>
      </main>
    )
  }

  if (booking.status !== 'confirmed') {
    return (
      <main>
        <h1>Prenotazione già annullata</h1>
        <p>Questa prenotazione risulta già annullata.</p>
        <a href="/">← Torna alla homepage</a>
      </main>
    )
  }

  const dateLabel = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${booking.date}T00:00:00`))

  return (
    <main>
      <h1>Annulla prenotazione</h1>
      <CancelConfirm
        token={parsed.data}
        name={booking.name}
        dateLabel={dateLabel}
        slotLabel={booking.slot_label}
        slotTime={booking.slot_time}
        covers={booking.covers}
      />
    </main>
  )
}
