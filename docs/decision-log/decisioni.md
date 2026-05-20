# Decision log

Log delle decisioni architetturali e di prodotto chiuse. Per ogni voce: contesto, opzioni considerate, decisione presa, rationale.

Le voci sono ordinate per tema. Le decisioni recuperate dall'archive non avevano timestamp — i placeholder `[data: ?]` vanno sostituiti con la data effettiva appena ricordata o ricostruita dal git log. Le nuove decisioni vanno aggiunte con data precisa nel formato `YYYY-MM-DD`.

---

### [data: ?] — Multi-tenancy — schema separation su Supabase

**Contesto:** serve isolare i dati di ogni cliente bar su una singola istanza Supabase.

**Opzioni considerate:**
- Schema PostgreSQL separato per tenant (schema-per-tenant)
- Row-level isolation con colonna `tenant_id` su schema `public`
- Istanze Supabase separate per cliente

**Decisione:** schema PostgreSQL separato per ogni cliente, con un singolo progetto Supabase condiviso.

**Rationale:** lo schema-per-tenant offre isolamento netto senza il rischio di leak cross-tenant tipico del row-level isolation. Le istanze separate costerebbero molto di più e andrebbero gestite individualmente. Le Supabase client libraries supportano nativamente lo schema custom via `createClient(URL, KEY, { db: { schema: 'nome_schema' } })`.

**Limitazione nota:** Auth e Storage rimangono su `public` — la separazione per schema vale solo per CRUD via PostgREST. Per Storage si usa una convenzione di path nei bucket.

---

### [data: ?] — Rate limiting prenotazioni

**Contesto:** evitare prenotazioni duplicate dallo stesso utente per lo stesso turno.

**Opzioni considerate:**
- Logica applicativa lato server
- Edge function dedicata con controllo
- Unique constraint a livello DB

**Decisione:** `UNIQUE (email, time_slot_id, date)` direttamente su PostgreSQL.

**Rationale:** Postgres rifiuta i duplicati a livello di DB. Copre il 95% dei casi reali (un utente che prenota due volte per errore). Un attacco coordinato con email diverse è un problema che un bar locale non avrà mai. Soluzione senza logica applicativa aggiuntiva.

---

### [data: ?] — Migrazioni schema post-freeze

**Contesto:** come gestire le modifiche allo schema dopo il congelamento del template, con più clienti che hanno il proprio schema.

**Opzioni considerate:**
- Tool automatici (Flyway, Supabase migrations)
- Script numerati manuali

**Decisione:** script numerati in `/migrations`, flusso manuale documentato.

**Rationale:** per la scala del progetto (pochi clienti, modifiche rare) un tool automatico aggiunge complessità senza benefici reali. Il flusso manuale con script numerati è sufficiente e leggibile. Trigger per riconsiderare: numero di clienti oltre 5-6.

---

### [data: ?] — RLS multi-schema — propagazione modifiche

**Contesto:** le RLS policies sono identiche su tutti gli schemi ma vanno configurate manualmente su ognuno al momento dell'onboarding. Una correzione a una policy va replicata su tutti gli schemi esistenti.

**Decisione:** ogni modifica a una RLS policy viene trattata come una migrazione. Va scritta in uno script numerato (`/migrations/003_fix_rls_bookings.sql`) e applicata a tutti gli schemi uno per uno.

**Rationale:** stesso flusso delle migrazioni schema, stessa tracciabilità. Evita la deriva tra schemi dove alcuni hanno policy corrette e altri no.

---

### [data: ?] — Edge Functions — validazione schema

**Contesto:** le Edge Functions ricevono il nome dello schema nel body della chiamata. Senza validazione, un client potrebbe richiedere uno schema arbitrario e accedere a dati di altri tenant.

**Decisione:** doppio controllo — whitelist (`public.tenants`) + verifica owner tramite `auth.uid()`.

**Rationale:** la whitelist blocca schemi inesistenti o inventati. La verifica owner garantisce che l'utente autenticato sia effettivamente l'admin di quello schema. La `service_role` key viene usata solo server-side nelle Edge Functions, mai esposta al client.

---

### [data: ?] — Storage — separazione per tenant

**Contesto:** Auth e Storage rimangono su `public` e non supportano la separazione per schema.

**Decisione:** bucket condiviso `bar-assets` con path convention `/{schema}/...` e Storage RLS policies basate su `user_metadata.schema`.

**Rationale:** Supabase Storage non supporta separazione per schema. La convenzione di path con RLS policies offre lo stesso livello di isolamento senza infrastruttura aggiuntiva. La funzione helper `storageAssetPath()` in `/packages/supabase` centralizza la costruzione dei path.

---

### [data: ?] — Variabili d'ambiente — sicurezza

**Contesto:** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` vengono esposte al browser.

**Decisione:** esporre intenzionalmente entrambe come `NEXT_PUBLIC_`. La `service_role` key non va mai esposta al client.

**Rationale:** Supabase è progettato per esporre queste credenziali al browser. La `anon key` è una chiave JWT che consente solo le operazioni permesse dalle RLS. La sicurezza dei dati è interamente delegata alle RLS policies, non all'oscuramento della chiave.

---

### [data: ?] — Conferma prenotazioni

**Contesto:** la prenotazione deve essere confermata al cliente senza richiedere intervento manuale del gestore.

**Opzioni considerate:**
- Conferma manuale da parte del gestore
- Conferma automatica senza controllo disponibilità
- Conferma automatica con controllo coperti

**Decisione:** conferma automatica con controllo disponibilità coperti. Il gestore imposta la capacità massima per turno nel backoffice.

**Rationale:** la conferma manuale crea prenotazioni fuori orario (il gestore non è sempre disponibile). La conferma automatica senza controllo genera overbooking. Il controllo sui coperti risolve entrambi i problemi.

---

### [data: ?] — Struttura del menu

**Contesto:** definire la gerarchia e il livello di dettaglio del menu nel data model.

**Decisione:** gerarchia `Section → Category → Item`, tre livelli fissi. Item appartiene a una sola categoria. Section predefinite (non creabili da zero dal tenant). Allergeni: solo i 14 obbligatori per legge (Reg. UE 1169/2011), ridondanti per schema.

**Rationale:** tre livelli coprono tutti i casi d'uso di un bar. Varianti e item multi-categoria aggiungerebbero complessità al data model e all'UI per casi d'uso marginali. Le section predefinite garantiscono consistenza tra tenant. Gli allergeni ridondanti per schema evitano dipendenze cross-schema.

---

### [data: ?] — Framework frontend — Next.js vs Vite

**Contesto:** scegliere il framework per homepage pubblica e backoffice.

**Decisione:** Next.js (App Router) per entrambe le app.

**Rationale:** la homepage pubblica ha bisogno di SSR per SEO. Con Vite si perderebbe il rendering server-side e si dovrebbe aggiungere un layer separato. Il backoffice in Next.js funziona perfettamente come SPA senza SSR attivo. pnpm workspaces gestisce il monorepo nativamente.

---

### [data: ?] — Modello monorepo — Modello A (repo per cliente)

**Contesto:** decidere se avere un unico repo con tutti i clienti o un repo separato per ogni cliente.

**Decisione:** Modello A — repo separato per cliente, forkato dal template.

**Rationale:** nella fase iniziale (pochi clienti) la semplicità di un repo per cliente supera i vantaggi della centralizzazione. Il service layer in `/packages` mantiene aperta la strada al Modello B in futuro senza riscritture.

**Trigger per riconsiderare:** stesso fix applicato su più di due repo nella stessa settimana.

---

### [data: ?] — Auth — validazione schema al login

**Contesto:** `user_metadata.schema` è l'unica fonte che lega un utente al suo schema tenant. Se quel campo fosse assente, errato o manomesso, l'utente potrebbe inizializzare il client con lo schema sbagliato senza che il sistema se ne accorga.

**Opzioni considerate:**
- Fidarsi di `user_metadata.schema` senza validazione aggiuntiva
- Validare solo nelle Edge Functions
- Validare al login nel middleware dell'app admin, confrontando con `public.tenants`

**Decisione:** validazione al login tramite `getVerifiedTenantClient()` nel middleware di `/apps/admin`. Prima di inizializzare il client con lo schema da `user_metadata`, si verifica che l'utente sia registrato come owner in `public.tenants`. Se la verifica fallisce, la sessione viene invalidata immediatamente.

**Rationale:** la validazione nelle Edge Functions protegge le chiamate API ma non il client-side. Un `user_metadata.schema` manomesso potrebbe inizializzare il client con lo schema sbagliato, esponendo dati di un altro tenant. La verifica al login chiude questo vettore alla radice, senza overhead su ogni singola richiesta.

**Implementazione:** vedi sezione *Auth — validazione schema al login* in [[architettura-fullstack]].

---

### [data: ?] — Struttura della documentazione

**Contesto:** scegliere come organizzare la documentazione del progetto, partendo da due file non strutturati in `archive/`.

**Decisione:** cartella `docs/` con cinque sotto-sezioni (`tech-architecture/`, `product-scope/`, `decision-log/`, `operations/`, `archive/`). File `archive/` lasciati intatti come riferimento storico. Decision log separato dall'architettura. Nessuna ADR formale — log piatto in `decisioni.md`.

**Rationale:** le decisioni di scope e operatività non appartengono all'architettura tecnica. Tenerle in sezioni separate evita che crescano dentro i file tecnici e permette di consultarle indipendentemente. L'archive non è un cestino: è leggibile e consultabile. Le sezioni `brand/`, `metriche/`, `GTM/` non vengono create finché non esistono contenuti — nessuna cartella vuota.

---

### 2026-05-20 — Progetto Supabase condiviso con altri progetti personali

**Contesto:** il progetto Supabase usato per foras non è vergine: ospita già due schemi di progetti personali (`underclub`, `alex_akashi`), uno dei quali ha un utente in `auth.users`. `auth.users` e Storage sono globali di progetto, quindi condivisi con foras.

**Opzioni considerate:**
- Progetto Supabase dedicato a foras (isolamento totale di auth/public/storage)
- Restare sul progetto condiviso + hardening RLS e verifiche collisioni
- Ripulire il DB droppando gli altri schemi

**Decisione:** restare sul progetto condiviso, senza droppare nulla. `public` è vuoto (nessuna collisione su `public.tenants`), gli altri due sono progetti personali usa-e-getta con naming che foras non userà mai, e l'unico utente auth esistente è fidato. Prospettiva: foras resterà su VPS con Supabase self-hosted e saranno i due progetti minori a migrare altrove.

**Rationale:** rischio concreto basso allo stato attuale (un solo schema `template`, un solo utente fidato, `public` vuoto, controllo pieno sugli schemi esposti in PostgREST essendo self-hosted). Il costo di un progetto dedicato non è giustificato finché non ci sono dati di clienti reali.

**Limitazione nota / trigger di revisione:** prima dell'onboarding del **primo cliente reale** (dati personali + GDPR), rivalutare se serve un progetto dedicato. Vedi anche la decisione sull'hardening RLS qui sotto.

---

### 2026-05-20 — Generazione tipi TypeScript — `postgres-meta` HTTP invece di CLI Supabase

**Contesto:** durante Sprint 1 / sub-task 02 (generazione di `packages/supabase/src/types/database.ts` dallo schema `template`), il runbook originale prescriveva l'uso della CLI ufficiale `supabase gen types typescript`. In esecuzione si è scoperto che la CLI non è utilizzabile in questo setup, per due motivi cumulati:

1. **Stack self-hosted, non Supabase Cloud** — l'opzione `--project-id` (e il login via `SUPABASE_ACCESS_TOKEN`) presuppone Cloud. Vedi decisione precedente sul progetto Supabase condiviso.
2. **Anche `--db-url` richiede Docker locale** — la CLI Supabase v2.x, anche con un DB URL esplicito, lancia internamente un container `postgres-meta` per fare l'introspezione dello schema. Docker Desktop non è installato sul Mac di sviluppo, e non si vuole introdurlo solo per questo.

**Opzioni considerate:**
- Installare Docker Desktop sul Mac solo per la CLI Supabase
- Eseguire la CLI Supabase sulla VPS (dove Docker gira) — tentato: il container `postgres-meta` parte sulla rete Docker di default invece che sulla rete `supabase_default` dello stack esistente, e finisce per parlare con Supavisor → fallisce con `Tenant or user not found`
- Bypassare la CLI e chiamare direttamente l'API HTTP del container `supabase-meta` già attivo nello stack, via tunnel SSH
- Usare un codegen alternativo (`pg-to-ts`, `kanel`, `zapatos`) — output diverso da quello atteso dal runbook, perderebbe gli helper `Tables<>/TablesInsert<>/TablesUpdate<>`

**Decisione:** `pnpm --filter @repo/supabase gen:types` è uno script `curl` contro l'endpoint `GET /generators/typescript?included_schemas=template` di `postgres-meta` (è esattamente l'endpoint che la CLI Supabase invoca internamente). Si raggiunge via tunnel SSH da `localhost:18080` al container `supabase-meta:8080` sulla VPS. La URL è parametrizzata da `SUPABASE_META_URL` con default `http://localhost:18080`.

**Rationale:** output del file identico a quello della CLI Supabase (stesso `postgres-meta`, stessi helper inclusi: `Database`, `Json`, `Tables<>`, `TablesInsert<>`, `TablesUpdate<>`, `Enums<>`, `CompositeTypes<>`, `Constants`). Nessuna dipendenza da Docker locale. Nessuna devDep `supabase` aggiunta al monorepo. Lo script resta riproducibile finché il tunnel SSH è attivo.

**Limitazione nota / trigger di revisione:**
- L'IP interno del container `supabase-meta` (oggi `172.18.0.10`) può cambiare se lo stack Docker viene ricreato — va recuperato con `docker inspect supabase-meta --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'` e usato nel comando di tunnel.
- Footgun ssh: il flag `ClearAllForwardings=yes` cancella anche le `-L` passate sulla command line (non solo quelle dal config) — non usarlo se serve un forward.
- Se in futuro si migrasse a Supabase Cloud o si introducesse Docker locale, tornare alla CLI ufficiale è banale (basta sostituire lo script `gen:types`).

---

### 2026-05-20 — Hardening RLS scrittura — da owner-scope, non solo `auth.uid()`

**Contesto:** le policy di scrittura admin in `create_schema_from_template.sql` usano `auth.uid() IS NOT NULL` ("qualsiasi utente autenticato"). In un progetto con `auth.users` condiviso (tra tenant foras e/o con altri progetti), questo check non isola le scritture: un qualsiasi utente autenticato passerebbe la policy su uno schema tenant esposto, perché la RLS non verifica che sia owner di **quello** schema. L'isolamento oggi regge solo a livello applicativo (`getVerifiedTenantClient` + quale schema interroga l'app), non a livello RLS.

**Decisione:** mantenere `auth.uid() IS NOT NULL` per ora (un solo schema `template`, un solo utente fidato → nessun effetto pratico), ma **irrobustire le policy di scrittura prima del secondo tenant / del freeze del template**: la condizione deve legare l'utente allo schema corrente (es. confronto tra lo schema della tabella e `auth.jwt() -> 'user_metadata' ->> 'schema'`, oppure verifica owner contro `public.tenants`).

**Rationale:** con un solo tenant la debolezza è teorica; diventa un leak cross-tenant reale appena esistono due admin nello stesso `auth.users`. Va chiuso a livello RLS (non solo applicativo) prima che entrino dati di clienti reali. Non blocca Sprint 1.

**Trigger:** secondo schema tenant creato, oppure Sprint 6 (template freeze) — qualunque venga prima.

---

### 2026-05-21 — GRANT espliciti per i ruoli Supabase nello schema tenant

**Contesto:** primo smoke test admin dopo Sprint 1 → la query `tenant.from('menu_sections').select()` falliva con `42501 permission denied for schema template`. La causa: lo script `create_schema_from_template.sql` definiva tabelle, RLS e policy, ma **nessun `GRANT`** sullo schema/oggetti per i ruoli Supabase (`anon`, `authenticated`, `service_role`). PostgreSQL respinge l'accesso a livello di `USAGE`/object permissions **prima** che le RLS vengano valutate — quindi le RLS apparivano funzionanti in audit ma di fatto erano irraggiungibili dal client.

Gli schemi tenant esistenti `alex_akashi` e `underclub` non avevano il problema perché creati dalla UI di Supabase Studio (che applica i grant automaticamente). `template`, creato dal nostro script, era l'unico tenant senza grant.

**Decisione:** aggiungere una sezione `3b. GRANT espliciti` a `create_schema_from_template.sql` con:
- `GRANT USAGE ON SCHEMA <schema> TO anon, authenticated, service_role`
- `GRANT SELECT ON ALL TABLES … TO anon, authenticated`
- `GRANT INSERT ON <schema>.bookings TO anon` (prenotazione pubblica)
- `GRANT INSERT, UPDATE, DELETE ON ALL TABLES … TO authenticated` (admin CRUD; RLS filtra)
- `GRANT ALL ON ALL TABLES … TO service_role`
- Grant equivalenti su `ALL SEQUENCES`
- `ALTER DEFAULT PRIVILEGES` per le tabelle/sequenze create in futuro nello stesso schema (es. migrazioni post-freeze)

**Rationale:** i `GRANT` sono il complemento obbligatorio delle RLS, non un'alternativa. Lasciarli fuori dallo script di onboarding garantisce un fallimento ricorrente per ogni nuovo tenant. I default privileges proteggono anche le evoluzioni future dello schema.

**Conseguenza per i tenant già creati:** se un tenant esiste senza grant (caso del nostro `template`), va sbloccato eseguendo manualmente il blocco GRANT come service_role nel SQL editor. Non serve droppare e ricreare lo schema.

**Debito tecnico aperto:** `docs/operations/audit_rls.sql` oggi verifica solo `rowsecurity` e presenza policy — non i grant. Va esteso per controllare anche `has_schema_privilege(...)` minimi sui ruoli Supabase, così il prossimo onboarding manchevole verrebbe intercettato dall'audit invece che dal primo smoke test runtime. **Trigger:** prima del secondo tenant creato via script, o prima del freeze del template (Sprint 6).

---

### 2026-05-21 — `SUPABASE_SERVICE_ROLE_KEY` su Vercel admin (non Edge Function) per MVP

**Contesto:** la verifica owner in `getVerifiedTenantClient` (sub-task Sprint 1 / 04) richiede di leggere `public.tenants` con un client che possa farlo affidabilmente indipendentemente dalle RLS. Due pattern equivalenti dal punto di vista del modello di trust:
1. **Edge Function Supabase**: l'admin app chiama una function passando il JWT utente; la function (su server Supabase) usa la `service_role` e ritorna `{ verified, schema }`. La chiave non lascia mai i server Supabase.
2. **Server-side Next.js**: `supabaseAdmin` vive nell'app admin (Vercel), con `import 'server-only'` come guard, env non-`NEXT_PUBLIC_`.

**Opzioni considerate:**
- (1) — più sicuro, riusabile anche da `apps/web`, ma round-trip extra e secondo deploy da gestire (Supabase Functions)
- (2) — meno passaggi, latenza minore, ma la chiave esiste come variabile cifrata su Vercel

**Decisione:** (2) per Sprint 1 / MVP. Pattern già adottato in `apps/admin/lib/supabaseAdmin.ts`.

**Rationale:** la doc di architettura prevedeva entrambi i pattern (riga 85 vs 118 erano in contraddizione interna, ora sanate). Per il backoffice MVP la complessità extra di un Edge Function dedicato non è giustificata: la chiave è confinata al processo server Vercel, non bundled, non loggata, e il client `supabaseAdmin` ha campi fissi (nessun input utente passa per `from()`/`select()`).

**Mitigazioni in piedi:**
- `import 'server-only'` su `supabaseAdmin.ts` (verificato: un import lato client fa fallire `next build`)
- env non-`NEXT_PUBLIC_` → mai nel bundle
- `.env.local` in `.gitignore` → mai nel repo
- `supabaseAdmin` confinato a una sola query con campi fissi (`schema_name`, `owner_id`) — nessun pattern dinamico
- Sequence `apps/admin/.env.local` su Vercel come variabile cifrata

**Regole operative (vincolanti per tutto lo sviluppo admin):**
- Mai loggare `process.env`, l'oggetto `supabaseAdmin`, né la sua config
- Mai accettare input utente come argomento di `supabaseAdmin.from(…)`, `.select(…)`, `.eq(…)`
- Mai aggiungere route che usino `supabaseAdmin` con table/column dinamici

**Trigger di revisione (→ post-MVP):** [[post-mvp|migrazione a Edge Function]] quando: (a) entra il secondo tenant reale, (b) si introduce CRUD esposto a admin con potenziale superficie d'attacco maggiore, o (c) si vuole riusare la verifica da `apps/web`. Vedi anche la sezione "Edge Functions — validazione schema" in `architettura-fullstack.md`.

---

### 2026-05-21 — Service layer — funzioni ricevono il client come parametro

**Contesto:** Sprint 2 porta i service in `@repo/supabase/src/services/`. Le funzioni operano sullo stesso `TenantClient` tipato `SupabaseClient<Database, 'template'>` ma devono funzionare con credenziali diverse a seconda del consumer:

- `getSiteSettings`, `getActiveNews`, `getMenuSections`, `getMenuBySection`, `createBooking` → eseguibili con client **anon** (read pubblico + INSERT anon su `bookings`)
- `getAvailableTimeSlots`, `cancelBookingByToken` → richiedono un client **privilegiato** (SELECT/UPDATE su `bookings` sono gated da `auth.uid() IS NOT NULL` nelle RLS attuali)

**Opzioni considerate:**
- (a) ogni service istanzia internamente il client (con `createSupabaseClient()` o un'API helper)
- (b) il service riceve `client: TenantClient` come **primo parametro** e non sa nulla delle credenziali

**Decisione:** (b). Firma uniforme: `async function fn(client: TenantClient, ...args)`.

**Rationale:** separa la responsabilità "ottenere le credenziali giuste" (che vive nei Server Component / Server Action / Route Handler del consumer) dalla logica della query (che vive nel service). Evita di duplicare i service per scope diversi (anon vs admin) e di accoppiare `@repo/supabase` alle env variabili del singolo consumer. Già implicitamente supportato da `@supabase/supabase-js` (i metodi del client sono semplici method-call sull'istanza passata).

**Conseguenza operativa:** il chiamante è responsabile di:
1. Istanziare il client con le credenziali appropriate (vedi voce successiva).
2. Non passare un client anon a service che richiedono privilegi (TypeScript non lo impedisce — è una convenzione documentata caso per caso nel JSDoc del service).

---

### 2026-05-21 — `bookings` lato pubblico — service_role server-side, no RPC

**Contesto:** due delle service function di Sprint 2 (`getAvailableTimeSlots`, `cancelBookingByToken`) toccano `bookings` con operazioni vietate ad anon dalle RLS attuali (`bookings_admin_select`, `bookings_admin_update` USING `auth.uid() IS NOT NULL`). Anche se i consumer (homepage SSR, route `/booking/cancel/[token]`) sono pubblici, il *client* lato server può essere privilegiato.

**Opzioni considerate:**
- (a) **RPC PostgreSQL `SECURITY DEFINER`** esposte come `template.available_time_slots(p_date)` e `template.cancel_booking_by_token(p_token)`, anon EXECUTE. Cambio dello schema baseline + rigenerazione tipi.
- (b) **Service riceve client privilegiato**, chiamato lato server-only con `SUPABASE_SERVICE_ROLE_KEY` su `apps/web` (stesso pattern di `apps/admin/lib/supabaseAdmin.ts`). Nessun cambio DB.
- (c) Aggiornare RLS/GRANT per permettere SELECT aggregata + UPDATE token-based ad anon. Più rischioso, ricalibra la baseline di sicurezza.

**Decisione:** (b). Sprint 2 produce solo i service in `@repo/supabase`. Quando arriva Sprint 4 (form prenotazioni e route cancel), `apps/web` introduce `lib/supabaseAdmin.ts` server-only e `SUPABASE_SERVICE_ROLE_KEY` come env Vercel non-`NEXT_PUBLIC_`, e i consumer chiamano i service con quel client.

**Rationale:**
- Coerente con la decisione precedente *2026-05-21 — `SUPABASE_SERVICE_ROLE_KEY` su Vercel admin* (lo stesso pattern, esteso a un secondo target).
- Sprint 2 resta puramente TypeScript: niente nuova migrazione DB, niente rigenerazione tipi, niente nuova decisione cross-cutting.
- L'opzione (a) resta sul tavolo come refactor coerente con la migrazione post-MVP a Edge Function (entrambi tolgono la `service_role` da Vercel).
- L'opzione (c) cambia il modello di sicurezza dei bookings — richiede analisi separata, non da Sprint 2.

**Mitigazioni in piedi (estensione delle regole già definite per `apps/admin`):**
- Il futuro `apps/web/lib/supabaseAdmin.ts` deve avere `import 'server-only'` come guard.
- Mai accettare input utente come argomento di `supabaseAdmin.from(...)`, `.select(...)`, `.eq(...)` direttamente — passare sempre attraverso i service tipati che hanno firme chiuse.
- I service `getAvailableTimeSlots` e `cancelBookingByToken` accettano solo input scalari (date, token UUID), validati con Zod a monte.

**Trigger di revisione (→ post-MVP):** stesso della voce precedente — migrazione a Edge Function quando: 2° tenant, CRUD admin esteso, o quando si vuole eliminare la `service_role` da Vercel del tutto. A quel punto sia `apps/admin` che `apps/web` perdono la chiave.
