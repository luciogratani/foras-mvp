'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container mx-auto px-4 py-24 text-center">
      <h2 className="text-2xl font-semibold mb-4">Si è verificato un errore</h2>
      <p className="text-muted-foreground mb-6">Riprova tra qualche istante.</p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
      >
        Riprova
      </button>
    </main>
  )
}
