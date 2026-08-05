'use client'

import { useEffect, useRef } from 'react'

export type ArchiveTile = {
  src: string
  title?: string
  desc?: string
}

// Contratto DOM richiesto da /public/demo.js (motore WebGL riusato 1:1 da
// hau.studio/archive — vedi apps/hau-nuxt-build). Non rinominare le classi
// js-grid / js-grid-bounds / js-tile / js-grid-text / js-grid-content /
// js-grid-focused: sono lette così come sono dal bundle minificato, senza
// sourcemap, quindi non modificabile lato nostro.
const PLACEHOLDER_TILE: ArchiveTile = { src: '/tile-placeholder.svg' }
const TILE_COUNT = 18

// Foto reali (Unsplash) scaricate in public/avif in attesa di scatti propri
// di Tris Barz. Fallback su PLACEHOLDER_TILE se l'array risultasse vuoto.
const AVIF_FILES = [
  'photo-1511130558090-00af810c21b1.avif',
  'photo-1593558628703-535b2556320b.avif',
  'photo-1631384682706-0bf244d9a4e9.avif',
  'photo-1707814323251-67b7f8e7bb74.avif',
  'photo-1724845537476-3f73a4d7adbb.avif',
  'photo-1725830320194-1b0396e37417.avif',
  'photo-1748674754166-f84c8d1d77e6.avif',
  'photo-1776168290664-4634c52227d7.avif',
  'photo-1781456507249-42942c172ed0.avif',
  'photo-1783201033923-31d14804da1c.avif',
  'photo-1783321284120-61d9a47c92a1.avif',
  'premium_photo-1661476059001-e212bf8f7534.avif',
  'premium_photo-1672242676563-c28b2ac5555b.avif',
  'premium_photo-1679926565650-61633a3135fa.avif',
  'premium_photo-1679926660218-8d35a2e2c2e1.avif',
  'premium_photo-1682681906293-2113d2e6cc82.avif',
  'premium_photo-1697729900945-598459160f7b.avif',
  'premium_photo-1724290313149-29f75c5f3b9a.avif',
  'premium_photo-1724290313996-8487a15fd629.avif',
]
const DEFAULT_TILES: ArchiveTile[] = AVIF_FILES.map((file) => ({ src: `/avif/${file}` }))

function buildTiles(tiles: ArchiveTile[] | undefined): ArchiveTile[] {
  const source = tiles && tiles.length > 0 ? tiles : DEFAULT_TILES.length > 0 ? DEFAULT_TILES : [PLACEHOLDER_TILE]
  const out: ArchiveTile[] = []
  while (out.length < TILE_COUNT) {
    for (const tile of source) {
      if (out.length >= TILE_COUNT) break
      out.push(tile)
    }
  }
  return out
}

declare global {
  interface Window {
    canvas_elem?: { unmount: () => void }
  }
}

// demo.js è un bundle classico (non-module): rieseguirlo due volte nella
// stessa pagina (React StrictMode / Fast Refresh rimontano gli effect senza
// un vero unmount del DOM) crea un secondo contesto WebGL/rAF loop mentre il
// primo canvas viene rimosso, lasciando lo stato incoerente — "non vedo
// nulla" nasce da lì. Un guard a livello di modulo lo rende idempotente:
// una volta avviato, resta l'unica istanza per tutta la vita della pagina.
let archiveEngineBooted = false

export function ArchiveHero({ tiles }: { tiles?: ArchiveTile[] }) {
  const gridRef = useRef<HTMLDivElement>(null)
  const items = buildTiles(tiles)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid || archiveEngineBooted) return
    archiveEngineBooted = true

    // Stesso boot sequence del componente Vue originale: attributo
    // data-textures (non usato dal solo motore griglia, ma mantenuto per
    // fedeltà) + script iniettato a runtime, mai in SSR.
    document.body.setAttribute('data-textures', '[]')
    const script = document.createElement('script')
    script.src = '/demo.js'
    document.body.appendChild(script)
  }, [])

  return (
    <section className="archive-hero">
      <div className="js-grid archive-hero__grid" ref={gridRef}>
        <div className="js-grid-bounds archive-hero__bounds">
          {items.map((tile, i) => (
            <div className="archive-hero__cell" key={i}>
              <div className="aspect" style={{ ['--aspect' as string]: '125%' }} />
              <div
                className="js-tile archive-hero__tile"
                data-src={tile.src}
                style={{ backgroundImage: `url(${tile.src})` }}
              />
            </div>
          ))}
          <div className="archive-hero__overlay">
            <div className="js-grid-focused archive-hero__focused" aria-hidden="true" />
            <div className="js-grid-content archive-hero__content">
              {items.map((tile, i) => (
                <p className="js-grid-text archive-hero__text" key={i}>
                  {tile.title && <b>{tile.title}</b>}
                  {tile.desc && <span>{tile.desc}</span>}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
