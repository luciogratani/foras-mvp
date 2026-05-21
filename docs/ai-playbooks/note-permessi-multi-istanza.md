---
status: DRAFT
updated: 2026-05-21
area: ai-playbooks
type: note
tags: [foras-mvp, ai-playbooks, permessi, multi-istanza, claude-code]
owner: master-chat
stato-decisione: RIMANDATO
---

# Nota — Automatizzare i permessi tra istanze master/slave

**Stato: rimandato** (deciso 2026-05-21). Appuntato per ripresa futura. Non blocca lo Sprint 5.

## Domanda originale (Lucio)

> Gestisco un sistema multi-istanza Claude Code con un master e più slave. Ogni volta che avvio una nuova sessione devo ripetere manualmente le stesse autorizzazioni su ogni istanza — inefficiente. Voglio automatizzarlo. Due approcci da esplorare:
>
> 1. **Script di avvio condiviso** — uno script bash che lancia Claude Code con le autorizzazioni già predefinite tramite flag (`--allowedTools`, `--dangerouslySkipPermissions`, ecc.), da distribuire su tutti gli slave.
> 2. **File `.claude/settings.json`** — un file nella root del progetto condiviso che definisce i permessi una volta sola e viene letto automaticamente da tutte le istanze.
>
> Quale è più adatta, o conviene combinarle?

## Analisi / raccomandazione (master)

**Verdetto:** `.claude/settings.json` come fondamento; script di avvio solo come complemento sottile (non per i permessi). **Evitare `--dangerouslySkipPermissions` come default.**

### Perché `settings.json` vince sui flag per i permessi
- **Dichiarativo e versionato:** committato una volta nella root condivisa, tutte le istanze che aprono il progetto lo leggono in automatico → zero ripetizione manuale (l'obiettivo).
- **Granulare:** tre liste — `allow`, `ask`, `deny` — con pattern per tool (es. `Bash(pnpm install)`, `Bash(pnpm -r exec tsc:*)`, `Read(...)`, `WebFetch`). I flag CLI (`--allowedTools`) duplicano questo ma in forma effimera, per-sessione, non condivisa, non tracciabile.
- **Gerarchia utile al caso master/slave:**
  - `.claude/settings.json` → committato, **source of truth condivisa** su tutti gli slave.
  - `.claude/settings.local.json` → gitignored, override per macchina/istanza.
  - `~/.claude/settings.json` → globale utente.

### Perché `--dangerouslySkipPermissions` è la scelta sbagliata qui
Bypassa ogni prompt (modalità YOLO). Gli slave eseguono codice reale (install, build, edit) e l'ambiente ha segreti veri (`.env.local`, `service_role`) e push verso `origin/main`. Darlo a tappeto **contraddice il modello trust-but-verify**: elimina il gate che si vuole mantenere. Ha senso solo in ambienti completamente sandboxati/effimeri (container usa-e-getta, senza segreti né git remoto).

### La sfumatura master/slave (punto chiave)
Il workflow stabilisce che **gli slave non committano** (lezione Sprint 3/4). Conviene **codificarlo nei permessi** invece di affidarlo alla disciplina:
- Slave: `deny` su `Bash(git commit:*)`, `Bash(git push:*)` → la regola di processo diventa vincolo tecnico, non convenzione violabile da una sub-chat.
- Master: `allow` più ampio (incluso commit); push comunque manuale di Lucio.

`--dangerouslySkipPermissions` è tutto-o-niente e non sa distinguere i ruoli; `settings.json` sì.

### Combinazione consigliata
1. **`.claude/settings.json` committato** = allowlist condivisa dei comandi ripetitivi e sicuri (`pnpm install`, `pnpm -r exec tsc --noEmit`, `pnpm --filter ... build/dev`, `git status/diff/log`, letture). Elimina ~il 90% dei prompt ripetuti.
2. **`.claude/settings.local.json` per ruolo** = il delta master vs slave (es. deny commit/push sugli slave).
3. **Script di avvio sottile (opzionale)** = solo per ciò che *non* è un permesso: `cd` nella cartella, `--model`, env vars, eventuale `--append-system-prompt` per ricordare a una sub-chat il suo ruolo. I permessi restano in `settings.json` (unica fonte di verità), non nei flag.

## Domande aperte da chiarire alla ripresa
1. **Gli slave girano sulla stessa macchina o su macchine/VPS diverse?** Se diverse, "distribuire su tutti gli slave" = sincronizzare `.claude/settings.json` via il repo stesso (ideale) o altro meccanismo.
2. **Master e slave condividono la stessa working copy o copie/worktree separati?** Se separati: `settings.local.json` è gitignored e non si propaga → va creato per-istanza (un piccolo script di bootstrap aiuta).
3. **Gli slave hanno accesso a segreti reali** (`.env.local`, `service_role`)? Se sì, `--dangerouslySkipPermissions` è escluso del tutto.

## Note operative
- L'istanza master ha lo skill `update-config`, pensato per scrivere/aggiornare `settings.json` (permessi inclusi) con la sintassi corretta delle regole — modo più sicuro per applicare quanto sopra senza sbagliare i pattern.
- Quando si riprende: rispondere alle 3 domande aperte, poi generare `.claude/settings.json` (condiviso) + template di `.claude/settings.local.json` per ruolo master/slave.
