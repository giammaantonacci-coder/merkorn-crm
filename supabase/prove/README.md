# Prove sugli automatismi

Verificano che i trigger e le viste facciano davvero quello che devono: è il
codice da cui dipendono tutte le metriche, e sbagliarlo significa perdere dati
che non si recuperano.

Servono un Postgres locale e `psql`. Non toccano il progetto Supabase.

```bash
initdb -D /var/tmp/pgcrm -U postgres --auth=trust
pg_ctl -D /var/tmp/pgcrm -o '-p 5433 -k /var/tmp' start

psql -h /var/tmp -p 5433 -U postgres -f supabase/prove/00_scheletro_supabase.sql
for f in supabase/migrations/*.sql; do
  psql -h /var/tmp -p 5433 -U postgres -v ON_ERROR_STOP=1 -f "$f"
done
psql -h /var/tmp -p 5433 -U postgres -f supabase/prove/01_automatismi.sql
```

Ogni riga deve rispondere `t`. Cosa viene verificato:

| Prova | Cosa garantisce |
|---|---|
| Profilo creato dal trigger | Chi si registra entra nel team senza passaggi manuali |
| Prima fase nello storico | Il conteggio del ciclo parte dall'apertura, non dal primo passaggio |
| Durata della fase lasciata | Il numero su cui si reggono tutte le metriche di tempo |
| Contatore che riparte | Nessuna fase eredita i giorni di quella precedente |
| Semaforo verde / giallo / rosso | Le tre soglie scattano ai valori giusti |
| Ultimo contatto aggiornato | L'anagrafica resta allineata alle attività |
| Progetto creato alla firma | Il post vendita nasce da solo, e l'azienda diventa cliente |
| Perdita senza motivo rifiutata | Le statistiche sulle sconfitte restano aggregabili |
| Tempi per fase misurati | La vista di ricalibrazione delle soglie funziona |

`00_scheletro_supabase.sql` ricrea solo il minimo di Supabase che serve alle
migrazioni (`auth.users`, `auth.uid()`, storage, ruoli): in produzione quelle
parti le fornisce la piattaforma.
