---
status: DONE
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 0
order: 4
tags: [foras-mvp, sprint0, packages, supabase, ui]
owner: master-chat
---

# Sprint 0 / 4 of 5 — Scaffold `packages/supabase` e `packages/ui`

## Contesto

Quarto dei 5 sub-task dello Sprint 0. Root, `apps/web` e `apps/admin` sono già scaffoldate. Ora vanno creati i due package condivisi: `@repo/supabase` (client e service layer condiviso, vuoto in questa fase) e `@repo/ui` (componenti shadcn condivisi, vuoto in questa fase). Solo scaffold: implementazione del client e dei servizi è negli Sprint 1-2.

## File da leggere prima di iniziare

- `docs/tech-architecture/monorepo-structure.md` — sezione "Struttura monorepo" (per i nomi `@repo/*`)
- `docs/tech-architecture/architettura-fullstack.md` — solo paragrafi su client Supabase e package separato (no service layer dettagliato)
- `tsconfig.base.json` (sub-task 1) — capire i path aliases

Non leggere `data-model.md`, niente sui servizi né sui Sprint successivi.

## Scope

Creare due package vuoti ma importabili:

```
packages/
  supabase/
    src/
      index.ts            ← export {}; (placeholder)
      client.ts           ← TODO comment + export di una funzione factory `createSupabaseClient()` non implementata (throw new Error('not implemented yet'))
      types/
        .gitkeep          ← qui andrà database.ts generato da Supabase CLI in Sprint 1
    package.json          ← name "@repo/supabase", main "src/index.ts", types "src/index.ts", peerDep "@supabase/supabase-js"
    tsconfig.json         ← extends ../../tsconfig.base.json
    README.md             ← 10 righe: scopo del package, "non implementato qui in Sprint 0"

  ui/
    src/
      index.ts            ← export {};
    package.json          ← name "@repo/ui", main "src/index.ts"
    tsconfig.json         ← extends ../../tsconfig.base.json
    README.md             ← 5 righe: placeholder per shadcn condiviso
```

Path aliases in `tsconfig.base.json` (già impostati al sub-task 1) devono risolvere a:

- `@repo/supabase` → `packages/supabase/src/index.ts`
- `@repo/ui` → `packages/ui/src/index.ts`

## Vincoli

- Nessuna implementazione di service functions (`getSiteSettings`, `getMenuBySection`, ecc.): out of scope, vanno in Sprint 2
- Nessun componente shadcn / nessuna installazione di `lucide-react`, `class-variance-authority`, `tailwindcss`, ecc.: out of scope
- `@supabase/supabase-js` come **peer dependency**, non come dependency diretta
- TypeScript `strict: true` (eredita dalla base)
- Non aggiungere build step: i package esportano direttamente da `src/` (Next.js li transpila via `transpilePackages`)
- Non toccare `apps/web` o `apps/admin`

## Output atteso

- Le due cartelle complete con tutti i file elencati
- Da `apps/web` e `apps/admin`: `import { } from '@repo/supabase'` e `'@repo/ui'` non danno errori TypeScript (anche se gli export sono vuoti)
- `pnpm -r tsc --noEmit` continua a essere pulito su tutto il monorepo

## Done when

- `pnpm install` completa senza errori
- `pnpm -r tsc --noEmit` exit 0 su tutto il monorepo (root, apps/web, apps/admin, packages/supabase, packages/ui)
- `client.ts` esporta una factory `createSupabaseClient()` che lancia errore esplicito "not implemented yet" — placeholder verificabile

## Note per il master

1. Commit: `feat(packages): scaffold @repo/supabase and @repo/ui placeholders`
2. Frontmatter → `status: DONE`
3. Procedere al sub-task 5 (Supabase smoke test)
