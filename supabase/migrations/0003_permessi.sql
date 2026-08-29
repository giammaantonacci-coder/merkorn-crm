-- Team piatto: chi ha un profilo attivo vede e modifica tutto.
-- Ogni record resta comunque firmato dall'autore.

alter table profili            enable row level security;
alter table settori            enable row level security;
alter table servizi            enable row level security;
alter table motivi_perdita     enable row level security;
alter table fasi               enable row level security;
alter table aziende            enable row level security;
alter table contatti           enable row level security;
alter table trattative         enable row level security;
alter table storico_fasi       enable row level security;
alter table attivita           enable row level security;
alter table scadenze           enable row level security;
alter table documenti          enable row level security;
alter table progetti           enable row level security;
alter table milestone          enable row level security;
alter table ticket             enable row level security;
alter table registro_modifiche enable row level security;

create or replace function e_membro_attivo()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profili
    where id = auth.uid() and attivo
  );
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'settori', 'servizi', 'motivi_perdita', 'fasi', 'aziende', 'contatti',
    'trattative', 'attivita', 'scadenze', 'documenti', 'progetti',
    'milestone', 'ticket'
  ]
  loop
    execute format(
      'create policy %I on %I for all to authenticated using (e_membro_attivo()) with check (e_membro_attivo());',
      'membri_' || t, t
    );
  end loop;
end;
$$;

-- Lo storico dei passaggi lo scrive il trigger: leggibile, mai modificabile a mano.
create policy storico_fasi_lettura on storico_fasi
  for select to authenticated using (e_membro_attivo());

create policy registro_modifiche_lettura on registro_modifiche
  for select to authenticated using (e_membro_attivo());

-- I profili si leggono tutti; ognuno modifica solo il proprio.
create policy profili_lettura on profili
  for select to authenticated using (e_membro_attivo());

create policy profili_modifica_proprio on profili
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Archivio documenti
insert into storage.buckets (id, name, public)
values ('documenti', 'documenti', false)
on conflict (id) do nothing;

create policy documenti_lettura on storage.objects
  for select to authenticated using (bucket_id = 'documenti' and e_membro_attivo());

create policy documenti_scrittura on storage.objects
  for insert to authenticated with check (bucket_id = 'documenti' and e_membro_attivo());

create policy documenti_eliminazione on storage.objects
  for delete to authenticated using (bucket_id = 'documenti' and e_membro_attivo());
