# CRM Merkorn

CRM commerciale interno: segue un'azienda dal primo contatto fino all'assistenza
post rilascio, misurando il tempo speso in ogni fase della trattativa.

## Stato

Fase di progettazione. Interfaccia definita, applicazione non ancora sviluppata.

## Documentazione

- [Specifica funzionale](docs/specifica-funzionale.md) — decisioni, fasi della
  pipeline, modello dati, schermate, metriche e piano di lavoro.
- [Sistema visivo](docs/sistema-visivo.md) — palette, tipografia e regole d'uso,
  derivate dal logo.
- [Token di design](docs/design-tokens.css) — gli stessi valori pronti per il codice.
- [Prototipo di interfaccia](prototipo/interfaccia.html) — cruscotto, pipeline
  trascinabile, scheda trattativa e anagrafica aziende, in un unico file HTML.

## Stack previsto

- **Frontend** Next.js (App Router) + TypeScript
- **Base dati** Supabase (Postgres, autenticazione, storage documenti)
- **Hosting** Vercel
