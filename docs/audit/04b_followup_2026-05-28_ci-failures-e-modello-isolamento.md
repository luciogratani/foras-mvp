---
status: done
created: 2026-05-28
completed: 2026-05-28
type: audit-followup
area: audit
parent: 04_valutazione-codebase
topic: ci-failures-post-audit-04 + decisione modello isolamento (PII vs contenuto)
owner: master-chat
---

# Audit 04b — Follow-up: CI failures post-audit-04 e decisione sul modello di isolamento

> **A cosa serve.** L'audit 04 ha portato all'introduzione della CI (Stream A). Il primo run su `main` è fallito. Questo documento riassume **cosa ha rotto**, **perché**, e — soprattutto — **la decisione architetturale** che il fallimento ha forzato a esplicitare: cosa promette davvero "schema-per-tenant" in foras. Senza questa decisione, qualsiasi fix sarebbe stato cieco.
>
> **Metodo.** Lettura dei log CI (`docs/ci-logs/logs_71168130114/`, eliminata dopo il fix) + verifica della config PostgREST sul VPS via SSH. Nessuna modifica al modello di sicurezza esistente — solo documentazione del modello reale + adattamento del test che lo verifica.

---

## TL;DR

- CI con 2 job: `static` (lint+tsc+build) e `rls-isolation` (test SQL su Postgres container). **Entrambi rossi.**
- `static` rosso per **1 errore di lint** in `apps/web/app/_components/NewsPopup.tsx:17` (regola nuova `react-hooks/set-state-in-effect`, eslint-plugin-react-hooks 6 + React 19) + 9 warning pre-esistenti (`<a>` invece di `<Link>`).
- `rls-isolation` rosso su 2 dei 3 test:
  - **Section 1**: `permission denied for function is_tenant_owner` quando `anon` interroga `bookings`. Bug di harness: la funzione ha `GRANT EXECUTE` solo a `authenticated`, ma le policy di `bookings` la invocano per qualunque ruolo. Anon **è negato comunque**, ma con un errore "rude" anziché "0 righe".
  - **Cross-tenant `ci_xc.1`**: `anon can access ci_tenant_b.site_settings`. **Vero** — e non è un bug del codice, è un gap fra il modello *dichiarato* nei docs ("schema-per-tenant = isolamento totale") e quello *implementato* (anon ha USAGE+SELECT su ogni schema tenant; PostgREST espone tutti gli schemi in `PGRST_DB_SCHEMAS`).
- **Decisione (Lucio, 2026-05-28):** il modello reale è **isolamento di PII e di scrittura, NON di contenuto pubblico**. La promessa "isolamento totale" era una semplificazione retorica nei docs. Si aggiorna `decisioni.md`; si adatta `ci_xc.1` perché testi quello che il modello davvero promette.
- Section 1 (function-permission) **resta rosso**: fix rimandato a sessione dedicata (vedi *Punti aperti* in fondo).

---

## Cosa è successo, per blocchi

### 1. Come è fatto foras lato DB

Un solo Postgres self-hosted. Multi-tenancy = **schema-per-tenant** (`alex_akashi`, `underclub`, `template`, e in futuro `bar_rossi` ecc.). Ogni schema contiene 9 tabelle: 5 "pubbliche di natura" (`site_settings`, `menu_sections`, `menu_categories`, `menu_items`, `news_slides`, più `allergens`/`time_slots`/`closed_dates`) e 1 sensibile (`bookings`, con PII: nome, email, telefono).

### 2. Come Supabase espone i dati

PostgREST traduce HTTP→SQL. Due livelli di sicurezza per ogni richiesta:
- **GRANT** sul ruolo (`anon` o `authenticated`): può toccare quella tabella?
- **RLS (Row-Level Security)**: se sì, quali righe?

Il client sceglie lo schema via header `Accept-Profile: <schema>`. PostgREST accetta solo schemi in whitelist (`PGRST_DB_SCHEMAS` env del container `supabase-rest`).

### 3. Cosa è ben protetto oggi (e i test lo confermano)

- **`bookings`**: RLS chiama `public.is_tenant_owner()` (SECURITY DEFINER) che verifica se l'utente loggato è l'owner di **quello specifico schema** in `public.tenants`. Anon → negato; owner di altro tenant → negato. ✓
- **Tutte le scritture** (INSERT/UPDATE/DELETE) su tabelle admin: stesso `is_tenant_owner()` ⇒ solo l'owner del tenant scrive. ✓
- L'unica INSERT consentita ad anon è `bookings` con `WITH CHECK true` (form prenotazione pubblico) — documentata in `decisioni.md` 2026-05-27.

### 4. Cosa NON è protetto oggi

Le tabelle pubbliche hanno policy `is_active = true` come unico filtro — **nessun filtro per schema**. Combinato con `PGRST_DB_SCHEMAS=public,storage,graphql_public,alex_akashi,underclub, template` (verificato via SSH 2026-05-28), un attaccante con la `SUPABASE_ANON_KEY` pubblica può fare:

```bash
curl https://<api>/rest/v1/site_settings -H "apikey: <anon>" -H "Accept-Profile: alex_akashi"
# → legge site_settings di alex_akashi
curl https://<api>/rest/v1/menu_items   -H "apikey: <anon>" -H "Accept-Profile: underclub"
# → legge menu di underclub
```

**Solo lettura.** Niente scrittura, niente PII (bookings restano blindati). Il "leak" è **information disclosure di contenuto già pubblico sul dominio del cliente** (menu, orari, news attive, dati di contatto).

### 5. Perché è una decisione, non un bug

Il documento `architettura-fullstack.md` parlava di "isolamento" senza qualificarlo. L'audit 04 ha implicitamente assunto la versione forte ("nessuna lettura cross-tenant, mai"). Il test `ci_xc.1` testava quella versione forte. La versione forte **non è implementata** — e implementarla costa: vedi *Opzioni valutate*.

La domanda vera: il "leak" produce un danno? Risposta concreta:
- Contenuto già visibile sul sito del cliente → **scraping facilitato della concorrenza** è l'unico scenario realistico, e un competitor può scraparlo dal sito pubblico comunque.
- Nessun cliente reale di foras (bar, ristoranti) percepisce il menu come asset strategico riservato.
- L'isolamento delle prenotazioni — la cosa che davvero conta legalmente (GDPR) — è solido.

**Conclusione operativa**: il modello reale è abbastanza per il dominio. Si documenta come tale, si adatta il test, si tiene aperta la porta al fix se mai un cliente specifico lo richiederà.

---

## Opzioni valutate (per implementare l'isolamento totale, se mai si decidesse)

Non implementate — qui solo per riferimento futuro.

### Opz. 1 — Ruoli `anon` per-tenant + JWT firmate per cliente
- `CREATE ROLE tenant_anon_<schema>` con `GRANT SELECT` solo sul suo schema. JWT firmato (self-hosted = JWT secret disponibile) con `role: tenant_anon_<schema>` come `SUPABASE_ANON_KEY` del cliente.
- **Setup:** 2–4 ore. **Costo per cliente N+1:** +2 min (1 SQL + 1 firma JWT + 1 paste Vercel). **Rischio:** N JWT da non perdere; revoca solo manuale.
- **Verdetto:** ★★★★☆ — la soluzione "giusta" se il problema diventa reale.

### Opz. 2 — Reverse proxy davanti a PostgREST
- Nginx mappa `Origin`/`Referer` → `Accept-Profile`. **Bypassabile** (curl senza Origin); sicurezza-teatro. ★☆☆☆☆.

### Opz. 3 — Istanze PostgREST per tenant
- Un container per cliente. N×RAM, N×restart, N×SSL. Sproporzionato. ★★☆☆☆.

### Opz. 4 — Views `public.*` con filtro per tenant via GUC
- Riscrive il modello (lettura su `public`, scrittura sugli schemi). 2–3 giorni, asimmetria invasiva. ★★☆☆☆.

---

## Cosa si è fatto in concreto

1. **Decisione architetturale nuova** in `decisioni.md`: *Modello isolamento — PII e scrittura, non contenuto pubblico (2026-05-28)*. Esplicita il qualificatore mancante.
2. **Test `ci_xc.1`** adattato in `.github/scripts/run-rls-tests.sh`: ora verifica i 3 invarianti che il modello davvero promette:
   - `ci_xc.1`: anon **non legge** `ci_tenant_b.bookings` (RLS via `is_tenant_owner`).
   - `ci_xc.2`: anon **non scrive/aggiorna/cancella** su `ci_tenant_b` (qualsiasi tabella).
   - `ci_xc.3`: `authenticated` di `ci_tenant_a` **non scrive/aggiorna/cancella** su `ci_tenant_b` (owner-scope).
   - Resa esplicita come **PASS attesa** la lettura cross-tenant di contenuto pubblico (test note + `RAISE NOTICE` informativo).
3. **Trigger di re-valutazione** per riaprire l'opzione 1 (vedi entry decisioni 2026-05-28): se un cliente lo richiede esplicitamente; o se il numero di tenant cresce abbastanza da rendere lo scraping cross-schema un fastidio reale.

---

## Punti aperti (non chiusi in questa sessione)

### A. Section 1 RLS test (`permission denied for function is_tenant_owner`)

**Chiuso 2026-05-28** via opzione (a) — `migrations/004_grant_execute_is_tenant_owner_anon.sql` + update `create_schema_from_template.sql §3c` + apply live (vedi sotto). Anon adesso ha `EXECUTE`, la funzione torna `false` per `auth.uid() IS NULL`, RLS restituisce 0 righe pulite invece di 42501.

**Apply live (2026-05-28):**
- Verifica pre-apply: il VPS live aveva GIÀ `EXECUTE` ad anon su `public.is_tenant_owner` (legacy Studio init, mai droppato dal `REVOKE FROM PUBLIC` del provisioner) — il fix vero allinea CI/onboarding-futuro al comportamento già attivo in produzione.
- Apply via `scripts/migrate.sh --template` con `DATABASE_URL=postgres://supabase_admin@...` (gotcha noto: `public.tenant_migrations` è di proprietà di `supabase_admin`, `postgres` non può `ALTER` → connettersi come `supabase_admin`).
- Risultato: `template` schema → 004 registrata in `tenant_migrations`, no-op funzionale sul live (anon aveva già EXECUTE).
- Effetto pratico per la CI: il container Postgres effimero esegue il provisioner aggiornato → anon riceve EXECUTE → Section 1 dovrebbe diventare verde al prossimo push.

### B. Lint error `react-hooks/set-state-in-effect` in `NewsPopup.tsx:17` + 9 warning

**Chiuso 2026-05-28** in commit `16603d0` (chore web warnings) + `6649631` (fix NewsPopup → `useSyncExternalStore`). Lint + tsc verdi su `apps/web`.

### B'. apps/admin lint — emerso solo a B chiuso

**Chiuso 2026-05-29** via sub-chat (opus) — commit `04f0778` (dnd→`useOptimistic` + `TimeSlotList` state derivato), `a46ead7` (`OpeningHoursForm`→`useReducer`), `5f73fc0` (escape apostrofi + postcss default nominato). Verifica master: `pnpm --filter @repo/admin lint` 0 errori/0 warning, `tsc --noEmit` exit 0 su admin+web. Nessun eslint-disable. Rollback dnd automatico (le reorder action revalidano solo su successo). Verifica browser dei dnd NON eseguita (sub-chat headless) → da spot-checkare al primo avvio admin. Static job atteso verde al prossimo push.

Mentre si fixava B, il run locale `pnpm -r lint` (che `pnpm` ferma al primo workspace fallito) ha rivelato che `apps/admin` ha **8 errori + 1 warning** mai visti dal CI precedente perché `apps/web` falliva prima. Inventario:

- **6 errori `react-hooks/set-state-in-effect`** — tutti lo stesso pattern `useState(prop) + useEffect([prop]) { setState(prop) }` per ri-sincronizzare stato locale quando il Server Component re-flusha (dopo `revalidatePath`). In: `SlideList.tsx:15`, `SectionList.tsx:35`, `SectionCard.tsx:56`, `CategoryRow.tsx:52`, `TimeSlotList.tsx:19`, `OpeningHoursForm.tsx:50`.
- **2 errori `react/no-unescaped-entities`** — apostrofi in JSX da escapare: `EditItemDialog.tsx:139`, `DeleteTimeSlotDialog.tsx:66`.
- **1 warning `import/no-anonymous-default-export`** in `apps/admin/postcss.config.mjs`.

**Fix richiesto:** refactor a `useOptimistic` (React 19) per i 5 componenti dnd, pattern `key` prop o re-design del form per `OpeningHoursForm` (non è optimistic, è "re-init quando le initialHours cambiano"), escape apostrofi, `const config = ...` per postcss. **Scope realistico:** 2.5–3h con review attenta, **rischio non-banale** (5 componenti dnd reggono il CRUD menu/news/orari; un useOptimistic mal-applicato rompe gli optimistic update senza farsi vedere subito). **Raccomandazione:** sub-chat dedicata con prompt che cataloga i pattern target.

**Stato CI dopo i fix di stasera:** Static job RESTA ROSSO finché B' non viene chiuso (apps/admin lint fallisce). Punti A (RLS Section 1) + B' insieme renderanno verdi entrambi i job.

**Aggiornamento run #71253728477 (post-`fa704fd`):**
- 🟢 `RLS isolation`: TUTTI i test SQL verdi (Section 1, Section 2b, Cross-tenant) → conferma empirica di A + ci_xc.
- 🔴 `RLS isolation` (Vitest step nello stesso job): FAIL su `bookings.test.ts` con `syntax error at or near "ON"` (SQLSTATE 42601 al char 21553). Non è test logico, è bug dello shim `pg-mock-client.ts` (~450 righe) che traduce supabase-js fluent → query `pg`. Era esplicitamente segnalato come "validazione semantica deferred al primo CI run" in decisioni.md voce A — il primo run è arrivato. Vedi punto **N** sotto.
- 🔴 `Static`: 8 errori + 1 warning su apps/admin (B' aperto, atteso).

Prompt sub-chat per B' in `docs/ai-playbooks/prompts/2026-05-28_audit-04-hardening/B-prime_admin-lint.md`. **Revisionato e approvato dal master il 2026-05-29** (status `TODO`): inventario validato sul codice reale; guida rollback Categoria 1 corretta (rollback `useOptimistic` automatico — le reorder action non revalidano su errore, quindi niente throw forzato); raccomandazione `OpeningHoursForm` ristretta a `(c) useReducer`. Pronto da girare a sub-chat.

### N. Vitest `bookings.test.ts` — bug `pg-mock-client.ts` (NUOVO)

Emerso al run #71253728477. Lo shim TS `packages/supabase/src/__tests__/helpers/pg-mock-client.ts` produce un SQL invalido al char 21553 (token "ON" inatteso) eseguendo i test di `createBooking`/`getAvailableTimeSlots`/`cancelBookingByToken`. Il job rls-isolation passa interamente sulla parte SQL e fallisce solo sul Vitest step. Investigation richiesta: leggere lo shim, identificare quale costruzione fluent supabase-js produce SQL malformato, decidere fix vs accettare e disable.

**Scope realistico:** 30 min se è bug isolato (es. JOIN o ORDER BY mistranslated); 1-2h se è limite strutturale dello shim. Non bloccante per il template congelato né per l'onboarding cliente #1 — ma blocca la CI verde. **Da fare:** sessione master fresca + eventuale sub-chat per il fix.

### E. Gestione network-failure non gestita nei dnd (e forse altrove) — RIMANDATO

Emerso dai test runtime di B' (2026-05-29). Gli handler dnd (`SectionList`/`SectionCard`/`CategoryRow`/`SlideList`) fanno `await reorderXAction(...)` **senza `try/catch`**: se la *rete* fallisce (non un `{ ok:false }` dal server, ma un `fetch` che non parte — offline, server giù, blip), la server action rigetta → **unhandled promise rejection** + nessun toast d'errore. Con `useOptimistic` l'UI rolla comunque indietro a fine transition (verificato: l'ordine torna a posto), quindi **non c'è corruzione di stato** — manca solo il feedback "connessione assente". **Pre-esistente** (il pattern `await action()` senza catch c'era già prima di B'); B' non l'ha introdotto né peggiorato (anzi: prima dell'`useOptimistic` l'UI non rollava nemmeno). **"Forse in altri punti dell'app":** stesso pattern `startTransition(async () => { await action() })` è usato anche altrove (toggle switch, dialog CRUD) → da censire, non solo i dnd. **Fix tipo:** wrap in `try/catch` → `toast.error('Connessione assente, riprova')`; rollback già automatico. Scope diverso da B' (lint), volutamente **non toccato**. Non bloccante. Tracciato come debito; nessun trigger fissato.

### C. PostgREST schema list — costo onboarding

Ogni nuovo cliente richiede comunque l'append a `PGRST_DB_SCHEMAS` + `docker restart supabase-rest`. È un O(n) operativo non legato a questa decisione, ma da non dimenticare nel runbook onboarding (`docs/operations/onboarding-tenant.md`).

### D. Eliminare `docs/ci-logs/logs_*` — ✅ FATTO 2026-05-29

Tenuti come riferimento mentre si scriveva questo doc. **Rimossi 2026-05-29** (3 cartelle untracked: `logs_71168130114`, `logs_71252697618`, `logs_71253728477`) — non erano versionati, cleanup diretto della working dir.

---

## Pointer

- Decisione formale: vedi `decisioni.md` § *2026-05-28 — Modello isolamento: PII e scrittura, non contenuto pubblico*.
- Audit originale: [[04_valutazione-codebase]] (sezioni "Affidabilità" / "Punto d'attenzione #1" — il quadro era già giusto, mancava il qualificatore esplicito).
- Test adattato: `.github/scripts/run-rls-tests.sh` (sezione "Cross-tenant isolation").
- Config PostgREST verificata: container `supabase-rest` su VPS, env `PGRST_DB_SCHEMAS` (snapshot in questo file §4).
