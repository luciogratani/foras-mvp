# Struttura cartelle — docs foras-mvp

## Struttura proposta

```
docs/
├── README.md
│
├── tech-architecture/
│   ├── architettura-fullstack.md
│   ├── data-model.md
│   └── monorepo-structure.md          ← da scrivere
│
├── product-scope/
│   ├── mvp.md                         ← da scrivere
│   └── post-mvp.md                    ← da scrivere
│
├── decision-log/
│   └── decisioni.md
│
├── operations/
│   ├── onboarding-tenant.md           ← da scrivere
│   └── migration-runbook.md           ← da scrivere
│
└── archive/
    ├── architettura-progetto-bar-v-0-3.md
    └── menu-data-structure.md
```

---

## Decisioni

**`archive/` invece di rinominare i file esistenti.**
I due file allegati restano in archive così com'erano — nessuna modifica, nessun merge forzato. I file in `tech-architecture/` partono da zero e incorporano solo ciò che è ancora valido, con una struttura più pulita. L'archive è leggibile e consultabile, non è un cestino.

**`decision-log/` separato da `tech-architecture/`.**
Le decisioni in questo progetto non riguardano solo il tech: alcune toccano scope, operatività, scala. Tenerle in una cartella autonoma evita che crescano dentro l'architettura e permette di aggiungere voci indipendentemente dal file a cui si riferiscono. Per ora un file piatto (`decisioni.md`) è sufficiente — nessun ADR formale.

**`operations/` con due file distinti.**
Onboarding e migrazioni hanno cicli di vita diversi: il runbook delle migrazioni si aggiorna ad ogni modifica di schema, il playbook di onboarding si aggiorna solo quando cambia la procedura di setup. Tenerli separati evita un file che cresce in due direzioni.

**`product-scope/` separato dall'architettura.**
Le decisioni di scope (cosa è dentro, cosa è fuori, cosa è rimandato) rischiano di accumularsi nei file tecnici. Una cartella dedicata le rende consultabili senza dover leggere l'architettura per intero.

**Nessuna cartella per brand, metriche, GTM, doc-governance.**
Non esistono contenuti, non esistono cartelle. Si creano quando servono.

---

## File da scrivere (prossimi passi)

| File | Contenuto |
|---|---|
| `README.md` | Indice + stato corrente del progetto |
| `tech-architecture/architettura-fullstack.md` | Versione ripulita dell'architettura, senza sezioni pendenti o bozze |
| `tech-architecture/data-model.md` | Versione ripulita del data model menu + schema prenotazioni quando definito |
| `tech-architecture/monorepo-structure.md` | Struttura cartelle del repo (step 3 dei prossimi passi) |
| `product-scope/mvp.md` | Feature in scope + criteri di freeze del template |
| `product-scope/post-mvp.md` | Reminder prenotazioni, form candidature, idee parcheggiate |
| `decision-log/decisioni.md` | Log cronologico delle decisioni chiuse con rationale |
| `operations/onboarding-tenant.md` | Checklist RLS + procedura di setup nuovo schema |
| `operations/migration-runbook.md` | Flusso migrazioni post-freeze (già abbozzato nell'architettura) |
