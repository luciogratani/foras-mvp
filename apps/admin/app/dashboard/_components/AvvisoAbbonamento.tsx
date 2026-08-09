'use client'
import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertTriangle, Lock } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui'
import { formattaData, formattaEuro, type Abbonamento } from '../../../lib/billing/stato'

/**
 * I due popup dell'abbonamento: l'avviso dentro la tolleranza e il blocco fuori.
 *
 * Sono due componenti diversi in un file solo perché sono la stessa cosa vista
 * da due lati, e leggerli vicini è l'unico modo per accorgersi che uno si
 * chiude e l'altro no.
 *
 * Su `/dashboard/account` non compare nessuno dei due: è la pagina in cui si
 * risolve il problema, e un popup che copre la soluzione a cui manda lui stesso
 * è un vicolo cieco.
 */

const CHIAVE_SESSIONE = 'foras_avviso_ritardo_visto'

/**
 * Stessa meccanica del `NovitaPopup` del sito, e per lo stesso motivo: leggere
 * `sessionStorage` in un `useEffect` e poi chiamare `setState` è un render a
 * cascata, e il lint lo rifiuta (`react-hooks/set-state-in-effect`). Con
 * `useSyncExternalStore` la lettura è la fonte, non una conseguenza.
 *
 * `sessionStorage` non avvisa la propria scheda — l'evento `storage` nativo
 * arriva solo alle altre — quindi la scrittura ne emette uno a mano.
 */
function sottoscrivi(onChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

function vistoClient(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return Boolean(window.sessionStorage.getItem(CHIAVE_SESSIONE))
  } catch {
    // Navigazione privata su Safari può lanciare. Meglio non mostrare l'avviso
    // che mostrarlo a ogni pagina senza poterlo zittire.
    return true
  }
}

/**
 * Sul server la risposta è sempre «già visto»: così l'HTML arriva senza
 * dialogo, React idrata senza dialogo, e il popup compare solo dopo. Il
 * contrario sarebbe un lampo addosso a chi l'aveva già chiuso.
 */
function vistoServer(): boolean {
  return true
}

export function AvvisoAbbonamento({ abbonamento }: { abbonamento: Abbonamento }) {
  const pathname = usePathname()
  const suAccount = pathname.startsWith('/dashboard/account')

  if (abbonamento.stato === 'attivo' || suAccount) return null
  if (abbonamento.stato === 'sospeso') return <PopupBlocco abbonamento={abbonamento} />
  return <PopupRitardo abbonamento={abbonamento} />
}

/**
 * Dentro i 3 giorni. Si chiude, e una volta chiuso non torna fino al prossimo
 * accesso: chi sta lavorando deve poter lavorare. Stessa logica di
 * `sessionStorage` delle novità sul sito.
 */
function PopupRitardo({ abbonamento }: { abbonamento: Abbonamento }) {
  const visto = useSyncExternalStore(sottoscrivi, vistoClient, vistoServer)

  function chiudi() {
    try {
      window.sessionStorage.setItem(CHIAVE_SESSIONE, '1')
    } catch {
      // Storage negato: l'avviso resta chiuso per questa pagina e ricompare
      // alla prossima. È il male minore.
    }
    window.dispatchEvent(new Event('storage'))
  }

  const aperto = !visto
  const giorni = abbonamento.giorniResidui
  const quanto =
    giorni <= 0
      ? 'entro oggi'
      : giorni === 1
        ? 'entro domani'
        : `entro ${giorni} giorni`

  return (
    <Dialog open={aperto} onOpenChange={(o) => !o && chiudi()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Il pagamento non è andato a buon fine
          </DialogTitle>
          <DialogDescription>
            L&apos;addebito di {formattaEuro(abbonamento.prezzoMensileCentesimi)} del{' '}
            {formattaData(abbonamento.prossimoPagamento)} è stato rifiutato.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <p>
            Il gestionale resta <span className="font-semibold">completamente attivo {quanto}</span>
            . Dopo, l&apos;accesso viene sospeso finché il pagamento non va a buon fine.
          </p>
          <p className="mt-2 text-muted-foreground">
            Il sito pubblico non è coinvolto: resta online in ogni caso.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={chiudi}>
            Più tardi
          </Button>
          <Button asChild>
            <Link href="/dashboard/account" onClick={chiudi}>
              Sistema il pagamento
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Fuori dai 3 giorni. **Non si chiude**: niente X, niente Esc, niente click
 * fuori. L'unica uscita è il bottone che porta ad Account — che è anche
 * l'unica pagina dove il popup non compare.
 */
function PopupBlocco({ abbonamento }: { abbonamento: Abbonamento }) {
  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-5 text-destructive" />
            Gestionale sospeso
          </DialogTitle>
          <DialogDescription>
            L&apos;abbonamento risulta non pagato dal{' '}
            {formattaData(abbonamento.ritardoDal)} e i 3 giorni di tolleranza sono terminati.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <p>
            Le funzioni del gestionale sono bloccate. Puoi ancora accedere ad{' '}
            <span className="font-semibold">Account</span> per aggiornare il metodo di pagamento e
            scaricare le fatture.
          </p>
          <p className="mt-2 text-muted-foreground">
            <span className="font-semibold text-foreground">Il sito pubblico resta online.</span> I
            clienti continuano a vedere menù, orari ed eventi, e a prenotare. Solo la gestione è
            ferma.
          </p>
        </div>

        <DialogFooter>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/account">Vai ad Account</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
