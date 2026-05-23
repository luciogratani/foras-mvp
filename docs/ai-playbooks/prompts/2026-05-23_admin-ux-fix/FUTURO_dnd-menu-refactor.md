---
status: DA SVILUPPARE — non eseguire ora
created: 2026-05-23
area: apps/admin
type: prompt-stub
priority: post-ux-fix
---

# FUTURO — Refactor gerarchia visiva menu + DnD

## Perché esiste questo stub

Audit esterno (P1-1) + valutazione Lucio: il drag-and-drop del menu è inutilizzabile con liste popolose. Non è un mini-fix — è un ripensamento della gerarchia visiva della pagina menu. Rimandato a sprint dedicato dopo i fix correnti.

## Problema da risolvere

- `MenuPage` carica sezioni → categorie → tutti gli item in un'unica pagina piatta, senza collasso né paginazione. Con un menu reale (30+ voci) la pagina diventa lunghissima e ogni `revalidatePath` ricarica tutto.
- DnD con `PointerSensor` puro: nessun `KeyboardSensor`, nessun fallback su/giù. Su tablet/mobile il drag compete con lo scroll della pagina.
- Spostare una voce tra categorie diverse richiede elimina + ricrea (perdita dati allergeni/descrizione).
- Nessuna alternativa tastiera/bottone per l'ordinamento.

## Direzione suggerita (da definire prima di implementare)

1. **Sezioni collassabili** — ogni sezione mostra solo il titolo + conteggio voci; espandibile al click. Riduce drasticamente il DOM iniziale.
2. **Frecce su/giù come alternativa al DnD** — pulsanti `↑ ↓` per ogni item/categoria, sostituibili con DnD per chi preferisce.
3. **Campo "Sposta in categoria"** nel dialog di modifica item — `<select>` con le categorie della stessa sezione. Evita elimina+ricrea.
4. **Valutare rimozione DnD su mobile** — o disabilitarlo con `useSensor` condizionale se `window.matchMedia('(pointer: coarse)')`.

## Trigger per sviluppare

- Primo cliente reale con menu > 20 voci
- Feedback esplicito del gestore sulla difficoltà di riordinamento
- Sprint 7 (UI custom) — il refactor può accompagnare la personalizzazione grafica

## Scope stimato

Prompt dedicato, effort `high`. Tocca: `apps/admin/app/dashboard/menu/`, tutti i componenti `SectionList`, `SectionCard`, `CategoryRow`, `ItemRow`. Potenziale aggiunta di `moveItemToCategory` nel service layer.
