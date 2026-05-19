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
- **Edge Functions**: sono schema-agnostic. Lo schema viene passato come parametro nel body della chiamata. Dentro la function si usa `supabase.schema(nome_schema)`.
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
- `schema.sql` è la fonte di verità. Ogni modifica allo schema viene fatta prima lì, poi propagata manualmente ai clienti esistenti.
- Le modifiche post-freeze vengono tracciate in un `CHANGELOG.md` nel repo template — anche solo due righe per ogni modifica. È la memoria condivisa quando si allineano clienti esistenti a nuove versioni dello schema.

### 3. Skeleton / wireframe funzionante — `/template`

- La cartella `/template` è la base condivisa per tutti i clienti.
- Contiene componenti **quasi headless**: logica cablata, UI minima, zero styling custom.
- Per ogni nuovo cliente si **copia la cartella `/template`** e si sviluppa la UI custom sopra, senza toccare logica e service layer.
- Non è un package npm né un submodule git: è una cartella da copiare e personalizzare.

### 4. Variabili d'ambiente per tenant

Ogni progetto cliente ha un proprio `.env`:

```env
VITE_SUPABASE_URL=uguale per tutti
VITE_SUPABASE_ANON_KEY=uguale per tutti
VITE_SUPABASE_SCHEMA=nome_bar
```

Un singolo `supabaseClient.ts` condiviso le legge e inizializza il client con lo schema corretto.

### 5. Admin panel

- Ogni cliente ha un proprio admin panel con le stesse funzionalità (CRUD sui dati dello schema).
- I componenti admin sono identici per tutti i tenant — cambiano solo i dati serviti.
- L'accesso è protetto da Supabase Auth + RLS sullo schema.

### 6. Deploy

- Deploy separato per ogni cliente su **dominio custom** (es. `nome-locale.it`).
- Nessun sistema di routing multi-tenant su dominio condiviso (per ora fuori scope).

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
    .env.example
    schema.sql                   ← schema PostgreSQL + RLS + seed

repo-bar-rossi/                  ← fork di repo-template
    /apps
        /web                     ← UI custom sopra i componenti template
        /admin                   ← identico al template, dati diversi
    /packages                    ← invariati rispetto al template
    .env                         ← NEXT_PUBLIC_SUPABASE_SCHEMA=bar_rossi
```

---

## Documento da produrre a fine sviluppo — Tenant Onboarding Playbook

Da scrivere **durante** lo sviluppo del template, non alla fine. Conterrà:

- Schema PostgreSQL completo commentato (tabelle, campi, relazioni)
- RLS policies spiegate in linguaggio umano + SQL
- Script `create_schema_from_template.sql` da eseguire per ogni nuovo cliente
- Variabili d'ambiente necessarie e dove configurarle
- Procedura di deploy e configurazione dominio custom
- Checklist di onboarding per un nuovo bar

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

1. Immagini e Storage — hero, galleria e og:image vengono da Supabase Storage. Next.js ha un componente `<Image>` che ottimizza automaticamente le immagini (WebP, lazy loading, dimensioni responsive), ma richiede di dichiarare i domini autorizzati in `next.config.ts`. Se non lo pianifichi ora, le immagini da Storage arrivano non ottimizzate. È un campo in più nella config, ma vale la pena metterlo nella checklist.

## Decisioni chiuse

**Rate limiting sulle prenotazioni:** risolto con un unique constraint a livello di schema.

```sql
UNIQUE (email, time_slot_id)
```

Una sola prenotazione per email per turno. Postgres rifiuta i duplicati a livello di DB, senza logica applicativa né edge function dedicata. Copre il 95% dei casi reali — un attacco coordinato con email diverse è un problema che un bar locale non avrà mai.
