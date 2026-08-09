import 'server-only'
import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabaseServerClient } from './supabaseServer'

/**
 * L'utente collegato, chiesto **una volta sola per richiesta**.
 *
 * `auth.getUser()` non legge il JWT dal cookie: interroga il server di
 * autenticazione, ed è il motivo per cui i metadati che restituisce sono
 * freschi. Ma è anche il motivo per cui chiamarlo tre volte nello stesso
 * rendering costa tre giri di rete.
 *
 * Succedeva: il layout lo chiedeva per l'email, `getAbbonamento()` per sapere
 * di che tenant si trattava, e il middleware per conto suo. `cache()` di React
 * fa collassare i primi due in uno — il terzo sta in un processo diverso e non
 * si può accorpare.
 *
 * Su un gestionale interamente `force-dynamic`, dove ogni navigazione è un
 * render lato server, un giro di rete in meno per pagina non è una micro
 * ottimizzazione.
 */
export const getUtenteCorrente = cache(async (): Promise<User | null> => {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
