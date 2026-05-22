---
status: DRAFT
updated: 2026-05-22
area: audit
type: index
tags: [foras-mvp, audit]
owner: master-chat
---

# Audit — consulenze esterne a occhio fresco

Prompt pensati per essere dati a **chat potenti esterne al progetto** (che non hanno contesto su foras), per far guardare un aspetto specifico con occhio fresco e indipendente. Non sono prompt per sub-chat che scrivono codice: sono consulenze.

## Convenzione

- **Un file `.md` per audit**, con prompt e risposta **nello stesso file** (per evitare affollamento).
- Frontmatter: `status` (`todo` / `done`), `created`, `completed`.
- Struttura: *Come usarlo* → *Prompt per la chat esterna* (self-contained, paste-ready) → *Risposta* (da incollare) → *Note del master*.
- Le chat esterne non vedono il repo: ogni prompt dice quali materiali allegare (screenshot, URL, doc) e di chiedere se mancano.

## Indice

| # | Audit | Status | Creato | Svolto |
|---|---|---|---|---|
| 01 | [UX & conversione funnel prenotazione (sito pubblico)](01_ux-funnel-prenotazione-web.md) | todo | 2026-05-22 | — |
| 02 | [UX & workflow operativo backoffice (gestore)](02_ux-workflow-admin-gestore.md) | todo | 2026-05-22 | — |
| 03 | [Fit modello dati ↔ realtà operativa bar](03_fit-modello-dati-realta-bar.md) | todo | 2026-05-22 | — |

Aggiornare lo `status` qui e nel frontmatter del file quando un audit viene svolto.
