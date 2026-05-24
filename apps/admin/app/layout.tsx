import type { Metadata } from 'next'
import { Toaster } from '@repo/ui'
import './globals.css'

export const metadata: Metadata = {
  title: 'Foras Admin',
  description: 'Pannello di gestione del locale',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
