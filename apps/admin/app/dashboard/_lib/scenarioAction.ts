'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { COOKIE_SCENARIO, scenarioAbilitato } from '../../../lib/billing/sorgente'

/**
 * Cambia lo scenario di abbonamento mostrato dal gestionale.
 *
 * È un attrezzo da sviluppo e si comporta come tale: se `scenarioAbilitato()`
 * dice di no, non fa niente. Il controllo sta **qui** e non solo nel componente,
 * perché una server action è un endpoint pubblico — nascondere il pulsante non
 * nasconde l'indirizzo che chiama.
 */
export async function impostaScenarioAction(formData: FormData) {
  if (!scenarioAbilitato()) return

  const scenario = String(formData.get('scenario') ?? '')

  ;(await cookies()).set(COOKIE_SCENARIO, scenario, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  })

  // L'abbonamento si legge nel layout: rivalidare la sola pagina lascerebbe
  // sidebar e popup fermi allo stato di prima.
  revalidatePath('/dashboard', 'layout')
}
