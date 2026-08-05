# @repo/view — Homepage pubblica (variante di web)

App Next.js 14 (App Router) per la homepage SSR del locale. Variante alternativa di `apps/web`, usata come sandbox per esplorare cambi di UI/contenuto senza toccare la app di produzione. Gira su porta 3003.

## Dev

```bash
pnpm --filter view dev   # → http://localhost:3003
```

## Build e type-check

```bash
pnpm --filter view build
pnpm --filter view tsc --noEmit
```

Vedi [docs/README.md](../../docs/README.md) per il contesto progetto completo.
