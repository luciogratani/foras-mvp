---
status: DONE
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

**Vincolo infrastrutturale (scoperto in esecuzione):** Supabase è self-hosted su VPS Hetzner e Docker non gira sul Mac di sviluppo. La CLI `supabase gen types typescript`, anche con `--db-url`, lancia internamente un container `postgres-meta` via Docker — quindi non è utilizzabile localmente. La soluzione adottata bypassa la CLI e parla direttamente all'endpoint HTTP del container `supabase-meta` già attivo sulla VPS (è esattamente ciò che la CLI fa al suo interno). Vedi anche la voce *Generazione tipi TypeScript — postgres-meta HTTP invece di CLI* nel [[decisioni|decision-log]].

## File da leggere prima di iniziare

- `docs/tech-architecture/monorepo-structure.md` — sezione "Script principali", comando di generazione tipi
- `packages/supabase/package.json` — dove aggiungere lo script `gen:types`
- `packages/supabase/src/index.ts` — dove ri-esportare i tipi
- `.env.example` — variabili esistenti
- `docs/decision-log/decisioni.md` — voce sul progetto Supabase self-hosted e su `postgres-meta` HTTP

## Scope

1. Aggiungere a `packages/supabase/package.json` uno script `gen:types` che colpisce l'API HTTP di `postgres-meta` via `curl`:
   ```
   "gen:types": "curl -fsS \"${SUPABASE_META_URL:-http://localhost:18080}/generators/typescript?included_schemas=template\" -o src/types/database.ts"
   ```
   `SUPABASE_META_URL` è una env var **solo CLI/dev**, non runtime. Default sensato a `http://localhost:18080` per il tunnel locale (vedi sotto).
2. Documentare in `.env.example` la variabile `SUPABASE_META_URL=` e il prerequisito del tunnel SSH:
   ```
   ssh -N -L 18080:<IP_CONTAINER_META>:8080 foras-vps
   ```
   con riferimento al comando per recuperare l'IP del container (`docker inspect supabase-meta --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'`).
3. Generare `packages/supabase/src/types/database.ts` eseguendo `pnpm --filter @repo/supabase gen:types` con il tunnel attivo.
4. Ri-esportare i tipi da `src/index.ts`: `Database`, `Json`, `Tables<>`, `TablesInsert<>`, `TablesUpdate<>`, `Enums<>`, `CompositeTypes<>` come `type`, e `Constants` come valore (l'output di `postgres-meta` v0.96.4 include tutti questi helper).

## Vincoli

- **Non scrivere i tipi a mano**: devono essere generati. Strumento accettato per questo setup self-hosted: `postgres-meta` HTTP via `curl`. La CLI `supabase` non è utilizzabile (richiede Docker locale).
- Schema target: **solo `template`** (`?included_schemas=template`), non `public` (Auth/Storage restano fuori dal CRUD tipato tenant).
- `SUPABASE_META_URL` è una variabile **CLI/dev**, mai `NEXT_PUBLIC_`, mai committata con valori reali.
- Non toccare `apps/web` né `apps/admin` in questo sub-task.
- Nessuna devDependency `supabase` (CLI) aggiunta — non serve.

## Output atteso

- `packages/supabase/package.json` con script `gen:types` basato su `curl`, **senza** devDep `supabase`
- `.env.example` aggiornato con `SUPABASE_META_URL=` + commento e istruzioni per il tunnel SSH
- `packages/supabase/src/types/database.ts` generato (404 righe, contiene tutte e 8 le tabelle)
- `src/index.ts` ri-esporta `Database`, `Json`, gli helper `Tables/TablesInsert/TablesUpdate/Enums/CompositeTypes` e il valore `Constants`

## Done when

- Con tunnel SSH attivo su `localhost:18080` → `supabase-meta:8080`, `pnpm --filter @repo/supabase gen:types` rigenera `database.ts` senza errori
- `import type { Database } from '@repo/supabase'` risolve da entrambe le app
- `database.ts` contiene le 8 tabelle dello schema template (`allergens`, `menu_sections`, `menu_categories`, `menu_items`, `time_slots`, `bookings`, `site_settings`, `news_slides`)
- `database.ts` compila pulito (`tsc --noEmit --strict --skipLibCheck`)

## Note per il master

1. Prerequisito CLI: tunnel SSH attivo (`ssh -N -L 18080:<IP_CONTAINER_META>:8080 foras-vps`). Se l'IP del container `supabase-meta` cambia (ricreazione stack Docker), va recuperato di nuovo.
2. Commit: `feat(supabase): generate TypeScript types from template schema via postgres-meta HTTP`
3. Frontmatter → `status: DONE`. Procedere al sub-task 03 (client pubblico).

## Note esecuzione (2026-05-20)

Il prompt originale prescriveva l'uso della CLI `supabase gen types typescript --project-id $SUPABASE_PROJECT_ID`, assumendo implicitamente Supabase Cloud. In esecuzione si è scoperto che:

1. **Supabase è self-hosted, non Cloud** — `--project-id` non si applica. Si è tentato il fallback documentato `--db-url`.
2. **Anche `--db-url` richiede Docker locale** — la CLI Supabase v2.x, anche con un DB URL esplicito, lancia internamente un container `postgres-meta` per fare l'introspezione. Docker Desktop non è installato sul Mac di sviluppo.
3. **Eseguire la CLI sulla VPS** (dove Docker gira) fallisce con `Tenant or user not found` perché il container `postgres-meta` lanciato dalla CLI parte su una rete Docker diversa dallo stack Supabase esistente e finisce per parlare con Supavisor invece che con `db`.
4. **Soluzione**: bypassare la CLI e colpire direttamente l'endpoint HTTP `GET /generators/typescript?included_schemas=template` esposto dal container `supabase-meta` già attivo nello stack — è esattamente ciò che la CLI fa internamente. Output identico, nessun Docker locale richiesto.

**Conseguenze documentali (aggiornate insieme a questo prompt):**
- `docs/decision-log/decisioni.md` — nuova voce *Generazione tipi TypeScript — postgres-meta HTTP invece di CLI*
- `docs/tech-architecture/monorepo-structure.md` — snippet "Script principali" aggiornato
- `docs/build-delivery/runbook-implementazione.md` — Phase 1, riga generazione tipi
- `docs/ai-playbooks/prompts/README.md` — descrizione sub-task 02 + env vars manuali del master (rimosso `SUPABASE_PROJECT_ID`)

**Debito tecnico non chiuso in questo sub-task:**
- `packages/supabase/src/client.ts` ha 2 errori `tsc` preesistenti (`process` non definito → manca `@types/node` come devDep di `@repo/supabase`). Non risolto: fuori scope, va affrontato nel sub-task 03 quando si tocca il client.
