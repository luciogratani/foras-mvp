---
status: DRAFT
updated: 2026-05-29
area: docs
type: hub
tags: [foras-mvp, docs]
owner: master-chat
---

# Foras MVP — Docs Hub

Sistema multi-tenant per sviluppare e gestire siti web per bar e ristoranti locali. Un singolo progetto Supabase condiviso con schema PostgreSQL separato per tenant. Ogni cliente nasce come fork di un repo-template con UI headless, service layer condiviso e admin panel CRUD. Questa è la folder di lavoro per sviluppare il repo-template, questo README è per le chat master.

**Stack:** Next.js App Router · pnpm workspaces · Supabase (DB + Auth + Storage) · shadcn/ui · Zod · Resend · Vercel · TypeScript

**Fase attuale:** 🔒 template FROZEN (2026-05-27) · CI in piedi e verde (2026-05-29) · prossimo: Stream C — onboarding cliente #1 → **stato vivo autorevole e datato in [[STATUS]]**

---

## Gerarchia di autorità (dove vive la verità)

Per evitare drift, ogni tipo di informazione ha **una sola fonte autorevole**:

- **Stato vivo** ("cosa è vero ORA") → [[STATUS]] — unico file con stato datato.
- **Elenco migrazioni** → `CHANGELOG.md` (root del repo).
- **Decisioni / il perché** → [[decisioni]].
- **Cosa fare / cronaca** → [[backlog]].

La **auto-memory NON è autorevole sullo stato**: serve solo come indice di puntatori. In caso di divergenza, vince [[STATUS]].

---

## Come usare questa documentazione

- Parti da `tech-architecture/` per capire il sistema.
- Usa `product-scope/` per capire i confini di questa fase.
- Usa `build-delivery/` per capire cosa fare e in quale ordine.
- Usa `operations/` solo quando devi eseguire procedure concrete (onboarding, migrazioni).
- Consulta `decision-log/` se hai dubbi su una scelta già presa.
- Mantieni ogni file con stato esplicito nel frontmatter: `DRAFT`, `LOCKED`, `REOPENED`.

---

## Workflow AI (master / sub-chat)

- Regole e template: [[workflow-master-sub]]
- Prompt eseguiti o da eseguire: `ai-playbooks/prompts/`

Il master scrive i prompt, committa (push solo su richiesta esplicita di Lucio), aggiorna i file di documentazione. Le sub-chat eseguono un prompt alla volta su scope delimitato. Per dettagli: vedi [[workflow-master-sub]].

---

## Ordine di lettura consigliato per una sub-chat

1. Questo README (contesto progetto e stack)
2. [[architettura-fullstack]] (sistema, multi-tenancy, auth)
3. [[data-model]] (schema completo)
4. [[mvp]] (perimetro e freeze)
5. Il prompt specifico assegnato dal master

---

## Indice completo

### Stato
- [[STATUS]] — stato vivo autorevole e datato (fase attuale · ultimo evento · prossimo passo · watch). **Apri questo per primo.**

### Tech Architecture
- [[architettura-fullstack]] — stack, multi-tenancy, auth, Edge Functions, Storage, deploy, loading strategy
- [[data-model]] — schema PostgreSQL completo (menu, prenotazioni, site_settings, public.tenants, opening_hours JSON)
- [[monorepo-structure]] — struttura repo, Modello A/B, script pnpm, naming conventions

### Product Scope
- [[mvp]] — feature in scope, criteri di freeze, checklist pulizia pre-freeze, form prenotazioni
- [[post-mvp]] — feature escluse consapevolmente e quando riconsiderarle

### Build And Delivery
- [[roadmap-sviluppo]] — fasi di sviluppo, principio guida, gate per avanzamento, rischi
- [[backlog]] — sprint 0→7 con tasks e criteri "Done when", MVP release checklist
- [[runbook-implementazione]] — sequenza eseguibile per fase, working rules, anti-scope-creep, weekly rhythm

### Decision Log
- [[decisioni]] — tutte le decisioni architetturali e di prodotto chiuse con contesto, opzioni e rationale

### Operations
- [[onboarding-tenant]] — procedura completa onboarding nuovo cliente (8 step + checklist RLS + checklist pre-deploy GDPR)
- [[migration-runbook]] — flusso migrazioni post-freeze, propagazione RLS, rollback, script di audit
- `operations/create_schema_from_template.sql` — script SQL bozza per creare un nuovo schema tenant (da finalizzare post-freeze)

### AI Playbooks
- [[workflow-master-sub]] — workflow master/sub-chat, regole operative, template prompt, commit convention
- `ai-playbooks/prompts/` — prompt scritti dal master (funge anche da archivio sessioni)

### Audit
- `audit/` — prompt di consulenza per chat esterne a occhio fresco (UX funnel prenotazione, workflow admin gestore, fit modello dati ↔ realtà bar). Prompt + risposta nello stesso file. Vedi `audit/README.md`.

### Root del repo (artefatti post-freeze, fuori da `docs/`)
- `CHANGELOG.md` — **elenco autorevole delle migrazioni** schema tenant (human-readable, una voce per script in `/migrations`)
- `migrations/` — script SQL numerati post-freeze (001 baseline-pointer, 002→ ALTER per-schema)
- `schema.sql` — fotografia strutturale congelata di un tenant (snapshot, generato via `pg_dump --schema-only`)
- `scripts/migrate.sh` — runner idempotente delle migrazioni (vedi [[migration-runbook]])
- `.github/workflows/ci.yml` — CI a 2 job: `static` (tsc+lint+build) e `rls-isolation` (test SQL isolamento + Vitest service-layer)

### Archive
- `archive/architettura-progetto-bar-v-0-3.md` — documento di architettura v0.3 (fonte primaria per la migrazione docs)
- `archive/menu-data-structure.md` — decisioni data model menu (fonte primaria per la migrazione docs)
- `archive/docs-folder-structure.md` — decisioni sulla struttura della cartella docs
- `archive/ignore/` — versioni precedenti (v0.1, v0.2) — solo riferimento storico

---

## Convenzioni Obsidian

Regole minime per mantenere il grafo coerente e i file leggibili dagli agenti AI.

**Link interni ai doc** → `[[nome-file]]` senza estensione né path. Obsidian risolve per nome file — tutti i nomi in questo vault sono unici, quindi non serve il path completo.

**Alias** → `[[nome-file|testo descrittivo]]` quando il nome del file da solo non è abbastanza chiaro nel contesto.

**Link esterni** → `[testo](https://...)` markdown standard.

**File non-doc** (script SQL, config, file di codice) → backtick `` `filename.sql` `` — non wikilink, perché non appartengono al vault Obsidian.

**Cartelle** → backtick `` `nome-cartella/` `` — i link Obsidian puntano a file, non a cartelle.

**Frontmatter** → YAML tra `---` in ogni file, con almeno `status`, `updated`, `area`, `owner`. Nessun campo opzionale che Obsidian non capisca.

**Status** → `DRAFT` · `LOCKED` · `REOPENED`

**Non usare** embed `![[...]]` o callout Obsidian (`: [!NOTE]`) — non compatibili con agenti AI e non necessari in questo vault.
