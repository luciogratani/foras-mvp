# Prompt — Genera wireframe e user flow in Mermaid

Usa questo prompt con Claude per generare i diagrammi Mermaid del progetto foras-mvp.
Incollalo in una nuova conversazione con accesso ai file del progetto.

---

## Prompt

Sei un designer UX con esperienza in architettura di prodotto. Il progetto è un **SaaS multi-tenant per bar e ristoranti locali**, composto da:

- **`apps/web`** — homepage pubblica SSR (Next.js App Router), accessibile su `dominio.it`
- **`apps/admin`** — backoffice SPA, accessibile su `admin.dominio.it`
- **Backend** — Supabase con schema separation (uno schema PostgreSQL per cliente), Auth, Storage, Edge Functions, email via Resend

### Flussi da mappare

**1. Homepage pubblica — visitor flow**
L'utente arriva sul sito, vede hero/galleria/slogan/bio/orari, interagisce con il popup novità, clicca CTA per prenotare o vedere il menu.

**2. Prenotazioni — end-to-end**
L'utente compila il form (nome, email, telefono opzionale, coperti, note, GDPR), il sistema verifica la disponibilità coperti per turno, accetta o rifiuta in automatico, invia email di conferma con link di cancellazione (`/booking/cancel/[token]`), il gestore riceve email di notifica. L'utente può cancellare via link senza autenticazione.

**3. Backoffice admin — flusso autenticazione**
L'admin si logga, il middleware verifica `user_metadata.schema` contro `public.tenants` (owner_id + schema_name), se la verifica fallisce la sessione viene invalidata, altrimenti il client Supabase viene inizializzato con lo schema corretto del tenant.

**4. Backoffice admin — gestione contenuti**
L'admin naviga tra: Prenotazioni (lista per data/turno), Contenuti sito (hero, slogan, bio, sezioni on/off), Menu (CRUD categorie/sezioni/item), Popup/novità (CRUD slide, ordinamento), Orari di apertura.

**5. Onboarding nuovo tenant**
Fork del repo template → creazione schema PostgreSQL → configurazione `.env` con schema del cliente → seed dati iniziali → deploy su Vercel → creazione utente admin in Supabase Auth con `user_metadata.schema` valorizzato.

---

### Istruzioni per la generazione

Per ciascuno dei 5 flussi sopra, genera:

1. **User flow diagram** in Mermaid (`flowchart TD`) che mostri tutti i nodi decisionali, le azioni utente, le risposte del sistema e gli stati di errore.
2. **Wireframe schematico** in Mermaid (`graph LR` o blocchi annidati) che mostri la struttura delle schermate principali coinvolte nel flusso (header, sezioni, form fields, CTA, stati vuoti).

### Vincoli

- Usa `flowchart TD` per i flow, `graph LR` per i wireframe delle schermate
- Includi sempre i nodi di errore e i fallback (es. prenotazione rifiutata, schema non autorizzato)
- Per il backoffice usa nomi reali delle route: `/admin/bookings`, `/admin/content`, `/admin/menu`, `/admin/news`, `/admin/hours`
- Per la homepage usa le sezioni reali: Hero, Galleria, Popup, Slogan, Bio, CTA, Orari, Footer, News
- Salva ogni diagramma in un file `.mermaid` separato nella cartella `docs/design/wireframes/`
- Nomina i file: `01-homepage-flow.mermaid`, `02-booking-flow.mermaid`, `03-auth-flow.mermaid`, `04-admin-flow.mermaid`, `05-onboarding-flow.mermaid`

### Output atteso per ogni file

```
docs/design/wireframes/
├── 01-homepage-flow.mermaid
├── 02-booking-flow.mermaid
├── 03-auth-flow.mermaid
├── 04-admin-flow.mermaid
└── 05-onboarding-flow.mermaid
```

Inizia dal flusso prenotazioni (02) perché è il più critico per il prodotto, poi procedi in ordine.
