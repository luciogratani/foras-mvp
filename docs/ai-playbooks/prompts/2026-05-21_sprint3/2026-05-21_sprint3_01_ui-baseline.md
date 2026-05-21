---
status: DONE
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 3
order: 1
tags: [foras-mvp, sprint3, ui, tailwind4, shadcn]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: high
---

# Sprint 3 / 1 of 3 — UI baseline (Tailwind 4 + shadcn + `<Skeleton>` in `@repo/ui`)

## Contesto

Apre i sub-task UI di Sprint 3 (homepage pubblica SSR). **Prerequisito già chiuso:** la milestone Sprint 2.5 ha portato il monorepo su **Next 16 + React 19 + @supabase/ssr 0.10** (vedi `prompts/2026-05-21_stack-upgrade/`). Questo sub-task gira sul nuovo stack.

Oggi `packages/ui/src/index.ts` è `export {}`, `apps/web/app/globals.css` ha solo un reset minimo, e **Tailwind non è installato** (la milestone 2.5 era framework-only, di proposito). Questo sub-task fa **solo l'infrastruttura UI**: Tailwind 4 in `apps/web`, shadcn inizializzato in `@repo/ui`, `<Skeleton>` importabile e funzionante. Nessun componente applicativo (Hero/Menu/News arrivano nei sub-task 02 e 03).

**Decisione master (decision-log 2026-05-21 — Upgrade stack major):** Tailwind **4** (non 3). `tailwindcss@latest` è v4 e `shadcn@latest` la assume di default. TW4 è **CSS-first**: niente `tailwind.config.ts`, il theming vive nel CSS con `@theme`, e in un monorepo i sorgenti dei package esterni si includono con la direttiva `@source`.

**Decisione master:** shadcn vive in `@repo/ui` (single source of truth per le primitives condivise tra `apps/web` e `apps/admin`). I componenti applicativi (Hero, MenuClient, ecc.) vivono in `apps/web/app/_components/`, non in `@repo/ui`.

### Nota — knowledge cutoff

Tailwind 4 stable è di inizio 2025 (dentro il cutoff), ma `shadcn@latest` (v4.x) può essere evoluto dopo gennaio 2026. Se il comportamento di `shadcn init`/`add` diverge da questo prompt, **vince la doc ufficiale**: `https://ui.shadcn.com/docs/tailwind-v4` e `https://ui.shadcn.com/docs/monorepo`. Segnalare al master e procedere secondo la doc.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce *2026-05-21 — Upgrade stack major* (perché TW4, target versioni)
- `docs/tech-architecture/monorepo-structure.md` — Modello A, `transpilePackages`, naming `@repo/<nome>`
- `docs/tech-architecture/architettura-fullstack.md` — sezione "Strategia di caricamento — homepage pubblica" (motiva perché `<Skeleton>` esiste)
- `docs/build-delivery/backlog.md` — "Sprint 3 — Homepage pubblica SSR (con menu)"
- `apps/web/next.config.mjs` — `transpilePackages: ['@repo/ui', '@repo/supabase']` già impostato (verificare che la milestone 2.5 non l'abbia cambiato), **non riscrivere**
- `apps/web/app/globals.css` — file da riscrivere
- `apps/web/package.json`, `apps/web/tsconfig.json` — stato post-upgrade (Next 16 / React 19)
- `packages/ui/package.json`, `packages/ui/src/index.ts`, `packages/ui/tsconfig.json` — stato attuale (vuoti)
- Doc ufficiale: `https://ui.shadcn.com/docs/tailwind-v4` e `https://ui.shadcn.com/docs/monorepo` (riferimento primario)

## Scope

### 1. Tailwind 4 in `apps/web`

Aggiungere come **devDependencies** in `apps/web/package.json`:

```jsonc
{
  "devDependencies": {
    "tailwindcss": "^4.3.0",
    "@tailwindcss/postcss": "^4.3.0",
    "tw-animate-css": "^1.4.0"
  }
}
```

> TW4 NON usa più `autoprefixer` né `postcss-import` separati (inclusi nell'engine). `tailwindcss-animate` è deprecato in TW4 → si usa `tw-animate-css`.

Creare `apps/web/postcss.config.mjs`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**Niente `tailwind.config.ts`.** TW4 è CSS-first: la configurazione (theme, sorgenti) vive in `globals.css`.

Riscrivere `apps/web/app/globals.css` col preset shadcn "new-york" / `baseColor: neutral` per TW4:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

/* Monorepo: includi i sorgenti di @repo/ui nel content detection,
   altrimenti le classi usate solo dentro i componenti shadcn vengono
   eliminate dal build di produzione. Path relativo a questo file. */
@source '../../../packages/ui/src';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

> Questi sono i token shadcn "new-york"/neutral correnti. Se `shadcn init` per TW4 genera valori diversi (es. aggiunge `--chart-*`, `--sidebar-*`), lasciar fare alla CLI ed eliminare solo i blocchi palesemente non usati. **Verificare i valori sulla doc** se la CLI non li scrive da sé.

> **Verifica path `@source`:** da `apps/web/app/globals.css`, `../../../packages/ui/src` risolve a `<root>/packages/ui/src`. Confermare contando le risalite: `app/` → `web/` → `apps/` → root.

### 2. shadcn in `packages/ui`

Aggiungere come **dependencies** in `packages/ui/package.json`:

```jsonc
{
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.469.0"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0"
  }
}
```

Creare `packages/ui/src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Creare manualmente `packages/ui/components.json` (per evitare il prompt interattivo di `shadcn init`). Schema TW4:

```jsonc
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../apps/web/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@repo/ui/components",
    "utils": "@repo/ui/lib/utils",
    "ui": "@repo/ui/components/ui",
    "lib": "@repo/ui/lib",
    "hooks": "@repo/ui/hooks"
  },
  "iconLibrary": "lucide"
}
```

> In TW4 `tailwind.config` è stringa **vuota** (niente file config). `css` punta a `globals.css` (path relativo da `packages/ui/`: `../../apps/web/app/globals.css`). Le CSS variables le abbiamo già scritte al passo 1 → `shadcn add` non dovrebbe modificare il CSS.

Aggiungere `<Skeleton>`:

```bash
pnpm --filter @repo/ui dlx shadcn@latest add skeleton
```

Deve creare `packages/ui/src/components/ui/skeleton.tsx`. Se la CLI va in modalità interattiva (chiede di re-inizializzare), aggiungere `--yes` o appianare `components.json` finché si sblocca. Se proprio non collabora, fallback manuale (skeleton è ~6 righe — copiare dalla doc "Manual"). **Non installare altri componenti qui** (Tabs/Dialog/Button sono nel sub-task 03).

### 3. Re-export da `@repo/ui`

Riscrivere `packages/ui/src/index.ts`:

```ts
export { cn } from './lib/utils'
export { Skeleton } from './components/ui/skeleton'
```

### 4. `packages/ui/package.json` — meta

`main`/`types` puntano già a `src/index.ts` (non toccare). Aggiungere `"sideEffects": false` per il tree-shaking.

### 5. Verifiche finali

- `pnpm install` da root (aggiorna lockfile)
- `pnpm -r tsc --noEmit` exit 0
- `pnpm --filter @repo/web build` exit 0 (continua a renderizzare lo stub `app/page.tsx`)
- **Smoke runtime:** modificare temporaneamente `apps/web/app/page.tsx` per renderizzare `<Skeleton className="h-8 w-32" />`, lanciare `pnpm --filter @repo/web dev`, verificare il box skeleton con animazione `pulse`. **Annullare la modifica** a `page.tsx` prima del commit (resta lo stub `<h1>Foras — web app</h1>`; lo riscrive il sub-task 02).
- **Verifica purge prod:** dopo il build, `grep -r 'animate-pulse' apps/web/.next/static/css/` deve trovare la classe. Se manca, il `@source` in `globals.css` non sta includendo `packages/ui/src` → ricontrollare il path relativo.

## Vincoli

- **Tailwind 4 CSS-first.** Niente `tailwind.config.ts`. Theming in `globals.css` via `@theme`/CSS variables. Sorgenti monorepo via `@source`.
- **shadcn vive in `@repo/ui`**, non in `apps/web`. Single source of truth per `apps/admin` (Sprint 5).
- **`apps/web` importa shadcn solo da `@repo/ui`** (barrel `src/index.ts`), mai da path relativi `@repo/ui/src/...`.
- **Nessun componente applicativo qui** (Hero/Menu/News sono 02 e 03).
- **`apps/admin` NON va toccato.** Il suo setup Tailwind/shadcn arriva in Sprint 5.
- **`apps/web/next.config.mjs`**: leggere, non riscrivere (`transpilePackages` già a posto).
- **Stile shadcn:** `new-york`, `baseColor: neutral`. Niente personalizzazione palette (è Sprint 7).
- **Versione React 19** ovunque: `peerDependencies` di `@repo/ui` su `^19` (lo stack è già su React 19 dalla milestone 2.5). Nessun React 18 residuo.
- **Non toccare** `packages/supabase/*`, `apps/admin/*`, `docs/*`, `pnpm-workspace.yaml`, `tsconfig.base.json`.

## Output atteso

- `apps/web/postcss.config.mjs` (nuovo, `@tailwindcss/postcss`)
- `apps/web/app/globals.css` (riscritto: TW4 `@import` + `@source` + `@theme` + CSS variables)
- `apps/web/package.json` (devDeps: tailwindcss 4, @tailwindcss/postcss, tw-animate-css)
- **Nessun** `apps/web/tailwind.config.ts` (TW4 CSS-first)
- `packages/ui/package.json` (deps shadcn; peer react ^19; `sideEffects: false`)
- `packages/ui/components.json` (nuovo, schema TW4)
- `packages/ui/src/lib/utils.ts` (nuovo, `cn`)
- `packages/ui/src/components/ui/skeleton.tsx` (creato da shadcn add)
- `packages/ui/src/index.ts` (re-export `cn` + `Skeleton`)
- `pnpm-lock.yaml` aggiornato
- Nessun altro file modificato

## Done when

- `pnpm -r tsc --noEmit` exit 0
- `pnpm --filter @repo/web build` exit 0
- `import { Skeleton } from '@repo/ui'` funziona da un Server Component in `apps/web`
- `<Skeleton className="h-8 w-32" />` rende a runtime con animazione `pulse`
- `grep -r 'animate-pulse' apps/web/.next/static/css/` trova la classe (purge corretto via `@source`)
- `apps/web/app/page.tsx` invariato (stub); `apps/admin/` invariato

## Note per il master

1. **Rischio principale:** `shadcn@latest` su TW4 può comportarsi diversamente da come descritto (versione successiva al cutoff). La doc `https://ui.shadcn.com/docs/tailwind-v4` è la fonte di verità. Fallback skeleton manuale se la CLI non collabora.
2. **`@source` è il punto critico del monorepo in TW4** (l'equivalente del `content` di TW3). Se gli stili shadcn spariscono in produzione, è quasi sempre il path di `@source` sbagliato. Verificare con la grep sul CSS buildato.
3. **OKLCH richiede browser moderni** (Safari 16.4+, Chrome 111+). Accettabile nel 2026 per un sito pubblico; è il default shadcn TW4.
4. **Suggerito:** `/model claude-sonnet-4-6`, `/effort high`. Config CSS-first + rischio interattività CLI.
5. **Commit:** `chore(ui): set up tailwind 4 and shadcn baseline with skeleton primitive`
6. Frontmatter → `status: DONE`. Procedere al sub-task 02 (homepage SSR + metadata).
