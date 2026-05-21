---
status: DONE
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 5
order: 2
suborder: b
tags: [foras-mvp, sprint5, admin, crud, menu, item, allergeni]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: high
---

# Sprint 5 / 2b of 6 — CRUD menu: item + allergeni

## Contesto

Chiude il CRUD menu iniziato col `02a`. Il `02a` ha già: in `@repo/supabase` le funzioni admin per sezioni/categorie (`getMenuSectionsAdmin`, `getMenuCategoriesAdmin`, `updateMenuSection`, `createMenuCategory`, `updateMenuCategory`, `deleteMenuCategory`) + `schemas/menu.ts` (Zod), e la UI `/dashboard/menu` con la gerarchia **Sezione → Categoria** (`page.tsx` + `actions.ts` + `_components/SectionCard.tsx`, `CategoryRow.tsx`, dialog vari). La primitiva `Switch` è in `@repo/ui`.

Questo sub-task aggiunge il **terzo livello: gli item** sotto ogni categoria, con CRUD completo e l'assegnazione degli **allergeni**. Estende i file del `02a` (non li riscrive da zero).

**Stato schema `template`** (da `docs/operations/create_schema_from_template.sql`):
- `menu_items`: `id`, `category_id` (FK → `menu_categories` `ON DELETE CASCADE`), `name`, `description` (nullable), `price NUMERIC(8,2) NOT NULL`, `position` (nullable), `is_active` (default true), `image_url` (nullable), `allergen_ids UUID[] NOT NULL DEFAULT '{}'`.
- `allergens`: **14 voci seed read-only** (Reg. UE 1169/2011) — Glutine, Crostacei, Uova, Pesce, Arachidi, Soia, Latte, Frutta a guscio, Sedano, Senape, Semi di sesamo, Anidride solforosa e solfiti, Lupini, Molluschi. Il gestore **non** li modifica: li **assegna** all'item.
- `allergen_ids` è un array UUID; la FK verso `allergens` è **enforced a livello applicativo** (non dal DB) → la UI presenta solo i 14 allergeni reali come checkbox, quindi gli id sono sempre validi.
- RLS `menu_items_admin_all FOR ALL USING (auth.uid() IS NOT NULL)` + GRANT a `authenticated` → CRUD col verified tenant client, **nessuna modifica DB**.

**Decisioni master (decision-log 2026-05-21 — Sprint 5):** immagini via **URL testuale** (campo `image_url` = input URL, niente upload/Storage); **niente drag-and-drop** (è il `03`: i nuovi item nascono con `position` NULL → coda alfabetica). Allergeni read-only (solo assegnazione).

## File da leggere prima di iniziare

- `docs/ai-playbooks/prompts/2026-05-21_sprint5/02a_menu-sezioni-categorie.md` — pattern stabilito (service, actions, dialog) da estendere coerentemente
- `apps/admin/app/dashboard/menu/page.tsx` — fetch sezioni+categorie (da estendere con item + allergeni)
- `apps/admin/app/dashboard/menu/actions.ts` — Server Action pattern (`requireTenantClient` + Zod safeParse + `revalidatePath`)
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx` — dove agganciare la lista item
- `apps/admin/app/dashboard/menu/_components/{Create,Edit,Delete}CategoryDialog.tsx` — pattern dialog + `useActionState` da replicare per gli item
- `packages/supabase/src/services/menu.ts` — `getAllergens` esiste già (read-only); estendere con le funzioni item
- `packages/supabase/src/schemas/menu.ts` — estendere con gli schema item
- `packages/supabase/src/index.ts` — barrel (estendere)
- `docs/tech-architecture/data-model.md` — `menu_items`, `allergens`
- `apps/web/app/_components/MenuClient.tsx` — come la homepage pubblica consuma `allergen_ids` + `getAllergens` (per capire l'effetto di propagazione)

## Scope

### 1. Service — `packages/supabase/src/services/menu.ts` (estendere)

`getAllergens` esiste già: **riusalo** (non duplicarlo). Aggiungere:

```ts
export async function getMenuItemsAdmin(client: TenantClient, categoryId: string): Promise<MenuItem[]>
// tutti gli item della categoria (incl. is_active=false),
// order by position asc NULLS LAST, poi name asc

export async function createMenuItem(client: TenantClient, input: MenuItemCreate): Promise<MenuItem>
export async function updateMenuItem(client: TenantClient, id: string, patch: MenuItemUpdate): Promise<MenuItem>
export async function deleteMenuItem(client: TenantClient, id: string): Promise<void>
```

- Stesso pattern di errore/ritorno del `02a` (`throw new Error('<fn> failed: ' + error.message)`; `create`/`update` → `.select('*').single()`).
- I service ricevono input **già tipato** (validazione Zod nelle action). `position` non gestito qui (è il `03`).

### 2. Zod — `packages/supabase/src/schemas/menu.ts` (estendere)

```ts
export const MenuItemCreateSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1, 'Il nome è obbligatorio'),
  price: z.coerce.number().nonnegative('Il prezzo non può essere negativo'),
  description: z.string().trim().min(1).nullable().optional(),
  image_url: z.string().url('URL immagine non valido').nullable().optional(),
  allergen_ids: z.array(z.string().uuid()).default([]),
  is_active: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
})
export const MenuItemUpdateSchema = MenuItemCreateSchema.partial().omit({ category_id: true })
// (oppure ridefinire i campi come .optional() — l'importante: category_id non si cambia in update)

export type MenuItemCreate = z.infer<typeof MenuItemCreateSchema>
export type MenuItemUpdate = z.infer<typeof MenuItemUpdateSchema>
```

> **`price`**: usare `z.coerce.number()` perché arriva come stringa dal `FormData`. Nell'input usare `<Input type="number" step="0.01" min="0">` (decimali col punto, non la virgola).
> **`image_url`** e **`description`**: nelle action, convertire la stringa vuota del form in `null` **prima** del parse (es. `formData.get('image_url') || null`), così un campo lasciato vuoto non fallisce la validazione URL/min.
> **`allergen_ids`**: nel form sono checkbox multipli con lo stesso `name="allergen_ids"` → nelle action raccoglierli con `formData.getAll('allergen_ids')`.

### 3. Barrel `@repo/supabase` — `packages/supabase/src/index.ts`

Aggiungere (preservando gli esistenti): `getMenuItemsAdmin`, `createMenuItem`, `updateMenuItem`, `deleteMenuItem` da `./services/menu`; `MenuItemCreateSchema`, `MenuItemUpdateSchema` + tipi `MenuItemCreate`, `MenuItemUpdate` da `./schemas/menu`. `MenuItem` è già esportato.

### 4. Primitive UI mancanti — `Textarea` + `Checkbox` in `@repo/ui`

Da dentro `packages/ui` (lezione path doppio):
```bash
cd packages/ui && pnpm dlx shadcn@latest add textarea checkbox
```
Verificare il path (`packages/ui/src/components/ui/{textarea,checkbox}.tsx`), spostare a mano se serve. Esportare entrambe da `packages/ui/src/index.ts`. `Switch` c'è già (riusala per `is_active` item).

### 5. UI — estendere `apps/admin/app/dashboard/menu/`

**`page.tsx`**: oltre a sezioni+categorie, fetchare:
- gli **item per ogni categoria** (`getMenuItemsAdmin`) — `Promise.all` sull'elenco piatto di tutte le categorie (dati piccoli);
- **una volta** la lista allergeni (`getAllergens(tenant)`) da passare ai form item.
Passare item e allergeni giù fino a `CategoryRow` / ai dialog item.

**`actions.ts`** (estendere): `createItemAction`, `updateItemAction`, `deleteItemAction` — stesso schema delle action `02a` (`requireTenantClient` → raccogli `FormData` (ricorda `getAll('allergen_ids')` e empty→null) → `safeParse` → service → `revalidatePath('/dashboard/menu')`). Riusare il tipo `MenuActionState`.

**`_components/`**:
- estendere `CategoryRow.tsx` per elencare gli item della categoria, ciascuno con i controlli edit/delete + toggle `is_active`, e un bottone "+ Aggiungi item";
- nuovi dialog: `CreateItemDialog.tsx`, `EditItemDialog.tsx`, `DeleteItemDialog.tsx` (stesso pattern `useActionState` + chiusura on success + errori inline dei dialog categoria).
- Form item: `name` (`Input`), `price` (`Input type=number`), `description` (`Textarea`), `image_url` (`Input`), `is_active` (`Switch`), **allergeni** (lista di `Checkbox` dai 14 `getAllergens`, `name="allergen_ids"`, precheckati in edit da `item.allergen_ids`).

> UI sobria, niente toast (errori inline). Niente palette custom (Sprint 7).

## Vincoli

- **Niente query DB nei componenti**: tutto via `@repo/supabase`; il client viene da `requireTenantClient()`.
- **Allergeni read-only**: solo assegnazione all'item. Nessuna create/update/delete su `allergens`.
- **Immagini = URL testuale**: nessun upload, nessun bucket/Storage (è Sprint 7).
- **Niente drag-and-drop / `position` in UI** (è il `03`).
- **Non toccare** le funzioni read pubbliche (`getMenuSections`/`getMenuBySection`/`getAllergens` resta invariata nella firma), `apps/web/*`, `layout.tsx`, `lib/auth.ts` (a parte usarlo), `proxy.ts`, file SQL, tipi generati.
- Estendere i file `02a` in modo coerente, senza romperne il comportamento (sezioni/categorie devono continuare a funzionare).
- **Nessuna dipendenza nuova** oltre alle primitive `Textarea`/`Checkbox`.
- React 19: `'use client'` solo dove serve; `useActionState` da `'react'`.

## Output atteso

- `packages/supabase/src/services/menu.ts` (+ `getMenuItemsAdmin`, `createMenuItem`, `updateMenuItem`, `deleteMenuItem`)
- `packages/supabase/src/schemas/menu.ts` (+ schema/tipi item)
- `packages/supabase/src/index.ts` (export estesi)
- `packages/ui/src/components/ui/{textarea,checkbox}.tsx` + export in `packages/ui/src/index.ts`
- `apps/admin/app/dashboard/menu/page.tsx` (fetch item + allergeni)
- `apps/admin/app/dashboard/menu/actions.ts` (+ 3 action item)
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx` (estesa con item)
- `apps/admin/app/dashboard/menu/_components/{CreateItemDialog,EditItemDialog,DeleteItemDialog}.tsx` (nuovi)
- `pnpm-lock.yaml` se la CLI shadcn aggiunge qualcosa
- Nessun altro file modificato

## Done when

- `pnpm -r exec tsc --noEmit` exit 0 (ricorsivo)
- `pnpm --filter @repo/admin build` exit 0; `pnpm --filter @repo/web build` exit 0
- In `dev` (admin :3001), sotto una categoria: creare un item con nome, prezzo, descrizione, URL immagine e alcuni allergeni; modificarlo; disattivarlo; cancellarlo
- Il prezzo accetta i decimali; un `image_url` vuoto non dà errore; gli allergeni selezionati si ripresentano precheckati in modifica
- **Propagazione pubblica**: un item attivo con allergeni compare nel menu pubblico (:3000) con le info allergeni nel popup (`MenuClient`), senza rebuild
- Sezioni/categorie del `02a` continuano a funzionare; funzioni read pubbliche invariate
- Nessuna query DB fuori da `@repo/supabase`

## Note per il master

1. **Verifica trust-but-verify:** rileggere i file reali, `pnpm -r exec tsc --noEmit` ricorsivo. Controllare che `getMenuBySection`/`getAllergens` pubbliche e `MenuClient` non siano stati alterati.
2. **Punti delicati:** coercion `price` (stringa→number), empty→null per `image_url`/`description`, `getAll('allergen_ids')`. Verificarli nei test.
3. **Propagazione allergeni** è il done-when che chiude il CRUD menu lato pubblico: testare davvero l'item con allergeni sul sito.
4. **Rischio CLI shadcn** (path doppio) — invocare da dentro `packages/ui`.
5. **Suggerito:** `/model claude-sonnet-4-6`, `/effort high`.
6. **Commit (master, dopo review):** `feat(admin): add menu items CRUD with allergen assignment`
7. Frontmatter → `status: DONE`. Con questo il CRUD menu è completo (manca solo l'ordinamento drag&drop = `03`). Prossimo: `03` drag-and-drop.
