---
status: TODO
created: 2026-05-24
area: ai-playbooks
type: prompt
topic: menu-refactor
owner: master-chat
model: claude-sonnet-4-6
effort: medium
---

# Sub-task 01 — Service: `moveItemToCategory` + contratto esiti di riordino

> **/model** `claude-sonnet-4-6` · **/effort** `medium`
> Solo service layer + il contratto di ritorno delle reorder action. Nessuna modifica UI strutturale (arriva nei sub-task 02-05). Nessuna modifica schema.

## Contesto

`foras` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase, pnpm workspaces). Stiamo rifacendo `/dashboard/menu` in `apps/admin` (intermezzo Menu-refactor, **Strada A**: accordion + hardening, riordino solo a frecce, DnD rimosso — vedi `decision-log/decisioni.md` voce 2026-05-24 *Refactor /dashboard/menu*). Questo primo sub-task prepara le fondamenta che i sub-task UI consumeranno: la possibilità di **spostare una voce tra categorie** senza eliminarla+ricrearla, e un **esito verificabile** dei riordini (oggi sono fire-and-forget e una scrittura fallita resta invisibile).

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce 2026-05-24 *Refactor /dashboard/menu* (direzione e vincoli)
- `packages/supabase/src/services/menu.ts` — service menu admin: `getMenuItemsAdmin`, `createMenuItem`, `updateMenuItem`, `reorderMenuItems`, `reorderMenuCategories`, `reorderMenuSections` (pattern di firma `(client: TenantClient, ...)`, error wrap `new Error('<fn> failed: <msg>')`)
- `packages/supabase/src/index.ts` — barrel degli export
- `apps/admin/app/dashboard/menu/actions.ts` — `reorderSectionsAction`/`reorderCategoriesAction`/`reorderItemsAction` (oggi `Promise<void>`)
- `packages/supabase/src/types/database.ts` — Row di `menu_items` (`id, category_id, name, description, price, position, is_active, ...`) e `menu_categories` (`id, section_id, name, position, is_active`)

## Scope

1. **`moveItemToCategory` nel service** (`packages/supabase/src/services/menu.ts`):
   ```
   moveItemToCategory(client: TenantClient, itemId: string, newCategoryId: string): Promise<void>
   ```
   - Recupera la `category_id` corrente della voce; recupera la `section_id` della categoria sorgente e di quella destinazione.
   - **Guard:** lo spostamento è consentito **solo entro la stessa sezione** — se la categoria destinazione appartiene a un'altra sezione, lancia un errore esplicito (`new Error('moveItemToCategory: spostamento consentito solo nella stessa sezione')`).
   - Aggiorna la voce: `category_id = newCategoryId` e **`position` = ultima posizione nella categoria destinazione + 1** (la voce arriva in fondo alla nuova categoria; nessuna collisione di `position`).
   - Errori PostgREST veri → `throw new Error('moveItemToCategory (<fase>) failed: <msg>')`, coerente con le altre funzioni del file.
   - Esportala da `packages/supabase/src/index.ts` accanto alle altre funzioni menu admin.

2. **Contratto esito riordini** (`apps/admin/app/dashboard/menu/actions.ts`):
   - Cambia la firma di `reorderSectionsAction`, `reorderCategoriesAction`, `reorderItemsAction` da `Promise<void>` a **`Promise<{ ok: boolean }>`**: avvolgi la chiamata al service in `try/catch`, ritorna `{ ok: true }` al successo e `{ ok: false }` se il service lancia (così il sub-task 03 potrà fare rollback ottimistico + toast d'errore). Mantieni `revalidatePath('/dashboard/menu')` solo sul ramo di successo.
   - I chiamati attuali (`SectionList`, `CategoryRow`) usano `void reorder*Action(...)`: il cambio di tipo di ritorno **non li rompe** (lascia il loro codice invariato in questo sub-task — il consumo dell'esito arriva nel 03).

## Vincoli

- **Nessuna modifica allo schema DB** (le colonne `position` esistono già). Nessuna migrazione.
- **Nessuna modifica UI strutturale** in questo sub-task: niente accordion, niente frecce, niente rimozione DnD (sono i sub-task 02/03). Qui si tocca solo `services/menu.ts`, `index.ts` e le 3 reorder action in `menu/actions.ts`.
- Nessuna query DB diretta fuori da `packages/supabase` (la action usa il service, non query inline).
- Firma uniforme `(client: TenantClient, ...)`; `moveItemToCategory` riceve il **verified tenant client** dal consumer (come le altre write admin).

## Output atteso

- `packages/supabase/src/services/menu.ts`: `moveItemToCategory` + export da `index.ts`.
- `apps/admin/app/dashboard/menu/actions.ts`: le 3 reorder action ritornano `{ ok: boolean }`.

## Done when

- `moveItemToCategory` sposta una voce in un'altra categoria della **stessa** sezione, mettendola in fondo; rifiuta con errore chiaro se la categoria destinazione è di un'altra sezione.
- Le reorder action ritornano `{ ok: boolean }` e fanno `revalidatePath` solo al successo.
- `pnpm -r exec tsc --noEmit` pulito e `pnpm --filter admin build` verde.
- Nessuna regressione: il menu admin continua a caricarsi e i riordini DnD attuali continuano a funzionare (il loro comportamento visivo è invariato fino al sub-task 03).
