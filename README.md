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
3. Crea il primo utente da Supabase → Authentication → Add user. Il profilo nel
   CRM nasce da solo al primo accesso.

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

## Cosa non c'è ancora

- Recupero password e invito di nuovi utenti dall'app (per ora si fa da Supabase)
- Caricamento dei documenti dall'interfaccia (la tabella e il bucket ci sono)
- Contatti, milestone e ticket: leggibili, non ancora modificabili dall'app
- Esportazioni dai report
