'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Clock,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Lock,
  LogOut,
  Newspaper,
  Settings,
  UtensilsCrossed,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@repo/ui'
import { rottaConsentita } from '../../../lib/billing/rotte'
import type { StatoAbbonamento } from '../../../lib/billing/stato'
import { logoutAction } from '../actions'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Prenotazioni', href: '/dashboard/prenotazioni', icon: CalendarDays, exact: false },
  { label: 'Menu', href: '/dashboard/menu', icon: UtensilsCrossed, exact: false },
  { label: 'Novità', href: '/dashboard/news', icon: Newspaper, exact: false },
  { label: 'Orari & coperti', href: '/dashboard/orari', icon: Clock, exact: false },
  { label: 'Impostazioni', href: '/dashboard/impostazioni', icon: Settings, exact: false },
  // Account resta cliccabile anche ad abbonamento sospeso: è l'unica via
  // d'uscita dal blocco. L'elenco delle rotte superstiti sta in
  // `lib/billing/rotte.ts`, condiviso con `proxy.ts`.
  { label: 'Account', href: '/dashboard/account', icon: CreditCard, exact: false },
]

type Props = {
  email: string | undefined
  siteUrl: string | undefined
  statoAbbonamento: StatoAbbonamento
}

export function AppSidebar({ email, siteUrl, statoAbbonamento }: Props) {
  const pathname = usePathname()
  const sospeso = statoAbbonamento === 'sospeso'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-10 items-center px-2">
          <span className="text-sm font-semibold truncate group-data-[collapsible=icon]:hidden">Foras Admin</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href)
                const bloccata = sospeso && !rottaConsentita(link.href)

                if (bloccata) {
                  // Niente <Link>: la voce resta visibile ma non è più un
                  // bersaglio. Nascondere le voci sarebbe peggio — il gestore
                  // penserebbe di aver perso delle funzioni, non di doverle
                  // sbloccare.
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        aria-disabled
                        tabIndex={-1}
                        tooltip={`${link.label} — bloccato, abbonamento sospeso`}
                        className="cursor-not-allowed opacity-50 hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent"
                        onClick={(e) => e.preventDefault()}
                      >
                        <link.icon />
                        <span>{link.label}</span>
                        <Lock className="ml-auto size-3.5 opacity-70" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={link.label}>
                      <Link href={link.href}>
                        <link.icon />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {siteUrl && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Vedi il sito">
                <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink />
                  <span>Vedi il sito</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <form action={logoutAction} className="w-full">
              <SidebarMenuButton type="submit" tooltip="Esci" className="w-full">
                <LogOut />
                <span>Esci</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        {email && (
          <p className="px-2 py-1 text-xs text-muted-foreground truncate">
            {email}
          </p>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
