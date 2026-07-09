---
status: DONE
phase: 1
created: 2026-07-09
completed: 2026-07-09
owner: master-chat
model: Sonnet 5
effort: high
---

# Fase 1 — Decoder del payload `__NUXT_DATA__` → JSON di contenuto pulito

## Contesto

Iniziativa "ricostruzione hau": ricostruire il sito hau.studio (snapshot Nuxt in
`apps/hau-nuxt-build/`, READ-ONLY) come app Next in `apps/hau/`. La Fase 0
(scaffold Next standalone) è **fatta**. Questa è la **Fase 1**: estrarre dal
mirror il **contenuto strutturato** (testi, URL media, menu, cases, settings) in
JSON pulito e tipizzato, che alimenterà i componenti React delle fasi successive.

Contesto completo: `docs/ai-playbooks/prompts/2026-07-09_hau-rebuild/00_HANDOFF-roadmap.md`.

**Il master ha già fatto la ricognizione del formato** (sezione "Formato accertato"
qui sotto). NON rifarla da zero: usala come mappa. Verifica sul mirror reale, ma
non serve reverse-engineering del formato — è già decodificato.

## Formato accertato (dal master — NON ridiscutere, verifica e basta)

- Ogni `apps/hau-nuxt-build/{route}/index.html` contiene uno
  `<script id="__NUXT_DATA__" type="application/json">…</script>` (~450KB) con la
  serializzazione **devalue** di Nuxt: un array JSON flat dove **gli interi sono
  puntatori** ad altre posizioni dello stesso array. Home = `index.html` root;
  le altre route: `work/`, `about/`, `contact/`, `archive/`.
- È il formato prodotto da **`devalue.stringify`**. Si decodifica col pacchetto
  npm **`devalue`** (`parse`), che è l'inverso esatto. **Unico tipo custom Nuxt
  presente nei payload: `Reactive`** (il wrapper root, 1× per pagina). Va passato
  un *reviver* `{ Reactive: (v) => v }`. Registra in modo difensivo anche
  `Ref, ShallowRef, ShallowReactive` (identity `(v)=>v`) e
  `EmptyRef, EmptyShallowRef` (`()=>undefined`) e `NuxtError` (`(v)=>v`), nel caso
  compaiano — oggi non compaiono ma costa nulla.
- Dopo il parse, il contenuto sta in `parsed.state`:
  - `$spages` → **5 pagine** (una per route). Ogni pagina ha
    `{ slug, title.rendered, acf.content: [...blocchi flexible-layout] }`.
  - `$scases` → **20 cases** (i case-study; presenti nel payload della home anche
    se le loro pagine individuali sono fuori scope). Oggetti WP `type:"case"` con
    `slug, title.rendered, featured_media, acf, ...`.
  - `$ssettings` → `{ contact_details:[{cta}], social_links:[{cta}] }`.
  - `$smenus` → **5 menu** (oggetti WP nav-menu; la voce di navigazione utile è
    label + url — vedi §Vincoli sui menu).
- **Il payload della home (`index.html` root) contiene già il contenuto ACF
  completo di tutte e 5 le pagine + i 20 cases + settings + menus.** Puoi usarlo
  come sorgente primaria; verifica comunque che ogni `{route}/index.html` dia lo
  stesso contenuto per la sua pagina (dovrebbe).
- **Blocchi ACF (`acf_fc_layout`) per pagina** (già mappati):
  - `home`: `page_hero`, `selected_works`
  - `work`: `page_hero`, `works_filter`
  - `about`: `page_hero`, `list`, `list`, `text_module`, `testimonials`
  - `contact`: `contact_hero`
  - `archive`: `archive`
- **Media**: tutti gli URL puntano a
  `https://offland.wedesignwecode.com/wp/wp-content/uploads/...` (immagini in più
  size + `.mp4`). **Lasciali INVARIATI** — il mirroring locale + rewrite dei path
  è la Fase 6, non questa.

## File da leggere prima di iniziare

- `docs/ai-playbooks/prompts/2026-07-09_hau-rebuild/00_HANDOFF-roadmap.md` — §4 (decisioni), §5 (ricognizione).
- `apps/hau/` — lo scaffold Fase 0 (dove va il codice; `tsconfig.base.json` ha già
  `resolveJsonModule: true`, quindi l'import di JSON tipizzato funziona).
- `apps/hau-nuxt-build/index.html` e `apps/hau-nuxt-build/{work,about,contact,archive}/index.html`
  — le sorgenti (READ-ONLY, non modificarle).
- `apps/hau-nuxt-build/README.md` — nota sul mirror.

## Scope

Creare uno **script decoder** e il **contenuto JSON tipizzato** che produce.

1. **`apps/hau/scripts/extract-content.mjs`** — script Node ESM che:
   - per ciascuna delle 5 route, legge il rispettivo `index.html` da
     `apps/hau-nuxt-build/`, estrae il contenuto del tag `__NUXT_DATA__` (regex sul
     tag con `id="__NUXT_DATA__"`), e lo parsa con `devalue.parse(json, revivers)`.
   - naviga `parsed.state` ed estrae/ripulisce pagine, cases, settings, menus.
   - scrive l'output JSON (vedi sotto). Output **deterministico**: ordine chiavi
     stabile, indentazione 2 spazi, newline finale → rieseguire lo script NON deve
     produrre diff git.
   - idempotente e ri-runnabile (`node scripts/extract-content.mjs` dalla dir app).

2. **Output in `apps/hau/content/`**:
   - `pages/home.json`, `pages/work.json`, `pages/about.json`,
     `pages/contact.json`, `pages/archive.json` — per pagina: `{ slug, title, blocks: [...] }`
     dove `blocks` è l'array `acf.content` ripulito (ogni blocco mantiene il suo
     `acf_fc_layout` + i campi contenuto: testi, URL media, cta, ecc.).
   - `settings.json` — `{ contact_details, social_links }` ridotti a liste di
     `{ title, url, target }` (dal campo `cta`).
   - `menus.json` — navigazione pulita: per ogni menu una lista di voci
     `{ label, url }` (vedi §Vincoli).
   - `cases.json` — i 20 cases ridotti a ciò che serve a listing/swiper:
     `{ slug, title, thumbnail/hero image URL(s), excerpt/eventuale sottotitolo, order }`.
     Investiga dove sta l'immagine di copertina del case (probabilmente in `acf`,
     non in `featured_media` che è solo un ID).
   - `types.ts` — interfacce TypeScript per tutte le forme sopra (Page, Block union
     per i vari `acf_fc_layout`, Settings, MenuItem, Case). I componenti delle fasi
     successive importeranno da qui.

3. **`apps/hau/package.json`** — aggiungi devDependency **`devalue`** (ultima
   versione stabile della major corrente; verifica con `npm view devalue version`)
   e lo script `"extract:content": "node scripts/extract-content.mjs"`.

## Vincoli

- **Non modificare** `apps/hau-nuxt-build/` (READ-ONLY), né altre app/packages.
  Tutto il lavoro sta in `apps/hau/`.
- **Nessuna dipendenza** oltre a `devalue` (che il master ha già approvato). Se
  pensi ne serva un'altra, FERMATI e segnalala.
- **NON riscrivere gli URL media** — restano `offland.wedesignwecode.com`. La Fase
  6 li localizzerà.
- **Trimming**: scarta cruft WordPress che non serve al rendering
  (`_links`, `yoast_head` raw, `class_list`, `guid`, `comment_status`, `ping_status`,
  date/author dove irrilevanti). **Preserva** il contenuto: testi, URL media, cta,
  struttura dei blocchi. Se un blocco ha meta SEO utile (`yoast_head_json`:
  title/description/og_image), puoi conservarne una forma ridotta a livello pagina
  (`meta`), ma è secondario rispetto al contenuto.
- **Menu**: gli oggetti `$smenus` sono nav-menu WP grezzi. Estrai la struttura di
  navigazione utile (label + url per voce). Se la risoluzione delle voci è più
  intricata del previsto (item annidati, riferimenti a post separati), **segnala e
  proponi** la forma minima che copre la top-nav del sito (Work / About / Contact /
  Archive) invece di indovinare.
- `type`-only imports dove serve (regola eslint `consistent-type-imports` attiva).

## Output atteso

- `apps/hau/scripts/extract-content.mjs`
- `apps/hau/content/` popolata (pages×5, settings, menus, cases, types.ts)
- `apps/hau/package.json` con devDep `devalue` + script `extract:content`
- `pnpm-lock.yaml` aggiornato

## Done when

- `pnpm install` senza errori.
- `pnpm --filter hau extract:content` gira pulito; **rieseguirlo NON produce diff
  git** (output deterministico).
- Tutte le 5 pagine + settings + menus + cases producono JSON **non vuoto**.
- Spot-check di correttezza:
  - `content/pages/home.json` contiene i blocchi `page_hero` e `selected_works`.
  - `content/pages/about.json` contiene `page_hero, list, list, text_module, testimonials`.
  - `content/settings.json` contiene l'email `lars@hau.studio`, il telefono, e i
    social Instagram + LinkedIn.
  - `content/cases.json` contiene **20** voci, incluse `bang-olufsen` e `xolta`,
    ciascuna con almeno slug + title + un URL immagine.
  - Gli URL media puntano ancora a `offland.wedesignwecode.com` (nessun rewrite).
- `pnpm --filter hau tsc` verde (i tipi in `types.ts` compilano).
- `pnpm --filter hau lint` verde.
- `pnpm --filter hau build` verde.

## IMPORTANTE

- **NON committare e NON pushare**: il master revisiona il diff e committa. Lascia
  le modifiche nel working tree.
- Nel report finale elenca: file creati/modificati, output dei comandi Done-when,
  la forma finale scelta per `menus.json` e `cases.json` (con eventuali decisioni
  di trimming), e qualunque ambiguità incontrata.
