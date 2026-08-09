import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '../supabaseAdmin'
import type {
  DatiFatturazione,
  MetodoPagamento,
  RecordAbbonamento,
} from './stato'

/**
 * L'accesso a `public.tenant_subscriptions`. Sempre e solo con service_role:
 * la tabella ha RLS attiva e zero policy, quindi da qualunque altro ruolo
 * risulta semplicemente vuota.
 */

/** La riga come sta sul database — `snake_case`, come la scrive la migrazione 005. */
export type RigaAbbonamento = {
  schema_name: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  prezzo_mensile_centesimi: number
  valuta: string
  prossimo_pagamento: string | null
  ritardo_dal: string | null
  disdetto_il: string | null
  stripe_status: string | null
  metodo_pagamento: MetodoPagamento | null
  dati_fatturazione: DatiFatturazione | null
  updated_at: string
  created_at: string
}

type DepositoDatabase = {
  public: {
    Tables: {
      tenant_subscriptions: {
        Row: RigaAbbonamento
        Insert: Partial<RigaAbbonamento> & { schema_name: string }
        Update: Partial<RigaAbbonamento>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/**
 * `getSupabaseAdmin()` è tipizzato sul solo `public.tenants`, e sta in
 * `lib/supabaseAdmin.ts`, che è un file condiviso col template: la regola del
 * fork dice di non toccarlo.
 *
 * Il cast è quindi deliberato e circoscritto a questa funzione — è l'unico
 * punto del gestionale in cui il compilatore accetta una promessa che non può
 * verificare. Quando questo lavoro andrà nel template, `tenant_subscriptions`
 * entrerà in `AdminDatabase` e questa funzione diventerà una riga sola.
 */
function db(): SupabaseClient<DepositoDatabase, 'public'> {
  return getSupabaseAdmin() as unknown as SupabaseClient<DepositoDatabase, 'public'>
}

/** Da riga di database a record di dominio. L'unico punto di traduzione. */
export function daRiga(riga: RigaAbbonamento): RecordAbbonamento {
  return {
    // La riga esiste: da qui in poi il blocco è possibile.
    configurato: true,
    stripeCustomerId: riga.stripe_customer_id,
    prezzoMensileCentesimi: riga.prezzo_mensile_centesimi,
    prossimoPagamento: riga.prossimo_pagamento,
    ritardoDal: riga.ritardo_dal,
    disdettoIl: riga.disdetto_il,
    metodoPagamento: riga.metodo_pagamento,
    datiFatturazione: riga.dati_fatturazione,
    // Le fatture non stanno in tabella: si leggono da Stripe quando servono.
    fatture: [],
  }
}

/**
 * La riga del tenant, o `null` se non ne ha una.
 *
 * `null` significa **«non ancora configurato»**, non «non ha pagato». È la
 * distinzione che tiene i clienti dentro il loro gestionale: oggi nessuno ha una
 * riga, e nessuno deve risultare bloccato per questo.
 */
export async function leggiAbbonamento(schema: string): Promise<RigaAbbonamento | null> {
  const { data, error } = await db()
    .from('tenant_subscriptions')
    .select('*')
    .eq('schema_name', schema)
    .maybeSingle()

  if (error) {
    // Un errore di lettura non deve bloccare nessuno: si sbaglia dalla parte
    // del cliente. Ma va gridato nei log, perché altrimenti un abbonamento
    // scaduto e una tabella irraggiungibile si assomigliano troppo.
    console.error('[billing] lettura tenant_subscriptions fallita:', error.message)
    return null
  }

  return data
}

/** Il tenant a cui appartiene un customer Stripe. Serve al webhook. */
export async function schemaDaCustomer(customerId: string): Promise<string | null> {
  const { data, error } = await db()
    .from('tenant_subscriptions')
    .select('schema_name')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (error) {
    console.error('[billing] ricerca per customer fallita:', error.message)
    return null
  }

  return data?.schema_name ?? null
}

/**
 * Toglie dal patch le chiavi con valore `undefined`, lasciando passare i `null`.
 *
 * La distinzione è **tutto** in questo file. Un webhook arriva quasi sempre
 * con una vista parziale del mondo:
 *
 * - `undefined` significa **«non lo so»**, e non deve toccare il database. Un
 *   evento `invoice.paid` senza customer utilizzabile non deve azzerare il
 *   `stripe_customer_id` che collega il tenant a Stripe: quel collegamento è
 *   ciò che rende possibile ogni evento successivo, e perderlo scollega il
 *   cliente per sempre, in silenzio.
 * - `null` significa **«azzeralo davvero»**, ed è sempre una scelta esplicita:
 *   `ritardo_dal: null` quando un pagamento riesce, `disdetto_il: null` quando
 *   un abbonamento torna attivo.
 *
 * `JSON.stringify` scarterebbe gli `undefined` per conto suo, ma affidarsi a
 * quello vorrebbe dire che la correttezza di questo modulo dipende da un
 * dettaglio di serializzazione di qualcun altro.
 */
function soloValorizzati(patch: Partial<RigaAbbonamento>): Partial<RigaAbbonamento> {
  return Object.fromEntries(
    Object.entries(patch).filter(([, valore]) => valore !== undefined)
  ) as Partial<RigaAbbonamento>
}

/**
 * Scrive quello che il webhook ha capito.
 *
 * `upsert` e non `update`: il primo evento utile per un cliente può arrivare
 * prima che qualcuno abbia creato la riga a mano, e perderlo vorrebbe dire
 * restare senza stato fino al mese dopo.
 */
export async function scriviAbbonamento(
  schema: string,
  patch: Partial<RigaAbbonamento>
): Promise<void> {
  const { error } = await db()
    .from('tenant_subscriptions')
    .upsert(
      { ...soloValorizzati(patch), schema_name: schema, updated_at: new Date().toISOString() },
      { onConflict: 'schema_name' }
    )

  if (error) {
    // Qui invece si alza: è una scrittura da webhook, e Stripe riprova per
    // giorni se rispondiamo con un errore. Ingoiarlo significherebbe perdere
    // l'evento per sempre.
    throw new Error(`Scrittura tenant_subscriptions fallita: ${error.message}`)
  }
}
