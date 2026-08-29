-- Irrobustimento segnalato dal linter di Supabase.
-- Rieseguibile.

-- 1. Le viste nascono SECURITY DEFINER: interrogate, applicherebbero i permessi
--    di chi le ha create invece di quelli di chi legge, scavalcando le policy
--    di riga. Su un CRM significa dati leggibili da chi non dovrebbe.
alter view v_trattative_stato set (security_invoker = on);
alter view v_tempi_per_fase   set (security_invoker = on);
alter view v_cicli            set (security_invoker = on);

-- 2. search_path fisso sulle funzioni: senza, chi puo creare oggetti in uno
--    schema di ricerca puo dirottare le chiamate interne alla funzione.
alter function utente_corrente()          set search_path = public;
alter function registra_prima_fase()      set search_path = public;
alter function registra_cambio_fase()     set search_path = public;
alter function crea_progetto_alla_firma() set search_path = public;
alter function aggiorna_ultimo_contatto() set search_path = public;

-- 3. Superficie API ridotta: queste funzioni servono ai trigger e alle policy,
--    non vanno chiamate da fuori via /rest/v1/rpc. Il privilegio va tolto a
--    PUBLIC, non ai singoli ruoli: e da li che lo ereditano tutti.
revoke execute on function gestisci_nuovo_utente()    from public;
revoke execute on function utente_corrente()          from public;
revoke execute on function registra_prima_fase()      from public;
revoke execute on function registra_cambio_fase()     from public;
revoke execute on function crea_progetto_alla_firma() from public;
revoke execute on function aggiorna_ultimo_contatto() from public;

-- e_membro_attivo resta eseguibile da chi ha effettuato l'accesso: la
-- richiamano le policy di riga, e senza il privilegio ogni lettura fallirebbe.
-- E SECURITY DEFINER apposta, per non ricadere nella policy di profili mentre
-- la sta valutando.
revoke execute on function e_membro_attivo() from public;
grant  execute on function e_membro_attivo() to authenticated;
