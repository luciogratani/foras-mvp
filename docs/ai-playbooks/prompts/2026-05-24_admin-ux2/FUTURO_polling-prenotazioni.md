---
status: READY
area: apps/admin
task: polling-prenotazioni
created: 2026-05-24
suggested_model: sonnet
suggested_effort: medium
owner: sub-chat
---

# Admin-UX-2 — Polling prenotazioni + notifiche sonore

## Contesto

`foras-mvp` è un gestionale admin multi-tenant (Next.js 16 App Router, React 19, Tailwind 4, shadcn).
La pagina `/dashboard/prenotazioni` è un **Server Component** con `dynamic = 'force-dynamic'`
che mostra le prenotazioni filtrate per data e turno. Il gestore tiene spesso il pannello aperto
tutto il giorno e oggi deve ricaricare manualmente per vedere le nuove prenotazioni.

**Obiettivo:** aggiungere auto-refresh silenzioso (ogni 30 s) + toast Sonner e suono quando
arrivano nuove prenotazioni confermate, senza bloccare mai il lavoro dell'utente.

## File da leggere prima di iniziare

- `apps/admin/app/dashboard/prenotazioni/page.tsx` — Server Component; costruisce `confirmed[]`,
  `cancelled[]`, `slotLookup`, `slotOptions` e li passa ai componenti figli. Devi aggiungere
  `confirmed.length` come prop a `<BookingFilters>`.
- `apps/admin/app/dashboard/prenotazioni/_components/BookingFilters.tsx` — già `'use client'`,
  usa `useRouter` e `usePathname`. Qui va tutta la logica di polling + notifica.
- `apps/admin/app/layout.tsx` — `<Toaster richColors position="bottom-right" />` già montato;
  `toast` importabile da `@repo/ui`.
- `packages/ui/src/index.ts` — verifica che `toast` sia esportato da `@repo/ui` (lo è).

## Scope — cosa implementare

### 1. Auto-refresh (`BookingFilters.tsx`)

Aggiungi un `useEffect` che chiama `router.refresh()` ogni 30 secondi.
Il refresh Next.js App Router riesegue il Server Component con gli stessi searchParams (URL invariato):
i filtri data/turno restano attivi. Se il gestore cambia pagina il componente si smonta e
l'interval viene pulito automaticamente dal cleanup.

Ottimizzazione: salta il refresh se la tab è in background (`document.hidden`); appena
la tab torna visibile, fa un refresh immediato.

```tsx
useEffect(() => {
  const tick = () => { if (!document.hidden) router.refresh() }
  const id = setInterval(tick, 30_000)
  const onVisible = () => { if (!document.hidden) router.refresh() }
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    clearInterval(id)
    document.removeEventListener('visibilitychange', onVisible)
  }
}, [router])
```

### 2. Rilevamento nuove prenotazioni + toast (`BookingFilters.tsx`)

`BookingFilters` riceve un nuovo prop `confirmedCount: number` (passato da `page.tsx` come
`confirmed.length`). Traccia il valore precedente con un `useRef` che memorizza anche la data
corrente — così quando il gestore cambia filtro data il ref si azzera silenziosamente (evita
falsi positivi se la nuova data ha meno prenotazioni).

```tsx
const prevRef = useRef({ date: currentDate, count: confirmedCount })

useEffect(() => {
  if (currentDate !== prevRef.current.date) {
    prevRef.current = { date: currentDate, count: confirmedCount }
    return
  }
  if (confirmedCount > prevRef.current.count) {
    const delta = confirmedCount - prevRef.current.count
    toast.success(
      delta === 1 ? '1 nuova prenotazione confermata' : `${delta} nuove prenotazioni confermate`,
      { duration: 6000 }
    )
    playNotificationSound()
  }
  prevRef.current = { date: currentDate, count: confirmedCount }
}, [confirmedCount, currentDate])
```

### 3. Suono di notifica (`BookingFilters.tsx`)

Funzione locale, zero dipendenze, usa Web Audio API. Definita nello stesso file, chiamata solo
dal `useEffect` sopra.

```ts
function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch {
    // AudioContext bloccato da browser (policy autoplay) — silenzio silenzioso
  }
}
```

Il `try/catch` è necessario: alcuni browser bloccano `AudioContext` se non c'è stato un gesto
utente recente. In quel caso il toast appare comunque, solo senza suono.

### 4. Modifica `page.tsx`

Passa `confirmedCount={confirmed.length}` a `<BookingFilters>`. Nessun'altra modifica.

### 5. Aggiorna il tipo `Props` di `BookingFilters`

```tsx
type Props = {
  slotOptions: SlotOption[]
  currentDate: string
  currentSlotId: string
  confirmedCount: number   // ← nuovo
}
```

## Vincoli

- **Nessuna modifica al service layer** (`@repo/supabase`).
- **Nessuna nuova dipendenza** (Web Audio API nativa, `toast` già in `@repo/ui`).
- **Nessuna modifica schema DB**.
- Il polling deve essere **completamente silenzioso** quando non ci sono nuove prenotazioni:
  nessun indicatore visivo di "aggiornamento in corso", nessun flash UI.
- Il toast deve apparire solo per incrementi (mai per decrementi — es. cancellazione).
- `playNotificationSound` non deve mai throw (il `try/catch` la rende safe).

## Done when

- `pnpm -r exec tsc --noEmit` exit 0
- `pnpm --filter admin build` exit 0
- **Smoke test manuale:** aprire `/dashboard/prenotazioni`, attendere che una nuova prenotazione
  venga inserita (o crearne una dal sito pubblico), verificare che entro 30 s appaia il toast
  Sonner + si senta il beep
- **Edge case:** cambiare il filtro data mentre il polling è attivo — nessun toast spurio
