-- Prova la catena completa con il ruolo che usa davvero l'applicazione.
-- Tutto dentro una transazione annullata: non lascia traccia.
--
-- Perche esiste: le altre prove girano come proprietario del database, che
-- scavalca i permessi di riga. Un trigger che non riesce a scrivere per via
-- di una policy li passa inosservato, e fallisce solo in produzione.

begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
values ('00000000-dead-beef-0000-000000000001', '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated', 'verifica@merkorn.local', 'x',
        now(), now(), now(), '{}'::jsonb, '{"nome":"Verifica Temporanea"}'::jsonb);

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-dead-beef-0000-000000000001","role":"authenticated"}';

insert into aziende (id, ragione_sociale, fonte)
values ('00000000-dead-beef-0000-0000000000a1', 'Verifica Temporanea', 'passaparola');

insert into trattative (id, azienda_id, titolo, fase_id, valore_stimato)
values ('00000000-dead-beef-0000-0000000000b1', '00000000-dead-beef-0000-0000000000a1',
        'Prova catena', (select id from fasi where nome = 'Primo contatto'), 1000);

update trattative set in_fase_dal = now() - interval '9 days'
where id = '00000000-dead-beef-0000-0000000000b1';

update trattative set fase_id = (select id from fasi where nome = 'Qualificazione')
where id = '00000000-dead-beef-0000-0000000000b1';

insert into attivita (tipo, trattativa_id, oggetto)
values ('chiamata', '00000000-dead-beef-0000-0000000000b1', 'Prova');

update trattative
   set fase_id = (select id from fasi where nome = 'Contratto firmato'),
       esito = 'vinta', valore_finale = 1000, chiusura_effettiva = now()
 where id = '00000000-dead-beef-0000-0000000000b1';

select 'profilo creato dal trigger' as prova,
       (select count(*) = 1 from profili where id = '00000000-dead-beef-0000-000000000001') as esito
union all select 'riconosciuto come membro', e_membro_attivo()
union all select 'crea azienda e trattativa', (select count(*) = 1 from trattative where id = '00000000-dead-beef-0000-0000000000b1')
union all select 'storico: 3 passaggi registrati', (select count(*) = 3 from storico_fasi where trattativa_id = '00000000-dead-beef-0000-0000000000b1')
union all select 'durata fase lasciata = 9 giorni', (select round(giorni_fase_precedente) = 9 from storico_fasi where trattativa_id = '00000000-dead-beef-0000-0000000000b1' and giorni_fase_precedente is not null limit 1)
union all select 'la vista risponde col semaforo', (select semaforo is not null from v_trattative_stato where id = '00000000-dead-beef-0000-0000000000b1')
union all select 'ultimo contatto aggiornato', (select ultimo_contatto is not null from aziende where id = '00000000-dead-beef-0000-0000000000a1')
union all select 'progetto creato alla firma', (select count(*) = 1 from progetti where trattativa_id = '00000000-dead-beef-0000-0000000000b1')
union all select 'azienda diventata cliente', (select stato = 'cliente' from aziende where id = '00000000-dead-beef-0000-0000000000a1');

rollback;
