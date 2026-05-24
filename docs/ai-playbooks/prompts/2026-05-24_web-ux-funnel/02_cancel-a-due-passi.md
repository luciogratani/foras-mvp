---
status: DONE
created: 2026-05-24
completed: 2026-05-24
area: ai-playbooks
type: prompt
topic: web-ux-funnel
owner: master-chat
model: claude-sonnet-4-6
effort: high
---

# Sub-task 02 — Annullamento prenotazione a due passi (GET mostra, POST cancella)

> **/model** `claude-sonnet-4-6` · **/effort** `high`
> Fix di correttezza, non solo UX. Tocca service layer + rotta + nuova server action: review attenta.

## Contesto

`foras` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase). Nel sito pubblico `apps/web`, la pagina di annullamento prenotazione `apps/web/app/booking/cancel/[token]/page.tsx` **annulla la prenotazione direttamente nel render del Server Component** (chiama `cancelBookingByToken` durante il GET). L'audit UX (`docs/audit/01_ux-funnel-prenotazione-web.md`, rilievo **P0.2**) lo classifica come perdita diretta di prenotazioni: qualsiasi **prefetch GET** del link (anteprime di WhatsApp/Gmail/iMessage, scanner antivirus, tasto "indietro" del browser) annulla il tavolo **senza che l'utente lo voglia o lo sappia**. Diventa critico quando si attiverà l'email di conferma (B2, oggi dormiente in `apps/web/lib/notifyBooking.ts`), perché il link di annullamento viaggerà proprio via email.

**Decisione master:** trasformare l'annullamento in **due passi**. Il GET mostra solo i dettagli della prenotazione + un bottone "Conferma annullamento"; la cancellazione effettiva avviene **solo su POST** (server action). Nessuna mutazione nel render di una pagina.

## File da leggere prima di iniziare

- `docs/audit/01_ux-funnel-prenotazione-web.md` — rilievo P0.2 e i 3 quick win
- `apps/web/app/booking/cancel/[token]/page.tsx` — la pagina attuale (mutazione su GET, riga ~25)
- `packages/supabase/src/services/bookings.ts` — `cancelBookingByToken` (riga ~265) e `getBookingsAdmin`/`AvailableTimeSlot` per i pattern; `cancelBookingByToken` resta la mutazione, ma serve una nuova funzione di sola lettura
- `apps/web/app/booking/actions.ts` — pattern server action esistente (`'use server'`, `getWebSupabaseAdmin()`)
- `apps/web/lib/supabaseAdmin.ts` — `getWebSupabaseAdmin()` (client privilegiato server-only)
- `packages/supabase/src/schemas/bookings.ts` — `CancelBookingTokenSchema`

## Scope

1. **Nuova funzione di sola lettura nel service** — in `packages/supabase/src/services/bookings.ts`:
   ```
   getBookingByToken(client: TenantClient, token: string): Promise<BookingSummary | null>
   ```
   - SELECT (mai UPDATE) della prenotazione con quel `cancellation_token`, joinando `time_slots` per avere `label`/`time` del turno.
   - Ritorna un riepilogo tipato `BookingSummary` con almeno: `name`, `date`, `covers`, `status` (`'confirmed' | 'cancelled'`), `slot_label`, `slot_time`. Esportare il tipo da `packages/supabase/src/index.ts`.
   - `null` se il token non corrisponde a nessuna prenotazione (token non valido/inesistente). NON lanciare per "non trovato": è un esito normale.
   - Validare il token con `CancelBookingTokenSchema` (come fa `cancelBookingByToken`).
   - Segui i pattern del file: firma `(client: TenantClient, ...)`, error wrap `throw new Error('getBookingByToken failed: <msg>')` sui veri errori PostgREST.

2. **Nuova server action** — in un file `actions.ts` co-locato sotto `apps/web/app/booking/cancel/[token]/` (o estendi un actions condiviso del booking, a tua scelta motivata):
   ```
   confirmCancelAction(token): chiama cancelBookingByToken(getWebSupabaseAdmin(), token)
   ```
   `'use server'`, riceve il token (campo hidden del form). Ritorna lo stato dell'esito (annullata / già annullata-o-non-trovata / errore) per renderizzare il risultato. Usa `getWebSupabaseAdmin()`.

3. **Riscrittura della pagina** `cancel/[token]/page.tsx`:
   - **Il GET non muta più nulla.** Valida il token (`CancelBookingTokenSchema`); chiama `getBookingByToken` (sola lettura).
   - Token non valido o prenotazione inesistente → messaggio "Link non valido o prenotazione non trovata" + link alla home.
   - Prenotazione già `cancelled` → messaggio "Questa prenotazione risulta già annullata" (nessun bottone).
   - Prenotazione `confirmed` → mostrare un **riepilogo** (nome, data leggibile in italiano via `Intl`, turno `label (time)`, coperti) + un **form POST** con un bottone "Conferma annullamento" (+ un link "No, torna alla home").
   - Dopo il POST: mostrare l'esito ("Prenotazione annullata, i coperti sono stati liberati" oppure "Link già utilizzato o prenotazione non trovata"). Va bene gestire l'esito con `useActionState` (Client Component dedicato per il bottone) oppure con un redirect a uno stato della stessa pagina — scegli la via più semplice e robusta, motivandola in una riga.

## Vincoli

- **Nessuna mutazione DB nel render di un Server Component / su una richiesta GET.** La cancellazione avviene solo nella server action su POST. Questo è il cuore del task.
- **Mantenere `export const dynamic = 'force-dynamic'`** sulla pagina.
- Nessuna nuova dipendenza. Copy in italiano. Riusa utility/primitive esistenti (UI minimale, niente redesign).
- Non rimuovere né cambiare la semantica di `cancelBookingByToken` (è la mutazione idempotente: filtra `status='confirmed'`, non lancia su token assente). Aggiungi `getBookingByToken` accanto, non al posto.
- `getBookingByToken` richiede il client privilegiato (stessa ragione RLS delle altre letture su `bookings`): il consumer passa `getWebSupabaseAdmin()`.

## Output atteso

- `packages/supabase/src/services/bookings.ts`: `getBookingByToken` + tipo `BookingSummary` esportato da `index.ts`.
- `apps/web/app/booking/cancel/[token]/actions.ts`: `confirmCancelAction`.
- `apps/web/app/booking/cancel/[token]/page.tsx`: riscritta a due passi (GET mostra, POST cancella) + eventuale piccolo Client Component per il bottone/esito.

## Done when

- Aprire `/booking/cancel/<token-valido>` **non** annulla la prenotazione: mostra il riepilogo e un bottone.
- L'annullamento avviene solo cliccando "Conferma annullamento" (POST) e libera i coperti.
- Un prefetch/GET del link (es. ricaricare la pagina più volte senza cliccare) lascia la prenotazione `confirmed`.
- Token non valido, prenotazione inesistente e prenotazione già annullata mostrano messaggi distinti e corretti.
- `pnpm -r exec tsc --noEmit` pulito (ricorsivo, non solo il build dell'app) e `pnpm --filter web build` verde.
- Verifica manuale suggerita a Lucio: creare una prenotazione, copiare il link di annullamento, ricaricarlo 2-3 volte (resta confermata), poi confermare l'annullamento (passa a cancellata, coperti liberati).
