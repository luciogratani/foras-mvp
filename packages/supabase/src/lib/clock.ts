/**
 * Funzioni pure per calcolare "oggi" e "ora adesso" nella timezone locale
 * del ristorante. Basate su Intl (built-in, zero dipendenze). Il default
 * 'Europe/Rome' è l'unico punto in cui la costante è scritta: i call-site
 * chiamano senza argomenti, rendendo banale il passaggio a timezone per-tenant
 * (opzione A, post-MVP).
 */

/**
 * Ritorna la data odierna in formato YYYY-MM-DD nella timezone specificata.
 * Il locale 'en-CA' produce già YYYY-MM-DD senza manipolazioni di stringa.
 */
export function localToday(tz: string = 'Europe/Rome'): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/**
 * Ritorna l'ora corrente in formato HH:MM nella timezone specificata.
 */
export function localNow(tz: string = 'Europe/Rome'): string {
  // hourCycle 'h23' (non hour12:false) per evitare il "24:00" a mezzanotte di
  // alcune versioni ICU con en-GB — proprio il bordo che questo helper deve gestire.
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date())
}

/**
 * Ritorna la data a `days` giorni di offset dall'oggi nella timezone specificata,
 * in formato YYYY-MM-DD. Utile per calcolare "domani" e "+7gg" nella tz locale.
 */
export function localDateOffset(days: number, tz: string = 'Europe/Rome'): string {
  const dt = new Date(Date.now() + days * 86_400_000)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dt)
}
