---
status: DONE
sprint: 4
sub-task: "01"
created: 2026-05-21
---

# Sprint 4 / 01 — Hardening auth admin: `getSession()` → `getUser()`

> /model sonnet  
> /effort medium

## Contesto

Progetto foras-mvp: sistema multi-tenant per siti di bar/ristoranti (Next.js 16 + Supabase self-hosted + pnpm workspaces). Questo sub-task chiude un follow-up di sicurezza aperto in Sprint 2.5 (upgrade stack): `apps/admin/app/dashboard/page.tsx` legge l'identità utente con `supabase.auth.getSession()`, che restituisce dati dai cookie senza verifica contro il server Auth. Il supabase-js emette un advisory su questo pattern. La correzione prescritta è usare `supabase.auth.getUser()` per l'identità (chiamata che fa round-trip al server Auth) e aggiornare la firma di `getVerifiedTenantClient` da `(session: Session)` a `(user: User, accessToken: string)`.

**Perché ora:** è codice di sicurezza, indipendente da tutta la logica bookings di Sprint 4. Va chiuso con un commit proprio prima del lavoro più complesso dei sub-task successivi.

**Nota:** la mitigazione attuale è robusta — `proxy.ts` autentica con `getUser()` prima che `/dashboard` renderizzi, quindi un cookie forgiato fallirebbe lì. Questo sub-task porta l'hardening anche dentro `dashboard/page.tsx` come da decisione architetturale.

## File da leggere prima di iniziare

- `docs/build-delivery/backlog.md` — sezione Sprint 2.5, paragrafo "Follow-up di sicurezza aperto" (prescrizione esatta)
- `apps/admin/app/dashboard/page.tsx` — implementazione attuale (da modificare)
- `apps/admin/lib/auth.ts` — `getVerifiedTenantClient` con firma `(session: Session)` (da modificare)
- `apps/admin/lib/supabaseServer.ts` — come si ottiene `getSupabaseServerClient()` (usato internamente per signOut)

## Scope

Modificare **solo** questi due file:

### 1. `apps/admin/lib/auth.ts`

Cambiare la firma di `getVerifiedTenantClient` da:
```typescript
export async function getVerifiedTenantClient(session: Session): Promise<TenantClient>
```
a:
```typescript
export async function getVerifiedTenantClient(user: User, accessToken: string): Promise<TenantClient>
```

Adeguare il corpo:
- `session.user.user_metadata?.schema` → `user.user_metadata?.schema`
- `session.user.id` → `user.id`
- `session.access_token` → `accessToken`
- Il sign-out su verifica fallita già chiama `getSupabaseServerClient()` internamente — non cambia.
- Aggiornare gli import: aggiungere `User` da `@supabase/supabase-js`, rimuovere `Session` se non più usato altrove nel file.

### 2. `apps/admin/app/dashboard/page.tsx`

Sostituire il blocco che legge `getSession()` con questa sequenza:

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/?reason=unauthenticated')

const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/?reason=unauthenticated')

// user viene da getUser() (verificato server-side)
// session.access_token è usato solo per l'header Authorization del TenantClient
const tenant = await getVerifiedTenantClient(user, session.access_token)
```

Il display della pagina usa `user.email ?? user.id` al posto di `session.user.email ?? session.user.id`. Nessun'altra modifica alla struttura della pagina.

## Vincoli

- Modificare solo `apps/admin/lib/auth.ts` e `apps/admin/app/dashboard/page.tsx`.
- Non cambiare la logica di verifica owner su `public.tenants` dentro `getVerifiedTenantClient`.
- Non introdurre nuove dipendenze.
- Non committare — il master esamina e committa.

## Output atteso

- `apps/admin/lib/auth.ts` con firma `(user: User, accessToken: string)` e body aggiornato
- `apps/admin/app/dashboard/page.tsx` con sequenza `getUser()` (identità) + `getSession()` (solo access_token)

## Done when

- `pnpm -r exec tsc --noEmit` exit 0 (tutto il workspace)
- La firma di `getVerifiedTenantClient` accetta `(user: User, accessToken: string)`
- `dashboard/page.tsx` usa `getUser()` per l'identità utente
- `Session` non è importato in `auth.ts` se non più usato
- Nessun file fuori scope modificato
