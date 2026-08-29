\set ON_ERROR_STOP on
-- Simula due persone autenticate senza che il trigger abbia creato i profili.
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'marco@merkorn.local'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'giulia@merkorn.local');
delete from profili;  -- come se le migrazioni degli automatismi non ci fossero

set role authenticated;
set prova.utente = 'aaaaaaaa-0000-0000-0000-000000000001';

-- 1. ognuno puo creare il proprio profilo
insert into profili (id, nome, email)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Marco Valli', 'marco@merkorn.local');
select 'crea il proprio profilo' as prova, true as esito;

-- 2. ma non quello di un altro
do $$
begin
  insert into profili (id, nome, email)
  values ('bbbbbbbb-0000-0000-0000-000000000002', 'Finto', 'giulia@merkorn.local');
  raise exception 'FALLITO: ha creato il profilo di un altro';
exception when insufficient_privilege then
  raise notice 'ok  non puo creare il profilo di un altro';
end $$;

-- 3. col profilo creato, i dati del CRM diventano accessibili
insert into aziende (ragione_sociale) values ('Prova Srl');
select 'accede ai dati dopo il profilo' as prova,
       (select count(*) = 1 from aziende) as esito;

reset role;
