---
status: DRAFT
type: master-handoff
created: 2026-07-09
owner: master-chat
---

# Handoff — Ricostruzione apps/hau (mirror Nuxt → Next+React)

Ciao! Sei la chat master per l'iniziativa "ricostruzione hau". Lucio è il principal
(italiano, master di un workflow master/sub-chat — vedi [[workflow-master-sub]]).
Questo file ti dà tutto il contesto per iniziare senza dover ripetere l'indagine
già fatta.

## 1. Setup base (prima di rispondere a Lucio)

Leggi in quest'ordine:
1. `docs/ai-playbooks/workflow-master-sub.md` — regole master/sub-chat (commit/push,
   template prompt, naming).
2. `MEMORY.md` nella tua auto-memory (contesto generale del progetto foras-mvp —
   nota: questa iniziativa è scollegata dal modello multi-tenant/Supabase).
3. Questo file, per intero, prima di proporre qualsiasi azione.

## 2. Cos'è apps/hau

`apps/hau` **non era codice sorgente**: era lo snapshot statico/minificato (build
Nuxt 3/Vue già compilata, senza sourcemap) di un sito esterno reale e tuttora
online: **hau.studio** (redirect a `www.hau.studio`, hosting Vercel), il sito
vetrina di Lars Hauschildt, creative director a Copenhagen (`lars@hau.studio`).
Obiettivo dell'iniziativa: ricostruire questo sito **il più fedelmente possibile**
come vera app Next.js + React, con le stesse convenzioni di `apps/web`/`apps/admin`.

Non è un tenant del modello foras (niente Supabase, niente RLS) — è un progetto
standalone nel monorepo pnpm.

## 3. Struttura cartelle — leggi bene prima di toccare qualcosa

- **`apps/hau-nuxt-build/`** — il mirror originale (ex `apps/hau/`, rinominato
  2026-07-09). **READ-ONLY, non modificarlo mai.** Serve solo come reference per
  confronto: HTML renderizzato, CSS reali, `demo.js` (motore WebGL), font già
  locali, contenuto testuale (nel payload `__NUXT_DATA__` inline in ogni
  `index.html`).
- **`apps/hau/`** — la nuova app Next+React. Attualmente **vuota**: è la working
  dir di questa iniziativa.

## 4. Decisioni già prese (non ridiscutere senza nuovo input di Lucio)

- **Motore WebGL (`demo.js`, griglia drag/inerzia di `/archive/`)**: si **riusa
  così com'è**, caricato via `<Script>` in Next, esattamente come oggi (contratto
  `window.canvas_elem`). Nessuna riscrittura in React/OGL — è vanilla JS
  framework-agnostic, già verificato funzionante, e riscriverlo da minificato
  senza sourcemap sarebbe alto rischio/basso beneficio.
- **Media**: mirror locale in `apps/hau/public` (oggi ancora hotlinked a
  `offland.wedesignwecode.com`, il CDN WordPress headless che alimenta il sito).
  Niente dipendenza runtime da quel dominio nella nuova app.
- **Scope attuale**: solo le 5 pagine già presenti nel mirror — home, `/work/`
  (listing), `/about/`, `/contact/`, `/archive/`. Le 20 pagine di case-study
  individuali (`/works/<slug>/`) sono **fuori scope per ora** (vedi §5 per il
  costo di recupero futuro, che è basso).
- **Collocazione**: app Next standalone in `apps/hau/` (Next 16 + React 19 +
  Tailwind v4, pnpm workspace), porta dedicata proposta **3002** (3000=web,
  3001=admin già occupate).
- **Primo target di sviluppo scelto da Lucio**: loading screen + navbar + home
  insieme (vedi §6 Fase 3), perché sono la chrome condivisa più legata al boot
  di `demo.js` sull'intero sito (non solo `/archive/`) — è il punto a più alta
  incertezza architetturale, va validato presto.

## 5. Ricognizione già fatta (non ripeterla)

- **Il mirror non è stale.** Confrontati gli hash dei chunk `_nuxt/*.js|css`
  live vs locali (es. `BcZ2NVKp.js`, `entry.CvZIZUJ1.css`): **identici**. Il
  mirror è il build attualmente in produzione, non serve ricatturare le 5 pagine
  già presenti.
- **20 pagine case-study non catturate**, trovate via `hau.studio/sitemap.xml`:
  `bang-olufsen`, `butchers-and-bicycles`, `skyward`, `hors-doeuvre`,
  `the-story-of-larza`, `sheltr`, `xolta`, `monta`, `air-greenland`,
  `selected-group`, `hear-like-no-other`, `ortofon`, `arkk-copenhagen`,
  `resist-the-elements`, `stay-ahead`, `soft-power`, `your-future-workplace`,
  `everyday-performance-elevated`, `take-control`, `amanda-lilholt`.
- **Costo di recupero futuro basso**: campionando 2 di queste pagine (Bang &
  Olufsen, Xolta), **tutti** i chunk JS/CSS che richiedono sono già presenti in
  `apps/hau-nuxt-build/_nuxt/` (la cattura originale aveva scaricato l'intera
  build directory, non solo gli asset delle 5 pagine salvate). Quindi espandere
  lo scope in futuro costerà solo estrazione contenuto/HTML per-pagina, zero
  nuovi download di asset.
- **Nessuna API pulita**: `offland.wedesignwecode.com/wp-json/` → 404. L'unica
  fonte di contenuto strutturato resta il payload `__NUXT_DATA__` inline
  (formato tipo devalue, ~450KB per pagina) in ogni `index.html` del mirror.
- **Nessun repository GitHub pubblico trovato** per questo sito (cercato via
  GitHub Search API con `hau.studio`, `wedesignwecode`, `hau-studio`, e ricerca
  web `Lars Hauschildt github` / `wedesignwecode github nuxt` — nessun match
  pertinente, solo falsi positivi su stringhe simili). **Confermato**: non
  esiste sorgente originale recuperabile, si procede solo da build compilata +
  sito live pubblico.

## 6. Roadmap — fasi, difficoltà, modello consigliato

| # | Fase | Difficoltà | Modello Claude Code consigliato |
|---|------|-----------|----------------------------------|
| 0 | Scaffold Next app (`package.json`, `next.config`, Tailwind v4, tsconfig, porta 3002) copiando le convenzioni di `web`/`admin` | 🟢 Bassa — meccanico | Sonnet 5 |
| 1 | Decoder del payload `__NUXT_DATA__` → JSON di contenuto pulito (testi, URL media, menu) per ogni pagina | 🟡 Media — formato non standard, va capito con precisione | Sonnet 5 (Opus 4.8 se il formato risulta più ostico del previsto, es. riferimenti circolari) |
| 2 | Design tokens: font (già locali in `hau-nuxt-build/_nuxt/`), colori/tipografia da CSS chunk, Tailwind config | 🟢 Bassa | Sonnet 5 |
| **3** | **Loading screen + Navbar + Home** — chrome condivisa, boot `demo.js` (menu/preloader), primi blocchi contenuto (hero, image-video, swiper case, next-case) | 🟠 Medio-alta — reverse engineering di comportamento da JS minificato senza sourcemap, integrazione con lifecycle Next (idratazione React) invece di Nuxt | **Opus 4.8** per l'integrazione con `demo.js` e il timing delle animazioni; Sonnet 5 per markup/styling dei blocchi contenuto una volta chiarito il pattern |
| 4 | Archive (griglia WebGL) — mount canvas, contratto `window.canvas_elem`, re-init su client-nav Next | 🟠 Medio-alta — stesso motivo, più delicato perché è drag/WebGL live | Opus 4.8 |
| 5 | About, Contact, Work (listing) — riuso blocchi già costruiti in fase 3 | 🟢 Bassa-media | Sonnet 5 |
| 6 | Mirror locale media (script che legge il JSON di fase 1, scarica da `offland.wedesignwecode.com`, riscrive i riferimenti) | 🟡 Media — scripting, ma va gestito bene lo swap dei path | Sonnet 5 |
| 7 | Polish: Lenis smooth-scroll, Plyr video, transizioni tra route, meta/favicon parity, responsive check | 🟡 Media | Sonnet 5, chiudi con `/verify` |
| 8 *(opzionale, fuori scope attuale)* | Le 20 case-study `/works/<slug>/` — stesso pattern di estrazione (fase 1) applicato a ciascuna, zero nuovi asset da scaricare (vedi §5) | 🟡 Media, ripetitiva | Sonnet 5 |

La fase 3 è quella con più incertezza (nessuna sourcemap, comportamento dedotto
solo osservando `demo.js`) — vale la pena spendere un modello più capace subito
piuttosto che scoprire tardi che l'integrazione non regge.

## 6b. Nota su branching (2026-07-09)

Il setup iniziale (rename `hau`→`hau-nuxt-build`, creazione `apps/hau` vuota,
questo file) è stato committato sul branch **`chore/hau-rebuild-setup`** invece
che direttamente su `main`. A revisione, questa scelta era **prematura**: quel
commit conteneva solo materiale inerte (rename di una cartella mai stata su
main + un doc), zero rischio per `web`/`admin`, nessuna build che lo tocca
(niente `package.json` in `apps/hau` ancora). Guardando la storia del repo,
ogni sprint/intermezzo precedente è stato fatto con **commit diretti su
`main`** (trunk-based) — l'unico branch pre-esistente, `chore/stack-upgrade`,
isolava un caso genuinamente diverso (upgrade major che toccava codice di
sicurezza/auth admin, con gate esplicito da revisionare pre-merge).

**Deciso (2026-07-09): passo indietro.** Il branch `chore/hau-rebuild-setup` è
stato mergiato (fast-forward) in `main` e poi eliminato; il setup vive ora
come commit diretto su `main`, coerente con la convenzione trunk-based del
resto del progetto. **Il branch inizierà ad avere senso reale dalla Fase 0**
(primo `package.json`/scaffold Next in `apps/hau`), dove può esserci uno stato
"a metà" con build che fallisce — comparabile al precedente di
`chore/stack-upgrade`. Fino ad allora, procedi con commit diretti su `main`.

## 7. Come procedere (regole operative)

- Un prompt `.md` per fase (o sotto-fase) in
  `docs/ai-playbooks/prompts/2026-07-09_hau-rebuild/`, seguendo il template di
  `workflow-master-sub.md`. Numerali tipo `01_scaffold.md`, `02_content-decoder.md`.
- Esecuzione **sequenziale consigliata per le fasi 0→3** (ogni fase dipende
  dalla precedente); dalla fase 4 in poi possono procedere più in parallelo una
  volta stabile il pattern dei blocchi contenuto.
- Delega a sub-chat (via Agent/worktree secondo convenzione); il master
  revisiona sempre il diff prima di committare — mai commit automatico dalla
  sub-chat.
- **Criterio di accettazione = fedeltà visiva/comportamentale**, non solo
  build/typecheck verde: testa sempre nel browser reale (skill `/run` o
  `/verify`) prima di segnare una fase DONE, confrontando con
  `apps/hau-nuxt-build` aperto in un tab affianco.
- Push solo su richiesta esplicita di Lucio.
- Decisioni architetturali nuove (non coperte da §4) → il master le prende e le
  documenta in `docs/decision-log/decisioni.md`, non le delega alla sub-chat.

## 8. Prima azione consigliata

Saluta Lucio in italiano. Riassumi in poche righe lo stato (basandoti su questo
file, non a memoria). Proponi di partire dalla **Fase 0** (scaffold) per
sbloccare in fretta lo sviluppo di loading screen + navbar + home che Lucio
vuole come prima base di lavoro.
