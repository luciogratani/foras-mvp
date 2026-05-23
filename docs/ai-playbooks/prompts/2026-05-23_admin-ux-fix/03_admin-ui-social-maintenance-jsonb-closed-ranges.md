---
status: BLOCKED — eseguire solo dopo che Lucio ha applicato il SQL del prompt 02 nel dashboard Supabase
created: 2026-05-23
area: apps/admin + apps/web
type: prompt
model: claude-sonnet-4-6
effort: medium
---

# Admin UX-fix 03 — UI: social, maintenance mode, editor JSONB, chiusure range

## Contesto

`foras-mvp` è un sistema multi-tenant per siti di bar/ristoranti (Next.js 16 + Supabase self-hosted + pnpm workspaces). Il prompt 02 ha esteso lo schema con nuove colonne. Questo task costruisce l'UI admin per quelle colonne e aggiunge la pagina di manutenzione in `apps/web`. Nessuna modifica al service layer (già aggiornato nel 02).

**Prerequisito:** il SQL del prompt 02 (`migration-2026-05-23-schema-extras.sql`) deve essere già stato eseguito nel dashboard Supabase prima di avviare questo task.

## File da leggere prima di iniziare

- `packages/supabase/src/services/site-admin.ts` — `updateSiteSettings`, `addClosedDate`, `getClosedDates`, `getTimeSlotsAdmin`
- `packages/supabase/src/types/database.ts` — nuove colonne `site_settings` (extra_data, social_*, maintenance_mode) e `closed_dates` (end_date)
- `apps/admin/app/dashboard/impostazioni/page.tsx` — form impostazioni esistente
- `apps/admin/app/dashboard/impostazioni/actions.ts` — Server Actions impostazioni
- `apps/admin/app/dashboard/orari/page.tsx` — pagina orari con sezione chiusure straordinarie
- `apps/admin/app/dashboard/orari/actions.ts` — Server Actions orari/chiusure
- `apps/admin/app/dashboard/orari/_components/` — componenti esistenti chiusure
- `apps/web/app/layout.tsx` o `apps/web/app/page.tsx` — per capire dove inserire il check maintenance
- `packages/ui/src/` — componenti UI disponibili (Switch, Input, Textarea, ecc.)

## Scope

### A — Impostazioni: social links

Nella pagina `/dashboard/impostazioni`, sotto la sezione "Contatti" (o come nuova sezione "Social"), aggiungere 3 campi di testo:

- WhatsApp (placeholder: `+39 347 1234567` o URL `https://wa.me/...`)
- Instagram (placeholder: `https://instagram.com/nomeprofilo`)
- Facebook (placeholder: `https://facebook.com/nomeprofilo`)

I campi sono opzionali (nullable). Aggiornarli tramite la Server Action esistente `updateSiteSettingsAction` (passare i nuovi campi al service `updateSiteSettings`).

### B — Impostazioni: editor JSONB `extra_data`

Aggiungere in fondo alla pagina impostazioni una sezione collassabile "Dati avanzati (JSON)" — chiusa di default, espandibile al click (accordion semplice con stato locale `useState`).

Contenuto espanso:
- Avviso visibile: `⚠ Modifica solo se sai cosa stai facendo. Un JSON non valido viene rifiutato.`
- `<Textarea>` monopaziato con il valore corrente di `extra_data` serializzato (`JSON.stringify(value, null, 2)`)
- Validazione client-side: `JSON.parse` al blur/submit — se invalido, mostrare errore inline e bloccare il submit
- Pulsante "Salva dati avanzati" separato dagli altri campi (non salvare insieme al form principale)
- Server Action dedicata `updateExtraDataAction` che chiama `updateSiteSettings({ extra_data: parsedJson })`

Non usare librerie JSON editor — solo `<Textarea>` con validazione manuale.

### C — Impostazioni: toggle manutenzione

Aggiungere in cima alla pagina impostazioni (prima sezione, massima visibilità) un pannello evidenziato:

- Titolo: "Modalità manutenzione"
- Descrizione: "Quando attiva, il sito pubblico mostra solo la pagina di manutenzione. Le prenotazioni e tutti i contenuti sono nascosti."
- `<Switch>` collegato a `maintenance_mode`
- Al toggle: chiamata immediata a Server Action `updateMaintenanceModeAction` (no submit button — azione fire on change)
- Stato visivo distinguibile: quando ON, il pannello mostra un bordo o sfondo arancione/rosso tenue per rendere evidente che il sito è offline

### D — Orari: chiusure straordinarie multi-day

La sezione "Chiusure straordinarie" in `/dashboard/orari` gestisce date singole. Estendere per supportare range:

- Il form di aggiunta diventa: `Data inizio` · `Data fine (opzionale)` · `Motivo (opzionale)`
- Se `Data fine` è valorizzata: deve essere >= `Data inizio` (validazione client-side)
- La lista delle chiusure mostra: data singola (se `end_date` è null) o range "dd/mm/yyyy – dd/mm/yyyy"
- Server Action `addClosedDateAction`: passare `end_date` opzionale al service `addClosedDate`
- La cancellazione (`removeClosedDate`) funziona sull'`id` — invariata

### E — `apps/web`: pagina manutenzione

Aggiungere in `apps/web`:

1. **`apps/web/app/maintenance/page.tsx`** — Server Component con testo "Sito in manutenzione. Torna presto." (placeholder — il design reale verrà personalizzato in Sprint 7). Deve esporre `export const dynamic = 'force-dynamic'`.

2. **Check in `apps/web/app/layout.tsx`** (o nel Server Component radice appropriato): prima di renderizzare i figli, chiamare `getSiteSettings(getWebSupabaseAdmin())` e se `maintenance_mode === true`, fare `redirect('/maintenance')`. Eccetto se la path corrente è già `/maintenance` (evitare loop). Usare `headers()` per leggere il path corrente lato server.

   Attenzione: il check deve essere server-side e non bloccare le route che non servono il sito pubblico (ad esempio `/booking/cancel/[token]` potrebbe restare accessibile — decisione: per semplicità MVP bloccare tutto tranne `/maintenance`).

## Vincoli

- Nessuna dipendenza nuova (niente librerie accordion, niente date picker esterni — usare `<input type="date">` nativo)
- Nessuna modifica al service layer (`packages/supabase/src/services/`)
- `export const dynamic = 'force-dynamic'` sulle pagine che lo hanno già — preservare
- L'editor JSONB non usa `dangerouslySetInnerHTML` né `eval`
- Il toggle manutenzione deve avere feedback visivo immediato (optimistic update o loading state sullo switch)
- `pnpm -r exec tsc --noEmit` exit 0

## Output atteso

- `apps/admin/app/dashboard/impostazioni/page.tsx` — social + editor JSONB + toggle manutenzione
- `apps/admin/app/dashboard/impostazioni/actions.ts` — `updateExtraDataAction`, `updateMaintenanceModeAction` + aggiornamento action impostazioni per i social
- `apps/admin/app/dashboard/orari/_components/` — form chiusure aggiornato per range
- `apps/admin/app/dashboard/orari/actions.ts` — `addClosedDateAction` aggiornata
- `apps/web/app/maintenance/page.tsx` — nuova pagina placeholder
- `apps/web/app/layout.tsx` — check maintenance_mode con redirect
- `pnpm -r exec tsc --noEmit` exit 0, build `web` e `admin` verdi

## Done when

- [ ] I 3 campi social si salvano e ricompaiono al reload della pagina impostazioni
- [ ] L'accordion "Dati avanzati" è chiuso di default; aprendolo si vede il JSON corrente
- [ ] JSON non valido nel textarea blocca il salvataggio con errore inline
- [ ] Il toggle manutenzione si salva immediatamente; il pannello ha stile visivo diverso quando ON
- [ ] Le chiusure straordinarie accettano range (data fine opzionale); la lista mostra il range formattato
- [ ] `apps/web` con `maintenance_mode = true` nel DB → tutte le route pubbliche redirezionano a `/maintenance`
- [ ] `pnpm -r exec tsc --noEmit` exit 0, build `web` e `admin` verdi
