---
status: DRAFT
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 3
order: 3
tags: [foras-mvp, sprint3, menu, allergens, news-popup, gallery, shadcn]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: high
---

# Sprint 3 / 3 of 3 — Menu navigabile + NewsPopup + Galleria (skeleton)

## Contesto

Terzo e ultimo sub-task di Sprint 3. Chiude la homepage pubblica.

Lo Sprint 3 / 01 ha messo la baseline UI (Tailwind + shadcn + `<Skeleton>` in `@repo/ui`). Il 02 ha consegnato la homepage SSR con metadata dinamici, hero, slogan, bio, orari, news section e footer. Tutto Server Component.

Adesso si introducono i **tre pezzi interattivi e/o secondari** della homepage:

1. **Menu navigabile per sezione** — shadcn `<Tabs>` su `menu_sections` attive, contenuto pre-fetchato server-side (categorie + item attivi via `getMenuBySection`). Popup `<Dialog>` per gli allergeni di ogni item.
2. **NewsPopup** — gli stessi `news_slides` di `NewsSection` (sub-task 02) ma in un `<Dialog>` auto-aperto al primo arrivo sul sito, con flag `sessionStorage` per non ripresentarlo a navigazione interna.
3. **Galleria placeholder** — Storage non è popolato fino a Sprint 6/7. Skeleton tiles come placeholder permanente (non un loading state, è il contenuto attuale).

**Pre-decisione master:** SSR completo del menu, tabs come pura UI state. Tutti i dati menu vengono pre-fetchati lato server in `page.tsx` (`getMenuSections` + `Promise.all` di `getMenuBySection` per ogni sezione attiva + `getAllergens`). Le default sections attive sono 4 (Colazione, Pranzo, Aperitivo, Cena) → 4 query parallele in più rispetto al sub-task 02. Costo accettabile per SEO; nessun JS necessario per leggere il menu.

**Pre-decisione master:** Skeleton solo per Galleria. NewsPopup e NewsSection sono SSR-ready (consumano gli stessi dati di `getActiveNews` arrivati dal sub-task 02 via props), quindi non necessitano skeleton — il backlog originariamente li elencava ma si tratta di una contraddizione con la strategia di caricamento SSR-first decisa per i contenuti DB-backed. Risolto qui: solo Galleria ha skeleton (Storage non popolato).

## File da leggere prima di iniziare

- `docs/build-delivery/backlog.md` — Sprint 3, criteri "Done when" (menu navigabile + allergeni popup + item/categorie disabilitate non visibili)
- `docs/tech-architecture/data-model.md` — Schema menu (`menu_sections`, `menu_categories`, `menu_items.allergen_ids`, `allergens`)
- `docs/tech-architecture/architettura-fullstack.md` — sezione "Strategia di caricamento — homepage pubblica" (Livello 2 skeleton, motivazione)
- `docs/product-scope/mvp.md` — Homepage pubblica (popup novità, sezione news in fondo)
- `packages/supabase/src/services/menu.ts` — `getMenuSections`, `getMenuBySection`, `getAllergens` (firme finali). Notare il tipo composito `MenuCategoryWithItems` esportato.
- `packages/supabase/src/index.ts` — i type alias esportati che servono al consumer
- `apps/web/app/page.tsx` (dopo sub-task 02) — base da estendere
- `apps/web/app/_components/NewsSection.tsx` (sub-task 02) — pattern di render per le slide (riusabile nel popup)
- Sub-task 01 (`packages/ui` shadcn baseline) — capire che `<Skeleton>` e `cn` sono già esportati; `<Tabs>`, `<Dialog>`, `<Button>` vanno aggiunti qui

## Scope

### 1. Aggiungere primitives shadcn a `@repo/ui`

Dalla root del repo:

```bash
pnpm --filter @repo/ui dlx shadcn@latest add tabs dialog button
```

Questo deve creare:
- `packages/ui/src/components/ui/tabs.tsx`
- `packages/ui/src/components/ui/dialog.tsx`
- `packages/ui/src/components/ui/button.tsx`

E aggiungere come **dependencies** di `@repo/ui`:
- `@radix-ui/react-tabs`
- `@radix-ui/react-dialog`
- `@radix-ui/react-slot` (richiesto da Button con `asChild`)

Verificare a mano i `package.json` dopo il comando — shadcn `add` aggiunge correttamente le radix-ui deps in 99% dei casi.

Aggiornare `packages/ui/src/index.ts` per re-esportare i nuovi componenti:

```ts
export { cn } from './lib/utils'
export { Skeleton } from './components/ui/skeleton'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './components/ui/dialog'
export { Button, buttonVariants } from './components/ui/button'
```

(Allineare i nomi effettivamente esportati dai file shadcn — alcuni potrebbero variare per minor: ad es. `DialogPortal`, `DialogOverlay`. Esporli tutti per non doverli toccare in 03.5 quando servirà uno di più.)

### 2. Estendere `app/page.tsx` con fetch menu + allergeni

Lo stato post-sub-task-02 fetcha solo `settings` + `news`. Qui si aggiunge il blocco menu:

```ts
import { createSupabaseClient, getSiteSettings, getActiveNews, getMenuSections, getMenuBySection, getAllergens } from '@repo/supabase'
import type { MenuCategoryWithItems, MenuSection } from '@repo/supabase'
// ... existing imports
import { MenuClient } from './_components/MenuClient'
import { NewsPopup } from './_components/NewsPopup'
import { Gallery } from './_components/Gallery'

export default async function HomePage() {
  const client = createSupabaseClient()
  const [settings, news, sections, allergens] = await Promise.all([
    getSiteSettings(client),
    getActiveNews(client),
    getMenuSections(client),
    getAllergens(client),
  ])

  const categoriesBySection: Record<string, MenuCategoryWithItems[]> = {}
  await Promise.all(
    sections.map(async (s: MenuSection) => {
      categoriesBySection[s.id] = await getMenuBySection(client, s.id)
    })
  )

  return (
    <main className="min-h-screen flex flex-col">
      <Hero settings={settings} />
      <Slogan settings={settings} />
      <Bio settings={settings} />
      <MenuClient sections={sections} categoriesBySection={categoriesBySection} allergens={allergens} />
      <Gallery />
      <OpeningHours settings={settings} />
      <NewsSection news={news} />
      <NewsPopup news={news} />
      <Footer settings={settings} />
    </main>
  )
}
```

Ordine deciso: Hero → Slogan → Bio → **Menu** → **Gallery** → Orari → NewsSection → Footer. `<NewsPopup>` è un overlay (Dialog), non occupa flow: posizione nell'albero React non vincolante per il layout, lo mettiamo prima del Footer per leggibilità.

### 3. Componenti applicativi nuovi in `apps/web/app/_components/`

#### `_components/MenuClient.tsx` (Client)

```tsx
'use client'

import { useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@repo/ui'
import type { Allergen, MenuCategoryWithItems, MenuItem, MenuSection } from '@repo/supabase'

type Props = {
  sections: MenuSection[]
  categoriesBySection: Record<string, MenuCategoryWithItems[]>
  allergens: Allergen[]
}

export function MenuClient({ sections, categoriesBySection, allergens }: Props) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const allergensById = useMemo(() => new Map(allergens.map((a) => [a.id, a])), [allergens])

  if (sections.length === 0) return null
  const defaultTab = sections[0]!.id

  const itemAllergens = (item: MenuItem | null): Allergen[] =>
    (item?.allergen_ids ?? []).map((id) => allergensById.get(id)).filter((a): a is Allergen => Boolean(a))

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Menu</h2>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {sections.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>{s.name}</TabsTrigger>
          ))}
        </TabsList>

        {sections.map((s) => {
          const categories = categoriesBySection[s.id] ?? []
          return (
            <TabsContent key={s.id} value={s.id} className="mt-6">
              {categories.length === 0 ? (
                <p className="text-muted-foreground">Nessun item disponibile in questa sezione.</p>
              ) : (
                <div className="space-y-8">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <h3 className="text-xl font-semibold mb-3">{cat.name}</h3>
                      {cat.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nessun item disponibile.</p>
                      ) : (
                        <ul className="divide-y divide-border">
                          {cat.items.map((item) => (
                            <li key={item.id} className="py-3 flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-3">
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-muted-foreground">€{Number(item.price).toFixed(2)}</span>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                )}
                              </div>
                              {item.allergen_ids && item.allergen_ids.length > 0 && (
                                <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                                  Allergeni
                                </Button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <Dialog open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.name ?? 'Allergeni'}</DialogTitle>
          </DialogHeader>
          <ul className="list-disc list-inside space-y-1">
            {itemAllergens(selectedItem).map((a) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </section>
  )
}
```

Note implementative:
- **`'use client'` necessario** per gestire `useState` (selectedItem) e `onClick` interattivi delle tabs/dialog. Tutti i dati arrivano via props pre-fetchati lato server → niente network nel client.
- **Filtraggio item/categorie disabilitate:** già garantito dal service layer (`getMenuSections`, `getMenuBySection` filtrano `is_active = true`). Qui non aggiungere filtri.
- **Stato del dialog allergeni**: 1 dialog condiviso controllato via `selectedItem`. Più semplice e performante di N dialog separati.
- **Prezzo:** `Number(item.price).toFixed(2)` perché il tipo `numeric(8,2)` arriva come `string` in PostgREST/`supabase-js`.
- **TabsList scrollabile** su mobile (`overflow-x-auto`) per gestire molte sezioni senza wrap a capo.

#### `_components/NewsPopup.tsx` (Client)

```tsx
'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui'
import type { NewsSlide } from '@repo/supabase'

const STORAGE_KEY = 'foras_news_popup_shown'

export function NewsPopup({ news }: { news: NewsSlide[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (news.length === 0) return
    if (typeof window === 'undefined') return
    if (window.sessionStorage.getItem(STORAGE_KEY)) return
    setOpen(true)
  }, [news.length])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next && typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, '1')
    }
  }

  if (news.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novità</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {news.map((slide) => (
            <article key={slide.id} className="space-y-3">
              {slide.image_url && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={slide.image_url}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold">{slide.title}</h3>
              {slide.body && <p className="text-sm text-muted-foreground">{slide.body}</p>}
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

Note:
- **`useEffect` con dependency `[news.length]`**: si attiva una sola volta (la lista è pre-fetchata server-side, non cambia client-side).
- **`typeof window === 'undefined'` guard** per evitare crash durante SSR/idratazione (l'App Router pre-renderizza lato server anche i Client Components — il `window` non esiste).
- **sessionStorage** (non localStorage): il popup riappare in una nuova scheda/sessione browser, ma non a navigazione interna. Comportamento atteso.
- **Render condizionale**: se `news.length === 0`, ritorna `null` (zero overhead).
- **Layout multi-slide**: scroll verticale dentro `DialogContent` con `max-h-[80vh]`. No carosello per MVP (un click in più per scorrere, ma zero rischio di bug navigazione slide).

#### `_components/Gallery.tsx` (Server)

```tsx
import { Skeleton } from '@repo/ui'

export function Gallery() {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Galleria</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </section>
  )
}
```

Note:
- **Server Component** (nessun `'use client'`). `<Skeleton>` è composto da `<div className="animate-pulse">` — l'animazione è CSS-only, rende anche senza JS attivo.
- **6 tile**: numero scelto per coprire bene il blocco visivo. Modificabile post-freeze.
- **Storage popolato in Sprint 6/7**: a quel punto questo componente accetterà una prop `assets` e renderizzerà `<Image>` reali. Il file dovrà essere riscritto, ma la posizione/struttura della sezione resta.

### 4. Verifiche finali

- `pnpm install` (lockfile aggiornato dalle nuove radix-ui deps)
- `pnpm -r tsc --noEmit` exit 0
- `pnpm --filter @repo/web build` exit 0
- `pnpm --filter @repo/web dev` → la home renderizza il menu con tabs e la galleria con skeleton tiles

## Vincoli

- **`'use client'` solo dove serve:** `MenuClient`, `NewsPopup`. `Gallery` resta Server Component.
- **Niente query DB nei componenti.** I dati menu/news/allergens arrivano via props da `page.tsx`. Riferimento: vincolo standard "Nessuna query DB dentro i componenti".
- **`getMenuBySection` chiamato in parallelo via `Promise.all`** sulle sezioni attive (non sequenzialmente). N=4 default, costo trascurabile.
- **Filtraggio già a livello service:** `getMenuSections` e `getMenuBySection` ritornano solo `is_active = true`. Non filtrare di nuovo nei componenti.
- **`allergen_ids` è `uuid[]`**: rimane array (vuoto se nessun allergene). Mai null/undefined. Il bottone "Allergeni" è renderizzato solo se `allergen_ids.length > 0`.
- **Mapping allergene id → nome:** fatto nel client via `Map` costruita con `useMemo` su mount. Single source: il prop `allergens: Allergen[]`.
- **Niente fetch lato client.** Tutti i dati arrivano dal Server Component padre come props.
- **`sessionStorage` solo dentro `useEffect` o handler** (mai a top-level del component) — vincolo di idratazione.
- **shadcn `add` da `packages/ui` non da `apps/web`:** mantenere single source of truth. Riferimento sub-task 01.
- **Non toccare** `apps/admin/*`, `packages/supabase/*`, `docs/*`, `apps/web/app/api/*`, `apps/web/next.config.mjs`, `apps/web/postcss.config.mjs`, `apps/web/app/globals.css` (TW4 CSS-first: nessun `tailwind.config.ts` da toccare).
- **Non toccare** i componenti del sub-task 02 (`Hero`, `Slogan`, `Bio`, `OpeningHours`, `NewsSection`, `Footer`). Solo `page.tsx` viene esteso (non riscritto).
- **`app/error.tsx` e `app/loading.tsx`** del sub-task 02 restano invariati.

## Output atteso

- `packages/ui/src/components/ui/tabs.tsx` (creato da shadcn add)
- `packages/ui/src/components/ui/dialog.tsx` (creato da shadcn add)
- `packages/ui/src/components/ui/button.tsx` (creato da shadcn add)
- `packages/ui/package.json` (deps: `@radix-ui/react-tabs`, `@radix-ui/react-dialog`, `@radix-ui/react-slot`)
- `packages/ui/src/index.ts` (esteso con i nuovi re-export)
- `apps/web/app/page.tsx` (esteso: fetch menu/allergens + render MenuClient/Gallery/NewsPopup)
- `apps/web/app/_components/MenuClient.tsx` (nuovo, `'use client'`)
- `apps/web/app/_components/NewsPopup.tsx` (nuovo, `'use client'`)
- `apps/web/app/_components/Gallery.tsx` (nuovo, Server)
- `pnpm-lock.yaml` aggiornato
- Nessun altro file modificato

## Done when

- `pnpm -r tsc --noEmit` exit 0
- `pnpm --filter @repo/web build` exit 0
- `pnpm --filter @repo/web dev` → la home renderizza:
  - Sezione **Menu** con tabs delle 4 sezioni attive di default (Colazione, Pranzo, Aperitivo, Cena). Ogni tab mostra "Nessun item disponibile in questa sezione." (DB vuoto di categorie/item).
  - Sezione **Galleria** con 6 skeleton tiles animati (classe `animate-pulse` attiva).
- Inserendo manualmente categoria + item con allergen_ids via SQL editor (cleanup a fine test):
  ```sql
  INSERT INTO template.menu_categories (section_id, name) VALUES
    ((SELECT id FROM template.menu_sections WHERE name='Pranzo'), 'Antipasti') RETURNING id;
  INSERT INTO template.menu_items (category_id, name, price, allergen_ids) VALUES
    ('<cat-id>', 'Bruschetta', 6.50, ARRAY(SELECT id FROM template.allergens WHERE name='Glutine' LIMIT 1));
  ```
  Ricaricare home → la tab Pranzo mostra categoria "Antipasti" con item "Bruschetta €6.50" e bottone "Allergeni". Click sul bottone → dialog si apre con lista "Glutine".
- **NewsPopup:** con DB seed (news_slides vuoto), popup non si apre. Inserendo manualmente una slide attiva (`INSERT INTO template.news_slides (title, body, is_active) VALUES ('Nuovo menu', 'Da oggi disponibile il nuovo menu autunnale.', true)`), ricaricare la home in una **nuova scheda incognito** → popup appare al mount. Chiusura (click X o backdrop) → ricaricare la home **stessa scheda** → popup NON riappare. Aprire nuova scheda incognito → popup riappare (sessionStorage isolato per scheda).
- Item/categorie/sezioni con `is_active = false` non visibili nel menu (verifica disattivando una sezione: `UPDATE template.menu_sections SET is_active=false WHERE name='Pranzo'`).
- Nessuna warning React di "hydration mismatch" in console.
- Nessuna query DB dai componenti (search `client.from` in `apps/web/app/_components/*.tsx` → 0 risultati).
- View Source della home → markup del menu già presente (tabs renderizzati lato server, JS arricchisce solo l'interattività).

## Note per il master

1. **Smoke test allergeni con dati seed minimi (alternativa rapida):**
   ```sql
   WITH cat AS (
     INSERT INTO template.menu_categories (section_id, name, position)
     SELECT id, 'Antipasti', 1 FROM template.menu_sections WHERE name='Pranzo'
     RETURNING id
   )
   INSERT INTO template.menu_items (category_id, name, price, allergen_ids)
   SELECT cat.id, 'Bruschetta al pomodoro', 6.50, ARRAY[(SELECT id FROM template.allergens WHERE name='Glutine')]
   FROM cat;
   ```
   Cleanup:
   ```sql
   DELETE FROM template.menu_items WHERE name='Bruschetta al pomodoro';
   DELETE FROM template.menu_categories WHERE name='Antipasti' AND section_id=(SELECT id FROM template.menu_sections WHERE name='Pranzo');
   ```
2. **NewsPopup test sessionStorage in dev:** sessionStorage si pulisce alla chiusura della scheda; per re-testare a parità di scheda, aprire DevTools → Application → Session Storage → cancellare `foras_news_popup_shown`.
3. **shadcn `dlx` su 3 componenti**: comando singolo `add tabs dialog button` di solito ok. Se la CLI chiede conferma per sovrascrivere `components.json` o `globals.css`, segnalare al master e usare flag/`--yes`. Mai accettare modifiche a `globals.css` (è già configurato dal sub-task 01).
4. **Verifica hydration:** dopo `pnpm --filter @repo/web build`, lanciare `pnpm --filter @repo/web start` (non `dev`) e ricaricare la home → niente warning `Text content did not match` in DevTools Console. Se appare, il colpevole tipico è `new Date()` o `Math.random()` chiamati nel render — non dovrebbero esserci qui, ma è il primo posto da controllare.
5. **Backlog "Done when" Sprint 3 — checklist finale:**
   - ☑ Homepage carica con SSR e mostra dati schema `template`
   - ☑ Nessun flash di layout shift sui contenuti above the fold
   - ☑ Meta tag corretti nel `<head>` (sub-task 02)
   - ☑ Menu navigabile per sezione con allergeni visibili in popup
   - ☑ Item e categorie disabilitate non visibili (filtro applicato già nel service)
   - ☑ Nessuna query DB dentro i componenti — tutto via service layer
   - **Sprint 3 chiuso.**
6. **Suggerito:** `/model claude-sonnet-4-6`, `/effort high`. Densità: 3 file shadcn nuovi + 3 componenti applicativi (2 client + 1 server) + estensione `page.tsx` + verifica hydration.
7. **Commit:** `feat(web): add menu tabs with allergen dialog, news popup and gallery skeleton`
8. Frontmatter → `status: DONE`. **Sprint 3 chiuso** → aggiornare `backlog.md` (Sprint 3 DONE con criteri checklist), aggiornare il `prompts/README.md` (sezione Sprint 3 con commit hash dei 3 sub-task), aprire Sprint 4 (Form prenotazioni — introduce `apps/web/lib/supabaseAdmin.ts` server-only + `SUPABASE_SERVICE_ROLE_KEY` su Vercel).
