---
status: DONE
phase: 2
created: 2026-07-09
completed: 2026-07-09
owner: master-chat
model: Sonnet 5
effort: medium
---

# Fase 2 — Design tokens (font, colori, tipografia) → Tailwind v4

## Contesto

Iniziativa "ricostruzione hau": ricostruire hau.studio (mirror Nuxt in
`apps/hau-nuxt-build/`, READ-ONLY) come app Next in `apps/hau/`. Fasi 0 (scaffold)
e 1 (decoder contenuto → `apps/hau/content/`) sono **fatte**. Questa è la **Fase 2**:
estrarre i **design token** reali del sito (font self-hosted, palette, tipografia
di base) e cablarli in Tailwind v4, sostituendo il `globals.css` placeholder dello
scaffold. Nessun componente ancora (è Fase 3) — solo i fondamentali visivi.

Contesto completo: `docs/ai-playbooks/prompts/2026-07-09_hau-rebuild/00_HANDOFF-roadmap.md`.

**Il master ha già fatto la ricognizione** (sezione "Token accertati"). Usala come
mappa; verifica sul mirror ma non serve ripartire da zero.

## Token accertati (dal master — verifica, non re-indagare)

**Font — `Helvetica Now Display`** (l'unico font che carica davvero):
- File già locali in `apps/hau-nuxt-build/_nuxt/` come `HelveticaNowDisplay-*.woff2`
  (20 file) + `.woff` gemelli. **20 dichiarazioni `@font-face`** stanno inline in
  `apps/hau-nuxt-build/index.html` (cercale con `@font-face`): mappano ogni file a
  `font-weight` (100/300/400/500/700/900) × `font-style` (normal/italic), tutte con
  `font-display:swap`. **Nota fedeltà:** il sito collassa più tagli display sullo
  stesso peso CSS (es. Hairline/ExtLt/Light → 300; ExtBlk/ExtraBold/Black → 900):
  riproduci la mappatura **così com'è** nelle `@font-face` del mirror, non
  reinventarla. Pesi effettivamente usati nel markup: 400 (prevalente), 700, 900,
  300, 500, 100.
- `html` nel mirror ha `font-family: Monument Grotesk` ma **non esiste alcun
  `@font-face` per Monument Grotesk** → non carica mai, `body` sovrascrive con
  Helvetica Now Display. **Ignora Monument Grotesk** (è un leftover morto).

**Palette brand** (dagli stili inline di `index.html`):
- `--Black: #1e1e1e` — colore testo/scuro primario (NON nero puro).
- Bianco `#fff` — background primario.
- `--header-color` ha due stati: `#1e1e1e` (navbar su sezioni chiare) e `#fff`
  (navbar su sezioni scure) — servirà alla navbar in Fase 3, mettilo a token.
- Off-white caldi comparsi 1-2 volte (`#faf3ea`, `#f5f4f0`) — possibili background
  di sezione; includili solo se ne verifichi l'uso come background, altrimenti
  segnalali senza aggiungerli.
- **Escludi** gli hex di terze parti: `#007aff`/`--swiper-*` (swiper),
  `#728197`/`#dcdfe5`/`#4a5464`/`--plyr-*` (Plyr video). Non sono brand token.

**Tipografia di base** (da riprodurre fedelmente):
- **Root font-size fluida** (meccanismo chiave): `html { font-size: clamp(0px, 12px,
  10 * 100vw / var(--size)) }` con `--size: 1440`. Fa scalare tutti i `rem` con la
  larghezza del viewport (cap a 12px). Riproducilo tale e quale.
- `--p-l: 64px` — gutter orizzontale di pagina (a token spacing, es. `--spacing-gutter`).
- `body { font-family: 'Helvetica Now Display'; line-height: 1; -webkit-font-smoothing:
  antialiased; -moz-osx-font-smoothing: grayscale; overflow-x: hidden }`.

## File da leggere prima di iniziare

- `apps/hau/app/globals.css` — il placeholder Fase 0 da sostituire (usa già
  `@import 'tailwindcss'` + `@theme inline` con `--color-background/foreground`).
- `apps/hau/app/layout.tsx` — dove applicare la font-family/variabile.
- `apps/web/app/globals.css` — pattern Tailwind v4 `@theme` del monorepo (riferimento
  di stile; NON copiarne la palette shadcn, hau ha la sua).
- `apps/hau-nuxt-build/index.html` — le `@font-face` reali + gli stili base inline
  (`:root`, `html`, `body`). READ-ONLY.
- `apps/hau-nuxt-build/_nuxt/` — i file font woff2/woff. READ-ONLY (copiali, non
  spostarli).

## Scope

1. **Self-host del font in `apps/hau/`.** Copia i woff2 di Helvetica Now Display da
   `apps/hau-nuxt-build/_nuxt/` in una dir dell'app (es. `apps/hau/app/fonts/`).
   Cablalo con **`next/font/local`** (idiomatico Next 16: self-host, no FOUT,
   espone una CSS variable) — un modulo `fonts.ts` che dichiara i tagli usati
   (almeno 100/300/400/500/700/900 normal + gli italic realmente usati) ed esporta
   la variabile (es. `--font-display`), importato in `layout.tsx` e applicato a
   `<html>`/`<body>`. Solo woff2 è sufficiente per i browser 2026 (il `.woff` è
   ridondante); se preferisci includerlo per parità col mirror, segnalalo.
   - Nessun font da CDN esterno (Google Fonts ecc.): tutto locale.
2. **Token Tailwind v4 nel `globals.css`** (sostituendo il placeholder):
   - Font: `--font-display` legato alla variabile di `next/font/local`.
   - Colori brand: `--color-black: #1e1e1e`, `--color-white: #fff`, i due stati
     header, eventuali off-white verificati. Rimpiazza `--color-background`/
     `--color-foreground` placeholder con la palette reale (background bianco,
     foreground `#1e1e1e`).
   - Root font-size fluida (`--size: 1440` + `html { font-size: clamp(...) }`) e
     gutter `--p-l`/`--spacing-gutter`.
   - Stili base `body` (font, line-height:1, smoothing, overflow-x).
3. **Applica il font** in `layout.tsx` (la variabile sul tag `<html>` o `<body>`),
   così la pagina placeholder Fase 0 rende già in Helvetica Now Display.

## Vincoli

- **Non modificare** `apps/hau-nuxt-build/` (READ-ONLY) né altre app/packages. Tutto
  in `apps/hau/`.
- **Nessuna dipendenza nuova** (`next/font` è incluso in Next). Se pensi ne serva
  una, FERMATI e segnala.
- **Nessun componente**, nessun contenuto renderizzato oltre al placeholder
  esistente: questa fase è solo token + font + stili base di elemento.
- Riproduci la mappatura `@font-face` e il meccanismo di root-font-size **fedeli al
  mirror**, non versioni "migliorate".
- `type`-only imports dove serve (regola eslint `consistent-type-imports` attiva).

## Output atteso

- Font woff2 copiati in `apps/hau/app/fonts/` + `apps/hau/app/fonts.ts` (o
  equivalente) con `next/font/local`.
- `apps/hau/app/globals.css` aggiornato coi token reali.
- `apps/hau/app/layout.tsx` che applica il font.

## Done when

- `pnpm --filter hau tsc` verde.
- `pnpm --filter hau lint` verde.
- `pnpm --filter hau build` verde.
- `pnpm --filter hau dev` su http://localhost:3002: la pagina placeholder rende in
  **Helvetica Now Display** (verifica il `font-family` calcolato, non solo che
  builda), su background bianco, testo `#1e1e1e`. Killa il server dopo la verifica.
- I file font sono serviti localmente dall'app (nessuna richiesta a domini esterni
  per i font).
- Confronto col mirror: apri `apps/hau-nuxt-build` (`python3 -m http.server` dalla
  sua dir) e verifica che il font e il colore testo/sfondo di base combacino.

## IMPORTANTE

- **NON committare e NON pushare**: il master revisiona il diff e committa. Lascia
  le modifiche nel working tree.
- Nel report finale elenca: file creati/modificati, quali tagli/italic hai incluso
  e perché, i token colore finali (e se hai incluso o scartato gli off-white caldi),
  l'output dei comandi Done-when, e qualunque ambiguità.
