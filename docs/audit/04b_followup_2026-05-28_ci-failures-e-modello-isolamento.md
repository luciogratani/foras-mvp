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

### A. Section 1 RLS test resta rosso (`permission denied for function is_tenant_owner`)

L'`anon` non ha `GRANT EXECUTE` su `public.is_tenant_owner()`. Quando le policy di `bookings` invocano la funzione per un anon, Postgres esplode prima di valutare RLS. **Semanticamente è OK** (anon è negato), ma la CI lo conta come errore.

Due fix possibili, entrambi sani:
- **(a)** `GRANT EXECUTE ON FUNCTION public.is_tenant_owner() TO anon` — la funzione ritorna `false` per anon (`auth.uid()` null), RLS restituisce 0 righe pulite. Da propagare a: `create_schema_from_template.sql §3c` + nuova `migrations/004_*.sql` + apply su `template` live + run `migrate.sh` sui tenant esistenti.
- **(b)** Patchare il test CI per accettare `42501 permission denied for function` come "anon denied = PASS". Più rapido, non tocca DB, ma lascia un'asimmetria fra ambiente reale e CI.

**Raccomandazione:** (a) — l'asimmetria di (b) prima o poi morde. Da fare in una sessione dedicata, scope ~30 min.

### B. Lint error `react-hooks/set-state-in-effect` in `NewsPopup.tsx:17` + 9 warning

Errore reale (regola nuova di React 19/eslint 9). Fix: refactor `useEffect` → check + `setState` con `useSyncExternalStore` o `useState` iniziale calcolato. Warning: convertire `<a href="/">` in `<Link>` su `BookingForm`/`Cancel*`. **Scope:** ~1h sub-chat Sonnet.

### C. PostgREST schema list — costo onboarding

Ogni nuovo cliente richiede comunque l'append a `PGRST_DB_SCHEMAS` + `docker restart supabase-rest`. È un O(n) operativo non legato a questa decisione, ma da non dimenticare nel runbook onboarding (`docs/operations/onboarding-tenant.md`).

### D. Eliminare `docs/ci-logs/logs_71168130114/`

Tenuti come riferimento mentre si scriveva questo doc. Da rimuovere dopo il merge del fix `ci_xc.1` (decisione concordata 2026-05-28).

---

## Pointer

- Decisione formale: vedi `decisioni.md` § *2026-05-28 — Modello isolamento: PII e scrittura, non contenuto pubblico*.
- Audit originale: [[04_valutazione-codebase]] (sezioni "Affidabilità" / "Punto d'attenzione #1" — il quadro era già giusto, mancava il qualificatore esplicito).
- Test adattato: `.github/scripts/run-rls-tests.sh` (sezione "Cross-tenant isolation").
- Config PostgREST verificata: container `supabase-rest` su VPS, env `PGRST_DB_SCHEMAS` (snapshot in questo file §4).
