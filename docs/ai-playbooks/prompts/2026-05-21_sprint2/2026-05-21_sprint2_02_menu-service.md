---
status: DRAFT
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 2
order: 2
tags: [foras-mvp, sprint2, service-layer, menu]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: medium
---

# Sprint 2 / 2 of 3 — Service layer: menu

## Contesto

Secondo sub-task di Sprint 2. Il service `site` è stato consegnato nel 01. Ora si aggiunge il **menu** — tre livelli: `Section → Category → Item`. La homepage pubblica navigherà a tab per sezione (Sprint 3), il backoffice farà CRUD completo (Sprint 5). Qui si producono **solo le letture pubbliche**: tutte e tre le tabelle hanno una policy SELECT pubblica (`menu_sections_public_read`, `menu_categories_public_read`, `menu_items_public_read`), eseguibili con client anon.

C'è una **convenzione di ordinamento condivisa** definita nel data model che vale identica su tutti e tre i livelli — il sub-task la implementa una volta sola, in modo riproducibile.

## File da leggere prima di iniziare

- `docs/tech-architecture/data-model.md` — sezione "Schema menu" (tabelle `menu_sections`, `menu_categories`, `menu_items`, `allergens`) e "Ordinamento — convenzione condivisa"
- `docs/build-delivery/runbook-implementazione.md` — sezione "Phase 2 — Service Layer", criteri "Done when"
- `docs/decision-log/decisioni.md` — voce *Struttura del menu* (gerarchia fissa, niente varianti, niente item multi-categoria) e *Service layer — funzioni ricevono il client come parametro*
- `docs/operations/create_schema_from_template.sql` — sezioni 2 (tabelle) e 4 (policy `menu_*_public_read`)
- `packages/supabase/src/services/site.ts` — pattern di riferimento del sub-task 01 (firma, tipi, error handling)
- `packages/supabase/src/types/database.ts` — tipi Row per `menu_*` e `allergens`

## Scope

1. Creare `packages/supabase/src/services/menu.ts` con queste funzioni e type alias:

   ```ts
   export type MenuSection = Tables<{ schema: 'template' }, 'menu_sections'>
   export type MenuCategory = Tables<{ schema: 'template' }, 'menu_categories'>
   export type MenuItem = Tables<{ schema: 'template' }, 'menu_items'>
   export type Allergen = Tables<{ schema: 'template' }, 'allergens'>

   /** Sezioni attive nell'ordine convenzionale. Eseguibile con client anon. */
   export async function getMenuSections(client: TenantClient): Promise<MenuSection[]>

   /**
    * Categorie attive di una sezione, ognuna con i propri item attivi nested.
    * Eseguibile con client anon.
    */
   export async function getMenuBySection(
     client: TenantClient,
     sectionId: string
   ): Promise<Array<MenuCategory & { items: MenuItem[] }>>

   /** I 14 allergeni del seed. Tipicamente caricati una sola volta lato consumer. */
   export async function getAllergens(client: TenantClient): Promise<Allergen[]>
   ```

   Note implementative:

   - **Ordinamento (regola condivisa su tutti e tre i livelli):**
     - `position` ascending, NULL last
     - Tra le righe con `position = NULL`: alfabetico ascending per `name`
     - PostgREST supporta `.order('position', { ascending: true, nullsFirst: false }).order('name', { ascending: true })` — un solo `.order` chain, niente sort client-side.

   - **`getMenuSections`**: filtra `is_active = true`. Nessun nesting.

   - **`getMenuBySection`**: usa la query nested di PostgREST:
     ```ts
     client
       .from('menu_categories')
       .select('*, items:menu_items(*)')
       .eq('section_id', sectionId)
       .eq('is_active', true)
       .order('position', { ascending: true, nullsFirst: false, foreignTable: undefined })
       .order('name', { ascending: true })
     ```
     - Gli `items` nested devono essere filtrati a loro volta su `is_active = true` e ordinati con la stessa convenzione. PostgREST supporta `select('*, items:menu_items(*)')` + `.order('position', { foreignTable: 'menu_items', ... })`. Verificare la sintassi esatta usata da `supabase-js` (tipicamente l'alias `foreignTable` o `referencedTable` per la sotto-relazione).
     - Se la sintassi nested non permette il filtro `eq` sui figli, ripiegare su due query separate (categorie attive + item attivi della sezione) e fare il merge in TS. Questo è un fallback, non la scelta di default.
     - Il tipo di ritorno è `MenuCategory & { items: MenuItem[] }`. Se PostgREST rinomina la relazione (`menu_items`) in `items` via alias, il tipo del result va asserito manualmente perché il generated type di `supabase-js` non conosce l'alias.

   - **`getAllergens`**: `from('allergens').select('*').order('name', { ascending: true })`. Le 14 righe seed sono fisse.

   - **Item disabilitati / categorie disabilitate / sezioni disabilitate:**
     - `getMenuSections` filtra `is_active = true` → solo sezioni attive
     - `getMenuBySection` filtra `is_active = true` su categorie **e** su item nested
     - Non si fanno join "esterni" che mostrerebbero categorie attive con 0 item — accettato che una categoria attiva possa ritornare con `items: []` se l'admin ha disattivato tutti gli item. La UI di Sprint 3 deciderà se nasconderla.

2. Aggiornare `packages/supabase/src/index.ts` con i re-export:
   ```ts
   export { getMenuSections, getMenuBySection, getAllergens } from './services/menu'
   export type { MenuSection, MenuCategory, MenuItem, Allergen } from './services/menu'
   ```

3. `pnpm -r tsc --noEmit` pulito.

## Vincoli

- **Firma fissa** `(client: TenantClient, ...)` su tutte e tre le funzioni — coerente con il sub-task 01 e con la decisione nel decision-log.
- **Una sola query per funzione** dove possibile. Se per `getMenuBySection` serve il fallback a 2 query separate (vedi sopra), giustificarlo con un commento di una riga sulla limitazione PostgREST trovata.
- **Niente query DB fuori da `@repo/supabase`** — vale anche qui.
- **Tipi:** preferire l'helper `Tables<{ schema: 'template' }, 'name'>`. Se serve un tipo composito (categoria con item nested), definirlo come **type alias esportato** in cima al file, riusabile dal consumer Sprint 3.
- **Niente Zod** in questo sub-task (nessun input utente — `sectionId` arriva da un altro service, non da form).
- **`allergen_ids` su `menu_items` è `uuid[]`** (FK soft, enforced applicativamente). Non risolvere l'array in oggetti `Allergen` qui — è responsabilità del consumer. Il service ritorna gli ID grezzi.
- **Non toccare** `client.ts`, `types/database.ts`, `services/site.ts`, né i package di `apps/`.

## Output atteso

- `packages/supabase/src/services/menu.ts` con le 3 funzioni + 4 type alias + (eventuale) tipo composito per il return di `getMenuBySection`
- `packages/supabase/src/index.ts` aggiornato con i re-export di menu (mantenendo invariati quelli di site)
- `pnpm -r tsc --noEmit` exit 0
- Nessun altro file modificato

## Done when

- Le 3 funzioni sono importabili da `@repo/supabase` e tipate end-to-end
- `getMenuSections` ritorna **solo** le sezioni attive, ordinate per la convenzione (position asc nulls last, poi name asc)
- `getMenuBySection(client, sectionId)` ritorna categorie attive della sezione, con `items` nested filtrati su `is_active = true`, entrambi ordinati con la convenzione
- `getAllergens` ritorna le 14 righe del seed
- Item con `allergen_ids: []` sono gestiti correttamente (array vuoto, non null/undefined)
- `pnpm -r tsc --noEmit` pulito

## Note per il master

1. **Smoke test:** lo schema `template` ha 6 sezioni seed (`Colazione`, `Pranzo`, `Aperitivo`, `Cena`, `Cocktail`, `Carta dei vini` — le ultime due `is_active=false`), 14 allergeni e 0 categorie/item. Verifica attesa:
   - `getMenuSections` → 4 righe (le attive di default)
   - `getMenuBySection(<id_qualunque>)` → `[]`
   - `getAllergens` → 14 righe ordinate alfabeticamente
   Per testare il nesting con dati reali, inserire manualmente una categoria e un paio di item come service_role nel SQL editor (cleanup a fine test).
2. **Sintassi nested PostgREST:** se la sub-chat trova attrito sul `foreignTable`/`referencedTable` (la nomenclatura è cambiata tra versioni di `supabase-js`), segnalare al master prima di ripiegare sulle 2 query separate — è una micro-decisione da prendere assieme.
3. **Suggerito:** `/model claude-sonnet-4-6`, `/effort medium`.
4. **Commit:** `feat(supabase): add menu service (getMenuSections, getMenuBySection, getAllergens)`
5. Frontmatter → `status: DONE`. Procedere al sub-task 03 (bookings — il più rischioso del gruppo).
