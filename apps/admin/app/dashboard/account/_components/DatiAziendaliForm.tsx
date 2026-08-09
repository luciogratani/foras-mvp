'use client'
import { useActionState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@repo/ui'
import type { DatiFatturazione } from '../../../../lib/billing/stato'
import { salvaDatiAziendaliAction, type AccountActionState } from '../actions'

const idle: AccountActionState = { status: 'idle' }

const VUOTI: DatiFatturazione = {
  ragioneSociale: '',
  partitaIva: '',
  codiceFiscale: '',
  indirizzo: '',
  cap: '',
  citta: '',
  provincia: '',
  pec: '',
  codiceSdi: '',
  emailAmministrativa: '',
}

export function DatiAziendaliForm({ dati }: { dati: DatiFatturazione | null }) {
  const [state, formAction, isPending] = useActionState(salvaDatiAziendaliAction, idle)
  const v = dati ?? VUOTI

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Dati aziendali e fatturazione</CardTitle>
          <CardDescription>
            Sono i dati che finiscono sulla fattura. Cambiarli qui vale dalla fattura successiva:
            quelle già emesse non si riscrivono.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-2">
            <Label htmlFor="ragioneSociale">Ragione sociale</Label>
            <Input
              id="ragioneSociale"
              name="ragioneSociale"
              defaultValue={v.ragioneSociale}
              required
              maxLength={200}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="partitaIva">Partita IVA</Label>
              <Input
                id="partitaIva"
                name="partitaIva"
                defaultValue={v.partitaIva}
                required
                inputMode="numeric"
                placeholder="11 cifre"
                maxLength={11}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codiceFiscale">Codice fiscale</Label>
              <Input
                id="codiceFiscale"
                name="codiceFiscale"
                defaultValue={v.codiceFiscale}
                maxLength={16}
                placeholder="Se diverso dalla P.IVA"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="indirizzo">Indirizzo</Label>
            <Input id="indirizzo" name="indirizzo" defaultValue={v.indirizzo} maxLength={200} />
          </div>

          <div className="grid gap-4 sm:grid-cols-[7rem_1fr_6rem]">
            <div className="grid gap-2">
              <Label htmlFor="cap">CAP</Label>
              <Input
                id="cap"
                name="cap"
                defaultValue={v.cap}
                inputMode="numeric"
                maxLength={5}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="citta">Città</Label>
              <Input id="citta" name="citta" defaultValue={v.citta} maxLength={100} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provincia">Prov.</Label>
              <Input
                id="provincia"
                name="provincia"
                defaultValue={v.provincia}
                maxLength={2}
                placeholder="RM"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="pec">PEC</Label>
              <Input id="pec" name="pec" type="email" defaultValue={v.pec} maxLength={200} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codiceSdi">Codice destinatario SdI</Label>
              <Input
                id="codiceSdi"
                name="codiceSdi"
                defaultValue={v.codiceSdi}
                maxLength={7}
                placeholder="6 o 7 caratteri"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Per la fattura elettronica ne serve almeno uno dei due.
          </p>

          <div className="grid gap-2">
            <Label htmlFor="emailAmministrativa">Email per le comunicazioni di pagamento</Label>
            <Input
              id="emailAmministrativa"
              name="emailAmministrativa"
              type="email"
              defaultValue={v.emailAmministrativa}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Ci arrivano ricevute e avvisi di pagamento fallito. Può essere diversa da quella con
              cui accedi.
            </p>
          </div>

          {state.status === 'error' && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          {state.status === 'success' && (
            <p className="text-sm text-emerald-600 dark:text-emerald-500">{state.message}</p>
          )}
        </CardContent>

        <CardFooter className="justify-end pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvataggio…' : 'Salva dati'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
