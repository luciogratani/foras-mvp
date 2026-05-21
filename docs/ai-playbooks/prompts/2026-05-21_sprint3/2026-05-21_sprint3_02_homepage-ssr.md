---
status: DONE
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 3
order: 2
tags: [foras-mvp, sprint3, ssr, homepage, metadata]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: medium
---

# Sprint 3 / 2 of 3 — Homepage SSR (above-the-fold + metadata + error/loading)

## Contesto

Secondo sub-task di Sprint 3. La baseline UI (Tailwind + shadcn + `<Skeleton>` in `@repo/ui`) è stata chiusa dal sub-task 01.

Adesso si scrive il **cuore SSR della homepage**: meta tag dinamici letti da `site_settings`, fetch server-side parallelo, e tutti i componenti che possono essere puri Server Component (niente interattività, niente `'use client'`). Il menu navigabile e il NewsPopup auto-aperto sono client e arrivano nel sub-task 03.

Tutti i fetch avvengono in `app/layout.tsx` (`generateMetadata`) e `app/page.tsx`. Nessun componente fa query DB — i dati arrivano via props.

**Pre-decisione master:** placeholder visivi minimali, niente design definitivo. Classi Tailwind di base (spacing, tipografia neutra). La UI custom è Sprint 7. Qui basta che le sezioni siano distinguibili e che la struttura HTML sia semanticamente corretta per SEO.

## File da leggere prima di iniziare

- `docs/build-delivery/backlog.md` — Sprint 3, lista task e "Done when"
- `docs/build-delivery/runbook-implementazione.md` — Phase 3 "Homepage pubblica" criteri Done
- `docs/tech-architecture/architettura-fullstack.md` — sezione "Strategia di caricamento — homepage pubblica" (Livello 1 SSR critici)
- `docs/tech-architecture/data-model.md` — tabelle `site_settings` e `news_slides`, struttura JSON di `opening_hours`
- `docs/product-scope/mvp.md` — "Homepage pubblica" (sezioni: hero, slogan, bio, orari, footer, news)
- `packages/supabase/src/services/site.ts` — `getSiteSettings`, `getActiveNews` (firme finali)
- `packages/supabase/src/index.ts` — `createSupabaseClient`, `TenantClient`, type alias esportati
- `packages/supabase/src/types/database.ts` — `Tables<{ schema: 'template' }, 'site_settings' | 'news_slides'>` (per capire i campi nullable)
- `apps/web/app/layout.tsx` e `apps/web/app/page.tsx` — stato attuale (stub statici)
- Sub-task precedente di Sprint 3 (01) — `apps/web/app/globals.css` (TW4 CSS-first, niente `tailwind.config.ts`), `apps/web/postcss.config.mjs`, `packages/ui/src/index.ts` (capire le primitives disponibili: `cn`, `Skeleton`)
- Prerequisito infrastrutturale: la milestone Sprint 2.5 ha portato il monorepo su Next 16 + React 19 (vedi `prompts/2026-05-21_stack-upgrade/`). Questo sub-task gira sul nuovo stack.

## Scope

### 1. `app/layout.tsx` — meta tag dinamici da `site_settings`

Sostituire l'export statico `metadata` con `generateMetadata` async:

```ts
import type { Metadata } from 'next'
import { createSupabaseClient, getSiteSettings } from '@repo/supabase'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const client = createSupabaseClient()
  const settings = await getSiteSettings(client)

  const title = settings?.title ?? 'Foras'
  const description = settings?.description ?? 'Sito web del locale'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(settings?.og_image ? { images: [{ url: settings.og_image }] } : {}),
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  )
}
```

Note:
- `generateMetadata` fa una query a request (no caching applicativo in MVP). Accettato.
- Fallback espliciti se `getSiteSettings` ritorna `null` (template appena seed-ato → seed presente, ma il fallback è difesa per gli altri tenant). I valori di fallback **non** sono i valori del seed — sono valori neutri (`Foras` / `Sito web del locale`) così se il seed manca non si pubblicano stringhe template-specifiche.
- Niente errore propagato in `generateMetadata`: se il service throw-a, lasciar bubble-up (l'App Router renderizza `error.tsx`).

### 2. `app/page.tsx` — fetch SSR + render Server Components

```ts
import { createSupabaseClient, getSiteSettings, getActiveNews } from '@repo/supabase'
import { Hero } from './_components/Hero'
import { Slogan } from './_components/Slogan'
import { Bio } from './_components/Bio'
import { OpeningHours } from './_components/OpeningHours'
import { NewsSection } from './_components/NewsSection'
import { Footer } from './_components/Footer'

export default async function HomePage() {
  const client = createSupabaseClient()
  const [settings, news] = await Promise.all([
    getSiteSettings(client),
    getActiveNews(client),
  ])

  return (
    <main className="min-h-screen flex flex-col">
      <Hero settings={settings} />
      <Slogan settings={settings} />
      <Bio settings={settings} />
      <OpeningHours settings={settings} />
      <NewsSection news={news} />
      <Footer settings={settings} />
    </main>
  )
}
```

Note:
- **Rendering dinamico (post-esecuzione 02):** aggiungere `export const dynamic = 'force-dynamic'` in cima a `page.tsx`. Senza, Next 16 prerenderizza la home come statica (`○`) e congela i dati di `site_settings`/`news_slides` al build — la home non rifletterebbe le modifiche dal backoffice senza rebuild. Con la direttiva la route è `ƒ` (server-rendered on demand). Vedi decision-log *2026-05-21 — Homepage pubblica: rendering dinamico*.
- Fetch parallelo via `Promise.all`. `getMenuSections`/`getAllergens`/`getMenuBySection` **non sono qui** — saranno aggiunti dal sub-task 03 quando arriva il `<MenuClient>`.
- Tutti i componenti sono Server Components. Nessun `'use client'` in questo file né nei componenti applicativi creati qui.
- `Hero` rende anche se `settings` è null (fallback interno).

### 3. Componenti applicativi in `apps/web/app/_components/`

Convenzione: directory `_components` (prefisso underscore → Next.js esclude da routing) per i componenti applicativi specifici della web app. `@repo/ui` resta dedicato alle primitives shadcn condivise.

Tutti i componenti accettano `settings: SiteSettings | null` (o `news: NewsSlide[]`) come prop e gestiscono i campi nullable.

#### `_components/Hero.tsx` (Server)

```tsx
import type { SiteSettings } from '@repo/supabase'

export function Hero({ settings }: { settings: SiteSettings | null }) {
  const title = settings?.title ?? 'Nome del locale'
  return (
    <section className="relative w-full">
      <div className="aspect-[16/9] w-full bg-muted" aria-hidden="true" />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">{title}</h1>
      </div>
    </section>
  )
}
```

Niente immagine hero qui — Storage non è popolato fino a Sprint 6/7. Il `<div className="aspect-[16/9] bg-muted">` è il placeholder visivo permanente per ora (è "il contenuto", non un loading state, quindi non serve `<Skeleton>` animato).

#### `_components/Slogan.tsx` (Server)

```tsx
import type { SiteSettings } from '@repo/supabase'

export function Slogan({ settings }: { settings: SiteSettings | null }) {
  if (!settings?.slogan) return null
  return (
    <section className="container mx-auto px-4 py-8">
      <p className="text-xl md:text-2xl text-muted-foreground">{settings.slogan}</p>
    </section>
  )
}
```

Ritorna `null` (componente "nascondibile") quando il campo è vuoto. Stesso pattern per Bio.

#### `_components/Bio.tsx` (Server)

```tsx
import type { SiteSettings } from '@repo/supabase'

export function Bio({ settings }: { settings: SiteSettings | null }) {
  if (!settings?.bio) return null
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Chi siamo</h2>
      <p className="text-base leading-relaxed whitespace-pre-line">{settings.bio}</p>
    </section>
  )
}
```

`whitespace-pre-line` per rispettare i newline che il gestore inserirà nel backoffice.

#### `_components/OpeningHours.tsx` (Server)

Il campo `site_settings.opening_hours` è `Json` opaco. Parsing locale:

```tsx
import type { SiteSettings } from '@repo/supabase'

type DayHours = { open: string | null; close: string | null; closed: boolean }
type OpeningHoursMap = Record<
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
  DayHours
>

const DAYS: Array<{ key: keyof OpeningHoursMap; label: string }> = [
  { key: 'monday', label: 'Lunedì' },
  { key: 'tuesday', label: 'Martedì' },
  { key: 'wednesday', label: 'Mercoledì' },
  { key: 'thursday', label: 'Giovedì' },
  { key: 'friday', label: 'Venerdì' },
  { key: 'saturday', label: 'Sabato' },
  { key: 'sunday', label: 'Domenica' },
]

function parseHours(raw: SiteSettings['opening_hours'] | null | undefined): OpeningHoursMap | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as unknown as OpeningHoursMap
}

export function OpeningHours({ settings }: { settings: SiteSettings | null }) {
  const hours = parseHours(settings?.opening_hours)
  if (!hours) return null
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Orari</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DAYS.map(({ key, label }) => {
          const day = hours[key]
          const value = !day || day.closed || !day.open || !day.close ? 'Chiuso' : `${day.open} – ${day.close}`
          return (
            <div key={key} className="flex justify-between border-b border-border py-2">
              <dt>{label}</dt>
              <dd className="text-muted-foreground">{value}</dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
```

Cast `as unknown as OpeningHoursMap` è il **fallback narrow**: dato il seed garantisce la struttura, in MVP non serve validazione Zod runtime. Se in futuro l'admin permette di scrivere `opening_hours` arbitrari, aggiungere uno Zod schema in `@repo/supabase/src/schemas/site.ts` (out of scope qui).

#### `_components/NewsSection.tsx` (Server)

```tsx
import Image from 'next/image'
import type { NewsSlide } from '@repo/supabase'

export function NewsSection({ news }: { news: NewsSlide[] }) {
  if (news.length === 0) return null
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Novità</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {news.map((slide) => (
          <article key={slide.id} className="flex flex-col gap-3">
            {slide.image_url && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            )}
            <h3 className="text-lg font-semibold">{slide.title}</h3>
            {slide.body && <p className="text-sm text-muted-foreground">{slide.body}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}
```

`next/image` con i `remotePatterns` Supabase già configurati in `next.config.mjs` (sub-task Sprint 0).

#### `_components/Footer.tsx` (Server)

```tsx
import type { SiteSettings } from '@repo/supabase'

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const mapsUrl = settings?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
    : null
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <p className="font-semibold">{settings?.title ?? 'Nome del locale'}</p>
          {settings?.address && (
            <p className="text-muted-foreground">
              {mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {settings.address}
                </a>
              ) : (
                settings.address
              )}
            </p>
          )}
        </div>
        <div className="space-y-1">
          {settings?.phone && <p>Tel: <a href={`tel:${settings.phone}`} className="hover:underline">{settings.phone}</a></p>}
          {settings?.email && <p>Email: <a href={`mailto:${settings.email}`} className="hover:underline">{settings.email}</a></p>}
        </div>
        <div className="text-muted-foreground">
          © {new Date().getFullYear()} {settings?.title ?? 'Foras'}
        </div>
      </div>
    </footer>
  )
}
```

### 4. `app/error.tsx` (Client Error Boundary)

```tsx
'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container mx-auto px-4 py-24 text-center">
      <h2 className="text-2xl font-semibold mb-4">Si è verificato un errore</h2>
      <p className="text-muted-foreground mb-6">Riprova tra qualche istante.</p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
      >
        Riprova
      </button>
    </main>
  )
}
```

`'use client'` obbligatorio (gli error boundary dell'App Router sono client-side). Niente import di service o `@repo/supabase` qui — l'errore è già stato lanciato.

### 5. `app/loading.tsx` (Server)

```tsx
import { Skeleton } from '@repo/ui'

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="container mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    </main>
  )
}
```

Loading fallback minimo, copre il primo paint mentre Next sta facendo SSR — non sarà visibile spesso (SSR è già blocking), ma è la rete di sicurezza per navigazioni intra-app future.

## Vincoli

- **Solo Server Components** per i 6 componenti applicativi. L'unico file con `'use client'` qui è `app/error.tsx` (obbligo dell'App Router).
- **Tutti i fetch DB in `layout.tsx` (generateMetadata) e `page.tsx`.** I componenti ricevono dati via props, mai via query. Riferimento: backlog Sprint 3 "Nessuna query DB dentro i componenti".
- **Niente type duplicati:** importare `SiteSettings`, `NewsSlide` da `@repo/supabase` (già esportati dal barrel). Niente `type SiteSettings = { ... }` a mano.
- **Niente `any`.** Per `opening_hours`, cast narrow `as unknown as OpeningHoursMap` con guard runtime (`typeof raw === 'object' && !Array.isArray(raw)`).
- **Fallback su `null`:** ogni componente deve renderizzare correttamente quando il campo opzionale è `null`. Slogan/Bio ritornano `null` (componente "nascondibile"). Hero/Footer mostrano fallback testuale neutro. OpeningHours ritorna `null` se il JSON è malformato.
- **Niente `<Skeleton>` qui** (oltre a `loading.tsx`). I "contenuti secondari con skeleton" (Galleria) sono sub-task 03.
- **Niente `<Menu*>`, `<MenuClient>`, `<NewsPopup>`, `<Gallery>` qui** — sono sub-task 03.
- **Niente cambio di config** in `postcss.config.mjs`, `app/globals.css`, `next.config.mjs`, `tsconfig.json`, `packages/ui/*` — il sub-task 01 (e la milestone 2.5) li hanno chiusi. (Ricorda: TW4 è CSS-first, non esiste `tailwind.config.ts`.)
- **Non toccare** `apps/admin/*`, `packages/supabase/*`, `docs/*`, `app/api/health/route.ts`.
- **Tipografia neutra:** non introdurre Google Fonts né `next/font` qui. Il `body` eredita la `font-family: system-ui` definita dal preflight Tailwind. Custom font è Sprint 7.

## Output atteso

- `apps/web/app/layout.tsx` (riscritto: `generateMetadata` async, `body` con classi Tailwind base)
- `apps/web/app/page.tsx` (riscritto: fetch parallelo + render 6 sezioni)
- `apps/web/app/error.tsx` (nuovo)
- `apps/web/app/loading.tsx` (nuovo)
- `apps/web/app/_components/Hero.tsx` (nuovo)
- `apps/web/app/_components/Slogan.tsx` (nuovo)
- `apps/web/app/_components/Bio.tsx` (nuovo)
- `apps/web/app/_components/OpeningHours.tsx` (nuovo)
- `apps/web/app/_components/NewsSection.tsx` (nuovo)
- `apps/web/app/_components/Footer.tsx` (nuovo)
- Nessun altro file modificato

## Done when

- `pnpm -r tsc --noEmit` exit 0
- `pnpm --filter @repo/web build` exit 0
- `pnpm --filter @repo/web dev` → `http://localhost:3000` renderizza la home con dati seed dello schema `template`:
  - `<h1>` contiene "Nome del locale"
  - "Chi siamo" **non** appare (bio è null nel seed)
  - "Orari" appare con 7 giorni "Chiuso" (il seed di default ha `closed: true` su tutti)
  - "Novità" **non** appare (news_slides vuoto)
  - Footer mostra "Nome del locale" e `© 2026 Nome del locale`
- View Source (Ctrl+U) sulla home:
  - `<title>Nome del locale</title>` presente
  - `<meta name="description" content="Descrizione del locale — da personalizzare nel backoffice">` presente
  - `<meta property="og:title" content="Nome del locale">` presente
- Spegnendo temporaneamente Supabase (es. `.env.local` con URL errato) → `error.tsx` mostrato senza pagina rotta (test manuale, ripristinare env dopo)
- Nessun warning React/Next.js in console
- Nessun layout shift visibile (above-the-fold renderizzato SSR completo)

## Note per il master

1. **Verifica meta tag a riga di comando (alternativa a View Source):**
   ```bash
   curl -s http://localhost:3000 | grep -E '<title>|<meta'
   ```
2. **Smoke con bio popolata** (per vedere la sezione "Chi siamo"): nel SQL editor come service_role:
   ```sql
   UPDATE template.site_settings SET bio = 'Breve descrizione del locale...', slogan = 'Un posto dove stare bene', address = 'Via Roma 1, 20100 Milano', phone = '+39 02 1234567', email = 'info@locale.it' WHERE true;
   ```
   Ricaricare la home → tutte le sezioni opzionali devono apparire. Cleanup a fine sessione se non interessano lo stato del template.
3. **Verifica skeleton purge in prod**: dopo `pnpm --filter @repo/web build`, controllare con `grep -rl 'animate-pulse' apps/web/.next --include='*.css' | grep -v /cache/`. ⚠️ **Next 16 + Turbopack mette il CSS in `.next/static/chunks/`, non in `.next/static/css/`** (verificato nel sub-task 01) — non cercare solo in `static/css/` o avrai un falso negativo. Se `animate-pulse` non compare da nessuna parte, allora la direttiva `@source '../../../packages/ui/src'` in `globals.css` non sta includendo i sorgenti di `@repo/ui` (regression del sub-task 01).
4. **`generateMetadata` fa 1 query a request**: accettato per MVP. Caching via `unstable_cache` / `revalidate` tag è post-MVP.
5. **Suggerito:** `/model claude-sonnet-4-6`, `/effort medium`. Scope SSR puro, niente interattività, vincoli ben chiusi.
6. **Commit:** `feat(web): add SSR homepage with dynamic metadata and headless sections`
7. Frontmatter → `status: DONE`. Procedere al sub-task 03 (menu + popup + gallery skeleton).
