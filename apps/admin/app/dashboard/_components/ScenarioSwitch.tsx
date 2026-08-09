'use client'
import { useState } from 'react'
import { FlaskConical, X } from 'lucide-react'
import { cn } from '@repo/ui'
import type { StatoAbbonamento } from '../../../lib/billing/stato'
import { impostaScenarioAction } from '../_lib/scenarioAction'

/**
 * Il pulsante flottante che finge i tre stati dell'abbonamento.
 *
 * Serve a vedere e provare il blocco prima che Stripe esista, e a rivederlo
 * dopo senza smettere di pagare per davvero. Non è montato in produzione:
 * decide `scenarioAbilitato()` in `lib/billing/sorgente.ts`.
 *
 * Volutamente brutto. Deve sembrare un attrezzo, non una funzione del
 * gestionale — se somigliasse al resto, prima o poi finirebbe in uno
 * screenshot per il cliente.
 */

const SCENARI: { valore: StatoAbbonamento; etichetta: string; nota: string; punto: string }[] = [
  {
    valore: 'attivo',
    etichetta: 'Ha pagato',
    nota: 'Tutto operativo',
    punto: 'bg-emerald-500',
  },
  {
    valore: 'in_ritardo',
    etichetta: 'Nei 3 giorni',
    nota: 'Popup di avviso, niente blocchi',
    punto: 'bg-amber-500',
  },
  {
    valore: 'sospeso',
    etichetta: 'Fuori dai 3 giorni',
    nota: 'Sidebar bloccata, solo Account',
    punto: 'bg-red-500',
  },
]

export function ScenarioSwitch({ attivo }: { attivo: StatoAbbonamento }) {
  const [aperto, setAperto] = useState(false)
  const corrente = SCENARI.find((s) => s.valore === attivo) ?? SCENARI[0]

  if (!aperto) {
    return (
      <button
        type="button"
        onClick={() => setAperto(true)}
        // z-index sopra l'overlay del Dialog di Radix (z-50): il pulsante deve
        // restare raggiungibile proprio quando un popup di blocco è aperto,
        // altrimenti lo scenario «sospeso» diventa un vicolo cieco.
        className="fixed bottom-4 right-4 z-[70] flex items-center gap-2 rounded-full border border-dashed border-foreground/40 bg-background/95 px-3 py-2 text-xs font-medium shadow-lg backdrop-blur transition hover:border-foreground"
        aria-label="Simula lo stato dell'abbonamento"
      >
        <FlaskConical className="size-3.5" />
        <span className={cn('size-2 rounded-full', corrente.punto)} aria-hidden />
        <span>{corrente.etichetta}</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] w-72 rounded-lg border border-dashed border-foreground/40 bg-background/95 p-3 shadow-xl backdrop-blur">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            <FlaskConical className="size-3.5" />
            Stato abbonamento
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            Simulazione da sviluppo. Stripe non è collegato: nessun pagamento è reale.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAperto(false)}
          className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Chiudi"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        {SCENARI.map((s) => {
          const selezionato = s.valore === attivo
          return (
            <form key={s.valore} action={impostaScenarioAction}>
              <input type="hidden" name="scenario" value={s.valore} />
              <button
                type="submit"
                aria-pressed={selezionato}
                className={cn(
                  'flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition',
                  selezionato ? 'bg-muted' : 'hover:bg-muted/60'
                )}
              >
                <span className={cn('mt-1 size-2 shrink-0 rounded-full', s.punto)} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs font-medium">{s.etichetta}</span>
                  <span className="block text-[11px] leading-snug text-muted-foreground">
                    {s.nota}
                  </span>
                </span>
              </button>
            </form>
          )
        })}
      </div>
    </div>
  )
}
