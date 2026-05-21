---
task: sprint5-05
date: 2026-05-22
---

# Sub-task 05 — Orari, turni e impostazioni sito

Sei una sub-chat di esecuzione. Non committare. Il master fa trust-but-verify e commita.

## Contesto

Monorepo pnpm. Stack: Next.js 15 App Router, Supabase multi-tenant (ogni tenant ha il proprio schema PostgreSQL), TypeScript strict, Tailwind + shadcn/ui tramite `@repo/ui`.

Pattern consolidato:
- **Service layer**: `packages/supabase/src/services/` — firma `(client: TenantClient, ...args)`, error wrap `throw new Error('<fn> failed: ' + error.message)`, `.select('*').single()` su create/update
- **Zod**: `packages/supabase/src/schemas/` — `z.coerce.number()` per campi numerici da FormData
- **Server Actions `'use server'`**: `requireTenantClient()` da `'../../../lib/auth'` → Zod safeParse → service → `revalidatePath` → return `ActionState`
- **Client components**: `useActionState` da `'react'`, `useEffect(() => setX(prop), [prop])` per sync prop→state dopo revalidatePath
- **`export const dynamic = 'force-dynamic'`** su ogni page.tsx che fa fetch
- **Primitivi UI**: tutti in `@repo/ui` — Button, Input, Label, Textarea, Switch, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter già disponibili

## File da leggere PRIMA di scrivere qualsiasi codice

```
packages/supabase/src/services/site.ts        # INVARIANTE — leggi per non rompere
packages/supabase/src/services/news.ts        # pattern service admin
packages/supabase/src/schemas/news.ts         # pattern Zod
packages/supabase/src/index.ts                # barrel — verifica export già presenti
apps/admin/app/dashboard/news/actions.ts      # pattern azioni (incluso toggle discriminant)
apps/admin/app/dashboard/news/_components/SlideCard.tsx  # pattern toggle form
apps/admin/app/dashboard/news/_components/EditSlideDialog.tsx
apps/admin/app/dashboard/news/_components/DeleteSlideDialog.tsx
docs/tech-architecture/data-model.md          # schema time_slots + site_settings
docs/operations/create_schema_from_template.sql  # colonne esatte
```

## Invarianti — NON TOCCARE

- `packages/supabase/src/services/site.ts` — le funzioni `getSiteSettings` e `getActiveNews` **non devono essere modificate né spostate**
- `apps/web/**` — mai toccare
- `TimeSlot` e `SiteSettings` sono già esportati nel barrel — usa alias per le varianti admin (vedi sotto)
- Nessuna query DB fuori da `@repo/supabase`

---

## Schema di riferimento

### `time_slots`
```
id          uuid PK
label       text NOT NULL            (es. "Pranzo")
time        time NOT NULL            (es. "12:30:00" — Postgres TIME)
max_covers  integer NOT NULL
is_active   boolean NOT NULL DEFAULT true
```
**Nessun campo `position`** — nessun DnD. Ordinare per `time ASC`.

### `site_settings` (riga unica per tenant, sempre presente per seed)
```
id            uuid PK
title         text
description   text
og_image      text nullable
slogan        text nullable
bio           text nullable
address       text nullable
phone         text nullable
email         text nullable
opening_hours jsonb NOT NULL DEFAULT '{ ... 7 giorni closed: true }'
```

Struttura `opening_hours`:
```json
{
  "monday":    { "open": "08:00", "close": "22:00", "closed": false },
  "tuesday":   { "open": "08:00", "close": "22:00", "closed": false },
  ...
  "sunday":    { "open": null, "close": null, "closed": true }
}
```
Chiavi fisse: `monday tuesday wednesday thursday friday saturday sunday`.

---

## File da creare

### 1. `packages/supabase/src/services/site-admin.ts`

```ts
import type { Tables } from '../types/database'
import type { TenantClient } from '../index'
import type { SiteSettings } from './site'
import type { SiteSettingsUpdate } from '../schemas/settings'

export type TimeSlotAdmin = Tables<{ schema: 'template' }, 'time_slots'>

export async function getTimeSlotsAdmin(client: TenantClient): Promise<TimeSlotAdmin[]>
// .from('time_slots').select('*').order('time', { ascending: true })

export async function createTimeSlot(client: TenantClient, input: TimeSlotCreate): Promise<TimeSlotAdmin>
// .insert(input).select('*').single()

export async function updateTimeSlot(client: TenantClient, id: string, patch: TimeSlotUpdate): Promise<TimeSlotAdmin>
// .update(patch).eq('id', id).select('*').single()

export async function deleteTimeSlot(client: TenantClient, id: string): Promise<void>
// .delete().eq('id', id)

export async function updateSiteSettings(client: TenantClient, patch: SiteSettingsUpdate): Promise<SiteSettings>
// .update(patch).select('*').single()
// NOTA: no .eq() — riga unica per tenant, safe senza filtro
```

Importa `TimeSlotCreate` / `TimeSlotUpdate` da `'../schemas/settings'`.

### 2. `packages/supabase/src/schemas/settings.ts`

```ts
import { z } from 'zod'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
type Day = (typeof DAYS)[number]

const OpeningHoursDaySchema = z.object({
  open: z.string().nullable(),
  close: z.string().nullable(),
  closed: z.boolean(),
})

export const OpeningHoursSchema = z.object(
  Object.fromEntries(DAYS.map((d) => [d, OpeningHoursDaySchema])) as Record<Day, typeof OpeningHoursDaySchema>
)
export type OpeningHours = z.infer<typeof OpeningHoursSchema>

export const TimeSlotCreateSchema = z.object({
  label: z.string().min(1, 'Il nome è obbligatorio'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  max_covers: z.coerce.number().int().positive('Deve essere almeno 1'),
  is_active: z.boolean().optional(),
})
export const TimeSlotUpdateSchema = TimeSlotCreateSchema.partial()
export type TimeSlotCreate = z.infer<typeof TimeSlotCreateSchema>
export type TimeSlotUpdate = z.infer<typeof TimeSlotUpdateSchema>

export const SiteSettingsUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  og_image: z.string().url('URL non valido').nullable().optional(),
  slogan: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Email non valida').nullable().optional(),
  opening_hours: OpeningHoursSchema.optional(),
})
export type SiteSettingsUpdate = z.infer<typeof SiteSettingsUpdateSchema>
```

### 3. Aggiornamento barrel `packages/supabase/src/index.ts`

Aggiungi in coda (non toccare le righe esistenti):

```ts
export { getTimeSlotsAdmin, createTimeSlot, updateTimeSlot, deleteTimeSlot, updateSiteSettings } from './services/site-admin'
export type { TimeSlotAdmin } from './services/site-admin'
export { TimeSlotCreateSchema, TimeSlotUpdateSchema, SiteSettingsUpdateSchema, OpeningHoursSchema } from './schemas/settings'
export type { TimeSlotCreate, TimeSlotUpdate, SiteSettingsUpdate, OpeningHours } from './schemas/settings'
```

**Attenzione**: `TimeSlot` (senza Admin) e `SiteSettings` sono già nel barrel — non ri-esportare quei nomi.

---

## Pagina 1 — `/dashboard/orari`

### `apps/admin/app/dashboard/orari/actions.ts`

```ts
'use server'
// ...
export type SettingsActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

// Crea turno
export async function createTimeSlotAction(_prev: SettingsActionState, formData: FormData): Promise<SettingsActionState>
// raw = { label, time, max_covers: formData.get('max_covers'), is_active: formData.get('is_active') === 'true' }
// TimeSlotCreateSchema.safeParse → createTimeSlot → revalidatePath('/dashboard/orari')

// Toggle + edit (discriminant: se label è presente → edit completo, altrimenti toggle only)
export async function updateTimeSlotAction(_prev: SettingsActionState, formData: FormData): Promise<SettingsActionState>
// Stesso pattern di updateSlideAction/updateItemAction: if (formData.get('label') !== null) → full edit

// Elimina turno
export async function deleteTimeSlotAction(_prev: SettingsActionState, formData: FormData): Promise<SettingsActionState>

// Aggiorna opening_hours
export async function updateOpeningHoursAction(_prev: SettingsActionState, formData: FormData): Promise<SettingsActionState>
// Ricostruisci l'oggetto JSON dai campi flat:
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const hours: Record<string, unknown> = {}
for (const day of DAYS) {
  const closed = formData.get(`${day}_closed`) === 'true'
  hours[day] = {
    closed,
    open:  closed ? null : formData.get(`${day}_open`)  || null,
    close: closed ? null : formData.get(`${day}_close`) || null,
  }
}
// OpeningHoursSchema.safeParse(hours) → updateSiteSettings(tenant, { opening_hours: parsed.data })
// revalidatePath('/dashboard/orari')
```

### `apps/admin/app/dashboard/orari/page.tsx`

```tsx
export const dynamic = 'force-dynamic'

export default async function OrariPage() {
  const { tenant } = await requireTenantClient()
  const [settings, slots] = await Promise.all([
    getSiteSettings(tenant),  // import from '@repo/supabase' (funzione pubblica, ok usarla)
    getTimeSlotsAdmin(tenant),
  ])

  return (
    <div className="space-y-10 p-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Orari di apertura</h1>
        <OpeningHoursForm initialHours={settings?.opening_hours ?? null} />
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Turni prenotazione</h2>
          <CreateTimeSlotButton />
        </div>
        <TimeSlotList slots={slots} />
      </section>
    </div>
  )
}
```

### `apps/admin/app/dashboard/orari/_components/OpeningHoursForm.tsx`

Componente client. Accetta `initialHours: OpeningHours | null`.

UI: 7 righe, una per giorno. Ogni riga:
- Label giorno (es. "Lunedì")
- Switch "Chiuso" — controlla lo stato locale `closed[day]`
- Input `type="time"` per "Apertura" — disabled se `closed[day]`
- Input `type="time"` per "Chiusura" — disabled se `closed[day]`

State locale: `const [closed, setClosed] = useState<Record<Day, boolean>>(...)` inizializzato da `initialHours`.

La form invia 21 campi flat (`monday_closed`, `monday_open`, `monday_close`, ...). I Switch cambiano lo stato locale (e un hidden input riflette il valore `'true'/'false'`). Tutti i 21 input hanno il rispettivo `name`.

Nota sul formato `time`: il DB restituisce `"HH:MM:SS"` — usa `defaultValue={slot.open?.substring(0, 5) ?? ''}`.

useActionState(updateOpeningHoursAction). Mostra messaggio di successo/errore inline dopo submit.

Mappatura giorni IT:
```ts
const DAY_LABELS: Record<Day, string> = {
  monday: 'Lunedì', tuesday: 'Martedì', wednesday: 'Mercoledì',
  thursday: 'Giovedì', friday: 'Venerdì', saturday: 'Sabato', sunday: 'Domenica',
}
```

### `apps/admin/app/dashboard/orari/_components/TimeSlotList.tsx`

Componente client semplice (NO DnD). Props: `{ slots: TimeSlotAdmin[] }`. Usa `useEffect(() => setSlots(slots), [slots])`.

Se `slots.length === 0`: mostra `<p>Nessun turno. Aggiungine uno.</p>`.

Altrimenti `<ul>` di `<TimeSlotCard>`.

### `apps/admin/app/dashboard/orari/_components/TimeSlotCard.tsx`

Componente client. Pattern identico a `SlideCard.tsx`:
- useActionState(updateTimeSlotAction) per toggle `is_active`
- useState(editOpen), useState(deleteOpen) per dialoghi
- Display: `label` + orario formattato (`slot.time.substring(0, 5)`) + badge coperti (`max_covers coperti`)
- Switch is_active con form ref (hidden inputs: `id`, `is_active`)
- Bottoni "Modifica" e "Elimina"

### `apps/admin/app/dashboard/orari/_components/CreateTimeSlotButton.tsx`

Client wrapper con `useState(open)`. Renderizza `<CreateTimeSlotDialog>` quando `open`.

### `apps/admin/app/dashboard/orari/_components/CreateTimeSlotDialog.tsx`

Dialog con form: label (Input, required), time (Input type="time", required), max_covers (Input type="number" min="1", required), is_active Switch. useActionState(createTimeSlotAction), chiude su success.

### `apps/admin/app/dashboard/orari/_components/EditTimeSlotDialog.tsx`

Come Create ma pre-popola i campi da `slot`. Hidden input `id`. Discriminant funziona perché `label` è sempre presente nel form.

Nota: `defaultValue` per `time` → `slot.time.substring(0, 5)`.

### `apps/admin/app/dashboard/orari/_components/DeleteTimeSlotDialog.tsx`

Identico al pattern `DeleteSlideDialog.tsx`. DialogDescription cita `slot.label`.

---

## Pagina 2 — `/dashboard/impostazioni`

### `apps/admin/app/dashboard/impostazioni/actions.ts`

```ts
'use server'
export type SettingsActionState = ...  // stesso tipo

export async function updateSiteSettingsAction(_prev: SettingsActionState, formData: FormData): Promise<SettingsActionState>
// raw = {
//   title:       formData.get('title')       || undefined,
//   description: formData.get('description') || undefined,
//   og_image:    formData.get('og_image')    || null,
//   slogan:      formData.get('slogan')      || null,
//   bio:         formData.get('bio')         || null,
//   address:     formData.get('address')     || null,
//   phone:       formData.get('phone')       || null,
//   email:       formData.get('email')       || null,
// }
// SiteSettingsUpdateSchema.safeParse(raw) → updateSiteSettings(tenant, parsed.data)
// revalidatePath('/dashboard/impostazioni')
```

### `apps/admin/app/dashboard/impostazioni/page.tsx`

```tsx
export const dynamic = 'force-dynamic'

export default async function ImpostazioniPage() {
  const { tenant } = await requireTenantClient()
  const settings = await getSiteSettings(tenant)

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Impostazioni sito</h1>
      <SiteSettingsForm settings={settings} />
    </div>
  )
}
```

### `apps/admin/app/dashboard/impostazioni/_components/SiteSettingsForm.tsx`

Componente client. Props: `{ settings: SiteSettings | null }`.

Form con 8 campi (no `opening_hours` qui — è in `/dashboard/orari`):

| Campo | Componente | Note |
|---|---|---|
| `title` | Input | required |
| `description` | Textarea rows={3} | required |
| `og_image` | Input type="url" | opzionale, placeholder URL |
| `slogan` | Input | opzionale |
| `bio` | Textarea rows={4} | opzionale |
| `address` | Input | opzionale |
| `phone` | Input type="tel" | opzionale |
| `email` | Input type="email" | opzionale |

Tutti con `defaultValue={settings?.campo ?? ''}`.

useActionState(updateSiteSettingsAction). Mostra messaggio di successo "Impostazioni salvate." o errore inline dopo submit. Bottone "Salva" con stato "Salvataggio…" durante isPending.

---

## Checklist di conformità

Prima di consegnare, verifica:

- [ ] `services/site.ts` non è stato modificato
- [ ] `apps/web/**` non è stato toccato
- [ ] Il barrel non ri-esporta `TimeSlot` o `SiteSettings` (già presenti)
- [ ] `requireTenantClient()` importato da `'../../../lib/auth'` (o `'../../lib/auth'` per le pagine a 2 livelli — conta i livelli)
- [ ] Ogni page.tsx ha `export const dynamic = 'force-dynamic'`
- [ ] `useActionState` importato da `'react'` (non da `'react-dom'`)
- [ ] `revalidatePath` chiamato nelle action con il path corretto (`'/dashboard/orari'` o `'/dashboard/impostazioni'`)
- [ ] `pnpm -r exec tsc --noEmit` → zero errori

**Non committare.**
