-- Scheletro minimo di Supabase, solo per provare le migrazioni in locale.
create schema if not exists auth;
create schema if not exists storage;

do $$ begin
  create role anon nologin noinherit;
exception when duplicate_object then null; end $$;
do $$ begin
  create role authenticated nologin noinherit;
exception when duplicate_object then null; end $$;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb default '{}'::jsonb
);

create table if not exists storage.buckets (
  id text primary key, name text, public boolean default false
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text
);
alter table storage.objects enable row level security;

-- auth.uid() legge l'utente finto impostato dalla sessione di prova
create or replace function auth.uid() returns uuid language sql stable as $fn$
  select nullif(current_setting('prova.utente', true), '')::uuid;
$fn$;
