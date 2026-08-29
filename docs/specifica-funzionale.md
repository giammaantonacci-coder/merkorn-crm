# CRM Merkorn — Specifica funzionale

**Versione 1.0 — bozza per la fase di design**

CRM commerciale interno che segue un'azienda dal primo contatto fino all'assistenza
post rilascio, misurando il tempo speso in ogni fase.

## 1. Decisioni prese

| Ambito | Scelta | Motivo |
|---|---|---|
| Granularità | Pipeline **per trattativa** | L'azienda è l'anagrafica stabile; ogni progetto ha il proprio percorso. Un cliente in assistenza può avere in parallelo una nuova trattativa aperta. |
| Architettura | Next.js + Supabase su Vercel | Postgres gestito, autenticazione, storage documenti e deploy automatico. Un solo repository, nessun backend da mantenere. |
| Permessi | Team piatto | Login personale per ogni commerciale, tutti vedono tutti i dati. Ogni record resta firmato dall'autore. |
| Perimetro | Prodotto completo | Anagrafiche, pipeline, attività, documenti, post rilascio e report. Nessun modulo rimandato. |

### Il vincolo che determina tutto il resto

Misurare il tempo fra una fase e l'altra non si ottiene con un campo `fase` sulla
trattativa: quel campo racconta solo il presente. Serve una tabella di storico
(`storico_fasi`) che registra ogni singolo passaggio con data, ora e autore. Da lì si
ricava tutto il resto per differenza. È una scelta da fare adesso: i dati non
registrati al momento del passaggio non sono più recuperabili dopo.

## 2. Fasi della pipeline

Dieci fasi in sequenza più due esiti di uscita. Le soglie sono una proposta di
partenza, da tarare sull'esperienza reale.

| # | Fase | Ambito | Soglia | Cosa si registra |
|---|---|---|---|---|
| 1 | Primo contatto | Prevendita | 7 gg | Fonte (passaparola, fiera, sito, campagna, contatto diretto), chi l'ha intercettato |
| 2 | Qualificazione | Prevendita | 10 gg | Bisogno reale, budget, decisore raggiungibile |
| 3 | Analisi requisiti | Prevendita | 21 gg | Incontri tecnici, esigenze, prima stima |
| 4 | Proposta inviata | Prevendita | 14 gg | Valore, data invio, validità offerta, preventivo allegato |
| 5 | Negoziazione | Prevendita | 21 gg | Revisioni di prezzo e perimetro, obiezioni, versioni del preventivo |
| 6 | Contratto firmato | Chiusura | — | Data firma, valore finale; genera il progetto collegato |
| 7 | Kickoff e onboarding | Post vendita | 10 gg | Referenti tecnici, accessi, piano di lavoro |
| 8 | Sviluppo | Post vendita | — | Milestone con data prevista ed effettiva |
| 9 | Collaudo e rilascio | Post vendita | 21 gg | Test, correzioni, go-live previsto vs effettivo |
| 10 | Assistenza | Post vendita | — | Canone, scadenza contratto, ticket, upsell |
| × | Persa | Uscita | — | Motivo obbligatorio da elenco chiuso + nota libera |
| × | Non qualificata | Uscita | — | Tenuta separata dalle perse per non falsare la conversione |

Le fasi vivono in una tabella modificabile dalle impostazioni: si possono rinominare,
riordinare o cambiare soglia senza toccare l'applicazione. Lo storico resta coerente
perché registra l'identificativo della fase, non il nome.

## 3. Modello dati

### Nucleo

**aziende** — anagrafica stabile, vive oltre la singola trattativa
`ragione sociale`, `partita IVA`, `codice fiscale`, `codice SDI / PEC`, `settore`,
`dimensione`, `sito web`, `telefono`, `email generale`, `indirizzo`, `città`,
`provincia`, `paese`, `fonte`, `stato` (prospect / cliente / ex cliente),
`commerciale assegnato`, `note`, `creata il/da`

**trattative** — l'entità che si muove nella pipeline
`titolo`, `azienda`, `referente principale`, `tipo servizio`, `valore stimato`,
`valore finale`, `probabilità`, `fase attuale`, `in fase dal`, `esito`,
`data apertura`, `chiusura prevista`, `chiusura effettiva`, `motivo perdita`,
`commerciale`, `descrizione`

**storico_fasi** — una riga per ogni passaggio, scritta automaticamente
`trattativa`, `fase di partenza`, `fase di arrivo`, `data e ora`, `utente`,
`giorni nella fase precedente`, `nota di passaggio`

### Relazione con il cliente

**contatti** — `azienda`, `nome e cognome`, `qualifica`, `ruolo decisionale`, `email`,
`telefono`, `cellulare`, `LinkedIn`, `referente principale`, `note`

**attività** — `tipo` (chiamata / email / incontro / demo / nota), `azienda`,
`trattativa`, `contatto`, `oggetto`, `resoconto`, `data e ora`, `durata`, `esito`, `autore`

**scadenze** — `titolo`, `trattativa`, `azienda`, `assegnata a`, `scadenza`,
`priorità`, `stato`, `completata il`

**documenti** — `tipo`, `azienda`, `trattativa`, `nome file`, `percorso`, `versione`,
`dimensione`, `caricato da`

### Post rilascio

**progetti** — `trattativa`, `azienda`, `nome`, `stato`, `kickoff`,
`go-live previsto`, `go-live effettivo`, `referente tecnico`, `canone`,
`periodicità`, `scadenza contratto`

**milestone** — `progetto`, `nome`, `data prevista`, `data effettiva`, `stato`

**ticket** — `progetto`, `titolo`, `descrizione`, `priorità`, `stato`, `aperto il`,
`chiuso il`, `assegnato a`

### Configurazione e servizio

**fasi** — `nome`, `ordine`, `ambito`, `colore`, `soglia giorni`, `è vinta`, `è persa`, `attiva`
**motivi_perdita** — `nome`, `attivo`
**servizi** — `nome`, `categoria`, `prezzo di riferimento`
**settori** — `nome`, `attivo`
**utenti** — `nome`, `email`, `ruolo`, `attivo`
**registro_modifiche** — `entità`, `record`, `campo`, `valore prima/dopo`, `utente`, `data e ora`

## 4. Schermate

| | Schermata | Contenuto |
|---|---|---|
| A | Accesso | Login email e password |
| B | Cruscotto | Valore pipeline aperta, trattative ferme, scadenze di oggi e in ritardo, ultime attività, andamento del mese |
| C | Pipeline | Colonne per fase con schede trascinabili + vista tabella con filtri; ogni scheda mostra azienda, valore, commerciale, giorni fermi |
| D | Scheda trattativa | Avanzamento con durata di ogni fase attraversata; schede attività, scadenze, documenti, dati economici, note |
| E | Elenco aziende | Tabella con ricerca, filtri per settore/stato/fonte/commerciale, ordinamento, esportazione |
| F | Scheda azienda | Anagrafica, contatti, trattative aperte e chiuse, progetti, documenti, cronologia unica |
| G | Nuova azienda | Modulo diviso in identità, contatti, sede, classificazione; anche come pannello laterale |
| H | Contatti | Rubrica trasversale con ricerca per nome, ruolo o azienda |
| I | Agenda | Scadenze e attività in calendario o lista, filtrabili per persona, ritardi evidenziati |
| J | Progetti | Stato, go-live, milestone in ritardo, contratti in scadenza, ticket aperti |
| K | Report | Imbuto, tempi medi per fase, motivi di perdita, risultati per fonte e commerciale |
| L | Impostazioni | Fasi e soglie, motivi di perdita, settori, servizi, utenti |

## 5. Metriche

Tutte derivate dallo storico dei passaggi, nessun inserimento aggiuntivo richiesto.

| Misura | Calcolo | Uso |
|---|---|---|
| Tempo per fase | media e mediana dei giorni | Individuare la fase che rallenta il processo |
| Ciclo di vendita | primo contatto → firma | Quanto anticipo serve per chiudere un obiettivo |
| Tempo di consegna | firma → go-live | Promettere tempi realistici in proposta |
| Ciclo completo | primo contatto → go-live | Quadro d'insieme |
| Imbuto di conversione | passaggi fase per fase | Dove si perdono più trattative |
| Tasso di successo | vinte / (vinte + perse) | Efficacia, esclusi i lead mai qualificati |
| Valore pipeline | somma per fase, anche pesata | Previsione di incasso |
| Trattative ferme | giorni in fase > soglia | Lista operativa di chi richiamare |
| Motivi di perdita | frequenza per motivo | Distinguere problema di prezzo da problema di prodotto |
| Resa per fonte | conversione e valore per canale | Dove investire per generare contatti |
| Scostamento stime | go-live effettivo − previsto | Correggere le stime delle prossime offerte |

## 6. Automatismi

| Quando | Il sistema |
|---|---|
| Una trattativa cambia fase | Scrive la riga di storico e calcola i giorni nella fase precedente |
| Passa a «Contratto firmato» | Chiede il valore finale e crea il progetto collegato in stato kickoff |
| Passa a «Persa» | Obbliga a scegliere un motivo prima di salvare |
| Supera la soglia della fase | La segnala come ferma nel cruscotto e nella pipeline |
| Una scadenza supera la data | La evidenzia in agenda e nel cruscotto della persona assegnata |
| Un contratto si avvicina alla scadenza | Avvisa con 60 giorni di anticipo |
| Si registra un'attività | Aggiorna la data di ultimo contatto dell'azienda |
| Si modifica un record | Registra autore, campo e valore precedente |

## 7. Piano di lavoro

1. **Base dati e accesso** — progetto Supabase, tabelle, relazioni, dati di
   configurazione iniziali, autenticazione, impianto applicazione e navigazione.
2. **Anagrafiche** — aziende e contatti: elenchi, ricerca, filtri, schede, moduli.
3. **Pipeline e storico** — trattative, vista a colonne con trascinamento, scheda di
   dettaglio, registrazione automatica dei tempi.
4. **Attività, scadenze e documenti** — diario interazioni, agenda, storage file.
5. **Post rilascio** — progetti, milestone, contratti di manutenzione, ticket.
6. **Report e rifiniture** — cruscotto, imbuto, tempi medi, esportazioni,
   impostazioni, importazione dati esistenti, messa online.

## 8. Punti aperti

- **Le fasi sono quelle giuste?** Se il processo reale ha passaggi diversi
  (sopralluogo, analisi di fattibilità a pagamento, gara) vanno inseriti adesso.
- **Le soglie di attenzione** — dopo quanti giorni di silenzio una trattativa è a
  rischio, fase per fase. Servono numeri presi dall'esperienza.
- **I dati esistenti** — se il portafoglio è oggi in un foglio di calcolo, va
  importato all'avvio insieme alla base dati.
- **Identità visiva** — logo Merkorn, colori e font di riferimento.
