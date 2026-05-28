---
status: done
created: 2026-05-28
completed: 2026-05-28
type: audit
area: audit
target: internal-review
topic: valutazione-complessita-manutenibilita-scalabilita-affidabilita
owner: master-chat
---

# Audit 04 — Valutazione codebase: complessità, manutenibilità, scalabilità, affidabilità

> **A cosa serve.** A differenza degli audit 01-03 (consulenze a chat esterne), questa è una **review interna sul repo**: lettura diretta di schema, onboarding, service layer, auth/RLS, edge function, proxy e config, con valutazione su quattro assi. Snapshot al 2026-05-28, a template congelato (freeze 2026-05-27) e prima dell'onboarding del cliente #1.
>
> **Metodo.** Valutazione a codice, ignorando i file relativi alle chat di Claude. Nessuna modifica al codice.

---

## Quadro generale

Monorepo pnpm pulito: 2 app (`web` pubblica SSR, `admin` backoffice) + 2 package (`@repo/supabase` service layer, `@repo/ui` shadcn). ~9.250 righe TS/TSX. Multi-tenancy **schema-per-tenant** su singola istanza Supabase self-hosted in Docker, RLS owner-scoped. Documentazione sproporzionatamente ricca rispetto al codice (decision-log, runbook, audit, commenti sul *perché*).

---

## 1. Complessità — **bassa e ben governata**

- Separazione netta e disciplinata: il service layer in `packages/supabase/src/services/*` è **puro** (riceve un `TenantClient`, zero dipendenze da Next), le server actions sono sottili, la UI sta nei componenti. Questo è il singolo fattore che più tiene bassa la complessità.
- Contratti dati via Zod + tipi generati (`packages/supabase/src/types/database.ts`). Naming consistente.
- La complessità *intrinseca* è tutta nella multi-tenancy + RLS — ed è gestita con commenti che spiegano le scelte non ovvie (es. il divieto di `SET search_path` su `is_tenant_owner()`, `docs/operations/create_schema_from_template.sql:278`). Poca complessità *accidentale*.
- **Costo nascosto**: la mole di documentazione è un asset ma anche un onere — rischio di drift docs/codice se non aggiornata a ogni cambio.

## 2. Manutenibilità futura — **buona, con un tallone d'Achille**

- **Forze**: tipi + Zod, freeze del template come fonte di verità (`schema.sql`), runbook migrazioni numerate, `docs/operations/audit_rls.sql` per verificare l'allineamento RLS tra schemi, decision-log che preserva il *perché*.
- **Tallone #1 — zero test automatici, zero CI.** Nessun file `*.test.*`, nessuno script `test`, nessun workflow. La verifica è interamente manuale (smoke SQL, audit eseguito a mano). In un sistema multi-tenant dove **una RLS sbagliata = leak cross-tenant**, l'assenza di una suite che giri `docs/operations/rls_isolation_tests.sql` in pipeline è il rischio strutturale principale.
- **Tallone #2 — propagazione migrazioni manuale schema-per-schema** (`docs/operations/migration-runbook.md:61`): O(n) sui tenant, error-prone. Il trigger di revisione è fissato a 5-6 clienti — ragionevole, ma è un debito che cresce linearmente.
- Minore: la edge function importa `@supabase/supabase-js@2` da esm.sh **senza pin** (`supabase/functions/send-booking-email/index.ts:1`), mentre il resto del repo pinna `2.106.1` — possibile drift.

## 3. Scalabilità — **adeguata al dominio, limiti sul numero di tenant**

- **Carico**: ottima per il dominio (siti bar/ristoranti, traffico basso, homepage SSR + poche scritture). Supabase self-hosted regge ampiamente.
- **Numero di tenant**: è qui il limite vero, ed è strutturale dello schema-per-tenant:
  - Migrazioni e onboarding O(n) manuali via `ssh + docker exec` → dipendono da un **singolo operatore** (il master). Va bene per decine di clienti, non per centinaia/SaaS self-serve.
  - PostgREST espone ogni schema: molti schemi = più oggetti a catalogo e reload della schema-cache. Sano per decine, non migliaia.
  - 1 progetto Vercel + dominio custom per cliente → anche il deploy è O(n) operativo. Coerente con strategia "pochi clienti", non con scala di massa.
- **Da verificare** (non deducibile dal repo): connection pooler (PgBouncer/Supavisor) per le connessioni con più app/tenant, e strategia di backup del Postgres in Docker. Su self-hosted sono responsabilità del master, non di Supabase managed.

## 4. Affidabilità — **fondamentali solidi, lacune note e dichiarate**

- **Sicurezza, buona**: RLS owner-scoped basata su `public.tenants` (non solo `auth.uid()`), doppia validazione schema (proxy admin `apps/admin/lib/auth.ts` + edge function), `public.tenants` con RLS abilitata e **nessuna policy** = deny-by-default via API, HTML-escaping nelle email (`supabase/functions/send-booking-email/index.ts:10`).
- **Punto d'attenzione #1**: l'app `web` pubblica gira con `SUPABASE_SERVICE_ROLE_KEY` (bypassa RLS) perché `anon` non può fare SELECT su `bookings` (`apps/web/lib/supabaseAdmin.ts`, `apps/web/app/booking/actions.ts:75`). È documentato e giustificato, ma sposta la sicurezza del flusso prenotazioni **dalla RLS al codice del service layer + Zod**: una svista in una query lì può esporre dati. La migrazione a edge function è tracciata in post-MVP — sensato.
- **Punto d'attenzione #2 — overbooking**: `createBooking` fa check capacità + insert non atomico (`packages/supabase/src/services/bookings.ts:127`). L'unique constraint blocca i duplicati, non l'overbooking soft concorrente. Accettato per MVP; la fix reale è un vincolo/trigger DB o RPC transazionale.
- **Punto d'attenzione #3 — riordino non transazionale**: `reorderMenuItems/Sections/Categories` fanno `Promise.all` di N update separati (`packages/supabase/src/services/menu.ts:221-243`); un fallimento parziale lascia `position` inconsistenti. Impatto basso (solo ordinamento). Stesso pattern read-then-write per `max position` (`createMenuSection`, `moveItemToCategory`) è race-prone.
- **Watch**: l'anomalia delle tabelle `menu_*` svuotate (causa ignota, 2026-05-27) è proprio il tipo di regressione silenziosa che test/monitoraggio coglierebbero — altro argomento a favore della suite.

---

## Soluzioni per i talloni d'Achille

Ordinate per rapporto valore/sforzo. Le prime due sono le sole che alzerei a **bloccanti** prima del cliente #1.

### A. Suite di test automatica + CI *(tallone #1 — bloccante)*
Il rischio è il leak cross-tenant: è l'unico difetto del progetto che produce un danno irreversibile e silenzioso. Difesa a tre livelli, dal più economico al più completo:
1. **RLS isolation in CI** — wrappare `docs/operations/rls_isolation_tests.sql` in un job che: crea due schemi tenant usa-e-getta da `create_schema_from_template.sql`, prova accessi incrociati (tenant A non deve leggere/scrivere B), e fallisce la pipeline se una sola riga passa. È il test che vale di più e costa meno.
2. **Test del service layer** — `packages/supabase/src/services/*` è puro (riceve il client): testabile contro un Postgres effimero (container in CI) senza Next. Coprire prima i percorsi a rischio dati: `createBooking` (capacità, finestra oraria, duplicati), `getAvailableTimeSlots` (giorni chiusi, ranges), `cancelBookingByToken`.
3. **`audit_rls.sql` come gate di onboarding** — eseguirlo automaticamente dopo ogni `create_schema_from_template.sql` e dopo ogni migrazione RLS; zero righe = ok, altrimenti stop. Trasforma un check manuale "quando me lo ricordo" in un cancello.

> Aggiungere `"test"` agli script di `package.json` e un workflow GitHub Actions (`pnpm -r test` + job SQL su `postgres:15.8` service container). Vitest è sufficiente, zero lock-in.

### B. Propagazione migrazioni O(n) *(tallone #2 — bloccante a >1 tenant)*
Il runbook manuale è leggibile ma non scala oltre pochi schemi. Senza adottare un framework pesante:
- **Loop idempotente sui tenant**: uno script che legge `public.tenants`, e per ogni `schema_name` esegue `SET search_path = <schema>;` + il corpo della migrazione, in transazione, fermandosi al primo errore. Sostituisce il "ripeti a mano per ogni cliente" con un comando solo.
- **Tabella `schema_migrations` per-tenant** (o una `public.tenant_migrations(schema_name, version, applied_at)`): registra quali migrazioni sono già applicate, rende il loop ri-eseguibile e diagnostica i tenant indietro.
- Mantenere il flusso numerato attuale; aggiungere solo il runner. Riconsiderare un tool (es. dbmate/Sqitch) solo se si supera ~1 migrazione/settimana, come già scritto nel runbook.

### C. `service_role` nell'app web *(punto d'attenzione #1)*
La fix definitiva è già in roadmap (spostare il flusso booking in edge function: la chiave non lascia i server Supabase). Nel frattempo, mitigazioni a basso costo:
- Il punto A copre il rischio principale (test sul service layer che fa da unico guardiano dei dati).
- Restringere la superficie: il client `getWebSupabaseAdmin()` dovrebbe toccare **solo** `bookings`/`time_slots`/`site_settings`/`closed_dates`; una review periodica che nessuna query con `service_role` legga tabelle non necessarie.

### D. Overbooking race *(punto d'attenzione #2)*
Rendere atomico il check+insert, in ordine di robustezza:
- **Vincolo a livello DB** — un trigger `BEFORE INSERT` su `bookings` che somma i `covers` confermati per `(time_slot_id, date)` e rifiuta se supera `max_covers`. Sposta la garanzia dove deve stare e copre anche scritture future fuori dal service layer.
- **Oppure RPC transazionale** (`SELECT ... FOR UPDATE` sul turno + insert) chiamata da `createBooking`.
- Mantenere comunque il check applicativo per il messaggio d'errore UX; il vincolo DB è la rete di sicurezza.

### E. Riordino e `max position` non transazionali *(punto d'attenzione #3)*
- Riordino: sostituire gli N update con **una sola** chiamata `upsert` batch (un round-trip, semantica atomica), oppure una RPC che aggiorna le posizioni in transazione.
- `max position`: alla concorrenza due righe possono ottenere la stessa posizione. Impatto basso; se infastidisce, un `position` calcolato lato DB o un unique parziale `(section_id, position)` lo rende esplicito.

### F. Pin versione edge function *(minore)*
Pinnare `@supabase/supabase-js` alla stessa `2.106.1` del resto del repo in `supabase/functions/send-booking-email/index.ts:1`, per evitare che un deploy futuro tiri una versione major diversa silenziosamente.

### G. Operatività self-hosted *(da verificare, non bloccante)*
- Confermare **backup automatici** del volume Postgres in Docker (pg_dump schedulato + retention, o snapshot del volume) e provare almeno un restore.
- Verificare il **connection pooler** (Supavisor/PgBouncer) man mano che crescono app e tenant.
- Il collo di bottiglia "single operator" (onboarding/migrazioni via SSH del master) si attenua con gli script di B: documentare il runbook così che non dipenda da una sola persona.

---

## Verdetto sintetico (approfondito)

**Posizionamento.** foras non è — e non vuole essere — un SaaS self-serve di massa. È un **template boutique multi-tenant** per pochi clienti premium, ciascuno con dominio e deploy propri. Letta con questa lente, quasi ogni "limite" del progetto è in realtà una **scelta coerente**: schema-per-tenant dà isolamento forte e personalizzazione per cliente al prezzo di operazioni O(n); deploy per-cliente dà domini custom al prezzo di overhead operativo. Sono trade-off giusti *per questo posizionamento*. Diventerebbero sbagliati solo se l'obiettivo virasse verso centinaia di tenant o l'auto-registrazione — scenario in cui andrebbe ripensato il modello, non aggiustato ai margini.

**Stato di salute.** Il codice è maturo e disciplinato: la qualità architetturale (service layer puro, contratti tipizzati, RLS owner-scoped, documentazione del *perché*) è sopra la media per un MVP. Il debito esistente è quasi tutto **consapevole e documentato** (overbooking, service_role nel web, migrazioni manuali) — il che è molto diverso dal debito accidentale: significa che le scelte sono state prese, non subite.

**La singola eccezione che conta.** L'unico rischio non mitigato e ad alto impatto è il **leak cross-tenant** abilitato dall'assenza di test automatici. Tutti gli altri difetti producono fastidi recuperabili (un overbooking soft, posizioni di menu scombinate, un'email non inviata); un errore di RLS non colto produce un danno **silenzioso, irreversibile e di fiducia** — esattamente la categoria che un prodotto multi-tenant non si può permettere. Per questo la suite di test (soluzione A) non è "nice to have" ma la precondizione che separa "template congelato" da "template onboardabile".

**Sequenza consigliata prima del cliente #1.**
1. **A — RLS isolation in CI** (alto valore, basso costo): il cancello contro il leak.
2. **B — runner migrazioni idempotente**: serve dal momento in cui esistono ≥2 schemi, ossia appena onboardi il #1.
3. **D — vincolo DB anti-overbooking**: economico, e toglie l'unico difetto che il cliente *vedrebbe* (un coperto venduto due volte).
4. Il resto (C, E, F, G) è iterabile dopo, senza bloccare l'onboarding.

**Cosa NON fare.** Resistere alla tentazione di "industrializzare" in anticipo: niente framework di migrazione pesante, niente routing multi-tenant su dominio condiviso, niente astrazioni per tenant che oggi non esistono. La soglia che il progetto stesso ha fissato (5-6 clienti / 1 migrazione a settimana) è il momento giusto per rivalutare — prima è over-engineering che aggiunge complessità senza beneficio. Il valore ora sta tutto nelle reti di sicurezza (test, vincoli DB), non nell'infrastruttura.

**In una riga:** progetto solido e ben posizionato, il cui rischio residuo non è la qualità del codice ma l'assenza di una rete che impedisca a un errore di RLS di diventare un leak — chiudere quella (A + B + D) lo rende pronto per il primo cliente reale.
