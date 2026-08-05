import { createSupabaseClient } from '@repo/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, supabase: 'reachable' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
