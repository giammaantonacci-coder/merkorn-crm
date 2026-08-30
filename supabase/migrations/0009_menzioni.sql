-- Menzioni nelle note: taggando «@Nome» una nota può riguardare altre persone.
-- Le menzioni si ricavano dal testo lato server e vivono qui, così si può
-- filtrare «le note che mi riguardano» senza rileggere e interpretare il testo.
-- Rieseguibile.

create table if not exists note_menzioni (
  note_id    uuid not null references note (id) on delete cascade,
  profilo_id uuid not null references profili (id) on delete cascade,
  creata_il  timestamptz not null default now(),
  primary key (note_id, profilo_id)
);

create index if not exists note_menzioni_profilo_idx on note_menzioni (profilo_id);

alter table note_menzioni enable row level security;

-- Stessa regola della bacheca: ogni membro attivo le vede e le gestisce.
drop policy if exists membri_note_menzioni on note_menzioni;
create policy membri_note_menzioni on note_menzioni
  for all to authenticated using (e_membro_attivo()) with check (e_membro_attivo());

grant select, insert, update, delete on note_menzioni to authenticated, service_role;

-- Fa conoscere subito la nuova tabella all'API: senza, i primi insert/lettura
-- delle menzioni fallirebbero finché la cache dello schema non si ricarica.
notify pgrst, 'reload schema';
