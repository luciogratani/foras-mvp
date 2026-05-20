---
status: DRAFT
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 1
order: 2
tags: [foras-mvp, sprint1, supabase, types, codegen]
owner: master-chat
---

# Sprint 1 / 2 of 5 — Generazione tipi TypeScript da Supabase

## Contesto

Lo schema `template` è ora applicato su Supabase (sub-task 01 completato). Questo sub-task genera i tipi TypeScript dal DB così che client e service layer siano tipati end-to-end. I tipi vivono in `@repo/supabase` (cartella `src/types/` già scaffoldata con `.gitkeep` in Sprint 0).

## File da leggere prima di iniziare

- `docs/tech-architecture/monorepo-structure.md` — sezione "Script principali", riga con `supabase gen types typescript` (comando di riferimento)
- `packages/supabase/package.json` — capire come aggiungere lo script e la devDependency `supabase`
- `packages/supabase/src/index.ts` — dove ri-esportare i tipi
- `.env.example` — variabili esistenti

## Scope

1. Aggiungere `supabase` (CLI) come **devDependency** di `@repo/supabase`.
2. Aggiungere a `packages/supabase/package.json` uno script:
   ```
   "gen:types": "supabase gen types typescript --project-id <PROJECT_ID> --schema template > src/types/database.ts"
   ```
   Il `<PROJECT_ID>` va parametrizzato: leggerlo da una env var `SUPABASE_PROJECT_ID` (documentarla in `.env.example` come variabile **solo di sviluppo/CLI**, non runtime). Usare la forma:
   ```
   "gen:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema template > src/types/database.ts"
   ```
3. Generare `packages/supabase/src/types/database.ts` (il file vero, eseguendo il comando — vedi nota: serve `SUPABASE_ACCESS_TOKEN` e login CLI; se la sub-chat non può autenticarsi, lasciare lo script pronto e segnalarlo al master per l'esecuzione manuale).
4. Ri-esportare i tipi da `src/index.ts`: `export type { Database } from './types/database'` e gli helper `Tables<>`, `TablesInsert<>`, `TablesUpdate<>` se presenti nel file generato.

## Vincoli

- **Non scrivere i tipi a mano**: devono essere generati dalla CLI Supabase (vincolo del runbook). Se la generazione non è eseguibile in sessione, lasciare `database.ts` assente e consegnare al master il comando esatto + prerequisiti.
- Schema target: **solo `template`** (`--schema template`), non `public` (Auth/Storage restano fuori dal CRUD tipato tenant).
- `SUPABASE_PROJECT_ID` e `SUPABASE_ACCESS_TOKEN` sono variabili **CLI/dev**, mai `NEXT_PUBLIC_`, mai committate con valori reali.
- Non toccare `apps/web` né `apps/admin` in questo sub-task.

## Output atteso

- `packages/supabase/package.json` con devDependency `supabase` e script `gen:types`
- `.env.example` aggiornato con `SUPABASE_PROJECT_ID=` (commento: "solo per CLI gen types, non runtime")
- `packages/supabase/src/types/database.ts` generato (o istruzioni per il master se non autenticabile)
- `src/index.ts` ri-esporta `Database` e gli helper

## Done when

- `pnpm --filter @repo/supabase gen:types` rigenera `database.ts` senza errori (con env e login CLI corretti)
- `import type { Database } from '@repo/supabase'` risolve da entrambe le app
- `pnpm -r tsc --noEmit` resta pulito
- `database.ts` contiene le 8 tabelle dello schema template (allergens, menu_sections, menu_categories, menu_items, time_slots, bookings, site_settings, news_slides)

## Note per il master

1. Prerequisito CLI: `supabase login` (o `SUPABASE_ACCESS_TOKEN`) + `SUPABASE_PROJECT_ID` impostato.
2. Commit: `feat(supabase): generate TypeScript types from template schema`
3. Frontmatter → `status: DONE`. Procedere al sub-task 03 (client pubblico).
