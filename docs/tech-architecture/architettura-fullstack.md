# Architettura fullstack

Sistema multi-tenant per sviluppare e gestire siti web per bar e ristoranti locali, basato su un'unica istanza Supabase condivisa. L'obiettivo è creare uno scheletro funzionante e riutilizzabile (`/template`) che possa essere forkato e personalizzato graficamente per ogni nuovo cliente, mantenendo logica, contratti dati e service layer invariati.

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

---

## Multi-tenancy — schema separation

- Si usa un **singolo progetto Supabase** con più **schema PostgreSQL**, uno per ogni cliente.
- Le Supabase client libraries supportano lo schema custom via configurazione:
  ```js
  createClient(URL, ANON_KEY, { db: { schema: 'nome_schema' } })
  ```
- **Auth**: ogni admin viene creato con `user_metadata.schema` valorizzato al nome del proprio schema. Al login, il client viene inizializzato con lo schema corretto letto dai metadata — dopo validazione, vedi sezione dedicata.
- **RLS**: configurata su ogni schema con `auth.uid()`, identica a come funziona su `public`.
- **Edge Functions**: sono schema-agnostic. Lo schema viene passato come parametro nel body della chiamata. Dentro la function si usa `supabase.schema(nome_schema)`. Lo schema viene validato prima dell'uso — vedi sezione dedicata.
- **Limitazione nota**: Auth e Storage rimangono su `public`. La separazione per schema vale per CRUD via PostgREST.

---

## Auth — validazione schema al login

`user_metadata.schema` è l'unica fonte che lega un utente al suo schema tenant. Se quel campo fosse assente, errato o manomesso, l'utente potrebbe inizializzare il client con lo schema sbagliato. Per questo la validazione non avviene solo nelle Edge Functions ma anche al momento del login, nel middleware dell'app admin.

**Il flusso corretto al login:**

1. Supabase Auth autentica l'utente e restituisce la sessione
2. Il middleware legge `user_metadata.schema`
3. Prima di inizializzare il client Supabase con quello schema, verifica che l'utente sia effettivamente registrato come owner in `public.tenants`
4. Se la verifica fallisce, la sessione viene invalidata immediatamente

```typescript
// apps/admin/lib/auth.ts

export async function getVerifiedTenantClient(session: Session) {
  const schema = session.user.user_metadata?.schema as string | undefined

  if (!schema) {
    await supabase.auth.signOut()
    throw new Error('Utente non associato a nessuno schema tenant')
  }

  // Verifica che lo schema appartenga a questo utente in public.tenants
  const { data: tenant, error } = await supabaseAdmin
    .from('tenants')
    .select('schema_name')
    .eq('schema_name', schema)
    .eq('owner_id', session.user.id)
    .single()

  if (error || !tenant) {
    await supabase.auth.signOut()
    throw new Error('Schema non autorizzato per questo utente')
  }

  // Solo a questo punto il client viene inizializzato con lo schema verificato
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema } }
  )
}
```

**Dove chiamarla:** nel middleware Next.js (`middleware.ts`) per le route protette del backoffice, oppure nel layout root di `/apps/admin`. L'importante è che venga eseguita prima di qualsiasi query al DB tenant.

**Nota su `supabaseAdmin`:** questa funzione usa la `service_role` key per leggere `public.tenants` in modo affidabile, indipendentemente da eventuali RLS sulla tabella. Va chiamata solo server-side (Server Component o Route Handler), mai nel browser.

---

## Schema `template` come ambiente di sviluppo attivo

Lo schema `template` viene usato anche **online e in produzione** durante la fase di sviluppo. Questo permette di lavorare con dati reali, far emergere edge case e definire tabelle e RLS su casi concreti. A fine sviluppo si produce un documento di onboarding, si puliscono i dati e lo schema `template` rimane solo come riferimento per i fork futuri.

**Criterio di congelamento — quando il template è pronto per essere forkato:**

> Il template si congela quando tutte e tre le seguenti condizioni sono soddisfatte:
> 1. Tutti i componenti homepage sono sviluppati in versione headless, con una wireframe view funzionante nello schema `template`
> 2. DB, RLS ed edge functions sono completi e testati end-to-end
> 3. Il pannello admin è completo con tutte le funzionalità CRUD previste
>
> Solo a quel punto è possibile onboardare il primo cliente reale.

Dopo il congelamento, `schema.sql` è la fonte di verità per la struttura iniziale. Le modifiche post-freeze vengono gestite tramite script di migrazione numerati — vedi [[migration-runbook]].

---

## Variabili d'ambiente per tenant

Ogni progetto cliente ha un proprio `.env` nelle app che usano Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=uguale per tutti
NEXT_PUBLIC_SUPABASE_ANON_KEY=uguale per tutti
NEXT_PUBLIC_SUPABASE_SCHEMA=nome_bar
```

Un singolo `supabaseClient.ts` condiviso le legge e inizializza il client con lo schema corretto.

**Cosa è sicuro esporre con `NEXT_PUBLIC_`:** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` sono intenzionalmente pubbliche — Supabase è progettato per esporre queste credenziali al browser. La `anon key` non è una chiave segreta: è una chiave JWT che identifica il progetto e consente solo le operazioni permesse dalle RLS. La sicurezza dei dati è interamente delegata alle RLS policies, non all'oscuramento della chiave.

**`SUPABASE_SERVICE_ROLE_KEY` — uso server-side, mai client:** la service_role key bypassa qualsiasi RLS, quindi non deve mai finire nel bundle client. È usabile in due contesti server-side equivalenti dal punto di vista del modello di trust:

1. **Edge Functions Supabase** — pattern preferito quando l'operazione può viverci (la chiave non lascia mai i server Supabase). Vedi sezione "Edge Functions — validazione schema".
2. **Server-side Next.js (Server Component / Route Handler / Middleware)** — usato nell'admin app per `supabaseAdmin` (vedi sezione "Auth — validazione schema al login"). La chiave vive su Vercel come variabile NON-`NEXT_PUBLIC_` (cifrata, accessibile solo al runtime server). Il modulo che la consuma deve avere `import 'server-only'` per impedirne l'import accidentale lato client.

Per il backoffice MVP si usa il pattern (2) perché la verifica owner avviene nel flusso Next.js direttamente. Migrazione a (1) tracciata in [[post-mvp|post-MVP]] (riduce attack surface: la chiave non passa più da Vercel).

---

## Edge Functions — validazione schema

Le Edge Functions ricevono il nome dello schema nel body della chiamata. Senza validazione, un client potrebbe richiedere uno schema arbitrario e accedere a dati di altri tenant. La validazione avviene in due livelli:

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

**Funzione helper (in `/packages/supabase`):**

```typescript
export function storageAssetPath(schema: string, filename: string): string {
  return `${schema}/${filename}`
}

// Uso:
const path = storageAssetPath('bar-rossi', 'gallery/foto1.jpg')
const { data } = supabase.storage.from('bar-assets').getPublicUrl(path)
```

**`next.config.ts` — dominio Storage:** il dominio del bucket Supabase Storage va dichiarato in `remotePatterns` per permettere a `<Image>` di ottimizzare le immagini:

```ts
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

## Admin panel

Ogni cliente ha un proprio admin panel con le stesse funzionalità (CRUD sui dati dello schema). I componenti admin sono identici per tutti i tenant — cambiano solo i dati serviti. L'accesso è protetto da Supabase Auth + RLS sullo schema.

---

## Deploy

Deploy separato per ogni cliente su **dominio custom** (es. `nome-locale.it`). Nessun sistema di routing multi-tenant su dominio condiviso (per ora fuori scope).

---

## Strategia di caricamento — homepage pubblica

### Decisione: SSR per i contenuti critici + skeleton per i contenuti secondari

L'approccio è ibrido in due livelli:

**Livello 1 — SSR per i contenuti critici (Next.js):** hero, slogan, biografia, meta tag e orari vengono fetchati server-side in `page.tsx` con `async/await`. L'utente riceve HTML già completo dal server: nessun flash di contenuto mancante, nessun layout shift, ottimo per SEO.

```ts
// app/page.tsx
export default async function HomePage() {
  const siteData = await getSiteSettings() // fetch server-side
  const news = await getActiveNews()
  return <HomePageClient data={siteData} news={news} />
}
```

**Livello 2 — Skeleton screens per contenuti secondari (client-side):** galleria foto, popup e sezione news in fondo alla pagina possono caricarsi client-side con skeleton screens (placeholder animati della stessa dimensione del contenuto finale).

**Perché non una loading screen globale:** peggiora il Largest Contentful Paint (metrica SEO core) e su connessioni lente può tenere l'utente davanti a uno schermo vuoto per secondi. Con SSR il problema non esiste per i contenuti principali.

**Componenti necessari:**
- `<SkeletonHero />`, `<SkeletonGallery />`, `<SkeletonNews />` — placeholder animati
- `error.tsx` — pagina di errore globale (gestisce il caso Supabase irraggiungibile)
- `loading.tsx` — fallback Next.js durante la navigazione
