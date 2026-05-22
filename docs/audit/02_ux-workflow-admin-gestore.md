---
status: todo
created: 2026-05-22
completed:
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

<!-- Incolla qui la risposta della chat esterna. Aggiorna status: done e completed: YYYY-MM-DD. -->

_(in attesa)_

---

## Note del master (sintesi / azioni)

<!-- Dopo la risposta: cosa teniamo, cosa scartiamo, cosa diventa task. -->
