---
status: done
created: 2026-05-22
completed: 2026-05-22
type: audit
area: audit
target: external-chat
topic: ux-funnel-prenotazione-web
owner: master-chat
---

# Audit 01 — UX & conversione del funnel di prenotazione (sito pubblico)

> **A cosa serve.** Far guardare il percorso visitatore → prenotazione di `apps/web` da una chat esterna potente, con occhio fresco, senza contesto di progetto.
>
> **Come usarlo.** Apri una chat nuova (modello potente, che non lavora a questo progetto), incolla il prompt qui sotto e **allega i materiali richiesti** (screenshot desktop + mobile dei vari stati, oppure l'URL live). Quando torna la risposta, incollala nella sezione *Risposta* in fondo e aggiorna `status` + `completed`.

---

## Prompt per la chat esterna

```
Agisci come un senior UX/conversion designer specializzato in prodotti web di
hospitality e booking (ristoranti, hotel, prenotazioni tavoli). Voglio una
valutazione critica e indipendente, non incoraggiamenti.

CONTESTO (minimo necessario)
- "foras" è un template che genera il sito pubblico di un singolo bar/ristorante
  locale (Italia/Sardegna). Ogni cliente ha il suo sito a partire dallo stesso template.
- L'utente finale del sito è il pubblico generico, in larga maggioranza da mobile,
  con un obiettivo: trovare informazioni sul locale e prenotare un tavolo.
- Il gestore del locale è spesso poco tecnologico; i contenuti (menu, orari, testi)
  li gestisce da un backoffice separato (non oggetto di questo audit).
- La homepage contiene: hero, slogan, biografia, menu navigabile a sezioni con
  allergeni in popup, orari di apertura, sezione novità + popup novità, galleria, footer.
- Il flusso di prenotazione: l'utente sceglie una data, vede i turni disponibili
  (es. Pranzo/Cena), compila nome, email, telefono (opzionale), n. coperti, note
  (opzionale) e un consenso GDPR obbligatorio. La conferma è automatica con controllo
  della capienza (coperti) del turno; niente conferma manuale del gestore. Una
  prenotazione duplicata (stessa email/turno/data) viene rifiutata. Dopo la conferma,
  l'utente riceve un link per annullare la prenotazione senza login (token).

COSA VALUTARE (il fuoco è la conversione e la chiarezza, non l'estetica)
- L'intero percorso visitatore → prenotazione completata: frizioni, passaggi
  superflui, momenti di dubbio o abbandono.
- La selezione data/turno e il form: carico cognitivo, ordine dei campi, label,
  validazione, accessibilità di base, comportamento da mobile.
- Gli stati critici: nessun turno disponibile, turno al completo, prenotazione
  duplicata, consenso GDPR mancante, errore generico. Sono chiari e recuperabili?
- Il momento di conferma (success) e il flusso di annullamento via link: l'utente
  capisce cosa è successo e cosa può fare?
- Fiducia/trust: il sito comunica abbastanza affidabilità da far prenotare uno
  sconosciuto?

FUORI SCOPO
- Giudizi di brand/estetica puramente visivi: la UI è dichiaratamente una bozza in
  evoluzione. Segnala i problemi visivi solo se impattano comprensione o conversione.
- Sicurezza, backend, performance tecnica.

MATERIALI CHE TI FORNISCO (chiedimeli se mancano o non bastano)
- Screenshot di: homepage (desktop e mobile), pagina di prenotazione nei vari stati
  (form vuoto, turni disponibili, nessun turno, errore, success), pagina di
  annullamento. In alternativa, l'URL live.

OUTPUT ATTESO
- Una lista di rilievi prioritizzati P0 (blocca/perde prenotazioni) / P1 (frizione
  seria) / P2 (miglioria). Per ognuno: problema, impatto sulla conversione o sulla
  chiarezza, raccomandazione concreta e azionabile.
- In fondo: i 3 "quick win" a più alto rapporto valore/sforzo.
- Se i materiali non bastano per un giudizio fondato, dimmi esattamente cosa ti serve
  invece di inventare.
```

---

## Risposta

> Audit fondato sulla lettura del codice reale del sito pubblico (`apps/web`) e della logica di prenotazione (`packages/supabase`). I rilievi citano i file/righe a supporto. Niente complimenti: di seguito solo cosa frena o perde prenotazioni.

### Sintesi del percorso reale (ricostruito dal codice)

1. L'utente arriva sulla home (`apps/web/app/page.tsx`): hero, slogan, bio, menu, galleria, orari, novità, popup novità, footer.
2. **Da nessuna parte nella home né nel layout c'è un link a `/booking`** (verificato: `grep -rn "booking\|Prenota"` su `_components/`, `layout.tsx`, `page.tsx` non restituisce nulla). L'unico modo per prenotare è digitare l'URL `/booking` a mano.
3. Su `/booking` (`apps/web/app/booking/page.tsx`) si vede un titolo, "Data selezionata: YYYY-MM-DD" e il form (`BookingForm.tsx`): un mini-form GET per cambiare data + il form vero (turno, nome, email, telefono, coperti, note, consenso GDPR).
4. Submit → server action (`booking/actions.ts`) → `createBooking` (`packages/supabase/src/services/bookings.ts`). Successo: schermata di conferma con link di annullamento.
5. Annullamento: `/booking/cancel/[token]` annulla **immediatamente al caricamento della pagina**, senza alcuna conferma.

---

### P0 — Bloccano o perdono prenotazioni

**P0.1 — Nessun punto di ingresso alla prenotazione dalla home (nessun CTA "Prenota").**
- *Problema:* la home non contiene alcun link/bottone verso `/booking`. Confermato leggendo `page.tsx`, `layout.tsx` (nessuna nav/header) e tutti i `_components/` (`Hero`, `Slogan`, `Bio`, `OpeningHours`, `NewsSection`, `Footer`, ecc.): zero occorrenze di "booking"/"Prenota". Il footer espone solo telefono/email/indirizzo.
- *Impatto:* è il singolo difetto che azzera la conversione. L'obiettivo primario dichiarato del sito (prenotare un tavolo) è irraggiungibile a meno che l'utente non indovini l'URL. Su mobile, dove sta la maggioranza del traffico, è semplicemente impossibile.
- *Raccomandazione:* CTA "Prenota un tavolo" persistente e ad alta visibilità: (a) un bottone primario nell'hero (`Hero.tsx`), (b) idealmente una barra/azione sticky su mobile (sempre raggiungibile mentre si scorre il menu), (c) un link anche nel footer accanto ai contatti. È il fix #1 in assoluto.

**P0.2 — Il link di annullamento cancella la prenotazione al solo caricamento, senza conferma.**
- *Problema:* `booking/cancel/[token]/page.tsx` esegue `cancelBookingByToken` direttamente nel render del Server Component (riga 25), quindi **la prenotazione viene annullata appena la pagina viene aperta**. Non c'è step "Sei sicuro? Conferma annullamento".
- *Impatto:* alto rischio di cancellazioni involontarie e silenziose. I client email/chat (Gmail, WhatsApp, iMessage, scanner antivirus, anteprime link) fanno **GET di prefetch** sui link: aprire l'email — o anche solo riceverla — può annullare il tavolo a insaputa dell'utente. È una perdita diretta di prenotazioni confermate, per giunta invisibile finché il cliente non si presenta e il tavolo non c'è. Aggravato dal fatto che, quando le email saranno attive (B2 dormiente, vedi `notifyBooking.ts`), il link viaggerà proprio via email.
- *Raccomandazione:* trasformare l'annullamento in **due passi**: il GET mostra solo i dettagli della prenotazione + un bottone "Conferma annullamento"; la cancellazione effettiva avviene su **POST** (server action), mai sul GET. In subordine immediato, mai eseguire mutazioni in render di pagina.

**P0.3 — Lo stato di successo è effimero: ricaricando o tornando indietro, il link di annullamento è perso per sempre.**
- *Problema:* la conferma vive solo in stato React di `useActionState` (`BookingForm.tsx`, riga 9-28). Non c'è redirect a una URL stabile, né persistenza. Il testo stesso avverte: *"Conserva questo link — è il tuo unico modo per cancellare la prenotazione (le email di conferma non sono ancora attive)."*
- *Impatto:* con le email dormienti, il token di annullamento esiste **solo** in quella schermata volatile. Un refresh accidentale, un tap su "indietro", la chiusura della tab, o il passaggio ad altra app su mobile e l'utente non può più annullare in autonomia: dovrà telefonare, oppure semplicemente non si presenterà (no-show). Inoltre il "Numero di coperti" non ha `defaultValue` (riga 86): un refresh azzera tutto il form già compilato.
- *Impatto conversione:* erode la fiducia ("e se devo disdire?") e genera no-show. Un sistema di prenotazione che dipende dal copia-incolla manuale di un link non è affidabile.
- *Raccomandazione:* finché le email sono spente, ridurre il danno: redirect a una pagina di conferma con URL contenente il token (es. `/booking/confirmed/[token]`) così è bookmarkabile/condivisibile; mostrare un riepilogo della prenotazione (data, turno, coperti, nome); offrire "Aggiungi al calendario" (.ics). La vera soluzione resta l'attivazione dell'email di conferma (B2).

---

### P1 — Frizione seria

**P1.1 — La selezione data è disgiunta dal form e richiede un round-trip di pagina.**
- *Problema:* il cambio data è un form `method="GET"` separato con bottone "Aggiorna" (`BookingForm.tsx`, righe 34-40), distinto dal form di prenotazione. Cambiare data ricarica l'intera pagina via querystring.
- *Impatto:* carico cognitivo e attrito. L'utente deve capire che "Aggiorna" serve a ricaricare i turni; se nel frattempo aveva iniziato a compilare, perde tutto. Pattern insolito per un booking moderno (di solito data e turni si aggiornano inline).
- *Raccomandazione:* unificare in un unico flusso reattivo: al cambio data i turni si aggiornano senza perdere i dati già inseriti. Eliminare il bottone "Aggiorna" (auto-submit `onChange`) o, meglio, gestione client-side con refetch.

**P1.2 — "Nessun turno disponibile" è un vicolo cieco, senza suggerimenti di recupero.**
- *Problema:* quando `slots.length === 0` o nessuno ha coperti, si mostra solo *"Nessun turno disponibile per questa data. Seleziona un'altra data."* (riga 49). Ma la causa può essere molteplice e l'utente non lo sa: data passata, giorno di chiusura, orario già trascorso per oggi, oppure tutto pieno. La logica in `getAvailableTimeSlots` (righe 51, 70, 73-78) restituisce array vuoto in tutti questi casi senza distinguerli.
- *Impatto:* l'utente non capisce *perché* e non sa cosa fare. Se il locale è chiuso il lunedì non glielo si dice; se è tutto pieno non gli si propone un'alternativa. Probabile abbandono.
- *Raccomandazione:* messaggi differenziati ("Siamo chiusi questo giorno", "Tutti i turni sono al completo per questa data", "Per oggi gli orari sono già passati") e un suggerimento azionabile (es. proporre la prossima data utile, o un link "Chiamaci" col telefono del locale come fallback umano).

**P1.3 — Stato "turno al completo" poco leggibile: l'opzione resta in lista ma disabilitata.**
- *Problema:* nel `<select>` i turni pieni sono `disabled` ma restano visibili come `"Cena (20:00) — 0 coperti disponibili"` (righe 57-65). Il default del select è il primo turno, che potrebbe essere quello pieno/disabilitato; non c'è un default esplicito né un placeholder "Seleziona un turno".
- *Impatto:* su mobile un `<select>` con opzioni disabilitate è confuso (alcuni OS le nascondono, altri le mostrano grigie e non spiegano perché non si selezionano). "0 coperti disponibili" è gergo; l'utente legge "0" e non capisce se è un errore.
- *Raccomandazione:* sostituire il `<select>` con bottoni/card per turno (pattern booking standard, ottimo da mobile): turno pieno = card disabilitata con etichetta chiara "Completo"; turno disponibile mostra "X posti liberi" solo se la disponibilità è bassa (la disponibilità esatta non è informazione utile e può scoraggiare). Aggiungere un'opzione placeholder o un default valido.

**P1.4 — Validazione solo nativa + messaggio d'errore generico; nessun errore per-campo.**
- *Problema:* la validazione è affidata agli attributi HTML (`required`, `type=email`) e a Zod lato server. In caso di fallimento Zod, l'action ritorna un unico messaggio: *"Dati non validi. Controlla i campi e riprova."* (`actions.ts`, riga 34) senza dire quale campo. Inoltre `gdpr_consent` è `required` sul checkbox (riga 96): se manca, parte solo il tooltip nativo del browser, facile da non notare su mobile.
- *Impatto:* quando qualcosa va storto l'utente non sa cosa correggere. Il telefono ha `min(3)` lato schema (`schemas/bookings.ts`, riga 8): un numero scritto male produce l'errore generico anziché un avviso mirato sul campo telefono.
- *Raccomandazione:* restituire errori per-campo dall'action (Zod `flatten()`) e mostrarli accanto al campo; rendere l'errore del consenso GDPR esplicito e visibile (non solo tooltip nativo); annunciare gli errori a screen reader.

**P1.5 — Conferma "automatica" non comunicata: l'utente non sa che il tavolo è garantito subito.**
- *Problema:* il sistema conferma automaticamente con controllo capienza (nessuna conferma manuale del gestore), ma da nessuna parte prima del submit lo si dichiara. Il bottone dice solo "Prenota".
- *Impatto:* incertezza sul trust. L'utente non sa se sta "richiedendo" (in attesa di un sì) o "prenotando" (confermato). L'ambiguità riduce la propensione a completare.
- *Raccomandazione:* microcopy rassicurante vicino al bottone: "Conferma immediata, nessuna attesa". Sulla schermata di successo già si dice "confermata" — bene — ma va anticipato.

---

### P2 — Migliorie

**P2.1 — `/booking` è spoglio e privo di contesto/trust.** La pagina (`booking/page.tsx`) mostra solo `<h1>` e "Data selezionata: …", senza nome del locale, indirizzo, telefono o ritorno alla home. L'utente che ci arriva da un link diretto non ha àncore di fiducia. *Raccomandazione:* riusare header/footer con identità del locale e contatti anche su `/booking`.

**P2.2 — "Data selezionata: 2026-05-22" in formato ISO grezzo** (`booking/page.tsx`, riga 33). Poco leggibile per il pubblico italiano. *Raccomandazione:* formato locale ("Venerdì 22 maggio 2026").

**P2.3 — Nessun limite massimo alla data prenotabile e nessun `min` sull'input date** (`BookingForm.tsx`, riga 37): si possono selezionare date passate (poi rifiutate lato server con array vuoto/errore generico, frizione evitabile) o anni nel futuro. *Raccomandazione:* `min={today}` e un `max` ragionevole sull'`<input type="date">`.

**P2.4 — Il popup "Novità" si apre automaticamente in apertura sito** (`NewsPopup.tsx`): su mobile un modale a tutto schermo all'arrivo è un classico killer di conversione/SEO (interstitial). Per un utente che vuole prenotare è un ostacolo iniziale. *Raccomandazione:* valutare un trigger meno invasivo (badge/sezione) o almeno assicurarsi che non copra l'eventuale CTA "Prenota".

**P2.5 — Label/accessibilità del select e degli stati.** Il messaggio d'errore usa `role="alert"` (buono), ma il blocco "nessun turno" no. La galleria è tutta `Skeleton` placeholder (`Gallery.tsx`): se va in produzione così comunica "sito incompiuto" e abbassa il trust. *Raccomandazione:* non spedire la galleria finta in produzione; se vuota, nasconderla.

**P2.6 — Telefono opzionale ma è l'unico canale di recupero umano.** Con email dormienti e link di annullamento fragile (P0.3), il telefono dell'utente è di fatto l'unico modo per il locale di ricontattarlo. *Raccomandazione:* valutare di renderlo obbligatorio (o fortemente consigliato con microcopy "per contattarti in caso di necessità"), finché il canale email non è attivo.

**P2.7 — Disponibilità esatta esposta ("12 coperti disponibili").** Mostrare il numero preciso è informazione da gestionale, non da cliente: può sembrare "vuoto = locale poco frequentato" o creare ansia da scarsità mal calibrata. *Raccomandazione:* mostrare solo "Disponibile" / "Ultimi posti" / "Completo".

---

### I 3 quick win (massimo valore / minimo sforzo)

1. **Aggiungere il CTA "Prenota un tavolo" nell'hero (e nel footer).** Sblocca l'intero funnel: oggi la prenotazione è di fatto irraggiungibile (P0.1). Una riga di JSX in `Hero.tsx` con `<a href="/booking">`. È il fix a più alto impatto in assoluto.
2. **Mettere `min={today}` sull'input data e auto-submit al cambio data.** Elimina date passate (frizione + errore generico) e toglie il bottone "Aggiorna" poco chiaro (P1.1, P2.3). Modifica minima in `BookingForm.tsx`.
3. **Trasformare l'annullamento in due passi (mostra dettagli su GET, cancella solo su POST).** Chiude il rischio di cancellazioni involontarie da prefetch dei link (P0.2), critico ancor di più quando si attiveranno le email. Refactor contenuto in `cancel/[token]/page.tsx` + una piccola server action.

> Nota di sistema, oltre la UX: in `createBooking` il controllo capienza e l'insert non sono atomici (commento "RACE CONDITION NOTA (MVP)", `services/bookings.ts` righe 102-107). Per l'utente questo si traduce in un raro ma possibile "confermato" che in realtà è overbooking — fuori scopo estetico ma con impatto diretto sull'esperienza reale al tavolo.

---

## Note del master (sintesi / azioni)

**Triage 2026-05-24.** Verificato l'audit contro il codice attuale: da maggio è entrato solo `preferred_time` (C3 dell'intermezzo UX-fix), tutto il resto è ancora aperto. I rilievi sono ordinati su tre secchi secondo la distinzione **UI (congelata fino al primo onboarding) vs UX (azionabile ora)**, decisa con Lucio.

**Secchio A — comportamento/correttezza, UI-neutri → si fanno ora.** Confluiscono nell'**Intermezzo Web-UX-funnel** (`docs/ai-playbooks/prompts/2026-05-24_web-ux-funnel/`):
- P0.2 (cancel su GET) → **sub-task 02**. Trattato come bug, non polish: una mutazione nel render di un GET è scorretta a prescindere, e diventa distruttore silenzioso di prenotazioni quando si accende l'email B2 (il link viaggia via email, soggetto a prefetch).
- P0.1 (nessun link a `/booking`) → **sub-task 01**, in forma *minimale* (link non stilizzato): l'esistenza del percorso è UX/architettura; il CTA curato è UI e si rimanda.
- P1.1 + P2.3 (data: `min` + auto-submit, via il bottone "Aggiorna") → sub-task 01.
- P1.4 (errori per-campo + GDPR visibile) + P0.3-parte-cheap (ripopolamento valori + `defaultValue` coperti) → sub-task 01.
- P2.2 (data leggibile in italiano) → sub-task 01.
- P1.2 versione *cheap* (distinguere "tutto pieno" da "nessun turno") → sub-task 01. La versione ricca (motivo esatto chiuso/passato + prossima data utile) richiede di toccare la firma di `getAvailableTimeSlots` → follow-up sotto.

**Secchio B — intrecciati con la UI congelata → rimandati al consolidamento UI (primo onboarding).** CTA stilizzato/sticky (forma visiva di P0.1), `<select>`→card per turno (P1.3), header/footer di trust su `/booking` (P2.1), galleria skeleton finta in produzione (P2.5), disponibilità esatta vs "Disponibile/Ultimi posti/Completo" (P2.7), microcopy "conferma immediata" (P1.5, micro ma da fare col redesign del form).

**Secchio C — gated sulla decisione email (B2 dormiente).** Persistenza del token / pagina di conferma bookmarkabile (P0.3 vera soluzione), telefono obbligatorio come unico canale di recupero (P2.6). Da decidere insieme a *quando* accendere l'email — non sovra-investire ora in workaround che l'email rende ridondanti.

**Follow-up tecnici annotati:**
- P1.2 ricco: `getAvailableTimeSlots` collassa chiuso/passato/pieno ad array vuoto; differenziare i motivi richiede un cambio di firma (la funzione è usata anche da `createBooking`). Da valutare a parte.
- Nota di sistema (oltre la UX): `createBooking` ha capacità-check + insert non atomici ("RACE CONDITION NOTA (MVP)", `services/bookings.ts`). Già accettato per MVP; trigger di revisione = primo overbooking reale.
