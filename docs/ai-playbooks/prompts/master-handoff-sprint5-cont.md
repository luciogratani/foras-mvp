---
type: master-handoff
sprint: 5
updated: 2026-05-22
---

# Master handoff — Sprint 5 (continuazione dal sotto-task 04)

Sei il master di `foras-mvp`. Il workflow è in `docs/ai-playbooks/workflow-master-sub.md`:
sub-chat eseguono i prompt, **tu** fai trust-but-verify (leggi i file reali + `pnpm -r exec tsc --noEmit`) e committi. Push = Lucio su richiesta esplicita.

## Stato attuale

Sprint 5 — Admin panel CRUD. **01 / 02a / 02b / 03 DONE.**

| Sub-task | Commit | Contenuto |
|---|---|---|
| 01 | `dd99c70` | TW4 + shadcn in apps/admin, shell /dashboard/*, `requireTenantClient()` |
| 02a | `d671c9a` | Service + UI sezioni + categorie, Switch in @repo/ui |
| 02b | `6958c5d` | Service + UI item + allergeni, Textarea + Checkbox in @repo/ui |
| 03 | `fadd2f0` | @dnd-kit DnD a 3 livelli (sezioni/categorie/item), SectionList.tsx |

Rami rimanenti in `docs/build-delivery/backlog.md` Sprint 5:
- **04** CRUD novità (`news_slides`: titolo, body, image_url, toggle, posizione + DnD slides)
- **05** Orari apertura (`site_settings.opening_hours` JSON, 7 giorni) + CRUD `time_slots` + impostazioni sito (SEO + testi)
- **06** Vista prenotazioni (lista + filtro data/turno + cancel admin)

## Architettura consolidata (pattern da rispettare)

- **Service layer**: `packages/supabase/src/services/` — firma `(client: TenantClient, ...args)`, error wrap `throw new Error('<fn> failed: ' + error.message)`, select + single su create/update
- **Zod**: `packages/supabase/src/schemas/` — `z.coerce.number()` per campi numerici da FormData
- **Server Actions** `'use server'`: `requireTenantClient()` → Zod safeParse → service → `revalidatePath` → return `MenuActionState`. Per reorder: firma `(orderedIds: string[]) => Promise<void>` (non FormData)
- **Client components**: `useActionState` da `'react'`; `useEffect(() => setX(prop), [prop])` per sync state/props dopo revalidatePath; `useId()` su ogni DndContext (fix hydration mismatch); `startTransition` separato da `setState` (React 19)
- **`export const dynamic = 'force-dynamic'`** su ogni page.tsx che fa fetch
- **Primitivi UI**: tutti in `@repo/ui/src/index.ts`; shadcn CLI va eseguita da dentro `packages/ui` (bug path doppio)
- **DnD**: @dnd-kit già installato in apps/admin — riusare il pattern di SectionList/SectionCard/CategoryRow per le slides in 04

## File chiave da leggere prima di scrivere i prompt

```
apps/admin/app/dashboard/menu/page.tsx           # pattern fetch + SectionList
apps/admin/app/dashboard/menu/actions.ts         # tutte le azioni esistenti
apps/admin/app/dashboard/menu/_components/SectionList.tsx  # DnD pattern
apps/admin/app/dashboard/menu/_components/CategoryRow.tsx  # DnD + CRUD pattern
packages/supabase/src/services/menu.ts           # service pattern (reorder incluso)
packages/supabase/src/schemas/menu.ts            # Zod pattern
packages/supabase/src/index.ts                   # barrel
packages/ui/src/index.ts                         # primitive esportate
apps/admin/package.json                          # dipendenze (@dnd-kit già presente)
docs/tech-architecture/data-model.md             # schema news_slides, time_slots, site_settings
docs/operations/create_schema_from_template.sql  # SQL definitivo colonne/seed
```

## Regole invarianti

- Funzioni read pubbliche (`getMenuSections`, `getMenuBySection`, `getAllergens`, `getSiteSettings`, `getActiveNews`) e `apps/web/*` **mai toccare**
- Nessuna query DB fuori da `@repo/supabase`
- Sub-chat non committano
- Trust-but-verify: leggi i file reali, non fidarti solo del report

## Schema note per 04 (news_slides)

`news_slides`: `id`, `title`, `body` (nullable), `image_url` (nullable, URL testuale), `is_active` (default true), `position` (nullable). Le slide sono create/modificate/cancellate dal gestore (no seed fisso). Funzione read pubblica `getActiveNews` già esiste (invariata). Servono: `getNewsSlidesAdmin`, `createNewsSlide`, `updateNewsSlide`, `deleteNewsSlide`, `reorderNewsSlides` — pattern identico al menu.

## Commit message attesi (dopo review)

- 04: `feat(admin): add news slides CRUD with drag-and-drop`
- 05: `feat(admin): add opening hours, time slots, and site settings management`
- 06: `feat(admin): add bookings list with admin cancel`
