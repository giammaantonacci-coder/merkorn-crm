# CRM Merkorn

CRM commerciale interno: segue un'azienda dal primo contatto fino all'assistenza
post rilascio, misurando il tempo speso in ogni fase della trattativa.

Applicazione web pensata per il telefono, che si allarga al desktop.

## Stato

Applicazione sviluppata e compilante. Manca il progetto Supabase a cui
collegarla: senza quello l'app parte e mostra una schermata che spiega quali
variabili impostare, invece di una pagina bianca.

## Deploy su Vercel

Le due variabili sotto vanno impostate **prima** del deploy, in
Settings → Environment Variables, per tutti e tre gli ambienti:

| Serve | Nomi accettati | Dove trovarla |
|---|---|---|
| Indirizzo del progetto | `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_URL` | Supabase → Impostazioni → API → Project URL |
| Chiave pubblica | `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_ANON_KEY` · `SUPABASE_PUBLISHABLE_KEY` | Supabase → Impostazioni → API |

Serve inoltre **`SUPABASE_SERVICE_ROLE_KEY`** (Supabase → Impostazioni → API →
`service_role`). Una variabile sola, tre usi: registra la persona al primo
ingresso, suggerisce i nomi già usati, e fa da segreto per la credenziale
interna. Resta solo lato server e non raggiunge mai il browser.

Ne basta uno per riga. L'applicazione è interamente server-side — nessun
componente client parla con Supabase — quindi il prefisso `NEXT_PUBLIC_` non
serve, e vanno bene i nomi senza prefisso che imposta da sé l'integrazione
Vercel ↔ Supabase.

Le variabili non si applicano a un deploy già pubblicato: dopo averle aggiunte
serve un nuovo deploy (Deployments → Redeploy).

## Avvio

1. Crea un progetto su [Supabase](https://supabase.com) e applica le migrazioni
   in `supabase/migrations/` nell'ordine numerico (SQL Editor o
   `supabase db push`).
2. Copia `.env.example` in `.env.local` e inserisci URL e chiave pubblica del
   progetto (Impostazioni → API).
3. Apri l'applicazione e scrivi il tuo nome: la persona viene registrata al
   primo ingresso, e da lì aziende e trattative restano collegate a lei.

```bash
npm install
npm run dev
```

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Avvia in sviluppo su :3000 |
| `npm run build` | Compilazione di produzione |
| `npm run typecheck` | Controllo dei tipi |

## Com'è fatto

- **Next.js 16** (App Router, Server Components, Server Actions) e TypeScript
- **Tailwind 4** con i token del sistema visivo in `src/app/globals.css`
- **Supabase** per base dati, autenticazione e archivio documenti
- Nessuna gestione di stato lato client: le schermate leggono dal server, i
  moduli scrivono con le Server Actions

```
src/app/(app)/      schermate dentro l'area autenticata
src/components/     interfaccia riusabile
src/lib/dati.ts     letture dalla base dati
src/lib/azioni/     scritture (Server Actions)
supabase/migrations schema, automatismi, permessi, configurazione
supabase/prove      verifiche sui trigger e sulle viste
```

### Il pezzo che regge tutto

Il tempo fra una fase e l'altra non si ricava da un campo sulla trattativa:
serve lo storico dei passaggi. A ogni cambio di fase un trigger scrive una riga
in `storico_fasi` con data, autore e durata della fase lasciata, e azzera il
contatore della nuova. Da lì derivano il semaforo, i tempi per fase e il ciclo
commerciale, senza che nessuno debba inserire dati aggiuntivi.

Le verifiche in `supabase/prove/` esistono per questo: quel trigger è l'unica
parte del sistema in cui un errore fa perdere dati non recuperabili.

## Documentazione

- [Specifica funzionale](docs/specifica-funzionale.md) — fasi, modello dati,
  schermate, metriche e piano di lavoro.
- [Sistema visivo](docs/sistema-visivo.md) — palette, tipografia, regole d'uso.
- [Token di design](docs/design-tokens.css) — gli stessi valori per il codice.
- [Schermate mobile](design/mobile/) — i sorgenti dei mockup approvati.

## Accesso

Si entra scrivendo il proprio nome, senza email né password: è uno strumento
interno e ogni record resta collegato alla persona che l'ha inserito. Il nome
viene normalizzato (maiuscole, spazi e accenti non contano), così chi torna
ritrova le proprie trattative.

Sotto, l'autenticazione Supabase resta: il server ricava dal nome una identità
stabile e ci apre una sessione vera, così i permessi di riga e la firma di ogni
passaggio di fase continuano a funzionare. La credenziale non la sceglie e non
la vede nessuno — viene ricalcolata dal nome a ogni accesso.

Oltre al nome viene chiesto un **PIN uguale per tutta la squadra**, impostato
nella variabile `ACCESSO_PIN`. Non sta nel codice — il repository è pubblico —
ma solo fra le variabili d'ambiente su Vercel. Per cambiarlo basta cambiare la
variabile e rilanciare il deploy: nessuno perde i propri dati, perché
l'identità dipende dal nome e non dal PIN.

Il confronto avviene a tempo costante, così i tempi di risposta non rivelano
quante cifre iniziali sono corrette. Se `ACCESSO_PIN` non è impostata il PIN
non viene chiesto, e per entrare basta il nome.

Il segreto da cui si deriva la credenziale interna deve essere davvero
segreto: il repository è pubblico, quindi l'algoritmo è leggibile, e con la
sola chiave pubblica chiunque potrebbe ricavare la credenziale di un nome e
scavalcare il PIN. Per questo si usa `SUPABASE_SERVICE_ROLE_KEY` (o
`ACCESSO_SEGRETO`, se si preferisce tenerli distinti) e mai la chiave anon.

## Cosa non c'è ancora

- Disattivare una persona dall'app (si fa da Supabase, campo `attivo`)
- Caricamento dei documenti dall'interfaccia (la tabella e il bucket ci sono)
- Contatti, milestone e ticket: leggibili, non ancora modificabili dall'app
- Esportazioni dai report
