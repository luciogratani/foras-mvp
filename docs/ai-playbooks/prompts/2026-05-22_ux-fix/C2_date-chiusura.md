---
status: DONE
sprint: ux-fix
stream: C
task: C2
created: 2026-05-22
suggested_model: sonnet
suggested_effort: high
owner: master-chat
---

# UX-fix / C2 — Date di chiusura straordinaria (ferie, festività, serate private)

## Contesto

`foras-mvp` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase + shadcn/ui). Il freeze del template è posticipato per permettere alcuni fix pre-freeze. Questo è il secondo.

**Problema.** `opening_hours` in `site_settings` è ricorrente settimanale puro: non esiste il concetto di eccezione per data specifica. Se il locale è chiuso il 15 agosto per ferie, il sito **accetta prenotazioni** per quella data (conferma automatica inclusa). Il cliente riceve una conferma valida per un giorno a porte chiuse. Questo non è un fastidio UX: è un danno reale.

**Fix.** Aggiungere una tabella `closed_dates` (date di chiusura straordinaria) che (a) sovrascrive gli orari in homepage per quella data e (b) blocca le prenotazioni. Implementazione minima: data + motivo opzionale.

**Dipendenza da C1.** C2 è **indipendente da C1**: non tocca `opening_hours` né la sua struttura. Può essere eseguito in qualsiasi ordine rispetto a C1.

## File da leggere prima di iniziare

- `docs/operations/create_schema_from_template.sql` — struttura tabelle esistenti + sezione RLS + GRANT (da estendere)
- `packages/supabase/src/types/database.ts` — struttura dei tipi generati (da estendere manualmente con `closed_dates`)
- `packages/supabase/src/services/bookings.ts` — `getAvailableTimeSlots`: qui va aggiunto il check `closed_dates` (righe ~53–70)
- `packages/supabase/src/services/site-admin.ts` — pattern per le funzioni admin (da cui aggiungere le funzioni `closed_dates`)
- `packages/supabase/src/index.ts` — barrel exports (da aggiornare)
- `apps/admin/app/dashboard/orari/page.tsx` — pagina orari admin (da estendere con sezione chiusure)
- `apps/admin/app/dashboard/orari/actions.ts` — server actions orari (da estendere)

## Scope

### 1. SQL — nuova tabella `closed_dates` (da eseguire nel SQL editor Supabase, schema `template`)

Aggiungi dopo la tabella `bookings` in `create_schema_from_template.sql` e applica allo schema `template`:

```sql
-- Chiusure straordinarie (ferie, festività, serate private)
CREATE TABLE closed_dates (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date   DATE NOT NULL,
  reason TEXT,
  UNIQUE (date)
);

ALTER TABLE closed_dates ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON template.closed_dates TO anon, authenticated;
GRANT ALL    ON template.closed_dates TO authenticated;

CREATE POLICY "closed_dates_public_read"
  ON closed_dates FOR SELECT USING (true);

CREATE POLICY "closed_dates_admin_all"
  ON closed_dates FOR ALL USING (auth.uid() IS NOT NULL);
```

### 2. `packages/supabase/src/types/database.ts` — aggiunta manuale del tipo `closed_dates`

Il file è generato ma va aggiornato a mano (il generatore via `postgres-meta` non si riesegue qui). Aggiungi la voce `closed_dates` nell'oggetto `Tables` del tipo `template`, seguendo esattamente lo stesso pattern delle altre tabelle:

```typescript
closed_dates: {
  Row: {
    date: string        // formato 'YYYY-MM-DD'
    id: string
    reason: string | null
  }
  Insert: {
    date: string
    id?: string
    reason?: string | null
  }
  Update: {
    date?: string
    id?: string
    reason?: string | null
  }
  Relationships: []
}
```

Inseriscila **prima di `menu_categories`** (ordine alfabetico, coerente con il file).

### 3. `packages/supabase/src/services/bookings.ts` — blocco prenotazioni su date chiuse

In `getAvailableTimeSlots`, aggiungi la query `closed_dates` al `Promise.all` esistente:

```typescript
const [slotsRes, bookedRes, settingsRes, closedDateRes] = await Promise.all([
  client.from('time_slots').select('*').eq('is_active', true).order('time', { ascending: true }),
  client.from('bookings').select('time_slot_id, covers').eq('date', date).eq('status', 'confirmed'),
  client.from('site_settings').select('opening_hours').limit(1).maybeSingle(),
  client.from('closed_dates').select('id').eq('date', date).limit(1).maybeSingle(),
])

if (slotsRes.error)      throw new Error(`getAvailableTimeSlots (slots) failed: ${slotsRes.error.message}`)
if (bookedRes.error)     throw new Error(`getAvailableTimeSlots (bookings) failed: ${bookedRes.error.message}`)
if (settingsRes.error)   throw new Error(`getAvailableTimeSlots (settings) failed: ${settingsRes.error.message}`)
if (closedDateRes.error) throw new Error(`getAvailableTimeSlots (closed_dates) failed: ${closedDateRes.error.message}`)

// data chiusa straordinariamente → nessun turno disponibile
if (closedDateRes.data) return []
```

Inserisci il `return []` **dopo** il check `date < today` e **prima** del check `opening_hours.closed`. L'ordine dei guard è: passato → data chiusa → giorno chiuso ricorrente → filtro orario.

**Nota:** `getAvailableTimeSlots` è già chiamato dentro `createBooking`, quindi il blocco prenotazioni funziona automaticamente senza toccare `createBooking`.

### 4. `packages/supabase/src/services/site-admin.ts` — nuove funzioni `closed_dates`

Aggiungi in fondo al file (non toccare le funzioni esistenti):

```typescript
export type ClosedDate = Tables<{ schema: 'template' }, 'closed_dates'>

export async function getClosedDates(client: TenantClient): Promise<ClosedDate[]> {
  const { data, error } = await client
    .from('closed_dates')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw new Error(`getClosedDates failed: ${error.message}`)
  return data ?? []
}

export async function addClosedDate(
  client: TenantClient,
  date: string,
  reason?: string
): Promise<ClosedDate> {
  const { data, error } = await client
    .from('closed_dates')
    .insert({ date, reason: reason ?? null })
    .select('*')
    .single()
  if (error) throw new Error(`addClosedDate failed: ${error.message}`)
  return data
}

export async function removeClosedDate(client: TenantClient, id: string): Promise<void> {
  const { error } = await client.from('closed_dates').delete().eq('id', id)
  if (error) throw new Error(`removeClosedDate failed: ${error.message}`)
}
```

### 5. `packages/supabase/src/index.ts` — aggiorna exports

Aggiungi al barrel:

```typescript
export { getClosedDates, addClosedDate, removeClosedDate } from './services/site-admin'
export type { ClosedDate } from './services/site-admin'
```

### 6. `apps/admin/app/dashboard/orari/actions.ts` — nuove server actions

Aggiungi in fondo (non toccare le actions esistenti):

```typescript
export async function addClosedDateAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const date = formData.get('date') as string
  const reason = (formData.get('reason') as string) || undefined
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { status: 'error', message: 'Data non valida.' }
  }
  try {
    await addClosedDate(tenant, date, reason)
    revalidatePath('/dashboard/orari')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Data già presente o errore di salvataggio.' }
  }
}

export async function removeClosedDateAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { tenant } = await requireTenantClient()
  const id = formData.get('id') as string
  try {
    await removeClosedDate(tenant, id)
    revalidatePath('/dashboard/orari')
    return { status: 'success' }
  } catch {
    return { status: 'error', message: 'Rimozione fallita. Riprova.' }
  }
}
```

Aggiorna gli import in cima al file per includere `addClosedDate`, `removeClosedDate` da `@repo/supabase`.

### 7. `apps/admin/app/dashboard/orari/page.tsx` — nuova sezione "Chiusure straordinarie"

Aggiungi una terza sezione alla pagina (dopo "Turni disponibili" e prima/dopo "Orari di apertura" — scegli l'ordine più logico visivamente).

La sezione mostra:
- **Titolo:** "Chiusure straordinarie"
- **Sottotitolo:** "Giorni in cui il locale è chiuso (ferie, festività, serate private). Le prenotazioni per queste date vengono bloccate automaticamente."
- **Lista** delle chiusure esistenti (da `getClosedDates`): per ogni riga → data formattata (es. "15 agosto 2026") + motivo (se presente) + pulsante "Rimuovi"
- **Form di aggiunta**: campo data (`<input type="date">`) + campo motivo opzionale (text, max 100 char) + pulsante "Aggiungi"

Crea un componente client `_components/ClosedDatesManager.tsx` (con `useActionState` su `addClosedDateAction` e `removeClosedDateAction`) sul pattern dei form esistenti in `apps/admin`. La lista chiusure viene passata come prop (`initialClosedDates`) e rivalidata via `revalidatePath` nelle actions.

Formatta la data in italiano con `new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date + 'T12:00:00'))` (il T12:00:00 evita lo shift UTC).

## Vincoli

- **Il check `closed_dates` è il secondo guard in `getAvailableTimeSlots`**, dopo il check "data passata" e prima del check `opening_hours.closed`. L'ordine garantisce che una data chiusa straordinariamente blocchi tutto, indipendentemente dagli orari settimanali.
- **`createBooking` non va toccato**: chiama già `getAvailableTimeSlots` e il blocco si propaga automaticamente.
- **Nessuna nuova dipendenza npm.**
- Il campo `reason` è opzionale sia nel form sia nel DB — non forzare validazione.
- La policy RLS `closed_dates_public_read` permette SELECT anche ad `anon` — necessario perché `getAvailableTimeSlots` usa un client privilegiato ma è chiamato anche lato pubblico.

## Output atteso

- SQL eseguito su `template` (tabella `closed_dates` creata con RLS + GRANT)
- `create_schema_from_template.sql` aggiornato con la nuova tabella
- `packages/supabase/src/types/database.ts` — tipo `closed_dates` aggiunto
- `packages/supabase/src/services/bookings.ts` — guard `closed_dates` in `getAvailableTimeSlots`
- `packages/supabase/src/services/site-admin.ts` — funzioni `getClosedDates`, `addClosedDate`, `removeClosedDate`
- `packages/supabase/src/index.ts` — exports aggiornati
- `apps/admin/app/dashboard/orari/actions.ts` — `addClosedDateAction`, `removeClosedDateAction`
- `apps/admin/app/dashboard/orari/_components/ClosedDatesManager.tsx` — componente client
- `apps/admin/app/dashboard/orari/page.tsx` — sezione "Chiusure straordinarie"

## Done when

- `pnpm -r exec tsc --noEmit` exit 0
- Build `web` e `admin` verdi
- Selezionando una data in `closed_dates` nella pagina `/booking`, il form mostra "Nessun turno disponibile" (zero slot restituiti da `getAvailableTimeSlots`)
- L'admin può aggiungere e rimuovere chiusure dalla sezione "Chiusure straordinarie" in `/dashboard/orari`
- Una chiusura aggiunta si riflette immediatamente (dopo `revalidatePath`) sulla lista

## Note per la sub-chat

- Il SQL di aggiunta tabella va eseguito **manualmente da Lucio** nel SQL editor — includilo nel messaggio di completamento con istruzioni chiare.
- Il tipo `database.ts` è aggiornato a mano (non rigenerare via `postgres-meta`): inserisci `closed_dates` nell'ordine alfabetico nel blocco `Tables`.
- Se la pagina orari admin ha già sezioni con titoli (`<h2>` o simili), allinea lo stile della nuova sezione a quello esistente.
