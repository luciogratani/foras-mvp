# Struttura monorepo

---

## Modello attuale — Modello A (repo per cliente)

Ogni cliente è un **repo indipendente**, forkato dal template. Il monorepo esiste solo *dentro* ogni repo cliente.

```
repo-template/                   ← repo base (forkato per ogni cliente)
    /apps
        /web                     ← Next.js, homepage pubblica SSR
        /admin                   ← Next.js SPA, backoffice
    /packages
        /supabase                ← client condiviso, types generati da Supabase CLI
        /ui                      ← componenti shadcn condivisi
    /migrations
        001_init.sql             ← schema iniziale post-freeze
    .env.example
    schema.sql                   ← schema PostgreSQL corrente + RLS + seed
    CHANGELOG.md                 ← registro modifiche post-freeze

repo-bar-rossi/                  ← fork di repo-template
    /apps
        /web                     ← UI custom sopra i componenti template
        /admin                   ← identico al template, dati diversi
    /packages                    ← invariati rispetto al template
    /migrations                  ← aggiornati dal template quando escono nuove versioni
    .env                         ← NEXT_PUBLIC_SUPABASE_SCHEMA=bar_rossi
```

**Nota sulle variabili d'ambiente:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SUPABASE_SCHEMA` vanno nel `.env` di ogni app in `/apps/web` e `/apps/admin`. Il client Supabase in `/packages/supabase` le legge dall'ambiente in cui viene eseguito.

**Cosa mantenere fin da subito:** il service layer e i tipi vanno tenuti in `/packages`, ben separati dalla UI. Se il confine è netto, una futura migrazione al Modello B è una questione di spostare cartelle, non di riscrivere logica.

---

## Modello B — da valutare in futuro

Un unico repo con tutti i clienti dentro (`/clients/bar-rossi`, `/clients/bar-verdi`), con `/packages` condivisi globalmente. Il vantaggio è che un fix al service layer si propaga a tutti i clienti in un unico commit.

**Trigger per considerare la migrazione:** quando ci si ritrova a fare lo stesso fix su più di due repo nella stessa settimana.

---

## Perché Next.js e non Vite

La homepage pubblica ha bisogno di SSR per SEO: hero, slogan, biografia e meta tag devono essere renderizzati server-side. Con Vite si perderebbe questo vantaggio e si dovrebbe aggiungere un layer separato, aumentando la complessità senza benefici. Il backoffice in Next.js funziona perfettamente come SPA senza SSR attivo.

---

## Script principali — pnpm workspaces

Con pnpm workspaces e Next.js App Router, gli script standard sono i seguenti. I comandi da root usano `pnpm --filter` (o `-r` per tutti i workspace) — nessun tool aggiuntivo come Turborepo è previsto allo stato attuale.

```bash
# Sviluppo locale — avviare le due app in parallelo (da terminali separati, o con tmux)
pnpm --filter web   dev     # http://localhost:3000
pnpm --filter admin dev     # http://localhost:3001

# Build
pnpm --filter web   build
pnpm --filter admin build

# Type check (tutti i workspace)
pnpm -r tsc --noEmit

# Lint (tutti i workspace)
pnpm -r lint

# Generazione tipi Supabase (da /packages/supabase)
pnpm --filter @repo/supabase supabase gen types typescript \
  --project-id <project-id> --schema nome_schema > src/types/database.ts
```

**`pnpm-workspace.yaml` atteso:**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Nota:** i nomi dei package in `package.json` seguono la convenzione `@repo/<nome>` (es. `@repo/supabase`, `@repo/ui`) per evitare conflitti con package npm pubblici e rendere gli import riconoscibili.

---

## Convenzioni di naming *(da confermare sul repo reale)*

Convenzioni standard per il tech stack scelto — da verificare e correggere una volta che il repo esiste:

| Cosa | Convenzione | Esempio |
|---|---|---|
| File componenti React | PascalCase | `BookingForm.tsx` |
| File utility / hooks | camelCase | `useBooking.ts`, `formatDate.ts` |
| File route Next.js | kebab-case (forzato da Next.js) | `booking-confirm/page.tsx` |
| Variabili e funzioni TS | camelCase | `getActiveSlots()` |
| Tipi e interfacce | PascalCase | `BookingRow`, `SiteSettings` |
| Costanti | SCREAMING_SNAKE_CASE | `MAX_COVERS_DEFAULT` |
| Branch git | kebab-case con prefisso | `feat/booking-form`, `fix/rls-policy` |
| Schema PostgreSQL (nomi) | snake_case | `bar_rossi`, `menu_items` |

---

## ⚠️ Sezioni ancora da documentare sul repo reale

Le seguenti informazioni richiedono il repo scaffoldato per essere scritte con precisione:

- **Come aggiungere un nuovo package/app** — procedura step-by-step con i comandi pnpm
- **Configurazione CI/CD Vercel** — quali app deployare, quali ignorare, env vars per progetto
- **Configurazione ESLint / Prettier condivisa** — se viene estratta in un package `@repo/config`
