---
status: DONE
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 5
order: 3
tags: [foras-mvp, sprint5, admin, drag-drop, menu, dnd-kit]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: high
---

# Sprint 5 / 3 di 6 — Drag-and-drop ordinamento menu

## Contesto

Estende il CRUD menu dei sub-task `02a`/`02b`. La gerarchia è **Sezione → Categoria → Item**, tutti con colonna `position` nello schema. Attualmente gli item nascono con `position = NULL` (ordine alfabetico). Questo sub-task aggiunge il riordinamento drag-and-drop a tutti e tre i livelli usando `@dnd-kit`.

**Architettura esistente rilevante:**
- `apps/admin/app/dashboard/menu/page.tsx` — Server Component, fetcha tutto e passa props a `SectionCard`
- `apps/admin/app/dashboard/menu/_components/SectionCard.tsx` — `'use client'`, riceve `section`, `categories`, `itemsByCategory`, `allergens`; gestisce DnD categorie (da aggiungere) + dialog sezione
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx` — `'use client'`, riceve `category`, `items`, `allergens`; contiene `ItemRow` locale; gestisce DnD item (da aggiungere) + dialog item
- `apps/admin/app/dashboard/menu/actions.ts` — Server Actions `'use server'`, tutte `(prevState, formData)` → `MenuActionState`; da estendere con le azioni di reorder (firma diversa: accettano `string[]` direttamente)
- `packages/supabase/src/services/menu.ts` — service layer; da estendere con 3 funzioni di reorder
- `apps/admin/package.json` — dipendenze app admin (da estendere con `@dnd-kit`)

**Scope delimitato:** solo il menu (sezioni, categorie, item). Le `news_slides` avranno drag-and-drop nel sub-task `04` (CRUD novità). **Non toccare** il sub-task per news_slides qui.

## File da leggere prima di iniziare

- `apps/admin/app/dashboard/menu/page.tsx`
- `apps/admin/app/dashboard/menu/actions.ts`
- `apps/admin/app/dashboard/menu/_components/SectionCard.tsx`
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx`
- `packages/supabase/src/services/menu.ts`
- `packages/supabase/src/index.ts`
- `apps/admin/package.json`

## Scope

### 1. Dipendenze — `apps/admin/package.json`

Aggiungere in `dependencies`:
```json
"@dnd-kit/core": "^6.3.1",
"@dnd-kit/sortable": "^8.0.0",
"@dnd-kit/utilities": "^3.2.2"
```
Poi `pnpm install` dalla root del monorepo (aggiorna `pnpm-lock.yaml`).

### 2. Service — `packages/supabase/src/services/menu.ts` (estendere)

Aggiungere tre funzioni di reorder. Assegnano `position = indice 0-based` nell'ordine ricevuto, in parallelo:

```ts
export async function reorderMenuSections(client: TenantClient, orderedIds: string[]): Promise<void>
export async function reorderMenuCategories(client: TenantClient, orderedIds: string[]): Promise<void>
export async function reorderMenuItems(client: TenantClient, orderedIds: string[]): Promise<void>
```

Implementazione (pattern comune per tutte e tre, cambia solo il nome della tabella):
```ts
export async function reorderMenuSections(client: TenantClient, orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) =>
      client.from('menu_sections').update({ position: i }).eq('id', id)
    )
  )
}
```
Nessuna validazione Zod (gli ID arrivano dal componente client già tipati). Nessun `throw` esplicito — se un singolo update fallisce il `Promise.all` rigetta, la Server Action gestirà il fallthrough.

### 3. Barrel `@repo/supabase` — `packages/supabase/src/index.ts`

Aggiungere (preservando gli esistenti): `reorderMenuSections`, `reorderMenuCategories`, `reorderMenuItems` da `./services/menu`.

### 4. Server Actions — `apps/admin/app/dashboard/menu/actions.ts` (estendere)

Tre nuove Server Actions con firma diversa dalle esistenti (accettano `string[]`, non `FormData`):

```ts
export async function reorderSectionsAction(orderedIds: string[]): Promise<void>
export async function reorderCategoriesAction(orderedIds: string[]): Promise<void>
export async function reorderItemsAction(orderedIds: string[]): Promise<void>
```

Pattern comune:
```ts
export async function reorderSectionsAction(orderedIds: string[]): Promise<void> {
  const { tenant } = await requireTenantClient()
  await reorderMenuSections(tenant, orderedIds)
  revalidatePath('/dashboard/menu')
}
```
Se il service rigetta, l'eccezione si propaga al client (il `startTransition` la inghiottirà silenziosamente; `revalidatePath` non gira → la prossima navigazione ricarica l'ordine server corretto). Va bene per MVP.

### 5. UI — ristrutturazione componenti

#### 5a. Nuovo file `apps/admin/app/dashboard/menu/_components/SectionList.tsx`

`page.tsx` è un Server Component: non può usare DndContext direttamente. Estrarre la lista sezioni in un nuovo Client Component:

```tsx
'use client'
import { useState, useTransition } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Allergen, MenuCategory, MenuItem, MenuSection } from '@repo/supabase'
import { reorderSectionsAction } from '../actions'
import { SectionCard } from './SectionCard'

export function SectionList({
  sections: initialSections,
  categoriesBySection,
  itemsByCategory,
  allergens,
}: {
  sections: MenuSection[]
  categoriesBySection: Record<string, MenuCategory[]>
  itemsByCategory: Record<string, MenuItem[]>
  allergens: Allergen[]
}) {
  const [sections, setSections] = useState(initialSections)
  const [, startTransition] = useTransition()
  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id)
      const newIndex = prev.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      startTransition(() => {
        void reorderSectionsAction(reordered.map((s) => s.id))
      })
      return reordered
    })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              categories={categoriesBySection[section.id] ?? []}
              itemsByCategory={itemsByCategory}
              allergens={allergens}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

#### 5b. `apps/admin/app/dashboard/menu/page.tsx` (aggiornare)

Sostituire l'attuale render della lista sezioni con `<SectionList>`:
```tsx
// prima
{sections.map((section, i) => (
  <SectionCard key={section.id} section={section} categories={categoriesBySection[i] ?? []} ... />
))}

// dopo
<SectionList
  sections={sections}
  categoriesBySection={Object.fromEntries(sections.map((s, i) => [s.id, categoriesBySection[i] ?? []]))}
  itemsByCategory={itemsByCategory}
  allergens={allergens}
/>
```
Adattare le importazioni di conseguenza. Il `dynamic = 'force-dynamic'` e il fetch restano invariati.

#### 5c. `apps/admin/app/dashboard/menu/_components/SectionCard.tsx` (estendere)

1. Aggiungere `useSortable` per rendere la card stessa trascinabile (gestita da `SectionList`):
```tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

// dentro il componente:
const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id })
const style = { transform: CSS.Transform.toString(transform), transition }
```
Avvolgere il `<Card>` con `<div ref={setNodeRef} style={style}>`. Aggiungere il drag handle (tasto con icona `GripVertical`, `{...attributes} {...listeners}`) visibile nell'header accanto al bottone Rinomina.

2. Aggiungere `DndContext` + `SortableContext` attorno alla lista categorie (già client component, nessun problema di nesting):
```tsx
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { reorderCategoriesAction } from '../actions'

// state locale categorie:
const [cats, setCats] = useState(categories)
const [, startTransition] = useTransition()
const sensors = useSensors(useSensor(PointerSensor))

function handleCategoryDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return
  setCats((prev) => {
    const oldIndex = prev.findIndex((c) => c.id === active.id)
    const newIndex = prev.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(prev, oldIndex, newIndex)
    startTransition(() => {
      void reorderCategoriesAction(reordered.map((c) => c.id))
    })
    return reordered
  })
}
```
Avvolgere la lista `<ul>` con `<DndContext sensors={sensors} onDragEnd={handleCategoryDragEnd}><SortableContext items={cats.map((c) => c.id)} strategy={verticalListSortingStrategy}>`.

**Attenzione:** `cats` state locale sostituisce `categories` prop nell'elenco. Passare `cats` (non `categories`) a `CategoryRow`. Il `categories` prop originale resta come initial state.

#### 5d. `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx` (estendere)

1. Rendere la riga stessa sortable (useSortable, drag handle, stile) — pattern identico a 5c per SectionCard.
2. Aggiungere DndContext + SortableContext per la lista item locale, con `reorderItemsAction`. `ItemRow` diventa sortable.

Per `CategoryRow` (sortable rispetto al DndContext in SectionCard):
```tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id })
const style = { transform: CSS.Transform.toString(transform), transition }
// wrappare l'<li> con ref={setNodeRef} style={style}
// drag handle: GripVertical con attributes+listeners
```

Per la lista item:
```tsx
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { reorderItemsAction } from '../actions'

const [localItems, setLocalItems] = useState(items)
const [, startTransition] = useTransition()
const itemSensors = useSensors(useSensor(PointerSensor))

function handleItemDragEnd(event: DragEndEvent) { /* arrayMove + reorderItemsAction */ }
```
Avvolgere la lista item con DndContext+SortableContext. `ItemRow` locale riceve `id` per `useSortable`.

Per `ItemRow` (funzione locale esistente) — aggiungere `useSortable`, `GripVertical`, wrapper con `ref`/`style`.

## Vincoli

- **React 19**: `useTransition` da `'react'` (non da 'react-dom'). I Server Actions chiamati dentro `startTransition` sono la modalità raccomandata in React 19.
- **Nessuna modifica alle funzioni read pubbliche**: `getMenuSections`, `getMenuBySection`, `getAllergens`, `MenuClient.tsx`, `apps/web/*` invariati.
- **CRUD 02a/02b invariato**: le azioni esistenti (create/update/delete sezioni/categorie/item) non cambiano; i dialog continuano a funzionare.
- **Nessuna nuova primitiva `@repo/ui`**: `GripVertical` viene da `lucide-react` già presente come dipendenza transitiva (via shadcn). Verificare che sia importabile da `lucide-react` in `apps/admin`. Se non presente come dipendenza diretta, aggiungerla.
- **`lucide-react`**: già presente in `@repo/ui/package.json` come dep del pacchetto shadcn. Se `apps/admin` non riesce a importarla direttamente, aggiungerla in `apps/admin/package.json`. Verificare prima.
- **Nessuna modifica DB** (le colonne `position` esistono già).
- **`position` NULL → in coda**: il sort `order('position', { ascending: true, nullsFirst: false })` già gestisce questo. Dopo il primo drag-and-drop, tutti gli item della lista ricevono posizioni esplicite 0-based.
- **News slides** — **non toccare** in questo sub-task (scope 04).

## Output atteso

- `apps/admin/package.json` (+ `@dnd-kit` deps)
- `pnpm-lock.yaml` (aggiornato da `pnpm install`)
- `packages/supabase/src/services/menu.ts` (+ 3 reorder)
- `packages/supabase/src/index.ts` (export reorder)
- `apps/admin/app/dashboard/menu/actions.ts` (+ 3 reorder actions)
- `apps/admin/app/dashboard/menu/page.tsx` (usa SectionList)
- `apps/admin/app/dashboard/menu/_components/SectionList.tsx` (nuovo)
- `apps/admin/app/dashboard/menu/_components/SectionCard.tsx` (useSortable + DnD categorie)
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx` (useSortable + DnD item)
- Nessun altro file modificato

## Done when

- `pnpm -r exec tsc --noEmit` exit 0
- `pnpm --filter @repo/admin build` exit 0; `pnpm --filter @repo/web build` exit 0
- In `dev` (admin :3001): le sezioni si riordinano via drag-and-drop; le categorie dentro una sezione si riordinano; gli item dentro una categoria si riordinano
- Dopo il drag, ricaricare la pagina → l'ordine è persistito (posizioni salvate su DB)
- I `position = NULL` iniziali vengono assegnati al primo drag (0, 1, 2, …)
- Il CRUD esistente (create/edit/delete sezioni/categorie/item, toggle is_active) continua a funzionare invariato
- Il sito pubblico (:3000) rispetta il nuovo ordine (le funzioni read usano `order('position', ...)` già)

## Note per il master

1. **Trust-but-verify prioritario:** `pnpm -r exec tsc --noEmit` ricorsivo; poi smoke browser su tutti e tre i livelli di DnD + un'azione CRUD (es. modifica item) per confermare che i dialog non siano stati rotti.
2. **Punto delicato — `lucide-react`**: l'icona `GripVertical` è di `lucide-react`. Se manca come dep diretta di `apps/admin`, la build potrebbe fallire anche se il tsc passa. Verificare che sia importabile prima di chiudere la review.
3. **Punto delicato — state inizializzazione**: `SectionCard` riceve `categories` via props ma tiene lo stato locale `cats`. Se `page.tsx` ricarica (revalidatePath), Next.js rimonta il component server e `SectionCard` riceve le categorie aggiornate → lo `useState(categories)` viene re-inizializzato. Questo è corretto perché il reorder action chiama `revalidatePath` → il server state è aggiornato → il componente viene rimontato con il nuovo ordine. Verificare che il behaviour sia atteso.
4. **@dnd-kit React 19**: i peer deps di @dnd-kit/core 6.x dichiarano `"react": ">=16"`. Dovrebbe funzionare con React 19.2.6 senza pin aggiuntivi. Se la sub-chat trova conflitti di peer dep, aggiungere `--legacy-peer-deps` solo per quel package o risolvere con `pnpm.overrides`.
5. **Suggerito**: `/model claude-sonnet-4-6`, `/effort high`.
6. **Commit (master, dopo review):** `feat(admin): add drag-and-drop reordering for menu sections, categories, and items`
7. Frontmatter → `status: DONE`. Prossimo: `04` CRUD novità (news_slides) — includere drag-and-drop slides in quel sub-task.
