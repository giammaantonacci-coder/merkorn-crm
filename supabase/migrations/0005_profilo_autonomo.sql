-- Rieseguibile: queste migrazioni si incollano a mano nel SQL Editor, e
-- rilanciare due volte lo stesso file non deve rompere nulla.

-- L'applicazione deve poter creare il proprio profilo anche se il trigger su
-- auth.users non c'e: senza, chi entra resta autenticato ma senza profilo, e
-- i permessi di riga gli negano tutto.
drop policy if exists profili_inserimento_proprio on profili;
create policy profili_inserimento_proprio on profili
  for insert to authenticated with check (id = auth.uid());

-- I privilegi sulle tabelle di solito li assegna Supabase da se, ma dipenderne
-- e fragile: se le migrazioni vengono eseguite da un ruolo diverso, le tabelle
-- restano inaccessibili e l'errore ("permission denied") non fa capire che il
-- problema e nei privilegi e non nelle policy.
-- Chi vede cosa continuano a deciderlo solo le policy di riga.
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to authenticated, service_role;
grant usage, select on all sequences in schema public
  to authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
