# Data model

Schema PostgreSQL per il sistema multi-tenant. Ogni cliente ha un proprio schema PostgreSQL isolato. Le tabelle descritte qui esistono **in ogni schema tenant**, salvo dove indicato diversamente.

---

## Tabella `public.tenants` *(schema public — unica tabella applicativa condivisa)*

Registry centrale degli schemi attivi. Usata dalle Edge Functions per la validazione e la verifica owner.

```sql
CREATE TABLE public.tenants (
  schema_name TEXT PRIMARY KEY,
  owner_id    UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

Va popolata automaticamente al momento della creazione di ogni nuovo schema tenant.

---

## Schema menu

La gerarchia è: `Section → Category → Item`. Tre livelli, nessuna eccezione. Un item appartiene a una sola categoria.

### `menu_sections`

Le section non sono derivate dagli item — sono un'entità propria per poter essere ordinate, rinominate e abilitate/disabilitate indipendentemente dal contenuto.

| Campo | Tipo | Note |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | es. "Pranzo", "Aperitivo" |
| `position` | integer nullable | NULL → in coda, ordine alfabetico A-Z tra i NULL |
| `is_active` | boolean | default true |

Le section di default sono predefinite (Colazione, Pranzo, Aperitivo, Cena, Cocktail, Carta dei vini) ma il tenant può rinominarle e abilitare/disabilitare. Non può crearne di nuove from scratch.

### `menu_categories`

| Campo | Tipo | Note |
|---|---|---|
| `id` | uuid | PK |
| `section_id` | uuid | FK → menu_sections |
| `name` | text | es. "Antipasti", "Panini" |
| `position` | integer nullable | NULL → in coda, ordine alfabetico A-Z tra i NULL |
| `is_active` | boolean | default true |

### `menu_items`

| Campo | Tipo | Note |
|---|---|---|
| `id` | uuid | PK |
| `category_id` | uuid | FK → menu_categories |
| `name` | text | |
| `description` | text nullable | la maggior parte dei bar non la compilerà |
| `price` | numeric(8,2) | prezzo base |
| `position` | integer nullable | NULL → in coda, ordine alfabetico A-Z tra i NULL |
| `is_active` | boolean | unico flag di visibilità — copre sia "fuori stagione" che "esaurito" |
| `image_url` | text nullable | |
| `allergen_ids` | uuid[] | array di FK → allergens (schema tenant) |

Nessuna variante. Se un prodotto ha un prezzo diverso (es. cappuccino normale / con latte vegetale), viene creato come item separato.

### `allergens` *(schema tenant, non condiviso)*

14 voci fisse, corrispondenti al Regolamento UE 1169/2011. Popolate al momento dell'onboarding, non modificabili dal gestore. Nel backoffice: checkbox list sull'item.

Allergeni a livello di item soltanto — non di categoria o variante. Ridondanti tra tenant per scelta esplicita: evita dipendenze cross-schema e semplifica l'onboarding.

---

## Ordinamento — convenzione condivisa

Stessa convenzione su tutti e tre i livelli menu (section, category, item):

- `position` è un intero nullable
- Gli elementi con `position` impostato vengono prima, ordinati per valore crescente
- Gli elementi con `position = NULL` vanno in coda, ordinati **alfabeticamente A-Z** per `name`
- Nel backoffice: drag-and-drop → bulk update degli interi su tutti gli elementi della lista (le liste sono piccole, il costo è trascurabile)

---

## Schema prenotazioni

### `time_slots`

Turni disponibili configurati dal gestore nel backoffice.

| Campo | Tipo | Note |
|---|---|---|
| `id` | uuid | PK |
| `label` | text | es. "Pranzo", "Cena" |
| `time` | time | orario del turno |
| `max_covers` | integer | capacità massima coperti per turno |
| `is_active` | boolean | default true |
| `archived_at` | timestamptz nullable | NULL = attivo; non-null = archiviato (nascosto da admin e sito). Archiviare imposta anche `is_active = false`. La riga resta per preservare la FK `bookings → time_slots`. |

### `bookings`

| Campo | Tipo | Note |
|---|---|---|
| `id` | uuid | PK |
| `time_slot_id` | uuid | FK → time_slots |
| `date` | date | data della prenotazione |
| `name` | text | nome del cliente |
| `email` | text | |
| `phone` | text nullable | |
| `covers` | integer | coperti richiesti |
| `preferred_time` | text nullable | orario preferito indicato dal cliente (libero, indicativo per il gestore; non validato contro turno né finestra oraria) |
| `notes` | text nullable | richieste speciali |
| `cancellation_token` | uuid | token per cancellazione senza autenticazione |
| `status` | text | `confirmed` / `cancelled` |
| `gdpr_consent` | boolean | consenso trattamento dati |
| `created_at` | timestamptz | default now() |

**Constraint rate limiting:**
```sql
UNIQUE (email, time_slot_id, date)
```
Una sola prenotazione per email per turno per data. Postgres rifiuta i duplicati a livello di DB, senza logica applicativa né edge function dedicata.

**Flusso cancellazione:** ogni prenotazione ha un `cancellation_token` (UUID). L'utente riceve una email con link `dominio.it/booking/cancel/UUID`. Nessuna autenticazione richiesta. Alla cancellazione i coperti tornano disponibili automaticamente.

---

## Tabella `site_settings`

Configurazione del sito e SEO, gestita dal backoffice.

| Campo | Tipo | Note |
|---|---|---|
| `id` | uuid | PK (riga unica per tenant) |
| `title` | text | meta title homepage |
| `description` | text | meta description homepage |
| `og_image` | text nullable | URL immagine Open Graph |
| `slogan` | text nullable | slogan testuale homepage |
| `bio` | text nullable | biografia/descrizione del locale |
| `address` | text nullable | indirizzo per footer e Google Maps |
| `phone` | text nullable | |
| `email` | text nullable | |
| `social_instagram` | text nullable | URL profilo Instagram |
| `social_facebook` | text nullable | URL profilo Facebook |
| `social_whatsapp` | text nullable | URL o numero WhatsApp |
| `maintenance_mode` | boolean | default false; se true `apps/web` redireziona tutte le route su `/maintenance` |
| `extra_data` | jsonb | dati arbitrari per personalizzazioni future (default `{}`) |
| `opening_hours` | jsonb | orari per giorno della settimana (struttura multi-fascia, vedi sotto) |

**Struttura attesa di `opening_hours`:**

```json
{
  "monday":    { "closed": false, "ranges": [{ "open": "08:00", "close": "14:30" }, { "open": "18:00", "close": "23:00" }] },
  "tuesday":   { "closed": false, "ranges": [{ "open": "08:00", "close": "22:00" }] },
  "wednesday": { "closed": false, "ranges": [{ "open": "08:00", "close": "22:00" }] },
  "thursday":  { "closed": false, "ranges": [{ "open": "08:00", "close": "22:00" }] },
  "friday":    { "closed": false, "ranges": [{ "open": "08:00", "close": "23:00" }] },
  "saturday":  { "closed": false, "ranges": [{ "open": "09:00", "close": "23:00" }] },
  "sunday":    { "closed": true,  "ranges": [] }
}
```

Chiavi fisse (7 giorni in inglese lowercase). Ogni giorno ha `closed` (boolean) e `ranges` (array, max 2 fasce `{ open, close }`). Quando `closed: true`, `ranges` è vuoto. Se `ranges` è vuoto e `closed: false`, nessuna restrizione oraria per quel giorno. I turni di prenotazione vengono filtrati per cadere all'interno di almeno una fascia.

---

## Tabella `closed_dates`

Chiusure straordinarie (festività, eventi privati, ferie) che sovrascrivono gli orari settimanali ricorrenti. Gestita dal backoffice nella sezione Orari.

| Campo | Tipo | Note |
|---|---|---|
| `id` | uuid | PK |
| `date` | date | data di inizio chiusura (ISO 8601) |
| `end_date` | date nullable | data di fine inclusa; NULL = chiusura di un solo giorno |
| `reason` | text nullable | descrizione facoltativa (es. "Ferragosto", "Evento privato") |

Se una data rientra in un intervallo `[date, end_date]` (o coincide con `date` se `end_date` è NULL), `getAvailableTimeSlots` restituisce `[]` per quella data.

---

## Note aperte — schema menu

**Formula / bundle:** nei listini reali è comune una voce composita con prezzo fisso che raggruppa più prodotti (es. "Colazione: caffè + brioche €1,90", "Menu pranzo: piatto + bevanda €8,00"). Non è un item singolo né una categoria: è un concetto che il modello attuale non rappresenta nativamente. Da tenere a mente in caso di richiesta esplicita da parte di un cliente.

---

## Decisioni escluse dallo scope

| Tema | Decisione |
|---|---|
| Varianti (taglia, cottura, ecc.) | **Non supportate.** Item separati se necessario. |
| Item in più categorie | **Non supportato.** Relazione 1:N category→item. |
| Allergeni custom per tenant | **Non supportati.** Solo i 14 obbligatori per legge (Reg. UE 1169/2011). |
| Gestione date disponibilità | **Non supportata.** `is_active` copre tutti i casi. |
| Sistema di ordini online | **Out of scope.** |
