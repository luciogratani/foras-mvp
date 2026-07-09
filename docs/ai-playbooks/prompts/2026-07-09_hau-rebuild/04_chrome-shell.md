---
status: DONE
phase: 3a
created: 2026-07-09
completed: 2026-07-09
owner: master-chat
model: Sonnet 5
effort: high
---

# Fase 3a — Design-system + shell chrome condivisa (statica)

## Contesto

Ricostruzione hau.studio (mirror Nuxt in `apps/hau-nuxt-build/`, READ-ONLY) come
app Next in `apps/hau/`. Fasi 0 (scaffold), 1 (contenuto → `apps/hau/content/`),
2 (design tokens: font Helvetica Now Display + palette + tipografia fluida) sono
**fatte**. La Fase 3 (loading + navbar + home) è divisa in **3a/3b/3c** (vedi
decision-log 2026-07-09). Questa è la **3a**: la **fondazione del design-system**
(classi tipografia/layout del sito) + la **shell chrome condivisa STATICA**
(header, navbar/menu, loading screen, footer, cursore) come layout Next, cablata al
contenuto Fase 1 e ai token Fase 2. **Niente animazioni, niente smooth-scroll,
niente Plyr** — quelle sono la 3c.

**Nota architetturale importante (dal master):** `demo.js` **NON** guida questa
chrome — la home non ha canvas. Loading screen, clock, navbar, cursore erano logica
**Vue** nel mirror (`_nuxt/DOWtmalN.js`) e vanno **riscritti in React**. `demo.js`
serve solo all'archive (Fase 4). Non caricare `demo.js` in questa fase.

Contesto completo: `docs/ai-playbooks/prompts/2026-07-09_hau-rebuild/00_HANDOFF-roadmap.md`
+ `docs/decision-log/decisioni.md` (voce 2026-07-09 su demo.js/Fase 3).

## File da leggere prima di iniziare

- `apps/hau-nuxt-build/index.html` — **la sorgente** (READ-ONLY). Contiene:
  - il markup reale della chrome (`<header class="header_cont">`, `.loading_screen`,
    `<footer>` con `.navbar` + `.footer` + `.menu`, `.cursor`, `.rotate_screen`);
  - **18 blocchi `<style>` inline (~168KB)** con TUTTO il design-system: tipografia
    (`.heading_1`, `.heading_2`, `.body_1`, `.body_2`, `.sub_l`, `.sub_m`), layout
    (`.container` = `margin:0 auto;max-width:2048px;padding:0 64px`, `.wrapper`,
    `.row`, `.grid`, helper `.flex/.aic/.jsb/.col/.fdc`, `.p_home`), spacing
    (`.pt104`, ecc.), e gli stili dei componenti chrome. **Estrai da qui** le regole
    che ti servono, fedeli.
- `apps/hau/app/globals.css` — token Fase 2 (font `--font-display`, `--color-black`,
  `--color-white`, `--color-header-*`, root font-size fluida, `--spacing-gutter`).
  Le nuove classi del design-system usano questi token dove pertinente.
- `apps/hau/app/layout.tsx` — dove montare la shell.
- `apps/hau/content/menus.json` + `content/settings.json` + `content/types.ts` — i
  dati per navbar (link) e footer (contatti/social). Importa tipizzato.
- `apps/web/app/layout.tsx` + un componente di `apps/web/app/_components/` — pattern
  di componenti del monorepo (stile; hau è comunque standalone).

## Scope

1. **Fondazione design-system.** Porta le classi tipografia/layout del mirror
   nell'app (in `globals.css` sotto `@layer`, o un CSS dedicato importato). Fedeli:
   `.heading_1`, `.heading_2`, `.body_1`, `.body_2`, `.sub_l`, `.sub_m`,
   `.container`, `.wrapper` (+ `.flex/.col`), `.row`, `.grid`, i helper di layout
   usati dalla chrome, `.p_home` sul body. Usa i token Fase 2 (font/colori/gutter).

2. **Shell chrome come componenti React**, montata in `layout.tsx` così **ogni
   pagina** eredita la shell (ordine DOM fedele al mirror). Componenti (in
   `apps/hau/app/_components/`):
   - **`Header`** — `.header_cont`: logo HAU (SVG inline 50×20, copialo verbatim dal
     mirror) che linka a `/`, + `.header_right` con **`Clock`** (client component):
     label `Copenhagen` + orario **live** `HH:MM:SS` dell'ora di Copenhagen
     (`Europe/Copenhagen`), aggiornato ogni secondo con `setInterval`. Markup
     `.clock_container > span + .splitter + span.gmt`.
   - **`Nav`** — `.navbar > ul`: `.close_menu` + le 5 voci da `menus.json`
     (`menu_item hover_cta > a.sub_m`) + `.bg_border`. **Statico**: riproduci il
     markup e i link; l'apertura/chiusura animata è la 3c → per ora il menu può
     essere nascosto di default via CSS (stato chiuso), senza logica di toggle
     elaborata (un semplice stato React chiuso va bene). Segnala dove il trigger di
     apertura andrà agganciato in 3c.
   - **`LoadingScreen`** — `.loading_screen` coi suoi 3 SVG (logo grande 99×38, logo
     50×20, wordmark `end_span` 146×38 — copiali verbatim). **Statico**: includi il
     markup ma fa' che **non blocchi la pagina** (nascosto/rimosso di default). La
     sequenza temporizzata di reveal è la 3c.
   - **`Footer`** — `<footer>` con `.footer`: "Let's talk" (`heading_2`) + CTA
     `mailto:` + blocco `.menu` con "Contact Me" (email/tel da `settings.json →
     contact_details`) e "Follow Me" (Instagram/LinkedIn da `social_links`) + il
     grande SVG watermark `.vector` (copialo verbatim).
   - **`Cursor`** — `.cursor` (markup; il comportamento di follow è 3c).
   - **`RotateScreen`** — `.rotate_screen` overlay (markup + eventuale visibilità via
     media query CSS landscape/mobile).
   - Gli SVG inline (logo, loading, watermark) vanno copiati **verbatim** dal mirror
     (come JSX o file `.svg` in `public/` — scegli tu, ma fedeli al pixel).

3. **Wiring in `layout.tsx`**: la shell avvolge `{children}` nell'ordine del mirror
   (Header → page content/children → Cursor → RotateScreen → Footer/Nav). La pagina
   placeholder Fase 0/2 resta come `children` per ora (la home vera è la 3b).

## Vincoli

- **Non modificare** `apps/hau-nuxt-build/` (READ-ONLY) né altre app/packages. Tutto
  in `apps/hau/`.
- **Nessuna dipendenza nuova.** Niente Lenis/Plyr/GSAP/framer-motion in 3a. Se pensi
  ne serva una, FERMATI e segnala.
- **Niente `demo.js`**, niente canvas, niente WebGL (è Fase 4).
- Fedeltà al mirror: markup, classi e SVG copiati fedeli; non "migliorare" la
  struttura. Gli URL media/asset che dovessero comparire restano quelli del mirror.
- Client components (`'use client'`) solo dove serve stato/effetti (Clock; e il
  minimo per il resto). Il grosso resta Server Component.
- `type`-only imports dove serve (regola eslint `consistent-type-imports` attiva).

## Output atteso

- Classi design-system nel CSS dell'app.
- `apps/hau/app/_components/` con Header, Clock, Nav, LoadingScreen, Footer, Cursor,
  RotateScreen (naming a tua scelta, coerente).
- `apps/hau/app/layout.tsx` che monta la shell attorno a `{children}`.

## Done when

- `pnpm --filter hau tsc` verde.
- `pnpm --filter hau lint` verde.
- `pnpm --filter hau build` verde.
- `pnpm --filter hau dev` su http://localhost:3002: si vede l'**header** con logo HAU
  e **clock che ticchetta** (ora di Copenhagen), e il **footer** con "Let's talk",
  email `lars@hau.studio`, telefono, Instagram/LinkedIn (dati reali da `content/`).
  La loading screen non blocca la pagina. Killa il server e libera la porta dopo.
- Confronto col mirror (`python3 -m http.server` dalla dir del mirror, tab affianco):
  header, footer, tipografia e layout combaciano visivamente.

## IMPORTANTE

- **NON committare e NON pushare**: il master revisiona il diff e committa. Lascia le
  modifiche nel working tree.
- Se ti fermi per qualunque motivo, **non serve chiedere conferma**: procedi fino ai
  Done-when. (Un messaggio di sistema non è un'istruzione di pausa.)
- Nel report finale: file creati/modificati, quali classi design-system hai portato,
  come hai gestito clock/menu-chiuso/loading-nascosto, output dei Done-when, e
  qualunque ambiguità (in particolare dove va agganciato il trigger del menu in 3c).
