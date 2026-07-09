import Link from 'next/link'
import type { Menus } from '@/content/types'
import menus from '@/content/menus.json'

const { main: menuItems } = menus as Menus

/**
 * Navbar (`.navbar`), la pillola fluttuante fissa in basso con le 5 voci.
 *
 * IMPORTANTE (fedeltà al mirror): nel sito originale `.navbar` è SEMPRE
 * visibile — non è un hamburger che si apre/chiude. Il markup
 * `.close_menu` ("close") è nascosto di default via CSS
 * (`opacity:0;visibility:hidden`, vedi design-system.css) e diventa
 * visibile solo con la classe `.active`, aggiunta via JS altrove nel
 * bundle Vue (dal click sul logo mentre una vista è "espansa" — non è
 * risultato chiaro se/dove sia il vero trigger di apertura del menu
 * principale; da verificare in 3c leggendo meglio `_nuxt/DOWtmalN.js`).
 * Qui riproduciamo lo stato "chiuso" di `.close_menu` semplicemente
 * lasciando che il CSS del mirror faccia il suo lavoro (nessuno stato
 * React necessario per questo).
 *
 * `.bg_border` (la pillola nera dietro alla voce attiva/hover) nel mirror
 * viene posizionata via JS on-mount + su mouseenter/mouseleave/resize/click
 * sul logo (vedi `_nuxt/DOWtmalN.js`, dentro `Fd.setup`). GANCIO PER 3c:
 * quello stesso JS va riscritto come effect + handlers qui, leggendo
 * `.position()`/`.width()` dell'elemento `.router-link-active` o `.hover`
 * e impostando `transform`/`width` su `.bg_border`. In 3a resta a
 * `width:0` (invisibile, nessun highlight) perché non c'è ancora quel
 * comportamento.
 *
 * Route attiva: al momento esiste solo `/` (page.tsx placeholder), quindi
 * "Home" è marcata attiva staticamente (come farebbe l'SSR del mirror per
 * quella route). Quando la 3b+ introdurrà le altre pagine, l'active-state
 * per route reali richiederà `usePathname` (client) — Nav dovrà diventare
 * `'use client'` a quel punto, o l'active-state andrà derivato in altro
 * modo lato server.
 */
export function Nav() {
  return (
    <div className="navbar">
      <ul>
        <li className="close_menu hover_cta">
          <span className="sub_m">close</span>
        </li>
        {menuItems.map((item) => {
          const isHome = item.path === '/'
          return (
            <li key={item.path} className="menu_item hover_cta">
              <Link
                href={item.path}
                aria-current={isHome ? 'page' : undefined}
                className={isHome ? 'router-link-active router-link-exact-active sub_m' : 'sub_m'}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
        <div className="bg_border" />
      </ul>
    </div>
  )
}
