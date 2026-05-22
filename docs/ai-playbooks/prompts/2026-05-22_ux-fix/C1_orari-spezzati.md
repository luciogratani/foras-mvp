---
status: DONE
sprint: ux-fix
stream: C
task: C1
created: 2026-05-22
suggested_model: sonnet
suggested_effort: high
owner: master-chat
---

# UX-fix / C1 — Orari di apertura spezzati (pranzo + cena)

## Contesto

`foras-mvp` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase + shadcn/ui). Il freeze del template è posticipato per permettere alcuni fix pre-freeze. Questo è il primo.

**Problema.** `site_settings.opening_hours` è un JSONB con una sola coppia `open`/`close` per giorno. La struttura attuale non permette di rappresentare orari spezzati (es. "12:00–15:00 e 19:00–23:00"), che sono **lo standard italiano** per ristoranti e moltissimi bar. Il sito mostrerebbe orari falsi.

**Fix.** Cambiare la struttura JSONB da `{open, close, closed}` a `{closed, ranges: [{open, close}][]}` con max 2 fasce per giorno. La modifica è backward-compatible nello schema (JSONB, nessuna FK) ma richiede una migrazione dei dati esistenti.

## File da leggere prima di iniziare

- `packages/supabase/src/schemas/settings.ts` — `OpeningHoursDaySchema` e `OpeningHoursSchema` attuali (da riscrivere)
- `packages/supabase/src/services/bookings.ts` — `getAvailableTimeSlots`: logica filtro turni per fascia oraria (righe ~67–79)
- `apps/admin/app/dashboard/orari/_components/OpeningHoursForm.tsx` — form admin attuale (da riscrivere)
- `apps/admin/app/dashboard/orari/actions.ts` — `updateOpeningHoursAction`: parsing formData → JSONB (da aggiornare)
- `apps/web/app/_components/OpeningHours.tsx` — componente Server rendering orari in homepage (da aggiornare)
- `docs/operations/create_schema_from_template.sql` — riga `opening_hours JSONB NOT NULL DEFAULT ...` nel `CREATE TABLE site_settings` (da aggiornare il default)

## Scope

### 1. Migrazione dati — SQL da eseguire nel SQL editor Supabase (schema `template`)

Applica questo SQL nel SQL editor come `service_role` per convertire il record esistente in `template.site_settings`:

```sql
UPDATE template.site_settings
SET opening_hours = (
  SELECT jsonb_object_agg(
    day_key,
    CASE
      WHEN (value->>'closed')::boolean = true THEN
        jsonb_build_object('closed', true, 'ranges', '[]'::jsonb)
      ELSE
        jsonb_build_object(
          'closed', false,
          'ranges', CASE
            WHEN (value->>'open') IS NOT NULL AND (value->>'close') IS NOT NULL
            THEN jsonb_build_array(
              jsonb_build_object('open', value->>'open', 'close', value->>'close')
            )
            ELSE '[]'::jsonb
          END
        )
    END
  )
  FROM jsonb_each(opening_hours) AS kv(day_key, value)
);
```

Verifica post-migrazione: `SELECT opening_hours FROM template.site_settings LIMIT 1;`

### 2. `docs/operations/create_schema_from_template.sql` — aggiorna il DEFAULT

Sostituisci il blocco `opening_hours JSONB NOT NULL DEFAULT '...'::jsonb` con la nuova struttura:

```sql
  opening_hours JSONB NOT NULL DEFAULT '{
    "monday":    {"closed": true, "ranges": []},
    "tuesday":   {"closed": true, "ranges": []},
    "wednesday": {"closed": true, "ranges": []},
    "thursday":  {"closed": true, "ranges": []},
    "friday":    {"closed": true, "ranges": []},
    "saturday":  {"closed": true, "ranges": []},
    "sunday":    {"closed": true, "ranges": []}
  }'::jsonb
```

### 3. `packages/supabase/src/schemas/settings.ts` — nuovo schema Zod

Sostituisci `OpeningHoursDaySchema` e `OpeningHoursSchema`:

```typescript
const OpeningHoursRangeSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  close: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
})

const OpeningHoursDaySchema = z.object({
  closed: z.boolean(),
  ranges: z.array(OpeningHoursRangeSchema).max(2),
})
```

Il tipo `OpeningHours` è derivato da `z.infer<typeof OpeningHoursSchema>` — si aggiorna automaticamente.

### 4. `packages/supabase/src/services/bookings.ts` — aggiorna il filtro turni

In `getAvailableTimeSlots`, sostituisci la logica di filtro per-giorno. La struttura di `dayHours` è cambiata: non ha più `open`/`close` diretti, ha `ranges: {open, close}[]`.

**Nuova logica:**
```typescript
const dayHours = hours?.[dayKey]
const ranges = dayHours?.ranges ?? []
const slots = (slotsRes.data ?? []).filter((slot) => {
  if (date === today && slot.time < currentTime) return false
  // se ranges è vuoto e il giorno non è closed, nessuna restrizione oraria
  if (ranges.length === 0) return true
  // il turno deve cadere all'interno di almeno una fascia
  return ranges.some((r) => slot.time >= r.open && slot.time < r.close)
})
```

Il check `if (hours?.[dayKey]?.closed === true) return []` prima del filtro rimane invariato.

Il tipo di `dayHours` — attualmente `OpeningHours[day]` — con il nuovo schema ha shape `{closed, ranges}`. Aggiusta l'import/type cast se necessario.

### 5. `apps/admin/app/dashboard/orari/_components/OpeningHoursForm.tsx` — nuovo form

Riscrivi il componente per supportare 1–2 fasce per giorno. Mantieni `'use client'`, `useActionState` e la struttura generale.

**Stato React:**
```typescript
type DayRange = { open: string; close: string }
type DayState = { closed: boolean; ranges: DayRange[] }
```
Lo stato iniziale si popola da `initialHours?.[day]` (nuova struttura `{closed, ranges}`). Default: `{ closed: true, ranges: [] }`.

**UX per giorno (non chiuso):**
- Riga 1: input Apertura + input Chiusura + pulsante "＋ Fascia" (visibile solo se `ranges.length < 2`)
- Riga 2 (se `ranges.length === 2`): input Apertura 2 + input Chiusura 2 + pulsante "✕" per rimuovere la seconda fascia

**FormData — campi per ogni giorno:**
- `{day}_closed` = `'true'` / `'false'` (come prima — hidden input)
- `{day}_ranges_count` = `'1'` o `'2'` (hidden input)
- `{day}_range_0_open`, `{day}_range_0_close`
- `{day}_range_1_open`, `{day}_range_1_close` (presenti solo se count = 2)

Usa lo stesso `Switch`, `Input`, `Label`, `Button` da `@repo/ui` che usa il form attuale.

### 6. `apps/admin/app/dashboard/orari/actions.ts` — aggiorna `updateOpeningHoursAction`

Sostituisci il loop di parsing per costruire la nuova struttura:

```typescript
for (const day of DAYS) {
  const closed = formData.get(`${day}_closed`) === 'true'
  const count = parseInt(formData.get(`${day}_ranges_count`) as string || '1', 10)
  const ranges: { open: string; close: string }[] = []
  if (!closed) {
    for (let i = 0; i < Math.min(count, 2); i++) {
      const open = formData.get(`${day}_range_${i}_open`) as string | null
      const close = formData.get(`${day}_range_${i}_close`) as string | null
      if (open && close) ranges.push({ open, close })
    }
  }
  hours[day] = { closed, ranges }
}
```

### 7. `apps/web/app/_components/OpeningHours.tsx` — aggiorna il tipo e il rendering

Il tipo locale `DayHours` cambia da `{open, close, closed}` a `{closed, ranges: {open, close}[]}`.

**Nuovo rendering per giorno:**
```typescript
const value =
  !day || day.closed || day.ranges.length === 0
    ? 'Chiuso'
    : day.ranges.map((r) => `${r.open} – ${r.close}`).join(' · ')
```

Esempio output: "Lunedì: 12:00 – 15:00 · 19:00 – 23:00"

## Vincoli

- **Nessun cambio di schema DB** (colonne o FK). La modifica è solo nella struttura JSONB e nel codice che la legge/scrive.
- **Nessuna nuova dipendenza npm.**
- Il check `closed === true` in `getAvailableTimeSlots` è invariato (ritorna `[]` per il giorno chiuso prima del filtro turni).
- Se `closed === false` e `ranges` è vuoto (caso di form inviato a vuoto), `getAvailableTimeSlots` non applica restrizioni orarie → tutti i turni attivi del giorno sono disponibili. È il comportamento sicuro.
- L'export `OpeningHours` da `@repo/supabase` (in `index.ts`) rimane invariato — è un tipo derivato da Zod, si aggiorna automaticamente.

## Output atteso

- SQL migrazione dati eseguito sul DB (`template.site_settings` aggiornato alla nuova struttura)
- `create_schema_from_template.sql` — DEFAULT `opening_hours` aggiornato
- `packages/supabase/src/schemas/settings.ts` — nuovo schema
- `packages/supabase/src/services/bookings.ts` — nuovo filtro
- `apps/admin/app/dashboard/orari/_components/OpeningHoursForm.tsx` — form riscritto
- `apps/admin/app/dashboard/orari/actions.ts` — action aggiornata
- `apps/web/app/_components/OpeningHours.tsx` — rendering aggiornato

## Done when

- `pnpm -r exec tsc --noEmit` exit 0
- Build `web` e `admin` verdi
- Nella sezione Orari dell'admin, per ogni giorno è possibile impostare 1 fascia (comportamento precedente) o 2 fasce separate; il salvataggio persiste correttamente
- La homepage pubblica mostra le 2 fasce separate (es. "12:00 – 15:00 · 19:00 – 23:00") per i giorni con orario spezzato
- `getAvailableTimeSlots` non restituisce turni fuori da tutte le fasce del giorno (es. un turno alle 17:00 non appare se le fasce sono 12–15 e 19–23)
- Giorni con `closed: true` continuano a restituire 0 slot (comportamento invariato)

## Note per la sub-chat

- Il SQL di migrazione va eseguito **manualmente da Lucio** nel SQL editor — includilo nel messaggio di completamento con istruzioni chiare su dove eseguirlo.
- Non introdurre logica "smart" sulle fasce (es. ordinamento automatico, merge di fasce sovrapposte) — il form è manuale e il gestore è responsabile dell'input corretto.
- Se trovi che il tipo `OpeningHours` importato in `bookings.ts` richiede aggiustamenti al cast `as OpeningHours | null | undefined`, applicali senza allargare lo scope.
