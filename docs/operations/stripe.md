# Stripe — come funziona e come si collega

Come accendere l'abbonamento del gestionale per un cliente. Il codice c'è tutto:
quello che manca sono un account Stripe, quattro variabili d'ambiente e una
migrazione.

> Nel testo `<schema>` è lo schema del tenant: il valore della colonna
> `schema_name` in `public.tenants`, che è anche la chiave con cui il webhook
> capisce a chi appartiene un evento.

> Scritto il 2026-08-07 (notte), contro `stripe` 22.4.0 e API `2026-07-29.dahlia`.
> Se aggiorni il pacchetto, la versione dell'API si aggiorna insieme — mai da sola.

---

## Parte 1 — Come funziona Stripe, in cinque minuti

Non serve sapere tutto. Servono quattro oggetti e una regola.

### I quattro oggetti

**Customer** — il cliente. Uno per bar. Contiene ragione sociale, indirizzo,
email, partita IVA (in un sotto-oggetto `tax_ids`) e un sacchetto libero di
`metadata` dove noi mettiamo PEC, codice SdI e — importante — `schema_name`,
cioè a quale tenant appartiene.

**Product e Price** — cosa vendi e a quanto. Il Product è «Gestionale foras»,
il Price è «79 € al mese». Un Product può avere più Price: è così che clienti
diversi pagano cifre diverse senza duplicare il prodotto.

**Subscription** — il contratto fra un Customer e un Price. È l'oggetto che dice
«questo bar paga 79 € il 12 di ogni mese». Ha uno `status`: `active`,
`past_due` (un pagamento è fallito), `canceled`, e qualche altro.

**Invoice** — la fattura di un singolo mese. Stripe la genera da sola a ogni
rinnovo, tenta l'addebito, e la marca `paid` o la lascia `open`.

### La regola

**Stripe non dice a nessuno cosa succede, a meno che tu non glielo chieda.**

Il tuo server può interrogarlo (`stripe.subscriptions.retrieve(...)`), ma farlo
a ogni pagina è lento e fragile. La strada giusta è l'opposto: Stripe chiama
**te** quando qualcosa cambia. Quella chiamata si chiama **webhook**, ed è un
semplice POST a un tuo indirizzo, con dentro l'evento.

Nel gestionale quell'indirizzo è:

```
POST /api/stripe/webhook
```

Riceve l'evento, capisce di che tenant si tratta, e scrive in
`public.tenant_subscriptions`. Da quel momento il gestionale sa se il cliente ha
pagato **senza mai richiamare Stripe**.

### Il pezzo che sorprende: il Customer Portal

Non serve costruire nessuna pagina di pagamento. Si chiede a Stripe un link
temporaneo, ci si manda l'utente, e Stripe fa tutto: carta, 3D Secure, fatture
da scaricare, disdetta.

Conseguenza concreta e importante: **nel gestionale non passa mai un numero di
carta**, quindi non ci sono obblighi PCI da rispettare. È il motivo per cui il
bottone «Aggiorna metodo di pagamento» è un redirect e non un modulo.

---

## Parte 2 — Cosa è già scritto

| Pezzo | Dove | Stato |
|---|---|---|
| Tabella dello stato | `migrations/005_tenant_subscriptions.sql` | scritta e provata, **da applicare** (passo 1) |
| Client Stripe | `apps/admin/lib/billing/stripe.ts` | pronto |
| Lettura/scrittura tabella | `apps/admin/lib/billing/deposito.ts` | pronto |
| Da dove arriva lo stato | `apps/admin/lib/billing/sorgente.ts` | pronto |
| Webhook | `apps/admin/app/api/stripe/webhook/route.ts` | pronto |
| Claim per il middleware | `apps/admin/lib/billing/claim.ts` | pronto |
| Blocco | `apps/admin/proxy.ts` | pronto |
| Portale + dati fiscali | `apps/admin/app/dashboard/account/actions.ts` | pronto |
| Fatture | `apps/admin/lib/billing/fatture.ts` | pronto |
| Schermate | `apps/admin/app/dashboard/account/` | pronte |

**Finché `STRIPE_SECRET_KEY` non c'è, tutto questo dorme e non rompe niente.**
Il gestionale funziona come oggi, la pagina Account dice «nessun abbonamento
attivo», e nessuno viene bloccato.

---

## Parte 3 — La configurazione, nell'ordine giusto

### Passo 1 — Applicare la migrazione

Prima di tutto il resto: senza tabella, il webhook non ha dove scrivere.

> Su un'installazione dove è già stata applicata il runner la trova tracciata e
> risponde `SKIP`: rieseguirla non fa danni, è idempotente.

```bash
ssh foras-vps
cd /percorso/del/repo    # dove sta il runner sulla VPS
DATABASE_URL="postgresql://postgres@/postgres?host=/var/run/postgresql" \
  bash scripts/migrate.sh
```

È una migrazione **root** (`005`), quindi niente `MIGRATIONS_DIR` e niente
`--schema`: va a tutti i tenant. Gli oggetti che crea sono però **uno solo**,
condiviso — come la `004`. Rieseguirla non fa danni: è idempotente, verificata
su tre applicazioni di fila.

Poi, perché PostgREST veda la tabella nuova:

```bash
ssh foras-vps "docker exec -i supabase-db psql -U postgres -c \"NOTIFY pgrst, 'reload schema'\""
```

⚠️ **Non** riavviare `supabase-rest`: serve anche `alex_akashi` e `underclub`.

> ⚠️ **Questo passo è obbligatorio, non una cortesia.** Una versione precedente di
> questa nota diceva il contrario — «il gestionale legge con `service_role` lato
> server e non passa da PostgREST» — ed era falso: `deposito.ts` usa
> `getSupabaseAdmin()`, cioè un client supabase-js che parla con l'API REST. La
> `service_role` non è una scorciatoia che scavalca PostgREST, è un JWT con
> `BYPASSRLS`: la richiesta passa da Kong e da PostgREST come tutte le altre.
> Senza il reload, la prima scrittura del webhook fallisce con `PGRST205 Could not
> find the table 'public.tenant_subscriptions' in the schema cache`, Stripe si
> prende un 500 e ricomincia a ritentare per giorni.

### Passo 2 — Creare l'account Stripe

<https://dashboard.stripe.com/register>. Serve la partita IVA di foras e un
conto corrente per gli incassi.

**Resta in modalità test finché non hai provato tutto.** L'interruttore
«Modalità test» è in alto a destra. Le chiavi di test iniziano con `sk_test_` e
il gestionale se ne accorge: la pagina Account mostra un avviso giallo, così
nessuno scambia una fattura di prova per una vera.

### Passo 3 — Creare il prodotto e il prezzo

Dashboard → **Catalogo prodotti** → **Aggiungi prodotto**.

- Nome: `Gestionale foras`
- Modello di prezzo: **Ricorrente**, mensile
- Importo: `79,00 EUR`

Salva. Ti serve l'id del **Price**, quello che comincia con `price_`.

> Un prodotto solo, un Price per fascia di prezzo. Quando il cliente #2 pagherà
> una cifra diversa, aggiungi un secondo Price allo stesso prodotto — non un
> secondo prodotto.

### Passo 4 — Creare il cliente

Dashboard → **Clienti** → **Aggiungi cliente**.

- Nome: la ragione sociale vera
- Email: quella a cui devono arrivare ricevute e avvisi
- Indirizzo di fatturazione: quello vero
- Partita IVA: **Aggiungi ID fiscale** → tipo `IT VAT` → `IT` + le 11 cifre

Poi, **la cosa da non dimenticare**: in fondo alla scheda cliente c'è
**Metadati**. Aggiungi:

| Chiave | Valore |
|---|---|
| `schema_name` | `<schema>` — lo schema del tenant in `public.tenants` |
| `pec` | la PEC del bar |
| `codice_sdi` | il codice destinatario |

`schema_name` **è obbligatorio**. È così che il webhook capisce a quale tenant
appartiene l'evento la prima volta, quando sul database non c'è ancora niente
che colleghi il customer al bar. Senza, il primo evento arriva, non trova a chi
darlo, e si perde con un avviso nei log.

> ⚠️ **Fino al 2026-08-09 questo passo non serviva a niente**, ed è il difetto
> che il Passo 0 ha fatto emergere. Nei payload dei webhook Stripe non espande
> mai i riferimenti: `sub.customer` arriva come stringa, non come oggetto,
> quindi i metadati del Customer non erano leggibili da nessuna parte tranne
> che negli eventi `customer.updated`. Il webhook li chiede ora esplicitamente
> a Stripe quando né l'evento né il database sanno rispondere
> (`lib/billing/tenant.ts`). Se un giorno quella terza strada venisse
> «semplificata» via, questo passo tornerebbe a essere decorativo e l'onboarding
> di ogni cliente nuovo fallirebbe in silenzio.

### Passo 5 — Creare l'abbonamento

Dalla scheda del cliente → **Crea abbonamento** → scegli il Price da 79 €.

Se vuoi far partire il conteggio dal mese prossimo, imposta una data di inizio.
Se il cliente ha già pagato in altro modo, puoi aggiungere un credito.

### Passo 6 — Le chiavi

Dashboard → **Sviluppatori** → **Chiavi API**. Copia la **chiave segreta**
(`sk_test_…` in test, `sk_live_…` in produzione).

### Passo 7 — Il webhook

Dashboard → **Sviluppatori** → **Webhook** → **Aggiungi endpoint**.

- URL: `https://admin.<dominio-del-cliente>/api/stripe/webhook`
- Eventi da inviare — **esattamente questi sei**:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.updated`

Salvato l'endpoint, Stripe mostra un **segreto di firma** (`whsec_…`). Copialo.

> Il codice ignora con un 200 qualunque altro evento, quindi sottoscriverne di
> più non rompe niente — ma ogni evento in più è una chiamata inutile al tuo
> server.

### Passo 8 — Le variabili d'ambiente

Su Vercel → progetto `<cliente>-foras-admin` → **Settings** → **Environment
Variables**, in **Production**:

| Variabile | Valore |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` (o `sk_test_…` per provare) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` del passo 7 |

Entrambe **server-only**. Mai `NEXT_PUBLIC_`, mai nel bundle del browser: la
chiave segreta di Stripe può fare qualunque cosa sull'account, incluso emettere
rimborsi.

Poi **ridistribuisci**: le variabili nuove non entrano in un deploy già fatto.

### Passo 9 — Collegare la riga

Il webhook riempie quasi tutto da solo al primo evento. Ma per non aspettare il
primo rinnovo, conviene creare la riga a mano:

```sql
INSERT INTO public.tenant_subscriptions
  (schema_name, stripe_customer_id, prezzo_mensile_centesimi)
VALUES
  ('<schema>', 'cus_XXXXXXXX', 7900)
ON CONFLICT (schema_name) DO UPDATE
  SET stripe_customer_id = EXCLUDED.stripe_customer_id,
      prezzo_mensile_centesimi = EXCLUDED.prezzo_mensile_centesimi;
```

`cus_XXXXXXXX` è l'id del cliente, in cima alla sua scheda su Stripe.

---

## Parte 4 — Provarlo davvero

**Un webhook va ESEGUITO per sapere se funziona.** Vale la stessa regola dei
trigger: un endpoint che compila non dice niente su cosa fa quando arriva un
evento vero.

### In locale, con la CLI di Stripe

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

Poi, in un terminale, inoltra gli eventi al gestionale locale:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Il comando stampa un `whsec_…` **diverso** da quello della dashboard: è il
segreto della sessione di ascolto. Mettilo in `apps/admin/.env.local` come
`STRIPE_WEBHOOK_SECRET` insieme a `STRIPE_SECRET_KEY=sk_test_…`, e riavvia il
dev server.

In un secondo terminale, spara gli eventi:

```bash
# pagamento riuscito
stripe trigger invoice.paid

# pagamento fallito — parte la tolleranza di 3 giorni
stripe trigger invoice.payment_failed

# abbonamento disdetto — blocco immediato
stripe trigger customer.subscription.deleted
```

⚠️ Gli eventi di `stripe trigger` creano clienti finti **senza**
`schema_name` nei metadati: il webhook li rifiuterà con un avviso nei log
(`nessun tenant per il customer …`). È il comportamento giusto. Per provare il
giro completo serve un evento su un customer vero — vedi sotto.

### Il giro completo, in modalità test

1. Crea il Customer di prova con `schema_name: <schema>` nei metadati
2. Crea un abbonamento con la carta di test `4242 4242 4242 4242`
3. Verifica che la riga si sia popolata:
   ```sql
   SELECT * FROM public.tenant_subscriptions WHERE schema_name = '<schema>';
   ```
4. Per simulare un fallimento, cambia la carta in `4000 0000 0000 0341`
   (passa la registrazione, fallisce l'addebito) e forza un rinnovo dalla
   dashboard
5. Controlla che `ritardo_dal` si sia riempito **una volta sola** anche dopo
   più tentativi falliti — è il punto più delicato di tutto il sistema

### Far fallire un pagamento senza aspettare il rinnovo

Il rinnovo vero è fra un mese, e il punto 5 va provato adesso. Si fabbrica una
fattura e la si paga a vuoto quante volte si vuole. Provato il 2026-08-09; ogni
comando vuole `--api-key sk_test_…`.

```bash
# 1. la carta che rifiuta, senza passare dal modulo della dashboard
stripe payment_methods attach pm_card_chargeCustomerFail -d customer=cus_XXX
stripe customers update cus_XXX -d "invoice_settings[default_payment_method]=pm_YYY"

# 2. qualcosa da addebitare (una fattura vuota vale zero e risulta pagata subito)
stripe invoiceitems create -d customer=cus_XXX -d amount=7999 -d currency=eur

# 3. ⚠️ `pending_invoice_items_behavior=include`, o la fattura nasce a ZERO:
#    le API recenti non raccolgono più da sole le voci in attesa
stripe invoices create -d customer=cus_XXX -d pending_invoice_items_behavior=include
stripe invoices finalize_invoice in_ZZZ

# 4. ogni `pay` fallisce e genera un invoice.payment_failed. Lanciarlo PIÙ VOLTE
#    a distanza di minuti: `ritardo_dal` non deve muoversi dopo il primo
stripe invoices pay in_ZZZ
```

Per il recupero si rimette la `4242` come predefinita e si ripaga la stessa
fattura: `ritardo_dal` torna `null` e lo stato `active`.

> `stripe subscriptions cancel` chiede una conferma interattiva: da uno script
> serve `--confirm`, altrimenti resta appeso su `Enter 'yes' to confirm`.

### Sandbox, non «modalità test»

Sugli account nuovi il vecchio interruttore test/live è sostituito dalle
**sandbox**, che sono ambienti separati con **chiavi ed eventi propri**. Se la
chiave della CLI appartiene a un ambiente e la dashboard ne mostra un altro, si
creano cliente e abbonamento e non arriva niente — un sintomo identico a quello
di un webhook rotto. Si verifica in un colpo solo prima di cominciare:

```bash
stripe customers retrieve cus_XXX --api-key sk_test_…
```

Se risponde `No such customer`, chiave e dashboard non sono lo stesso ambiente.

### Cosa NON serve provare a mano

C'è una suite che gira in CI e in locale, senza bisogno di database:

```bash
pnpm --filter admin test
```

72 casi in `apps/admin/lib/billing/__tests__/`, tutti su logica pura:

- **`stato.test.ts`** — i bordi dei tre giorni (il blocco scatta alla scadenza
  esatta, non un millisecondo prima), il fatto che un abbonamento non
  configurato non blocchi mai, e che il claim del middleware invecchi da solo
  senza nuovi eventi.
- **`tenant.test.ts`** — di chi è questo evento. Anche questi **sono un bug
  congelato**: la risoluzione aveva due strade e il commento sopra dichiarava
  che i metadati del Customer funzionassero al primo evento. Non funzionavano.
  Il caso da guardare è *«database vuoto → si chiede a Stripe»*: se torna
  rosso, l'onboarding del cliente successivo torna a fallire senza dirlo.
- **`rotte.test.ts`** — quali rotte sopravvivono al blocco, tentativi di
  aggiramento compresi. Questi casi **sono un bug congelato**: il 2026-08-07 un
  `startsWith` di troppo rendeva consentita ogni rotta del gestionale, e
  l'intero blocco era decorativo pur compilando e passando il lint.

Girano nel job *static checks* della CI, non in quello che tira su Postgres: un
test che ha bisogno di un database è un test che prima o poi qualcuno salta.

---

## Parte 5 — Le cose che ti faranno perdere tempo

**Il corpo grezzo, o la firma non torna.** La verifica della firma si fa sui
byte esatti che Stripe ha mandato. Qualunque `req.json()` prima di
`constructEvent` li cambia e la verifica fallisce con un messaggio che non
somiglia alla causa. Nel codice c'è `req.text()`, e deve restare così.

**Stripe riprova i pagamenti falliti tre o quattro volte in due settimane.**
Ogni tentativo genera un altro `invoice.payment_failed`. Se `ritardo_dal` venisse
riscritto a ogni evento, i tre giorni ripartirebbero da capo ogni volta e **il
blocco non scatterebbe mai, per nessuno**. Per questo il codice legge prima e
scrive solo se il campo è vuoto. È la riga da non «semplificare».

**Non rispondere 500 a un evento che non capisci.** Stripe riprova per giorni e
poi disattiva il webhook. Un evento ignorato di proposito è un 200.
Un 500 va dato solo quando la scrittura sul database è fallita davvero — lì il
ritentativo è esattamente ciò che serve.

**`current_period_end` non sta più sull'abbonamento.** Nelle API recenti sta su
ogni voce (`items.data[].current_period_end`), perché un abbonamento può avere
righe con periodi diversi. Il codice prende la più lontana.

**La partita IVA su Stripe ha il prefisso, da noi no.** Stripe salva
`IT01234567890`, il gestionale mostra e valida `01234567890`. La conversione sta
in due punti soli: `datiDa()` nel webhook e `aggiornaCliente()` nelle action.

**Un ID fiscale su Stripe non si modifica**: si cancella e si ricrea. Il codice
lo fa già, ma se un giorno vedi due `tax_ids` sullo stesso cliente, è lì che
guardare.

**Stripe non garantisce l'ordine degli eventi.** Due `customer.subscription.updated`
possono arrivare invertiti, e il secondo a essere scritto vince anche se descrive uno
stato più vecchio. Oggi il webhook **non** si difende da questo: non tiene traccia
degli id degli eventi né confronta i timestamp. È una scelta, non una svista — la
finestra è di secondi, i campi in gioco cambiano una volta al mese, e la difesa vera
(una tabella di eventi già visti) costa più di quanto valga con un cliente. Se un
giorno vedrai uno stato che «torna indietro» da solo, è qui che si guarda.

**Nei webhook non è espanso NIENTE, e questa è la regola da cui discendono le tre
trappole qui sotto.** Ogni riferimento a un altro oggetto — il customer di una
subscription, il metodo di pagamento, gli id fiscali — arriva come stringa o non
arriva affatto. Ciò che serve va chiesto a parte. La forma degli oggetti nella
documentazione dell'API e la forma che hanno **dentro un evento** non sono la
stessa cosa, e il compilatore non aiuta: i tipi ammettono entrambe.

**`tax_ids` non arriva nei webhook.** Sull'oggetto Customer è un campo espandibile:
Stripe lo include solo se lo chiedi, e il payload di un evento non lo chiede mai. Il
codice lo domanda a parte con `listTaxIds`. Se un giorno lo si «semplifica» leggendolo
da `cliente.tax_ids`, il risultato è cancellare la partita IVA a ogni modifica fatta
dal portale — in silenzio, e senza errori.

**Le chiavi di test e quelle vere hanno clienti diversi.** Un `cus_…` creato in
modalità test non esiste in produzione. Al passaggio in `live` vanno rifatti
cliente, abbonamento **e** webhook, e la riga sul database va aggiornata col
nuovo `cus_…`.

**Il claim nei metadati dell'utente è una copia, non la verità.** Se le due
divergono vince `public.tenant_subscriptions`: il claim serve solo al middleware
per non interrogare il database a ogni navigazione. Un claim vecchio costa al
massimo una navigazione che passa quando non doveva — e la pagina che si apre
legge lo stato vero e mostra il popup.

---

## Parte 6 — Cosa resta aperto

- **Nessuna email quando un pagamento fallisce.** Oggi il cliente lo scopre
  entrando nel gestionale. Stripe sa mandarle da solo (Impostazioni →
  Fatturazione → Email dei clienti): è la strada da preferire, perché non
  aggiunge codice.
- **Il webhook è per fork.** Al cliente #2 ogni gestionale ha il suo endpoint e
  il suo webhook configurato su Stripe. Funziona, ma al decimo cliente sono
  dieci endpoint da sorvegliare: lì converrà un servizio centrale.
- **Un fork che aggiunge voci proprie alla sidebar** deve riapplicarle a mano
  dopo ogni cherry-pick di `AppSidebar.tsx`: è l'unico file di questo lotto in
  cui piattaforma e personalizzazione si toccano.
