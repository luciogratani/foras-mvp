---
status: DONE
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: "2.5"
order: 1
tags: [foras-mvp, stack-upgrade, next, react, supabase-ssr, security]
owner: master-chat
suggested_model: claude-opus-4-7
suggested_effort: high
commit: 6e9a227
---

# Sprint 2.5 / 1 of 1 — Stack upgrade framework (Next 16 + React 19 + @supabase/ssr 0.10)

## Contesto

L'apertura di Sprint 3 (prima UI vera) ha fatto emergere che lo stack del repo è indietro di due major: il repo è su Next 14.2 + React 18.3, mentre `latest` è Next 16 + React 19 e `tailwindcss@latest`/`shadcn@latest` assumono Tailwind 4. Il master ha deciso di **anticipare l'upgrade major adesso**, mentre la codebase è al minimo storico (`apps/web` è uno stub, `apps/admin` è minimale, nessun cliente ha ancora forkato il template) — è il punto di costo minimo. La decisione completa, con rationale e blast radius, è tracciata nel decision-log: voce **2026-05-21 — Upgrade stack major (Next 16 + React 19 + Tailwind 4)**.

Questa milestone (**Sprint 2.5**, infrastrutturale, precede i sub-task UI di Sprint 3) fa **solo l'upgrade del framework**: Next, React, `@supabase/ssr`, `supabase-js`, toolchain. **Tailwind 4 NON si installa qui** — è il Sprint 3 / 01 (dove serve, insieme al setup shadcn). Questa separazione tiene la milestone concentrata sul pezzo rischioso: l'auth admin.

### ⚠️ Caveat critico — knowledge cutoff

Next 16 e React 19 sono usciti **dopo** il knowledge cutoff di chi ha scritto questo prompt (gennaio 2026). **Non procedere a memoria.** I dettagli di migrazione (codemod, breaking changes, nuove firme API) vanno letti dalle **guide ufficiali correnti** (sezione "Risorse ufficiali" sotto) ed eseguiti con i **codemod ufficiali**. Se questo prompt e una guida ufficiale divergono, **vince la guida ufficiale**: segnalalo al master e procedi secondo la doc.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce *2026-05-21 — Upgrade stack major* (rationale, blast radius, target versioni, trigger di rollback)
- `docs/decision-log/decisioni.md` — voce *2026-05-21 — `SUPABASE_SERVICE_ROLE_KEY` su Vercel admin* e *Auth — validazione schema al login* (cosa NON deve regredire)
- `docs/tech-architecture/architettura-fullstack.md` — sezione "Auth — validazione schema al login" (il flusso che il gate deve riverificare)
- `docs/tech-architecture/monorepo-structure.md` — workspace, `transpilePackages`, script pnpm
- `package.json` (root), `pnpm-workspace.yaml`, `tsconfig.base.json`
- `apps/web/package.json`, `apps/web/next.config.mjs`, `apps/web/tsconfig.json`, `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/app/api/health/route.ts`
- `apps/admin/package.json`, `apps/admin/middleware.ts`, `apps/admin/next.config.mjs`, `apps/admin/tsconfig.json`
- `apps/admin/lib/auth.ts`, `apps/admin/lib/supabaseAdmin.ts`, `apps/admin/lib/supabaseServer.ts`, `apps/admin/lib/supabaseBrowser.ts`
- `apps/admin/app/layout.tsx`, `apps/admin/app/page.tsx`, `apps/admin/app/dashboard/page.tsx`, `apps/admin/app/_components/login-form.tsx`
- `packages/supabase/package.json`, `packages/supabase/src/client.ts`
- `packages/ui/package.json`
- `docs/operations/rls_isolation_tests.sql` — sezione sul flusso auth (per capire cosa deve continuare a valere dopo l'upgrade)

## Risorse ufficiali da consultare (WebFetch) — OBBLIGATORIO

Prima di toccare codice, leggere (sono la fonte di verità, non questo prompt):

- Next.js upgrade guides: `https://nextjs.org/docs/app/guides/upgrading/version-15` e la guida a Next 16 se presente (`.../version-16`)
- Next.js codemods: `https://nextjs.org/docs/app/guides/upgrading/codemods`
- React 19 upgrade guide: `https://react.dev/blog/2024/12/05/react-19-upgrade-guide`
- `@supabase/ssr` — doc Server-Side Auth Next.js corrente: `https://supabase.com/docs/guides/auth/server-side/nextjs` (pattern cookie `getAll`/`setAll`, cambiato rispetto a 0.x precedenti)

Codemod ufficiali da usare (verificare il comando esatto nelle guide sopra — la sintassi può essere cambiata dopo gennaio 2026):
- Next: `npx @next/codemod@latest upgrade latest` (bump versione + applica i codemod necessari, incluso `next-async-request-api`)
- React 19: la migration recipe indicata dalla upgrade guide React (tipicamente via `npx codemod@latest react/19/migration-recipe`)

## Scope

### 1. Pre-flight

- Verificare `git status` pulito. Lavorare su un branch dedicato: `chore/stack-upgrade`.
- Leggere le guide ufficiali (sopra) e annotare in 3-5 righe i breaking changes effettivamente applicabili a questo repo (async request APIs, `@supabase/ssr` cookie pattern, caching defaults, eventuali rimozioni React 19).

### 2. Bump versioni — coerente su tutto il monorepo

Target (dal decision-log, 2026-05-21):

| Workspace | Pacchetti |
|---|---|
| root | `eslint-config-next@16.2.6`, `typescript@^5.8` (ultima 5.x), `@typescript-eslint/*` compatibili con eslint 8/9 secondo eslint-config-next 16 |
| `apps/web` | `next@16.2.6`, `react@19.2.6`, `react-dom@19.2.6`, `@types/react@19.2.15`, `@types/react-dom@19.2.3` |
| `apps/admin` | idem `apps/web` + `@supabase/ssr@0.10.3`, `@supabase/supabase-js@2.106.1`, `server-only` invariato |
| `packages/supabase` | `@supabase/supabase-js@2.106.1` (resta peer/dep com'è ora) |
| `packages/ui` | `react`/`react-dom` peerDependencies `^19`, `@types/react@^19` devDep |

**Versione React unica in tutto l'albero.** Dopo l'install, `pnpm why react` deve mostrare **una sola** versione. Se il graph risolve versioni multiple, aggiungere `pnpm.overrides` nel `package.json` root per forzare `react`, `react-dom`, `@types/react`, `@types/react-dom` a una sola versione. Un mismatch di React tra app e package rompe gli hook a runtime.

### 3. Codemod + fix dei breaking changes

Eseguire i codemod ufficiali (passo "Risorse ufficiali") e poi rifinire a mano ciò che resta. Aree note da verificare in **questo** repo:

- **Async request APIs (Next 15+):** `cookies()`, `headers()`, `draftMode()` ora ritornano `Promise`. Impatta principalmente `apps/admin`:
  - `apps/admin/lib/supabaseServer.ts` (legge i cookie lato server)
  - `apps/admin/middleware.ts` (gestione sessione via cookie)
  - qualsiasi Server Component che le usi (`app/dashboard/page.tsx`, `app/layout.tsx`)
  - Anche `params`/`searchParams` delle pagine diventano `Promise` se usati.
- **`@supabase/ssr` 0.5 → 0.10:** la firma dei cookie handler di `createServerClient`/`createBrowserClient` è cambiata (pattern `getAll`/`setAll` invece di `get`/`set`/`remove`). Allineare `supabaseServer.ts`, `supabaseBrowser.ts`, `middleware.ts` al pattern della doc Supabase corrente (link sopra). Questo è il punto a più alto rischio del task.
- **Caching defaults (Next 15+):** `fetch` e i `GET` route handler non sono più cache-by-default. Verificare `apps/web/app/api/health/route.ts`: se deve restare sempre fresco va bene così; se serve esplicitare, aggiungere `export const dynamic = 'force-dynamic'`. Documentare la scelta in una riga di commento solo se non ovvia.
- **`next.config.mjs` (web e admin):** verificare che `transpilePackages` e `images.remotePatterns` siano ancora validi nella sintassi di Next 16. Adeguare se la guida segnala cambi.
- **React 19:** rimozione di `propTypes`/`defaultProps` su function component, `forwardRef` non più necessario (ma ancora supportato — non rifattorizzare se i codemod non lo fanno), nuovi tipi `@types/react@19` (es. `JSX` namespace, `useRef` richiede argomento). Fixare solo ciò che `tsc` segnala.
- **ESLint:** `eslint-config-next@16` potrebbe richiedere ESLint 9 / flat config. Se il root usa ancora `.eslintrc`, seguire la guida; se serve migrare a `eslint.config.mjs`, farlo minimale. Se è troppo invasivo, **segnalare al master** e tenere lint fuori dal gate (non bloccare l'upgrade su un cambio di config lint).

### 4. Verifiche tecniche

- `pnpm install` → lockfile aggiornato, nessun peer warning bloccante su react
- `pnpm why react` → una sola versione
- `pnpm -r tsc --noEmit` → exit 0
- `pnpm --filter @repo/web build` → exit 0
- `pnpm --filter @repo/admin build` → exit 0
- `pnpm -r lint` → exit 0 (salvo deroga concordata col master sul punto ESLint)

### 5. ⚠️ GATE DI SICUREZZA — auth admin (NON skippabile)

L'upgrade tocca il cuore dell'auth admin (`@supabase/ssr` + cookie + middleware). Questi sono criteri **verificabili a mano** in locale (`pnpm --filter @repo/admin dev`, con `.env.local` popolato e l'utente admin `template` già esistente in Supabase Auth da Sprint 1). **Il task non è completo finché tutti passano:**

1. **Login OK:** dalla home admin, login con le credenziali dell'utente `template` → redirect a `/dashboard` senza errori.
2. **Sessione persistente:** ricaricando `/dashboard` la sessione regge (i cookie sono scritti/letti correttamente col nuovo pattern `@supabase/ssr` 0.10).
3. **Route protetta:** accedere a `/dashboard` da scheda non autenticata → redirect al login (il middleware blocca).
4. **Verifica owner (`getVerifiedTenantClient`):** la query a `public.tenants` (owner_id + schema_name) continua a funzionare; il client ritornato è schema-scoped su `template`. Se hai modo di simulare un `user_metadata.schema` non corrispondente, la sessione deve essere invalidata (vedi `architettura-fullstack.md` → "Auth — validazione schema al login").
5. **`supabaseAdmin` server-only:** `apps/admin/lib/supabaseAdmin.ts` mantiene `import 'server-only'`; un eventuale import lato client fa fallire il build (è la mitigazione documentata nel decision-log).

Se uno di questi fallisce e non si risolve allineando il codice alla doc Supabase 0.10, **fermarsi e segnalare al master** — è in gioco la baseline di sicurezza dello Sprint 1. Il trigger di rollback (→ Tailwind 4 su Next 14.2/React 18) è già previsto nel decision-log.

### 6. `apps/web` — sanity

`apps/web` non ha ancora UI vera (stub `<h1>` + health route). Verificare solo che:
- `pnpm --filter @repo/web dev` → la home stub renderizza senza errori sotto Next 16/React 19
- `GET /api/health` → `{ ok: true }` (Supabase raggiungibile)

Tailwind/shadcn **non si toccano qui**.

## Vincoli

- **Solo upgrade framework + toolchain.** Niente Tailwind, niente shadcn, niente componenti UI, niente feature. Quelli sono Sprint 3.
- **Nessun downgrade di funzionalità per "far passare il build".** Se l'async cookie API rompe l'auth, si risolve seguendo la doc Supabase, NON disattivando il middleware o allentando la verifica owner.
- **Versione React unica** in tutto il monorepo (vedi §2).
- **Codemod ufficiali prima del fix manuale.** Non riscrivere a mano ciò che un codemod fa in modo affidabile.
- **La doc ufficiale vince su questo prompt** in caso di divergenza (caveat cutoff).
- **Branch dedicato** `chore/stack-upgrade`; non lavorare su `main` (questo upgrade va revisionato prima del merge).
- **Non toccare** lo schema DB, le RLS, i service in `packages/supabase/src/services/*`, i prompt in `docs/`. Se `packages/supabase/src/client.ts` o i tipi necessitano un micro-fix per React/TS 19, è ammesso, ma niente refactor.

## Output atteso

- `package.json` (root) — eslint-config-next 16, typescript, eventuali `pnpm.overrides` per react
- `apps/web/package.json`, `apps/admin/package.json`, `packages/supabase/package.json`, `packages/ui/package.json` — versioni bumpate
- `pnpm-lock.yaml` aggiornato
- `apps/admin/lib/supabaseServer.ts`, `apps/admin/lib/supabaseBrowser.ts`, `apps/admin/middleware.ts` — allineati a `@supabase/ssr` 0.10 + async cookies
- eventuali fix in `apps/admin/lib/auth.ts`, `apps/admin/app/**`, `apps/web/app/**`, `apps/web/app/api/health/route.ts` (async APIs, caching)
- eventuale migrazione config ESLint (se concordata col master)
- Nessun file Tailwind/shadcn, nessun componente UI nuovo

## Done when

- `pnpm -r tsc --noEmit` exit 0
- `pnpm --filter @repo/web build` e `pnpm --filter @repo/admin build` exit 0
- `pnpm why react` → una sola versione (19.2.6)
- **Gate di sicurezza (§5) tutti verdi** — login, sessione, route protetta, verifica owner, server-only guard
- `apps/web` home stub e `/api/health` funzionano sotto il nuovo stack
- Nessun warning React di hydration o di API deprecate in console su entrambe le app

## Note per il master

1. **Branch + review:** questo è l'unico task di Sprint finora che giustifica una review attenta del diff prima del merge su `main` — tocca codice di sicurezza. Suggerito tenerlo su `chore/stack-upgrade` e fare un merge consapevole.
2. **Prerequisito gate §5:** serve l'utente admin `template` in Supabase Auth (creato in Sprint 1) e `apps/admin/.env.local` con `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY`. Nessun nuovo step manuale rispetto a Sprint 1.
3. **Se ESLint flat-config diventa un buco nero:** non bloccare l'upgrade. Disaccoppiare lint dal gate, tracciare un follow-up, mergiare l'upgrade framework verde su tsc+build+auth.
4. **Modello/effort:** `/model claude-opus-4-7`, `/effort high`. È un upgrade major a versioni successive al cutoff, con codice di sicurezza coinvolto e necessità di leggere/ragionare su guide ufficiali. Vale il modello più capace.
5. **Commit:** `chore(deps): upgrade to next 16, react 19 and supabase/ssr 0.10`
6. Frontmatter → `status: DONE`. Poi si apre **Sprint 3** sul nuovo stack: sub-task 01 (UI baseline Tailwind 4 + shadcn).
