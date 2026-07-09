import type { Metadata } from 'next'
import { helveticaNowDisplay } from './fonts'
import { Header } from './_components/Header'
import { LoadingScreen } from './_components/LoadingScreen'
import { Cursor } from './_components/Cursor'
import { RotateScreen } from './_components/RotateScreen'
import { Footer } from './_components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'HAU',
}

/**
 * Shell chrome condivisa (Fase 3a), montata attorno a `{children}` così
 * ogni pagina la eredita. Ordine DOM fedele al mirror
 * (`apps/hau-nuxt-build/index.html`): Header → page content → LoadingScreen
 * → Cursor → RotateScreen → Footer (che monta anche `.navbar`, entrambi
 * figli dello stesso `<footer>` nel mirror — vedi `_components/Footer.tsx`).
 *
 * Non replichiamo i wrapper `#__nuxt`/`#teleports` del mirror: sono
 * scaffolding di mount-point di Vue/Nuxt senza alcuna regola CSS agganciata
 * (verificato contro i blocchi <style> del mirror), quindi omissibili senza
 * perdere fedeltà visiva.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={helveticaNowDisplay.variable}>
      <body className="p_home">
        <Header />
        <div className="page_content">{children}</div>
        <LoadingScreen />
        <Cursor />
        <RotateScreen />
        <Footer />
      </body>
    </html>
  )
}
