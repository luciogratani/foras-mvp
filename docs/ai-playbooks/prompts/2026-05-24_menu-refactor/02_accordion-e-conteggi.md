---
status: DONE
created: 2026-05-24
completed: 2026-05-24
area: ai-playbooks
type: prompt
topic: menu-refactor
owner: master-chat
model: claude-sonnet-4-6
effort: high
---

# Sub-task 02 — Accordion + conteggi nel menu admin

> **/model** `claude-sonnet-4-6` · **/effort** `high`
> Cambio strutturale a due componenti client con stato. Il drag-and-drop **resta** in questo sub-task (verrà rimosso nel 03): qui si aggiunge solo il collasso + i conteggi senza rompere il DnD esistente.

## Contesto

`foras` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase, pnpm workspaces) in `/Users/lucio/Desktop/foras-mvp`. Stiamo rifacendo `/dashboard/menu` in `apps/admin` (intermezzo Menu-refactor, **Strada A**: accordion + hardening — vedi `decision-log/decisioni.md` voce 2026-05-24 *Refactor /dashboard/menu*). Oggi la pagina monta in un colpo solo l'intero albero sezioni → categorie → **tutte** le voci: con un menu vero (decine di voci) diventa lunghissima e poco leggibile (rilievi audit `02_ux-workflow-admin-gestore.md` P2-5). Questo sub-task introduce la **progressive disclosure**: sezioni e categorie collassabili con conteggio voci, così a colpo d'occhio si capisce la dimensione del menu e si monta nel DOM solo ciò che è espanso.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce 2026-05-24 *Refactor /dashboard/menu*
- `docs/audit/02_ux-workflow-admin-gestore.md` — rilievo P2-5 (densità/collasso/conteggi)
- `apps/admin/app/dashboard/menu/page.tsx` — Server Component: carica sezioni, categorie e `itemsByCategory`, passa tutto a `SectionList`
- `apps/admin/app/dashboard/menu/_components/SectionList.tsx` — DnD sezioni → `SectionCard`
- `apps/admin/app/dashboard/menu/_components/SectionCard.tsx` — header sezione (grip DnD, switch, rinomina) + lista categorie (DnD) + dialog
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx` — header categoria (grip DnD, switch, modifica/elimina) + lista item (DnD via `ItemRow`) + dialog

## Scope

Trasformare la pagina menu in un **accordion a due livelli** (sezione → categoria), mantenendo intatti tutti i CRUD e il DnD esistente.

1. **Sezioni collassabili** (`SectionCard.tsx`):
   - Stato `open` locale, **collassato di default** (così l'apertura della pagina è una panoramica: 6 intestazioni con i conteggi).
   - Aggiungi un controllo di espansione accessibile: un `<button>` con `aria-expanded` e icona chevron (`ChevronRight`/`ChevronDown` da `lucide-react`, già usata nel progetto) — cliccando l'intestazione (o il chevron) si espande/collassa. **Tienilo distinto dal grip del DnD** (`{...attributes} {...listeners}`): il grip continua a servire il drag, il chevron/intestazione serve il toggle. Non mettere i listener del drag sul controllo di toggle.
   - **Conteggio nell'header**: accanto al nome sezione mostra il totale voci della sezione (somma di tutte le voci di tutte le sue categorie, attive e non), es. `Primi · 12 voci`. Calcolalo da `itemsByCategory` per le categorie della sezione.
   - Quando la sezione è **collassata**, NON renderizzare le categorie (niente `CategoryRow`, niente `DndContext` categorie): solo l'header. Lo switch "Visibile sul sito", il pulsante "Rinomina" e il banner "sezione disattivata" restano coerenti (il banner può comparire sotto l'header anche da collassato, a tua scelta motivata in una riga).

2. **Categorie collassabili** (`CategoryRow.tsx`):
   - Stato `open` locale, **collassato di default**.
   - Stesso pattern: controllo chevron accessibile distinto dal grip DnD; cliccando si espande/collassa.
   - **Conteggio nell'header**: accanto al nome categoria mostra il numero di voci, es. `Pizze · 12 voci`.
   - Quando la categoria è **collassata**, NON renderizzare gli item (niente `ItemRow`, niente `DndContext` item) né il pulsante "+ Aggiungi item": solo l'header (con switch/modifica/elimina). L'avviso "categoria disattivata: le voci non compaiono sul sito" resta quando pertinente.

3. **Dati invariati**: `page.tsx` continua a caricare tutto come ora (eager). A questa scala va bene: il guadagno di questo sub-task è ridurre il **DOM montato** e il carico cognitivo, non il fetch. Non introdurre lazy-loading né nuove server action di fetch.

## Vincoli

- **NON rimuovere il drag-and-drop** in questo sub-task: deve continuare a funzionare per le sezioni (header sempre renderizzato) e per categorie/item quando espansi. La rimozione del DnD e le frecce sono il sub-task 03.
- **NON toccare il service layer** (`packages/supabase`) né lo schema. Nessuna nuova dipendenza (chevron da `lucide-react` già disponibile).
- Mantieni tutti i CRUD e i dialog esistenti funzionanti (rinomina sezione, aggiungi/modifica/elimina categoria, aggiungi/modifica/elimina item, switch attivo/inattivo).
- **Mantieni `export const dynamic = 'force-dynamic'`** in `page.tsx` (invariato).
- Attenzione React 19 + `@dnd-kit`: il `DndContext` annidato usa `id={useId()}` per evitare hydration mismatch (pattern già presente) — preservalo dove il DnD resta montato.
- Accessibilità: il toggle è un `<button type="button">` con `aria-expanded={open}` e un'etichetta comprensibile.

## Output atteso

- `apps/admin/app/dashboard/menu/_components/SectionCard.tsx`: sezione collassabile + conteggio voci totali; categorie renderizzate solo se espansa.
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx`: categoria collassabile + conteggio voci; item renderizzati solo se espansa.
- (Eventuali ritocchi minimi a `SectionList.tsx`/`page.tsx` solo se strettamente necessari per i conteggi; preferibilmente nessuno.)

## Done when

- All'apertura di `/dashboard/menu` si vedono le 6 sezioni **collassate**, ognuna con il conteggio voci; espandendo una sezione compaiono le sue categorie collassate (con conteggio); espandendo una categoria compaiono le sue voci.
- Item e DndContext di categorie/voci **non sono montati** quando il contenitore è collassato (verificabile: l'albero React/DOM di una sezione collassata non contiene `ItemRow`).
- DnD ancora funzionante: riordino sezioni sempre; riordino categorie/voci quando la sezione/categoria è espansa.
- Tutti i CRUD e gli switch continuano a funzionare; i banner "disattivata" restano corretti.
- `pnpm -r exec tsc --noEmit` pulito e `pnpm --filter admin build` verde.
