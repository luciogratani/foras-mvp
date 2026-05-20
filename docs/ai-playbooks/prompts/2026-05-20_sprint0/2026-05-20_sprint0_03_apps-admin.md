---
status: DONE
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 0
order: 3
tags: [foras-mvp, sprint0, nextjs, apps, admin]
owner: master-chat
---

# Sprint 0 / 3 of 5 — Scaffold `apps/admin` (Next.js App Router)

## Contesto

Terzo dei 5 sub-task dello Sprint 0. La radice del monorepo e `apps/web` sono già scaffoldate. Ora va creata l'app admin (backoffice CRUD) sulla porta 3001. Logica di auth e RLS arriva in Sprint 1: qui solo lo scheletro.

## File da leggere prima di iniziare

- `docs/tech-architecture/monorepo-structure.md` — sezione "Script principali"
- `docs/build-delivery/runbook-implementazione.md` — sezione "Phase 0"
- `apps/web/` esistente (sub-task 2 appena completato) — replicare la stessa convenzione

Non leggere documenti su data-model, RLS o auth: out of scope.

## Scope

Scaffoldare `apps/admin/` con stessa convenzione di `apps/web/`, ma porta 3001 e name `@repo/admin`. **Nessuna logica di auth o CRUD** in questo sub-task.

Struttura attesa:

```
apps/admin/
  app/
    layout.tsx            ← layout minimo
    page.tsx              ← placeholder: <h1>Foras — admin panel</h1>
    globals.css           ← reset minimo
  public/
    .gitkeep
  next.config.mjs         ← transpilePackages: ['@repo/ui', '@repo/supabase']
  tsconfig.json           ← extends ../../tsconfig.base.json
  package.json            ← name "@repo/admin", dev su porta 3001
  .eslintrc.cjs
  README.md               ← 10 righe: cosa è, come lanciarla
```

## Vincoli

- Next.js 14.x App Router, React 18 (stessa versione di `apps/web` per consistenza)
- `"name": "@repo/admin"`, `"private": true`
- Script `dev` su **porta 3001** (`next dev -p 3001`)
- Nessuna dipendenza extra rispetto a `apps/web`: solo `next`, `react`, `react-dom`, `@types/react`, `@types/node`
- Niente Tailwind, shadcn, `@dnd-kit/core`, lucide o altre lib del Sprint 5 — quelle arrivano dopo il freeze del template-core
- Non creare middleware, route protette, `lib/auth.ts`: roba dello Sprint 1
- Non toccare `apps/web/` né i file root

## Output atteso

- Cartella `apps/admin/` completa
- `pnpm --filter @repo/admin dev` → `http://localhost:3001`
- `pnpm --filter @repo/admin build` exit 0
- Le due app possono girare in parallelo (3000 + 3001) da terminali separati

## Done when

- `pnpm --filter @repo/admin dev` → 3001 senza errori
- `pnpm --filter @repo/admin build` exit 0
- `pnpm -r tsc --noEmit` pulito su entrambe le app
- Convenzioni identiche a `apps/web` (file structure, scripts, eslint)

## Note per il master

1. Commit: `feat(admin): scaffold Next.js App Router skeleton`
2. Frontmatter → `status: DONE`
3. Procedere al sub-task 4 (packages)
