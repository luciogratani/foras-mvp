# @repo/admin — Pannello di gestione

App Next.js 14 (App Router) per il backoffice del locale. Gira su porta 3001.
Auth e CRUD arrivano in Sprint 1 — qui solo lo scheletro.

## Dev

```bash
pnpm --filter @repo/admin dev   # → http://localhost:3001
```

## Build e type-check

```bash
pnpm --filter @repo/admin build
pnpm --filter @repo/admin tsc --noEmit
```

Vedi [docs/README.md](../../docs/README.md) per il contesto progetto completo.
