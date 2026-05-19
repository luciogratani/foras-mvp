import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Foras',
  description: 'Sito web del locale',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
