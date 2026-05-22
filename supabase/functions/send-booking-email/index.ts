import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const RESEND_FROM = Deno.env.get('RESEND_FROM') ?? ''

// Escape dei campi interpolati nell'HTML delle email. name/notes/email/phone
// arrivano dal form pubblico → senza escape sarebbero un vettore di HTML injection.
function escapeHtml(value: string | null | undefined): string {
  if (value == null) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // No-op se i secret non sono configurati (fase dormiente).
  if (!RESEND_API_KEY || !RESEND_FROM) {
    return new Response(JSON.stringify({ ok: true, sent: false, reason: 'not configured' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { schema?: string; bookingId?: string; siteUrl?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON body' }), { status: 400 })
  }

  const { schema, bookingId, siteUrl } = body
  if (!schema || !bookingId || !siteUrl) {
    return new Response(JSON.stringify({ error: 'schema, bookingId, siteUrl required' }), {
      status: 400,
    })
  }

  // Client service_role su schema public per validazione tenant.
  const publicClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: 'public' },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Valida lo schema contro public.tenants (blocca schemi arbitrari).
  const { data: tenant, error: tenantError } = await publicClient
    .from('tenants')
    .select('schema_name')
    .eq('schema_name', schema)
    .maybeSingle()

  if (tenantError || !tenant) {
    return new Response(JSON.stringify({ error: 'schema not found in public.tenants' }), {
      status: 403,
    })
  }

  // Client service_role sul tenant schema per leggere dati.
  const tenantClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const [bookingRes, settingsRes] = await Promise.all([
    tenantClient
      .from('bookings')
      .select('id, date, name, email, phone, covers, notes, cancellation_token, time_slot_id, status')
      .eq('id', bookingId)
      .maybeSingle(),
    tenantClient.from('site_settings').select('title, email').limit(1).maybeSingle(),
  ])

  if (bookingRes.error || !bookingRes.data) {
    return new Response(JSON.stringify({ error: 'booking not found' }), { status: 404 })
  }
  if (settingsRes.error || !settingsRes.data) {
    return new Response(JSON.stringify({ error: 'site_settings not found' }), { status: 500 })
  }

  // Legge il time_slot per ottenere label e orario.
  const { data: slot } = await tenantClient
    .from('time_slots')
    .select('label, time')
    .eq('id', bookingRes.data.time_slot_id)
    .maybeSingle()

  const booking = bookingRes.data
  const settings = settingsRes.data
  const displayName = settings.title ?? 'Foras'
  const replyTo = settings.email ?? undefined
  const managerEmail = settings.email
  const cancelLink = `${siteUrl}/booking/cancel/${booking.cancellation_token}`

  const slotLabel = slot ? `${escapeHtml(slot.label)} (${slot.time.slice(0, 5)})` : ''
  const displayNameHtml = escapeHtml(displayName)

  const customerSubject = `Prenotazione confermata — ${displayName}`
  const customerHtml = `
    <p>Ciao <strong>${escapeHtml(booking.name)}</strong>,</p>
    <p>La tua prenotazione è confermata:</p>
    <ul>
      <li><strong>Data:</strong> ${booking.date}</li>
      ${slotLabel ? `<li><strong>Turno:</strong> ${slotLabel}</li>` : ''}
      <li><strong>Coperti:</strong> ${booking.covers}</li>
    </ul>
    <p>Per annullare: <a href="${cancelLink}">${cancelLink}</a></p>
    <p>A presto,<br>${displayNameHtml}</p>
  `

  const managerSubject = `Nuova prenotazione — ${booking.name}`
  const managerHtml = `
    <p>Nuova prenotazione ricevuta:</p>
    <ul>
      <li><strong>Nome:</strong> ${escapeHtml(booking.name)}</li>
      <li><strong>Email:</strong> ${escapeHtml(booking.email)}</li>
      ${booking.phone ? `<li><strong>Telefono:</strong> ${escapeHtml(booking.phone)}</li>` : ''}
      <li><strong>Data:</strong> ${booking.date}</li>
      ${slotLabel ? `<li><strong>Turno:</strong> ${slotLabel}</li>` : ''}
      <li><strong>Coperti:</strong> ${booking.covers}</li>
      ${booking.notes ? `<li><strong>Note:</strong> ${escapeHtml(booking.notes)}</li>` : ''}
    </ul>
  `

  const fromField = `"${displayName}" <${RESEND_FROM}>`

  const sends = [
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromField,
        to: [booking.email],
        reply_to: replyTo,
        subject: customerSubject,
        html: customerHtml,
      }),
    }),
  ]

  if (managerEmail) {
    sends.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromField,
          to: [managerEmail],
          subject: managerSubject,
          html: managerHtml,
        }),
      })
    )
  }

  const results = await Promise.allSettled(sends)
  const errors = results
    .filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok))
    .map((r) =>
      r.status === 'rejected' ? String(r.reason) : `HTTP ${(r as PromiseFulfilledResult<Response>).value.status}`
    )

  if (errors.length > 0) {
    console.error('send-booking-email: Resend errors', errors)
    return new Response(JSON.stringify({ ok: false, errors }), { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true, sent: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
