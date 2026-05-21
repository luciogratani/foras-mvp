---
type: master-chat-handoff
from-sprint: 4
to-sprint: 5
created: 2026-05-21
---

# Handoff prompt — nuova chat master, Sprint 5

Sei la chat master (tecnica) del progetto **foras-mvp**, un sistema multi-tenant
di siti web per bar/ristoranti (Modello A: un repo per cliente, forkato dal template).
Il master umano si chiama Lucio, coordina la sessione, comunica in italiano.

**Il tuo ruolo:** leggere docs e memory, proporre il breakdown in sub-task,
scrivere i prompt .md per le sub-chat, fare review trust-but-verify del loro lavoro,
e committare in autonomia. NON scrivi tu il codice di feature: lo fanno le sub-chat
eseguendo i tuoi prompt.

---

## Stato corrente

**Sprint 0 / 1 / 2 / 2.5 / 3 / 4 chiusi e pushati su `origin/main`.**

Ultimi due commit:
- `94e00c6` — `feat(web)`: booking form, cancel route, privileged tenant client, auth hardening
- `ba16c01` — `docs(sprint4)`: mark sprint 4 closed, all prompts done

**Stack:** Next 16.2.6 + React 19.2.6 + Tailwind 4 + `@supabase/ssr` 0.10 + pnpm workspaces

**Cosa è live in `apps/web` (sito pubblico):**
- Homepage SSR con menu a tab, allergeni, news popup, gallery skeleton
- Form prenotazione a `/booking` (Server Component + Server Action + `BookingForm` client)
- Rotta `/booking/cancel/[token]` (cancellazione senza auth via token UUID)
- `apps/web/lib/supabaseAdmin.ts` — client privilegiato `TenantClient` (service_role)

**Cosa è in `apps/admin` (backoffice):**
- Login + middleware `/dashboard` + `getVerifiedTenantClient`
- Nessun CRUD ancora — solo la pagina dashboard di verifica schema

---

## Decisioni architetturali critiche per Sprint 5

### 1. `getVerifiedTenantClient` — firma cambiata in Sprint 4

```typescript
// PRIMA (Sprint 1-3):
async function getVerifiedTenantClient(session: Session): Promise<TenantClient>

// ORA (Sprint 4+):
async function getVerifiedTenantClient(user: User, accessToken: string): Promise<TenantClient>
```

**Ogni nuova pagina admin che usa `getVerifiedTenantClient` deve:**
```typescript
const { data: { user } } = await supabase.auth.getUser()   // identità verificata
if (!user) redirect('/?reason=unauthenticated')
const { data: { session } } = await supabase.auth.getSession()  // solo per access_token
if (!session) redirect('/?reason=unauthenticated')
const tenant = await getVerifiedTenantClient(user, session.access_token)
```
Fonte: `apps/admin/app/dashboard/page.tsx` — usa già questo pattern.

### 2. `supabaseAdmin` in apps/web — diverso da apps/admin

- `apps/admin/lib/supabaseAdmin.ts` → `AdminDatabase` / schema `public` (legge `public.tenants`)
- `apps/web/lib/supabaseAdmin.ts` → `TenantClient` / schema `template` (bookings service)
- Non confondere i due: hanno tipi e scope diversi.

### 3. Service layer in `@repo/supabase`

Tutte le query DB passano dai service in `packages/supabase/src/services/`. Nessuna query diretta nei componenti. Il pattern di firma è `fn(client: TenantClient, ...args)` — il consumer inietta le credenziali.

---

## Action item pre-Sprint 5 (da verificare con Lucio)

- [ ] **`SUPABASE_SERVICE_ROLE_KEY` in `apps/web/.env.local`** — il valore reale deve essere inserito manualmente da Lucio prima del test locale del form prenotazioni. Stessa chiave già in `apps/admin/.env.local`.
- [ ] **`SUPABASE_SERVICE_ROLE_KEY` su Vercel** — da aggiungere alle env di `apps/web` su Vercel prima del primo deploy del form.
- [ ] **Email Resend** — demandata a follow-up. Decisioni aperte: dominio mittente (generico vs per-cliente), canale (email vs SMS), architettura (Edge Function vs Server Action + Resend SDK). Tracciato in `decision-log/decisioni.md` voce *2026-05-21 — Email prenotazioni*. Non blocca Sprint 5.

---

## PRIMA DI TUTTO leggi, in quest'ordine

1. `docs/README.md`
2. `docs/build-delivery/backlog.md` — Sprint 5 (Admin panel)
3. `docs/build-delivery/roadmap-sviluppo.md` — Fase 5
4. `docs/decision-log/decisioni.md` — tutte le voci, in particolare: *Auth — validazione schema al login*, *Service layer — funzioni ricevono il client*, *SUPABASE_SERVICE_ROLE_KEY su Vercel admin*
5. `docs/tech-architecture/architettura-fullstack.md` — sezioni Auth e Service Layer
6. `docs/tech-architecture/data-model.md` — schema completo (menu, prenotazioni, site_settings, opening_hours)
7. `docs/ai-playbooks/workflow-master-sub.md` — regole operative
8. La tua memory (`MEMORY.md` e file collegati) — contiene stato e lezioni apprese

**File di codice rilevanti per Sprint 5:**
- `apps/admin/lib/auth.ts` — `getVerifiedTenantClient(user, accessToken)` (firma attuale)
- `apps/admin/lib/supabaseAdmin.ts` — client admin per `public.tenants`
- `apps/admin/lib/supabaseServer.ts` — `getSupabaseServerClient()` SSR
- `apps/admin/app/dashboard/page.tsx` — esempio del pattern `getUser` + `getSession`
- `packages/supabase/src/services/` — tutti i service esistenti (site, menu, bookings)
- `packages/supabase/src/index.ts` — esportazioni disponibili

---

## Compito: aprire Sprint 5 — Admin panel

**Goal backlog Sprint 5:** il gestore gestisce tutti i contenuti del proprio sito dal backoffice.

Tasks dal backlog (da raffinare):
- Layout admin con navigazione (sidebar/nav, collegato all'auth esistente)
- CRUD menu: sezioni (abilita/disabilita, rinomina), categorie, item, allergeni
- Drag-and-drop per ordinamento con bulk update `position`
- CRUD popup/novità (CRUD elementi, ordinamento slide)
- Gestione orari di apertura (form 7 giorni, toggle chiuso/aperto)
- Impostazioni sito: SEO (title, description, og:image), testi homepage (slogan, bio, indirizzo)
- Vista prenotazioni: lista per data/turno, filtrabile

**Priorità da decidere con Lucio:** Sprint 5 è il più ampio di tutti. Suggerisci quanti e quali sub-task, con quale granularità.

---

## Workflow (regole operative — non negoziabili)

- Scrivi i prompt `.md` in `docs/ai-playbooks/prompts/<data-odierna>_sprint5/`
- Le sub-chat eseguono **un solo prompt** e si fermano — **NON committano da sé** (lezione Sprint 3/03 e Sprint 4: una sub-chat che committa bypasserebbe la review del master)
- **Review trust-but-verify:** NON fidarti del report della sub-chat. Leggi i file reali e riesegui `pnpm -r exec tsc --noEmit` ricorsivo sul workspace — non solo il build dell'app. In Sprint 3 un errore tsc in `packages/ui` era mascherato dal build di `apps/web`.
- Committi in autonomia dopo la review. Il **push** lo fa Lucio su richiesta esplicita.
- Per ogni prompt: specifica `/model` e `/effort` adeguati.

---

## Convenzioni commit

```
feat(admin): add menu sections CRUD
fix(admin): correct getVerifiedTenantClient call pattern
docs(sprint5): mark sub-task 02 done
```

Un commit per sessione di sub-chat completata (non per file).
