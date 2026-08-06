# Il turno-finestra spariva al proprio inizio

**Data:** 2026-08-06 · **Commit:** `62f57d6`, `575c5ea`
**Gravità:** alta — il sito pubblico dichiarava il locale chiuso ogni sera

---

## Il sintomo

Il 2026-08-06 alle 19:21, `https://www.universitypoolbar.it/prenota` rispondeva:

> *Per giovedì 6 agosto non ci sono turni: probabilmente siamo chiusi.*

Per il giorno successivo il turno compariva regolarmente. Il locale ha **un turno unico**
`Cena · 19:00 → 23:00 · 30 coperti`, dove `end_time` è **l'ultimo arrivo accettato**.

Quindi: da ogni sera alle 19:01 in poi, il sito dichiarava chiuso un locale aperto — nelle
ore in cui si decide dove andare a cena. E lo faceva **in silenzio**: una lista vuota,
indistinguibile da un giorno di chiusura vera. Nessun errore, niente nei log.

## La causa

`packages/supabase/src/services/bookings.ts`, dentro `getAvailableTimeSlots`:

```ts
if (date === today && slot.time < currentTime) return false
```

Confronta l'**inizio** del turno con l'ora corrente e ignora `end_time`. Alle 19:21 il
turno risulta "già iniziato" e viene scartato, benché la finestra di arrivo sia aperta per
altre tre ore e mezza.

## Perché non era una regola di prodotto

Sembrava una scelta deliberata — nessun ristorante accetta prenotazioni per un turno già
cominciato. L'archeologia dice altro:

| Quando | Cosa |
|---|---|
| **22 mag, 02:15** | `8739e12` introduce il filtro. `time_slots.end_time` **non esiste ancora** |
| **25 mag, 15:03** | `6dd94fd` — *"prenotazione a orario libero nella finestra del turno"* — introduce `end_time` e **non rivede il filtro** |
| **5 ago** | `cc7d2f5` corregge la finestra perché includa l'ultimo arrivo, e **ancora non tocca il filtro** |

Nel decision-log non esiste alcuna voce sul tema. Nessun commento nel codice. Zero
occorrenze di "preavviso" o "lead time" nel repo. Era una regola scritta per un modello di
dati che tre giorni dopo è cambiato, e che nessuno è tornato a rileggere.

## La correzione

La decisione vive ora in un predicato puro, `isSlotStillOpenToday`, in
`packages/supabase/src/lib/timeRange.ts`, accanto alle due funzioni gemelle di cui
condivide il vocabolario. Distingue i **due tipi di turno** che il modello già descrive:

| `end_time` | Significato | Regola |
|---|---|---|
| `NULL` | orario fisso | scade al proprio istante — **invariato** |
| valorizzato | finestra di arrivo | resta prenotabile fino all'ultimo arrivo, incluso |
| valorizzato, oltre la mezzanotte | finestra `22:00–01:00` | dentro la giornata non scade mai |

**Nessun flag per cliente.** Chi vuole "a servizio iniziato non si prenota più" ha già la
leva: lascia `end_time` vuoto e il turno torna a essere un orario fisso.

### Il secondo buco, scoperto per conseguenza

Non esisteva **nessun** confronto fra `preferred_time` e l'ora corrente — verificato a
tutti e tre i livelli: schema Zod, service layer, vincoli del database. Era mascherato dal
fatto che il turno spariva al proprio inizio, quindi non ci si arrivava mai. Rendere il
turno visibile per tutta la finestra lo scopre: alle 22:00 si sarebbe potuto prenotare
dichiarando un arrivo alle 19:30.

`createBooking` ora, per la data odierna, valuta la finestra **residua** `[adesso, end_time]`.

## Come si è verificato

- **138.240 combinazioni** di (orario turno × ora corrente) confrontate fra vecchio e nuovo
  comportamento per i turni a orario fisso: **0 differenze**. Nessun cliente esistente
  cambia comportamento.
- **12 test puri** su `isSlotStillOpenToday`, senza database.
- **3 test di integrazione** che sono i **primi della suite a esercitare `date === today`**.
- Verificato che non passino a vuoto: rimuovendo la correzione, il test sull'arrivo nel
  passato fallisce.
- Verificato in produzione alle 20:04: turno presente, finestra proposta `20:04 – 23:00`.

## La lezione, che vale più del fix

È il **terzo** bug della stessa famiglia in due giorni (dopo le fasce oltre la mezzanotte e
l'ultimo arrivo escluso). La ragione strutturale è emersa solo ora:

**nessun test in tutta la suite esercitava la data odierna.** Venti fixture su venti usano
il 2099, perché `localNow()` non è iniettabile: quel ramo non poteva essere testato, quindi
non è mai stato eseguito in CI. Non è disattenzione, è un pezzo di codice strutturalmente
fuori dalla portata dei test.

Da qui la scelta di estrarre un **predicato puro** invece di correggere sul posto: sposta
la decisione in un punto che i test raggiungono.

Corollario scritto nel codice: in `createBooking`, `slots.find(...)` **non è una lettura, è
un controllo**. Chi lo sostituisse con una `SELECT` diretta su `time_slots` riaprirebbe in
un colpo solo i turni chiusi, i giorni di chiusura straordinaria e i turni fuori orario —
senza che nessun test lo segnali.

## Resta aperto

Il **preavviso minimo** ("non accettare prenotazioni entro N minuti dall'arrivo") è una
funzionalità legittima e diversa da questo bug. Non è stata implementata: si farà quando un
cliente la chiederà davvero, e la sede giusta è una colonna su `time_slots`. Attenzione al
vincolo noto: una colonna nuova su una tabella standard è inutile senza un campo nel
gestionale per editarla, e il gestionale delle tabelle standard è condiviso.
