---
status: done
created: 2026-05-22
completed: 2026-05-22
type: audit
area: audit
target: external-chat
topic: fit-modello-dati-realta-bar
owner: master-chat
---

# Audit 03 — Fit del modello dati con la realtà operativa dei bar/ristoranti

> **A cosa serve.** Far validare da una chat esterna se il modello dati rispecchia come operano *davvero* i locali, **prima** di congelare il template. Una volta congelato, ogni modifica allo schema diventa una migrazione su ogni cliente: trovare le lacune ora vale molto.
>
> **Come usarlo.** Apri una chat nuova (modello potente, esterno al progetto) e incolla il prompt. È self-contained (il modello è descritto dentro), ma puoi anche allegare `docs/tech-architecture/data-model.md` e `docs/product-scope/mvp.md`. Incolla la risposta sotto e aggiorna `status` + `completed`.
>
> **Nota metodologica:** il prompt chiede deliberatamente di ragionare *prima* dalla realtà operativa e *poi* di giudicare il modello — senza farsi guidare da ipotesi nostre. Se vuoi un giudizio davvero indipendente, NON anticipare alla chat le mini-implementazioni che hai già in mente.

---

## Prompt per la chat esterna

```
Agisci come un esperto di operatività di bar/caffè/ristoranti (specialmente realtà
italiane e locali) che ha anche progettato sistemi di prenotazione e gestione menu.
Voglio un'analisi indipendente e concreta, non rassicurazioni.

METODO (importante)
Prima ragiona, in autonomia, su come operano realmente questi locali: come strutturano
il menu e i listini, come gestiscono le prenotazioni e la capienza, come organizzano
orari e turni, casi stagionali ed eccezioni. SOLO DOPO confronta questa realtà con il
modello dati qui sotto e segnala dove si rompe o costringe a soluzioni goffe. Non
limitarti a confermare il modello: cercane attivamente i punti ciechi.

CONTESTO
- "foras" è un template multi-tenant: genera il sito (pubblico + backoffice) di un
  singolo bar/ristorante. Il template sta per essere "congelato": dopo, cambiare lo
  schema dati significa migrare ogni cliente esistente. Quindi le lacune vanno trovate ORA.

MODELLO DATI ATTUALE (da valutare)
- Menu: gerarchia fissa a 3 livelli Sezione → Categoria → Voce.
  - Sezioni: 6 predefinite (Colazione, Pranzo, Aperitivo, Cena, Cocktail, Carta dei
    vini), rinominabili e attivabili/disattivabili, ma non se ne possono creare di nuove.
  - Voce: nome, descrizione, UN prezzo (numerico), allergeni, immagine, attivo/non attivo.
  - Nessuna variante (es. taglie, latte vegetale): se serve un prezzo diverso si crea
    una voce separata.
  - Nessun concetto di "formula"/menu fisso/bundle (es. "colazione: caffè + brioche a
    prezzo unico").
  - Allergeni: i 14 obbligatori per legge UE, fissi, uguali per tutti.
- Prenotazioni:
  - Turni a orario fisso (es. "Pranzo 12:30", "Cena 20:00"), ognuno con una capienza
    massima di coperti.
  - Una prenotazione = data + turno + n. coperti + dati cliente. Conferma automatica
    se ci sono coperti disponibili nel turno, altrimenti rifiuto.
  - Niente orario di prenotazione "libero" tra i turni; niente gestione a livello di
    singolo tavolo; una sola prenotazione per stessa email/turno/data.
- Orari di apertura: per ogni giorno della settimana, UNA fascia apertura→chiusura
  oppure "chiuso".

COSA VOGLIO DA TE
- Dove questo modello NON regge la realtà operativa? Pensa ad esempi concreti: orari
  spezzati (es. pranzo e poi cena con chiusura pomeridiana), prenotazioni a orari non
  coincidenti coi turni, menu fissi/formule, listini stagionali, eventi, gruppi grandi,
  ecc. — ma soprattutto i casi a cui io non sto pensando.
- Per ogni lacuna: lo scenario reale, come il modello la gestisce oggi (o non la
  gestisce / che workaround impone), l'impatto sul gestore o sul cliente finale.
- Classifica ogni lacuna per (probabilità che un locale reale la incontri) × (costo di
  risolverla DOPO il freeze). Dimmi chiaramente quali andrebbero risolte PRIMA del
  congelamento e quali possono aspettare.

FUORI SCOPO
- Implementazione tecnica, scelte di stack, UX visuale.

Se ti serve un chiarimento sul modello prima di rispondere, chiedi.
```

---

## Risposta

### Premessa metodologica — come operano davvero questi locali

Prima di giudicare il modello, fisso la realtà operativa di un bar/ristorante italiano "medio", perché è lì che il template vivrà.

**Menu e listini.** Il listino reale non è un albero pulito. Ha:
- prodotti con prezzo unico (un Negroni), ma anche prodotti con **lo stesso nome e prezzi diversi** a seconda di una scelta minima: caffè al banco vs. al tavolo, acqua piccola/grande, birra 0,2/0,4/media, pizza margherita/+ ingrediente, latte vegetale +0,40. È la norma, non l'eccezione, soprattutto nei bar.
- **formule e menu fissi**: "colazione 1,90", "menu pranzo 12 €", "aperitivo con un drink + buffet", "menù degustazione". Sono la voce a maggior margine e quella che il gestore vuole spingere.
- voci che cambiano **a seconda dell'ora/giorno**: lo stesso locale è bar la mattina, trattoria a pranzo, cocktail bar la sera. Il "menu aperitivo" esiste solo dalle 18 alle 21.
- **listini stagionali / del giorno**: la carta cambia con le stagioni, e c'è quasi sempre uno "specials" giornaliero o lavagna ("oggi: …").
- prezzi che esistono **solo in certi momenti** (coperto, servizio, supplemento weekend) — meno rilevante per un menù vetrina, ma esiste.

**Prenotazioni e capienza.** Quasi nessun ristorante italiano lavora a "seduta unica a orario fisso". La realtà è:
- arrivi **scaglionati** su una fascia ("ceniamo, arriviamo verso le 20:30") con turnazione del tavolo (lo stesso tavolo serve due coperti diversi nella stessa sera).
- capienza che **non è un numero unico**: dipende da quanti tavoli, da quante persone per tavolo, dal dehors (che con la pioggia sparisce), e da quanto la cucina riesce a smaltire in contemporanea (pacing).
- **gruppi grandi** trattati a parte (telefonata, acconto, menù concordato), non come una prenotazione web normale.
- la prenotazione spesso **non porta una sola persona**: due famiglie diverse possono prenotare per la stessa sera con la stessa email (es. un dipendente che prenota per più clienti), o la stessa persona prenota pranzo e cena.

**Orari e turni.** L'orario spezzato è lo standard italiano: aperto 12–15, chiuso il pomeriggio, riaperto 19–24. La domenica spesso "solo pranzo". E poi: **chiusura settimanale** (il lunedì), **ferie** (due settimane ad agosto o a gennaio), **festività** e **giorni speciali** (Capodanno, San Valentino, una serata privata).

Tengo questa realtà come metro. Sotto, dove il modello si rompe.

---

### Le lacune, in ordine di gravità

Per ogni lacuna: scenario reale → cosa fa il modello oggi → impatto → giudizio (probabilità × costo-dopo-il-freeze).

Legenda costo-dopo: una modifica è **economica** se aggiunge una tabella/colonna *opzionale* senza toccare i dati esistenti (i clienti già onboardati continuano a funzionare con i default). È **costosa** se cambia la semantica di campi già popolati, le chiavi/constraint, o richiede di reinterpretare dati di prenotazione già raccolti.

---

#### 1. Orari di apertura spezzati (pranzo + cena, pomeriggio chiuso)

- **Scenario.** Trattoria aperta 12:00–15:00 e 19:00–23:00, chiusa il pomeriggio. È il caso *maggioritario* in Italia per i ristoranti, e frequente anche per i bar (chiusura pomeridiana).
- **Cosa fa il modello.** `opening_hours` ammette **una sola** coppia `open`/`close` per giorno. Per dire "12–15 e 19–23" non c'è modo. I workaround sono entrambi sbagliati: o scrivi "12:00–23:00" (falso: dice al cliente che sei aperto alle 17), oppure scegli una sola fascia (nascondi l'altra). Non esiste una terza opzione corretta.
- **Impatto.** Cliente finale: informazione **errata** sull'orario in homepage → telefonate, clienti che si presentano a porta chiusa, recensioni infastidite. Per il gestore è una bugia sul suo stesso sito.
- **Giudizio.** Probabilità ALTISSIMA (è la regola, non l'eccezione) × costo-dopo MEDIO (è un JSONB, quindi tecnicamente migrabile, ma la struttura è già documentata come "chiavi fisse, una coppia open/close" e va riscritta sia la struttura sia il form sia il rendering homepage, e i dati esistenti vanno trasformati). **→ RISOLVERE PRIMA DEL FREEZE.** È la lacuna numero uno: tocca *ogni* cliente e produce informazioni false. Il fix è contenuto: rendere `open`/`close` un **array di fasce** per giorno (anche solo 1–2 fasce). Cambiare un JSONB a vetrina è infinitamente più economico ora che dopo, quando ogni cliente avrà i suoi orari salvati nel vecchio formato.

#### 2. Eccezioni di calendario: chiusure straordinarie, ferie, festività, giorni speciali

- **Scenario.** "Chiuso dal 10 al 24 agosto", "Chiuso il 25 dicembre", "Lunedì di Pasqua aperto solo a pranzo", "Stasera serata privata". Universale.
- **Cosa fa il modello.** Nulla. `opening_hours` è **settimanale ricorrente puro**: non esiste il concetto di data-eccezione. Il gestore può solo modificare manualmente l'orario settimanale e poi ricordarsi di ripristinarlo (errore garantito), oppure non comunicare la chiusura.
- **Effetto collaterale grave sulle prenotazioni.** Non c'è modo di **chiudere le prenotazioni** per una data specifica. Se sei chiuso per ferie il 15 agosto ma i `time_slots` sono attivi, il sito **accetta prenotazioni** per un giorno in cui sei chiuso. Conferma automatica → il cliente riceve una conferma valida per una serata a porte chiuse. Questo è un danno reale, non cosmetico.
- **Impatto.** Gestore: deve presidiare manualmente, e comunque non può bloccare un singolo giorno. Cliente: prenotazione confermata per un giorno di chiusura.
- **Giudizio.** Probabilità ALTISSIMA × costo-dopo MEDIO-ALTO (richiede una nuova entità "date eccezione/chiusure" che interagisce con la logica di disponibilità delle prenotazioni — cioè con la conferma automatica, che è il cuore del sistema). **→ RISOLVERE PRIMA DEL FREEZE**, almeno nella forma minima: una tabella di **date di chiusura** (data → chiuso) che (a) sovrascrive gli orari in homepage e (b) **blocca le prenotazioni** per quella data. Senza questo, la conferma automatica genera conferme false. È la seconda priorità, strettamente legata al fatto che il sistema prenota da solo.

#### 3. Formule / menu fissi / bundle a prezzo unico

- **Scenario.** "Menu pranzo 12 € (primo + secondo + acqua)", "Colazione 1,90 (caffè + brioche)", "Aperitivo 10 € (drink + buffet)". È spesso la voce più venduta e quella con cui il locale si presenta.
- **Cosa fa il modello.** Il data-model lo ammette esplicitamente come "Nota aperta": non è rappresentabile. Workaround: creare un `menu_item` chiamato "Menu pranzo" con prezzo 12 e descrizione testuale del contenuto. **Funziona** come vetrina (è solo display, non un ordine), ma: il contenuto resta testo libero non strutturato, non si lega ai prodotti reali, e gli **allergeni del bundle** non sono derivabili (un menù fisso che contiene 4 piatti dovrebbe esporre l'unione dei loro allergeni — qui no).
- **Impatto.** Per una **vetrina** (no ordini online) l'impatto è BASSO: l'item-con-descrizione regge per il 90% dei casi. Il limite è la perdita di struttura e l'allergene del bundle.
- **Giudizio.** Probabilità ALTA × costo-dopo BASSO (un bundle si può modellare *dopo* come tabella aggiuntiva senza toccare gli item esistenti: i menu fissi pre-freeze restano item-con-descrizione, quelli nuovi usano la struttura). Dato che il prodotto è una vetrina e non un sistema d'ordine, il workaround non produce dati *falsi* (a differenza di orari e prenotazioni). **→ PUÒ ASPETTARE.** Documentare il workaround "item con prezzo + descrizione" come pattern ufficiale per l'onboarding.

#### 4. Varianti / supplementi sullo stesso prodotto

- **Scenario.** Acqua piccola/grande, birra 0,2/0,4/media, latte vegetale +0,40, "+ ingrediente sulla pizza". Onnipresente nei bar.
- **Cosa fa il modello.** Esplicitamente: si crea un **item separato** per ogni prezzo. "Caffè" e "Caffè latte di soia" diventano due voci. "Birra 0,2 / 0,4 / media" diventano tre voci.
- **Impatto.** In **vetrina** è accettabile ma genera liste lunghe e ripetitive ("Coca piccola / Coca media / Coca lattina"), e l'allergene va ribattuto su ogni variante. Fastidio di data-entry per il gestore e menu meno leggibile per il cliente, ma niente di *falso*.
- **Giudizio.** Probabilità ALTA × costo-dopo BASSO (le varianti si possono introdurre dopo come tabella figlia opzionale; gli item-variante creati prima restano validi). **→ PUÒ ASPETTARE.** È il classico caso "item separati coprono il caso d'uso" che per una vetrina è una scelta legittima. Solo da documentare bene in onboarding perché impatta il data-entry.

#### 5. Capienza prenotazioni: il "turno a orario fisso" non è come si prenota in Italia

Questa è la lacuna concettualmente più sottile e va guardata bene, perché il committente la considera già "decisa" ma nasconde tre problemi distinti.

- **5a — Capienza per turno vs. capienza nel tempo.** Il modello ha `max_covers` per turno. Ma "Cena ore 20:00, 40 coperti" significa che dalle 20 in poi accetti 40 persone *totali per quella sera*? In un ristorante reale lo stesso tavolo gira: 40 coperti alle 20 + altri 30 alle 22 = 70 nella serata. Il modello non distingue tra "40 in contemporanea" e "40 nell'intera serata". Se il gestore intende il primo, perde metà della capacità della sala; se intende il secondo, può accettare 40 persone tutte alle 20 e mandare in tilt la cucina. **Il significato di `max_covers` è ambiguo e dipende da come il singolo gestore lo interpreta.**
- **5b — Orario fisso vs. arrivo reale.** "Cena 20:00" è l'unico orario prenotabile. Ma il cliente vuole prenotare "per le 21:00" o "per le 19:30". Il modello lo costringe a scegliere "Cena 20:00" anche se arriverà alle 21:30. Il gestore riceve quindi prenotazioni tutte etichettate "20:00" senza sapere la distribuzione reale degli arrivi → non può organizzare la sala. Workaround: il cliente scrive l'ora vera nelle `notes` (testo libero, non leggibile dal sistema, ignorato dal conteggio coperti).
- **5c — Più turni nello stesso slot orario.** Si può creare più di un `time_slot` ("Cena 19:30", "Cena 21:30") per simulare la turnazione, e questo aiuta. Ma resta gestione a "scatti" rigidi, non a fascia.
- **Impatto.** Gestore: rischia sovra/sotto-prenotazione perché la capacità è modellata male rispetto a come lavora davvero la sala. Cliente: non può indicare l'orario che vuole.
- **Giudizio.** Probabilità ALTA (qualsiasi ristorante con servizio serale serio) × costo-dopo ALTO (toccare la semantica di `time_slots`/`bookings` e la **logica di conferma automatica** — il cuore del sistema — dopo aver già raccolto prenotazioni significa migrare dati transazionali, non vetrina). **→ DECISIONE ESPLICITA PRIMA DEL FREEZE.** Non dico necessariamente di costruire la prenotazione a fascia oraria (può essere legittimamente fuori MVP per locali piccoli), ma di **decidere e documentare cosa significa `max_covers`** e di valutare *almeno* un campo "orario richiesto dal cliente" libero, perché aggiungere semantica a `bookings` dopo è costoso. Il rischio è scoprire dopo il freeze che il modello a turni fissi non serve la fascia di ristoranti che si vuole acquisire. Va chiarito *per chi* è pensato (più adatto a osterie/pizzerie a seduta unica che a ristoranti con turnazione fine).

#### 6. Vincolo UNIQUE (email, turno, data) — troppo aggressivo

- **Scenario.** (a) Due persone diverse prenotano dalla stessa email (un cliente senza email personale che usa quella del bar/hotel, un assistente che prenota per più persone, due coppie di amici). (b) La stessa persona prenota *due tavoli* per la stessa sera (festa divisa su due gruppi). Entrambi reali, anche se non quotidiani.
- **Cosa fa il modello.** Il DB **rifiuta** la seconda prenotazione con lo stesso `(email, time_slot_id, date)`. È pensato come rate-limiting anti-spam, e per quello va bene; ma blocca anche casi legittimi.
- **Impatto.** Cliente: prenotazione legittima rifiutata senza una spiegazione comprensibile ("hai già prenotato"). Gestore: perde la prenotazione e non lo sa.
- **Giudizio.** Probabilità MEDIA × costo-dopo BASSO (rilassare un UNIQUE constraint è una migrazione banale e non distrugge dati; semmai si sostituisce con un rate-limit applicativo). **→ PUÒ ASPETTARE**, ma è un fix talmente economico che conviene **ripensarlo ora** mentre si è in tema: valutare se il rate-limiting debba essere su un orizzonte temporale (es. max N prenotazioni da quell'email nelle ultime 24h) anziché un divieto assoluto per turno/data.

#### 7. Sezioni menu non creabili + tetto a 6 — e la "stessa carta tutto il giorno"

- **Scenario.** Le 6 sezioni predefinite (Colazione, Pranzo, Aperitivo, Cena, Cocktail, Carta dei vini) sono rinominabili ma non se ne creano di nuove. Casi reali che escono dal recinto: una **gelateria/pasticceria** ("Gelati", "Torte", "Caffetteria"), una **birreria** con 30 birre alla spina ("Spine", "Bottiglie"), un locale che vuole "Distillati", "Dolci", "Brunch", "Senza glutine", "Bambini". Sei nomi rinominabili coprono molti casi ma non tutti, e comunque il *numero* è il limite vero: chi ha bisogno di 7-8 sezioni non può.
- **Cosa fa il modello.** Si rinomina una sezione esistente (es. "Cocktail" → "Distillati") finché bastano gli slot. Oltre 6 macro-aree, o se servono più sezioni di quelle previste, non c'è spazio: si comprime tutto nelle categorie.
- **Impatto.** Gestore: per certi tipi di locale (gelaterie, birrerie, pasticcerie, bistrot ibridi) il menu va forzato dentro una struttura pensata per un bar-ristorante classico. Vetrina meno fedele.
- **Giudizio.** Probabilità MEDIA × costo-dopo BASSO (consentire la creazione di sezioni è togliere un vincolo, non cambiare lo schema: `menu_sections` è già una tabella propria con `name`/`position`/`is_active` — basta permettere l'INSERT dal backoffice). **→ PUÒ ASPETTARE / quasi gratis.** Il vincolo "non creabili" è una scelta di prodotto, non una limitazione di schema: si può rilassare in qualsiasi momento senza migrazione. Vale però la pena chiedersi *perché* limitarlo, dato che la tabella già lo supporta.

#### 8. "Menu del giorno" / specials / lavagna

- **Scenario.** "Piatti del giorno", lavagna, specialità che cambiano ogni giorno o ogni settimana.
- **Cosa fa il modello.** Si usa una categoria "Specialità" e si attivano/disattivano gli item con `is_active`. Funziona ma è gestione manuale quotidiana (il gestore deve ricordarsi di spegnere il piatto di ieri).
- **Impatto.** Basso, gestibile col flag. Più un fastidio operativo che una rottura.
- **Giudizio.** Probabilità MEDIA × costo-dopo BASSO. **→ PUÒ ASPETTARE.** `is_active` è un workaround accettabile per una vetrina.

#### 9. `is_active` sovraccarico: "fuori stagione" ≠ "esaurito" ≠ "nascosto"

- **Scenario.** Il data-model dice esplicitamente che `is_active` copre sia "fuori stagione" sia "esaurito". Ma sono cose diverse: "esaurito" è temporaneo (torna domani), "fuori stagione" è lungo, "nascosto" è una scelta. Accorparli significa che il gestore, per dire "finito il polpo stasera", lo disattiva e poi *deve ricordarsi* di riattivarlo.
- **Impatto.** Basso, operativo. Nessun dato falso, solo attrito.
- **Giudizio.** Probabilità BASSA-MEDIA × costo-dopo BASSO. **→ PUÒ ASPETTARE.** Non vale una colonna in più nell'MVP.

#### 10. Gruppi grandi / eventi privati

- **Scenario.** Tavolata da 25, evento privato, cena aziendale. Il gestore li tratta a parte (telefono, acconto, menù concordato).
- **Cosa fa il modello.** Una prenotazione web da 25 coperti, se c'è capienza, viene **confermata automaticamente** senza filtro. Molti locali vogliono invece *intercettare* i gruppi grandi prima di confermarli.
- **Impatto.** Gestore: si trova confermata in automatico una tavolata enorme che avrebbe voluto gestire a mano (o che svuota un turno intero in un colpo).
- **Giudizio.** Probabilità MEDIA × costo-dopo BASSO (basterebbe in futuro una soglia "oltre N coperti → richiesta da confermare a mano", ma esula dalla conferma-automatica dell'MVP). **→ PUÒ ASPETTARE**, però è bene **dirlo al gestore in onboarding**: imposta `max_covers` consapevolmente e sappi che una singola prenotazione può prenderne una grossa fetta.

---

### Sintesi e raccomandazione di freeze

Il modello è ben fatto **per una vetrina di un bar-ristorante classico a seduta semplice**. Si rompe in due punti dove produce *informazioni false* (non semplice scomodità), e quei due punti riguardano dati che dopo il freeze diventano costosi da toccare perché entrano nella logica di prenotazione automatica.

**Discriminante chiave:** distinguere le lacune *vetrina* (workaround innocuo, l'utente vede solo un menu un po' goffo) dalle lacune *transazionali/informative* (il sito dice il falso o conferma prenotazioni impossibili). Le prime aspettano. Le seconde no.

**DA RISOLVERE PRIMA DEL FREEZE**

1. **Orari spezzati** (#1) — prob. ALTISSIMA × costo MEDIO. Una sola fascia open/close per giorno è insufficiente per lo standard italiano; produce orari falsi in homepage. Rendere `opening_hours` ad array di fasce.
2. **Date di chiusura/eccezione** (#2) — prob. ALTISSIMA × costo MEDIO-ALTO. Senza, il sito accetta prenotazioni in giorni di chiusura (ferie/festività) e mostra orari sbagliati. Serve almeno una tabella di date-chiuse che blocchi le prenotazioni.
3. **Semantica capienza/turni prenotazioni** (#5) — prob. ALTA × costo ALTO. Decidere e documentare cosa significa `max_covers` (contemporanei vs. serata) e valutare un campo "orario richiesto"; chiarire per quale tipo di locale è pensato. È più una *decisione esplicita da blindare ora* che codice obbligatorio.

**DA DECIDERE ORA PERCHÉ QUASI GRATIS (ma rinviabili)**

4. **UNIQUE (email,turno,data)** (#6) — prob. MEDIA × costo BASSO. Rilassare il constraint o trasformarlo in rate-limit temporale: ripensarlo finché si è in tema costa nulla.
5. **Sezioni menu creabili / oltre 6** (#7) — prob. MEDIA × costo BASSO. La tabella già lo supporta; è solo un vincolo di prodotto da rivedere.

**POSSONO ASPETTARE (workaround accettabili per una vetrina, costo-dopo basso)**

- **Formule/bundle** (#3) — prob. ALTA × costo BASSO → item con prezzo + descrizione; documentare il pattern.
- **Varianti/supplementi** (#4) — prob. ALTA × costo BASSO → item separati; documentare in onboarding.
- **Menu del giorno/specials** (#8), **`is_active` sovraccarico** (#9), **gruppi grandi/eventi** (#10) — gestibili con i flag esistenti e con avvertenze in onboarding.

**Avvertenza finale.** Le tre voci "da risolvere prima" hanno in comune che riguardano *orari* e *prenotazioni*, cioè le due aree dove il sito agisce in autonomia verso il cliente (mostra orari, conferma prenotazioni). Sono anche le aree dove i dati post-freeze sono più costosi da migrare. Le lacune del menu, invece, sono quasi tutte rinviabili perché il menu è display puro: un workaround goffo lì non mente a nessuno. Se si deve scegliere dove spendere prima del freeze, va speso su orari e prenotazioni, non sul menu.

---

## Note del master (sintesi / azioni)

<!-- Dopo la risposta: confrontare con gli appunti privati (turni spezzati, orario custom, bundle);
     decidere cosa entra PRIMA del freeze. -->
