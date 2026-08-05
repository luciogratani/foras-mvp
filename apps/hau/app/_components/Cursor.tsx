'use client'

import { useEffect, useRef } from 'react'

/**
 * `.cursor`, il div che nel mirror sostituisce il puntatore reale del sistema
 * (nascosto via `*{cursor:none}`) e lo segue via un listener `mousemove` su
 * `window` (vedi `apps/hau-nuxt-build/_nuxt/DOWtmalN.js`).
 *
 * Fase 3b: cablato il FOLLOW di base. Al mount aggiungiamo `.cursor-active`
 * su `<html>` — solo allora scatta `html.cursor-active *{cursor:none}` (vedi
 * design-system.css), così senza JS l'utente non resta mai senza cursore — e
 * rendiamo visibile il div, che poi insegue il puntatore (`left`/`top` da
 * `mousemove`). Su mobile il mirror nasconde `.cursor` (`display:none` a
 * max-width:900): il listener resta innocuo lì.
 *
 * DEFERRAL (Fase 3c): gli hover-state del cursore — `data-type='cta'` su
 * `.hover_cta`, `data-type='text'`+`data-text` su `.hover_text`/`.hover_text2`
 * (il CSS di quelle varianti è già in design-system.css) — NON sono cablati
 * qui: richiedono la delega degli eventi hover ed è comportamento di
 * interazione, coerente con lo scope 3c. Per ora il cursore è il cerchio base
 * che segue il mouse.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const root = document.documentElement
    root.classList.add('cursor-active')
    el.style.visibility = 'visible'

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }
    window.addEventListener('mousemove', onMove)

    return () => {
      window.removeEventListener('mousemove', onMove)
      root.classList.remove('cursor-active')
    }
  }, [])

  return <div ref={ref} className="cursor" data-type="" style={{ visibility: 'hidden' }} />
}
