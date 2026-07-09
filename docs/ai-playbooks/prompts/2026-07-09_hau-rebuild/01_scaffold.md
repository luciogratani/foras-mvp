---
status: DONE
phase: 0
created: 2026-07-09
completed: 2026-07-09
owner: master-chat
model: Sonnet 5
effort: medium
---

# Fase 0 — Scaffold Next app in `apps/hau`

## Contesto

Iniziativa "ricostruzione hau": ricostruire il sito vetrina **hau.studio** (oggi
uno snapshot Nuxt compilato in `apps/hau-nuxt-build/`, READ-ONLY) come vera app
**Next.js + React** in `apps/hau/`. Questa è la **Fase 0**: solo lo scaffold
meccanico dell'app, nessun contenuto reale, nessuna logica. Serve a sbloccare le
fasi successive (decoder contenuto, design tokens, loading screen + navbar + home).

Contesto completo dell'iniziativa (leggilo, ma NON è compito di questa fase
implementarlo): `docs/ai-playbooks/prompts/2026-07-09_hau-rebuild/00_HANDOFF-roadmap.md`.

**hau è STANDALONE**: NON è un tenant del modello foras. Niente Supabase, niente
RLS, niente `@repo/supabase`, niente `@repo/ui`, niente variabili d'ambiente. È
un'app Next isolata dentro il monorepo pnpm.

## File da leggere prima di iniziare

- `apps/web/package.json`, `apps/web/next.config.mjs`, `apps/web/tsconfig.json`,
  `apps/web/postcss.config.mjs`, `apps/web/app/layout.tsx`,
  `apps/web/app/globals.css` — convenzioni da COPIARE (versioni pinnate, struttura
  app-router, setup Tailwind v4).
- `apps/admin/package.json` — seconda referenza per lo stile.
- `tsconfig.base.json`, `eslint.config.mjs`, `package.json` (root),
  `pnpm-workspace.yaml`, `.nvmrc` — config condivise del monorepo.

## Scope

Creare in `apps/hau/` uno scaffold Next minimale e funzionante che builda,
typechecka e linta pulito, e serve una pagina placeholder sulla porta **3002**.

File da creare:

1. **`apps/hau/package.json`**
   - `name`: `@repo/hau`, `version`: `0.1.0`, `private: true`.
   - Scripts identici per forma a web/admin, ma porta **3002**:
     `dev: "next dev -p 3002"`, `build: "next build"`, `start: "next start -p 3002"`,
     `lint: "eslint ."`, `tsc: "tsc"`.
   - `dependencies`: SOLO `next` (16.2.6), `react` (19.2.6), `react-dom` (19.2.6).
     **NON** aggiungere `@repo/supabase`, `@repo/ui`, `@supabase/*`, `server-only`.
   - `devDependencies`: come web — `@tailwindcss/postcss` (^4.3.0),
     `tailwindcss` (^4.3.0), `@types/node` (^20.17.57), `@types/react` (19.2.15),
     `@types/react-dom` (19.2.3), `typescript` (^5.8.3). **Ometti `tw-animate-css`**
     (serve solo agli stili shadcn di `@repo/ui`, che qui non c'è).

2. **`apps/hau/next.config.mjs`**
   - Minimale. **Nessun** `transpilePackages` (non ci sono pacchetti workspace da
     transpilare). **Nessun** `images.remotePatterns` per Supabase.
   - Includi `poweredByHeader: false` (buona pratica, coerente con F-05 dell'audit
     sicurezza). Lascia commentata una nota che `images.remotePatterns` per il CDN
     media (`offland.wedesignwecode.com`) verrà valutato nelle fasi successive —
     per ora i media non sono ancora integrati.

3. **`apps/hau/tsconfig.json`**
   - `extends: "../../tsconfig.base.json"`, stessa forma di web (plugin next,
     `strict`, `include`/`exclude` identici).
   - **NON** riportare gli alias `@repo/*` (non servono). Definisci invece un
     alias self `"@/*": ["./*"]` sotto `paths`, con `baseUrl: "."`.

4. **`apps/hau/postcss.config.mjs`** — identico a web (`@tailwindcss/postcss`).

5. **`apps/hau/app/globals.css`**
   - Minimale: `@import 'tailwindcss';` e un blocco `@theme`/`:root` essenziale
     (giusto background/foreground di base). **NON** copiare il blocco shadcn
     completo di web né la riga `@source '../../../packages/ui/src'` (qui `@repo/ui`
     non esiste). I design token reali arriveranno in Fase 2.

6. **`apps/hau/app/layout.tsx`**
   - Root layout minimale. `<html lang="en">` (hau.studio è un sito **inglese**,
     non italiano come web). `metadata` statico placeholder (`title: 'HAU'`).
     `import './globals.css'`. Niente fetch Supabase, niente logica maintenance.

7. **`apps/hau/app/page.tsx`**
   - Pagina placeholder Server Component (es. un `<main>` con "HAU — rebuild in
     progress"). Solo per verificare che l'app monti e serva.

8. **`apps/hau/README.md`** — 4-6 righe: cos'è (rebuild Next di hau.studio),
   porta 3002, come avviarla (`pnpm --filter @repo/hau dev`), rimando al handoff.

9. **`apps/hau/public/.gitkeep`** — placeholder (i media verranno mirrorati qui in
   Fase 6).

10. **`apps/hau/.gitignore`** — se web/admin non ne hanno uno locale, salta (il
    root `.gitignore` copre `.next`, `node_modules`). Verifica prima; non
    duplicare regole già coperte dal root.

Modifica al root:

11. **`package.json` (root)** — aggiungi lo script `"dev:hau": "pnpm --filter @repo/hau dev"`
    accanto a `dev:web`/`dev:admin`. Non toccare altro.

Poi esegui `pnpm install` dalla root per registrare il nuovo workspace e
aggiornare `pnpm-lock.yaml`.

## Vincoli

- **NON toccare** `apps/hau-nuxt-build/` (read-only), né `apps/web/`, `apps/admin/`,
  né `packages/`. L'unica modifica fuori da `apps/hau/` è lo script `dev:hau` nel
  `package.json` root.
- **Nessuna dipendenza** oltre a quelle elencate. Se pensi ne serva un'altra,
  **fermati e segnalalo** invece di aggiungerla.
- Rispetta le versioni **pinnate esatte** dove web le pinna esatte (es. `next`
  `16.2.6`, non `^16`).
- Nessun contenuto reale del sito, nessun `demo.js`, nessun asset: questa fase è
  solo lo scheletro.
- Usa `type`-only imports dove serve (la regola eslint
  `consistent-type-imports` è attiva a livello root).

## Output atteso

- I file sopra creati in `apps/hau/`.
- `pnpm-lock.yaml` aggiornato.
- Script `dev:hau` nel root `package.json`.

## Done when

- `pnpm install` completa senza errori.
- `pnpm --filter @repo/hau build` → build verde.
- `pnpm --filter @repo/hau tsc` → nessun errore TypeScript.
- `pnpm --filter @repo/hau lint` → nessun errore ESLint.
- `pnpm --filter @repo/hau dev` avvia il server su **http://localhost:3002** e la
  pagina placeholder risponde 200 (verifica nel browser o con `curl`).
- Nessun file modificato fuori dallo scope dichiarato (diff pulito).
