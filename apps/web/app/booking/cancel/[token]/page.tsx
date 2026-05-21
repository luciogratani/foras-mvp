import { cancelBookingByToken, CancelBookingTokenSchema } from '@repo/supabase'
import { getWebSupabaseAdmin } from '../../../../lib/supabaseAdmin'

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
        <h1>Token non valido.</h1>
        <a href="/">← Torna alla homepage</a>
      </main>
    )
  }

  let cancelled: boolean
  try {
    const result = await cancelBookingByToken(getWebSupabaseAdmin(), parsed.data)
    cancelled = result.cancelled
  } catch {
    return (
      <main>
        <h1>Errore</h1>
        <p>Si è verificato un errore. Riprova più tardi.</p>
        <a href="/">← Torna alla homepage</a>
      </main>
    )
  }

  if (cancelled) {
    return (
      <main>
        <h1>Prenotazione annullata</h1>
        <p>Prenotazione annullata con successo. I coperti sono stati liberati.</p>
        <a href="/">← Torna alla homepage</a>
      </main>
    )
  }

  return (
    <main>
      <h1>Link non valido</h1>
      <p>Link già utilizzato o prenotazione non trovata.</p>
      <a href="/">← Torna alla homepage</a>
    </main>
  )
}
