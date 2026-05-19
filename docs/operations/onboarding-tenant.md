# Onboarding nuovo tenant

Procedura per onboardare un nuovo cliente bar sul sistema. Da eseguire dopo il congelamento del template (vedi criteri di freeze in [[mvp]]).

> **Nota:** questo documento è uno scheletro operativo. Lo script `create_schema_from_template.sql` e i dettagli della procedura DNS vanno completati durante lo sviluppo del template.

---

## Pre-requisiti

- Template congelato (tutti e tre i criteri di freeze soddisfatti)
- `schema.sql` aggiornato e testato
- Script `create_schema_from_template.sql` pronto
- Dominio custom del cliente disponibile

---

## Step 1 — Creare lo schema PostgreSQL

Eseguire lo script `docs/operations/create_schema_from_template.sql` (bozza già disponibile, da finalizzare post-freeze) sostituendo i placeholder `nome_schema` e `owner_uuid`:

```bash
# Da psql con accesso service_role
psql $DATABASE_URL \
  -v schema=bar_rossi \
  -v owner_uuid=<uuid-dell-admin> \
  -f docs/operations/create_schema_from_template.sql
```

Lo script crea: tutte le tabelle, RLS abilitata su ognuna, policies complete, seed degli allergeni (14 obbligatori per legge) e delle sezioni menu predefinite, riga iniziale in `site_settings`, e registrazione in `public.tenants`.

> **Nota:** la bozza è basata sul data model attuale. Va rivista e testata end-to-end prima del primo onboarding reale, contestualmente alla scrittura di `schema.sql` nel repo-template.

---

## Step 2 — Registrare il tenant in `public.tenants`

```sql
INSERT INTO public.tenants (schema_name, owner_id)
VALUES ('nome_schema', '<uuid-dell-admin>');
```

Questo passaggio deve essere automatizzato nello script di onboarding. È necessario per la validazione nelle Edge Functions.

---

## Step 3 — Creare l'utente admin

Creare l'utente in Supabase Auth con `user_metadata.schema` valorizzato al nome dello schema:

```json
{
  "email": "admin@nomelocale.it",
  "password": "<generata>",
  "user_metadata": {
    "schema": "nome_schema"
  }
}
```

---

## Step 4 — Configurare le variabili d'ambiente

Nel repo forkato del cliente, configurare `.env` in `/apps/web` e `/apps/admin`:

```env
NEXT_PUBLIC_SUPABASE_URL=<uguale per tutti i clienti>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<uguale per tutti i clienti>
NEXT_PUBLIC_SUPABASE_SCHEMA=nome_schema
```

Le prime due variabili sono le stesse per tutti i clienti. Solo `NEXT_PUBLIC_SUPABASE_SCHEMA` cambia.

---

## Step 5 — Configurare `next.config.ts`

Verificare che il dominio Supabase Storage sia dichiarato in `remotePatterns`:

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

## Step 6 — Verificare Storage

- Verificare che il bucket `bar-assets` esista e che le Storage RLS policies siano attive
- Testare upload di un'immagine nel path `nome_schema/test.jpg` dall'account admin del tenant
- Testare che un admin di un altro tenant non possa scrivere nel path `nome_schema/`

---

## Checklist RLS — da eseguire ad ogni onboarding

```
□ Eseguire create_schema_from_template.sql con il nome schema corretto
□ Verificare che tutte le tabelle abbiano RLS abilitata (rls_enabled = true)
□ Verificare che ogni policy usi auth.uid() e non valori hardcoded
□ Testare l'accesso con un utente autenticato sullo schema corretto
□ Testare che un utente di un altro schema non possa leggere i dati
□ Verificare le Storage policies (bucket condiviso, path-based)
```

**Test di isolamento da eseguire ad ogni onboarding:**

```sql
-- Connettersi come admin del bar_rossi, verificare che non si vedano dati di bar_verdi
SET search_path = bar_rossi;
SELECT * FROM bookings; -- deve restituire solo i record di bar_rossi
```

---

## Step 7 — Deploy su Vercel

- Creare un nuovo progetto Vercel dal repo del cliente
- Configurare le variabili d'ambiente su Vercel (stesse del `.env`)
- Collegare il dominio custom del cliente

---

## Checklist pre-deploy (GDPR e SEO)

```
□ Pagina /privacy creata e personalizzata per il cliente
□ Checkbox GDPR attivo nel form prenotazioni
□ meta title e meta description configurati nel backoffice
□ og:image configurata nel backoffice
□ Dominio custom collegato e HTTPS attivo
```

---

## ⚠️ Sezioni ancora da completare

- **Script `create_schema_from_template.sql`**: bozza disponibile in `docs/operations/create_schema_from_template.sql` — da finalizzare e testare end-to-end post-freeze
- **Procedura DNS dettagliata**: dipende dal registrar del cliente
- **Verifica finale end-to-end**: checklist da costruire testando il primo onboarding reale
