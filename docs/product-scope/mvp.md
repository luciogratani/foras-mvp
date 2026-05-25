# Scope MVP

---

## Criteri di freeze del template

Il template si congela — e il primo cliente reale può essere onboardato — quando tutte e tre le seguenti condizioni sono soddisfatte:

1. Tutti i componenti homepage sono sviluppati in versione headless, con una wireframe view funzionante nello schema `template`
2. DB, RLS ed edge functions sono completi e testati end-to-end
3. Il pannello admin è completo con tutte le funzionalità CRUD previste

### Checklist di pulizia pre-freeze *(da eseguire sullo schema `template` prima dell'onboarding del primo cliente)*

Lo schema `template` viene usato attivamente durante lo sviluppo con dati reali o di test. Prima di congelare, va pulito e portato allo stato che verrà replicato per ogni nuovo cliente.

```
□ Eliminare tutte le prenotazioni di test dalla tabella bookings
□ Eliminare tutti gli utenti admin di test da Supabase Auth
□ Eliminare la riga corrispondente in public.tenants (se esiste una voce "template")
□ Ripristinare site_settings ai valori placeholder (title, description, og_image, ecc.)
□ Svuotare menu_items, menu_categories, menu_sections — o ricaricare il seed standard
□ Svuotare il path /template/ nel bucket bar-assets
□ Verificare che schema.sql rispecchi fedelmente lo stato corrente delle tabelle
□ Eseguire una passata di verifica RLS end-to-end prima di dichiarare il freeze
```

Lo schema `template` dopo il freeze rimane come riferimento per i fork futuri e **non va modificato** senza aggiornare anche `schema.sql` e `/migrations`.

---

## Homepage pubblica — `dominio.it`

| Sezione | Fonte dati |
|---|---|
| Hero con immagine o video | Supabase Storage |
| Galleria foto | Supabase Storage |
| Popup novità (multi-slide) | DB + Storage |
| Slogan testuale | DB |
| Biografia testuale | DB |
| CTA → Prenota e Menu | — |
| Orari di apertura | DB |
| Footer con info e Google Maps | DB |
| Sezione news/slide (stessa del popup, in fondo alla pagina) | DB + Storage |

**Note:**
- Il popup supporta più elementi attivi contemporaneamente, con navigazione a slide. Stessi contenuti replicati come sezione statica in fondo alla homepage.
- `title`, `description` e `og:image` sono gestibili dal backoffice (campi in `site_settings`).
- Form candidature dipendenti: **escluso dallo scope iniziale**. Incluso nel template come componente opzionale nascosto di default, attivabile su richiesta esplicita del cliente.

---

## Backoffice — `admin.dominio.it`

- Gestione prenotazioni (visualizzazione, lista per data/turno)
- Gestione contenuti sito (mostra/nascondi sezioni, modifica testi principali)
- Gestione menu
- Gestione popup/novità (CRUD elementi, ordinamento slide)
- Gestione orari di apertura
- Gestione candidature (nascosto di default, attivabile)

---

## Prenotazioni — feature incluse nell'MVP

**Conferma automatica con controllo disponibilità coperti.** Il gestore imposta nel backoffice la capacità massima per turno. Il sistema accetta la prenotazione se i coperti disponibili sono sufficienti, rifiuta altrimenti. Nessuna conferma manuale: elimina il problema delle prenotazioni fuori orario.

**Form prenotazioni — campi:** nome (obbligatorio), email (obbligatorio), telefono (opzionale), coperti (obbligatorio), note (opzionale), checkbox GDPR (obbligatorio). Il campo telefono è opzionale nello schema dati (`phone text nullable`) e non obbligatorio nel form — il gestore lo riceve via email assieme al resto della prenotazione se compilato.

**Cancellazione lato utente via link nel ticket di conferma.** Ogni prenotazione ha un `cancellation_token` (UUID). Il link è `dominio.it/booking/cancel/UUID`; nessuna autenticazione richiesta; alla cancellazione i coperti tornano disponibili automaticamente. **Stato attuale:** finché l'email è dormiente (vedi sotto), il link viene mostrato direttamente nella success page del form.

**Email automatica al gestore ad ogni prenotazione** tramite Resend (piano gratuito sufficiente). Il gestore riceve nome, data, ora, coperti richiesti senza dover aprire il backoffice. **Stato attuale (2026-05-25):** l'Edge Function `send-booking-email` è **costruita ma dormiente** (default OFF, no-op se le env non sono configurate, non blocca mai una prenotazione). Si attiva con un flip di config quando il dominio di servizio `foras.*` e il deploy saranno pronti (Sprint 6 / Stream B). Vedi decision-log *Email prenotazioni*.

**GDPR:** il form prenotazioni include checkbox di consenso al trattamento dati e link a privacy policy. La privacy policy è una pagina statica per cliente (`/privacy`). Da documentare nel Playbook come checklist obbligatoria pre-deploy.

---

## Feature esplicitamente fuori dallo scope MVP

| Feature | Motivo |
|---|---|
| Reminder prenotazioni (SMS/email schedulata) | Richiederebbe Twilio o edge function cron — complessità eccessiva |
| Form candidature staff | Componente opzionale nascosto, attivabile su richiesta |
| Routing multi-tenant su dominio condiviso | Non necessario per la scala attuale |
| Varianti menu (taglia, cottura) | Item separati coprono il caso d'uso |
| Ordini online | Out of scope per definizione |
| Allergeni custom per tenant | Solo i 14 obbligatori per legge |

---

## Decisioni pendenti al momento della stesura

- **Struttura dettagliata del menu**: definita separatamente in [[data-model]] — sezione menu.
- **Privacy policy**: pagina statica `/privacy` da personalizzare per ogni cliente. Checklist pre-deploy nel Playbook.
