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
 *
 * DUE VARIANTI
 * - `isTimeWithinRange`  → intervallo semiaperto `[open, close)` — fasce di apertura
 * - `isTimeWithinWindow` → intervallo chiuso `[start, end]` — finestre di prenotazione
 * La differenza è spiegata sopra `isTimeWithinWindow`.
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

/**
 * True se `time` cade dentro la finestra **chiusa** `[start, end]`.
 * Come `isTimeWithinRange`, ma con l'estremo finale INCLUSO.
 *
 * PERCHÉ DUE FUNZIONI
 * I due estremi significano cose diverse a seconda di cosa descrivono:
 *
 * - **Fascia di apertura** → `close` è "abbassiamo la saracinesca". Un locale
 *   aperto 15:00–02:00 alle 02:00 è già chiuso: intervallo semiaperto.
 * - **Finestra di prenotazione** → `end` è "ultimo arrivo accettato". Un turno
 *   19:00–23:00 accetta un cliente che arriva alle 23:00: intervallo chiuso.
 *
 * Usare il semiaperto anche qui rifiutava l'orario che il gestore aveva appena
 * dichiarato valido, con l'ultimo arrivo utile che scivolava alle 22:59.
 *
 *     isTimeWithinWindow('23:00', '19:00', '23:00')  // true  — ultimo arrivo
 *     isTimeWithinWindow('23:01', '19:00', '23:00')  // false
 *     isTimeWithinWindow('01:00', '22:00', '01:00')  // true  — overnight, incluso
 *
 * `start === end` descrive un istante solo: contiene esattamente quell'orario.
 * (Il caso non è raggiungibile dal gestionale — lo schema Zod dei turni rifiuta
 * gli estremi coincidenti — ma la funzione resta definita per ogni input.)
 */
export function isTimeWithinWindow(time: string, start: string, end: string): boolean {
  const t = hhmm(time)
  const s = hhmm(start)
  const e = hhmm(end)

  if (e === s) return t === s
  return e < s ? t >= s || t <= e : t >= s && t <= e
}
