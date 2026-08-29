-- CRM Merkorn — schema
-- Il perno è storico_fasi: ogni passaggio di fase viene registrato con data,
-- autore e durata della fase precedente. Da lì derivano tutte le metriche.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- anagrafiche di servizio

create table profili (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null,
  email       text not null unique,
  ruolo       text not null default 'commerciale' check (ruolo in ('admin', 'commerciale')),
  attivo      boolean not null default true,
  creato_il   timestamptz not null default now()
);

create table settori (
  id     uuid primary key default gen_random_uuid(),
  nome   text not null unique,
  attivo boolean not null default true
);

create table servizi (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null unique,
  categoria          text,
  prezzo_riferimento numeric(12, 2),
  attivo             boolean not null default true
);

create table motivi_perdita (
  id     uuid primary key default gen_random_uuid(),
  nome   text not null unique,
  attivo boolean not null default true
);

-- Le fasi sono dati, non codice: nome, ordine e soglia si cambiano dalle
-- impostazioni senza toccare l'applicazione.
create table fasi (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null unique,
  ordine        integer not null unique,
  ambito        text not null check (ambito in ('prevendita', 'chiusura', 'postvendita', 'uscita')),
  soglia_giorni integer check (soglia_giorni is null or soglia_giorni > 0),
  is_vinta      boolean not null default false,
  is_persa      boolean not null default false,
  attiva        boolean not null default true
);

-- ---------------------------------------------------------------- clienti

create table aziende (
  id                uuid primary key default gen_random_uuid(),
  ragione_sociale   text not null,
  partita_iva       text,
  codice_fiscale    text,
  codice_sdi        text,
  pec               text,
  settore_id        uuid references settori (id) on delete set null,
  dimensione        text check (dimensione is null or dimensione in ('micro', 'piccola', 'media', 'grande')),
  sito_web          text,
  telefono          text,
  email             text,
  indirizzo         text,
  citta             text,
  provincia         text,
  paese             text default 'Italia',
  fonte             text check (fonte is null or fonte in ('passaparola', 'fiera', 'sito_web', 'campagna', 'contatto_diretto', 'altro')),
  stato             text not null default 'potenziale' check (stato in ('potenziale', 'cliente', 'ex_cliente')),
  commerciale_id    uuid references profili (id) on delete set null,
  note              text,
  ultimo_contatto   timestamptz,
  creata_il         timestamptz not null default now(),
  creata_da         uuid references profili (id) on delete set null,
  aggiornata_il     timestamptz not null default now()
);

create index aziende_ragione_sociale_idx on aziende (lower(ragione_sociale));
create index aziende_stato_idx on aziende (stato);

create table contatti (
  id                 uuid primary key default gen_random_uuid(),
  azienda_id         uuid not null references aziende (id) on delete cascade,
  nome               text not null,
  cognome            text not null,
  qualifica          text,
  ruolo_decisionale  text check (ruolo_decisionale is null or ruolo_decisionale in ('decisore', 'influenzatore', 'operativo')),
  email              text,
  telefono           text,
  cellulare          text,
  linkedin           text,
  principale         boolean not null default false,
  note               text,
  creato_il          timestamptz not null default now()
);

create index contatti_azienda_idx on contatti (azienda_id);

-- ---------------------------------------------------------------- pipeline

create table trattative (
  id                   uuid primary key default gen_random_uuid(),
  azienda_id           uuid not null references aziende (id) on delete cascade,
  titolo               text not null,
  descrizione          text,
  servizio_id          uuid references servizi (id) on delete set null,
  contatto_id          uuid references contatti (id) on delete set null,
  fase_id              uuid not null references fasi (id),
  in_fase_dal          timestamptz not null default now(),
  valore_stimato       numeric(12, 2),
  valore_finale        numeric(12, 2),
  probabilita          integer check (probabilita is null or probabilita between 0 and 100),
  esito                text not null default 'aperta' check (esito in ('aperta', 'vinta', 'persa', 'non_qualificata')),
  motivo_perdita_id    uuid references motivi_perdita (id) on delete set null,
  note_chiusura        text,
  commerciale_id       uuid references profili (id) on delete set null,
  data_apertura        timestamptz not null default now(),
  chiusura_prevista    date,
  chiusura_effettiva   timestamptz,
  ultima_attivita_il   timestamptz,
  creata_il            timestamptz not null default now(),
  aggiornata_il        timestamptz not null default now(),
  -- una trattativa persa deve sempre portare un motivo
  constraint trattative_motivo_obbligatorio
    check (esito <> 'persa' or motivo_perdita_id is not null)
);

create index trattative_azienda_idx on trattative (azienda_id);
create index trattative_fase_idx on trattative (fase_id);
create index trattative_esito_idx on trattative (esito);

-- Una riga per ogni passaggio. Scritta dal trigger, mai a mano.
create table storico_fasi (
  id                       uuid primary key default gen_random_uuid(),
  trattativa_id            uuid not null references trattative (id) on delete cascade,
  fase_partenza_id         uuid references fasi (id),
  fase_arrivo_id           uuid not null references fasi (id),
  avvenuto_il              timestamptz not null default now(),
  utente_id                uuid references profili (id) on delete set null,
  giorni_fase_precedente   numeric(8, 2),
  nota                     text
);

create index storico_fasi_trattativa_idx on storico_fasi (trattativa_id, avvenuto_il);

-- ---------------------------------------------------------------- lavoro quotidiano

create table attivita (
  id             uuid primary key default gen_random_uuid(),
  tipo           text not null check (tipo in ('chiamata', 'email', 'incontro', 'demo', 'nota', 'altro')),
  azienda_id     uuid references aziende (id) on delete cascade,
  trattativa_id  uuid references trattative (id) on delete cascade,
  contatto_id    uuid references contatti (id) on delete set null,
  oggetto        text not null,
  resoconto      text,
  avvenuta_il    timestamptz not null default now(),
  durata_minuti  integer check (durata_minuti is null or durata_minuti > 0),
  esito          text,
  autore_id      uuid references profili (id) on delete set null,
  creata_il      timestamptz not null default now(),
  constraint attivita_almeno_un_riferimento
    check (azienda_id is not null or trattativa_id is not null)
);

create index attivita_trattativa_idx on attivita (trattativa_id, avvenuta_il desc);
create index attivita_azienda_idx on attivita (azienda_id, avvenuta_il desc);

create table scadenze (
  id             uuid primary key default gen_random_uuid(),
  titolo         text not null,
  descrizione    text,
  trattativa_id  uuid references trattative (id) on delete cascade,
  azienda_id     uuid references aziende (id) on delete cascade,
  assegnata_a    uuid references profili (id) on delete set null,
  scade_il       timestamptz not null,
  priorita       text not null default 'media' check (priorita in ('bassa', 'media', 'alta')),
  stato          text not null default 'aperta' check (stato in ('aperta', 'fatta', 'annullata')),
  completata_il  timestamptz,
  creata_il      timestamptz not null default now()
);

create index scadenze_aperte_idx on scadenze (stato, scade_il);

create table documenti (
  id             uuid primary key default gen_random_uuid(),
  tipo           text not null check (tipo in ('preventivo', 'contratto', 'capitolato', 'altro')),
  azienda_id     uuid references aziende (id) on delete cascade,
  trattativa_id  uuid references trattative (id) on delete cascade,
  nome_file      text not null,
  percorso       text not null,
  dimensione     bigint,
  mime           text,
  versione       integer not null default 1,
  caricato_da    uuid references profili (id) on delete set null,
  caricato_il    timestamptz not null default now()
);

-- ---------------------------------------------------------------- post rilascio

create table progetti (
  id                    uuid primary key default gen_random_uuid(),
  trattativa_id         uuid unique references trattative (id) on delete set null,
  azienda_id            uuid not null references aziende (id) on delete cascade,
  nome                  text not null,
  stato                 text not null default 'onboarding'
                          check (stato in ('onboarding', 'sviluppo', 'collaudo', 'live', 'manutenzione', 'chiuso')),
  kickoff_il            date,
  golive_previsto       date,
  golive_effettivo      date,
  referente_tecnico_id  uuid references profili (id) on delete set null,
  canone                numeric(12, 2),
  periodicita_canone    text check (periodicita_canone is null or periodicita_canone in ('mensile', 'trimestrale', 'annuale')),
  scadenza_contratto    date,
  note                  text,
  creato_il             timestamptz not null default now()
);

create index progetti_scadenza_idx on progetti (scadenza_contratto);

create table milestone (
  id              uuid primary key default gen_random_uuid(),
  progetto_id     uuid not null references progetti (id) on delete cascade,
  nome            text not null,
  data_prevista   date,
  data_effettiva  date,
  stato           text not null default 'aperta' check (stato in ('aperta', 'completata', 'annullata')),
  ordine          integer not null default 0
);

create table ticket (
  id           uuid primary key default gen_random_uuid(),
  progetto_id  uuid not null references progetti (id) on delete cascade,
  titolo       text not null,
  descrizione  text,
  priorita     text not null default 'media' check (priorita in ('bassa', 'media', 'alta', 'urgente')),
  stato        text not null default 'aperto' check (stato in ('aperto', 'in_lavorazione', 'chiuso')),
  aperto_il    timestamptz not null default now(),
  chiuso_il    timestamptz,
  assegnato_a  uuid references profili (id) on delete set null
);

create table registro_modifiche (
  id              uuid primary key default gen_random_uuid(),
  entita          text not null,
  entita_id       uuid not null,
  campo           text not null,
  valore_prima    text,
  valore_dopo     text,
  utente_id       uuid references profili (id) on delete set null,
  avvenuto_il     timestamptz not null default now()
);

create index registro_modifiche_entita_idx on registro_modifiche (entita, entita_id, avvenuto_il desc);
