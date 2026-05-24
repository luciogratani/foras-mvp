---
status: TODO
created: 2026-05-25
area: ai-playbooks
type: prompt
topic: menu-refactor
owner: master-chat
model: claude-sonnet-4-6
effort: high
---

# Sub-task 03 — Riordino: hardening (DnD mantenuto, rollback + toast)

> **/model** `claude-sonnet-4-6` · **/effort** `high`
> **Il drag-and-drop si MANTIENE** (decisione rivista 2026-05-25, vedi `decision-log/decisioni.md` voce 2026-05-25). Questo sub-task NON rimuove il DnD e NON aggiunge frecce: aggiunge robustezza e feedback al riordino e ai toggle.

## Contesto

`foras` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase) in `/Users/lucio/Desktop/foras-mvp`. Nel menu admin (`/dashboard/menu`, apps/admin) il riordino DnD a tre livelli (sezioni/categorie/voci) è **fire-and-forget**: la UI applica subito il nuovo ordine in locale e chiama `void reorder*Action(...)` senza guardare l'esito. Se il salvataggio sul server fallisce, la UI resta nell'ordine nuovo ma il DB (e il sito pubblico) restano nel vecchio → **divergenza silenziosa** (rilievo audit `02_ux-workflow-admin-gestore.md`). Inoltre nessuna azione inline (riordino, switch attivo/inattivo) dà conferma visiva. Il sub-task 01 ha già reso le `reorder*Action` capaci di ritornare `{ ok: boolean }`; qui lo si **consuma**.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce 2026-05-25 (DnD mantenuto, hardening)
- `apps/admin/app/dashboard/menu/actions.ts` — `reorder{Sections,Categories,Items}Action` ritornano già `{ ok: boolean }`; `update{Section,Category,Item}Action` ritornano `MenuActionState` (`{ status: 'idle'|'success'|'error', message? }`)
- `apps/admin/app/dashboard/menu/_components/SectionList.tsx` — DnD sezioni (`handleDragEnd`, `void reorderSectionsAction`)
- `apps/admin/app/dashboard/menu/_components/SectionCard.tsx` — DnD categorie (`handleCategoryDragEnd`, `void reorderCategoriesAction`) + switch sezione (`useActionState(updateSectionAction)`)
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx` — DnD voci (`handleItemDragEnd`, `void reorderItemsAction`) + switch categoria/voce (`updateCategoryAction`/`updateItemAction`)
- `apps/admin/app/layout.tsx` — `<Toaster />` è **già montato** (Sonner). Importa `toast` da `@repo/ui`.

## Scope

1. **Rollback ottimistico sui tre riordini** (`SectionList.tsx`, `SectionCard.tsx`, `CategoryRow.tsx`):
   - Prima di applicare l'ordine ottimistico, **cattura l'ordine precedente**.
   - Consuma l'esito della reorder action. Pattern React 19 (transizione async):
     ```ts
     const previous = items
     setItems(reordered)
     startTransition(async () => {
       const res = await reorderItemsAction(reordered.map((x) => x.id))
       if (!res.ok) {
         setItems(previous)               // rollback
         toast.error('Riordino non salvato. Riprova.')
       } else {
         toast.success('Ordine aggiornato')
       }
     })
     ```
   - Applica lo stesso schema ai tre livelli (sezioni, categorie, voci).

2. **Toast sui toggle attivo/inattivo** (switch sezione, categoria, voce):
   - Oggi usano `useActionState(updateXAction, idle)` ignorando lo stato. Cattura lo stato e mostra un toast al cambio: `toast.success('Modifica salvata')` su `status === 'success'`, `toast.error(state.message ?? 'Operazione non riuscita')` su `status === 'error'`, via `useEffect` sullo stato. Evita toast al primo render (`status === 'idle'`).

3. **(Opzionale ma consigliato) accessibilità e touch del DnD**: aggiungi `KeyboardSensor` (con `sortableKeyboardCoordinates`) accanto al `PointerSensor`, e valuta un `TouchSensor` con `activationConstraint: { delay: 200, tolerance: 5 }` così su tablet il drag non parte allo scroll. Se lo fai, applicalo coerentemente ai tre `useSensors`. Se incontri attriti con React 19, fermati e segnala invece di forzare.

## Vincoli

- **NON rimuovere il DnD e NON aggiungere frecce ↑/↓.** Il DnD resta il metodo di riordino.
- **NON modificare il service layer** (`packages/supabase`) né lo schema: il contratto `{ ok }` esiste già dal sub-task 01.
- Nessuna nuova dipendenza (`sonner` e `@dnd-kit` già presenti; `toast` da `@repo/ui`).
- Mantieni l'accordion del sub-task 02 e tutti i CRUD/dialog funzionanti. Mantieni `id={useId()}` sui `DndContext` annidati (hydration React 19).
- `export const dynamic = 'force-dynamic'` su `page.tsx` invariato.
- Messaggi toast in italiano, brevi.

## Output atteso

- `SectionList.tsx`, `SectionCard.tsx`, `CategoryRow.tsx`: riordino con cattura ordine precedente + rollback su `{ ok: false }` + toast; toast sui toggle.
- (Opzionale) sensori `Keyboard`/`Touch` sui `useSensors`.

## Done when

- Un riordino DnD che fallisce lato server **ripristina** l'ordine precedente nella UI e mostra un toast d'errore; un riordino riuscito mostra un toast di conferma. (Per testarlo a mano basta osservare il toast di conferma sul caso normale; il rollback è verificabile leggendo il codice.)
- Attivare/disattivare una sezione/categoria/voce mostra un toast di conferma.
- Il DnD continua a funzionare ai tre livelli; l'accordion è intatto; nessuna regressione CRUD.
- `pnpm -r exec tsc --noEmit` pulito e `pnpm --filter admin build` verde.
