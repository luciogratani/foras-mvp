'use server'
import { cancelBookingByToken } from '@repo/supabase'
import { getWebSupabaseAdmin } from '../../../../lib/supabaseAdmin'

export type CancelActionState =
  | { status: 'idle' }
  | { status: 'cancelled' }
  | { status: 'not_found' }
  | { status: 'error' }

export async function confirmCancelAction(
  _prevState: CancelActionState,
  formData: FormData
): Promise<CancelActionState> {
  const token = String(formData.get('token') ?? '')
  try {
    const result = await cancelBookingByToken(getWebSupabaseAdmin(), token)
    return result.cancelled ? { status: 'cancelled' } : { status: 'not_found' }
  } catch {
    return { status: 'error' }
  }
}
