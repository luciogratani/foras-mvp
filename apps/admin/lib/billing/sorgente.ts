import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import {
  componiAbbonamento,
  statoDaClaim,
  type Abbonamento,
  type DatiFatturazione,
  type StatoAbbonamento,
} from './stato'
import { COOKIE_DATI, COOKIE_SCENARIO, scenarioAbilitato } from './cookie'
import { recordFinto } from './finto'
import { daRiga, leggiAbbonamento } from './deposito'
import { getUtenteCorrente } from '../utenteCorrente'
import { getSupabaseAdmin } from '../supabaseAdmin'

/**
 * **L'unico punto in cui il gestionale scopre se il cliente ha pagato.**
 *
 * L'ordine delle domande è quello che conta:
 *
 * 1. c'è uno scenario finto attivo? (solo in sviluppo) → vince su tutto
 * 2. chi è l’utente, e a che tenant appartiene **davvero** (verificato sul database)?
 * 3. quel tenant ha una riga in `public.tenant_subscriptions`?
 * 4. se non ce l'ha, **non è bloccato** — è solo non ancora configurato
 *
 * Il punto 4 è quello che tiene i clienti dentro il loro gestionale. Oggi la
 * riga non esiste, e non deve esistere perché lui possa lavorare.
 */

// Ri-esportati perché i chiamanti (layout, action, pagina Account) importano da
// qui. La definizione sta in `cookie.ts`, l'unico modulo che anche `proxy.ts`
// può caricare: la condizione deve essere **una sola**, o le due copie divergono
// e il blocco vale in un posto e non nell'altro.
export { COOKIE_SCENARIO, scenarioAbilitato }

const SCENARI: readonly StatoAbbonamento[] = ['attivo', 'in_ritardo', 'sospeso']

function leggiScenario(valore: string | undefined): StatoAbbonamento | null {
  return SCENARI.includes(valore as StatoAbbonamento) ? (valore as StatoAbbonamento) : null
}

/**
 * Un abbonamento che non blocca niente. È la risposta a ogni dubbio: utente
 * sconosciuto, tenant senza schema, riga assente, database irraggiungibile.
 *
 * Sbagliare dalla parte del cliente è deliberato. Il danno di lasciare
 * lavorare per un giorno chi non ha pagato è un giorno di gestionale; il danno
 * di bloccare chi ha pagato è una telefonata arrabbiata e la fiducia persa.
 */
function nonConfigurato() {
  return componiAbbonamento({
    configurato: false,
    stripeCustomerId: null,
    prezzoMensileCentesimi: 0,
    prossimoPagamento: null,
    ritardoDal: null,
    disdettoIl: null,
    metodoPagamento: null,
    datiFatturazione: null,
    fatture: [],
  })
}

/**
 * **Solo lo stato, senza toccare il database.**
 *
 * È quello che serve al layout su ogni pagina: la sidebar deve sapere se
 * spegnere le voci, e il popup se comparire. Entrambe le risposte stanno già
 * nei metadati dell'utente, che il layout carica comunque per l'email.
 *
 * Chiamare `getAbbonamento()` qui costava **un giro di rete verso la VPS a
 * ogni navigazione** — misurato: ~160 ms, uguali che la tabella esista o no.
 * Su un gestionale interamente `force-dynamic` è un rallentamento che si sente
 * su ogni click, pagato per un'informazione che avevamo già in mano.
 *
 * Il database si legge solo quando c'è davvero qualcosa da mostrare: la pagina
 * Account, e il popup quando lo stato non è «attivo». Cioè quasi mai.
 */
export async function getStatoAbbonamento(): Promise<StatoAbbonamento> {
  if (scenarioAbilitato()) {
    const scelto = leggiScenario((await cookies()).get(COOKIE_SCENARIO)?.value)
    if (scelto) return scelto
  }

  const user = await getUtenteCorrente()
  return statoDaClaim(user?.app_metadata?.foras_billing)
}

/**
 * L'abbonamento completo, database incluso. Costa una query: si chiama dove
 * servono gli importi e le date, non su ogni pagina.
 *
 * `cache()` di React, non memoizzazione fatta a mano: deduplica la lettura
 * **dentro la singola richiesta**, così il layout e la pagina Account non
 * interrogano il database due volte, e non possono mostrare stati diversi
 * nello stesso istante. Fuori dalla richiesta non resta niente in memoria,
 * che è ciò che serve quando il dato può cambiare da un webhook.
 */
export const getAbbonamento = cache(async (): Promise<Abbonamento> => {
  const biscotti = await cookies()

  // 1. Lo scenario finto vince su tutto, ma solo dove è ammesso.
  if (scenarioAbilitato()) {
    const scelto = leggiScenario(biscotti.get(COOKIE_SCENARIO)?.value)
    if (scelto) {
      const record = recordFinto(scelto)
      const salvati = leggiDatiSalvati(biscotti.get(COOKIE_DATI)?.value)
      if (salvati) record.datiFatturazione = { ...record.datiFatturazione!, ...salvati }
      return componiAbbonamento(record)
    }
  }

  // 2. Chi è, e di che tenant.
  const schema = await getSchemaCorrente()
  if (!schema) return nonConfigurato()

  // 3. La riga vera.
  const riga = await leggiAbbonamento(schema)
  if (!riga) return nonConfigurato()

  return componiAbbonamento(daRiga(riga))
})

/**
 * Lo schema del tenant dell'utente collegato — **verificato**, non dichiarato.
 *
 * ## Perché la verifica sta qui e non altrove
 *
 * `user_metadata` in Supabase **se lo riscrive l'utente stesso**:
 * `auth.updateUser({ data })` lo aggiorna con la sola sessione dell'interessato.
 * È quindi un dato che arriva dal client, e come tale non decide niente da solo.
 *
 * Una versione precedente si fidava, con questa motivazione scritta: *"lo fa già
 * `getVerifiedTenantClient()` su ogni rotta protetta"*. La premessa era vera per
 * otto pagine del gestionale su nove — e **falsa proprio per `/dashboard/account`**,
 * l'unica che non passa da `requireTenantClient()` ed è anche l'unica che chiama
 * questa funzione. Un titolare poteva riscriversi `schema` e leggere prezzo,
 * morosità, partita IVA, PEC e storico fatture di un altro cliente, perché sotto
 * c'è `service_role`. (Audit C, 2026-08-08.)
 *
 * Il controllo è lo stesso di `getVerifiedTenantClient()` — `schema_name` **e**
 * `owner_id` insieme — di proposito: due modi diversi di verificare la stessa
 * cosa sono il modo in cui uno dei due resta indietro.
 *
 * In caso di dubbio si torna `null`, che porta a `nonConfigurato()`: nessuno
 * viene bloccato e nessun dato altrui viene letto. È la stessa direzione di
 * errore del resto del file, ma qui vale anche per la riservatezza.
 */
async function getSchemaCorrente(): Promise<string | null> {
  const user = await getUtenteCorrente()
  const dichiarato = user?.user_metadata?.schema

  if (!user || typeof dichiarato !== 'string' || !dichiarato) return null

  try {
    const { data: tenant, error } = await getSupabaseAdmin()
      .from('tenants')
      .select('schema_name')
      .eq('schema_name', dichiarato)
      .eq('owner_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[billing] verifica del tenant fallita:', error.message)
      return null
    }
    if (!tenant) {
      console.warn(
        `[billing] utente ${user.id} dichiara lo schema "${dichiarato}" ma non ne è owner: ignorato`
      )
      return null
    }

    // Si torna il valore **letto dal database**, non quello dichiarato: sono
    // uguali per costruzione, ma è il database a doverlo dire.
    return tenant.schema_name
  } catch (err) {
    console.error('[billing] verifica del tenant fallita:', err)
    return null
  }
}

/**
 * I dati aziendali messi dal modulo di sviluppo. Un cookie manomesso non deve
 * far esplodere il gestionale: qualunque cosa non sia un oggetto JSON si
 * ignora, e i campi che non sono stringhe si scartano uno per uno.
 */
function leggiDatiSalvati(valore: string | undefined): Partial<DatiFatturazione> | null {
  if (!valore) return null
  try {
    const grezzo: unknown = JSON.parse(valore)
    if (!grezzo || typeof grezzo !== 'object' || Array.isArray(grezzo)) return null

    const pulito: Record<string, string> = {}
    for (const [chiave, v] of Object.entries(grezzo as Record<string, unknown>)) {
      if (typeof v === 'string') pulito[chiave] = v
    }
    return pulito as Partial<DatiFatturazione>
  } catch {
    return null
  }
}
