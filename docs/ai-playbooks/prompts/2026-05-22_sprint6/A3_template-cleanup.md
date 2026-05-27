---
status: CANCELLED
sprint: 6
stream: A
task: A3
created: 2026-05-25
cancelled: 2026-05-27
suggested_model: n/a (operativo — master/Lucio, non delegabile a sub-chat)
suggested_effort: n/a
owner: master-chat
---

> **❌ CANCELLATO (Lucio, 2026-05-27 — vedi decision-log voce *`template` resta sandbox dev/test*).** La pulizia del `template` live non serve più: la fonte di verità del freeze è lo script `create_schema_from_template.sql` (parametrizzato e testato in A2), non un dump del `template`. A4 genera `schema.sql` da uno schema usa-e-getta `freeze_test` creato dallo script, senza toccare il `template`. Lo schema `template` resta un **sandbox dev/test** (anche per James). Il runbook qui sotto è conservato solo come riferimento storico — **non eseguirlo.**

# Sprint 6 / A3 — Pulizia dello schema `template` pre-freeze [CANCELLATO]

> **Operativo, NON delegabile a una sub-chat di codice.** Tocca il DB live, Supabase Auth e Storage. Lo esegue **Lucio/master** nel SQL editor + dashboard Supabase. Questo file è un runbook con checklist, non un prompt di coding.
>
> **Dipendenze:** dopo A1 (RLS hardened applicata a `template`), A1b (se opzione A: colonna `timezone` su `template`), A2 (script di onboarding parametrizzato e testato). A3 porta `template` allo stato "pulito" che A4 dumperà come `schema.sql`.

## Obiettivo

Lo schema `template` è stato usato come ambiente di sviluppo con dati reali/di test. Prima del freeze va riportato esattamente allo stato che ogni nuovo tenant erediterà: **struttura + seed canonico, zero dati di test**.

## Checklist (eseguire come `service_role` nel SQL editor, salvo dove indicato)

```
DATI DI TEST
□ DELETE FROM template.bookings;                         -- tutte le prenotazioni di prova
□ Svuotare contenuti di test del menu:
    DELETE FROM template.menu_items;                      -- item di prova
    DELETE FROM template.menu_categories;                 -- categorie di prova
    -- NON svuotare menu_sections: sono le 6 sezioni di seed (ripristinarle, vedi sotto)
□ DELETE FROM template.news_slides;                      -- slide di prova
□ DELETE FROM template.closed_dates;                     -- chiusure di prova

SEED CANONICO — ripristinare ai valori di create_schema_from_template.sql §5
□ menu_sections: devono essere ESATTAMENTE le 6 di seed
    (Colazione/Pranzo/Aperitivo/Cena attive, Cocktail/Carta dei vini disattive),
    position 1..6, rinominate? → riportare ai nomi/ordine/flag di seed
□ allergens: i 14 obbligatori, nessuno in più/in meno (ID possono differire, i nomi no)
□ time_slots: i 2 di seed (Pranzo 12:30/30, Cena 20:00/50, attivi, end_time NULL,
    archived_at NULL) — eliminare turni di prova, ripristinare i due default
□ site_settings: UNA riga, valori placeholder (title 'Nome del locale',
    description placeholder, tutti gli altri campi a default/NULL,
    opening_hours = default 7 giorni clos:true, maintenance_mode=false,
    extra_data={}, social_* NULL)

AUTH / REGISTRY
□ Supabase Auth: eliminare eventuali utenti admin di TEST creati durante lo sviluppo,
    mantenendo SOLO l'admin canonico del template (owner_id 1c486961-12b2-47d0-8aef-0aee30df083c,
    user_metadata.schema='template'). NB: serve a is_tenant_owner se si scrive su template;
    post-freeze nessuno scrive su template → mantenerlo è la scelta sicura.
□ public.tenants: la riga ('template', 1c486961-...) RESTA (è il riferimento dell'audit
    e il record owner del template). Eliminare solo righe di schemi di test (es. onboard_test di A2).

STORAGE
□ Svuotare il path template/ nel bucket bar-assets (immagini di prova caricate in dev)

VERIFICA
□ Eseguire audit_rls.sql → zero discrepanze, RLS attiva su tutte e 9 le tabelle,
    is_tenant_owner presente (se A1 ha esteso l'audit, anche GRANT ok)
□ Eseguire rls_isolation_tests.sql (sezioni 1, 2a, 2b + sezione 3 owner-scope di A1) → tutti PASS
□ Conteggi sanity:
    SELECT count(*) FROM template.allergens;      -- atteso 14
    SELECT count(*) FROM template.menu_sections;  -- atteso 6
    SELECT count(*) FROM template.menu_items;     -- atteso 0
    SELECT count(*) FROM template.bookings;       -- atteso 0
    SELECT count(*) FROM template.time_slots;     -- atteso 2
    SELECT count(*) FROM template.site_settings;  -- atteso 1
```

## Note

- **Ordine delle DELETE:** rispettare le FK (`menu_items` prima di `menu_categories`; `bookings` non blocca `time_slots` se prima svuoti bookings). `closed_dates`/`news_slides` sono indipendenti.
- **Non droppare/ricreare lo schema:** A3 pulisce i dati, non la struttura (la struttura è già quella finale dopo A1/A1b). Se preferisci ripartire da zero, l'alternativa è dropparlo e ri-eseguire lo script parametrizzato di A2 con `-v schema=template` — ma allora rifai login admin e re-applichi eventuali step manuali.
- Questo è lo stato che **A4 dumperà** in `schema.sql`: qualsiasi residuo di test finirebbe nel baseline congelato di ogni cliente.

## Done when

- I conteggi sanity tornano; audit + isolation test verdi; Storage `template/` vuoto; Auth con solo l'admin canonico; `public.tenants` con la sola riga `template` (più eventuali tenant reali già onboardati, nessuno schema di test).
- Lo schema `template` è pronto per essere fotografato da A4.
