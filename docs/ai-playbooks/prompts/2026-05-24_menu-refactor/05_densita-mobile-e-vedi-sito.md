---
status: TODO
created: 2026-05-25
area: ai-playbooks
type: prompt
topic: menu-refactor
owner: master-chat
model: claude-sonnet-4-6
effort: medium
---

# Sub-task 05 — Densità azioni su mobile/tablet + "Vedi sul sito"

> **/model** `claude-sonnet-4-6` · **/effort** `medium`
> Solo UI/responsive in `apps/admin`. Nessuna dipendenza nuova, nessun cambio dati/schema.

## Contesto

`foras` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase) in `/Users/lucio/Desktop/foras-mvp`. Nel menu admin (`/dashboard/menu`), le righe di sezione/categoria/voce hanno più azioni affiancate (switch "Visibile sul sito" + "Modifica"/"Rinomina" + "Elimina"): su schermo stretto (il gestore usa tablet/telefono) vanno a capo o stringono il layout (rilievo audit `02_ux-workflow-admin-gestore.md` P2-6). Inoltre l'audit (P2-1) suggerisce un accesso rapido all'anteprima pubblica.

**Decisione di implementazione (master):** NON si introduce un componente DropdownMenu (`@repo/ui` non lo ha → sarebbe una dipendenza Radix nuova, sproporzionata per 2 sole azioni). Si compatta rendendo le azioni **bottoni-icona su mobile** (icona sola sotto `sm`, icona + testo da `sm` in su), mantenendo le etichette accessibili. Per il "Vedi sul sito": un link globale **esiste già** nella sidebar (`AppSidebar`), quindi qui si aggiunge solo un **link contestuale leggero** nell'header della pagina menu.

## File da leggere prima di iniziare

- `apps/admin/app/dashboard/menu/page.tsx` — header pagina ("Menu"); è un Server Component (può leggere `process.env.NEXT_PUBLIC_SITE_URL`)
- `apps/admin/app/dashboard/menu/_components/SectionCard.tsx` — azioni header sezione: switch + "Rinomina"
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx` — azioni categoria (switch + "Modifica" + "Elimina") e, dentro `ItemRow`, azioni voce (switch + "Modifica" + "Elimina")
- `apps/admin/app/dashboard/_components/AppSidebar.tsx` — riferimento di come è già usato `NEXT_PUBLIC_SITE_URL` e l'icona `ExternalLink`

## Scope

1. **Azioni compatte su mobile** (`SectionCard.tsx`, `CategoryRow.tsx` incluso `ItemRow`):
   - Trasforma i bottoni testuali "Modifica"/"Rinomina"/"Elimina" in bottoni con **icona Lucide** + testo che appare solo da `sm` in su: `<Pencil />` per Modifica/Rinomina, `<Trash2 />` per Elimina, con `<span className="hidden sm:inline">…</span>` per il testo.
   - Ogni bottone-icona deve avere un'etichetta accessibile sempre presente (`aria-label="Modifica"` / `"Elimina"` / `"Rinomina"`), così sotto `sm` (solo icona) resta comprensibile agli screen reader.
   - Lo `Switch` resta com'è (già compatto). L'obiettivo: su schermo stretto le azioni stanno su **una riga** senza andare a capo.
   - Mantieni invariati: grip DnD, chevron accordion, toggle con toast, conteggi.

2. **Link "Vedi sul sito" nell'header del menu** (`page.tsx`):
   - Se `process.env.NEXT_PUBLIC_SITE_URL` è valorizzato, mostra accanto al titolo "Menu" un link `<a href={siteUrl} target="_blank" rel="noopener noreferrer">` con icona `ExternalLink` e testo "Vedi sul sito". Se la env non è settata, non mostrare nulla (nessun errore).
   - Stile minimale e coerente con le utility già in uso (es. `text-sm text-muted-foreground hover:underline inline-flex items-center gap-1`). Niente redesign.

## Vincoli

- **Nessuna dipendenza nuova** (niente DropdownMenu/Radix). Icone da `lucide-react` (già usata). 
- **Nessun cambio a dati/service/schema.** Solo presentazione.
- Mantieni accordion (02), DnD + rollback/toast (03), sposta-categoria + toast dialog (04), tutti i CRUD. `export const dynamic = 'force-dynamic'` su `page.tsx` invariato.
- Verifica il comportamento responsive concettualmente (classi `hidden sm:inline` ecc.); non serve testare in browser (lo fa Lucio).

## Output atteso

- `SectionCard.tsx`, `CategoryRow.tsx` (+ `ItemRow`): azioni come bottoni-icona con testo da `sm`, etichette accessibili.
- `page.tsx`: link "Vedi sul sito" condizionale nell'header.

## Done when

- Su viewport stretto (es. 375px) le azioni di sezione/categoria/voce stanno su una riga (icone), senza wrapping; da `sm` in su ricompare il testo accanto all'icona.
- Le azioni restano accessibili (aria-label) e funzionanti (Modifica/Elimina/Rinomina aprono i rispettivi dialog; lo switch funziona).
- Header `/dashboard/menu` mostra "Vedi sul sito" se `NEXT_PUBLIC_SITE_URL` è settata, altrimenti nulla.
- `pnpm -r exec tsc --noEmit` pulito e `pnpm --filter admin build` verde; nessuna regressione.
