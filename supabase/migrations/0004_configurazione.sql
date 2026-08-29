-- Righe di configurazione, non dati di prova: senza queste l'applicazione non
-- funziona (la pipeline non avrebbe colonne e i menu sarebbero vuoti).

insert into fasi (nome, ordine, ambito, soglia_giorni, is_vinta, is_persa) values
  ('Primo contatto',      1,  'prevendita',  2,    false, false),
  ('Qualificazione',      2,  'prevendita',  7,    false, false),
  ('Analisi requisiti',   3,  'prevendita',  30,   false, false),
  ('Proposta inviata',    4,  'prevendita',  10,   false, false),
  ('Negoziazione',        5,  'prevendita',  30,   false, false),
  ('Contratto firmato',   6,  'chiusura',    5,    true,  false),
  ('Kickoff e onboarding',7,  'postvendita', 14,   false, false),
  ('Sviluppo',            8,  'postvendita', null, false, false),
  ('Collaudo e rilascio', 9,  'postvendita', 21,   false, false),
  ('Assistenza',          10, 'postvendita', null, false, false),
  ('Persa',               11, 'uscita',      null, false, true),
  ('Non qualificata',     12, 'uscita',      null, false, false)
on conflict (nome) do nothing;

insert into motivi_perdita (nome) values
  ('Prezzo troppo alto'),
  ('Tempi di consegna'),
  ('Scelto un concorrente'),
  ('Budget congelato'),
  ('Nessuna risposta'),
  ('Soluzione non adatta'),
  ('Rifatto internamente')
on conflict (nome) do nothing;

insert into settori (nome) values
  ('Manifatturiero'), ('Commercio'), ('Trasporti e logistica'),
  ('Servizi professionali'), ('Alimentare'), ('Edilizia'),
  ('Sanità'), ('Agricoltura'), ('Turismo e ricettività'),
  ('Pubblica amministrazione'), ('Altro')
on conflict (nome) do nothing;

insert into servizi (nome, categoria) values
  ('Software su misura',        'sviluppo'),
  ('Applicazione mobile',       'sviluppo'),
  ('Portale web',               'sviluppo'),
  ('Integrazione di sistemi',   'sviluppo'),
  ('Canone di manutenzione',    'ricorrente'),
  ('Consulenza',                'consulenza')
on conflict (nome) do nothing;
