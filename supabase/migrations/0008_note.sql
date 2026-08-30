-- Bacheca di note condivise: chiunque nel team le vede e le gestisce, e ogni
-- nota porta il nome di chi l'ha scritta. Rieseguibile.

create table if not exists note (
  id             uuid primary key default gen_random_uuid(),
  testo          text not null,
  autore_id      uuid references profili (id) on delete set null,
  completata     boolean not null default false,
  completata_il  timestamptz,
  creata_il      timestamptz not null default now(),
  aggiornata_il  timestamptz not null default now()
);

create index if not exists note_aperte_idx on note (completata, creata_il desc);

alter table note enable row level security;

-- Bacheca comune: ogni membro attivo puo leggere, aggiungere, modificare,
-- completare ed eliminare. L'autore resta registrato per mostrarne il nome.
drop policy if exists membri_note on note;
create policy membri_note on note
  for all to authenticated using (e_membro_attivo()) with check (e_membro_attivo());

grant select, insert, update, delete on note to authenticated, service_role;
