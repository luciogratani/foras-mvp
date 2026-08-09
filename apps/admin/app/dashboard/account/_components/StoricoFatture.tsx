import { Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, cn } from '@repo/ui'
import { formattaData, formattaEuro, type Fattura } from '../../../../lib/billing/stato'

const ETICHETTE: Record<Fattura['stato'], { testo: string; classe: string }> = {
  pagata: { testo: 'Pagata', classe: 'text-emerald-600 dark:text-emerald-500' },
  fallita: { testo: 'Fallita', classe: 'text-destructive' },
  aperta: { testo: 'In attesa', classe: 'text-amber-600 dark:text-amber-500' },
}

/**
 * Lo storico dei pagamenti. `<table>` a mano come ovunque nel gestionale — le
 * classi sono quelle di `calendario/_components/EventiTable.tsx`.
 */
export function StoricoFatture({ fatture }: { fatture: Fattura[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storico e fatture</CardTitle>
        <CardDescription>
          Ogni addebito del rinnovo, riuscito o no. Le fatture restano scaricabili anche dopo la
          disdetta.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {fatture.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nessun pagamento ancora. La prima fattura compare qui dopo il primo rinnovo.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs font-medium uppercase text-muted-foreground">
                  <th className="pb-2 pr-4">Data</th>
                  <th className="pb-2 pr-4">Numero</th>
                  <th className="pb-2 pr-4">Importo</th>
                  <th className="pb-2 pr-4">Stato</th>
                  <th className="pb-2 text-right">Fattura</th>
                </tr>
              </thead>
              <tbody>
                {fatture.map((f) => {
                  const etichetta = ETICHETTE[f.stato]
                  return (
                    <tr key={f.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 pr-4 text-sm">{formattaData(f.data)}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                        {f.numero}
                      </td>
                      <td className="py-3 pr-4 text-sm">{formattaEuro(f.importoCentesimi)}</td>
                      <td className={cn('py-3 pr-4 text-sm font-medium', etichetta.classe)}>
                        {etichetta.testo}
                      </td>
                      <td className="py-3 text-right">
                        {f.urlPdf ? (
                          <a
                            href={f.urlPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm underline underline-offset-4 hover:no-underline"
                          >
                            <Download className="size-3.5" />
                            PDF
                          </a>
                        ) : (
                          // Un trattino, non un bottone spento: una fattura non
                          // emessa non ha un PDF, e non è un errore da segnalare.
                          <span className="text-sm text-muted-foreground" title="Non ancora emessa">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
