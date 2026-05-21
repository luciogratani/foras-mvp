---
status: DRAFT
updated: 2026-05-22
area: ai-playbooks
type: prompt
sprint: 5
order: 5
suborder: b
tags: [foras-mvp, sprint5, booking, opening-hours, guard]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: low
---

# Sprint 5 / 5b — Guard giorni chiusi nel booking

## Contesto

`getAvailableTimeSlots(client, date)` in `packages/supabase/src/services/bookings.ts` ritorna i turni attivi per una data, ma non controlla `opening_hours` in `site_settings`. Risultato: il form prenotazioni mostra turni disponibili anche su giorni in cui il locale è chiuso.

`time_slots` non ha campo `day_of_week` — è una lista flat. `opening_hours` è un JSONB su `site_settings` con struttura a 7 chiavi fisse (`monday`…`sunday`), ciascuna con `{ open, close, closed }`. I tipi e lo schema Zod sono già definiti in `packages/supabase/src/schemas/settings.ts` (dal sub-task `05`). Nessuna migration necessaria — è un fix applicativo puro.

**Tech debt noto (non da risolvere qui):** `time_slots` non ha `day_of_week`, quindi non è possibile configurare turni diversi per giorno. Rinviato a post-MVP.

## File da leggere prima di iniziare

- `packages/supabase/src/services/bookings.ts` — file da modificare; leggere l'implementazione attuale di `getAvailableTimeSlots` e il `Promise.all` esistente
- `packages/supabase/src/schemas/settings.ts` — tipo `OpeningHours` e costante `DAYS` (dal sub-task 05)

## Scope

Unica modifica: `packages/supabase/src/services/bookings.ts`, funzione `getAvailableTimeSlots`.

**1. Aggiungere import** in cima al file (dopo gli import esistenti):
```ts
import type { OpeningHours } from '../schemas/settings'
```

**2. Aggiungere un terzo fetch in parallelo** nel `Promise.all` esistente:
```ts
client.from('site_settings').select('opening_hours').limit(1).maybeSingle(),
```

**3. Aggiungere check errore** per la terza query (dopo i check delle prime due):
```ts
if (settingsRes.error) throw new Error(`getAvailableTimeSlots (settings) failed: ${settingsRes.error.message}`)
```

**4. Aggiungere guard giorno chiuso** prima di costruire `bookedBySlot`:
```ts
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
const dayKey = DAY_NAMES[new Date(date).getUTCDay()]
const hours = settingsRes.data?.opening_hours as OpeningHours | null | undefined
if (hours?.[dayKey]?.closed === true) return []
```

`new Date("YYYY-MM-DD")` è parsato come UTC midnight → `getUTCDay()` restituisce il giorno corretto per la stringa data ricevuta dal form.

## Vincoli

- **Firma invariata**: `(client: TenantClient, date: string): Promise<AvailableTimeSlot[]>` — nessun cambiamento visibile ai consumer.
- **`services/site.ts` invariato** — non toccare.
- **`apps/web/**` invariato** — la modifica è backward compatible (stessa firma, comportamento più restrittivo).
- **Nessun altro file** oltre a `services/bookings.ts`.
- **Nessuna migration DB**.

## Output atteso

- `packages/supabase/src/services/bookings.ts` (modificato: import + terzo fetch nel Promise.all + guard)
- Nessun altro file

## Done when

- `pnpm -r exec tsc --noEmit` exit 0
- In `apps/web` dev (:3000): selezionando nel form prenotazioni una data corrispondente a un giorno con `closed: true` negli orari admin, la lista turni è vuota (nessun turno mostrato)
- Per giorni con `closed: false` il comportamento è invariato (i turni attivi compaiono come prima)
- Nessuna regressione sul CRUD admin orari (`/dashboard/orari`)

## Note per il master

1. **Test manuale chiave**: impostare un giorno come "chiuso" da `/dashboard/orari`, poi aprire il form prenotazioni su una data di quel giorno → deve comparire "Nessun turno disponibile" (o lista vuota). Verificare anche il caso opposto (giorno aperto → turni visibili).
2. **`maybeSingle()` vs `single()`**: usare `maybeSingle()` perché `site_settings` potrebbe essere vuota in tenant di test; il guard gestisce `null` con optional chaining (`hours?.[dayKey]?.closed`).
3. **`getUTCDay()` è corretto** per date in formato `YYYY-MM-DD` (parsed as UTC midnight). Non usare `getDay()` (dipende dal fuso orario locale del server).
4. **Suggerito:** `/model claude-sonnet-4-6`, `/effort low`. Task minimo: 1 file, ~10 righe.
5. **Commit (master, dopo review):** `fix(booking): skip time slots when opening_hours marks day as closed`
6. Frontmatter → `status: DONE` a fine sessione. Prossimo: sub-task `06` (vista prenotazioni admin).
