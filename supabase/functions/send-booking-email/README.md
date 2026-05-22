# send-booking-email — Edge Function

Invia due email via Resend dopo una prenotazione: conferma al cliente + notifica al gestore.
È attualmente **dormiente**: non deployata, non configurata. Il flusso prenotazione funziona identicamente senza di essa.

## Checklist di attivazione

### 1. Verificare il dominio mittente su Resend

1. Accedi a [resend.com](https://resend.com) → Domains.
2. Aggiungi il dominio `foras.*` (es. `foras.it`) e segui le istruzioni per i record DNS.
3. Attendi la verifica (di solito pochi minuti).
4. Scegli o crea l'indirizzo mittente, es. `prenotazioni@foras.it`.

### 2. Impostare i secret della Edge Function

Sul progetto Supabase (Dashboard → Edge Functions → Secrets oppure via CLI):

```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=prenotazioni@foras.it
```

> **Nota:** `RESEND_API_KEY` e `RESEND_FROM` sono secret **esclusivi della Edge Function**.
> Non vanno impostati su Vercel, non vanno aggiunti a `apps/web/.env*`, non compaiono nel bundle browser.
> `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` sono già iniettati automaticamente da Supabase nelle Edge Functions — non serve configurarli.

### 3. Deployare la function

```bash
supabase functions deploy send-booking-email --project-ref <project-ref>
```

Annota l'URL della function (es. `https://<project-ref>.supabase.co/functions/v1/send-booking-email`).

### 4. Attivare il wiring in `apps/web` (Vercel)

Imposta le variabili d'ambiente su Vercel per `apps/web`:

```
BOOKING_EMAIL_ENABLED=true
SEND_BOOKING_EMAIL_URL=https://<project-ref>.supabase.co/functions/v1/send-booking-email
NEXT_PUBLIC_SITE_URL=https://<dominio-del-sito>
```

Da questo momento, ogni prenotazione completata con successo trigger le due email in background.

## Comportamento dormiente

Con `BOOKING_EMAIL_ENABLED` non `'true'` o `SEND_BOOKING_EMAIL_URL` vuoto:
- `notifyBooking.ts` ritorna immediatamente senza alcuna chiamata di rete.
- Console pulita: nessun log, nessun fetch.
- La prenotazione risponde identicamente a prima dell'integrazione.

Con la function deployata ma senza `RESEND_API_KEY`/`RESEND_FROM` configurati:
- La function risponde `200 { ok: true, sent: false, reason: "not configured" }` — no-op innocuo.
