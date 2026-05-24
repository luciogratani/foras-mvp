# FUTURO — Polling prenotazioni + notifiche sonore

**Stato:** non implementato. Deciso di rimandare durante l'Intermezzo Admin-UX-2 (2026-05-24).

## Obiettivo

Tenere la pagina `/dashboard/prenotazioni` aggiornata automaticamente mentre il pannello è aperto,
e avvisare il gestore sulle nuove prenotazioni con un toast Sonner + suono di notifica.

## Approccio suggerito

### 1. Auto-refresh via `router.refresh()`

`/dashboard/prenotazioni` è un Server Component con `dynamic = 'force-dynamic'`.  
Il modo più semplice per aggiornarlo è chiamare `router.refresh()` da un Client Component
che avvolge la pagina (o da un `useEffect` in `BookingFilters`).

```tsx
// In BookingFilters (già 'use client')
useEffect(() => {
  const id = setInterval(() => router.refresh(), 30_000)  // ogni 30s
  return () => clearInterval(id)
}, [router])
```

Nessuna modifica al service layer.

### 2. Rilevamento nuove prenotazioni

Per avvisare su prenotazioni "nuove" (arrivate dall'ultimo refresh) serve confrontare
lo snapshot precedente con quello corrente.  
Strategia: passare come prop il `count` di confirmed al Client Component,
confrontarlo nel `useEffect` con un `useRef` che memorizza il valore precedente.

```tsx
const prevCount = useRef(confirmedCount)
useEffect(() => {
  if (confirmedCount > prevCount.current) {
    const delta = confirmedCount - prevCount.current
    toast.success(`${delta} nuova prenotazione`, { duration: 6000 })
    playNotificationSound()
  }
  prevCount.current = confirmedCount
}, [confirmedCount])
```

### 3. Suono di notifica

Usare `Web Audio API` (zero dipendenze) per generare un beep sintetico:

```ts
function playNotificationSound() {
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
}
```

Oppure caricare un file audio `.mp3` in `apps/admin/public/` e usare `new Audio('/notifica.mp3').play()`.

## Considerazioni

- Il refresh deve rispettare i filtri data/turno attivi (non resettarli).
- Se il gestore ha cambiato pagina, il componente è smontato e l'interval è già pulito.
- `router.refresh()` in Next.js App Router fa un full server re-render senza perdere lo stato client.
- Valutare se usare `setInterval` o `visibilitychange` (pausa quando tab non è attiva).

## Trigger di implementazione

Quando il primo cliente reale inizia a usare il pannello e segnala che deve ricaricare
manualmente la pagina per vedere le nuove prenotazioni.
