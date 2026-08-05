import 'server-only'

export async function notifyBooking(bookingId: string, siteUrl: string): Promise<void> {
  const enabled = process.env.BOOKING_EMAIL_ENABLED === 'true'
  const functionUrl = process.env.SEND_BOOKING_EMAIL_URL
  const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA

  if (!enabled || !functionUrl || !schema) return

  try {
    await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema, bookingId, siteUrl }),
    })
  } catch (err) {
    console.error('[notifyBooking] fetch failed:', err)
  }
}
