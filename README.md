# Foras MVP

Multi-tenant website system for bars and restaurants. Each client is a fork of this template repo. Built with Next.js App Router, pnpm workspaces, and Supabase.

For full project context, architecture, and conventions see [docs/README.md](docs/README.md).

---

## Requirements

- Node 20 LTS (use `nvm use` or `fnm use`)
- pnpm 9.x (`npm install -g pnpm@9`)

## Setup

```bash
# Install all workspace dependencies
pnpm install

# Copy env template and fill in your Supabase credentials
cp .env.example apps/web/.env.local
cp .env.example apps/admin/.env.local
```

## Development

```bash
# Start the public website (http://localhost:3000)
pnpm dev:web

# Start the admin panel (http://localhost:3001)
pnpm dev:admin
```

## Other commands

```bash
# Build all apps
pnpm build

# Type-check all workspaces
pnpm typecheck

# Lint all workspaces
pnpm lint
```

## Workspace structure

```
apps/
  web/      → public-facing Next.js site (SSR)
  admin/    → backoffice SPA (Next.js)
packages/
  supabase/ → shared Supabase client and generated types (@repo/supabase)
  ui/       → shared shadcn/ui components (@repo/ui)
migrations/ → numbered SQL migration files (post-freeze)
```

## Smoke test Supabase

After filling in `apps/web/.env.local`, verify the Supabase connection:

```bash
# 1. Start the web app
pnpm dev:web

# 2. In another terminal, hit the health endpoint
curl http://localhost:3000/api/health
# → { "ok": true, "supabase": "reachable" }
```

If env vars are missing you'll get `{ "ok": false, "error": "Missing Supabase env vars: ..." }` with status 500 — no silent crash.

---

See [docs/README.md](docs/README.md) for the full documentation hub.
