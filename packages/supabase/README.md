# @repo/supabase

Package condiviso per il client Supabase e il service layer del monorepo.

**Sprint 0:** solo scaffold. Nessun client né servizio implementato.

**Sprint 1** implementerà:
- `client.ts` — `createSupabaseClient()` che legge `NEXT_PUBLIC_SUPABASE_*`
- `src/types/database.ts` — tipi generati da Supabase CLI

**Sprint 2** implementerà i service functions (`getSiteSettings`, `getMenuBySection`, ecc.).

Vedi [docs/README.md](../../docs/README.md) per il contesto progetto completo.
