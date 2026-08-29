-- Lo storico dei passaggi e scritto dal trigger e mai a mano: per questo
-- storico_fasi ha la sola policy di lettura. Ma le funzioni del trigger
-- giravano con i permessi di chi inserisce, e quella policy bloccava la
-- scrittura: alla prima trattativa creata dall'applicazione l'inserimento
-- falliva con "new row violates row-level security policy".
--
-- SECURITY DEFINER le fa girare con i permessi del proprietario, che e
-- esattamente l'intento: il tempo lo registra il sistema, non l'utente.
--
-- Attenzione a chi legge in futuro: una prova eseguita come superutente non
-- vede questo problema, perche il proprietario scavalca i permessi di riga.
-- Va provato assumendo il ruolo authenticated.

create or replace function registra_prima_fase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into storico_fasi (trattativa_id, fase_partenza_id, fase_arrivo_id, avvenuto_il, utente_id)
  values (new.id, null, new.fase_id, new.data_apertura, utente_corrente());
  return new;
end;
$$;

create or replace function registra_cambio_fase()
returns trigger
language plpgsql
security definer
set search_path = public
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

-- Il progetto alla firma scrive su progetti e aziende: stessa ragione.
create or replace function crea_progetto_alla_firma()
returns trigger
language plpgsql
security definer
set search_path = public
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

create or replace function aggiorna_ultimo_contatto()
returns trigger
language plpgsql
security definer
set search_path = public
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

-- Ricreate le funzioni, il privilegio torna a PUBLIC: va tolto di nuovo.
revoke execute on function registra_prima_fase()      from public;
revoke execute on function registra_cambio_fase()     from public;
revoke execute on function crea_progetto_alla_firma() from public;
revoke execute on function aggiorna_ultimo_contatto() from public;
