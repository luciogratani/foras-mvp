'use client'

import { useEffect, useState } from 'react'

/**
 * Orario live di Copenhagen, riprodotto fedelmente dalla logica Vue del
 * mirror (`apps/hau-nuxt-build/_nuxt/DOWtmalN.js`):
 *
 *   const f = { timeZone: "Europe/Copenhagen", hour: "2-digit",
 *               minute: "2-digit", second: "2-digit", hour12: !1 };
 *   D(".gmt").text(new Intl.DateTimeFormat("en-GB", f).format(new Date()));
 *   // richiamato ogni 1000ms
 *
 * Lo stato iniziale è hardcoded a "00:00:00" — identico sia lato server sia
 * al primo render client, quindi nessun mismatch di hydration — e resta
 * fermo fino al primo tick dell'interval, esattamente come nel mirror:
 * `Td` è semplicemente `window.setInterval` (nessuna chiamata immediata),
 * quindi anche lì l'orologio mostra "00:00:00" per il primo secondo prima
 * di aggiornarsi.
 */
function formatCopenhagenTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Copenhagen',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export function Clock() {
  const [time, setTime] = useState('00:00:00')

  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatCopenhagenTime(new Date()))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="clock_container">
      <span>Copenhagen</span>
      <div className="splitter" />
      <span className="gmt">{time}</span>
    </div>
  )
}
