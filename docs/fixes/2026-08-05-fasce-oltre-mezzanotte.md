# Fix — fasce orarie che scavalcano la mezzanotte

**Data:** 2026-08-05
**Trovato durante:** onboarding del cliente #1 (University Restaurant · Pool · Bar, Sassari)
**Impatto:** prenotazioni impossibili per qualunque locale aperto oltre la mezzanotte
**Modifiche allo schema DB:** nessuna

---

## Il sintomo

Appena finito il provisioning dello schema `university` e caricati i contenuti
reali, la pagina `/booking` rispondeva:

> Nessun turno disponibile per questa data (potremmo essere chiusi).

I turni però esistevano, erano `is_active = true`, non archiviati, e non c'era
nessuna `closed_dates`. Nessun errore nei log, nessuna eccezione: solo una lista
vuota.

## La causa

Gli orari sono stringhe `"HH:MM"` e l'appartenenza a una fascia era verificata
con un confronto diretto:

```ts
ranges.some((r) => slot.time >= r.open && slot.time < r.close)
```

Funziona finché la fascia sta dentro la stessa giornata. Si rompe in silenzio
appena la chiusura è lessicograficamente *minore* dell'apertura — cioè appena il
locale chiude dopo la mezzanotte.

University è aperto **15:00–02:00** (04:00 il venerdì e il sabato), tutti e
sette i giorni. Con quella fascia:

```
"20:00" >= "15:00"   →  true
"20:00" <  "02:00"   →  false    ← nessun turno può passare
```

La condizione è **insoddisfacibile**: non esiste alcun orario che sia
contemporaneamente ≥ 15:00 e < 02:00. La lista dei turni disponibili era quindi
sempre vuota, e lo sarebbe rimasta per sempre.

Lo stesso confronto compariva, identico, in altri due punti:

| File | Cosa faceva |
|---|---|
| `services/bookings.ts` | filtro dei turni dentro le fasce di apertura |
| `services/bookings.ts` | validazione dell'orario di arrivo dentro la finestra del turno |
| `schemas/settings.ts` | `endTimeAfterTime`: rifiutava `end_time < time` |

Il terzo era il più insidioso: impediva **a monte** di creare un turno
`22:00 → 01:00`, rispondendo *"La fine deve essere dopo l'inizio"*. Un gestore
non poteva nemmeno esprimere l'orario che gli serviva.

## Perché non se n'era accorto nessuno

I test coprivano il filtro per fascia — `filters slots outside opening-hours
ranges` usa una fascia reale `18:00–23:00` — ma **solo con fasce interne alla
stessa giornata**. Tutti gli altri casi usavano `ranges: []` (nessuna
restrizione) o `closed: true`.

Il ramo overnight non era mai stato esercitato, e non produce un errore: produce
un risultato vuoto, che è indistinguibile da "oggi è tutto pieno" o "siamo
chiusi". È un fallimento silenzioso, ed è il motivo per cui è sopravvissuto al
freeze del template e a due audit.

## Il fix

Un helper unico, `packages/supabase/src/lib/timeRange.ts`:

```ts
export function isOvernightRange(open: string, close: string): boolean {
  return hhmm(close) < hhmm(open)
}

export function isTimeWithinRange(time: string, open: string, close: string): boolean {
  const t = hhmm(time), o = hhmm(open), c = hhmm(close)
  if (c === o) return false
  return c < o ? t >= o || t < c : t >= o && t < c
}
```

Il modello è un arco su un quadrante di 24 ore, semiaperto `[open, close)`:

- `close > open` → arco normale: si è dentro se si sta **fra** i due estremi (`&&`)
- `close < open` → l'arco passa per la mezzanotte: si è dentro se **non** si sta
  nel buco fra `close` e `open` (`||`)

Cambia l'operatore, non la struttura.

**La condizione "scavalca la mezzanotte" è dedotta dai due valori, non
configurata.** Nessuna colonna in più, nessuna migrazione, nessuna opzione da
spiegare al gestore.

### Effetto sugli altri clienti: nessuno

Per un locale che chiude alle 23:00, `close > open` è vero, si prende il primo
ramo, il comportamento è bit-per-bit quello di prima. Il ramo overnight non si
attiva mai. È il motivo per cui questo fix appartiene al core e non a un fork:
chi non ne ha bisogno non lo vede, chi ne ha bisogno smette di avere un sistema
rotto in silenzio.

### File toccati

| File | Modifica |
|---|---|
| `packages/supabase/src/lib/timeRange.ts` | **nuovo** — l'helper |
| `packages/supabase/src/index.ts` | esporta `isTimeWithinRange`, `isOvernightRange` |
| `packages/supabase/src/services/bookings.ts` | i due confronti usano l'helper |
| `packages/supabase/src/schemas/settings.ts` | `end_time < time` ammesso; resta invalida solo la coincidenza |
| `apps/web/.../BookingForm.tsx` | niente `min`/`max` nativi su finestra overnight; testo d'aiuto dedicato |
| `apps/admin/.../OpeningHoursForm.tsx` | nota *"chiude alle HH:MM del giorno dopo"* |
| `apps/admin/.../CreateTimeSlotDialog.tsx` | idem sul turno |
| `apps/admin/.../EditTimeSlotDialog.tsx` | idem sul turno |

Nota su `BookingForm`: gli attributi `min`/`max` di `<input type="time">` sono
interpretati dal browser sulla stessa giornata. Su una finestra `22:00–01:00`
avrebbero reso impossibile **qualsiasi** inserimento. Su fascia overnight si
lasciano cadere e resta la validazione server, che è quella autoritativa.

## Come lo gestisce il gestore

**Le due caselle restano due.** Scrive `15:00` e `02:00` e basta. Il sistema
deduce da sé che si passa la mezzanotte e mostra una nota di conferma —
*"chiude alle 02:00 del giorno dopo"* — così vede che l'input è stato
interpretato come intendeva.

Nessuna fascia spezzata, nessuna riga doppia, nessuna casella nuova.

## Test

`packages/supabase/src/__tests__/timeRange.test.ts` — **14 test puri**, senza
database, quindi girano ovunque anche senza `TEST_DATABASE_URL`. Coprono fascia
normale, fascia overnight, estremi coincidenti, formato `HH:MM:SS` del DB, e una
regressione esplicita che verifica che la vecchia condizione escludesse *tutti*
gli orari.

`packages/supabase/src/__tests__/bookings.test.ts` — **3 test d'integrazione**:

- turni dentro una fascia di apertura che scavalca la mezzanotte (14:00 fuori,
  20:00 e 01:00 dentro)
- prenotazione accettata con arrivo alle 00:30 su turno 22:00–01:00
- prenotazione rifiutata con arrivo alle 03:00 sullo stesso turno

**Verifica di efficacia:** rimettendo la logica vecchia nell'helper, **7 test
diventano rossi**; con il fix sono 34/34 verdi. I test falliscono per la ragione
giusta.

## Aggiornamento — estremo finale della finestra di prenotazione

*(stesso giorno, commit separato)*

Configurando il turno reale di University — *"prenotazioni dalle 19:00 alle
23:00"* — è emerso che i due estremi **non significano la stessa cosa** a
seconda di cosa descrivono:

| | `close` / `end` significa | Intervallo |
|---|---|---|
| Fascia di apertura | "abbassiamo la saracinesca" | semiaperto `[open, close)` |
| Finestra di prenotazione | "ultimo arrivo accettato" | chiuso `[start, end]` |

Un locale aperto 15:00–02:00 **alle 02:00 è chiuso**: giusto escludere
l'estremo. Ma un turno 19:00–23:00 **accetta** chi arriva alle 23:00 — usare il
semiaperto rifiutava l'orario che il gestore aveva appena dichiarato valido, e
faceva scivolare l'ultimo arrivo utile alle 22:59. Un cliente che digita `23:00`
riceveva un errore di validazione: l'attrito che fa abbandonare una prenotazione.

Aggiunta quindi `isTimeWithinWindow(time, start, end)` — identica a
`isTimeWithinRange` ma con l'estremo finale incluso, overnight compreso
(`22:00–01:00` accetta l'arrivo all'01:00). Usata nel solo enforcement della
finestra in `createBooking`; il filtro delle fasce di apertura resta semiaperto.

Gli attributi `min`/`max` di `<input type="time">` erano già coerenti: `max` in
HTML è inclusivo.

**Test:** 7 nuovi (6 puri + 1 d'integrazione con arrivo esattamente alle 23:00).
Verificato che con il semiaperto **5 diventano rossi**. Totale suite: 42 verdi.

## Cosa resta aperto

**Il modello `data + ora` non regge le prenotazioni a durata.** Per le
prenotazioni tavoli va bene: si prenota un turno in una data. Ma per il
**biliardo** — risorsa occupata per un intervallo, "tavolo 3, 23:30–01:00" —
`data + ora` rende ambigua la data di fine, e ogni query di sovrapposizione deve
ricordarsene.

Raccomandazione per le tabelle del biliardo: **due `timestamptz`**
(`inizia_alle`, `finisce_alle`) invece di `date` + `time`. La mezzanotte smette
di essere un caso speciale e il controllo di sovrapposizione diventa la
condizione standard `inizio_a < fine_b AND inizio_b < fine_a`.

**Un turno con `end_time` minore di `time` di molte ore** (es. `22:00 → 21:00`,
23 ore) ora è accettato. È un input implausibile ma non impossibile; la nota
*"del giorno successivo"* nel gestionale lo rende visibile. Se in futuro
emergesse come problema reale, il posto giusto è un limite di durata massima,
non il ripristino del vincolo.
