---
status: DONE
sprint: post-audit-04
task: A
created: 2026-05-28
completed: 2026-05-28
commit: TBD
suggested_model: sonnet
suggested_effort: high
owner: master-chat
---

> **Esito (2026-05-28):** sub-chat Sonnet. Worktree branchato da `e406095` (pre-freeze, quirk dell'infra di isolamento) → la branch del worktree non ha mai committato; ~1700 righe scritte e poi interruzione per **session-limit** a 49 tool_uses / ~12 min. Salvataggio manuale del master nel main tree:
> - `.github/workflows/ci.yml` (2 job: `static` + `rls-isolation` su `postgres:15.8` service container)
> - `.github/scripts/{ci-harness-bootstrap.sql, provision-ci-tenants.sh, run-rls-tests.sh}`
> - `packages/supabase/{vitest.config.ts, tsconfig.test.json, src/__tests__/{bookings.test.ts, helpers/{pg-mock-client.ts, setup-db.ts}}}`
> - deps: `vitest@4.1.7`, `pg@8.21.0`, `@types/pg`; script `test` su root + `@repo/supabase`; `tsconfig.json` esclude `__tests__`.
>
> `pnpm install` + `pnpm -r tsc --noEmit` verdi nel main tree. **Validazione semantica deferred al primo run CI** (lo shim `pg-mock-client.ts` è ~450 righe da validare empiricamente). Eventuali aggiustamenti seguiranno al primo push su `main`.

# A — RLS isolation in CI + service-layer tests

## Contesto

`foras-mvp` è multi-tenant via **schema-per-tenant** su un unico Postgres (Supabase self-hosted in Docker). L'audit interno `docs/audit/04_valutazione-codebase.md` ha identificato il **leak cross-tenant** (RLS sbagliata → errore silenzioso, irreversibile, di fiducia) come l'unico rischio davvero irreversibile, non mitigato perché **zero test automatici e zero CI**. Questo task chiude quel gap prima dell'onboarding del cliente #1.

## File da leggere prima di iniziare

- `docs/operations/rls_isolation_tests.sql` (~29 KB) — assertion cross-tenant hand-written. Leggerlo per intero per capire l'harness che si aspetta (roles, `auth` schema/`auth.uid()` stub, come imposta il tenant/owner corrente). Il job CI deve riprodurre quell'harness.
- `docs/operations/create_schema_from_template.sql` — provisioner parametrizzato (`psql -v schema=... -v owner_uuid=...`); dipende da `auth.users`, roles `anon`/`authenticated`/`service_role`, `auth.uid()`. Da questo momento contiene anche `check_booking_capacity()` (§4b, innocuo per i test).
- `docs/operations/audit_rls.sql` — confronta RLS policies tra schemi tenant vs `template`; ritorna righe solo su discrepanza.
- `packages/supabase/src/services/bookings.ts` (puro, riceve un client; nessuna dep Next) + skim `menu.ts`, `settings.ts`, `package.json`/`tsconfig` del package.
- Root `package.json` (script build/lint/typecheck; pnpm 9.15.4; override `@supabase/supabase-js@2.106.1`) + `pnpm-workspace.yaml`.

## Scope

### 1. GitHub Actions CI `.github/workflows/ci.yml` (su push + PR contro `main`)

- Job `static`: `pnpm install`, `pnpm -r tsc --noEmit`, `pnpm -r lint`, `pnpm -r build`.
- Job `rls-isolation` con service container `postgres:15.8`: bootstrap di un harness Supabase-like (roles `anon`/`authenticated`/`service_role` + `auth` schema con `users` + `auth.uid()` stub — mirror di ciò che `rls_isolation_tests.sql` e il provisioner si aspettano), provisioning di **due** tenant usa-e-getta via `create_schema_from_template.sql` con UUID owner distinti, esecuzione `rls_isolation_tests.sql` e **FAIL** del job se qualsiasi accesso cross-tenant passa; poi `audit_rls.sql` e **FAIL** su qualsiasi riga restituita. Failure mode esplicito (exit non-zero su qualsiasi riga violante).

### 2. Vitest su `packages/supabase` contro Postgres effimero

Aggiungere `vitest` (+ thin client `pg` se serve) come devDeps, una `vitest.config`, e test sul service layer puro contro un Postgres effimero (stesso approccio container; provisioning di uno schema tenant). Coprire prima i path a rischio dati: `createBooking` (capacità/overbooking, finestra oraria, duplicate unique-violation), `getAvailableTimeSlots` (chiusure, finestre orari), `cancelBookingByToken`. Script `test` su `packages/supabase/package.json` + script root (`pnpm -r test`). Wirare il vitest run nel job CI (`rls-isolation` o sibling con Postgres).

## Vincoli

- **Non** modificare `schema.sql`, `create_schema_from_template.sql`, `audit_rls.sql`, `rls_isolation_tests.sql`, o SQL del tenant — consumare as-is. Se qualcosa di non parametrizzato blocca, documentarlo invece di editarlo.
- Niente deps pesanti oltre `vitest` (+ `pg` per i test). Convenzioni pnpm workspace.
- `pnpm -r tsc --noEmit` deve restare verde.
- Un teammate sta aggiungendo in parallelo `migrations/002_*.sql` (trigger overbooking) + il runner migrazioni — **non dipendere** da loro; la creazione provisioner-based è self-contained.

## Done when

- 2 job CI verdi su un PR di prova; un break RLS deliberato → CI rossa.
- `pnpm -r tsc --noEmit` + Vitest verdi in locale (se Docker disponibile) o almeno YAML/SQL parsano + `tsc`/vitest typecheck verdi.

## Note di esecuzione per la sub-chat

- Verifica locale se Docker è disponibile (`postgres:15.8` + harness + provisioning + isolation + vitest); altrimenti documenta cosa **non** hai potuto eseguire. La validazione contro il DB live self-hosted la fa il master via SSH — non è compito tuo.
- Riporta nel summary: file aggiunti/modificati, come funziona il leak-detection gate, cosa hai eseguito vs cosa no, ipotesi sull'harness Supabase che il master dovrà verificare contro il DB reale.
