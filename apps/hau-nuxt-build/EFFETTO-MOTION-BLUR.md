# Effetto motion-blur su /archive/ (rimosso — documentazione per ripristino)

Questo effetto è stato implementato, testato e poi **rimosso** su richiesta, per lavorare
al sito senza. Qui c'è tutto il necessario per ri-attivarlo identico quando serve.

## Cosa fa

Un motion-blur "minimo e carino" sulla griglia WebGL di `/archive/`: quando trascini,
la griglia prende leggermente più luminosità, saturazione e un filo di blur, proporzionali
alla velocità del movimento. A riposo: nessun effetto.

## Come funziona (scelte di design)

- La griglia di archive è un `<canvas>` WebGL (OGL), non DOM. Quindi l'effetto è un
  **`filter` CSS applicato all'elemento `<canvas>`** (`canvas.gl`), non sulle singole tile.
- **brightness + saturation** via CSS rendono la maggior parte dell'effetto, a costo ~0.
- Il **blur** CSS è isotropo (non direzionale), ma su un drag libero in 2D si legge bene
  come motion blur. Per una scia *direzionale* vera servirebbe lo shader (vedi sotto).
- L'intensità è legata alla **velocità reale** della griglia, letta da `window.canvas_elem`
  (`cX`/`cY` = posizione corrente interpolata): la velocità è lo spostamento per frame.
- **Ramp-in / ease-out** con interpolazione + **clamp** del massimo = effetto morbido,
  mai "da videogioco". È questo, più del tipo di blur, a renderlo elegante.
- Non tocca `demo.js`: legge soltanto stato esistente. Reversibile al 100%.

## Comportamento verificato

- A riposo → `filter: none` (nessun costo).
- Durante drag/inerzia → `brightness(~1.025) saturate(~1.07) blur(~1.2px)` al picco.
- Allo stop → svanisce dolcemente fino a `none`.
- Funziona sia su load diretto di `/archive/` sia arrivando via navigazione SPA
  (la canvas viene ricreata e lo script la ri-aggancia da solo).

## Come ri-attivarlo

1. Ricreare il file `motion-blur.js` nella root del mirror con il contenuto qui sotto.
2. Aggiungere prima di `</body>` (in `archive/index.html`, e nelle altre pagine se vuoi
   che funzioni anche via SPA partendo da Home/Work/ecc.):
   ```html
   <script src="/motion-blur.js" defer></script>
   ```

### Parametri regolabili (in cima al file)
- `MAX_BLUR` / `MAX_SAT` più alti → effetto più marcato.
- `EASE` più basso (es. 0.08) → più morbido/meno nervoso.
- `SPEED_MAX` → a quale velocità si raggiunge il picco.

### Codice completo di `motion-blur.js`

```js
/* Motion-blur "minimo e carino" per la griglia WebGL di /archive/.
   Effetto via CSS filter sul <canvas>, pilotato dalla velocità del drag.
   Non tocca il motore demo.js: legge solo window.canvas_elem (cX/cY).
   Si auto-gestisce: gira di continuo, si attiva quando la canvas esiste
   (anche dopo navigazione SPA) e resta inerte sulle altre pagine. */
(function () {
  "use strict";

  // --- parametri (regolabili) ---
  var SPEED_MAX   = 80;    // px/frame a cui l'effetto è al massimo
  var SPEED_MIN   = 1.5;   // sotto questa soglia: nessun effetto
  var EASE        = 0.12;  // morbidezza ramp-in / ease-out (0..1)
  var MAX_BLUR    = 2.0;   // px
  var MAX_BRIGHT  = 0.04;  // +4%
  var MAX_SAT     = 0.12;  // +12%

  var prevX = null, prevY = null;
  var intensity = 0;       // 0..1 smussata
  var lastApplied = -1;
  var canvas = null;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function frame() {
    var ce = window.canvas_elem;
    var c = document.querySelector("canvas.gl");

    // canvas cambiata (es. dopo SPA nav) o assente
    if (c !== canvas) {
      if (canvas) canvas.style.filter = "";
      canvas = c;
      prevX = prevY = null;
      intensity = 0;
      lastApplied = -1;
    }

    if (c && ce && typeof ce.cX === "number") {
      // velocità reale = spostamento della posizione corrente interpolata
      var target = 0;
      if (prevX !== null) {
        var dx = ce.cX - prevX, dy = ce.cY - prevY;
        var speed = Math.sqrt(dx * dx + dy * dy);
        if (speed > SPEED_MIN) target = clamp01((speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN));
      }
      prevX = ce.cX; prevY = ce.cY;

      // ramp-in / ease-out
      intensity += (target - intensity) * EASE;

      // applica solo se cambia in modo percettibile (evita scritture inutili)
      if (Math.abs(intensity - lastApplied) > 0.005) {
        lastApplied = intensity;
        if (intensity < 0.01) {
          c.style.filter = "";
        } else {
          var b = (1 + MAX_BRIGHT * intensity).toFixed(3);
          var s = (1 + MAX_SAT * intensity).toFixed(3);
          var bl = (MAX_BLUR * intensity).toFixed(2);
          c.style.filter = "brightness(" + b + ") saturate(" + s + ") blur(" + bl + "px)";
          c.style.willChange = "filter";
        }
      }
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
```

## Evoluzione possibile: blur direzionale (shader)

Se in futuro vuoi la scia *direzionale* vera invece dell'isotropo:
- il motore ha già un **post-processing pass** OGL e l'uniform `u_diff` (velocità);
- basterebbe sostituire il fragment del pass con un multi-tap blur lungo il vettore
  velocità, esponendo la velocità come `vec2` (derivabile da `tX-cX` / `tY-cY`).
- Più invasivo (editare GLSL nel `demo.js` minificato), ma resa migliore su movimenti
  veloci mono-asse. Da fare solo se l'isotropo non basta.
