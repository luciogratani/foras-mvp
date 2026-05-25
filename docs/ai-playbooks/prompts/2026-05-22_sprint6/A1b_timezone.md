---
status: DRAFT
sprint: 6
stream: A
task: A1b
created: 2026-05-25
suggested_model: claude-sonnet-4-6
suggested_effort: high
owner: master-chat
---

# Sprint 6 / A1b — Timezone-correctness del calcolo "oggi/ora"

> **DECISIONE APERTA — il master conferma prima di delegare.** Questo prompt implementa l'**opzione (B)** raccomandata dal master (vedi `decision-log/decisioni.md`, da scrivere alla conferma): *correggere il bug UTC usando una costante `'Europe/Rome'`, senza colonna nuova → NON schema-affecting, fuori dal perimetro freeze.* Se invece si sceglie l'**opzione (A)** (timezone per-tenant configurabile = colonna `site_settings.timezone`), lo scope cambia: vedi l'**Addendum (A)** in fondo. Per l'MVP sardo Europe/Rome è universale → (B) è la scelta di default.

## Contesto

`foras-mvp` calcola "oggi" e "ora adesso" con `new Date().toISOString()`, che ritorna **UTC**. Per `Europe/Rome` (UTC+1 inverno / +2 estate), tra la mezzanotte locale e le ~01:00–02:00 "oggi" in UTC è ancora **ieri**. Effetti vicino a mezzanotte: la guard "data passata" e il filtro degli slot odierni si sfasano di un giorno / 1–2 ore; lontano da mezzanotte nessun effetto. È un bug di correttezza latente, indipendente dalla configurabilità per-tenant. (B) lo chiude a costo quasi nullo e senza toccare lo schema.

## File da leggere prima di iniziare

- `packages/supabase/src/services/bookings.ts` — i siti tz-sensibili: `getAvailableTimeSlots` (`now`/`today`/`currentTime` ~righe 56–58; usati in `date < today` e `slot.time < currentTime`), `createBooking` (`today` ~riga 136), `getBookingCountsBySlot` (`today` ~riga 221), `getDashboardStats` (`today`/`tomorrow`/`nextWeek` ~righe 252–254).
- `packages/supabase/src/index.ts` — barrel degli export (qui esporti il nuovo helper).
- `apps/web/app/booking/page.tsx` (`today` per il `min` del date-picker ~riga 15) e `apps/web/app/booking/_components/BookingForm.tsx` (`today` per `min` ~riga 39).
- `apps/admin/app/dashboard/prenotazioni/page.tsx` (`today` filtro default ~riga 18) e `apps/admin/app/dashboard/prenotazioni/_components/BookingFilters.tsx` (`today`/`domani` dei bottoni ~riga 13).
- `apps/admin/app/dashboard/page.tsx` (~riga 14, `today` via `toLocaleDateString('it-IT')` — verifica se alimenta logica o solo display).

## Scope (opzione B)

1. **Helper condiviso (no deps).** In `packages/supabase/src` crea un piccolo modulo (es. `lib/clock.ts`) con due funzioni pure basate su `Intl.DateTimeFormat`, esportate da `index.ts`:
   - `localToday(tz: string = 'Europe/Rome'): string` → data odierna `YYYY-MM-DD` nella tz. Implementazione robusta: `new Intl.DateTimeFormat('en-CA', { timeZone: tz, year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date())` (il locale `en-CA` produce già `YYYY-MM-DD`).
   - `localNow(tz: string = 'Europe/Rome'): string` → ora corrente `HH:MM` nella tz (`hour12:false`, `hour:'2-digit'`, `minute:'2-digit'`).
   - (Opzionale, se comodo per `getDashboardStats`) `localDateOffset(days: number, tz?: string): string` per "domani"/"+7gg" calcolati nella tz invece di `Date.now() + N*86400000`.
   - Niente `SET`/stato globale; DST è gestito automaticamente da `Intl`.

2. **Sostituire le computazioni UTC** con l'helper, passando `'Europe/Rome'` (default dell'helper, quindi anche senza argomento):
   - `bookings.ts`: in `getAvailableTimeSlots` → `today = localToday()`, `currentTime = localNow()`; in `createBooking` → `today = localToday()`; in `getBookingCountsBySlot` → `today = localToday()`; in `getDashboardStats` → `today`/`tomorrow`/`nextWeek` derivati nella tz.
   - `apps/web` e `apps/admin`: i `today` che alimentano `min`/`defaultValue`/filtri usano `localToday()`. (Importa da `@repo/supabase`.)

3. **NON toccare la derivazione del giorno-settimana** in `getAvailableTimeSlots` (`new Date(date).getUTCDay()`, ~riga 87): `date` è una stringa date-only e `getUTCDay()` su mezzanotte UTC è il modo **corretto e tz-stabile** di ricavarne il weekday. Lascialo invariato (aggiungi un commento di una riga che spiega perché non usa la tz).

## Vincoli (opzione B)

- **Nessuna modifica DB / nessuna colonna nuova.** È il punto dell'opzione (B). Niente `ALTER`.
- **Nessuna dipendenza nuova** — solo `Intl` (built-in).
- La costante `'Europe/Rome'` vive **solo come default dell'helper** (un punto unico), non sparsa nei call-site: così l'eventuale passaggio futuro a (A) per-tenant è una modifica localizzata.
- Non cambiare la semantica delle guard (solo la *sorgente* di "oggi/ora"): `date < today` resta `<`, ecc.
- Display-only (`Footer` anno, formattazioni date nelle pagine cancel/booking, `archived_at` timestamp) **non** è in scope.

## Output atteso (opzione B)

- `packages/supabase/src/lib/clock.ts` (nuovo) + export da `index.ts`.
- `bookings.ts`: 4 funzioni aggiornate (getAvailableTimeSlots, createBooking, getBookingCountsBySlot, getDashboardStats).
- `apps/web`: `booking/page.tsx`, `BookingForm.tsx`.
- `apps/admin`: `prenotazioni/page.tsx`, `BookingFilters.tsx` (+ `dashboard/page.tsx` se alimenta logica).

## Done when

- "Oggi/ora" sono calcolati in `Europe/Rome` ovunque alimentino logica/guardrail; il weekday-da-data resta su `getUTCDay()`.
- `pnpm -r exec tsc --noEmit` pulito; `pnpm --filter web build` e `pnpm --filter admin build` verdi. Esiti reali nel report.
- **Smoke suggerito al master:** impostare temporaneamente l'orologio/tz mentalmente vicino a mezzanotte non è pratico in locale → in alternativa verificare via unit-mental: `localToday('Europe/Rome')` alle 00:30 italiane ritorna la data odierna locale, non quella UTC di ieri.

## Report finale (conciso)

(1) File creati/modificati una riga ciascuno. (2) Esiti tsc -r + build web/admin. (3) Conferma che `getUTCDay()` (weekday) è stato lasciato e perché. (4) Dubbi.

---

## Addendum — se il master sceglie l'opzione (A): timezone per-tenant

Scope **aggiuntivo** rispetto a (B), e **schema-affecting** (entra nel baseline congelato):

- **Schema:** aggiungere `site_settings.timezone TEXT NOT NULL DEFAULT 'Europe/Rome'` (additiva, come `end_time`) a `create_schema_from_template.sql` §2 + a `types/database.ts` (hand-edit Row/Insert/Update) + uno script `ALTER TABLE template.site_settings ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Europe/Rome';` per il `template` esistente (step manuale master).
- **Threading della tz:** le funzioni del service che calcolano "oggi/ora" devono ricevere la tz del tenant. `getAvailableTimeSlots` già interroga `site_settings` → leggere lì anche `timezone` e passarlo all'helper. `createBooking` chiama `getAvailableTimeSlots`, ma fa anche un suo check `date < today` → o legge `timezone` con una select dedicata o lo deriva dallo stesso fetch. `getDashboardStats`/`getBookingCountsBySlot` (admin) → una select di `site_settings.timezone`. I `today` lato pagine app non hanno facile accesso alla tz tenant in SSR senza un fetch → valutare se per quei `min`/filtri basta `'Europe/Rome'` (UI hint, il server resta la verità) o se fetchare la tz.
- **Aggiornare** `data-model.md` (riga `timezone` in `site_settings`) e i doc di freeze.
- **Costo:** una colonna + threading in ~4 punti del service. Per l'MVP sardo non porta valore a breve → motivo per cui (B) è raccomandata.
