---
status: todo
created: 2026-05-22
completed:
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

<!-- Incolla qui la risposta della chat esterna. Aggiorna status: done e completed: YYYY-MM-DD. -->

_(in attesa)_

---

## Note del master (sintesi / azioni)

<!-- Dopo la risposta: cosa teniamo, cosa scartiamo, cosa diventa task. -->
