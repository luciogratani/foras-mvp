# Post-MVP — idee parcheggiate

Feature escluse consapevolmente dallo scope MVP, documentate per non perderle.

---

## Reminder prenotazioni

**Cosa:** email o SMS automatici al cliente il giorno prima della prenotazione.

**Perché escluso:** richiederebbe integrazione SMS/email schedulata (Twilio, edge function con cron). Aggiunge infrastruttura senza che il valore giustifichi la complessità nella fase attuale.

**Quando riconsiderare:** se emerge richiesta esplicita da parte di più clienti.

---

## Form candidature staff

**Cosa:** form sulla homepage per candidature spontanee di dipendenti.

**Stato attuale:** componente già incluso nel template ma nascosto di default. Attivabile su richiesta esplicita del cliente senza modifiche strutturali.

---

## Formula / bundle nel menu

**Cosa:** voce composita a prezzo fisso che raggruppa più prodotti (es. "Colazione: caffè + brioche €1,90", "Menu pranzo: piatto + bevanda €8,00").

**Perché escluso:** non è un item singolo né una categoria — è un concetto che il modello dati attuale non rappresenta nativamente. Richiederebbe una nuova entità (`menu_bundles`) con relazioni many-to-many.

**Quando riconsiderare:** se un cliente lo richiede esplicitamente. Impatta lo schema dati.

---

## Monorepo unificato — Modello B

**Cosa:** un unico repo con tutti i clienti dentro (`/clients/bar-rossi`, `/clients/bar-verdi`), con `/packages` condivisi globalmente. Un fix al service layer si propaga a tutti i clienti in un unico commit.

**Attuale:** Modello A — repo separato per cliente.

**Trigger per migrazione:** quando ci si ritrova a fare lo stesso fix su più di due repo nella stessa settimana.

---

## Routing multi-tenant su dominio condiviso

**Cosa:** un unico dominio che serve tutti i clienti (es. `foras.app/bar-rossi`) invece di un deploy separato per ognuno.

**Perché escluso:** per la scala attuale (pochi clienti) un deploy per cliente su dominio custom offre più flessibilità grafica senza costi aggiuntivi rilevanti.

---

## Rate limiting avanzato sulle prenotazioni

**Attuale:** unique constraint a livello DB `(email, time_slot_id, date)`. Copre il 95% dei casi reali.

**Potenziale problema:** un attacco coordinato con email diverse multiple. Per un bar locale questo scenario è improbabile e non giustifica un sistema di rate limiting applicativo. Da riconsiderare solo se si verificano abusi reali.

---

## Migrazione verifica owner a Edge Function Supabase

**Cosa:** spostare la logica di `getVerifiedTenantClient` (oggi in `apps/admin/lib/auth.ts`, Server Component Next.js) in un'Edge Function Supabase. L'admin app chiama l'edge function passando il JWT utente; la function usa la `service_role` per leggere `public.tenants` e ritorna `{ verified, schema }`.

**Attuale:** `apps/admin/lib/supabaseAdmin.ts` usa `SUPABASE_SERVICE_ROLE_KEY` come variabile server-side su Vercel (decisione tracciata nel [[decisioni|decision-log]], voce *2026-05-21 — SUPABASE_SERVICE_ROLE_KEY su Vercel admin*).

**Vantaggi della migrazione:**
- La `service_role` key non lascia mai i server Supabase — Vercel non la vede
- Attack surface ridotto: RCE su Vercel non comprometterebbe la chiave
- Riusabile da `apps/web` quando servirà (al momento non serve, ma per la cancellazione prenotazione via link unico sì)

**Svantaggi:**
- Round-trip extra (latenza ~50-150ms)
- Secondo target di deploy (Supabase Functions) — più complessità operativa
- Devi gestire la concorrenza dei deploy (rollback non sincronizzato)

**Trigger per migrazione:** quando si verifica una di queste:
1. Entra il secondo tenant reale (più dati a rischio)
2. Si introduce CRUD admin con superficie d'attacco maggiore (es. import file, query dinamica)
3. Serve verifica owner da `apps/web` (es. cancellazione prenotazione autenticata)
