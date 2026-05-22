---
status: done
created: 2026-05-22
completed: 2026-05-22
type: audit
area: audit
target: external-chat
topic: ux-workflow-admin-gestore
owner: master-chat
---

# Audit 02 — UX & workflow operativo del backoffice (gestore)

> **A cosa serve.** Far valutare da una chat esterna se un gestore *non tecnico* riesce a gestire il proprio sito ogni giorno dal backoffice (`apps/admin`) senza frustrazione né errori. Occhio fresco, nessun contesto di progetto.
>
> **Come usarlo.** Apri una chat nuova (modello potente, esterno al progetto), incolla il prompt e **allega i materiali** (screenshot di ogni sezione + idealmente una breve registrazione schermo dei task ripetitivi, oppure URL admin + login di test). Incolla la risposta sotto e aggiorna `status` + `completed`.

---

## Prompt per la chat esterna

```
Agisci come un senior product designer specializzato in strumenti gestionali/back-office
per utenti NON tecnici (es. titolari di ristoranti, negozi, piccole attività). Voglio
una valutazione indipendente e severa dei flussi di lavoro, non complimenti.

CONTESTO (minimo necessario)
- "foras" genera, da un template, il sito di un singolo bar/ristorante locale
  (Italia/Sardegna). Questo audit riguarda il BACKOFFICE con cui il TITOLARE gestisce
  i contenuti del proprio sito. Il titolare è poco tecnologico, lo usa qualche volta a
  settimana (a volte ogni giorno), potenzialmente anche da tablet o telefono.
- Sezioni del backoffice:
  - Menu: 6 sezioni predefinite (es. Colazione, Pranzo, Cena…) che si possono
    rinominare e attivare/disattivare ma non creare da zero; dentro ogni sezione,
    categorie; dentro le categorie, voci con nome, descrizione, prezzo, allergeni
    (14 fissi, da spuntare), immagine via URL, attivo/non attivo. Ordinamento via
    drag-and-drop a tutti e tre i livelli.
  - Novità/popup: elenco di slide (titolo, testo, immagine via URL) con ordinamento
    drag-and-drop.
  - Orari di apertura: 7 giorni, ognuno con apertura/chiusura o "chiuso".
  - Turni e coperti: turni di prenotazione (etichetta, orario, capienza massima).
  - Impostazioni sito: SEO (title, description, immagine social) + testi (slogan,
    bio, indirizzo, telefono, email).
  - Prenotazioni: lista filtrabile per data e turno, con possibilità di annullare una
    prenotazione; storico delle cancellate in sola lettura.

COSA VALUTARE (fuoco: i lavori ricorrenti, fatti bene e senza errori)
- Il titolare riesce a portare a termine i compiti tipici in autonomia e senza
  esitazioni? In particolare i flussi ricorrenti:
  - aggiornare il menu (aggiungere/modificare/disattivare voci) quando cambia l'offerta;
  - gestire le prenotazioni di una giornata intensa (trovare, leggere, annullare);
  - cambiare gli orari per una festività o una chiusura straordinaria;
  - riordinare un menu con MOLTE voci/sezioni.
- Scalabilità delle interazioni: il drag-and-drop regge quando la lista è lunga e
  popolosa? Quali alternative servirebbero?
- Prevenzione degli errori: azioni distruttive (es. cancellazioni a cascata),
  modifiche che si propagano al sito pubblico, stati ambigui (attivo vs disattivo).
- Densità informativa, scopribilità delle funzioni, feedback dopo un'azione.

FUORI SCOPO
- Estetica pixel-perfect (la UI è una bozza in evoluzione).
- Autenticazione/sicurezza/backend.

MATERIALI CHE TI FORNISCO (chiedimeli se mancano)
- Screenshot di ogni sezione del backoffice; idealmente una breve registrazione
  schermo dei task ripetitivi (riordino menu, gestione prenotazioni). In alternativa,
  URL del backoffice + credenziali di test.

OUTPUT ATTESO
- Rilievi prioritizzati P0 (impedisce/causa errori nel lavoro quotidiano) / P1
  (frizione seria) / P2 (miglioria). Per ognuno: problema, impatto sul lavoro del
  titolare, raccomandazione concreta.
- Indica il SINGOLO rischio più grave per il lavoro quotidiano e come lo risolveresti.
- Se i materiali non bastano, dimmi cosa ti serve invece di assumere.
```

---

## Risposta

> Audit fondato sulla lettura del codice reale (`apps/admin/app/dashboard/**` e `packages/supabase/src/services|schemas`). Non sono complimenti: è una valutazione severa orientata al lavoro quotidiano di un titolare non tecnico.

### Quadro d'insieme

I CRUD ci sono tutti e sono coerenti tra le sezioni (stesso pattern `useActionState` + dialog), il che è positivo per la riconoscibilità. Ma l'app è costruita come una **lista di record da editare**, non come uno strumento operativo. I due flussi ad alta frequenza e alto stress — **gestire le prenotazioni di una serata piena** e **chiudere/riaprire per una festività** — sono proprio quelli serviti peggio. Sono lì che si annida il rischio vero.

Due note trasversali che amplificano quasi tutti i rilievi sotto:

- **Nessun feedback positivo dopo le azioni in lista.** Non esiste un sistema di toast/notifiche nel pacchetto UI (verificato: nessun `toast`/`sonner`/`Toaster` in `packages/ui/src`). I dialog si limitano a chiudersi sul successo (`if (state.status === 'success') onClose()` in es. `DeleteItemDialog.tsx`, `EditItemDialog.tsx`). Le azioni inline più frequenti — gli interruttori attivo/inattivo e i drag-and-drop — **non danno alcuna conferma di salvataggio**. Solo `OpeningHoursForm` e `SiteSettingsForm` mostrano un "salvato" verde. Per un utente non tecnico "non è successo niente di visibile" = "non ha funzionato" → ricliccare, dubbio, errori.
- **Errori delle azioni "fire-and-forget" silenziati.** I riordini chiamano `void reorderXAction(...)` dentro una `startTransition` senza gestire il rifiuto (es. `SectionList.tsx` riga 37, `CategoryRow.tsx` righe 55-57). Se il salvataggio del nuovo ordine fallisce sul server, la UI resta nell'ordine nuovo ma il database (e quindi il sito pubblico) resta in quello vecchio: **divergenza silenziosa** che il titolare scopre solo guardando il sito.

---

### P0 — Impediscono o causano errori nel lavoro quotidiano

**P0-1 — La lista prenotazioni non mostra il telefono e non somma i coperti: inadatta a una serata piena.**
`BookingList.tsx` mostra colonne Nome / Email / Coperti / Data / Turno. Ma lo schema prenotazione **contiene il telefono** (`packages/supabase/src/schemas/bookings.ts` riga 8: `phone: z.string()...`), che la lista semplicemente non rende. In un servizio reale il titolare contatta i clienti **per telefono**, non per email. Inoltre **non c'è alcun totale coperti** per turno/giornata: per sapere "quante persone ho stasera alle 20:00" deve sommare a mente le righe. C'è una capienza massima per turno (`max_covers` in `time_slots`) ma in pagina prenotazioni **non è mostrata da nessuna parte**, quindi non si vede mai "stai a 38/40, quasi pieno".
*Impatto:* il caso d'uso centrale ("gestire una giornata intensa: trovare, leggere, contattare") è zoppo. Niente telefono = il gestore deve aprire un altro sistema o non può richiamare; niente totali/capienza = nessun colpo d'occhio sull'affollamento.
*Raccomandazione:* aggiungere colonna Telefono (cliccabile `tel:`); intestazione/banner per turno con **coperti prenotati / capienza** (es. "Cena 20:00 — 38/40"); subtotale coperti per ogni turno. È quasi tutto già nei dati, è una resa mancante.

**P0-2 — Ordinamento prenotazioni inadatto al lavoro per servizio; nessun raggruppamento per turno.**
La query ordina per `date desc, time_slot_id asc` (`bookings.ts` righe 153-154). L'ordinamento per `time_slot_id` è **per UUID**, non per orario del turno: i turni compaiono in ordine casuale, non Pranzo → Cena. Senza filtro attivo, la lista mescola tutte le date (passate e future) in un'unica tabella piatta. Il gestore deve **sempre** impostare il filtro data per avere qualcosa di leggibile, e anche allora i turni non sono in ordine cronologico né le righe ordinate per nome.
*Impatto:* trovare "la prenotazione di Rossi per stasera" in una serata da 30 coperti richiede scansione visiva di una tabella non ordinata in modo utile. Lento e soggetto a errori (cancellare la persona sbagliata).
*Raccomandazione:* default sulla data odierna; raggruppare per turno in ordine di `time`; dentro ogni turno ordinare per orario/nome; eventualmente una ricerca per nome.

**P0-3 — Nessun concetto di chiusura straordinaria / festività.**
`OpeningHoursForm` gestisce i 7 giorni della settimana ricorrenti. Non esiste **alcun campo per una data specifica** (Ferragosto, chiusura per ferie, evento privato): lo schema è `OpeningHoursSchema` su lunedì-domenica e basta. Il brief chiede esplicitamente "cambiare gli orari per una festività o una chiusura straordinaria" — **non è realizzabile**. L'unico workaround è modificare il giorno della settimana ricorrente e poi **ricordarsi di rimetterlo a posto** dopo la festa.
*Impatto:* la chiusura ricorre più volte all'anno ed è ad alto rischio: se il titolare modifica "lunedì chiuso" per il lunedì di Pasquetta e dimentica di ripristinare, **resta chiuso tutti i lunedì** sul sito pubblico. Errore silenzioso e duraturo, con impatto diretto sulle prenotazioni.
*Raccomandazione:* introdurre "chiusure straordinarie" come elenco di date/intervalli con override (chiuso o orario speciale), separate dagli orari settimanali, con scadenza automatica.

**P0-4 — Eliminare un turno con prenotazioni: l'errore è gestito, ma a posteriori e senza dato di contesto.**
`deleteTimeSlotAction` intercetta la violazione di FK e mostra "Impossibile eliminare: esistono prenotazioni per questo turno" (`orari/actions.ts` righe 80-86) — bene, niente cancellazione a cascata distruttiva. Però: (a) il dialog di conferma `DeleteTimeSlotDialog` **non avvisa prima** che il turno potrebbe avere prenotazioni e dice "azione non reversibile" senza spiegare il vincolo; (b) **anche disattivare un turno** (toggle) non avvisa che ci sono prenotazioni future legate a quel turno né cosa succede a quelle prenotazioni lato sito pubblico.
*Impatto:* confusione su un'operazione che tocca prenotazioni reali di clienti. Il titolare prova a eliminare, riceve un errore generico, non sa se può disattivare in sicurezza.
*Raccomandazione:* nel dialog mostrare il numero di prenotazioni (future) collegate prima di confermare; spiegare l'alternativa "disattiva invece di elimina"; chiarire l'effetto della disattivazione sulle prenotazioni esistenti.

---

### P1 — Frizione seria

**P1-1 — Drag-and-drop come UNICO modo di riordinare, e non regge le liste lunghe.**
Tutti e tre i livelli del menu usano `@dnd-kit` con `PointerSensor` puro (`SectionList`, `SectionCard`, `CategoryRow`). Problemi concreti per un menu vero (decine di voci):
- **Solo puntatore, niente alternativa.** Nessun `KeyboardSensor`, nessun pulsante su/giù. Spostare una voce dall'inizio alla fine di una lista lunga = drag con autoscroll, faticoso e impreciso, **ingestibile su tablet/telefono** dove il drag compete con lo scroll della pagina.
- **Riordino solo locale.** Si può riordinare entro una categoria, ma non c'è modo di spostare una voce **da una categoria all'altra** o una categoria in un'altra sezione: bisogna eliminare e ricreare (perdendo allergeni, descrizione, prezzo).
- **Tutto renderizzato in una sola pagina.** `MenuPage` carica e monta sezioni → categorie → tutti gli item insieme (`Promise.all` annidati, nessuna paginazione/collasso). Con un menu ricco la pagina diventa lunghissima e ogni `revalidatePath` ricarica tutto.
*Impatto:* il task "riordinare un menu con MOLTE voci" — esplicitamente nel brief — è frustrante e lento; su mobile quasi impraticabile.
*Raccomandazione:* aggiungere frecce su/giù (o campo "posizione") come alternativa al drag; valutare sezioni collassabili; consentire lo spostamento di una voce tra categorie via "Modifica" (selettore categoria) invece che solo drag.

**P1-2 — Stato attivo/inattivo ambiguo e senza spiegazione dell'effetto pubblico.**
Lo switch è onnipresente (sezioni, categorie, item, turni, slide) ma non dice **cosa fa**. "Inattivo" = nascosto sul sito pubblico, ma da nessuna parte è scritto. Peggio: gli stati si **annidano** silenziosamente. Una voce con `is_active = true` dentro una categoria disattivata o una sezione disattivata **non comparirà sul sito**, ma nel backoffice resta verde/attiva. In `SectionCard` la sezione disattivata diventa `opacity-60` ma gli item dentro restano col loro switch acceso.
*Impatto:* il titolare attiva una voce, controlla il sito, non la vede, e non capisce perché (la sezione padre è spenta). Tempo perso, sfiducia nello strumento.
*Raccomandazione:* etichettare gli switch ("Visibile sul sito"); quando un contenitore è inattivo, segnalare visivamente che i figli sono nascosti "perché la sezione/categoria è disattivata"; tooltip che spieghi l'effetto pubblico.

**P1-3 — Immagini solo via URL.**
Ovunque (item, slide, OG image, settings) l'immagine è un campo `type="url"` con placeholder `https://…`. Un titolare non tecnico **non ha un URL** di un'immagine: ha una foto sul telefono. Senza upload, o non mette immagini o incolla link instabili (Google Photos, social) che si rompono. Nessuna anteprima dell'URL inserito, nessuna validazione che l'immagine esista/carichi.
*Impatto:* immagini mancanti o rotte sul sito pubblico; barriera reale per l'utente target.
*Raccomandazione:* upload diretto da file (con storage) + anteprima; nel frattempo, almeno un'anteprima live dell'URL incollato per intercettare i link rotti.

**P1-4 — Doppia voce di menu "Novità" e rotta `/novita` morta.**
La sidebar (`dashboard/layout.tsx`) punta a `/dashboard/news`. Ma esiste ancora `/dashboard/novita/page.tsx` che mostra "Sezione in arrivo (Sprint 5)". Se il titolare ci arriva (vecchio link, cronologia, digitando l'URL) vede una pagina placeholder che contraddice la sezione reale.
*Impatto:* confusione su quale sia la sezione vera. Minore, ma è debito che genera ticket di supporto.
*Raccomandazione:* rimuovere/redirezionare `/dashboard/novita` verso `/dashboard/news`.

**P1-5 — Conferma cancellazione prenotazione non dà via d'uscita né avvisa sul cliente.**
`DeleteBookingDialog` conferma con nome/data/turno (buono) ma il testo dice solo "non reversibile". Non chiarisce se la cancellazione **avvisa il cliente** (c'è una pipeline email dormiente nel repo) né offre alternative. Se l'azione fallisce mostra un errore inline, ma sul successo si chiude senza conferma (vedi nota trasversale sul feedback).
*Impatto:* esitazione su un'azione che riguarda un cliente reale; dubbio se il cliente verrà informato.
*Raccomandazione:* indicare esplicitamente se il cliente riceve notifica; toast di conferma "Prenotazione di X cancellata" dopo l'azione.

---

### P2 — Migliorie

- **P2-1 — Nessuna anteprima "come si vede sul sito".** Tutte le modifiche (menu, orari, novità, SEO) si propagano al sito pubblico senza un link "vedi sito" o anteprima. Il titolare edita alla cieca. Aggiungere un link al sito pubblico in ogni sezione.
- **P2-2 — Errori generici "Riprova".** Quasi tutte le `catch` ritornano messaggi generici (es. `menu/actions.ts` "Creazione item fallita. Riprova."). Non distinguono validazione da rete da permessi. Per l'utente è sempre lo stesso muro.
- **P2-3 — Validazione URL/prezzo poco guidata.** Il campo prezzo è un `number` grezzo; nessun aiuto su formato (virgola vs punto, l'utente italiano scrive "8,50"). L'`type="number"` può confondere su tastiere/locale. Considerare hint e tolleranza sull'input.
- **P2-4 — Allergeni: 14 checkbox in griglia 2 colonne** (`CreateItemDialog`/`EditItemDialog`), dentro un dialog scrollabile insieme a tutti gli altri campi. Su mobile diventa un form lungo. Accettabile, ma valutare raggruppamento o ricerca.
- **P2-5 — Densità della lista menu.** Nessun conteggio (es. "Pizze — 12 voci"), nessun collasso: a colpo d'occhio non si capisce la dimensione del menu. Aggiungere contatori e collasso per categoria/sezione.
- **P2-6 — Layout non verificato per mobile/tablet.** La sidebar è `w-56` fissa e le righe usano molte azioni affiancate (`flex ... gap-2` con 3 bottoni + switch in `CategoryRow`/`ItemRow`): su schermo stretto rischiano overflow/wrapping. Il brief dichiara uso da tablet/telefono: va testato esplicitamente.

---

### Il SINGOLO rischio più grave

**La gestione delle prenotazioni per una serata piena (P0-1 + P0-2 combinati).** È l'attività più frequente, fatta sotto pressione e in tempo reale, e tocca **clienti reali**. Oggi il gestore ha una tabella che: non mostra il telefono (dato presente nel DB ma non reso), non somma i coperti, non mostra la capienza del turno, e ordina le righe per UUID di turno mescolando le date. Il risultato è che, nel momento di massimo stress, lo strumento costringe a calcoli a mente e scansioni visive di una lista disordinata — terreno ideale per **cancellare la prenotazione sbagliata o non accorgersi di un sovraffollamento**.

*Come lo risolverei:* rifare la pagina Prenotazioni come **vista operativa della giornata**, non come elenco di record. Default sulla data odierna; sezioni per turno **in ordine di orario**, ciascuna con intestazione "coperti prenotati / capienza" (`covers` sommati vs `max_covers`); righe con **Nome, Telefono (cliccabile), Coperti, Note**, ordinate per orario/nome; ricerca per nome; e un toast di conferma esplicito ad ogni cancellazione che indichi se il cliente è stato avvisato. Sono quasi tutti dati già presenti: è soprattutto un problema di **resa e ordinamento**, quindi un intervento ad alto impatto e costo contenuto.

---

## Note del master (sintesi / azioni)

<!-- Dopo la risposta: cosa teniamo, cosa scartiamo, cosa diventa task. -->
