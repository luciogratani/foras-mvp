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

**Gotcha operativo (2026-05-21):** la `service_role` key JWT Supabase è lunga ~180 caratteri. Un copia-incolla parziale (es. 117/180) produce un JWT malformato che Supabase accetta sintatticamente ma rifiuta con `Unauthorized` a runtime — senza un messaggio di errore che indichi la causa. **Checklist deploy:** verificare la lunghezza della chiave dopo il paste su Vercel e in `.env.local`. La chiave completa inizia con `eyJ` e finisce con caratteri base64url.

---

### 2026-05-21 — Upgrade stack major (Next 16 + React 19 + Tailwind 4) anticipato all'apertura di Sprint 3

**Contesto:** aprendo Sprint 3 (homepage pubblica SSR, prima UI vera del progetto) serviva scegliere la versione di Tailwind/shadcn da introdurre. Verifica fattuale delle versioni pubblicate al 2026-05-21: `tailwindcss@latest` = **4.3.0** (la v3 sopravvive solo come tag `v3-lts` = 3.4.19), `shadcn@latest` = **4.7.0** (targetizza TW4 di default), `next@latest` = **16.2.6**, `react@latest` = **19.2.6**. Il repo era su Next **14.2.29** + React **18.3.1**, senza Tailwind installato. Restare su Tailwind 3 avrebbe richiesto di pinnare il tag legacy `v3-lts` e usare la shadcn CLI in modalità retrocompatibile — andando *controcorrente* rispetto ai default degli strumenti, cioè creando l'attrito che la scelta "v3 = strada sicura" voleva evitare. La motivazione "Next 14 ⇒ shadcn documentati su v3" si è rivelata datata e di fatto invertita.

**Opzioni considerate:**
- (a) **Tailwind 3-LTS pinnato** sullo stack attuale (Next 14.2 + React 18.3) — collaudato storicamente ma ormai legacy; shadcn CLI in modalità retrocompatibile; doppia migrazione futura inevitabile.
- (b) **Tailwind 4 sullo stack attuale** (Next 14.2 + React 18.3) — allinea l'asse CSS/UI ai default degli strumenti, ma lascia aperto il debito framework (Next/React major) e usa la combinazione meno battuta TW4 + React 18.
- (c) **Upgrade completo** Next 16 + React 19 + Tailwind 4 — allineamento totale dello stack.

**Decisione:** (c). L'upgrade viene eseguito come **milestone infrastrutturale che precede i sub-task UI di Sprint 3** (la homepage SSR si costruisce direttamente sul nuovo stack).

**Rationale:** il costo di un major upgrade scala con la dimensione della codebase. Allo stato attuale `apps/web` è uno stub (page + health route), `apps/admin` è minimale (login + middleware + dashboard), `packages/ui` è vuoto e **nessun cliente ha ancora forkato il template**. È il punto di costo minimo. Rimandare a pre-freeze (Sprint 6) significherebbe migrare anche tutta la homepage e l'admin panel CRUD. Inoltre Tailwind 4 è comunque obbligato (gli strumenti `latest` lo assumono) e TW4 su React 18 è meno battuto di TW4 su React 19: tanto vale salire entrambi gli assi insieme, ora.

**Blast radius (l'upgrade NON è confinabile a `apps/web`):**
- Tocca tutto il monorepo: `apps/web`, `apps/admin`, `packages/ui`, `packages/supabase` (peer dep React). React/Next sono dipendenze condivise — non si può avere `web` su React 19 e `admin` su React 18 nello stesso install.
- **Punto critico di sicurezza:** `apps/admin` usa `@supabase/ssr@0.5` con middleware + cookies. Next 15+ rende **async** le request API (`cookies()`, `headers()`, `params`, `searchParams`); `@supabase/ssr` salta a 0.10.x. La milestone di upgrade DEVE includere un **gate di riverifica dell'auth admin** (login → `getVerifiedTenantClient` → middleware → isolamento cross-tenant), che è codice di sicurezza chiuso in Sprint 1.
- **Caching defaults:** Next 15 ha rimosso il cache-by-default su `fetch` e sui `GET` route handler → impatta `app/api/health/route.ts` e i fetch SSR di Sprint 3 (vanno verificati i comportamenti di rivalidazione attesi).

**Caveat di esecuzione:** Next 16 e React 19 sono **successivi al knowledge cutoff dell'assistente** (gennaio 2026). I prompt di upgrade istruiscono la sub-chat a seguire le **upgrade guide ufficiali correnti** e i **codemod ufficiali** (`@next/codemod`, codemod React 19, `@tailwindcss/upgrade`), non istruzioni potenzialmente datate scritte dal master.

**Target versioni (2026-05-21):** `next@16.2.6`, `react@19.2.6`, `react-dom@19.2.6`, `@types/react@19.2.15`, `@types/react-dom@19.2.3`, `tailwindcss@4.3.0` + `@tailwindcss/postcss@4`, `tw-animate-css@1.4.0` (sostituisce `tailwindcss-animate`, deprecato in TW4), `@supabase/ssr@0.10.3`, `@supabase/supabase-js@2.106.1`, `eslint-config-next@16.2.6`.

**Trigger di rollback:** se l'auth admin non supera il gate sotto Next 16, ripiegare sull'opzione (b) — Tailwind 4 su Next 14.2 + React 18.3 — e ritracciare l'upgrade framework come milestone dedicata pre-freeze. La decisione su Tailwind 4 (vs 3) è comunque ferma in tutti gli scenari.

---

### 2026-05-21 — Homepage pubblica: rendering dinamico (`force-dynamic`), non statico

**Contesto:** in Sprint 3 / 02 la homepage SSR (fetch `getSiteSettings` + `getActiveNews`) veniva prerenderizzata da Next 16 come **statica** (`○` nel route table) in assenza di API dinamiche esplicite (no `cookies()`/`headers()`/`searchParams`). Conseguenza: i contenuti — gestiti dal backoffice — sarebbero **congelati al build**, e una modifica dal pannello admin non comparirebbe sul sito pubblico senza un rebuild. Emerso in review dal route table del build (`pnpm --filter @repo/web build`), non da un errore.

**Opzioni considerate:**
- (a) `export const dynamic = 'force-dynamic'` — SSR per-request, dati sempre freschi.
- (b) `export const revalidate = N` — ISR, rigenerazione periodica (ritardo di propagazione fino a N s).
- (c) static + `revalidatePath('/')` on-demand dal backoffice al salvataggio (Sprint 5).

**Decisione:** (a) `force-dynamic` su `apps/web/app/page.tsx`.

**Rationale:** soddisfa il requisito "modifiche visibili sulla homepage pubblica senza rebuild" (backlog Sprint 5) nel modo più semplice e diretto. Il traffico di un sito di bar/ristorante non giustifica l'ottimizzazione di ISR o di revalidation on-demand (che resterebbero da mantenere/wirare). `force-dynamic` non penalizza il SEO: l'HTML è completo e server-reso per-request. Verificato: con la direttiva la route passa da `○` a `ƒ` nel build.

**Conseguenza operativa:** ogni sub-task che riscrive o estende `app/page.tsx` (es. Sprint 3 / 03) **deve preservare la direttiva**. **Trigger di revisione (→ post-MVP):** se il traffico cresce o la query a visita diventa un costo, passare a `revalidate = N` o a `revalidatePath` on-demand dal backoffice.

---

### 2026-05-21 — Email prenotazioni (conferma cliente + notifica gestore): demandata a follow-up

**Contesto:** Sprint 4 introduce il write-path prenotazioni (client privilegiato + form + cancel route). Il backlog originale includeva "Edge function Resend: email conferma al cliente + notifica al gestore" in Sprint 4, ma alla pianificazione emergono decisioni ancora aperte.

**Decisioni aperte (da prendere prima di implementare):**
1. **Dominio mittente:** dominio generico condiviso (es. `noreply@foras.it`) vs dominio specifico per ogni cliente (es. `noreply@bar-rossi.it`). Il dominio va verificato su Resend — impatta l'onboarding di ogni nuovo tenant.
2. **Canale:** email (Resend) vs SMS (Twilio/Vonage o altra). Il post-mvp.md esclude gli SMS per "complessità eccessiva" ma la preferenza del gestore potrebbe cambiare.
3. **Architettura di invio:** (a) Supabase Edge Function — coerente con la doc architetturale ("una edge function per l'email"), la service_role key non lascia Vercel; (b) Server Action + Resend Node SDK — nessun deploy separato, più semplice, ma diverge dalla doc e lascia `RESEND_API_KEY` su Vercel.

**Decisione (2026-05-21):** demandata. Sprint 4 è completo senza email — il `cancellation_token` viene mostrato nella success page come link diretto `/booking/cancel/{token}`, rendendo il cancel flow testabile senza email. L'email verrà implementata in un sub-task/sprint dedicato una volta risolte le tre decisioni sopra.

**Rationale:** il write-path ha già la sua complessità (surface di sicurezza più sensibile del progetto finora — service_role key su `apps/web`). Aggiungere infra email esterna (account Resend, verifica dominio, deploy funzione) allungherebbe Sprint 4 senza sbloccare ulteriori test funzionali. Il follow-up è a basso rischio di regressione (aggiunge una chiamata dopo `createBooking`, non modifica il flusso).

**Trigger:** quando le 3 decisioni sopra sono risolte. Implementazione prevista come sub-task autonomo (Sprint 4.5 o inizio Sprint 5).

---

### 2026-05-21 — Sprint 5 (Admin panel): slice verticali, drag&drop isolato, immagini via URL

**Contesto:** Sprint 5 è il più ampio del progetto (tutto il CRUD del backoffice). All'apertura emergono tre fatti che vincolano la pianificazione:

1. **`apps/admin` non ha ancora Tailwind/shadcn** — `globals.css` è un reset puro, `layout.tsx` è nudo, il login usa stili inline, `package.json` non dipende da `@repo/ui` né da `tailwindcss`. La UI admin parte da zero (mentre `apps/web` ha già la baseline da Sprint 3/01).
2. **Il service layer è solo lettura, e filtrata** — `getMenuSections/getMenuBySection/getActiveNews` filtrano `is_active = true`. L'admin deve vedere anche gli elementi disattivati e scriverli → servono nuove funzioni *admin-read* (senza filtro) e *write* in `@repo/supabase`.
3. **Le RLS di scrittura (`auth.uid() IS NOT NULL`) + GRANT a `authenticated` sono già a posto** → il CRUD funziona col verified tenant client (anon key + access token utente). **Nessuna modifica DB richiesta per Sprint 5.**

**Decisioni (3 forcelle, decise con Lucio il 2026-05-21):**

- **Decomposizione a slice verticali (non orizzontale).** Ogni sub-task = una sezione CRUD completa (funzioni service + UI), verificabile in browser a fine review. Unica fondazione orizzontale: la baseline UI + shell. Piano a 6 sub-task: `01` baseline UI + shell/nav + helper `requireTenantClient`, `02` CRUD menu, `03` drag-and-drop, `04` CRUD novità, `05` orari apertura + `time_slots`/coperti + impostazioni sito, `06` vista prenotazioni.
  - *Rationale:* Sprint 5 è grande e la review è trust-but-verify con test in browser; le slice verticali danno feature demoabili e blast radius piccolo per sub-task. L'orizzontale (stile Sprint 2) accumulerebbe molto codice prima di qualcosa di visibile.
- **Drag-and-drop come sub-task dedicato** (dopo il CRUD menu), non interleaved né rimandato. Aggiunge `@dnd-kit` (versione + compat React 19 da verificare in fase di scrittura del prompt 03) e una funzione di bulk-update di `position` nel service, applicata a sezioni/categorie/item/slide.
  - *Rationale:* è la parte più interattiva e iterativa, e introduce una dep nuova → isolarla tiene puliti i CRUD e confina il rischio. L'ordinamento numerico/su-giù come fallback resta sul tavolo se `@dnd-kit` desse problemi su React 19.
- **Immagini via URL testuale**, niente Storage in Sprint 5. I campi `menu_items.image_url`, `news_slides.image_url`, `site_settings.og_image` sono input di testo per un URL. L'upload su Storage (bucket `bar-assets` + path convention + RLS) resta in Sprint 7 come da backlog.
  - *Rationale:* lo Storage richiede wiring infra (bucket, path helper, RLS policies) che il backlog colloca consapevolmente dopo il freeze, all'onboarding del primo cliente. Anticiparlo allungherebbe Sprint 5 senza sbloccare il resto del CRUD.

**Conseguenze operative:**
- Il sub-task `01` replica per `apps/admin` il setup TW4 + `@repo/ui` di Sprint 3/01 (`apps/web`) e introduce l'helper server `requireTenantClient()` per non ripetere `getUser()` + `getSession()` + `getVerifiedTenantClient(user, accessToken)` in ogni pagina.
- Le primitive shadcn vengono aggiunte a `@repo/ui` (single source of truth condiviso con `apps/web`), invocando la CLI **da dentro `packages/ui`** (lezione Sprint 3: l'alias `@repo/ui` fa sbagliare il path alla CLI).
- Ogni nuova funzione di scrittura vive in `packages/supabase/src/services/` con firma `(client: TenantClient, ...args)` — nessuna query DB nei componenti.

**Trigger di revisione:** se `@dnd-kit` non è compatibile con React 19, ripiegare su ordinamento su/giù nel prompt 03 (la funzione di bulk-update `position` nel service resta invariata).

---

### 2026-05-22 — Hardening RLS scrittura: owner verificato contro `public.tenants` via funzione `SECURITY DEFINER`

**Contesto:** apertura Sprint 6 (template freeze). Chiude il debito aperto il 2026-05-20 (*Hardening RLS scrittura — da owner-scope*), il cui trigger era "secondo tenant **o** freeze del template, qualunque venga prima". Le policy di scrittura in `create_schema_from_template.sql` usano `auth.uid() IS NOT NULL`: un qualsiasi utente autenticato passa la policy su qualsiasi schema tenant esposto, perché la RLS non verifica che sia owner di **quello** schema. Con dati di clienti reali in arrivo (GDPR), va chiuso a livello RLS e non solo applicativo (`getVerifiedTenantClient`).

**Opzioni considerate:**
- (a) **Owner verificato contro `public.tenants`**: `auth.uid()` deve coincidere con `owner_id` della riga `schema_name = current_schema()`.
- (b) **Confronto con `auth.jwt() -> 'user_metadata' ->> 'schema'`**: più economico (nessuna subquery) ma **eredita la debolezza** di `user_metadata`, che è modificabile dall'utente via `updateUser()` — stesso vettore che `getVerifiedTenantClient` già mitiga lato app.
- (c) **Spostare il binding utente↔schema in `app_metadata`** (solo `service_role`): chiude la debolezza alla radice ma tocca `getVerifiedTenantClient`, la client factory e l'onboarding (Step 3) — scope più ampio del solo RLS.

**Decisione (con Lucio, 2026-05-22):** (a). Le policy di scrittura admin (`*_admin_all`, `bookings_admin_select/update/delete`) legano l'utente allo schema corrente confrontando `auth.uid()` con l'owner registrato in `public.tenants`.

**Implementazione (vincolante per il sub-task):** la verifica passa per una funzione `public.is_tenant_owner()` `SECURITY DEFINER` (es. `SELECT EXISTS (SELECT 1 FROM public.tenants WHERE schema_name = current_schema() AND owner_id = auth.uid())`), **non** come subquery diretta nella policy. Motivo: una subquery diretta richiederebbe `GRANT SELECT` su tutta `public.tenants` al ruolo `authenticated` e rischia ricorsione/effetti RLS su `public.tenants`. La funzione `SECURITY DEFINER` gira coi privilegi del definer (owner del DB), `REVOKE`/`GRANT EXECUTE` controllato, e non espone la tabella.

**Rationale:** (a) è robusta al tampering di `user_metadata` (a differenza di (b)) ed è una migrazione self-contained che **non** tocca il layer auth/client (a differenza di (c)). Entra nel **baseline congelato**: ogni nuovo tenant nasce già hardened, invece di nascere debole e venire patchato con una migrazione successiva. Poiché nessun cliente reale esiste ancora, è il momento di costo minimo.

**Conseguenze operative:**
- Va piegata in `create_schema_from_template.sql` (le policy di scrittura usano `public.is_tenant_owner()`), in `schema.sql` e in `migrations/001_init.sql`.
- Va applicata anche allo schema `template` esistente come parte del freeze (le policy attuali vanno droppate e ricreate).
- `current_schema()` deve risolvere allo schema del tenant quando PostgREST imposta il `search_path` dallo schema del client — **da verificare nel test su schema usa-e-getta** prima del freeze.
- Contestuale: estendere `docs/operations/audit_rls.sql` per controllare anche i GRANT minimi sui ruoli Supabase (debito aperto il 2026-05-21, stesso trigger freeze) e la presenza/firma di `is_tenant_owner()`.

---

### 2026-05-22 — Progetto Supabase: ri-confermato condiviso al trigger "primo cliente reale"

**Contesto:** la decisione del 2026-05-20 (*Progetto Supabase condiviso*) fissava un trigger di revisione esplicito: "prima dell'onboarding del **primo cliente reale** (dati personali + GDPR), rivalutare se serve un progetto dedicato". Il trigger è scattato con l'apertura di Sprint 6.

**Opzioni considerate:**
- Restare sul progetto condiviso (con gli schemi personali `underclub`, `alex_akashi`) + mitigazione via hardening RLS.
- Istanza/progetto Supabase dedicato a foras (isolamento totale di `auth`/`public`/`storage`).

**Decisione (con Lucio, 2026-05-22):** restare sul progetto condiviso per ora.

**Rationale:** `public` è vuoto (nessuna collisione su `public.tenants`), lo stack è self-hosted con controllo pieno sugli schemi esposti in PostgREST, e l'hardening RLS deciso oggi chiude il vettore di scrittura cross-tenant a livello DB. Il costo di un progetto dedicato (nuovo setup + ri-tunnel `postgres-meta` per i tipi + gestione separata) non è giustificato a un solo cliente reale. La separazione netta dei dati CRUD è garantita dallo schema-per-tenant + RLS hardened.

**Limitazione nota / trigger di revisione:** invariato nello spirito — se aumentano i clienti reali o il volume di dati personali, oppure se i due progetti personali non migrano altrove come previsto, rivalutare il progetto dedicato.

---

### 2026-05-22 — Email prenotazioni: Edge Function centralizzata + dominio di servizio condiviso

**Contesto:** chiude il follow-up aperto il 2026-05-21 (*Email prenotazioni: demandata a follow-up*), che lasciava aperte tre decisioni (dominio mittente, canale, architettura di invio). La MVP Release Checklist richiede "email conferma e notifica gestore consegnate". Idea di Lucio: invece di configurare un dominio/DNS per ogni cliente, tutti i clienti fanno riferimento a **un'unica funzione backend** che invia con Resend da **un'email di servizio dedicata al progetto**.

**Decisione (con Lucio, 2026-05-22):** le tre decisioni aperte collassano in un solo design:
- **Dominio mittente** → unico dominio di servizio `foras.*`, verificato una volta sola su Resend (non per-cliente).
- **Canale** → email via Resend.
- **Architettura** → Edge Function Supabase centralizzata `send-booking-email` (sullo stack self-hosted), invocata da tutti i client dopo `createBooking`. Riceve `schema` + booking id, valida lo `schema` contro `public.tenants` (coerente con *Edge Functions — validazione schema*), legge `site_settings` del tenant con `service_role`, invia conferma al cliente + notifica al gestore.

**Costruzione:** in Sprint 6, **in parallelo** al lavoro di freeze (è infra tenant-agnostica, non fa parte degli artefatti congelati). Il primo cliente va live già con email; la pipeline si valida sul cliente #1.

**Rationale:**
- **Onboarding semplificato** — elimina lo step DNS *per cliente*: si verifica `foras.*` una volta e ogni nuovo tenant eredita la pipeline.
- **Sicurezza** — la `RESEND_API_KEY` vive solo nella Edge Function, **non tocca il Vercel di nessun cliente**. È la direzione del post-MVP "migrazione a Edge Function" (chiavi fuori da Vercel), ottenuta subito.
- **Coerenza** — combacia con "una Edge Function per l'email" della doc architetturale e con la decisione di validazione schema.

**Trade-off e mitigazioni:**
- **Branding mittente:** il cliente finale riceve dal dominio `foras.*`, non dal dominio del locale. Mitigato con `From: "<nome locale>" <prenotazioni@foras.*>` (display name da `site_settings`) + `reply-to` = email del locale. Override per-tenant del dominio mittente possibile in futuro via `site_settings` (post-MVP).
- **Quota/reputazione Resend condivisa** tra tutti i clienti — irrilevante a scala "bar locali"; trigger di revisione = volumi alti o complaint.
- **GDPR:** foras diventa data processor dell'email del cliente finale → va riflesso nel template della pagina `/privacy`.

---

### 2026-05-22 — Timezone del tenant: fix anticipato a Sprint 6 (non più post-MVP)

**Contesto:** il guard prenotazioni di Sprint 5 / sub-task 05b (`getAvailableTimeSlots` ritorna `[]` per date passate e giorni chiusi, e filtra i turni fuori dalla finestra `open`/`close`) confronta gli orari in **UTC puro**. Era stato marcato post-MVP. Ma il primo cliente reale è in Italia (`Europe/Rome`, UTC+1/+2): un guard che calcola "data passata" / "giorno chiuso" / "finestra oraria" in UTC sbaglia attorno alla mezzanotte e al confine di giornata (es. "oggi" vs "ieri" nelle ore notturne, o un turno serale vicino a mezzanotte locale).

**Decisione (con Lucio, 2026-05-22):** includere un fix timezone minimale in Sprint 6. Aggiungere `site_settings.timezone TEXT NOT NULL DEFAULT 'Europe/Rome'` (IANA tz). Il guard calcola "ora corrente" e "data odierna" nella timezone del tenant invece che in UTC.

**Conseguenza di scope (intersezione col freeze):** `site_settings.timezone` è una **colonna nuova** → entra nel baseline congelato (`create_schema_from_template.sql`, `schema.sql`, `migrations/001_init.sql`) e va applicata allo schema `template` esistente. Il fix è quindi parte degli artefatti freeze, non un task isolato. La logica del guard (`getAvailableTimeSlots`, guard data-passata in `createBooking`) è un cambiamento al service layer in `@repo/supabase`.

**Rationale:** un cliente reale con prenotazioni serali rende il bug concreto, non teorico. Il costo è piccolo (una colonna + conversione tz nel guard, senza nuove dipendenze: `Intl.DateTimeFormat` con `timeZone` copre il calcolo data/ora locale). Farlo ora evita una migrazione immediata post-freeze. Il campo per-tenant (non hardcoded) copre clienti futuri in altre timezone senza ulteriori modifiche di schema.
