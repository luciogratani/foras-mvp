import { AlertTriangle, CheckCircle2, CircleDashed, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, cn } from '@repo/ui'
import { formattaData, formattaEuro, type Abbonamento } from '../../../../lib/billing/stato'

/**
 * Lo stato del rinnovo. È la prima cosa della pagina perché è la sola domanda
 * per cui il gestore ci arriva: «sono a posto o no?».
 */
export function StatoRinnovo({ abbonamento }: { abbonamento: Abbonamento }) {
  const { stato } = abbonamento

  // Senza abbonamento non si dice «attivo» con la spunta verde. `stato` vale
  // 'attivo' perché nessuno dev'essere bloccato, ma è una risposta al
  // middleware, non una frase da mostrare: «Abbonamento attivo · 0,00 € al
  // mese · Rinnovo automatico» descriverebbe un contratto che non esiste.
  if (!abbonamento.configurato) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <CircleDashed className="size-5" />
            Nessun abbonamento
          </CardTitle>
          <CardDescription>
            Questo gestionale non ha un abbonamento attivo. Non c&apos;è niente da pagare e
            niente si bloccherà.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const aspetto = {
    attivo: {
      icona: CheckCircle2,
      titolo: 'Abbonamento attivo',
      classe: 'text-emerald-600 dark:text-emerald-500',
      bordo: 'border-emerald-500/40 bg-emerald-500/5',
    },
    in_ritardo: {
      icona: AlertTriangle,
      titolo: 'Pagamento non riuscito',
      classe: 'text-amber-600 dark:text-amber-500',
      bordo: 'border-amber-500/40 bg-amber-500/5',
    },
    sospeso: {
      icona: Lock,
      titolo: 'Abbonamento sospeso',
      classe: 'text-destructive',
      bordo: 'border-destructive/40 bg-destructive/5',
    },
  }[stato]

  const Icona = aspetto.icona

  return (
    <Card className={cn('border', aspetto.bordo)}>
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2', aspetto.classe)}>
          <Icona className="size-5" />
          {aspetto.titolo}
        </CardTitle>
        <CardDescription>
          {formattaEuro(abbonamento.prezzoMensileCentesimi)} al mese, IVA esclusa. Rinnovo
          automatico.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">
              {stato === 'attivo' ? 'Prossimo pagamento' : 'Pagamento scaduto il'}
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {formattaData(abbonamento.prossimoPagamento)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Importo</dt>
            <dd className="mt-1 text-sm font-medium">
              {formattaEuro(abbonamento.prezzoMensileCentesimi)}
            </dd>
          </div>
        </dl>

        {stato === 'in_ritardo' && (
          <p className="text-sm">
            Il gestionale resta attivo fino al{' '}
            <span className="font-semibold">{formattaData(abbonamento.scadenzaTolleranza)}</span>
            {abbonamento.giorniResidui > 0 && (
              <>
                {' '}
                — {abbonamento.giorniResidui}{' '}
                {abbonamento.giorniResidui === 1 ? 'giorno rimasto' : 'giorni rimasti'}
              </>
            )}
            . Aggiorna il metodo di pagamento qui sotto per riprendere subito.
          </p>
        )}

        {stato === 'sospeso' && (
          <p className="text-sm">
            Le funzioni del gestionale sono bloccate dal{' '}
            <span className="font-semibold">{formattaData(abbonamento.scadenzaTolleranza)}</span>.
            Si riattivano appena il pagamento va a buon fine.{' '}
            <span className="text-muted-foreground">Il sito pubblico non è mai stato spento.</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
