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

Eseguire lo script `docs/operations/create_schema_from_template.sql` via `psql`, passando obbligatoriamente le variabili `-v schema=` e `-v owner_uuid=`:

```bash
psql $DATABASE_URL \
  -v schema=bar_rossi \
  -v owner_uuid=<uuid-dell-admin> \
  -f docs/operations/create_schema_from_template.sql
```

Lo script crea: tutte le tabelle, RLS abilitata su ognuna, policies complete, GRANT per i ruoli Supabase (`anon`, `authenticated`, `service_role`), seed degli allergeni (14 obbligatori per legge), sezioni menu predefinite, 2 time_slots placeholder, riga iniziale in `site_settings`, e registrazione in `public.tenants`.

> **Importante:** lo script usa variabili `psql -v` e **non funziona nel Supabase SQL editor**. Deve essere eseguito da terminale con `psql`. Le variabili `schema` e `owner_uuid` sono obbligatorie — lo script fallisce in testa se mancano.
>
> Lo script è progettato per uno **schema nuovo**: ri-eseguirlo su uno schema già esistente duplica i dati di seed senza errore.

Dopo l'esecuzione, verificare con l'audit RLS:

```bash
psql $DATABASE_URL -f docs/operations/audit_rls.sql
```

Zero righe nell'output = schema allineato al template (policy, RLS, GRANT tutti corretti).

> **Nota:** la registrazione in `public.tenants` (Step 2 qui sotto) è già inclusa nello script — non è necessario eseguirla manualmente.

---

## Step 2 — Registrare il tenant in `public.tenants`

Già incluso nello script `create_schema_from_template.sql` (§6). Non è necessario eseguirlo manualmente.

Per riferimento, il comando SQL corrispondente è:

```sql
INSERT INTO public.tenants (schema_name, owner_id)
VALUES ('nome_schema', '<uuid-dell-admin>');
```

La riga in `public.tenants` è necessaria per la validazione nelle Edge Functions e per la funzione `public.is_tenant_owner()` usata dalle RLS policy di scrittura.

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

- **Script `create_schema_from_template.sql`**: parametrizzato e testato su `onboard_test` (Sprint 6 / A2). Da verificare end-to-end al primo onboarding reale su un tenant di produzione.
- **Procedura DNS dettagliata**: dipende dal registrar del cliente
- **Verifica finale end-to-end**: checklist da costruire testando il primo onboarding reale
