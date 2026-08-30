/**
 * Tipi della base dati, allineati a supabase/migrations.
 * Da rigenerare con `supabase gen types typescript` quando lo schema cambia.
 */

export type Ambito = "prevendita" | "chiusura" | "postvendita" | "uscita";
export type Esito = "aperta" | "vinta" | "persa" | "non_qualificata";
export type Semaforo = "in_tempo" | "vicino" | "oltre" | "neutro";
export type StatoAzienda = "potenziale" | "cliente" | "ex_cliente";
export type Fonte =
  | "passaparola"
  | "fiera"
  | "sito_web"
  | "campagna"
  | "contatto_diretto"
  | "altro";
export type TipoAttivita = "chiamata" | "email" | "incontro" | "demo" | "nota" | "altro";
export type StatoProgetto =
  | "onboarding"
  | "sviluppo"
  | "collaudo"
  | "live"
  | "manutenzione"
  | "chiuso";

export type Profilo = {
  id: string;
  nome: string;
  email: string;
  ruolo: "admin" | "commerciale";
  attivo: boolean;
  creato_il: string;
};

export type Fase = {
  id: string;
  nome: string;
  ordine: number;
  ambito: Ambito;
  soglia_giorni: number | null;
  is_vinta: boolean;
  is_persa: boolean;
  attiva: boolean;
};

export type Settore = { id: string; nome: string; attivo: boolean };
export type Servizio = {
  id: string;
  nome: string;
  categoria: string | null;
  prezzo_riferimento: number | null;
  attivo: boolean;
};
export type MotivoPerdita = { id: string; nome: string; attivo: boolean };

export type Azienda = {
  id: string;
  ragione_sociale: string;
  partita_iva: string | null;
  codice_fiscale: string | null;
  codice_sdi: string | null;
  pec: string | null;
  settore_id: string | null;
  dimensione: "micro" | "piccola" | "media" | "grande" | null;
  sito_web: string | null;
  telefono: string | null;
  email: string | null;
  indirizzo: string | null;
  citta: string | null;
  provincia: string | null;
  paese: string | null;
  fonte: Fonte | null;
  stato: StatoAzienda;
  commerciale_id: string | null;
  note: string | null;
  ultimo_contatto: string | null;
  creata_il: string;
  creata_da: string | null;
  aggiornata_il: string;
};

export type Contatto = {
  id: string;
  azienda_id: string;
  nome: string;
  cognome: string;
  qualifica: string | null;
  ruolo_decisionale: "decisore" | "influenzatore" | "operativo" | null;
  email: string | null;
  telefono: string | null;
  cellulare: string | null;
  linkedin: string | null;
  principale: boolean;
  note: string | null;
  creato_il: string;
};

export type Trattativa = {
  id: string;
  azienda_id: string;
  titolo: string;
  descrizione: string | null;
  servizio_id: string | null;
  contatto_id: string | null;
  fase_id: string;
  in_fase_dal: string;
  valore_stimato: number | null;
  valore_finale: number | null;
  probabilita: number | null;
  esito: Esito;
  motivo_perdita_id: string | null;
  note_chiusura: string | null;
  commerciale_id: string | null;
  data_apertura: string;
  chiusura_prevista: string | null;
  chiusura_effettiva: string | null;
  ultima_attivita_il: string | null;
  creata_il: string;
  aggiornata_il: string;
};

export type StoricoFase = {
  id: string;
  trattativa_id: string;
  fase_partenza_id: string | null;
  fase_arrivo_id: string;
  avvenuto_il: string;
  utente_id: string | null;
  giorni_fase_precedente: number | null;
  nota: string | null;
};

export type Attivita = {
  id: string;
  tipo: TipoAttivita;
  azienda_id: string | null;
  trattativa_id: string | null;
  contatto_id: string | null;
  oggetto: string;
  resoconto: string | null;
  avvenuta_il: string;
  durata_minuti: number | null;
  esito: string | null;
  autore_id: string | null;
  creata_il: string;
};

export type Scadenza = {
  id: string;
  titolo: string;
  descrizione: string | null;
  trattativa_id: string | null;
  azienda_id: string | null;
  assegnata_a: string | null;
  scade_il: string;
  priorita: "bassa" | "media" | "alta";
  stato: "aperta" | "fatta" | "annullata";
  completata_il: string | null;
  creata_il: string;
};

export type Documento = {
  id: string;
  tipo: "preventivo" | "contratto" | "capitolato" | "altro";
  azienda_id: string | null;
  trattativa_id: string | null;
  nome_file: string;
  percorso: string;
  dimensione: number | null;
  mime: string | null;
  versione: number;
  caricato_da: string | null;
  caricato_il: string;
};

export type Progetto = {
  id: string;
  trattativa_id: string | null;
  azienda_id: string;
  nome: string;
  stato: StatoProgetto;
  kickoff_il: string | null;
  golive_previsto: string | null;
  golive_effettivo: string | null;
  referente_tecnico_id: string | null;
  canone: number | null;
  periodicita_canone: "mensile" | "trimestrale" | "annuale" | null;
  scadenza_contratto: string | null;
  note: string | null;
  creato_il: string;
};

export type Milestone = {
  id: string;
  progetto_id: string;
  nome: string;
  data_prevista: string | null;
  data_effettiva: string | null;
  stato: "aperta" | "completata" | "annullata";
  ordine: number;
};

export type Ticket = {
  id: string;
  progetto_id: string;
  titolo: string;
  descrizione: string | null;
  priorita: "bassa" | "media" | "alta" | "urgente";
  stato: "aperto" | "in_lavorazione" | "chiuso";
  aperto_il: string;
  chiuso_il: string | null;
  assegnato_a: string | null;
};

export type Nota = {
  id: string;
  testo: string;
  autore_id: string | null;
  completata: boolean;
  completata_il: string | null;
  creata_il: string;
  aggiornata_il: string;
};

export type NoteMenzione = {
  note_id: string;
  profilo_id: string;
  creata_il: string;
};

/** Vista: stato vivo della trattativa, con giorni in fase e semaforo. */
export type TrattativaStato = {
  id: string;
  titolo: string;
  azienda_id: string;
  ragione_sociale: string;
  fase_id: string;
  fase_nome: string;
  fase_ambito: Ambito;
  fase_ordine: number;
  soglia_giorni: number | null;
  esito: Esito;
  valore_stimato: number | null;
  valore_finale: number | null;
  commerciale_id: string | null;
  in_fase_dal: string;
  ultima_attivita_il: string | null;
  giorni_in_fase: number;
  giorni_in_pipeline: number;
  semaforo: Semaforo;
};

/** Vista: durata media e mediana di ogni fase. */
export type TempoPerFase = {
  fase_id: string;
  fase_nome: string;
  ordine: number;
  ambito: Ambito;
  soglia_giorni: number | null;
  passaggi: number;
  media_giorni: number | null;
  mediana_giorni: number | null;
};

type Relazione = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

/**
 * In inserimento sono obbligatorie solo le colonne senza valore predefinito:
 * tutto il resto lo mette la base dati.
 */
type Tabella<Row, Obbligatori extends keyof Row = never, R extends Relazione[] = []> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Obbligatori>;
  Update: Partial<Row>;
  Relationships: R;
};

type RelAziende = [
  {
    foreignKeyName: "aziende_settore_id_fkey";
    columns: ["settore_id"];
    isOneToOne: false;
    referencedRelation: "settori";
    referencedColumns: ["id"];
  },
];

type RelContatti = [
  {
    foreignKeyName: "contatti_azienda_id_fkey";
    columns: ["azienda_id"];
    isOneToOne: false;
    referencedRelation: "aziende";
    referencedColumns: ["id"];
  },
];

type RelTrattative = [
  {
    foreignKeyName: "trattative_azienda_id_fkey";
    columns: ["azienda_id"];
    isOneToOne: false;
    referencedRelation: "aziende";
    referencedColumns: ["id"];
  },
  {
    foreignKeyName: "trattative_contatto_id_fkey";
    columns: ["contatto_id"];
    isOneToOne: false;
    referencedRelation: "contatti";
    referencedColumns: ["id"];
  },
  {
    foreignKeyName: "trattative_fase_id_fkey";
    columns: ["fase_id"];
    isOneToOne: false;
    referencedRelation: "fasi";
    referencedColumns: ["id"];
  },
  {
    foreignKeyName: "trattative_servizio_id_fkey";
    columns: ["servizio_id"];
    isOneToOne: false;
    referencedRelation: "servizi";
    referencedColumns: ["id"];
  },
];

type RelStorico = [
  {
    foreignKeyName: "storico_fasi_trattativa_id_fkey";
    columns: ["trattativa_id"];
    isOneToOne: false;
    referencedRelation: "trattative";
    referencedColumns: ["id"];
  },
  {
    foreignKeyName: "storico_fasi_fase_partenza_id_fkey";
    columns: ["fase_partenza_id"];
    isOneToOne: false;
    referencedRelation: "fasi";
    referencedColumns: ["id"];
  },
  {
    foreignKeyName: "storico_fasi_fase_arrivo_id_fkey";
    columns: ["fase_arrivo_id"];
    isOneToOne: false;
    referencedRelation: "fasi";
    referencedColumns: ["id"];
  },
];

type RelScadenze = [
  {
    foreignKeyName: "scadenze_trattativa_id_fkey";
    columns: ["trattativa_id"];
    isOneToOne: false;
    referencedRelation: "trattative";
    referencedColumns: ["id"];
  },
  {
    foreignKeyName: "scadenze_azienda_id_fkey";
    columns: ["azienda_id"];
    isOneToOne: false;
    referencedRelation: "aziende";
    referencedColumns: ["id"];
  },
];

type RelProgetti = [
  {
    foreignKeyName: "progetti_azienda_id_fkey";
    columns: ["azienda_id"];
    isOneToOne: false;
    referencedRelation: "aziende";
    referencedColumns: ["id"];
  },
  {
    foreignKeyName: "progetti_trattativa_id_fkey";
    columns: ["trattativa_id"];
    isOneToOne: true;
    referencedRelation: "trattative";
    referencedColumns: ["id"];
  },
];

type RelNote = [
  {
    foreignKeyName: "note_autore_id_fkey";
    columns: ["autore_id"];
    isOneToOne: false;
    referencedRelation: "profili";
    referencedColumns: ["id"];
  },
];

type RelNoteMenzioni = [
  {
    foreignKeyName: "note_menzioni_note_id_fkey";
    columns: ["note_id"];
    isOneToOne: false;
    referencedRelation: "note";
    referencedColumns: ["id"];
  },
  {
    foreignKeyName: "note_menzioni_profilo_id_fkey";
    columns: ["profilo_id"];
    isOneToOne: false;
    referencedRelation: "profili";
    referencedColumns: ["id"];
  },
];

type RelAttivita = [
  {
    foreignKeyName: "attivita_trattativa_id_fkey";
    columns: ["trattativa_id"];
    isOneToOne: false;
    referencedRelation: "trattative";
    referencedColumns: ["id"];
  },
  {
    foreignKeyName: "attivita_azienda_id_fkey";
    columns: ["azienda_id"];
    isOneToOne: false;
    referencedRelation: "aziende";
    referencedColumns: ["id"];
  },
];

export type Database = {
  public: {
    Tables: {
      profili: Tabella<Profilo, "id" | "nome" | "email">;
      settori: Tabella<Settore, "nome">;
      servizi: Tabella<Servizio, "nome">;
      motivi_perdita: Tabella<MotivoPerdita, "nome">;
      fasi: Tabella<Fase, "nome" | "ordine" | "ambito">;
      aziende: Tabella<Azienda, "ragione_sociale", RelAziende>;
      contatti: Tabella<Contatto, "azienda_id" | "nome" | "cognome", RelContatti>;
      trattative: Tabella<Trattativa, "azienda_id" | "titolo" | "fase_id", RelTrattative>;
      storico_fasi: Tabella<StoricoFase, "trattativa_id" | "fase_arrivo_id", RelStorico>;
      attivita: Tabella<Attivita, "tipo" | "oggetto", RelAttivita>;
      scadenze: Tabella<Scadenza, "titolo" | "scade_il", RelScadenze>;
      documenti: Tabella<Documento, "tipo" | "nome_file" | "percorso">;
      progetti: Tabella<Progetto, "azienda_id" | "nome", RelProgetti>;
      milestone: Tabella<Milestone, "progetto_id" | "nome">;
      ticket: Tabella<Ticket, "progetto_id" | "titolo">;
      note: Tabella<Nota, "testo", RelNote>;
      note_menzioni: Tabella<NoteMenzione, "note_id" | "profilo_id", RelNoteMenzioni>;
    };
    Views: {
      v_trattative_stato: { Row: TrattativaStato; Relationships: [] };
      v_tempi_per_fase: { Row: TempoPerFase; Relationships: [] };
    };
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Record<string, unknown>>;
  };
};
