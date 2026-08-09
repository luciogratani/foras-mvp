import 'server-only'
import { getSupabaseAdmin } from '../supabaseAdmin'
import type { ClaimAbbonamento } from './stato'
import { leggiAbbonamento } from './deposito'

/**
 * Copia lo stato dell'abbonamento nei metadati dell'utente owner.
 *
 * ## Perché esiste un secondo posto in cui vive lo stesso dato
 *
 * Il blocco vero sta in `proxy.ts`, che gira su **ogni** richiesta protetta.
 * Il middleware non può usare `getSupabaseAdmin()` — service_role nel bordo
 * non ci va, e comunque una query al database per ogni navigazione è un costo
 * che non si nota finché non è troppo tardi.
 *
 * `proxy.ts` però chiama già `supabase.auth.getUser()`, che interroga il
 * server di autenticazione e torna con `app_metadata` **aggiornato** — non con
 * quello congelato dentro il JWT. Mettere lì una parola sola significa avere
 * il gate senza un solo giro in più.
 *
 * ## Cosa succede se le due copie divergono
 *
 * `public.tenant_subscriptions` resta la fonte di verità: è quella che disegna
 * la pagina Account e che decide cosa vede il gestore. Il claim è solo una
 * scorciatoia per il middleware. Se il claim è vecchio, al massimo una
 * navigazione passa quando non doveva — e la pagina che si apre legge lo stato
 * vero e mostra il popup di blocco.
 *
 * L'errore nell'aggiornare il claim quindi **non** fa fallire il webhook: la
 * scrittura importante è già andata a buon fine.
 */
export async function aggiornaClaimAbbonamento(schema: string): Promise<void> {
  try {
    const admin = getSupabaseAdmin()

    const { data: tenant, error: erroreTenant } = await admin
      .from('tenants')
      .select('owner_id')
      .eq('schema_name', schema)
      .maybeSingle()

    if (erroreTenant || !tenant) {
      console.warn(`[billing] nessun owner per lo schema ${schema}: claim non aggiornato`)
      return
    }

    const riga = await leggiAbbonamento(schema)

    // Si copiano le DATE, non lo stato. Vedi `ClaimAbbonamento` in stato.ts:
    // uno stato calcolato oggi resterebbe «in ritardo» anche il quarto giorno,
    // perché fra il primo e il terzo non arriva nessun evento a riscriverlo.
    const claim: ClaimAbbonamento = {
      configurato: riga !== null,
      ritardoDal: riga?.ritardo_dal ?? null,
      disdettoIl: riga?.disdetto_il ?? null,
    }

    const { error } = await admin.auth.admin.updateUserById(tenant.owner_id, {
      app_metadata: { foras_billing: claim },
    })

    if (error) {
      console.error('[billing] aggiornamento claim fallito:', error.message)
    }
  } catch (err) {
    // Deliberatamente inghiottito: vedi il commento in testa al file. La
    // fonte di verità è già scritta, e un claim mancato costa una navigazione.
    console.error('[billing] aggiornamento claim fallito:', err)
  }
}
