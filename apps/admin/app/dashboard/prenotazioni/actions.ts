'use server'
import { revalidatePath } from 'next/cache'
import { requireTenantClient } from '../../../lib/auth'
import { cancelBookingAdmin } from '@repo/supabase'

export type BookingActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function cancelBookingAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  if (!id) return { status: 'error', message: 'ID prenotazione mancante.' }
  try {
    await cancelBookingAdmin(tenant, id)
    revalidatePath('/dashboard/prenotazioni')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Cancellazione fallita. Riprova.' }
  }
}
