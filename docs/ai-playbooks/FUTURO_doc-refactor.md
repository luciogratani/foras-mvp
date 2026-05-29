---
status: TODO
updated: 2026-05-29
area: ai-playbooks
type: tech-debt
owner: master-chat
---

# FUTURO — Refactor del sistema documentale (interventi strutturali)

> **Origine.** Valutazione strutturale della documentazione eseguita il 2026-05-29
> (sub-chat opus/high) + confronto del master. Verdetto: doc *parzialmente efficace,
> non efficiente*. Rischio #1: lo **stato vivo è replicato su 5+ superfici senza una
> SSOT dichiarata**, con divergenze già materializzate. I **quick win** (P1 MEMORY,
> P2 CHANGELOG/runbook, fase-attuale README, date frontmatter) sono **già fatti**
> (commit `8a3fa84` + allineamenti precedenti). Restano gli **interventi strutturali**
> qui sotto — sono il fix di *fondo*, i quick win curavano solo i sintomi.

## Tesi di fondo (master + sub-chat concordi)

Manca la separazione netta tra **stato vivo** ("cosa è vero ORA") e **record storico**
("perché / com'è andato"). La provenienza (`decisioni.md`, gotcha, commit linkati) è un
valore del progetto e va **preservata intatta**: il problema NON è la disciplina, è la
**diramazione dello stato vivo** su backlog + memory + audit + handoff + prompts/README,
senza un documento canonico e senza una gerarchia di autorità dichiarata.

## Interventi (prioritizzati)

### S1 — `docs/STATUS.md` canonico (il fix di fondo, disinnesca P1/P3)
- **Problema:** non esiste un "stato corrente" autorevole. La mappa di onboarding per il
  master vive solo dentro `HANDOFF_next-master.md` (status `CONSUMED`/storico). Lo stato
  datato è sparso tra `MEMORY.md`, i tail dei `project_*.md`, `backlog.md`, `audit/04b_*.md`.
- **Proposta:** UN file `docs/STATUS.md` con: fase attuale · ultimo evento · prossimo passo
  · i 2-3 link da aprire. Unico file con stato datato in `docs/`, aggiornato a ogni sessione.
  Dichiarare nel `README` la **gerarchia di autorità**: stato vivo = `STATUS.md`; elenco
  migrazioni = `CHANGELOG.md`; decisioni = `decision-log`; la auto-memory NON è autorevole
  sullo stato, solo sui puntatori.
- **Effort:** ~45 min struttura + disciplina continua.
- **Rischio se non fatto:** ogni nuova master paga onboarding alto e rischia di partire da
  un handoff storico; le copie di stato continuano a divergere (è già successo: P1).

### S2 — Separare living/historical nel backlog (P4)
- **Problema:** `backlog.md` è ~482 righe che mescolano backlog futuro e cronaca di sprint
  chiusi (commit, smoke, gotcha). ~360 righe di storico prima dei ~2 item vivi (Stream C).
- **Proposta:** spostare sprint/intermezzi chiusi in `backlog-archive.md`; in `backlog.md`
  solo item aperti + indice storico (1 riga/sprint con link). Regola: **i file/sezioni
  `DONE` non ricevono nuovi item vivi** (oggi i punti N/E sono finiti in un doc `done`).
- **Effort:** ~1–1.5 h (taglia-incolla con cura sui wikilink).
- **Rischio se non fatto:** costo di lettura cresce a ogni sprint; gli item che contano
  restano sepolti.

### S3 — Comprimere `memory/project_sprint2_state.md` (P5)
- **Problema:** 35 KB (il file di memoria più grande, caricato a ogni sessione), nome
  fuorviante ("sprint2" ma copre 0→A4), duplica la cronaca di `backlog.md`/`decisioni.md`.
- **Proposta:** ridurre a puntatore ("Sprint 0→A4 chiusi — dettaglio in backlog/decisioni;
  stato vivo in STATUS.md"); tenere in memoria solo ciò che NON è nei doc di repo. Rinominare.
- **Effort:** ~30 min.
- **Rischio se non fatto:** costo token ricorrente per info duplicata/in parte stale.

### S4 — Verificare i sospetti duplicati SSOT (roadmap/runbook)
- **Problema (INFERENZA da verificare):** `backlog.md` / `roadmap-sviluppo.md` /
  `runbook-implementazione.md` manterrebbero in parallelo la stessa progressione sprint/fase
  (il backlog confessa di essersi dovuto "riallineare", righe 18/81). Le date `updated:` di
  roadmap/runbook sono ferme (non bumpate nei quick win proprio perché non verificate).
- **Proposta:** confronto riga-per-riga; eleggere una sola fonte per la progressione e far
  sì che le altre due la citino invece di replicarla. Poi allineare le date frontmatter.
- **Effort:** ~1 h (analisi) + variabile (fix).
- **Rischio se non fatto:** tre copie della stessa progressione che driftano.

## Mappa minima target (post-refactor)

Una master fresca dovrebbe orientarsi con **3 doc**: `STATUS.md` (stato vivo) +
`decisioni.md` (il perché, lasciare com'è) + `backlog.md` ripulito (cosa fare). Oggi servono
~2.000+ righe su 7+ file, col percorso "giusto" descritto in un file `CONSUMED`.

## Pointer
- Dettaglio completo della valutazione: nel corpo di questa sessione (master chat 2026-05-29).
- Quick win già applicati: commit `8a3fa84`.
- Convenzione `FUTURO_*`: stub di lavoro differito, si esegue quando il master decide.
