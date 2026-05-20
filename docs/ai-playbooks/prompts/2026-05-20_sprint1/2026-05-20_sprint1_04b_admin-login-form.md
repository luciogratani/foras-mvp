---
status: DONE
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 1
order: 4.5
tags: [foras-mvp, sprint1, admin, auth, login, ui]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: medium
---

# Sprint 1 / 4b of 5 — Mini-login form per admin (chiude scope gap del 04)

## Contesto

Il sub-task 04 ha implementato il **flow di verifica server-side** (`getVerifiedTenantClient`, middleware su `/dashboard/:path*`, redirect a `/?reason=unauthenticated`). Manca però una **UI di login** per generare la sessione: senza, i criteri "Done when" del 04 non sono testabili in browser. Vedi la sezione *Note esecuzione — scope gap riconosciuto* in fondo al prompt 04.

Questo sub-task chiude il gap con il **minimo indispensabile**: un form email+password su `apps/admin/app/page.tsx` (la root) che chiami `signInWithPassword` e rediriga a `/dashboard`. Niente registrazione, niente reset password, niente design system — l'admin login completo è scope di Sprint 5.

## File da leggere prima di iniziare

- `apps/admin/app/page.tsx` — root attuale (placeholder con `<h1>` da sostituire)
- `apps/admin/lib/supabaseServer.ts` — SSR client già esistente (per leggere la sessione corrente)
- `apps/admin/middleware.ts` — gate session, parametro `?reason=unauthenticated` da gestire
- `apps/admin/app/dashboard/page.tsx` — destinazione post-login (già esistente)
- `docs/tech-architecture/architettura-fullstack.md` — sezione "Auth — validazione schema al login" (contesto del flow)

## Scope

1. **Browser client per auth**: creare `apps/admin/lib/supabaseBrowser.ts` (NIENTE `server-only`) che esporta `getSupabaseBrowserClient()` usando `createBrowserClient` da `@supabase/ssr` (dipendenza già installata nel 04). Legge `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Throw esplicito se mancano.
2. **Login form**: sostituire `apps/admin/app/page.tsx` con un Server Component che:
   - Se c'è già una sessione → `redirect('/dashboard')` (evita di mostrare il form a chi è già loggato)
   - Altrimenti rende un Client Component `<LoginForm />` (file separato `apps/admin/app/_components/login-form.tsx`, sotto cartella underscore-prefixed per escluderla dal routing) con:
     - Input email + password (HTML5 nativi, no librerie UI: shadcn arriva in Sprint 4)
     - Submit handler che chiama `getSupabaseBrowserClient().auth.signInWithPassword({ email, password })`
     - Su successo: `router.push('/dashboard')` + `router.refresh()` per propagare i cookie sessione al server
     - Su errore: mostrare il messaggio sotto il form (rosso, semplice `<p>`)
     - Banner condizionale che mostra "Sessione scaduta — accedi di nuovo" se la query string contiene `?reason=unauthenticated`, e "Schema tenant non autorizzato" se `?reason=tenant-mismatch` (i due reason sono già emessi da middleware e dashboard)
3. **Logout**: aggiungere un pulsante "Esci" in `apps/admin/app/dashboard/page.tsx` (server-side form con Server Action che chiama `getSupabaseServerClient().auth.signOut()` e poi `redirect('/')`). Non rinominare/spostare il file dashboard.

## Vincoli

- **Niente nuove dipendenze**: usare solo `@supabase/ssr` (`createBrowserClient`) e `@supabase/supabase-js` (peer) già presenti.
- Il file `supabaseBrowser.ts` **non** deve avere `import 'server-only'` — è esplicitamente per il browser. Marcare invece il Client Component con `'use client'` come prima riga.
- Niente styling oltre il minimo: il design system arriva con shadcn in Sprint 4. Inline style o classi Tailwind elementari ok; nessun nuovo CSS file globale.
- Non toccare `middleware.ts`, `auth.ts`, `supabaseAdmin.ts`, `supabaseServer.ts` — sono il pezzo "alto rischio" già chiuso dal 04.
- Niente "remember me", niente reset password, niente registrazione — fuori scope (Sprint 5).
- Il form deve essere **server-rendered** (page Server Component) ma il submit avviene **client-side** (Client Component dedicato): è il pattern Next.js App Router corretto per auth Supabase.

## Output atteso

- `apps/admin/lib/supabaseBrowser.ts` (browser-only client)
- `apps/admin/app/page.tsx` riscritto: Server Component che redirige a `/dashboard` se loggato, altrimenti rende `<LoginForm />`
- `apps/admin/app/_components/login-form.tsx` (Client Component con `'use client'`)
- `apps/admin/app/dashboard/page.tsx` aggiornato con pulsante logout (Server Action)

## Done when

- Da browser su `http://localhost:3001/`: si vede il form di login
- Login con `template@foras.it` + password corretta → redirect a `/dashboard`, si vede `Verified tenant schema: template`
- Login con credenziali sbagliate → messaggio errore inline, resta su `/`
- Click su `/dashboard` senza essere loggato → redirect a `/?reason=unauthenticated` con banner visibile
- Pulsante "Esci" su `/dashboard` → torna a `/` senza sessione
- `pnpm -r tsc --noEmit` pulito; `pnpm --filter @repo/admin build` exit 0
- Grep su `.next/static/`: `SUPABASE_SERVICE_ROLE_KEY` continua a NON comparire (regressione check)

## Note per il master

1. Prerequisito già confermato: utente `template@foras.it` esiste con `user_metadata.schema = 'template'` e c'è una riga in `public.tenants` con `owner_id` corrispondente.
2. La password dell'utente template è in `docs/user.md` (non committarla mai altrove).
3. Suggerito: `/model claude-sonnet-4-6`, `/effort medium`. Scope chiuso, ~80 righe totali, nessuna decisione architetturale.
4. Commit: `feat(admin): add minimal login form to close 04 scope gap`
5. Frontmatter → `status: DONE`. Procedere al sub-task 05 (test isolamento).
