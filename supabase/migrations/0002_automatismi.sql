-- Automatismi: nessuna misura deve dipendere dalla disciplina di chi inserisce i dati.

-- ---------------------------------------------------------------- utente corrente

create or replace function utente_corrente()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- ---------------------------------------------------------------- profilo alla registrazione

create or replace function gestisci_nuovo_utente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profili (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger su_nuovo_utente
  after insert on auth.users
  for each row execute function gestisci_nuovo_utente();

-- ---------------------------------------------------------------- storico delle fasi
-- Il cuore del CRM. Alla creazione registra la fase di partenza; a ogni
-- cambio di fase scrive la riga e calcola quanto è durata la fase lasciata.

create or replace function registra_prima_fase()
returns trigger
language plpgsql
as $$
begin
  insert into storico_fasi (trattativa_id, fase_partenza_id, fase_arrivo_id, avvenuto_il, utente_id)
  values (new.id, null, new.fase_id, new.data_apertura, utente_corrente());
  return new;
end;
$$;

create trigger trattative_prima_fase
  after insert on trattative
  for each row execute function registra_prima_fase();

create or replace function registra_cambio_fase()
returns trigger
language plpgsql
as $$
declare
  giorni numeric(8, 2);
begin
  if new.fase_id is distinct from old.fase_id then
    giorni := extract(epoch from (now() - old.in_fase_dal)) / 86400.0;

    insert into storico_fasi (
      trattativa_id, fase_partenza_id, fase_arrivo_id,
      avvenuto_il, utente_id, giorni_fase_precedente
    )
    values (new.id, old.fase_id, new.fase_id, now(), utente_corrente(), round(giorni, 2));

    new.in_fase_dal := now();
  end if;

  new.aggiornata_il := now();
  return new;
end;
$$;

create trigger trattative_cambio_fase
  before update on trattative
  for each row execute function registra_cambio_fase();

-- ---------------------------------------------------------------- alla firma nasce il progetto

create or replace function crea_progetto_alla_firma()
returns trigger
language plpgsql
as $$
declare
  fase_vinta boolean;
begin
  select is_vinta into fase_vinta from fasi where id = new.fase_id;

  if coalesce(fase_vinta, false) and not exists (
    select 1 from progetti where trattativa_id = new.id
  ) then
    insert into progetti (trattativa_id, azienda_id, nome, stato, kickoff_il)
    values (new.id, new.azienda_id, new.titolo, 'onboarding', current_date);

    update aziende set stato = 'cliente' where id = new.azienda_id and stato <> 'cliente';
  end if;

  return new;
end;
$$;

create trigger trattative_progetto_alla_firma
  after update on trattative
  for each row execute function crea_progetto_alla_firma();

-- ---------------------------------------------------------------- ultimo contatto

create or replace function aggiorna_ultimo_contatto()
returns trigger
language plpgsql
as $$
declare
  azienda uuid;
begin
  azienda := new.azienda_id;

  if azienda is null and new.trattativa_id is not null then
    select t.azienda_id into azienda from trattative t where t.id = new.trattativa_id;
  end if;

  if azienda is not null then
    update aziende
       set ultimo_contatto = greatest(coalesce(ultimo_contatto, new.avvenuta_il), new.avvenuta_il)
     where id = azienda;
  end if;

  if new.trattativa_id is not null then
    update trattative
       set ultima_attivita_il = greatest(coalesce(ultima_attivita_il, new.avvenuta_il), new.avvenuta_il)
     where id = new.trattativa_id;
  end if;

  return new;
end;
$$;

create trigger attivita_ultimo_contatto
  after insert on attivita
  for each row execute function aggiorna_ultimo_contatto();

-- ---------------------------------------------------------------- viste per le metriche

-- Stato vivo di ogni trattativa: giorni nella fase e semaforo.
create or replace view v_trattative_stato as
select
  t.id,
  t.titolo,
  t.azienda_id,
  a.ragione_sociale,
  t.fase_id,
  f.nome           as fase_nome,
  f.ambito         as fase_ambito,
  f.ordine         as fase_ordine,
  f.soglia_giorni,
  t.esito,
  t.valore_stimato,
  t.valore_finale,
  t.commerciale_id,
  t.in_fase_dal,
  t.ultima_attivita_il,
  floor(extract(epoch from (now() - t.in_fase_dal)) / 86400.0)::int as giorni_in_fase,
  floor(extract(epoch from (now() - t.data_apertura)) / 86400.0)::int as giorni_in_pipeline,
  case
    when f.soglia_giorni is null then 'neutro'
    when extract(epoch from (now() - t.in_fase_dal)) / 86400.0 > f.soglia_giorni then 'oltre'
    when extract(epoch from (now() - t.in_fase_dal)) / 86400.0 >= f.soglia_giorni * 0.75 then 'vicino'
    else 'in_tempo'
  end as semaforo
from trattative t
join fasi f on f.id = t.fase_id
join aziende a on a.id = t.azienda_id;

-- Durata mediana per fase, sulle trattative che quella fase l'hanno lasciata.
create or replace view v_tempi_per_fase as
select
  f.id            as fase_id,
  f.nome          as fase_nome,
  f.ordine,
  f.ambito,
  f.soglia_giorni,
  count(s.id)                                                                         as passaggi,
  round(avg(s.giorni_fase_precedente), 1)                                             as media_giorni,
  round(percentile_cont(0.5) within group (order by s.giorni_fase_precedente)::numeric, 1) as mediana_giorni
from fasi f
left join storico_fasi s on s.fase_partenza_id = f.id and s.giorni_fase_precedente is not null
group by f.id, f.nome, f.ordine, f.ambito, f.soglia_giorni;

-- Ciclo commerciale: dal primo contatto alla firma, e dalla firma al go-live.
create or replace view v_cicli as
select
  t.id as trattativa_id,
  case when t.esito = 'vinta'
       then floor(extract(epoch from (t.chiusura_effettiva - t.data_apertura)) / 86400.0)::int
  end as giorni_contatto_firma,
  case when p.golive_effettivo is not null and t.chiusura_effettiva is not null
       then (p.golive_effettivo - t.chiusura_effettiva::date)
  end as giorni_firma_golive
from trattative t
left join progetti p on p.trattativa_id = t.id;
