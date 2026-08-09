import { getAbbonamento } from '../../../lib/billing/sorgente'
import { getFatture } from '../../../lib/billing/fatture'
import { stripeConfigurato, stripeInProva } from '../../../lib/billing/stripe'
import { DatiAziendaliForm } from './_components/DatiAziendaliForm'
import { MetodoPagamento } from './_components/MetodoPagamento'
import { StatoRinnovo } from './_components/StatoRinnovo'
import { StoricoFatture } from './_components/StoricoFatture'

export const dynamic = 'force-dynamic'

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const abbonamento = await getAbbonamento()
  const { reason } = await searchParams

  // Le fatture arrivano da Stripe, non dal database, e solo qui: è l'unica
  // pagina che le mostra, e non vale la pena pagarne la chiamata altrove.
  // Se lo scenario finto è in corso, quelle finte hanno già la precedenza.
  const fatture = abbonamento.fatture.length
    ? abbonamento.fatture
    : await getFatture(abbonamento.stripeCustomerId)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          L&apos;abbonamento al gestionale: dati di fatturazione, metodo di pagamento e storico.
        </p>
      </div>

      {/*
        Il redirect dal proxy atterra qui. Senza una riga che lo spieghi, chi
        clicca «Menu» e si ritrova su Account crede che il gestionale sia rotto.
      */}
      {reason === 'abbonamento-sospeso' && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          Quella pagina è bloccata: l&apos;abbonamento risulta non pagato. Sistema il pagamento
          qui sotto e torna operativo subito.
        </p>
      )}

      {/*
        Chiavi di test: senza questa riga una fattura di prova da 79 € sembra
        una fattura vera, e la si cerca sull'estratto conto.
      */}
      {stripeConfigurato() && stripeInProva() && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <span className="font-semibold">Stripe è in modalità test.</span> Nessun pagamento
          mostrato in questa pagina è reale.
        </p>
      )}

      <StatoRinnovo abbonamento={abbonamento} />
      <MetodoPagamento
        metodo={abbonamento.metodoPagamento}
        collegato={stripeConfigurato() && Boolean(abbonamento.stripeCustomerId)}
      />
      <StoricoFatture fatture={fatture} />
      <DatiAziendaliForm dati={abbonamento.datiFatturazione} />
    </div>
  )
}
