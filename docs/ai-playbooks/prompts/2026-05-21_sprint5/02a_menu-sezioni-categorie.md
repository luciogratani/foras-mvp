---
status: DONE
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 5
order: 2
suborder: a
tags: [foras-mvp, sprint5, admin, crud, menu, service-layer]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: high
---

# Sprint 5 / 2a of 6 — CRUD menu: sezioni + categorie

## Contesto

Secondo sub-task di Sprint 5 (admin panel). Il `01` ha già messo in piedi: baseline Tailwind/shadcn in `apps/admin`, la shell `/dashboard/*` con sidebar nav, le primitive `@repo/ui` (`Button`, `Input`, `Label`, `Card`, `Dialog`, `Tabs`, `Skeleton`), e l'helper server **`requireTenantClient()`** in `apps/admin/lib/auth.ts` (ritorna `{ tenant, user }`, redirige se non autorizzato). La route `/dashboard/menu` esiste come **stub** (`apps/admin/app/dashboard/menu/page.tsx`) — questo sub-task la sostituisce.

Il `02` (CRUD menu) è stato **splittato dal master** in `02a` (sezioni + categorie, questo) e `02b` (item + allergeni, prossimo) per tenere le review trattabili. **Gli item NON si toccano qui** — la gerarchia che gestisci è `Section → Category`. Gli item arrivano nel `02b`, dentro la stessa shell.

**Stato del menu nello schema `template`** (verificato in `docs/operations/create_schema_from_template.sql`):
- `menu_sections`: **6 sezioni seed predefinite** (Colazione/Pranzo/Aperitivo/Cena attive; Cocktail/Carta dei vini inattive). Il gestore **può solo rinominarle, attivarle/disattivarle e (in 03) riordinarle — NON crearne né cancellarne** (vincolo data-model: "non può crearne di nuove from scratch").
- `menu_categories`: vuota — **CRUD completo** (create/update/delete).
- FK: `menu_categories.section_id → menu_sections(id) ON DELETE CASCADE`; `menu_items.category_id → menu_categories(id) ON DELETE CASCADE`. **Conseguenza: cancellare una categoria cancella in cascata i suoi item.** Da avvisare in UI.
- RLS: `menu_*_admin_all FOR ALL USING (auth.uid() IS NOT NULL)` + GRANT INSERT/UPDATE/DELETE a `authenticated`. Il `tenant` di `requireTenantClient()` (anon key + access token utente) scrive come `authenticated` → **funziona, nessuna modifica DB**.

**Decisione master (decision-log 2026-05-21 — Sprint 5):** slice verticali (service + UI insieme); **niente drag-and-drop qui** (è il `03`: ordinamento alfabetico per ora, `position` resta `NULL` sulle nuove categorie); immagini fuori scope (sono sugli item, `02b`).

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voci *2026-05-21 — Sprint 5 (Admin panel)*, *Service layer — funzioni ricevono il client*, *Struttura del menu*
- `docs/tech-architecture/data-model.md` — sezioni "Schema menu" e "Ordinamento — convenzione condivisa"
- `docs/operations/create_schema_from_template.sql` — tabelle `menu_sections`/`menu_categories`, RLS, seed (le 6 sezioni)
- `docs/ai-playbooks/prompts/2026-05-21_sprint5/01_admin-ui-baseline-shell.md` — cosa ha creato il 01 (shell, `requireTenantClient`)
- `apps/admin/lib/auth.ts` — `requireTenantClient(): Promise<{ tenant, user }>`
- `apps/admin/app/dashboard/page.tsx` — esempio d'uso di `requireTenantClient` + `Card`
- `apps/admin/app/dashboard/layout.tsx` — shell/nav (non toccare)
- `apps/web/app/booking/actions.ts` + `apps/web/app/booking/_components/BookingForm.tsx` — **pattern di riferimento** per Server Action + `useActionState` (React 19) + mapping errori → messaggi IT
- `packages/supabase/src/services/menu.ts` — funzioni read esistenti (`getMenuSections`/`getMenuBySection`/`getAllergens`) — **estendi questo file**, non riscriverlo
- `packages/supabase/src/schemas/bookings.ts` — pattern Zod schema (mirror per `schemas/menu.ts`)
- `packages/supabase/src/index.ts` — barrel esportazioni (da estendere)
- `packages/ui/src/index.ts` — primitive disponibili

## Scope

### 1. Service layer — `packages/supabase/src/services/menu.ts` (estendere)

Le funzioni read esistenti filtrano `is_active = true`: **non toccarle** (le usa la homepage pubblica). Aggiungere funzioni **admin** (non filtrate) e **write**. Firma uniforme `(client: TenantClient, ...args)` (decision-log *Service layer — funzioni ricevono il client*).

Admin-read (includono i disattivati):
```ts
export async function getMenuSectionsAdmin(client: TenantClient): Promise<MenuSection[]>
// tutte le sezioni, order by position asc NULLS LAST, poi name asc

export async function getMenuCategoriesAdmin(client: TenantClient, sectionId: string): Promise<MenuCategory[]>
// tutte le categorie della sezione, stesso ordinamento
```

Write — sezioni (**solo update**, niente create/delete):
```ts
export async function updateMenuSection(
  client: TenantClient,
  id: string,
  patch: MenuSectionUpdate   // tipo inferito dallo schema Zod (vedi punto 2)
): Promise<MenuSection>
```

Write — categorie (**CRUD completo**):
```ts
export async function createMenuCategory(client: TenantClient, input: MenuCategoryCreate): Promise<MenuCategory>
export async function updateMenuCategory(client: TenantClient, id: string, patch: MenuCategoryUpdate): Promise<MenuCategory>
export async function deleteMenuCategory(client: TenantClient, id: string): Promise<void>
```

- Pattern errori identico all'esistente: `if (error) throw new Error('<fn> failed: ' + error.message)`.
- `update`/`create` fanno `.select('*').single()` e ritornano la riga aggiornata/creata.
- `delete`: `.delete().eq('id', id)`; se `error` → throw. (La cascade sugli item è gestita dal DB.)
- **Ordinamento**: `position` non viene gestito qui (è il `03`). Le nuove categorie nascono con `position` non impostato (→ `NULL`, in coda alfabetica). Le funzioni accettano comunque `position?: number | null` nel tipo input (servirà al `03`), ma la UI di `02a` non lo espone.
- **I service NON validano con Zod** (ricevono input già tipato): la validazione vive nelle Server Action al boundary `FormData` (vedi punto 3). Questo è coerente con la firma "client + typed args".

### 2. Zod schemas — `packages/supabase/src/schemas/menu.ts` (nuovo)

Mirror di `schemas/bookings.ts`. Definire e **inferire i tipi** dagli schema (single source):
```ts
import { z } from 'zod'

export const MenuSectionUpdateSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio').optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
})
export const MenuCategoryCreateSchema = z.object({
  section_id: z.string().uuid(),
  name: z.string().min(1, 'Il nome è obbligatorio'),
  is_active: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
})
export const MenuCategoryUpdateSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio').optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
  section_id: z.string().uuid().optional(),
})

export type MenuSectionUpdate = z.infer<typeof MenuSectionUpdateSchema>
export type MenuCategoryCreate = z.infer<typeof MenuCategoryCreateSchema>
export type MenuCategoryUpdate = z.infer<typeof MenuCategoryUpdateSchema>
```
(`zod` è già `dependencies` di `@repo/supabase` dallo Sprint 2.) Aggiungere l'export da `packages/supabase/src/schemas/index.ts` se quel barrel esiste e segue il pattern.

### 3. Barrel `@repo/supabase` — `packages/supabase/src/index.ts`

Aggiungere export per le nuove funzioni e i nuovi tipi/schema, **preservando** gli esistenti:
```ts
export {
  getMenuSectionsAdmin,
  getMenuCategoriesAdmin,
  updateMenuSection,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} from './services/menu'
export {
  MenuSectionUpdateSchema,
  MenuCategoryCreateSchema,
  MenuCategoryUpdateSchema,
} from './schemas/menu'
export type { MenuSectionUpdate, MenuCategoryCreate, MenuCategoryUpdate } from './schemas/menu'
```

### 4. Primitive UI mancante — `Switch` in `@repo/ui`

Per il toggle attivo/inattivo serve `Switch`. Aggiungerlo **da dentro `packages/ui`** (lezione Sprint 3: l'alias `@repo/ui` fa sbagliare il path alla CLI):
```bash
cd packages/ui && pnpm dlx shadcn@latest add switch
```
Verificare che finisca in `packages/ui/src/components/ui/switch.tsx` (spostare a mano se path doppio). Esportare da `packages/ui/src/index.ts`: `export { Switch } from './components/ui/switch'`. **Non aggiungere altre primitive** (textarea/checkbox sono nel `02b`).

### 5. UI — `apps/admin/app/dashboard/menu/`

Sostituire lo stub. Struttura:

**`page.tsx`** (Server Component, `export const dynamic = 'force-dynamic'`):
- `const { tenant } = await requireTenantClient()`
- `getMenuSectionsAdmin(tenant)`, poi per ogni sezione `getMenuCategoriesAdmin(tenant, section.id)` (`Promise.all` — sono 6 sezioni, costo trascurabile)
- Rende la lista sezioni; ogni sezione mostra: nome, stato attivo/inattivo, le sue categorie, e i controlli (rinomina, toggle, gestione categorie). Le sezioni disattivate visivamente distinte (es. opacità/badge), ma comunque mostrate (è admin).

**`actions.ts`** (`'use server'`): una Server Action per operazione. Ognuna:
1. `const { tenant } = await requireTenantClient()`
2. estrae i campi da `FormData`, `safeParse` con lo schema Zod → su errore ritorna `{ status: 'error', message }`
3. chiama il service
4. `revalidatePath('/dashboard/menu')`
5. ritorna `{ status: 'success' }` (o lo stato per `useActionState`)

Azioni: `updateSectionAction` (rinomina + toggle), `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`. Tipizzare uno `ActionState` come in `apps/web/app/booking/actions.ts`.

**`_components/`** (Client Components, `'use client'`, `useActionState`):
- toggle `is_active` sezione/categoria con `Switch` (submit immediato via form/action)
- rinomina sezione (inline o `Dialog`)
- create/edit categoria via `Dialog` + form (`Input` nome, `Switch` attivo)
- delete categoria con **conferma esplicita** (`Dialog`) che **avvisa che gli item collegati verranno eliminati** (cascade)
- mostrare i messaggi d'errore/successo dell'action (pattern booking)

> Non serve toast: usare messaggi inline come in `BookingForm`. Mantieni la UI sobria (niente palette custom — è Sprint 7).

### 6. Propagazione alla homepage

La homepage pubblica (`apps/web/app/page.tsx`) è `force-dynamic` → rilegge il DB ad ogni richiesta. Nessun `revalidatePath('/')` necessario. Il `revalidatePath('/dashboard/menu')` serve solo a rinfrescare la pagina admin dopo una mutation.

## Vincoli

- **Niente query DB nei componenti**: tutto via i service di `@repo/supabase`. Le Server Action ottengono il client da `requireTenantClient()` e lo passano ai service.
- **Sezioni: solo update.** Niente UI/azione di create o delete sezione (vincolo data-model — sono seed predefiniti).
- **Niente drag-and-drop / gestione `position` in UI** (è il `03`). Ordinamento attuale: `position` asc NULLS LAST, poi `name`.
- **Niente item** (è il `02b`). Non toccare `menu_items` né `getMenuBySection`/`getMenuSections`/`getAllergens` esistenti.
- **Nessuna modifica DB**, nessun file SQL, nessuna rigenerazione tipi (lo schema è invariato).
- **Non toccare** `apps/web/*`, `apps/admin/app/dashboard/layout.tsx`, `apps/admin/lib/auth.ts` (a parte usarlo), `proxy.ts`, `docs/*` (a parte il frontmatter di questo prompt).
- **Nessuna dipendenza nuova** oltre alla primitiva `Switch` (che non aggiunge runtime dep oltre a quelle già in `@repo/ui`). Niente `@dnd-kit`.
- React 19: Server Components di default; `'use client'` solo dove serve interattività. `useActionState` da `'react'`.

## Output atteso

- `packages/supabase/src/services/menu.ts` (esteso: 2 admin-read + 4 write)
- `packages/supabase/src/schemas/menu.ts` (nuovo: 3 schema + 3 tipi)
- `packages/supabase/src/schemas/index.ts` (export, se il barrel esiste)
- `packages/supabase/src/index.ts` (export estesi, esistenti preservati)
- `packages/ui/src/components/ui/switch.tsx` (da shadcn add) + export in `packages/ui/src/index.ts`
- `apps/admin/app/dashboard/menu/page.tsx` (riscritto da stub)
- `apps/admin/app/dashboard/menu/actions.ts` (nuovo)
- `apps/admin/app/dashboard/menu/_components/*.tsx` (client components)
- `pnpm-lock.yaml` se la CLI shadcn aggiunge qualcosa
- Nessun altro file modificato

## Done when

- `pnpm -r exec tsc --noEmit` exit 0 (ricorsivo)
- `pnpm --filter @repo/admin build` exit 0; `pnpm --filter @repo/web build` exit 0 (la homepage non deve rompersi)
- In `pnpm --filter @repo/admin dev` (porta 3001), su `/dashboard/menu`:
  - si vedono le 6 sezioni seed (incluse le 2 inattive, visivamente distinte)
  - rinominare una sezione e ricaricare la home pubblica (`apps/web` su :3000) → il nuovo nome compare (propagazione senza rebuild)
  - attivare "Cocktail" → compare tra i tab del menu pubblico
  - creare una categoria sotto una sezione, rinominarla, disattivarla, cancellarla
  - il dialog di delete categoria avvisa della cascade
- Nessuna query DB fuori da `@repo/supabase`
- `getMenuSections`/`getMenuBySection`/`getAllergens` e la homepage pubblica invariati nel comportamento

## Note per il master

1. **Verifica trust-but-verify:** rileggere i file reali, rieseguire `pnpm -r exec tsc --noEmit` (ricorsivo). Verificare che le funzioni read pubbliche **non** siano state alterate (la homepage dipende dal filtro `is_active`).
2. **Propagazione homepage:** è il done-when più importante per il backlog ("modifiche visibili senza rebuild"). Testare davvero rinomina/toggle sezione → effetto sul sito pubblico.
3. **Cascade delete:** confermare che il dialog avvisi l'utente (la perdita di item è silenziosa lato DB).
4. **Rischio CLI shadcn** (path doppio) — invocare da dentro `packages/ui`, verificare l'output.
5. **Suggerito:** `/model claude-sonnet-4-6`, `/effort high`.
6. **Commit (master, dopo review):** `feat(admin): add menu sections/categories CRUD with admin service functions`
7. Frontmatter → `status: DONE`. Prossimo: `02b` (item + allergeni).
