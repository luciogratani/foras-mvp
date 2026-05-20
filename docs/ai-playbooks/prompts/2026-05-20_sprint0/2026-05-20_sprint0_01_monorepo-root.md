---
status: DONE
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 0
order: 1
tags: [foras-mvp, sprint0, monorepo, setup]
owner: master-chat
---

# Sprint 0 / 1 of 5 — Root monorepo pnpm workspaces

## Contesto

Foras MVP è un sistema multi-tenant per siti di bar e ristoranti. Ogni cliente nasce come fork di questo `repo-template`. Stiamo eseguendo lo Sprint 0 (Phase 0 nel runbook): scaffolding del monorepo. Questo è il primo dei 5 sub-task: setup della **radice** del monorepo, prima di scaffoldare apps e packages.

## File da leggere prima di iniziare

- `docs/README.md` — contesto progetto, stack, convenzioni Obsidian
- `docs/tech-architecture/monorepo-structure.md` — Modello A, struttura cartelle attesa, script pnpm, package naming `@repo/*`
- `docs/build-delivery/runbook-implementazione.md` — sezione "Phase 0 — Monorepo Setup" (working rules, Done when)
- `docs/build-delivery/backlog.md` — sezione "Sprint 0"

Non leggere altri file fuori da questi: il task è limitato alla root del repo.

## Scope

Creare **solo** la radice del monorepo. Non scaffoldare ancora le apps né i packages: quelli sono nei sub-task successivi.

File/cartelle da creare alla radice di `foras-mvp/`:

1. `package.json` (root) — `private: true`, `packageManager: pnpm@9.x`, scripts root (`dev:web`, `dev:admin`, `build`, `lint`, `typecheck`) che usano `pnpm --filter`
2. `pnpm-workspace.yaml` con `apps/*` e `packages/*`
3. `tsconfig.base.json` — config TypeScript condivisa (`strict: true`, `target: ES2022`, `moduleResolution: bundler`, path aliases `@repo/supabase`, `@repo/ui`)
4. `.eslintrc.cjs` o `eslint.config.mjs` — config condivisa Next.js + TypeScript (preset `next/core-web-vitals`)
5. `.prettierrc` + `.prettierignore` — regole formattazione condivise
6. `.editorconfig` — coerenza tab/spazi tra editor
7. `.nvmrc` con Node `20.x` LTS
8. `.env.example` con le tre variabili tenant:
   - `NEXT_PUBLIC_SUPABASE_URL=`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
   - `NEXT_PUBLIC_SUPABASE_SCHEMA=template`
9. `README.md` di repo (separato da `docs/README.md`) — 30-50 righe: nome progetto, comando setup (`pnpm install`), comando dev, link a `docs/README.md` come fonte autoritativa
10. Cartelle vuote con `.gitkeep`: `apps/`, `packages/`, `migrations/`

Non creare ancora:
- `apps/web/` (sub-task 2)
- `apps/admin/` (sub-task 3)
- `packages/supabase/` né `packages/ui/` (sub-task 4)
- `schema.sql` né `migrations/001_init.sql` (Sprint 1)

## Vincoli

- pnpm versione **9.x** (non 8, non 10)
- Node **20 LTS**
- Package naming `@repo/<nome>` come da `monorepo-structure.md`
- TypeScript `strict: true` obbligatorio
- Nessun Turborepo / Nx / Lerna — solo pnpm workspaces
- Nessuna dipendenza non strettamente necessaria a questo step (no Husky, no lint-staged, no Tailwind alla root — quelli arrivano nei sub-task delle apps)
- Non modificare `.gitignore` (già esistente alla radice)
- Non toccare la cartella `docs/` né `reference/`

## Output atteso

- Tutti i file elencati in "Scope" presenti alla radice
- `pnpm install` (dry-run mentale: deve essere sintatticamente valido, non c'è nulla da installare ancora)
- `pnpm-workspace.yaml` referenzia `apps/*` e `packages/*` con `.gitkeep` dentro
- Output finale: lista dei file creati e relativo contenuto sintetico

## Done when

- `pnpm-workspace.yaml` è presente e valido
- `tsconfig.base.json` ha path aliases per `@repo/supabase` e `@repo/ui` (anche se i pacchetti non esistono ancora)
- `.env.example` contiene le 3 variabili richieste con commento di una riga ciascuna
- `package.json` root è `private: true` e non dichiara dipendenze runtime, solo `devDependencies` minime (typescript, prettier, eslint, eventuali tipi)
- Nessun file fuori scope creato o modificato
- README root spiega in 5 righe come avviare l'ambiente e rimanda a `docs/README.md`

## Note per il master

Dopo l'esecuzione di questo prompt:
1. Commit: `chore(monorepo): scaffold root pnpm workspace`
2. Aggiornare frontmatter di questo file a `status: DONE`
3. Procedere al sub-task 2 (`2026-05-20_sprint0_02_apps-web.md`)
