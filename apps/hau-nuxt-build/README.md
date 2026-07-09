# Hau Studio — mirror /archive/ (versione Nuxt completa)

Mirror fedele della pagina archive. A differenza di `hau-archive-clone/` (versione
"stripped" che NON funziona), qui giriamo l'app **Nuxt reale**, che è ciò che orchestra
tutto: rimuove la loading-screen, imposta `data-textures`, crea `window.canvas_elem`
e inietta il motore WebGL `demo.js`.

## Cosa è locale / cosa è online
- ✅ App **Nuxt** (`_nuxt/`: chunk JS+CSS, font, build-manifest) → locale
- ✅ Motore WebGL **`demo.js`** (`/demo.js`) → locale (riferimento patchato in `_nuxt/C7ziGNA7.js`)
- ⚠️ **Immagini delle tile** → ancora dal CDN `offland.wedesignwecode.com` (serve internet)

Per il full-offline manca solo localizzare le immagini e ripuntare i loro URL.

## Come avviarlo

```bash
cd hau-archive-mirror
python3 -m http.server 8780
# apri http://localhost:8780
```
(Serve un server: con `file://` Nuxt e WebGL non partono.)

## Pagine incluse (navbar funzionante)

Mirror multi-pagina: ogni route è un file statico al suo path, così la navbar
funziona sia con click SPA sia con caricamento diretto.

| Route | File |
|-------|------|
| Home `/`         | `index.html` |
| Work `/work/`    | `work/index.html` |
| About `/about/`  | `about/index.html` |
| Contact `/contact/` | `contact/index.html` |
| Archive `/archive/` | `archive/index.html` (la griglia WebGL) |

Ogni cartella ha anche il suo `_payload.json` (dati della route per la navigazione SPA).
NB: le singole case-study dentro `/work/<slug>` NON sono incluse (solo le 5 voci di menu).

## Com'è fatto

- **index.html** — l'HTML SSR originale, intatto, incluso il payload `__NUXT_DATA__`.
- **_nuxt/** — i chunk dell'app Nuxt (6 JS + 2 CSS + 40 font) e il build-manifest
  (`builds/`), serviti in locale così Nuxt fa l'hydration correttamente.
- immagini + `demo.js` → dal CDN originale (online).

## Stato: ✅ VERIFICATO FUNZIONANTE (test headless Chrome)

- canvas WebGL creata e visibile (`window.canvas_elem` presente), 24 tile + 24 titoli
- loading-screen rimossa correttamente da Nuxt
- drag + inerzia + griglia infinita interattivi (verificato: trascinando, la posizione
  interna `cX/cY` insegue il target `tX/tY` con lerp = inerzia)

## Errori innocui in console (ignorabili)

- `[Vercel Web Analytics] Failed to load script` — analytics, non serve.
- `GSAP target .js-pl-numb-1/2/3 not found` e due `Cannot read properties of null` —
  sono il boot del MENU/PRELOADER del sito intero (`demo.js` è l'app completa di Hau).
  Quegli elementi non esistono nella pagina archive isolata: gli errori vengono lanciati
  ma NON bloccano la griglia, che si monta comunque.
- `_payload.json 404` — solo se navighi via SPA verso altre route.
