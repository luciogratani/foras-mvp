'use client'
import { useActionState } from 'react'
import { CreditCard, ExternalLink } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui'
import type { MetodoPagamento as Metodo } from '../../../../lib/billing/stato'
import { apriPortaleStripeAction, type AccountActionState } from '../actions'

const idle: AccountActionState = { status: 'idle' }

const MARCHE: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  maestro: 'Maestro',
}

/**
 * La carta salvata, e il bottone che manda a cambiarla.
 *
 * Qui dentro non si raccoglie nessun dato di pagamento: il gestionale mostra
 * le ultime quattro cifre e nient'altro, e per qualunque modifica manda al
 * portale di Stripe. È la ragione per cui questa schermata non porta con sé
 * nessun obbligo PCI.
 */
export function MetodoPagamento({
  metodo,
  collegato,
}: {
  metodo: Metodo | null
  /** Vero solo se Stripe è configurato E questo tenant ha un Customer. */
  collegato: boolean
}) {
  const [state, formAction, isPending] = useActionState(
    async () => apriPortaleStripeAction(),
    idle
  )

  const scaduta =
    metodo != null && cartaScaduta(metodo.scadenzaAnno, metodo.scadenzaMese)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metodo di pagamento</CardTitle>
        <CardDescription>
          La carta su cui viene addebitato il rinnovo mensile.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {metodo ? (
          <div className="flex items-center gap-3 rounded-md border p-3">
            <CreditCard className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {MARCHE[metodo.marca] ?? metodo.marca} ···· {metodo.ultime4}
              </p>
              <p className="text-xs text-muted-foreground">
                Scade {String(metodo.scadenzaMese).padStart(2, '0')}/{metodo.scadenzaAnno}
                {scaduta && <span className="ml-1 text-destructive">— carta scaduta</span>}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Nessuna carta salvata. Il rinnovo non potrà essere addebitato finché non ne aggiungi
            una.
          </div>
        )}

        {state.status === 'error' && (
          <p className="mt-3 text-sm text-muted-foreground">{state.message}</p>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 pt-6">
        <form action={formAction}>
          {/*
            Il bottone resta cliccabile anche senza Stripe collegato: l'action
            risponde spiegando perché non si può. Un bottone spento non dice
            niente, e chi lo guarda non sa se aspettare o telefonare.
          */}
          <Button type="submit" variant={metodo ? 'outline' : 'default'} disabled={isPending}>
            <ExternalLink />
            {isPending ? 'Apertura…' : metodo ? 'Aggiorna metodo di pagamento' : 'Aggiungi una carta'}
          </Button>
        </form>
        {collegato && (
          <p className="text-xs text-muted-foreground">
            Si apre il portale sicuro di Stripe. I dati della carta non passano mai dal
            gestionale.
          </p>
        )}
      </CardFooter>
    </Card>
  )
}

/** Una carta vale fino all'ultimo giorno del mese di scadenza incluso. */
function cartaScaduta(anno: number, mese: number, ora: number = Date.now()): boolean {
  const adesso = new Date(ora)
  const fine = new Date(anno, mese, 1)
  return fine.getTime() <= adesso.getTime()
}
