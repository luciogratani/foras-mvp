import { redirect } from 'next/navigation'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@repo/ui'
import { getUtenteCorrente } from '../../lib/utenteCorrente'
import {
  getAbbonamento,
  getStatoAbbonamento,
  scenarioAbilitato,
} from '../../lib/billing/sorgente'
import { AppSidebar } from './_components/AppSidebar'
import { AvvisoAbbonamento } from './_components/AvvisoAbbonamento'
import { ScenarioSwitch } from './_components/ScenarioSwitch'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Stessa lettura che usa `getAbbonamento()`, deduplicata da `cache()`: due
  // chiamate al server di autenticazione nello stesso rendering erano un giro
  // di rete in più su ogni navigazione.
  const user = await getUtenteCorrente()
  if (!user) redirect('/?reason=unauthenticated')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  // Solo lo stato, che si ricava dai metadati dell'utente già caricato: niente
  // database. È la differenza fra zero e un giro di rete verso la VPS su OGNI
  // pagina del gestionale (~160 ms misurati).
  const stato = await getStatoAbbonamento()

  // L'abbonamento intero — importi, date, carta — serve solo al popup, e il
  // popup esiste solo quando c'è un problema. Nel caso normale, che è quello
  // di sempre, il database non viene toccato affatto.
  const abbonamento = stato === 'attivo' ? null : await getAbbonamento()

  return (
    <SidebarProvider>
      <AppSidebar email={user.email} siteUrl={siteUrl} statoAbbonamento={stato} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="p-8">{children}</main>
      </SidebarInset>
      {abbonamento && <AvvisoAbbonamento abbonamento={abbonamento} />}
      {scenarioAbilitato() && <ScenarioSwitch attivo={stato} />}
    </SidebarProvider>
  )
}
