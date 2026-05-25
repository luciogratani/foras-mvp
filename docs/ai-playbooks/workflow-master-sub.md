---
status: DRAFT
updated: 2026-05-19
area: ai-playbooks
type: workflow
tags: [foras-mvp, ai-playbooks]
owner: master-chat
---

# Workflow Master / Sub-chat

## Struttura

Il progetto usa un sistema a due livelli di chat AI:

**Master chat** — responsabile di:
- Scrivere i prompt per le sub-chat (file `.md` in `docs/ai-playbooks/prompts/`)
- Eseguire `git commit` dopo ogni sessione produttiva — **il `git push` solo su richiesta esplicita di Lucio**
- Aggiornare i file di documentazione ([[backlog]], [[roadmap-sviluppo]], [[decisioni]], [[README]], ecc.)
- Mantenere la coerenza tra documentazione e stato reale del codice
- Decidere lo scope di ogni sub-task prima di delegarlo

**Sub-chat** — responsabile di:
- Eseguire un singolo prompt scritto dal master
- Ricevere contesto esplicito (file rilevanti, decisioni architetturali, vincoli)
- Operare su uno scope ben delimitato (una feature, un file, un flusso)
- Segnalare ambiguità o decisioni impreviste senza procedere autonomamente

---

## Regole operative

### Per il master

- Ogni prompt va scritto come file `.md` autonomo in `docs/ai-playbooks/prompts/` prima di essere passato a una sub-chat.
- Un prompt deve contenere: contesto minimo necessario, scope esplicito, file rilevanti da leggere, output atteso, criteri di completamento.
- Per ogni prompt suggerisci un /model e /effort adeguati (Claude Code 2026.05)
- Dopo ogni sessione di sub-chat: commit + aggiornamento docs. Il push si fa solo quando Lucio lo chiede esplicitamente.
- Il master non delega decisioni architetturali — le prende e le documenta nel `decision-log/`.

### Per le sub-chat

- Leggere sempre i file indicati nel prompt prima di scrivere codice.
- Per problemi complessi: spezzare in sub-task espliciti e richiedere approvazione su quello ambiguo prima di procedere.
- Non introdurre dipendenze nuove non menzionate nel prompt senza segnalarlo.
- Non modificare file fuori dallo scope senza chiedere.

---

## Template prompt per sub-chat

```markdown
## Contesto

[2-3 righe sul progetto e sul perché questo task esiste]

## File da leggere prima di iniziare

- `docs/tech-architecture/architettura-fullstack.md` — [sezione rilevante]
- `docs/tech-architecture/data-model.md` — [sezione rilevante]
- [altri file specifici per il task]

## Scope

[Descrizione precisa di cosa fare — una feature, un file, un flusso]

## Vincoli

- [Vincolo 1 — es. "nessuna query DB diretta nei componenti UI"]
- [Vincolo 2 — es. "usare i tipi in `packages/supabase/src/types/database.ts` (hand-edit, NON la Supabase CLI), non scrivere tipi a mano nei componenti"]

## Output atteso

- [File da creare o modificare]
- [Comportamento verificabile]

## Done when

- [Criterio 1]
- [Criterio 2]
```

---

## Cartella prompts

I prompt scritti dal master vivono in `docs/ai-playbooks/prompts/`. Ogni file segue il naming:

```
YYYY-MM-DD_[fase]_[descrizione-breve].md
```

Esempi:
```
2026-05-20_phase1_data-baseline.md
2026-05-21_phase2_service-layer-menu.md
2026-05-23_phase3_homepage-ssr.md
```

I prompt eseguiti vengono marcati con `status: DONE` nel frontmatter — non eliminati.

---

## Commit convention

Il master usa commit convenzionali con scope:

```
feat(menu): add getMenuBySection service
fix(rls): correct bookings insert policy
docs(backlog): update sprint 1 done criteria
chore(deps): add @dnd-kit/core to admin
```

Un commit per sessione di sub-chat completata, non un commit per file.
