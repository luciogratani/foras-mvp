# Menu Data Structure — Decisioni architetturali

Sistema multi-tenant per siti web di bar locali (Next.js + Supabase).
Scope: menu consultivo, nessun sistema di ordini.

---

## Stack e vincoli

- **DB**: PostgreSQL su Supabase, schema separato per tenant
- **Gestione**: CRUD via admin panel (backoffice)
- **Visualizzazione**: homepage pubblica, sola lettura
- **Nessun ordine online**

---

## Gerarchia del menu

```
Section → Category → Item
```

Tre livelli, nessuna eccezione. Un item appartiene a **una sola categoria**.

---

## Entità

### `menu_sections`

Tabella leggera nel schema tenant. Le section non sono derivate dagli item — sono un'entità propria per poter essere ordinate, rinominate e abilitate/disabilitate indipendentemente dal contenuto.

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

14 voci fisse, corrispondenti al Reg. UE 1169/2011. Popolate al momento dell'onboarding, non modificabili dal gestore. Nel backoffice: checkbox list sull'item. Ridondanti tra tenant per scelta esplicita: evita dipendenze cross-schema.

Allergeni a livello di item soltanto — non di categoria o variante.

---

## Ordinamento

Stessa convenzione su tutti e tre i livelli (section, category, item):

- `position` è un intero nullable
- Gli elementi con `position` impostato vengono prima, ordinati per valore crescente
- Gli elementi con `position = NULL` vanno in coda, ordinati **alfabeticamente A-Z** per `name`
- Nel backoffice: drag-and-drop → bulk update degli interi su tutti gli elementi della lista (le liste sono piccole, il costo è trascurabile)

---

## Note aperte

**Formula / bundle** — nei listini reali è comune una voce composita con prezzo fisso che raggruppa più prodotti (es. "Colazione: caffè + brioche €1,90", "Menu pranzo: piatto + bevanda €8,00"). Non è un item singolo né una categoria: è un concetto che il modello attuale non rappresenta nativamente. Da tenere a mente.

---

## Decisioni escluse dallo scope

| Tema | Decisione |
|---|---|
| Varianti (taglia, cottura, ecc.) | **Non supportate.** Item separati se necessario. |
| Item in più categorie | **Non supportato.** Relazione 1:N category→item. |
| Allergeni custom per tenant | **Non supportati.** Solo i 14 obbligatori per legge. |
| Gestione date disponibilità | **Non supportata.** `is_active` copre tutti i casi. |
| Sistema di ordini | **Out of scope.** |
