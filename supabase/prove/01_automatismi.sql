\set ON_ERROR_STOP on
\pset pager off

-- 1. La registrazione crea il profilo
insert into auth.users (id, email, raw_user_meta_data)
values ('11111111-1111-1111-1111-111111111111', 'marco@merkorn.it', '{"nome":"Marco Valli"}');
select 'profilo creato dal trigger' as prova,
       (select count(*) = 1 from profili where email = 'marco@merkorn.it') as esito;

set prova.utente = '11111111-1111-1111-1111-111111111111';

-- 2. Azienda e trattativa
insert into aziende (id, ragione_sociale, fonte)
values ('22222222-2222-2222-2222-222222222222', 'Logistica Adriatica', 'passaparola');

insert into trattative (id, azienda_id, titolo, fase_id, valore_stimato)
values ('33333333-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222',
        'Portale tracking',
        (select id from fasi where nome = 'Primo contatto'),
        61500);

select 'prima fase registrata nello storico' as prova,
       (select count(*) = 1 from storico_fasi
        where trattativa_id = '33333333-3333-3333-3333-333333333333'
          and fase_partenza_id is null) as esito;

-- 3. Passaggio di fase: simulo 9 giorni trascorsi
update trattative set in_fase_dal = now() - interval '9 days'
where id = '33333333-3333-3333-3333-333333333333';

update trattative set fase_id = (select id from fasi where nome = 'Qualificazione')
where id = '33333333-3333-3333-3333-333333333333';

select 'durata della fase lasciata calcolata' as prova,
       (select round(giorni_fase_precedente) = 9 from storico_fasi
        where trattativa_id = '33333333-3333-3333-3333-333333333333'
          and fase_partenza_id = (select id from fasi where nome = 'Primo contatto')) as esito;

select 'il contatore della nuova fase riparte' as prova,
       (select in_fase_dal > now() - interval '1 minute' from trattative
        where id = '33333333-3333-3333-3333-333333333333') as esito;

-- 4. Semaforo: la soglia di Qualificazione è 7 giorni
update trattative set in_fase_dal = now() - interval '10 days'
where id = '33333333-3333-3333-3333-333333333333';
select 'semaforo rosso oltre soglia' as prova,
       (select semaforo = 'oltre' and giorni_in_fase = 10
        from v_trattative_stato where id = '33333333-3333-3333-3333-333333333333') as esito;

update trattative set in_fase_dal = now() - interval '6 days'
where id = '33333333-3333-3333-3333-333333333333';
select 'semaforo giallo vicino alla soglia' as prova,
       (select semaforo = 'vicino' from v_trattative_stato
        where id = '33333333-3333-3333-3333-333333333333') as esito;

update trattative set in_fase_dal = now() - interval '2 days'
where id = '33333333-3333-3333-3333-333333333333';
select 'semaforo verde entro la soglia' as prova,
       (select semaforo = 'in_tempo' from v_trattative_stato
        where id = '33333333-3333-3333-3333-333333333333') as esito;

-- 5. Attività: aggiorna l'ultimo contatto dell'azienda
insert into attivita (tipo, trattativa_id, oggetto)
values ('chiamata', '33333333-3333-3333-3333-333333333333', 'Chiamata con Laura');
select 'ultimo contatto aggiornato' as prova,
       (select ultimo_contatto is not null from aziende
        where id = '22222222-2222-2222-2222-222222222222') as esito;

-- 6. Firma: nasce il progetto e l'azienda diventa cliente
update trattative
   set fase_id = (select id from fasi where nome = 'Contratto firmato'),
       esito = 'vinta',
       valore_finale = 61500,
       chiusura_effettiva = now()
 where id = '33333333-3333-3333-3333-333333333333';

select 'progetto creato alla firma' as prova,
       (select count(*) = 1 from progetti
        where trattativa_id = '33333333-3333-3333-3333-333333333333') as esito;
select 'azienda diventata cliente' as prova,
       (select stato = 'cliente' from aziende
        where id = '22222222-2222-2222-2222-222222222222') as esito;

-- 7. Una trattativa persa senza motivo deve essere rifiutata
insert into trattative (id, azienda_id, titolo, fase_id)
values ('44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222', 'Prova perdita',
        (select id from fasi where nome = 'Primo contatto'));
do $$
begin
  update trattative set esito = 'persa' where id = '44444444-4444-4444-4444-444444444444';
  raise exception 'FALLITO: la perdita senza motivo è stata accettata';
exception when check_violation then
  raise notice 'ok  perdita senza motivo rifiutata dal vincolo';
end $$;

-- 8. Vista dei tempi per fase
select 'tempi per fase misurati' as prova,
       (select mediana_giorni is not null from v_tempi_per_fase
        where fase_nome = 'Primo contatto') as esito;

-- 9. Configurazione caricata
select 'fasi configurate' as prova, (select count(*) = 12 from fasi) as esito;
select 'motivi di perdita' as prova, (select count(*) >= 7 from motivi_perdita) as esito;
