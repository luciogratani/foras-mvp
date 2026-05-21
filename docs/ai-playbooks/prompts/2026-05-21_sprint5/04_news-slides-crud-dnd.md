# Sub-task 04 — News Slides CRUD + DnD

Sei una sub-chat di implementazione per il progetto `foras-mvp` (monorepo Next.js + Supabase multi-tenant, pnpm workspaces). Il master farà trust-but-verify e committerà. **Tu non committi.**

## Obiettivo

Implementa il CRUD completo per `news_slides` con drag-and-drop nell'admin panel. Pattern identico al menu (sub-task 02b + 03).

## Schema tabella `news_slides` (già in DB)

```sql
CREATE TABLE news_slides (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT        NOT NULL,
  body       TEXT,                          -- nullable
  image_url  TEXT,                          -- nullable, URL testuale
  position   INTEGER,                       -- nullable, NULL = in coda
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## File da NON toccare mai

- `packages/supabase/src/services/site.ts` — contiene `getActiveNews` (pubblica, invariante)
- `apps/web/**` — frontend pubblico, nessuna modifica

---

## 1. Service layer — `packages/supabase/src/services/news.ts` (file nuovo)

Segui il pattern di `packages/supabase/src/services/menu.ts`. Firma: `(client: TenantClient, ...)`. Error wrap: `throw new Error('<fn> failed: ' + error.message)`. Select + single su create/update.

```ts
import type { Tables } from '../types/database'
import type { TenantClient } from '../index'
import type { NewsSlideCreate, NewsSlideUpdate } from '../schemas/news'

export type NewsSlide = Tables<{ schema: 'template' }, 'news_slides'>

export async function getNewsSlidesAdmin(client: TenantClient): Promise<NewsSlide[]>
// SELECT * ORDER BY position ASC nullsFirst:false, title ASC

export async function createNewsSlide(client: TenantClient, input: NewsSlideCreate): Promise<NewsSlide>
// INSERT ... SELECT * .single()

export async function updateNewsSlide(client: TenantClient, id: string, patch: NewsSlideUpdate): Promise<NewsSlide>
// UPDATE ... .eq('id', id) .select('*') .single()

export async function deleteNewsSlide(client: TenantClient, id: string): Promise<void>
// DELETE .eq('id', id)

export async function reorderNewsSlides(client: TenantClient, orderedIds: string[]): Promise<void>
// Promise.all: orderedIds.map((id, i) => client.from('news_slides').update({ position: i }).eq('id', id))
```

---

## 2. Zod schemas — `packages/supabase/src/schemas/news.ts` (file nuovo)

Segui `packages/supabase/src/schemas/menu.ts`.

```ts
import { z } from 'zod'

export const NewsSlideCreateSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  body: z.string().trim().min(1).nullable().optional(),
  image_url: z.string().url('URL immagine non valido').nullable().optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
})

export const NewsSlideUpdateSchema = NewsSlideCreateSchema.partial()

export type NewsSlideCreate = z.infer<typeof NewsSlideCreateSchema>
export type NewsSlideUpdate = z.infer<typeof NewsSlideUpdateSchema>
```

---

## 3. Barrel — `packages/supabase/src/index.ts` (modifica)

Aggiungi in fondo al file esistente (non toccare le righe esistenti):

```ts
export { getNewsSlidesAdmin, createNewsSlide, updateNewsSlide, deleteNewsSlide, reorderNewsSlides } from './services/news'
export type { NewsSlide as NewsSlideAdmin } from './services/news'
export { NewsSlideCreateSchema, NewsSlideUpdateSchema } from './schemas/news'
export type { NewsSlideCreate, NewsSlideUpdate } from './schemas/news'
```

> Nota: `NewsSlide` è già esportato da `services/site.ts`. Usa l'alias `NewsSlideAdmin` per evitare collisione nel barrel — nella UI admin importa `NewsSlideAdmin`.

---

## 4. Server Actions — `apps/admin/app/dashboard/news/actions.ts` (file nuovo)

Segui `apps/admin/app/dashboard/menu/actions.ts`. Importante:
- `'use server'` in cima
- `requireTenantClient()` da `'../../../lib/auth'`
- Importa tutto da `@repo/supabase`
- `revalidatePath('/dashboard/news')`
- Tipo `NewsActionState` identico a `MenuActionState`
- Reorder: firma `(orderedIds: string[]) => Promise<void>` (non FormData)

Azioni da implementare: `createSlideAction`, `updateSlideAction`, `deleteSlideAction`, `reorderSlidesAction`.

Per `updateSlideAction`: l'is_active toggle invia solo `id + is_active`; il form di modifica invia sempre `title`. Usa la stessa logica discriminante di `updateItemAction` in menu/actions.ts (guarda come distingue toggle rapido da edit completo).

---

## 5. Page — `apps/admin/app/dashboard/news/page.tsx` (file nuovo)

Segui `apps/admin/app/dashboard/menu/page.tsx`.

```tsx
import { requireTenantClient } from '../../../lib/auth'
import { getNewsSlidesAdmin } from '@repo/supabase'
import { SlideList } from './_components/SlideList'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const { tenant } = await requireTenantClient()
  const slides = await getNewsSlidesAdmin(tenant)
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Novità</h1>
        {/* CreateSlideDialog trigger */}
      </div>
      <SlideList slides={slides} />
    </div>
  )
}
```

Aggiungi il `CreateSlideDialog` con un Button "+ Aggiungi novità" nell'header. Puoi fare la page un client component o tenere il trigger separato — scegli la soluzione più semplice.

---

## 6. Componenti — `apps/admin/app/dashboard/news/_components/`

Crea i file seguenti, adattando i pattern dal menu. **Non inventare pattern nuovi.**

### `SlideList.tsx` — DnD list (pattern: SectionList.tsx)

```tsx
'use client'
// useState + useEffect per sync con initialSlides
// useId() su DndContext (fix hydration mismatch)
// startTransition per reorderSlidesAction
// DndContext > SortableContext > SlideCard[]
```

Props: `{ slides: NewsSlideAdmin[] }`

### `SlideCard.tsx` — sortable row con toggle + Modifica + Elimina (pattern: CategoryRow.tsx / ItemRow)

```tsx
'use client'
// useSortable per DnD handle (GripVertical)
// useActionState(updateSlideAction) per toggle is_active
// Mostra: title, body (troncato se lungo), badge "inattiva" se !is_active
// Bottoni: Modifica (apre EditSlideDialog) + Elimina (apre DeleteSlideDialog)
```

### `CreateSlideDialog.tsx`

Dialog con form: `title` (Input, required), `body` (Textarea, opzionale), `image_url` (Input type="url", opzionale), `is_active` (Switch, default true).
`useActionState(createSlideAction)`. Chiude al successo.

### `EditSlideDialog.tsx`

Identico a Create ma pre-popola i campi dalla slide esistente. Invia anche `id` hidden. `useActionState(updateSlideAction)`.

### `DeleteSlideDialog.tsx`

Confirm dialog. Form con `id` hidden. `useActionState(deleteSlideAction)`.

**Primitivi UI disponibili in `@repo/ui`:** `Button`, `Input`, `Label`, `Textarea`, `Switch`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `DialogClose`. Non installare nulla di nuovo.

---

## 7. Navigazione — aggiungi link "Novità" nella sidebar admin

Trova il file di navigazione/sidebar in `apps/admin/` (cerca `dashboard/menu` per trovare dove sono i link esistenti). Aggiungi un link a `/dashboard/news` con label "Novità", nello stesso stile degli altri link.

---

## Checklist prima di segnalare done

- [ ] `pnpm -r exec tsc --noEmit` — zero errori TypeScript
- [ ] Nessuna query DB fuori da `packages/supabase/src/services/`
- [ ] `export const dynamic = 'force-dynamic'` sulla page
- [ ] `useId()` su ogni `DndContext`
- [ ] `useEffect(() => setSlides(prop), [prop])` in SlideList per sync post-revalidatePath
- [ ] `startTransition` separato da `setState` (React 19)
- [ ] Barrel `packages/supabase/src/index.ts` aggiornato
- [ ] Link navigazione aggiunto
