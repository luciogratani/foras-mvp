---
status: DRAFT
updated: 2026-05-20
area: ai-playbooks
type: index
tags: [foras-mvp, ai-playbooks, prompts]
owner: master-chat
---

# Prompts — archivio sessioni sub-chat

Questa cartella contiene i prompt scritti dal master per le sub-chat, secondo le regole di [[workflow-master-sub]].

## Convenzione naming

```
YYYY-MM-DD_[fase]_[descrizione-breve].md
```

## Stato

Ogni file di prompt ha nel frontmatter:

- `status: DRAFT` → scritto, non ancora eseguito
- `status: IN_PROGRESS` → in esecuzione su una sub-chat
- `status: DONE` → eseguito e mergiato in repo

I prompt non vanno mai eliminati: restano come traccia delle sessioni.

## Sprint 0 — set di prompt

Lo Sprint 0 è suddiviso in 5 sub-task per limitare il consumo token di ogni sub-chat e isolare i fallimenti:

1. [[2026-05-20_sprint0_01_monorepo-root]] — Root del monorepo (pnpm workspaces, tsconfig base, ESLint, Prettier, .env.example, README repo)
2. [[2026-05-20_sprint0_02_apps-web]] — Scaffold `/apps/web` con Next.js App Router su porta 3000
3. [[2026-05-20_sprint0_03_apps-admin]] — Scaffold `/apps/admin` con Next.js App Router su porta 3001
4. [[2026-05-20_sprint0_04_packages]] — `/packages/supabase` (client condiviso) e `/packages/ui` (placeholder shadcn)
5. [[2026-05-20_sprint0_05_supabase-smoke]] — Connessione Supabase e smoke test query

Il task **"deploy preview Vercel"** del backlog Sprint 0 resta a carico del master e si esegue manualmente al termine dei 5 sub-task — non viene delegato a sub-chat.

## Ordine di esecuzione

Esecuzione sequenziale, un sub-task per volta. Dopo ogni sub-task: commit + push + aggiornamento [[backlog]].
