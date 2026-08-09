import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { ROTTA_ACCOUNT, rottaConsentita } from './lib/billing/rotte'
import { COOKIE_SCENARIO, scenarioAbilitato } from './lib/billing/cookie'
import { statoDaClaim } from './lib/billing/stato'

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
        res = NextResponse.next({ request: req })
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/', req.url)
    loginUrl.searchParams.set('reason', 'unauthenticated')
    return NextResponse.redirect(loginUrl)
  }

  if (abbonamentoSospeso(req, user) && !rottaConsentita(req.nextUrl.pathname)) {
    const accountUrl = new URL(ROTTA_ACCOUNT, req.url)
    accountUrl.searchParams.set('reason', 'abbonamento-sospeso')
    return NextResponse.redirect(accountUrl)
  }

  return res
}

/**
 * **Il blocco vero.** La sidebar spenta è cortesia verso il gestore: chi
 * scrive l'indirizzo a mano la scavalca in un secondo. Qui no.
 *
 * Lo stato arriva da `user.app_metadata.foras_billing`, che il webhook
 * aggiorna a ogni evento. Non costa niente: `getUser()` qui sopra è già stato
 * chiamato, e interroga il server di autenticazione — quindi torna con i
 * metadati **freschi**, non con quelli congelati dentro il JWT del cookie.
 *
 * Il claim contiene le date, non lo stato: il calcolo dei tre giorni lo fa
 * `statoDaClaim`, la stessa funzione pura che lavora sui dati del database.
 * È così che le due strade non possono divergere.
 */
function abbonamentoSospeso(req: NextRequest, user: User): boolean {
  // `scenarioAbilitato()` sta in `cookie.ts`, che il middleware può caricare —
  // a differenza di `sorgente.ts`, che è `server-only`. Prima la condizione era
  // riscritta a mano qui: due copie della stessa regola sono due posti da cui
  // il blocco può valere in uno e non nell'altro.
  if (scenarioAbilitato()) {
    const scenario = req.cookies.get(COOKIE_SCENARIO)?.value
    // Lo scenario finto vince su tutto, incluso «attivo»: serve a poter
    // sbloccare un blocco vero mentre si lavora, non solo a simularlo.
    if (scenario) return scenario === 'sospeso'
  }

  return statoDaClaim(user.app_metadata?.foras_billing) === 'sospeso'
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
