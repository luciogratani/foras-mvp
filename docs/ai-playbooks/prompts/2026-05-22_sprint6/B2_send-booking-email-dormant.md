---
status: TODO
sprint: 6
stream: B
task: B2
created: 2026-05-22
suggested_model: sonnet
suggested_effort: high
owner: master-chat
---

# Sprint 6 / B2 — Email prenotazioni (Resend) — costruita ma DORMIENTE

## Contesto

`foras-mvp` è un sistema multi-tenant per siti di bar/ristoranti. La decisione architetturale (master + Lucio, 2026-05-22 — vedi `decision-log/decisioni.md` voce *Email prenotazioni: Edge Function centralizzata*) è: una **unica Edge Function centralizzata** `send-booking-email` invia conferma al cliente + notifica al gestore via **Resend**, da un **dominio di servizio condiviso** `foras.*` (verificato una volta sola, non per-cliente). La `RESEND_API_KEY` vive solo nella function, **mai su Vercel**.

**Vincolo di questa fase (importante):** Lucio **non ha ancora il dominio** e sta per fare smoke test / valutazione UX in cui l'invio email darebbe fastidio. Quindi questo task **scrive tutto il codice e lo tiene pronto, ma DORMIENTE**: di default OFF, no-op completo se non configurato, e **mai** in grado di bloccare o far fallire una prenotazione. L'attivazione reale (dominio + secret + deploy) avverrà più avanti con un semplice flip di configurazione.

Il template freeze è stato **posticipato** (si fanno prima smoke test + UX), ma questo task è infra **tenant-agnostica** e non tocca lo schema → procede comunque.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce **2026-05-22 — Email prenotazioni** (il design: function riceve `schema` + booking id, valida lo schema contro `public.tenants`, legge `site_settings` con `service_role`, From display-name = nome locale, reply-to = email locale).
- `apps/web/app/booking/actions.ts` — `createBookingAction`: ritorna `{ id, cancellation_token }` (riga 36-37). **È qui che agganci l'invio**, dopo il `createBooking` riuscito.
- `apps/web/lib/supabaseAdmin.ts` — pattern `import 'server-only'` + client privilegiato (`getWebSupabaseAdmin`). Lo schema attivo è in `process.env.NEXT_PUBLIC_SUPABASE_SCHEMA`.
- `packages/supabase/src/services/bookings.ts` — `createBooking` (cosa ritorna) e la forma del record `bookings`.
- `docs/tech-architecture/data-model.md` — `site_settings` (`title` per il display-name, `email` per reply-to + destinatario gestore) e `bookings` (date, covers, name, email, phone, notes, cancellation_token, time_slot_id).
- `apps/web/.env.local` (per capire le env esistenti — **non committarlo**) e gli altri `.env.example` del repo per lo stile.

## Scope

### 1. Edge Function `supabase/functions/send-booking-email/index.ts` (Deno)

(Crea la cartella `supabase/functions/send-booking-email/`. Il deploy è manuale e **rimandato** — qui scrivi solo il codice.)

- Input: `POST` JSON `{ schema, bookingId, siteUrl }`.
- **Valida `schema`** contro `public.tenants` (client `service_role`) prima di leggere qualsiasi dato — no schemi arbitrari.
- Legge la prenotazione per `bookingId` da `{schema}.bookings` + `site_settings` (title, email) con `service_role`.
- Invia **2 email** via Resend REST API (`POST https://api.resend.com/emails`, header `Authorization: Bearer ${RESEND_API_KEY}` — usa `fetch`, niente SDK pesante):
  - **Cliente** → `to: booking.email`, `from: "{site_settings.title}" <${RESEND_FROM}>`, `reply_to: site_settings.email`, corpo: conferma con data, turno/orario, coperti + link cancellazione `${siteUrl}/booking/cancel/${cancellation_token}`.
  - **Gestore** → `to: site_settings.email`, `from: "{site_settings.title}" <${RESEND_FROM}>`, corpo: nuova prenotazione (nome, email, telefono, data, turno, coperti, note).
- **Env della function:** `RESEND_API_KEY`, `RESEND_FROM` (es. `prenotazioni@foras.it`). **Se mancano → ritorna `200` con un no-op** (così, anche se in futuro la function venisse raggiunta senza secret configurati, è innocua).

### 2. Wiring in `apps/web` — gated e fire-and-forget

- `apps/web/lib/notifyBooking.ts` (`import 'server-only'`): wrapper gated. **Se `process.env.BOOKING_EMAIL_ENABLED !== 'true'` oppure manca l'URL della function → ritorna subito (no-op, nessun `fetch`, nessun log rumoroso).** Altrimenti `POST` alla function con `{ schema, bookingId, siteUrl }`. Tutto in `try/catch`: **non lancia mai**, logga l'eventuale errore solo server-side.
- In `createBookingAction`: dopo il `createBooking` riuscito (riga 36), usa **`after()` da `next/server`** (disponibile su Next 16) per chiamare `notifyBooking(...)` in fire-and-forget — la risposta della prenotazione torna **comunque e subito**. `schema` da `NEXT_PUBLIC_SUPABASE_SCHEMA`, `bookingId` = `id`, `siteUrl` dall'origin (`headers()` o `NEXT_PUBLIC_SITE_URL`).

### 3. Env plumbing (tutto OFF di default)

- Aggiungi a `.env.example` (di `apps/web`, crealo se non esiste seguendo le env reali) le variabili **commentate / a OFF**:
  - `BOOKING_EMAIL_ENABLED=false`
  - `SEND_BOOKING_EMAIL_URL=` (URL della Edge Function, vuoto finché non deployata)
  - `NEXT_PUBLIC_SITE_URL=` (origin per il link di cancellazione, se non già presente)
- Documenta che `RESEND_API_KEY` / `RESEND_FROM` sono **secret della Edge Function** (server Supabase), **non** env di `apps/web`/Vercel.

### 4. Checklist di attivazione

Crea `supabase/functions/send-booking-email/README.md` con i passi per accendere il servizio in futuro: (1) verificare dominio `foras.*` su Resend; (2) impostare `RESEND_API_KEY`/`RESEND_FROM` come secret della function; (3) deployare la function; (4) impostare `BOOKING_EMAIL_ENABLED=true` + `SEND_BOOKING_EMAIL_URL` su Vercel (`apps/web`).

## Vincoli

- **Dormiente di default.** Con le env non impostate: **zero chiamate di rete, zero side effect**. Gli smoke test sul flusso prenotazione non devono vedere alcun tentativo email (console pulita, nessun fetch a Resend/function).
- **Mai bloccare né far fallire una prenotazione.** L'email è fire-and-forget via `after()`; ogni errore è catturato e loggato solo server-side, mai propagato all'utente. Se la function è giù o non deployata, la prenotazione **riesce comunque** identica a oggi.
- **`RESEND_API_KEY` solo nella Edge Function.** Mai in `apps/web`, mai su Vercel, mai nel bundle browser, mai in file committati. (Coerente con la decisione: chiavi fuori da Vercel.)
- **Nessuna modifica a DB/schema** (freeze posticipato, e comunque è infra tenant-agnostica). **Niente nuove colonne** — il `siteUrl` per il link di cancellazione si passa dal caller (`apps/web` conosce il proprio origin), così non serve toccare lo schema.
- **Nessuna dipendenza pesante** in `apps/web`. Nella function usa `fetch` verso l'API Resend, non l'SDK npm.
- Branding: `from` display-name = `site_settings.title`, `reply_to` = `site_settings.email`.

## Output atteso

- `supabase/functions/send-booking-email/index.ts` (+ `deno.json`/import map se serve) — non deployata.
- `supabase/functions/send-booking-email/README.md` — checklist di attivazione.
- `apps/web/lib/notifyBooking.ts` — wrapper gated server-only.
- `apps/web/app/booking/actions.ts` — hook con `after()`.
- `apps/web/.env.example` — nuove var OFF + commenti.

## Done when

- Con `BOOKING_EMAIL_ENABLED` non `'true'`: prenotazione end-to-end identica a oggi, **nessuna chiamata di rete email** (verificabile in browser: console pulita, nessun fetch a Resend/function).
- `createBookingAction` **non attende** l'email per rispondere; un fallimento/timeout email non rompe né rallenta la prenotazione.
- `RESEND_API_KEY` non compare in `apps/web` né in alcun file committato; non finisce nel bundle.
- Codice completo e pronto: con env impostate + function raggiungibile, dopo una prenotazione partirebbero le 2 email con `from`/`reply_to` corretti e cancel link valido. (**Il test d'invio reale è rimandato** a quando Lucio ha dominio + deploy — non è richiesto qui.)
- `pnpm -r exec tsc --noEmit` + build `web` verdi.

## Note di esecuzione per la sub-chat

- Lo smoke test "dormiente" (prenotazione senza email) lo verifica **Lucio** in browser; tu garantisci col codice che il path disattivato sia un no-op puro.
- Se `createBooking` non ritornasse abbastanza per identificare la prenotazione (serve almeno l'`id`, che oggi c'è), **segnala al master** invece di allargare lo scope al service layer.
- Non attivare nulla, non inserire chiavi reali, non creare account Resend: questo task lascia il sistema spento.
