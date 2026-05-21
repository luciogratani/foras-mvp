import { getAvailableTimeSlots } from '@repo/supabase'
import { getWebSupabaseAdmin } from '../../lib/supabaseAdmin'
import { BookingForm } from './_components/BookingForm'

export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: rawDate } = await searchParams
  const today = new Date().toISOString().slice(0, 10)
  const date = rawDate && DATE_RE.test(rawDate) ? rawDate : today

  let slots
  try {
    slots = await getAvailableTimeSlots(getWebSupabaseAdmin(), date)
  } catch {
    return (
      <main>
        <h1>Prenota un tavolo</h1>
        <p>Si è verificato un errore nel caricamento dei turni. Riprova più tardi.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Prenota un tavolo</h1>
      <p>Data selezionata: {date}</p>
      <BookingForm slots={slots} date={date} />
    </main>
  )
}
