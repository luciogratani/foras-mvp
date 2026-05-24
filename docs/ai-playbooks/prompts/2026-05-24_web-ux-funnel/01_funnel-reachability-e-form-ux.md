---
status: DONE
created: 2026-05-24
completed: 2026-05-24
area: ai-playbooks
type: prompt
topic: web-ux-funnel
owner: master-chat
model: claude-sonnet-4-6
effort: medium
---

# Sub-task 01 — Raggiungibilità del funnel + UX del form di prenotazione

> **/model** `claude-sonnet-4-6` · **/effort** `medium`
> Lavoro UI-neutro su `apps/web`: logica, copy, accessibilità. **Niente redesign visivo.**

## Contesto

`foras` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase, pnpm workspaces). Il sito pubblico è `apps/web`. Un audit UX esterno (`docs/audit/01_ux-funnel-prenotazione-web.md`) ha rilevato che il funnel di prenotazione ha frizioni che perdono prenotazioni. Questo task chiude i rilievi **UI-neutri** (comportamento, copy, accessibilità): non tocca l'estetica, che è congelata fino al primo onboarding cliente.

**Importante (decisione master):** la UI visiva di `apps/web` è deliberatamente congelata. Qui NON si ridisegna nulla: si riusano le classi Tailwind e i token già presenti, niente nuovi componenti shadcn, niente nuove dipendenze. Il link "Prenota" va aggiunto in forma **minimale** (un `<a>` con le utility già in uso), non come CTA stilizzato — quello arriverà col consolidamento UI.

## File da leggere prima di iniziare

- `docs/audit/01_ux-funnel-prenotazione-web.md` — rilievi P0.1, P1.1, P1.2, P1.4, P2.2, P2.3 e la sezione "Note del master" (triage)
- `apps/web/app/booking/page.tsx` — pagina prenotazione (Server Component, `searchParams.date`)
- `apps/web/app/booking/_components/BookingForm.tsx` — form (Client Component, `useActionState`)
- `apps/web/app/booking/actions.ts` — `createBookingAction` (Zod safeParse → messaggio unico)
- `apps/web/app/_components/Hero.tsx` e `apps/web/app/_components/Footer.tsx` — dove aggiungere il link "Prenota"
- `packages/supabase/src/schemas/bookings.ts` — `CreateBookingInputSchema` (per `flatten()` degli errori)

## Scope

Sei interventi, tutti su `apps/web`:

1. **P0.1 — Link "Prenota un tavolo" (minimale).** Aggiungere un link a `/booking` in `Hero.tsx` (sotto il titolo) e in `Footer.tsx` (accanto ai contatti). Plain `<a href="/booking">`, stile minimale con utility Tailwind già in uso nel repo (es. testo + underline su hover, oppure le classi di un bottone se già esistono in `@repo/ui`). **Nessun redesign, nessuna barra sticky, nessun nuovo componente.**

2. **P1.1 + P2.3 — Selezione data.** Sul `<input type="date">` del mini-form GET in `BookingForm.tsx`:
   - aggiungere `min={today}` (data odierna in formato `YYYY-MM-DD`), così non si selezionano date passate;
   - auto-submit del form GET al cambio data (`onChange` → `form.requestSubmit()`), e **rimuovere il bottone "Aggiorna"** (poco chiaro). Il form resta `method="GET"` verso `/booking` (architettura invariata: cambia solo che si invia da solo).

3. **P1.4 — Errori per-campo + GDPR visibile.** In `actions.ts`, su `safeParse` fallito, ritornare gli errori per-campo via `parsed.error.flatten().fieldErrors` (oltre al messaggio generale) **e** un oggetto `values` con i valori inviati (sanitizzati) per ripopolare il form. In `BookingForm.tsx`:
   - mostrare l'errore accanto a ciascun campo che ha fallito (con `aria-describedby` sull'input e `role="alert"` sul messaggio);
   - rendere **esplicito e visibile** l'errore del consenso GDPR mancante (non affidarsi al solo tooltip nativo `required`);
   - ripopolare i campi dai `values` ritornati così un errore di validazione non azzera quanto già compilato.

4. **P0.3 (parte cheap) — `defaultValue` sui campi.** Dare a "Numero di coperti" un `defaultValue` sensato (es. `2`) e, in generale, usare i `values` ripopolati del punto 3 come `defaultValue` dei campi, così un re-render non perde i dati.

5. **P2.2 — Data leggibile.** In `page.tsx`, sostituire `Data selezionata: {date}` (ISO grezzo) con un formato italiano leggibile via `Intl.DateTimeFormat('it-IT', { weekday:'long', day:'numeric', month:'long', year:'numeric' })`. Nessuna nuova dipendenza.

6. **P1.2 (versione cheap) — Messaggi "nessun turno" differenziati.** In `BookingForm.tsx`, separare i due casi oggi accorpati:
   - `slots.length > 0 && !hasAvailableSlots` → "Tutti i turni sono al completo per questa data. Prova un'altra data."
   - `slots.length === 0` → "Nessun turno disponibile per questa data (potremmo essere chiusi). Prova un'altra data."
   La differenziazione *ricca* (motivo esatto: chiuso vs orario passato, + suggerimento prossima data utile) richiede di toccare la firma di `getAvailableTimeSlots` (usata anche da `createBooking`) → **fuori scope**, lasciala come follow-up documentato.

## Vincoli

- **Nessun redesign visivo, nessuna nuova dipendenza, nessun nuovo componente shadcn.** Riusa utility Tailwind e primitive `@repo/ui` esistenti.
- **NON modificare il service layer** (`packages/supabase`) in questo task. Tutto resta in `apps/web`. (L'unica modifica allo schema Zod ammessa è leggere `fieldErrors`; non cambiare lo schema.)
- **Mantenere `export const dynamic = 'force-dynamic'`** in `page.tsx` (invariante del progetto: ogni `page.tsx` che fa fetch la deve preservare, altrimenti Next 16 prerenderizza statico e congela i dati DB).
- Nessuna query DB diretta nei componenti UI (regola del progetto).
- Copy in italiano. Accessibilità di base: `aria-describedby`, `role="alert"`, label associate.
- Non toccare `cancel/[token]/` — è il sub-task 02.

## Output atteso

- `apps/web/app/_components/Hero.tsx` e `Footer.tsx`: link "Prenota un tavolo" → `/booking`.
- `apps/web/app/booking/_components/BookingForm.tsx`: auto-submit data + `min`, errori per-campo, GDPR esplicito, ripopolamento valori, `defaultValue` coperti, messaggi "nessun turno" differenziati.
- `apps/web/app/booking/actions.ts`: ritorno con `fieldErrors` + `values` oltre al messaggio.
- `apps/web/app/booking/page.tsx`: data in formato italiano leggibile.

## Done when

- Dalla home (`/`) si raggiunge `/booking` con un click, su desktop e mobile.
- Selezionando una data l'elenco turni si aggiorna senza il bottone "Aggiorna"; non si possono scegliere date passate.
- Un submit con un campo non valido mostra l'errore **accanto a quel campo** e **non azzera** gli altri campi già compilati; il consenso GDPR mancante mostra un messaggio visibile.
- La data è mostrata come "venerdì 22 maggio 2026" e non come "2026-05-22".
- "Tutto pieno" e "nessun turno" mostrano messaggi distinti.
- `pnpm --filter web exec tsc --noEmit` pulito e `pnpm --filter web build` verde.
- Nessuna modifica fuori da `apps/web`.
