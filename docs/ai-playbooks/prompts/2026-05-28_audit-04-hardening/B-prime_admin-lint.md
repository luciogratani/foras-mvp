---
status: TODO
sprint: post-audit-04
task: B'
created: 2026-05-28
reviewed: 2026-05-29
suggested_model: sonnet
suggested_effort: high
owner: master-chat
---

> ✅ **Revisione master 2026-05-29.** Prompt validato sul codice reale (tutti i 9 problemi e i numeri di riga confermati). Modifiche post-review: la guida al rollback della Categoria 1 è stata corretta (rollback automatico, **niente throw forzato** — vedi sotto), aggiunta trappola `itemCount`/`totalItems`, e ristretta la raccomandazione per `OpeningHoursForm` a `(c) useReducer`.

# B' — Chiudere il lint di `apps/admin` (React 19: `useOptimistic` + entities + postcss)

## Contesto

`foras-mvp` ha CI a 2 job (audit 04 / Stream A). Il primo run reale (28 maggio) ha rivelato che `apps/admin` ha **8 errori + 1 warning di lint** mai visti dai run precedenti, perché `pnpm -r lint` si ferma al primo workspace fallito (`apps/web`, ora verde dopo il punto B chiuso nei commit `16603d0` + `6649631`). Lo Static job della CI **resta rosso** finché questo gap non è chiuso. Nessun bug funzionale: tutti i fix sono allineamenti a regole React 19 + plugin-react-hooks 6 + Next/eslint 16 (stack scelto consapevolmente in `decisioni.md` 2026-05-21).

Riferimenti completi: `docs/audit/04b_followup_2026-05-28_ci-failures-e-modello-isolamento.md` §"Punti aperti" / B'.

## File da leggere prima di iniziare

**Codice da modificare (leggerli interamente prima di toccare):**
- `apps/admin/app/dashboard/news/_components/SlideList.tsx` (48 righe — dnd `useState + useEffect` su prop)
- `apps/admin/app/dashboard/menu/_components/SectionList.tsx` (97 righe — dnd con rollback manuale su errore action)
- `apps/admin/app/dashboard/menu/_components/SectionCard.tsx` (interamente — dnd interno + dialog state)
- `apps/admin/app/dashboard/menu/_components/CategoryRow.tsx` (interamente — dnd interno + dialog state)
- `apps/admin/app/dashboard/orari/_components/TimeSlotList.tsx` (65 righe — **NON ha dnd né optimistic**; lo state è ridondante, vedi sotto)
- `apps/admin/app/dashboard/orari/_components/OpeningHoursForm.tsx` (173 righe — form re-init quando prop cambia, NON optimistic)
- `apps/admin/app/dashboard/menu/_components/EditItemDialog.tsx` (riga 139)
- `apps/admin/app/dashboard/orari/_components/DeleteTimeSlotDialog.tsx` (riga 66)
- `apps/admin/postcss.config.mjs`

**Context architetturale (skim):**
- `apps/admin/app/dashboard/orari/page.tsx` — Server Component padre, mostra come `OpeningHoursForm` e `TimeSlotList` ricevono le prop
- `apps/admin/app/dashboard/menu/page.tsx` — padre di `SectionList`
- `apps/admin/app/dashboard/news/page.tsx` — padre di `SlideList`
- `apps/web/app/_components/NewsPopup.tsx` — esempio già accettato dal master (commit `6649631`) di refactor `useEffect+setState` → `useSyncExternalStore`, per *capire lo standard di refactor che il master accetta*

## Scope

### Inventario problemi (output di `pnpm --filter @repo/admin lint`)

**6 errori `react-hooks/set-state-in-effect`** — tutti lo stesso pattern `setState(prop)` dentro `useEffect([prop])`, ma con **3 sotto-categorie diverse**:

**Categoria 1 — dnd optimistic** (4 file): `SlideList.tsx:15`, `SectionList.tsx:35`, `SectionCard.tsx:56`, `CategoryRow.tsx:52`
- Pattern: `[items, setItems] = useState(prop); useEffect(() => setItems(prop), [prop])`. Server Component re-flusha dopo `revalidatePath` (chiamato dentro la server action) → la prop arriva aggiornata → l'effetto risincronizza lo state locale che era stato mutato ottimisticamente dal drag.
- **Fix richiesto:** refactor a `useOptimistic(prop)` (React 19). Eliminare `useState` + `useEffect` di sync. Chiamare il setter optimistic **dentro** `startTransition(...)` (o l'action stessa), perché React vincola `useOptimistic` ad essere chiamato solo dentro un transition/action.
- `SectionList.tsx` (e analogamente `SectionCard`→cats, `CategoryRow`→localItems): hanno un **rollback manuale** (`setSections(previous)` se l'action ritorna `!res.ok`). **Con `useOptimistic` il rollback è automatico e NON serve toccare le action.** Motivo verificato sul codice (`apps/admin/app/dashboard/menu/actions.ts:238-269`): `reorderSectionsAction/Categories/Items` chiamano `revalidatePath` **solo nel ramo di successo**; su errore ritornano `{ ok: false }` senza revalidare. Quindi:
  - su **successo** → `revalidatePath` aggiorna la prop al nuovo ordine → l'optimistic value, a fine transition, collassa sul nuovo ordine. ✓
  - su **errore** → nessun revalidate → la prop resta l'ordine vecchio → l'optimistic value, a fine transition, torna **automaticamente** all'ordine vecchio. ✓ (rollback gratis)
- **Pattern target** per i 4 file dnd: `const [optimistic, setOptimistic] = useOptimistic(prop)`; in `handleDragEnd` calcoli `reordered = arrayMove(optimistic, …)` e dentro `startTransition(async () => { setOptimistic(reordered); const res = await action(...); if (!res.ok) toast.error(...) else toast.success(...) })`. Elimini `useState` + `useEffect([prop])` + il `setSections(previous)` manuale. Rendi DndContext/SortableContext/`.map` su `optimistic`.
- **NON far throw le action e NON modificarle.** Il rollback manuale `setX(previous)` va rimosso (con `useOptimistic` non esiste più un setter di stato da rollbackare). I `toast.success/error` su esito action restano.
- `SlideList.tsx`: `reorderSlidesAction` ritorna `void` e non c'è rollback manuale → stesso pattern, `setOptimistic(reordered)` dentro la transition, niente gestione `res`.

**Categoria 2 — stato locale ridondante** (1 file): `TimeSlotList.tsx:19`
- Il componente **non ha** né dnd né action ottimistico. `setLocalSlots(slots)` è solo "ri-deriva quando prop cambia" — ma `localSlots` viene usato solo per `.filter(s => s.archived_at === null/!== null)`, calcolabile direttamente da `slots` ad ogni render.
- **Fix richiesto:** eliminare `useState` + `useEffect`, derivare `active`/`archived` direttamente da `slots`. Zero stato, zero effetto, zero regola lint violata. Non serve `useOptimistic`.

**Categoria 3 — form re-init quando prop cambia** (1 file): `OpeningHoursForm.tsx:50`
- Il form tiene uno stato locale complesso (`Record<Day, DayState>` con `closed` + array di `ranges`), inizializzato da `initialHours`. Quando il Server Component re-flusha (dopo save), `initialHours` cambia → l'effetto re-inizializza tutto lo state. NON è optimistic, è "re-init quando server cambia".
- **Tre opzioni, scegliere e motivare in commit:**
  - **(a)** `key` prop sul componente nel parent: `<OpeningHoursForm key={…hash…} initialHours={…} />`. Forza remount → `useState(() => initDayState…)` ri-esegue. *Pro:* zero refactor interno. *Contro:* il parent deve calcolare una chiave significativa (es. `JSON.stringify(initialHours)` o un version-id); brutto se prop è grossa.
  - **(b)** Refactor a `useOptimistic(initialHours)` come "snapshot da cui re-derivare lo state ad ogni render". Compatibile con il setter dentro form actions, ma il form locale ha **molte mutazioni client-only** (toggleClosed, updateRange, addRange, removeRange) che non sono action async — `useOptimistic` non è il pattern giusto qui.
  - **(c)** Refactor a `useReducer` con action `{ type: 'reinit', payload: initialHours }` dispatch-ata da un effetto. **L'effetto chiama `dispatch`, non `setState`** → la regola `react-hooks/set-state-in-effect` non scatta sui dispatch di reducer. *Pro:* zero impatto sul parent, comportamento identico. *Contro:* refactor leggermente più ampio (sostituisce 4 funzioni-handler con altrettante action del reducer).
- **Raccomandazione master (post-review): scegli (c) `useReducer`.** Verificato sul codice: `OpeningHoursForm` riceve **solo** `initialHours: OpeningHours | null` come prop — nessun `updated_at`/version-id naturale. Quindi (a) costringerebbe il parent a calcolare `key={JSON.stringify(initialHours)}`, che (i) viola il vincolo "non modificare i parent Server Components" e (ii) remonta l'intero form ad ogni save. (b) è escluso (le mutazioni sono client-only, non async). (c) è self-contained: 1 reducer con action `reinit` + le 4 azioni `toggleClosed/updateRange/addRange/removeRange`, l'`useEffect([initialHours])` dispatcha `{ type: 'reinit', payload: initialHours }` (la regola `set-state-in-effect` NON scatta sui `dispatch`). Se durante l'implementazione (c) si rivelasse sproporzionato, **fermati e chiedi al master** prima di ripiegare su (a).

**2 errori `react/no-unescaped-entities`** — apostrofi italiani in JSX text:
- `EditItemDialog.tsx:139` — `un'altra` → `un&apos;altra` (o `un’altra`)
- `DeleteTimeSlotDialog.tsx:66` — `l'interruttore` → `l&apos;interruttore`

**1 warning `import/no-anonymous-default-export`** — `apps/admin/postcss.config.mjs`:
- Identico al fix già fatto in `apps/web/postcss.config.mjs` (commit `16603d0`): `const config = {…}; export default config`.

## Vincoli

- **NON modificare nessun file fuori da `apps/admin`** (eccetto `package.json` se necessario per deps, ma non dovrebbe servire).
- **NON modificare DB, schema, RLS, edge functions, service layer in `packages/supabase`**.
- **NON modificare i parent Server Components** se non strettamente necessario (l'opzione (a) per `OpeningHoursForm` è l'unico caso ammesso, e solo se la scelta cade su quella).
- Mantenere identico il **comportamento user-visible** dei dnd (drag aggiorna immediatamente l'UI; se l'action fallisce, l'UI torna allo stato precedente; toast di feedback).
- `pnpm -r tsc --noEmit` deve restare verde.
- `pnpm --filter @repo/admin lint` deve diventare verde (0 errori, 0 warning).
- Niente nuove dipendenze (`useOptimistic`/`useReducer` sono già in `react@19.2.6`).
- **Niente eslint-disable di comodo** per nascondere i 6 errori React 19 — devono essere fix veri. (L'unica eccezione potenzialmente accettabile è in `OpeningHoursForm` se la scelta architetturale richiede un disable mirato e ben commentato — motivare in commit.)

## Trappole note (non commetterle)

- **`useOptimistic` setter fuori da action/transition** → React esplode runtime con "called outside transition". Tutti i `setOptimistic*` devono stare dentro `startTransition(...)` o dentro l'action `useActionState`. Verifica anche per i casi in cui prima il `setSlides(...)` era chiamato fuori dalla `startTransition`.
- **`SectionList` ha un rollback manuale.** Se passi a `useOptimistic` senza far throw l'action, il rollback non avviene. Leggi la sezione "Categoria 1" sopra.
- **`CategoryRow`/`SectionCard` hanno altri `useEffect`** (es. toast su `useActionState` status change). NON toccarli — la regola scatta solo sul pattern `setState(prop)`, non su `setState(derivedFromActionStatus)` perché lì lo state è triggerato dal cambio di `toggleState`, non da una prop.
- **`SectionCard.totalItems` e `CategoryRow.itemCount`/`ItemRow` derivano dalla PROP** (`categories`/`items`), non dallo state dnd (`cats`/`localItems`). È intenzionale e corretto: durante un reorder la *lunghezza* non cambia, solo l'ordine. Lasciali sulla prop — NON convertirli all'optimistic value per "coerenza". Stessa cosa per `cats.length` passato a `DeleteSectionDialog categoryCount`.
- **`OpeningHoursForm` non ha drag-and-drop.** Resistere alla tentazione di applicare `useOptimistic` anche lì — il pattern non aderisce.
- **`TimeSlotList` ha `archivedOpen` come state legittimo** (toggle UI controllato da click utente). Non eliminarlo: elimina solo `localSlots`.
- **Server snapshot e SSR sicuri:** se introduci `useSyncExternalStore` per qualsiasi motivo (non dovrebbe servire qui), garantisci un `getServerSnapshot` non-null per evitare hydration mismatch (vedi `apps/web/app/_components/NewsPopup.tsx` come riferimento).

## Done when

- [ ] `pnpm --filter @repo/admin lint` → 0 errori, 0 warning.
- [ ] `pnpm -r tsc --noEmit` → 0 errori.
- [ ] `pnpm -r lint` (intero monorepo) → 0 errori, 0 warning.
- [ ] Comportamento user-visible dei 4 dnd verificato in browser: drag riordina immediatamente; se l'action fallisce, l'ordine torna allo stato precedente; toast appare.
- [ ] `OpeningHoursForm`: dopo save server-side, il form riflette i dati salvati senza glitch (re-init avviene).
- [ ] `TimeSlotList`: filtri active/archived continuano a funzionare; toggle "archiviati" continua a espandere/collassare.
- [ ] **Commit split** (preferenza master):
  - 1 commit `fix(admin)` per i 4 refactor dnd a `useOptimistic` (includere `TimeSlotList` se ti sembra coerente, oppure separato in `chore(admin)` se vuoi).
  - 1 commit `fix(admin)` per `OpeningHoursForm` (con scelta motivata in body).
  - 1 commit `chore(admin)` per i 2 escape entity + postcss anonymous default.
  - Sentiti libero di accorpare se la sequenza è naturale; *non* fare un unico commit gigante.
- [ ] Ogni commit body breve (2–4 righe), focalizzato sul *perché* non sul *cosa*. Aggiungere il footer:
  ```
  Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
  ```

## Output atteso al master

Quando hai finito, riporta:
1. Lista dei commit creati (hash + subject).
2. Scelta fatta per `OpeningHoursForm` ((a)/(b)/(c)) e motivo in 2 righe.
3. Eventuali eslint-disable usati (file + riga + ragione).
4. Eventuali cose che hai notato fuori scope ma non hai toccato (saranno punti aperti per il master).
5. Conferma esplicita che hai testato in browser i 4 dnd e il form orari, oppure dichiarazione esplicita che non hai potuto e perché.

## Note di esecuzione

- Sei una sub-chat: il master review-erà il diff prima di pushare. Niente push.
- Se incontri una decisione architetturale ambigua oltre le 3 esplicite di `OpeningHoursForm`, **fermati e chiedi al master** invece di prendere la decisione tu.
- Niente refactor opportunistici fuori dai 9 problemi inventariati. Anche se vedi codice migliorabile, ignoralo (master rule: "Don't add features beyond what the task requires").
