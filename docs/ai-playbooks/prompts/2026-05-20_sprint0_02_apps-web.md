---
status: DRAFT
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 0
order: 2
tags: [foras-mvp, sprint0, nextjs, apps]
owner: master-chat
---

# Sprint 0 / 2 of 5 — Scaffold `apps/web` (Next.js App Router)

## Contesto

Secondo dei 5 sub-task dello Sprint 0. La radice del monorepo è già scaffoldata (sub-task 1 completato). Ora va creata **solo** l'app pubblica `apps/web` — homepage SSR per il visitatore finale. L'admin panel sarà nel sub-task successivo.

## File da leggere prima di iniziare

- `docs/tech-architecture/monorepo-structure.md` — sezione "Struttura monorepo" e "Script principali"
- `docs/tech-architecture/architettura-fullstack.md` — solo le sezioni sullo stack e sulla homepage pubblica (no service layer, no DB)
- `docs/build-delivery/runbook-implementazione.md` — sezione "Phase 0"
- `package.json` root e `tsconfig.base.json` appena creati al sub-task 1

Non leggere `data-model.md` né i prompt di Sprint successivi.

## Scope

Scaffoldare `apps/web/` con Next.js App Router. **Non implementare ancora alcuna logica di business** — solo lo scheletro che gira.

Struttura attesa:

```
apps/web/
  app/
    layout.tsx            ← layout minimo con <html><body>{children}</body></html>
    page.tsx              ← placeholder: <h1>Foras — web app</h1>
    globals.css           ← reset minimo, no Tailwind ancora
  public/
    .gitkeep
  next.config.mjs         ← config minima; transpilePackages: ['@repo/ui', '@repo/supabase']
  tsconfig.json           ← extends ../../tsconfig.base.json
  package.json            ← name "@repo/web", scripts dev/build/start su porta 3000, deps next/react/react-dom
  .eslintrc.cjs           ← extends "next/core-web-vitals" e config root
  README.md               ← 10 righe: cosa è, come lanciarla
```

## Vincoli

- **Next.js 14.x** (App Router, non Pages Router)
- React 18
- `package.json` deve avere `"name": "@repo/web"`, `"private": true`
- Script `dev` deve girare su **porta 3000** (`next dev -p 3000`)
- TypeScript `strict: true` ereditato da `tsconfig.base.json`
- Nessun import da `@repo/supabase` o `@repo/ui` ancora (quei package non esistono): solo dichiarati in `transpilePackages` per quando esisteranno
- **Non installare** Tailwind, shadcn, lucide, Zod, Resend o altre dipendenze — solo `next`, `react`, `react-dom`, `@types/react`, `@types/node`
- Non creare cartelle `components/`, `lib/`, `services/` o simili — solo quello listato
- Non modificare file fuori da `apps/web/` né la root `package.json`

## Output atteso

- Cartella `apps/web/` completa con i file elencati
- `pnpm install` dalla root completa senza errori (Next.js installato dentro `apps/web/node_modules`)
- `pnpm --filter @repo/web dev` apre `http://localhost:3000` mostrando "Foras — web app"
- `pnpm --filter @repo/web build` completa senza errori
- Lista dei file creati al termine

## Done when

- `pnpm --filter @repo/web dev` → 3000 senza errori
- `pnpm --filter @repo/web build` esce con exit code 0
- `pnpm --filter @repo/web tsc --noEmit` pulito
- Nessuna dipendenza fuori dal set minimo elencato in "Vincoli"

## Note per il master

Dopo l'esecuzione:
1. Commit: `feat(web): scaffold Next.js App Router skeleton`
2. Frontmatter di questo file → `status: DONE`
3. Procedere al sub-task 3 (`apps/admin`)
