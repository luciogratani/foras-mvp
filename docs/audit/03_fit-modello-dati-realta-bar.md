---
status: todo
created: 2026-05-22
completed:
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

<!-- Incolla qui la risposta della chat esterna. Aggiorna status: done e completed: YYYY-MM-DD. -->

_(in attesa)_

---

## Note del master (sintesi / azioni)

<!-- Dopo la risposta: confrontare con gli appunti privati (turni spezzati, orario custom, bundle);
     decidere cosa entra PRIMA del freeze. -->
