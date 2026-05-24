---
status: TODO
created: 2026-05-25
area: ai-playbooks
type: prompt
topic: menu-refactor
owner: master-chat
model: claude-sonnet-4-6
effort: high
---

# Sub-task 06 — Sezioni a CRUD completo (crea + elimina con cascade)

> **/model** `claude-sonnet-4-6` · **/effort** `high`
> Aggiunge create/delete sulle sezioni del menu. Nessuna migrazione (la tabella `menu_sections` supporta già insert/delete; la FK sezione→categorie→voci è già `ON DELETE CASCADE`). Decisione: `decision-log/decisioni.md` voce 2026-05-25.

## Contesto

`foras` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase) in `/Users/lucio/Desktop/foras-mvp`. Finora le 6 **sezioni** del menu erano un seed fisso: si potevano solo rinominare e attivare/disattivare. Lucio ha deciso (decision-log 2026-05-25) di renderle a **CRUD completo**: il gestore può **creare** nuove sezioni ed **eliminarle**. Le 6 standard restano il seed iniziale di ogni tenant (`create_schema_from_template.sql` invariato). L'eliminazione di una sezione cancella **a cascata** le sue categorie e voci (FK `ON DELETE CASCADE` già presenti), quindi serve una **conferma esplicita** che dica cosa si perde.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce 2026-05-25 (sezioni a CRUD completo)
- `packages/supabase/src/services/menu.ts` — pattern service; già presenti `getMenuSectionsAdmin`, `updateMenuSection`, `createMenuCategory`/`deleteMenuCategory` (modelli per create/delete), `reorderMenuSections`
- `packages/supabase/src/schemas/menu.ts` — Zod (`MenuSectionUpdateSchema`, `MenuCategoryCreateSchema` come modello per il create)
- `packages/supabase/src/index.ts` — barrel export
- `apps/admin/app/dashboard/menu/actions.ts` — pattern Server Action (`requireTenantClient` + Zod + `revalidatePath`, ritorna `MenuActionState`)
- `apps/admin/app/dashboard/menu/page.tsx` — header pagina (qui va il bottone "Aggiungi sezione")
- `apps/admin/app/dashboard/menu/_components/SectionList.tsx` — riceve `sections` ecc.; buon punto per il pulsante "Aggiungi sezione" (è già Client Component)
- `apps/admin/app/dashboard/menu/_components/SectionCard.tsx` — header sezione (qui va il bottone "Elimina sezione")
- `apps/admin/app/dashboard/menu/_components/DeleteCategoryDialog.tsx` e `CreateCategoryDialog.tsx` — modelli per i nuovi dialog (stesso pattern `useActionState` + toast già aggiunti nel sub-task 04)
- `menu_sections` (types): colonne `id`, `name`, `is_active`, `position` (Insert richiede solo `name`)

## Scope

1. **Service** (`packages/supabase/src/services/menu.ts` + export in `index.ts`):
   - `createMenuSection(client: TenantClient, name: string): Promise<MenuSection>` — inserisce una sezione con `name`, `is_active: true`, `position` = ultima + 1 (append in fondo, come fa `createMenuCategory`). Error wrap coerente.
   - `deleteMenuSection(client: TenantClient, id: string): Promise<void>` — `delete` della sezione. La cascade DB elimina categorie e voci collegate (FK `ON DELETE CASCADE`). Error wrap coerente.
   - Zod in `schemas/menu.ts`: `MenuSectionCreateSchema` (`name` string, trim, min 1, max coerente con le altre — guarda `MenuCategoryCreateSchema`). Esporta schema e tipo.

2. **Server Actions** (`apps/admin/app/dashboard/menu/actions.ts`):
   - `createSectionAction(_prev, formData)` → Zod parse del `name`, `createMenuSection`, `revalidatePath`, ritorna `MenuActionState`.
   - `deleteSectionAction(_prev, formData)` → legge `id`, `deleteMenuSection`, `revalidatePath`, ritorna `MenuActionState`.

3. **UI**:
   - **`CreateSectionDialog.tsx`** (nuovo, modello `CreateCategoryDialog`): input `name`, `useActionState(createSectionAction)`, toast `'Sezione creata'` su success + onClose, toast error. Aperto da un bottone **"+ Aggiungi sezione"** posizionato in `SectionList.tsx` (in fondo alla lista delle sezioni) o nell'header di `page.tsx` — scegli `SectionList` per coerenza con "+ Aggiungi categoria/item" (motiva in una riga).
   - **`DeleteSectionDialog.tsx`** (nuovo, modello `DeleteCategoryDialog`): **conferma con avviso cascade esplicito** — deve dire che eliminando la sezione si eliminano anche tutte le sue categorie e voci, riportando i **conteggi** (es. "Eliminerai 3 categorie e 12 voci"). `useActionState(deleteSectionAction)`, toast `'Sezione eliminata'` + onClose. Aperto da un bottone **"Elimina"** (icona `Trash2`, stile coerente col sub-task 05: icona + testo da `sm`, `aria-label`) nell'header di `SectionCard`, accanto a "Rinomina". Il dialog riceve da `SectionCard` i conteggi (categorie della sezione + somma voci — `SectionCard` ha già `cats`/`categories` e `itemsByCategory`).

## Vincoli

- **Nessuna migrazione / nessun cambio schema** (insert/delete già supportati; cascade FK già presente). `create_schema_from_template.sql` resta invariato (le 6 restano seed).
- **NON toccare `apps/web`**: lo stato vuoto del sito pubblico è **già gestito** (`MenuClient.tsx`: `if (sections.length === 0) return null`). Verificalo, non modificarlo.
- Nessuna dipendenza nuova. `toast` da `@repo/ui`. Icone da `lucide-react`.
- Mantieni intatti accordion (02), DnD + rollback/toast (03), sposta-categoria + toast dialog (04), densità mobile + "vedi sul sito" (05) e tutti i CRUD. `export const dynamic = 'force-dynamic'` invariato.
- La `delete` è distruttiva e a cascata: la conferma DEVE essere esplicita sui conteggi. Niente eliminazione con un solo click senza conferma.

## Output atteso

- `services/menu.ts` + `index.ts`: `createMenuSection`, `deleteMenuSection`.
- `schemas/menu.ts` + `index.ts`: `MenuSectionCreateSchema` + tipo.
- `menu/actions.ts`: `createSectionAction`, `deleteSectionAction`.
- Nuovi `CreateSectionDialog.tsx`, `DeleteSectionDialog.tsx`.
- `SectionList.tsx`: bottone "+ Aggiungi sezione" + dialog.
- `SectionCard.tsx`: bottone "Elimina" + dialog con conferma cascade e conteggi.

## Done when

- Dal menu admin si può **creare** una nuova sezione (compare in fondo, vuota) e **eliminarla**; eliminandola spariscono anche le sue categorie e voci (cascade), previa **conferma che indica i conteggi**.
- Toast di conferma su creazione ed eliminazione.
- Il sito pubblico non si rompe con 0 sezioni (già gestito; solo verifica).
- `pnpm -r exec tsc --noEmit` pulito e `pnpm --filter admin build` verde; nessuna regressione su accordion/DnD/CRUD/sposta/densità.
