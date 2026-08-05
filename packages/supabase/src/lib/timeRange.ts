/**
 * timeRange.ts — appartenenza di un orario a una fascia, con supporto
 * alle fasce che scavalcano la mezzanotte.
 *
 * PERCHÉ ESISTE
 * Gli orari nel DB sono stringhe "HH:MM" (o "HH:MM:SS") e venivano confrontati
 * direttamente con `>=` e `<`. Il confronto fra stringhe funziona finché la
 * fascia sta dentro la stessa giornata, ma si rompe in silenzio appena la
 * chiusura è "più piccola" dell'apertura:
 *
 *     "20:00" >= "15:00"  →  true
 *     "20:00" <  "02:00"  →  FALSE   ← nessun orario può stare in 15:00–02:00
 *
 * Risultato: per un locale aperto oltre la mezzanotte la lista dei turni
 * disponibili era **sempre vuota**, senza alcun errore. Vedi
 * `docs/fixes/2026-08-05-fasce-oltre-mezzanotte.md`.
 *
 * IL MODELLO
 * Una fascia è un arco su un quadrante di 24 ore, semiaperto: `[open, close)`.
 * - `close > open` → arco normale, si è dentro se si sta FRA i due estremi.
 * - `close < open` → l'arco passa per la mezzanotte, si è dentro se NON si sta
 *   nel buco fra `close` e `open`. La congiunzione diventa una disgiunzione.
 *
 * La condizione "scavalca la mezzanotte" è DEDOTTA dai due valori, non
 * configurata: nessun campo in più nel DB, nessuna scelta da fare nel
 * gestionale. Chi non scavalca la mezzanotte non cambia comportamento — il
 * ramo overnight non si attiva mai.
 */

/** Normalizza "HH:MM:SS" o "HH:MM" a "HH:MM" per confronti esatti. */
function hhmm(time: string): string {
  return time.slice(0, 5)
}

/**
 * True se la fascia scavalca la mezzanotte, cioè se la chiusura cade il
 * giorno successivo rispetto all'apertura (`close < open`).
 *
 * `close === open` NON è considerato overnight: è una fascia degenere di
 * durata zero, vedi `isTimeWithinRange`.
 */
export function isOvernightRange(open: string, close: string): boolean {
  return hhmm(close) < hhmm(open)
}

/**
 * True se `time` cade dentro la fascia semiaperta `[open, close)`.
 * Gestisce sia le fasce normali sia quelle che scavalcano la mezzanotte.
 *
 *     isTimeWithinRange('20:00', '15:00', '23:00')  // true  — fascia normale
 *     isTimeWithinRange('20:00', '15:00', '02:00')  // true  — overnight, prima di mezzanotte
 *     isTimeWithinRange('01:00', '15:00', '02:00')  // true  — overnight, dopo mezzanotte
 *     isTimeWithinRange('14:00', '15:00', '02:00')  // false — nel buco di chiusura
 *
 * `open === close` ritorna sempre false (durata zero): stesso comportamento
 * del confronto originale, così il fix non introduce sorprese.
 */
export function isTimeWithinRange(time: string, open: string, close: string): boolean {
  const t = hhmm(time)
  const o = hhmm(open)
  const c = hhmm(close)

  if (c === o) return false
  return c < o ? t >= o || t < c : t >= o && t < c
}
