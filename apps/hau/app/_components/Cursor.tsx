/**
 * `.cursor`, il div che nel mirror sostituisce il puntatore reale del
 * sistema (nascosto globalmente via `*{cursor:none!important}`) e lo segue
 * via un listener `mousemove` su `window`, cambiando `data-type`/
 * `data-text` su hover di `.hover_cta` / `.case_image` / `.hover_text2`
 * (vedi `apps/hau-nuxt-build/_nuxt/DOWtmalN.js`).
 *
 * GANCIO PER 3c: aggiungere l'effect con `window.addEventListener('mousemove', ...)`
 * che imposta `top`/`left` sull'elemento, gli handler `mouseenter`/`mouseleave`
 * su `.hover_cta`/`.case_image`/`.hover_text2` che aggiornano `data-type`/
 * `data-text`, e — solo a quel punto — il `*{cursor:none!important}`
 * globale (vedi commento in design-system.css). Fino ad allora questo div
 * resta `visibility:hidden`: senza il listener sarebbe un cerchio nero
 * fermo nella sua posizione statica in-flow invece di seguire il mouse.
 */
export function Cursor() {
  return <div className="cursor" data-type="" style={{ visibility: 'hidden' }} />
}
