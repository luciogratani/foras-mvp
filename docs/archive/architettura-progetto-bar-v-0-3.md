# Architettura Progetto — Sito Web Bar Locale

## Cos'è questo progetto

Sistema multi-tenant per sviluppare e gestire siti web per bar locali, basato su un'unica istanza Supabase condivisa. L'obiettivo è creare uno scheletro funzionante e riusabile (`/template`) che possa essere forkato e personalizzato graficamente per ogni nuovo cliente, mantenendo logica, contratti dati e service layer invariati.

---

## Decisioni architetturali

### 1. Multi-tenancy con Supabase — schema separation

- Si usa un **singolo progetto Supabase** con più **schema PostgreSQL**, uno per ogni cliente.
- Le Supabase client libraries supportano lo schema custom via configurazione:
  ```js
  createClient(URL, ANON_KEY, { db: { schema: 'nome_schema' } })
  ```
- **Auth**: ogni admin viene creato con `user_metadata.schema` valorizzato al nome del proprio schema. Al login, il client viene inizializzato con lo schema corretto letto dai metadata.
- **RLS**: configurata su ogni schema con `auth.uid()`, identica a come funziona su `public`.
- **Edge Functions**: sono schema-agnostic. Lo schema viene passato come parametro nel body della chiamata. Dentro la function si usa `supabase.schema(nome_schema)`. Lo schema viene validato prima dell'uso — vedi sezione dedicata.
- **Limitazione nota**: Auth e Storage rimangono su `public`. La separazione per schema vale per CRUD via PostgREST.

### 2. Schema `template` come ambiente di sviluppo attivo

- Lo schema `template` viene usato anche **online e in produzione** durante la fase di sviluppo.
- Questo permette di lavorare con dati reali, far emergere edge case e definire tabelle e RLS su casi concreti.
- A fine sviluppo si produce un documento di onboarding, si puliscono i dati e lo schema `template` rimane solo come riferimento per i fork futuri.

**Criterio di congelamento — quando il template è pronto per essere forkato:**

> Il template si congela quando tutte e tre le seguenti condizioni sono soddisfatte:
> 1. Tutti i componenti homepage sono sviluppati in versione headless, con una wireframe view funzionante nello schema `template`
> 2. DB, RLS ed edge functions sono completi e testati end-to-end
> 3. Il pannello admin è completo con tutte le funzionalità CRUD previste
>
> Solo a quel punto è possibile onboardare il primo cliente reale.

**Dopo il congelamento:**
- `schema.sql` è la fonte di verità per la struttura iniziale.
- Le modifiche post-freeze vengono gestite tramite **script di migrazione numerati** — vedi sezione dedicata.

### 3. Skeleton / wireframe funzionante — `/template`

- La cartella `/template` è la base condivisa per tutti i clienti.
- Contiene componenti **quasi headless**: logica cablata, UI minima, zero styling custom.
- Per ogni nuovo cliente si **copia la cartella `/template`** e si sviluppa la UI custom sopra, senza toccare logica e service layer.
- Non è un package npm né un submodule git: è una cartella da copiare e personalizzare.

### 4. Variabili d'ambiente per tenant

Ogni progetto cliente ha un proprio `.env` nelle app che usano Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=uguale per tutti
NEXT_PUBLIC_SUPABASE_ANON_KEY=uguale per tutti
NEXT_PUBLIC_SUPABASE_SCHEMA=nome_bar
```

Un singolo `supabaseClient.ts` condiviso le legge e inizializza il client con lo schema corretto.

**Cosa è sicuro esporre con `NEXT_PUBLIC_`:**
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` sono intenzionalmente pubbliche — Supabase è progettato per esporre queste credenziali al browser. La `anon key` non è una chiave segreta: è una chiave JWT che identifica il progetto e consente solo le operazioni permesse dalle RLS. La sicurezza dei dati è interamente delegata alle RLS policies, non all'oscuramento della chiave. La `service_role` key, quella sì, non va mai esposta al client e va usata solo nelle Edge Functions server-side.

### 5. Admin panel

- Ogni cliente ha un proprio admin panel con le stesse funzionalità (CRUD sui dati dello schema).
- I componenti admin sono identici per tutti i tenant — cambiano solo i dati serviti.
- L'accesso è protetto da Supabase Auth + RLS sullo schema.

### 6. Deploy

- Deploy separato per ogni cliente su **dominio custom** (es. `nome-locale.it`).
- Nessun sistema di routing multi-tenant su dominio condiviso (per ora fuori scope).

---

## Migrazioni schema — gestione post-freeze

Dopo il congelamento del template, le modifiche allo schema vengono gestite tramite **script di migrazione numerati**, non tramite diff manuali su `schema.sql`.

**Struttura:**

```
repo-template/
    /migrations
        001_init.sql              ← schema iniziale completo (post-freeze)
        002_add_og_image.sql      ← ogni modifica successiva
        003_bookings_add_notes.sql
    schema.sql                    ← aggiornato dopo ogni migrazione (stato corrente)
    CHANGELOG.md                  ← registro human-readable delle modifiche
```

**Convenzione per ogni script:**

```sql
-- 002_add_og_image.sql
-- Aggiunge og_image a site_settings
-- Data: 2025-06-01 | Applicare a: tutti i clienti esistenti

ALTER TABLE site_settings ADD COLUMN og_image TEXT;
```

**Flusso di lavoro:**
1. Si scrive lo script numerato in `/migrations`.
2. Si aggiorna `schema.sql` per riflettere lo stato corrente.
3. Si aggiunge una riga in `CHANGELOG.md` con numero, data e descrizione.
4. Si applica lo script manualmente su ogni schema cliente (`SET search_path = bar_rossi; \i 002_add_og_image.sql`).

**Perché non un tool automatico:** per la scala di questo progetto (pochi clienti, modifiche rare) un tool come Flyway o le Supabase migrations automatizzate aggiungono complessità senza benefici reali. Il flusso manuale con script numerati è sufficiente e leggibile. Se il numero di clienti cresce oltre 5-6, vale la pena riconsiderare.

---

## RLS multi-schema — propagazione e checklist

Le RLS policies sono identiche su tutti gli schemi ma vanno configurate manualmente su ognuno al momento dell'onboarding. Questo crea un rischio: una correzione a una policy va replicata su tutti gli schemi esistenti.

**Regola operativa:** ogni modifica a una RLS policy viene trattata come una migrazione. Va scritta in uno script numerato (`/migrations/003_fix_rls_bookings.sql`) e applicata a tutti gli schemi uno per uno, esattamente come una modifica di schema.

**Checklist onboarding RLS (da includere nel Playbook):**

```
□ Eseguire create_schema_from_template.sql con il nome schema corretto
□ Verificare che tutte le tabelle abbiano RLS abilitata (rls_enabled = true)
□ Verificare che ogni policy usi auth.uid() e non valori hardcoded
□ Testare l'accesso con un utente autenticato sullo schema corretto
□ Testare che un utente di un altro schema non possa leggere i dati
□ Verificare le Storage policies (bucket condiviso, path-based — vedi sezione Storage)
```

**Test di isolamento da eseguire ad ogni onboarding:**

```sql
-- Connettersi come admin del bar_rossi, verificare che non si vedano dati di bar_verdi
SET search_path = bar_rossi;
SELECT * FROM bookings; -- deve restituire solo i record di bar_rossi
```

---

## Edge Functions — validazione schema

Le Edge Functions ricevono il nome dello schema nel body della chiamata. Senza validazione, un client potrebbe richiedere uno schema arbitrario e accedere a dati di altri tenant.

**Soluzione: whitelist degli schemi validi + verifica owner.**

La validazione avviene in due livelli, in quest'ordine:

**Livello 1 — whitelist:** lo schema richiesto deve essere in una lista di schemi noti, letta da una tabella `public.tenants` gestita lato server.

```typescript
// edge-function/index.ts
const { schema } = await req.json()

const { data: tenants } = await supabaseAdmin
  .from('tenants')
  .select('schema_name')

const validSchemas = tenants.map(t => t.schema_name)

if (!validSchemas.includes(schema)) {
  return new Response('Schema non autorizzato', { status: 403 })
}
```

**Livello 2 — verifica owner:** si controlla che l'utente autenticato nella request sia effettivamente l'owner di quello schema, confrontando `auth.uid()` con il campo `owner_id` nella tabella `public.tenants`.

```typescript
const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)

const { data: tenant } = await supabaseAdmin
  .from('tenants')
  .select('schema_name')
  .eq('schema_name', schema)
  .eq('owner_id', user.id)
  .single()

if (!tenant) {
  return new Response('Accesso non autorizzato', { status: 403 })
}

// Solo a questo punto si usa lo schema
const result = await supabaseAdmin.schema(schema).from('bookings').select(...)
```

**Tabella `public.tenants` (minima):**

```sql
CREATE TABLE public.tenants (
  schema_name TEXT PRIMARY KEY,
  owner_id    UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

Questa tabella è l'unica in `public` che contiene dati applicativi. Va inclusa nello script di onboarding e popolata automaticamente al momento della creazione di ogni nuovo schema.

---

## Storage — separazione per tenant

Auth e Storage rimangono su `public` e non supportano la separazione per schema. La separazione tra tenant in Storage si ottiene tramite **convenzione di path nei bucket** e **Storage RLS policies basate sul path**.

**Struttura bucket:**

```
bucket: bar-assets          ← un solo bucket condiviso
  /bar-rossi/
      hero.jpg
      gallery/
          foto1.jpg
          foto2.jpg
      news/
          slide1.jpg
  /bar-verdi/
      hero.jpg
      ...
```

**Storage RLS policies:**

```sql
-- Lettura pubblica (homepage): chiunque può leggere da qualsiasi path
CREATE POLICY "Lettura pubblica"
ON storage.objects FOR SELECT
USING ( bucket_id = 'bar-assets' );

-- Scrittura: solo l'admin del tenant può scrivere nel proprio path
CREATE POLICY "Scrittura owner"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bar-assets'
  AND (storage.foldername(name))[1] = (auth.jwt() -> 'user_metadata' ->> 'schema')
);

-- Aggiornamento e cancellazione: stessa logica della scrittura
CREATE POLICY "Modifica owner"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'bar-assets'
  AND (storage.foldername(name))[1] = (auth.jwt() -> 'user_metadata' ->> 'schema')
);

CREATE POLICY "Cancellazione owner"
ON storage.objects FOR DELETE USING (
  bucket_id = 'bar-assets'
  AND (storage.foldername(name))[1] = (auth.jwt() -> 'user_metadata' ->> 'schema')
);
```

**Funzione helper per costruire i path (da includere in `/packages/supabase`):**

```typescript
export function storageAssetPath(schema: string, filename: string): string {
  return `${schema}/${filename}`
}

// Uso:
const path = storageAssetPath('bar-rossi', 'gallery/foto1.jpg')
const { data } = supabase.storage.from('bar-assets').getPublicUrl(path)
```

**Nota su `next.config.ts`:** il dominio del bucket Supabase Storage va dichiarato in `remotePatterns` per permettere a `<Image>` di ottimizzare le immagini. Da aggiungere nella checklist di onboarding.

```ts
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
},
```

---

## Struttura di progetto prevista

Il template è un repo autonomo. Ogni nuovo cliente nasce come fork di quel repo.

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

---

## Documento da produrre a fine sviluppo — Tenant Onboarding Playbook

Da scrivere **durante** lo sviluppo del template, non alla fine. Conterrà:

- Schema PostgreSQL completo commentato (tabelle, campi, relazioni)
- RLS policies spiegate in linguaggio umano + SQL
- Script `create_schema_from_template.sql` da eseguire per ogni nuovo cliente
- Popolamento automatico di `public.tenants` durante l'onboarding
- Variabili d'ambiente necessarie e dove configurarle (con nota su cosa è pubblico e cosa no)
- Configurazione bucket Storage e Storage RLS policies
- Configurazione `next.config.ts` per i domini Storage
- Procedura di deploy e configurazione dominio custom
- Checklist RLS di onboarding
- Checklist pre-deploy (GDPR, privacy policy, meta tag)

---

## Sezioni e funzionalità

### Homepage — `dominio.it`

| Sezione | Dati |
|---|---|
| Hero con immagine o video | Supabase Storage |
| Galleria foto | Supabase Storage |
| Popup novità (multi-slide) | DB + Storage |
| Slogan testuale | DB |
| Biografia testuale | DB |
| CTA → Prenota e Menu | — |
| Orari di apertura | DB |
| Footer con info e Google Maps | DB |
| Sezione news/slide (stesse del popup, in fondo alla pagina) | DB + Storage |

**Note:**
- Il popup supporta più elementi attivi contemporaneamente, con navigazione a slide. Stessi contenuti replicati come sezione statica in fondo alla homepage.
- Form candidature dipendenti: escluso dallo scope iniziale. Incluso nel template come componente opzionale nascosto di default, attivabile su richiesta esplicita del cliente.

### Backoffice — `admin.dominio.it`

- Gestione prenotazioni (visualizzazione, lista per data/turno)
- Gestione contenuti sito (mostra/nascondi sezioni, modifica testi principali)
- Gestione menu
- Gestione popup/novità (CRUD elementi, ordinamento slide)
- Gestione orari di apertura
- Gestione candidature (nascosto di default, attivabile)

---

## Prenotazioni — decisioni

### Conferma
- **Conferma automatica** con controllo disponibilità coperti.
- Il gestore imposta nel backoffice la capacità massima per turno (es. "max 30 coperti a pranzo").
- Il sistema accetta la prenotazione se i coperti disponibili sono sufficienti, rifiuta altrimenti.
- Nessuna conferma manuale richiesta: elimina il problema delle prenotazioni fuori orario.

### Cancellazione
- **Sì, lato utente via link nel ticket di conferma.**
- Ogni prenotazione ha un `cancellation_token` (UUID). L'utente riceve una email con link `dominio.it/booking/cancel/UUID`.
- Nessuna autenticazione richiesta, nessuna pagina custom complessa, RLS standard.
- Alla cancellazione i coperti tornano disponibili automaticamente.

### Reminder
- **Fuori scope.** Richiederebbe integrazione SMS/email schedulata (Twilio, edge function cron). Inserito nel Playbook come funzione futura opzionale.

### Notifica al gestore
- **Email automatica ad ogni prenotazione** tramite Resend (piano gratuito sufficiente).
- Una singola edge function, nessuna infrastruttura aggiuntiva.
- Il gestore riceve nome, data, ora, coperti richiesti senza dover aprire il backoffice.

### GDPR
- Il form prenotazioni include checkbox di consenso al trattamento dati e link a privacy policy.
- La privacy policy è una pagina statica per cliente (`/privacy`).
- Da documentare nel Playbook come checklist obbligatoria pre-deploy.

### Schema dati prenotazioni (sintesi)
- `time_slots`: turni disponibili con capacità massima per turno
- `bookings`: prenotazioni con riferimento al turno, coperti richiesti, `cancellation_token`, stato

### SEO e meta tag
- `title`, `description` e `og:image` della homepage sono gestibili dal backoffice.
- Vivono come campi nella tabella `site_settings`, nessuna funzione separata.

### Menu
- Struttura e livello di dettaglio da definire separatamente (impatta lo schema dati).
- Ogni piatto supporta un elenco di allergeni, visualizzabili tramite popup/sheet sulla homepage pubblica.
- Gli allergeni non sono custom: si usano i 14 previsti dal Regolamento UE 1169/2011, recepito in Italia. Ogni schema tenant include la propria tabella `allergens`, popolata al momento dell'onboarding. Sul record del piatto vengono salvati come `allergen_ids uuid[]` (FK → allergens nello schema tenant). Approccio ridondante per scelta esplicita: evita dipendenze cross-schema e semplifica l'onboarding.

---

## Tech stack

| Cosa | Scelta | Motivo |
|---|---|---|
| Framework | Next.js (App Router) | SSR homepage pubblica, routing `/booking/cancel/[token]`, monorepo |
| Package manager | pnpm workspaces | veloce, nativo con monorepo |
| UI admin | shadcn/ui | headless, mobile/desktop, zero lock-in, condiviso tra tutti i tenant |
| UI pubblica | componenti custom sopra shadcn primitives | stile personalizzabile per cliente |
| Validazione form | Zod | integrazione nativa con shadcn, elimina una categoria intera di bug |
| Backend / DB | Supabase | già deciso |
| Auth | Supabase Auth | già deciso |
| Storage | Supabase Storage | già deciso |
| Email transazionale | Resend | piano gratuito sufficiente, una edge function |
| Deploy | Vercel | supporto monorepo nativo |
| Linguaggio | TypeScript | obbligatorio con questa architettura |

### Struttura monorepo — Modello A (scelta attuale)

Ogni cliente è un **repo indipendente**, forkato dal template. Il monorepo esiste solo *dentro* ogni repo cliente.

```
repo-bar-rossi/                  ← repo indipendente per cliente
    /apps
        /web        ← Next.js, SSR homepage pubblica, /booking/cancel/[token]
        /admin      ← Next.js SPA, shadcn, backoffice
    /packages
        /supabase   ← client condiviso, types generati da Supabase CLI
        /ui         ← componenti shadcn condivisi tra web e admin
    .env            ← NEXT_PUBLIC_SUPABASE_SCHEMA=bar_rossi
```

**Nota:** le variabili d'ambiente `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SUPABASE_SCHEMA` vanno nel `.env` di ogni app in `/apps/web` e `/apps/admin`. Il client Supabase in `/packages/supabase` le legge dall'ambiente in cui viene eseguito.

**Cosa critica da mantenere fin da subito:** il service layer e i tipi vanno tenuti in `/packages`, ben separati dalla UI. Se il confine è netto, una futura migrazione al Modello B è una questione di spostare cartelle, non di riscrivere logica.

**Modello B — da valutare in futuro:** un unico repo con tutti i clienti dentro (`/clients/bar-rossi`, `/clients/bar-verdi`), con `/packages` condivisi globalmente. Il vantaggio è che un fix al service layer si propaga a tutti i clienti in un unico commit. Il trigger per considerare la migrazione: quando ci si ritrova a fare lo stesso fix su più di due repo nella stessa settimana.

### Perché Next.js e non Vite

La homepage pubblica ha bisogno di SSR per SEO: hero, slogan, biografia e meta tag devono essere renderizzati server-side. Con Vite si perderebbe questo vantaggio e si dovrebbe aggiungere un layer separato, aumentando la complessità senza benefici. Il backoffice in Next.js funziona perfettamente come SPA senza SSR attivo.

---

## Strategia di caricamento — homepage pubblica

### Decisione: skeleton loading, non optimistic UI

L'optimistic UI ha senso per le azioni dell'utente (clicco "prenota" e vedo subito il risultato come se fosse andato a buon fine). Per il caricamento iniziale della pagina non c'entra — il problema qui è diverso: l'utente vede contenuti parziali o interazioni rotte mentre i dati arrivano dal server.

La soluzione è un **approccio ibrido in due livelli**:

**Livello 1 — SSR per i contenuti critici (Next.js)**
Hero, slogan, biografia, meta tag e orari vengono fetchati server-side in `page.tsx` con `async/await`. L'utente riceve HTML già completo dal server: nessun flash di contenuto mancante, nessun layout shift, ottimo per SEO. Questo risolve il problema alla radice per tutto il contenuto above the fold.

```ts
// app/page.tsx
export default async function HomePage() {
  const siteData = await getSiteSettings() // fetch server-side
  const news = await getActiveNews()
  return <HomePageClient data={siteData} news={news} />
}
```

**Livello 2 — Skeleton screens per contenuti secondari (client-side)**
Galleria foto, popup e sezione news in fondo alla pagina possono caricarsi client-side con skeleton screens (placeholder animati della stessa dimensione del contenuto finale). Nessuna loading screen globale che blocca tutto — solo le sezioni interessate mostrano il loro skeleton mentre caricano.

**Perché non una loading screen globale**
Una loading screen che blocca l'intera pagina è penalizzante per due motivi: peggiora il Largest Contentful Paint (metrica SEO core) e su connessioni lente può tenere l'utente davanti a uno schermo vuoto per secondi. Con SSR il problema non esiste per i contenuti principali.

**Caso limite: connessione lenta o Supabase irraggiungibile**
Gestito con `error.tsx` e `loading.tsx` di Next.js App Router: se il fetch server-side fallisce, l'utente vede una pagina di errore controllata, non una pagina rotta.

### Componenti necessari
- `<SkeletonHero />`, `<SkeletonGallery />`, `<SkeletonNews />` — placeholder animati
- `error.tsx` — pagina di errore globale
- `loading.tsx` — fallback Next.js durante la navigazione

---

## Note e decisioni pendenti

- **Menu**: struttura e livello di dettaglio da definire (impatta schema dati).
- **Reminder prenotazioni**: fuori scope, documentare nel Playbook come funzione futura opzionale.
- **Form candidature**: componente opzionale nascosto di default, attivabile su richiesta.
- **Privacy policy**: pagina statica `/privacy` da personalizzare per ogni cliente, checklist pre-deploy nel Playbook.

---

## Prossimi passi

1. Definire la **struttura del menu**
2. Disegnare lo **schema dati** completo (tabelle, relazioni, RLS)
3. Definire la **struttura cartelle** del monorepo
4. Sviluppare i **primi componenti headless**

## Domande aperte

*Nessuna al momento.*

## Decisioni chiuse

**Rate limiting sulle prenotazioni:** risolto con un unique constraint a livello di schema.

```sql
UNIQUE (email, time_slot_id)
```

Una sola prenotazione per email per turno. Postgres rifiuta i duplicati a livello di DB, senza logica applicativa né edge function dedicata. Copre il 95% dei casi reali — un attacco coordinato con email diverse è un problema che un bar locale non avrà mai.

**Migrazioni schema post-freeze:** risolto con script numerati in `/migrations`, flusso manuale documentato. Tool automatici fuori scope per la scala attuale.

**RLS multi-schema — propagazione:** ogni modifica a una policy viene trattata come una migrazione e tracciata in uno script numerato. Checklist di onboarding inclusa nel Playbook.

**Edge Functions — validazione schema:** doppio controllo whitelist (`public.tenants`) + verifica owner tramite `auth.uid()`. La `service_role` key usata solo server-side nelle functions.

**Storage — separazione per tenant:** bucket condiviso `bar-assets` con path convention `/{schema}/...` e Storage RLS policies basate su `user_metadata.schema`. Funzione helper `storageAssetPath()` in `/packages/supabase`.

**Variabili d'ambiente — sicurezza:** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` sono intenzionalmente pubbliche per design di Supabase. La sicurezza è delegata alle RLS. La `service_role` key non va mai esposta al client.
