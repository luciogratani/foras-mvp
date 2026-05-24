---
status: DONE
created: 2026-05-25
completed: 2026-05-25
area: ai-playbooks
type: prompt
topic: menu-refactor
owner: master-chat
model: claude-sonnet-4-6
effort: medium
---

# Sub-task 04 — "Sposta in categoria" + toast sui dialog CRUD

> **/model** `claude-sonnet-4-6` · **/effort** `medium`
> Tocca: una nuova server action, prop plumbing per le categorie sorelle, `EditItemDialog`, e l'aggiunta di toast ai dialog CRUD. Nessuna modifica al service (la funzione esiste già dal sub-task 01) né allo schema.

## Contesto

`foras` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase) in `/Users/lucio/Desktop/foras-mvp`. Nel menu admin (`/dashboard/menu`, apps/admin), oggi spostare una voce in un'altra categoria richiede **eliminare e ricreare** (si perdono allergeni/descrizione/prezzo) — rilievo audit `02_ux-workflow-admin-gestore.md` P1-1. Il sub-task 01 ha già aggiunto al service `moveItemToCategory(client, itemId, newCategoryId)` (sposta entro la **stessa sezione**, mettendo la voce in fondo alla categoria destinazione). Qui lo si espone nella UI. Inoltre i dialog CRUD oggi si chiudono in silenzio sul successo: aggiungiamo i toast di conferma (Sonner, già montato).

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voci 2026-05-24 e 2026-05-25 (Menu-refactor)
- `apps/admin/app/dashboard/menu/actions.ts` — pattern Server Action (`requireTenantClient` + Zod + `revalidatePath`); `MenuActionState`
- `packages/supabase/src/services/menu.ts` — `moveItemToCategory` (già presente, sola stessa sezione)
- `apps/admin/app/dashboard/menu/_components/SectionCard.tsx` — ha `cats` (tutte le categorie della sezione); renderizza i `CategoryRow`
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx` — renderizza `EditItemDialog` quando `editItem` è settato
- `apps/admin/app/dashboard/menu/_components/EditItemDialog.tsx` — form di modifica voce (qui va il selettore "Sposta in categoria")
- I dialog CRUD a cui aggiungere il toast: `CreateItemDialog.tsx`, `EditItemDialog.tsx`, `DeleteItemDialog.tsx`, `CreateCategoryDialog.tsx`, `EditCategoryDialog.tsx`, `DeleteCategoryDialog.tsx`, `RenameSectionDialog.tsx` — tutti usano `useActionState` + `if (state.status === 'success') onClose()`. `toast` si importa da `@repo/ui`.

## Scope

1. **Server action** `moveItemToCategoryAction` in `menu/actions.ts`:
   - Firma form-based `(_prev: MenuActionState, formData: FormData): Promise<MenuActionState>` (coerente con le altre).
   - Legge `id` (itemId) e `new_category_id` da `formData`; `requireTenantClient()`; chiama `moveItemToCategory(tenant, id, newCategoryId)`; `revalidatePath('/dashboard/menu')`; ritorna `{ status: 'success' }`. In `catch` ritorna `{ status: 'error', message: 'Spostamento non riuscito. Riprova.' }`.

2. **Prop plumbing delle categorie sorelle**:
   - `SectionCard.tsx`: passa a ciascun `CategoryRow` la lista completa delle categorie della sezione (es. prop `sectionCategories={cats}`).
   - `CategoryRow.tsx`: accetta `sectionCategories: MenuCategory[]` e la inoltra a `EditItemDialog` (prop `categories`).

3. **Selettore "Sposta in categoria" in `EditItemDialog.tsx`**:
   - Nuova prop `categories: MenuCategory[]` (le categorie della stessa sezione).
   - Aggiungi, **separato dal form di modifica esistente** (non mescolare col `updateItemAction`), un piccolo blocco con `useActionState(moveItemToCategoryAction, idle)`: un `<select name="new_category_id">` con tutte le categorie (default = `item.category_id`) + un input hidden `name="id"` con `item.id` + un bottone "Sposta". Disabilita il bottone finché la selezione coincide con la categoria corrente.
   - Su `status === 'success'`: `toast.success('Voce spostata')` e `onClose()` (la voce esce dalla categoria corrente; il `revalidatePath` aggiorna l'albero). Su `status === 'error'`: `toast.error(state.message ?? 'Spostamento non riuscito')`.
   - Etichetta chiara, es. "Sposta in un'altra categoria (stessa sezione)".

4. **Toast sui dialog CRUD** (i 7 elencati sopra):
   - Dove c'è `useEffect(() => { if (state.status === 'success') onClose() }, ...)`, aggiungi `toast.success('<messaggio breve>')` prima/insieme alla chiusura (es. "Voce salvata", "Voce eliminata", "Categoria creata", "Categoria eliminata", "Sezione rinominata", ecc.).
   - Aggiungi anche `toast.error(state.message ?? 'Operazione non riuscita')` su `status === 'error'` (oltre al messaggio inline già presente, va bene anche solo il toast — scegli e sii coerente). Evita doppioni: un solo toast per esito.

## Vincoli

- **NON modificare il service layer** (`moveItemToCategory` esiste già) né lo schema.
- `moveItemToCategory` sposta **solo entro la stessa sezione** (guard nel service): il selettore deve quindi offrire **solo le categorie della stessa sezione** (è esattamente `sectionCategories`). Non offrire categorie di altre sezioni.
- Nessuna nuova dipendenza. `toast` da `@repo/ui`.
- Mantieni accordion (02), DnD + rollback/toast riordino (03), e tutti i CRUD esistenti funzionanti. `force-dynamic` invariato.
- Messaggi in italiano, brevi.

## Output atteso

- `menu/actions.ts`: `moveItemToCategoryAction`.
- `SectionCard.tsx` + `CategoryRow.tsx`: plumbing `sectionCategories` → `EditItemDialog`.
- `EditItemDialog.tsx`: selettore "Sposta in categoria" + toast.
- I 7 dialog CRUD: toast di conferma/errore.

## Done when

- Dal dialog "Modifica voce" si può spostare la voce in un'altra categoria **della stessa sezione**; dopo lo spostamento la voce compare nella nuova categoria (in fondo) e sparisce dalla vecchia; toast di conferma.
- Creare/modificare/eliminare voce e categoria, e rinominare una sezione, mostrano un toast.
- Nessuna categoria di altre sezioni compare nel selettore.
- `pnpm -r exec tsc --noEmit` pulito e `pnpm --filter admin build` verde; nessuna regressione su accordion/DnD/CRUD.
