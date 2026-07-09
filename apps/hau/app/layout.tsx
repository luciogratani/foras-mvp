import type { Metadata } from 'next'
import { helveticaNowDisplay } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'HAU',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={helveticaNowDisplay.variable}>
      <body>{children}</body>
    </html>
  )
}
