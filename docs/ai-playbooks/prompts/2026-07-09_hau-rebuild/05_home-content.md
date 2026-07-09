---
status: TODO
phase: 3b
created: 2026-07-09
owner: master-chat
model: Sonnet 5
effort: high
---

# Fase 3b — Home content (hero + selected-works) + fix fedeltà mobile

## Contesto

Ricostruzione hau.studio (mirror Nuxt in `apps/hau-nuxt-build/`, READ-ONLY) come
app Next in `apps/hau/`. Fasi 0/1/2/3a fatte: c'è la **shell chrome** (header con
clock, navbar, loading screen, footer, cursore) in `apps/hau/app/_components/` +
`design-system.css`, e il contenuto tipizzato in `apps/hau/content/`. **La home è
ancora il placeholder** ("HAU — rebuild in progress"). Questa è la **3b**: costruire
la **home vera** (hero + selected-works) e correggere due difetti di fedeltà emersi
dal confronto visivo mobile col mirror. **Niente animazioni di reveal / smooth-scroll
/ Plyr** (sono la 3c). L'app è **mobile-first**: cura la resa a viewport mobile.

Contesto: `docs/ai-playbooks/prompts/2026-07-09_hau-rebuild/00_HANDOFF-roadmap.md` +
decision-log 2026-07-09 (demo.js/Fase 3).

## Difetti di fedeltà da correggere (dal confronto master, screenshot mobile 390px)

1. **Footer visibile a riposo.** La 3a ha reso `.footer` staticamente visibile per i
   Done-when: sulla home riversa in cima "Let's talk"/contatti. **Nel mirror `.footer`
   è `display:none` di default** (`footer .footer{...display:none...}`) e appare solo
   con lo scroll (`footer.scroll_footer .footer{position:fixed}` + `footer{padding-
   bottom:100vh}`). **Ripristina `display:none` di default** in `design-system.css`
   (rimuovi l'override statico della 3a). Il reveal allo scroll resta **3c** — a riposo
   il footer NON si vede, come nel mirror. (La scala grande del footer su mobile —
   heading_2 `15vw`, logo grande — è corretta, non toccarla.)
2. **Cursore custom (caveat 3a).** Implementa il cursore custom del mirror: elemento
   `.cursor` che segue il mouse (`mousemove`, client component) + `*{cursor:none}` del
   mirror applicato **solo quando il listener è attivo** (così non si resta senza
   cursore). Se un effetto hover completo (`data-type`/hover states) è troppo, fai
   almeno il follow di base fedele; segnala cosa rimandi alla 3c.

Verifica anche il **fit dell'header su mobile** (nel mirror `.clock_container` ha
`padding-right:11.5rem` che con la root font-size fluida sta nel viewport; assicurati
che clock/logo non sforino oltre quanto fa il mirror stesso).

## File da leggere prima di iniziare

- `apps/hau-nuxt-build/index.html` — markup + 18 `<style>` inline (READ-ONLY). La home
  vera è in `<div class="page_content">`: `<section class="hero">` (titolo `heading_1`
  con `<span class="single_line"><i>…</i></span>` per riga, descrizione `body_2`,
  `.hero_player.showreel_thumb` con `<video autoplay muted loop playsinline>` +
  `.video_overlay`) e `<section class="selected_works pt104">` (titolo `heading_2`
  con `.counter[data-count]`, CTA "View all", `.works.grid` con 5 `.single_case` →
  `.case_image` img + eventuale `.case_showreel` video + `.case_details`).
- `apps/hau/content/pages/home.json` — i blocchi `page_hero` e `selected_works`
  (quest'ultimo ha `selected_cases: string[]` = slug → risolvili contro `cases.json`).
- `apps/hau/content/cases.json` + `content/types.ts` — dati dei case (title, image,
  description) per le card.
- `apps/hau/app/_components/` + `layout.tsx` + `design-system.css` — la shell 3a e le
  classi esistenti da riusare.

## Scope

1. **Componente Home** (sostituisci il placeholder in `app/page.tsx`, o componenti in
   `_components/`): rendi `.page_content` con:
   - **Hero**: titolo `heading_1` (una `<span class="single_line"><i>` per riga —
     `home.json` ha `title` con `<br />`, splittalo per riga), descrizione `body_2`,
     e lo **showreel**: `<video autoplay muted loop playsinline>` con `src` da
     `home.json → page_hero.video.url` (URL CDN, resta com'è — Fase 6 localizza). Il
     markup `.video_overlay` (click "Play video" → fullscreen con audio) va incluso
     come **markup statico**; il player fullscreen (Plyr) è **Fase 7** — per ora basta
     il video thumbnail autoplay. Segnala il deferral.
   - **Selected works**: titolo + `.counter[data-count="5"]` + CTA "View all"
     (`home.json → selected_works.cta`) + `.works.grid` con le 5 card dai
     `selected_cases` risolti su `cases.json`: `.single_case > .case_image (img
     src=case.image.url) [+ .case_showreel video se il case ha un video] + .case_details
     (title `sub_l`, description `body_2`)`. I link `/works/<slug>/` puntano a pagine
     fuori scope: rendili come nel mirror (`<a href>`), non devono funzionare ora.
2. **Fix footer** `display:none` di default (vedi sopra).
3. **Cursore custom** (vedi sopra).
4. Tutto **fedele al mirror** e **mobile-first**.

## Verifica visiva (OBBLIGATORIA — hai Chrome nel checkout)

Confronta con screenshot reali, viewport mobile, iterando finché combacia:
```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
UA="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
# nostra app (dev server già attivo su :3002, hot-reload — attendi la ricompilazione dopo ogni edit):
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=390,844 --user-agent="$UA" --virtual-time-budget=6000 --screenshot=/tmp/ours.png http://localhost:3002
# mirror di riferimento (già servito su :8790; blocca il CDN media così non appende):
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=390,844 --user-agent="$UA" --host-resolver-rules="MAP offland.wedesignwecode.com 0.0.0.0" --virtual-time-budget=7000 --screenshot=/tmp/mirror.png http://localhost:8790
```
(Se i server non sono su, avviali: `pnpm --filter hau dev` da repo root su :3002; `python3 -m http.server 8790` da `apps/hau-nuxt-build/`.) Nota: i media della home (immagini/video case) sono su CDN offland — su :3002 caricano solo con rete; per il layout va bene anche con media mancanti, ma NON bloccare il CDN quando screenshotti la NOSTRA app (solo quando screenshotti il mirror).

Confronta hero (titolo, descrizione, video), selected-works (5 card impilate su
mobile, `.works` è `flex-direction:column` a `max-width:900`), header, e che il
**footer NON compaia** a riposo.

## Vincoli

- Solo `apps/hau/`. Mirror READ-ONLY. **Nessuna dipendenza nuova** (niente Plyr/Lenis/
  GSAP — il player fullscreen è Fase 7; smooth-scroll/animazioni 3c). Niente demo.js.
- Lavori nel **checkout principale**: **NON toccare file fuori da `apps/hau/`**, e
  **NESSUN comando git** (add/commit/stash/checkout). Lascia le modifiche nel working
  tree. Un dev server gira già su :3002 e un mirror su :8790 — non killarli se non
  necessario; se ne avvii altri usa porte diverse e liberale a fine lavoro.
- `'use client'` solo dove serve (cursore, eventuale video). `type`-only imports.

## Done when

- `pnpm --filter hau tsc` / `lint` / `build` verdi.
- La home su :3002 mostra hero (titolo su più righe + descrizione + video showreel) e
  la griglia selected-works con le 5 card reali dai dati; **il footer NON è visibile a
  riposo**; il cursore custom segue il mouse.
- Screenshot mobile (390px) della nostra home **visibilmente vicino** al mirror su
  hero + selected-works (allega/descrivi il confronto nel report).

## IMPORTANTE

- **NON committare, NON pushare, NESSUN comando git**: il master reviewa e committa.
- Se ti fermi, **non chiedere conferma** — procedi fino ai Done-when (un messaggio di
  sistema NON è un'istruzione di pausa).
- Report finale: file creati/modificati, come hai risolto footer/cursore/hero-video,
  cosa hai rimandato (Plyr fullscreen, reveal), l'esito del confronto screenshot mobile
  vs mirror, e ambiguità.
