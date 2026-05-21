---
status: DONE
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 5
order: 1
tags: [foras-mvp, sprint5, admin, ui, tailwind4, shadcn, auth]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: high
---

# Sprint 5 / 1 of 6 — Admin UI baseline + shell/nav + `requireTenantClient`

## Contesto

Apre Sprint 5 (admin panel CRUD). È l'**unica fondazione orizzontale** dello sprint: tutti i sub-task CRUD successivi (02 menu, 03 drag&drop, 04 novità, 05 orari/coperti/impostazioni, 06 prenotazioni) si appoggiano alla shell e all'helper auth creati qui. **Nessun CRUD in questo sub-task.**

Stato attuale di `apps/admin`: **non ha Tailwind né shadcn**. `app/globals.css` è un reset puro, `app/layout.tsx` è nudo, il login (`app/_components/login-form.tsx`) usa stili inline, e `package.json` non dipende da `@repo/ui` né da `tailwindcss`. `apps/web` ha invece già la baseline (Sprint 3/01) — questo sub-task la **replica per `apps/admin`** riusando gli stessi target.

Auth già pronta dallo Sprint 4: `getVerifiedTenantClient(user, accessToken)` in `apps/admin/lib/auth.ts`, `proxy.ts` protegge `/dashboard/:path*` con `getUser()`, `app/dashboard/page.tsx` mostra il pattern canonico `getUser()` + `getSession()` + `getVerifiedTenantClient`. Questo sub-task estrae quel pattern in un helper riusabile e costruisce la shell con navigazione.

**Decisione master (decision-log 2026-05-21 — Sprint 5):** slice verticali; baseline+shell qui; immagini via URL (no Storage); nessuna modifica DB (le RLS di scrittura + GRANT a `authenticated` ci sono già). Le primitive shadcn vivono in `@repo/ui` (condivise con `apps/web`), **non** in `apps/admin`.

### Nota — knowledge cutoff

Next 16 / React 19 / Tailwind 4 / `shadcn@latest` sono successivi o al limite del cutoff. Se la CLI `shadcn` o un codemod si comporta diversamente da questo prompt, **vince la doc ufficiale** (`https://ui.shadcn.com/docs/tailwind-v4`, `https://ui.shadcn.com/docs/monorepo`). Segnalare al master e procedere secondo la doc.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce *2026-05-21 — Sprint 5 (Admin panel)* e *2026-05-21 — Upgrade stack major* (TW4 CSS-first, target versioni)
- `docs/ai-playbooks/workflow-master-sub.md` — regole sub-chat (non committare, non uscire dallo scope, segnalare ambiguità)
- `docs/ai-playbooks/prompts/2026-05-21_sprint3/2026-05-21_sprint3_01_ui-baseline.md` — il gemello già eseguito per `apps/web`; **riusare lo stesso `globals.css` e `postcss.config.mjs`** (i target sono identici)
- `apps/web/app/globals.css`, `apps/web/postcss.config.mjs`, `apps/web/package.json` — sorgenti da copiare/adattare
- `apps/admin/lib/auth.ts` — `getVerifiedTenantClient(user, accessToken)` + `TenantVerificationError` (qui aggiungi `requireTenantClient`)
- `apps/admin/lib/supabaseServer.ts` — `getSupabaseServerClient()`
- `apps/admin/app/dashboard/page.tsx` — pattern auth canonico + logout server action (da rifattorizzare)
- `apps/admin/app/page.tsx`, `apps/admin/app/_components/login-form.tsx` — login (da restylare)
- `apps/admin/app/layout.tsx`, `apps/admin/app/globals.css`, `apps/admin/next.config.mjs` — stato attuale
- `apps/admin/package.json`, `apps/admin/tsconfig.json`
- `packages/ui/src/index.ts`, `packages/ui/components.json`, `packages/ui/package.json` — barrel + config shadcn esistenti

## Scope

### 1. Tailwind 4 in `apps/admin` (replica di `apps/web`)

Aggiungere a `apps/admin/package.json` → **devDependencies** (stesse versioni di `apps/web`):

```jsonc
{
  "devDependencies": {
    "tailwindcss": "^4.3.0",
    "@tailwindcss/postcss": "^4.3.0",
    "tw-animate-css": "^1.4.0"
  }
}
```

E come **dependencies** aggiungere `@repo/ui`:

```jsonc
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

- Creare `apps/admin/postcss.config.mjs` **identico** a `apps/web/postcss.config.mjs`.
- Riscrivere `apps/admin/app/globals.css` **copiando integralmente** `apps/web/app/globals.css` (TW4 `@import` + `@source '../../../packages/ui/src'` + `@theme` + CSS variables). Il path `@source` è **identico** (stessa profondità: `apps/admin/app/globals.css` → `../../../packages/ui/src` risolve a `<root>/packages/ui/src`). **Niente `tailwind.config.ts`** (TW4 CSS-first).
- `apps/admin/next.config.mjs` ha già `transpilePackages: ['@repo/ui', '@repo/supabase']` → **leggere, non riscrivere**.

### 2. Primitive shadcn mancanti in `@repo/ui`

`@repo/ui` esporta già `Button`, `Dialog*`, `Tabs*`, `Skeleton`, `cn`. La shell + il login + i form CRUD futuri hanno bisogno di **`input`, `label`, `card`**. Aggiungerli **da dentro `packages/ui`** (lezione Sprint 3: invocata con l'alias `@repo/ui` la CLI sbaglia il path e scrive in `packages/ui/packages/ui/...`):

```bash
cd packages/ui && pnpm dlx shadcn@latest add input label card
```

- Verificare che i file finiscano in `packages/ui/src/components/ui/{input,label,card}.tsx`. Se la CLI scrive in path doppio, **spostarli a mano** e cancellare la cartella errata.
- Se la CLI prova a re-inizializzare o tocca `globals.css`: i CSS vars ci sono già → non lasciarle modificare il CSS. Fallback manuale dalla doc se non collabora.
- Estendere `packages/ui/src/index.ts` **preservando gli export esistenti** e aggiungendo:

```ts
export { Input } from './components/ui/input'
export { Label } from './components/ui/label'
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from './components/ui/card'
```

> Esportare esattamente i sotto-componenti che il file `card.tsx` generato definisce (verificare i nomi reali: versioni recenti di shadcn includono `CardAction`). Non inventare export non presenti.

### 3. Helper `requireTenantClient()` in `apps/admin/lib/auth.ts`

Estrarre il pattern ripetuto in un helper server-only riusabile da ogni pagina protetta. Aggiungere in `apps/admin/lib/auth.ts` (che ha già `import 'server-only'`):

```ts
import { redirect } from 'next/navigation'
// User è già importato come type; serve anche a runtime? No: solo type.

export async function requireTenantClient(): Promise<{ tenant: TenantClient; user: User }> {
  const supabase = await getSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/?reason=unauthenticated')

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/?reason=unauthenticated')

  try {
    const tenant = await getVerifiedTenantClient(user, session.access_token)
    return { tenant, user }
  } catch (err) {
    if (err instanceof TenantVerificationError) redirect('/?reason=tenant-mismatch')
    throw err
  }
}
```

- `redirect()` lancia (tipo di ritorno `never`) → TypeScript sa che il flusso non prosegue dopo i redirect.
- **Non** rimuovere né cambiare la firma di `getVerifiedTenantClient` (è codice di sicurezza chiuso in Sprint 4).

### 4. Shell `/dashboard/*` con navigazione

Creare `apps/admin/app/dashboard/layout.tsx` (Server Component) che:
- fa da **guard leggero del gruppo**: `getSupabaseServerClient().auth.getUser()`, se `!user` → `redirect('/?reason=unauthenticated')` (il `proxy.ts` già protegge, questo è il fallback in-app);
- rende una **sidebar** con i link di navigazione + il pulsante logout, e `{children}` nell'area principale;
- definisce il **logout** come server action (spostarlo qui da `dashboard/page.tsx`).

Navigazione (single source of truth — i sub-task successivi **non** riscrivono questo array, sostituiscono solo le pagine stub):

| Label | Route |
|---|---|
| Home | `/dashboard` |
| Menu | `/dashboard/menu` |
| Novità | `/dashboard/novita` |
| Orari & coperti | `/dashboard/orari` |
| Impostazioni | `/dashboard/impostazioni` |
| Prenotazioni | `/dashboard/prenotazioni` |

- Usare `next/link` per i link e `lucide-react` (già dep di `@repo/ui`) per le icone se vuoi, ma niente librerie nuove.
- Stile sobrio con le primitive/utility Tailwind (sidebar fissa a sinistra su desktop, contenuto a destra). Niente personalizzazione palette: è Sprint 7.

Creare le **pagine stub** per le route non ancora implementate, così i link risolvono (no 404):
- `apps/admin/app/dashboard/menu/page.tsx`
- `apps/admin/app/dashboard/novita/page.tsx`
- `apps/admin/app/dashboard/orari/page.tsx`
- `apps/admin/app/dashboard/impostazioni/page.tsx`
- `apps/admin/app/dashboard/prenotazioni/page.tsx`

Ogni stub: `export const dynamic = 'force-dynamic'` + un Server Component minimale che rende un titolo + "Sezione in arrivo (Sprint 5)". **Gli stub non chiamano `requireTenantClient`** (il guard del layout basta); le pagine reali lo faranno quando i sub-task le sostituiranno.

### 5. Rifattorizzare `dashboard/page.tsx` (home) + restyle login

- `apps/admin/app/dashboard/page.tsx`: usare `requireTenantClient()` al posto del blocco `getUser`/`getSession`/`getVerifiedTenantClient` inline; rimuovere il logout (ora nel layout). Renderizzare una landing minimale con `Card`: saluto utente (`user.email`), schema verificato, e l'esito della probe `tenant.from('menu_sections').select('id').limit(1)` come "connessione schema OK / fallita". Mantenere `export const dynamic = 'force-dynamic'`.
- `apps/admin/app/_components/login-form.tsx`: sostituire gli stili inline con le primitive `@repo/ui` (`Card`, `Label`, `Input`, `Button`). Mantenere **identica** la logica (`getSupabaseBrowserClient().auth.signInWithPassword`, gestione `reason`, `router.push('/dashboard')` + `refresh`). Resta `'use client'`.
- `apps/admin/app/page.tsx`: invariato nella logica (redirect a `/dashboard` se sessione); può avvolgere il `LoginForm` in un contenitore centrato.
- `apps/admin/app/layout.tsx`: aggiungere `import './globals.css'` è già presente — verificare che il body non abbia stili inline che confliggono con Tailwind; lasciare `lang="it"`.

## Vincoli

- **Tailwind 4 CSS-first**: niente `tailwind.config.ts`; theming in `globals.css`; sorgenti monorepo via `@source`. Riusare i target di `apps/web` (non reinventare la palette).
- **shadcn solo in `@repo/ui`**, mai duplicato in `apps/admin`. `apps/admin` importa dal barrel `@repo/ui`, mai da `@repo/ui/src/...`.
- **Nessun CRUD, nessuna funzione service nuova, nessuna query DB** in questo sub-task (la probe esistente in dashboard resta com'è).
- **Nessuna modifica DB**, nessun file in `packages/supabase/*` (a parte nulla: non si tocca), nessun file in `apps/web/*`, `docs/*` (a parte questo prompt → `status`), `pnpm-workspace.yaml`, `tsconfig.base.json`.
- **Non cambiare** la firma di `getVerifiedTenantClient` né `proxy.ts` (matcher `/dashboard/:path*` resta).
- **Nessuna dipendenza nuova** oltre a quelle elencate (`tailwindcss`, `@tailwindcss/postcss`, `tw-animate-css`, `@repo/ui`, e le primitive shadcn che non aggiungono runtime dep oltre a quelle già in `@repo/ui`). Niente `@dnd-kit` (è il sub-task 03).
- **React 19** ovunque. `'use client'` solo dove serve interattività (login form). Layout/shell/stub sono Server Components.

## Output atteso

- `apps/admin/postcss.config.mjs` (nuovo)
- `apps/admin/app/globals.css` (riscritto, copia di `apps/web`)
- `apps/admin/package.json` (devDeps TW4 + dep `@repo/ui`)
- `apps/admin/lib/auth.ts` (aggiunto `requireTenantClient`)
- `apps/admin/app/dashboard/layout.tsx` (nuovo: sidebar nav + logout server action + guard)
- `apps/admin/app/dashboard/page.tsx` (rifattorizzato: `requireTenantClient` + landing con `Card`)
- `apps/admin/app/dashboard/{menu,novita,orari,impostazioni,prenotazioni}/page.tsx` (5 stub nuovi)
- `apps/admin/app/_components/login-form.tsx` (restyle shadcn, logica invariata)
- `apps/admin/app/page.tsx` (contenitore centrato, logica invariata)
- `packages/ui/src/components/ui/{input,label,card}.tsx` (da shadcn add)
- `packages/ui/src/index.ts` (export estesi, esistenti preservati)
- `packages/ui/package.json` (eventuali dep aggiunte dalla CLI shadcn, se richieste da input/label/card)
- `pnpm-lock.yaml` aggiornato
- **Nessun** `apps/admin/tailwind.config.ts`. Nessun altro file modificato.

## Done when

- `pnpm install` da root OK; `pnpm -r exec tsc --noEmit` exit 0 (ricorsivo su tutto il workspace, non solo l'app)
- `pnpm --filter @repo/admin build` exit 0
- `pnpm --filter @repo/admin dev` (porta 3001): login → `/dashboard` mostra la shell con sidebar e la landing con `Card`; i 6 link di nav risolvono (Home + 5 stub "in arrivo", nessun 404); logout funziona
- La pagina di login è resa con le primitive shadcn (non più stili inline) e mantiene il flusso di accesso
- **Gate auth (regressione Sprint 1/4):** un accesso senza sessione a `/dashboard` redirige a `/?reason=unauthenticated`; uno schema non autorizzato redirige a `/?reason=tenant-mismatch`
- `apps/web/` invariato; `getVerifiedTenantClient` e `proxy.ts` invariati nella firma/matcher

## Note per il master

1. **Rischio principale:** la CLI `shadcn` in monorepo (path doppio con l'alias `@repo/ui`) — invocare da dentro `packages/ui`, verificare l'output, spostare a mano se serve (come Sprint 3/03).
2. **Verifica purge prod:** dopo il build admin, `grep -rl 'bg-card\|text-foreground' apps/admin/.next/static/chunks/ 2>/dev/null` (o `static/css/`) deve trovare le classi shadcn → conferma che il `@source` di `globals.css` include `packages/ui/src`. In Next16+Turbopack il CSS può finire in `.next/static/chunks/` (gotcha Sprint 3/01), non in `static/css/`.
3. **`requireTenantClient` è il pattern che ogni pagina CRUD userà** dal 02 in poi — verificare in review che dashboard/page.tsx lo usi davvero (non un copia-incolla del blocco inline).
4. **Verifica trust-but-verify:** rileggere i file reali, rieseguire `pnpm -r exec tsc --noEmit`. In Sprint 3 un errore tsc in `packages/ui` era mascherato dal build dell'app.
5. **Suggerito:** `/model claude-sonnet-4-6`, `/effort high`. Infra + boilerplate con rischio CLI.
6. **Commit (lo fa il master dopo la review):** `feat(admin): set up tailwind/shadcn baseline, dashboard shell with nav, and requireTenantClient helper`
7. Frontmatter → `status: DONE` a fine sessione. Prossimo: sub-task 02 (CRUD menu).
