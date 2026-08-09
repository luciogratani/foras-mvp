-- 005_tenant_subscriptions.sql
-- Stato dell'abbonamento Stripe di ogni tenant, in public.
-- Data: 2026-08-07 | Applicare a: tutti i clienti esistenti + template
--
-- Contesto: i clienti foras pagano un abbonamento mensile; se non pagano, il
-- GESTIONALE si blocca — il SITO PUBBLICO no, mai. Serve un posto in cui il
-- gestionale possa leggere «questo cliente ha pagato?» senza chiederlo a
-- Stripe a ogni richiesta.
--
-- Perche' in public e non nello schema del tenant (decisione 2026-08-05):
-- e' un dato di business di FORAS, non del cliente. Nello schema tenant il
-- gestore ne sarebbe owner via RLS — potrebbe leggerlo e potenzialmente
-- manometterlo, cioe' sbloccarsi da solo. Qui vale lo stesso pattern di
-- public.tenants: RLS abilitata e ZERO policy, deny-by-default via PostgREST.
-- L'unico accesso e' service_role, che ha BYPASSRLS.
--
-- ⚠️  Migrazione GLOBALE camuffata da per-schema, esattamente come la 004.
--     Il runner esegue questo file una volta per ogni tenant registrato in
--     public.tenants, ma gli oggetti creati sono UNO SOLO, condiviso. Per
--     questo ogni statement qui dentro e' idempotente: rieseguirlo non cambia
--     niente. Lasciamo il pattern N-volte per simmetria col runner — piu'
--     semplice che fare bookkeeping speciale per le migrazioni "globali".
--
-- Le fatture NON stanno qui: si leggono da Stripe quando serve. La pagina
-- Account e' rara, l'elenco cambia una volta al mese, e i link ai PDF hanno
-- una vita loro. Copiarle in tabella vorrebbe dire tenere in piedi un secondo
-- flusso di sincronizzazione per un dato che Stripe ha gia' ed e' sempre piu'
-- aggiornato del nostro.

CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
  schema_name TEXT PRIMARY KEY
    REFERENCES public.tenants(schema_name) ON DELETE CASCADE,

  -- L'aggancio a Stripe. Nullo finche' il cliente non e' stato creato la'.
  -- Un tenant senza customer non e' "non pagante": e' "non ancora
  -- configurato", e non deve bloccare niente.
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,

  -- Il prezzo e' PER TENANT: lo si decide cliente per cliente, es. 7900 per
  -- 79,00 €. Non e' una costante di prodotto e non va nel codice.
  prezzo_mensile_centesimi INTEGER NOT NULL DEFAULT 0
    CONSTRAINT tenant_subscriptions_prezzo_non_negativo CHECK (prezzo_mensile_centesimi >= 0),
  valuta TEXT NOT NULL DEFAULT 'eur',

  -- Fine del periodo pagato: `current_period_end` di Stripe.
  prossimo_pagamento TIMESTAMPTZ,

  -- Il PRIMO pagamento fallito ancora non recuperato, NULL se e' tutto in
  -- regola. E' l'unico campo da cui dipendono il ritardo e il blocco: i 3
  -- giorni di tolleranza si contano da qui.
  --
  -- «Primo» e' la parola importante. Va scritto solo se e' gia' NULL, e
  -- azzerato al primo pagamento riuscito. Se ogni tentativo fallito lo
  -- riscrivesse, Stripe ne fa quattro in due settimane e la tolleranza non
  -- scadrebbe mai — il cliente resterebbe operativo per sempre.
  ritardo_dal TIMESTAMPTZ,

  -- Disdetta esplicita: blocca subito, senza tolleranza. I 3 giorni servono a
  -- una carta che non passa, non a chi ha deciso di andarsene.
  disdetto_il TIMESTAMPTZ,

  -- Lo stato grezzo di Stripe (`active`, `past_due`, `canceled`, `unpaid`…).
  -- Non lo legge nessuna logica: serve a capire cosa e' successo quando il
  -- comportamento non torna, senza dover aprire la dashboard di Stripe.
  stripe_status TEXT,

  -- Ultime 4 cifre, marca e scadenza della carta. JSONB e non colonne perche'
  -- e' un blob di sola visualizzazione, che cambia forma se un giorno si
  -- accetta SEPA o PayPal. Nessun dato di pagamento vero: quelli non entrano
  -- mai qui dentro, stanno da Stripe.
  metodo_pagamento JSONB,

  -- Ragione sociale, P.IVA, indirizzo, PEC/SdI. Copia locale di cio' che sta
  -- sul Customer di Stripe, per non interrogarlo solo per disegnare un form.
  dati_fatturazione JSONB,

  -- Quando il webhook ha scritto l'ultima volta. Se questo campo e' fermo da
  -- settimane mentre l'abbonamento e' attivo, il webhook e' rotto — ed e'
  -- l'unico modo per accorgersene senza aspettare un blocco sbagliato.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Il webhook arriva da Stripe conoscendo il customer, non lo schema: questa e'
-- la direzione di lettura piu' frequente dopo la PK.
CREATE INDEX IF NOT EXISTS tenant_subscriptions_stripe_customer_idx
  ON public.tenant_subscriptions (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- RLS senza policy: chiude il linter Supabase 0013_rls_disabled_in_public e
-- nega anon/authenticated via PostgREST. Nessuna policy DI PROPOSITO — se un
-- giorno se ne aggiunge una, si sta dando al gestore la possibilita' di
-- leggere il proprio stato di pagamento dal client, e va deciso apposta.
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- Nessun GRANT ad anon/authenticated. Il solo accesso e' service_role
-- (BYPASSRLS), usato da apps/admin lato server.
REVOKE ALL ON public.tenant_subscriptions FROM anon, authenticated;

COMMENT ON TABLE public.tenant_subscriptions IS
  'Stato abbonamento Stripe per tenant. Dato di business foras, mai nello schema del cliente. Scritto dal webhook, letto da apps/admin con service_role.';
COMMENT ON COLUMN public.tenant_subscriptions.ritardo_dal IS
  'Primo pagamento fallito non recuperato. I 3 giorni di tolleranza partono da qui. Si scrive solo se NULL, si azzera al primo pagamento riuscito.';
