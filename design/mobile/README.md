# Schermate mobile

Sorgenti delle schermate del CRM, una per file, 390×844.
`canvas.json` definisce disposizione e note sulla tavola.

| File | Schermata |
|---|---|
| `Accesso.dc.html` | Login |
| `Main.dc.html` | Oggi — chi richiamare e cosa c'è in agenda |
| `Pipeline.dc.html` | Trattative raggruppate per fase |
| `Trattativa.dc.html` | Scheda con la durata di ogni fase |
| `AvanzaFase.dc.html` | Pannello di cambio fase |
| `NuovaAzienda.dc.html` | Inserimento azienda |

Colori e tipografia vengono da [`docs/design-tokens.css`](../../docs/design-tokens.css).

Scelte di impianto:

- **Mobile prima, desktop derivato.** L'app si usa fuori ufficio; il desktop
  arriva dopo, allargando queste schermate.
- **Nessun cruscotto sul telefono.** La schermata di apertura dice chi
  richiamare, non come vanno le cose.
- **La pipeline è un elenco, non un kanban.** Le colonne trascinabili non
  funzionano su schermo stretto: le trattative si raggruppano per fase e si
  scorrono in verticale.
- **Il cambio di fase ha una schermata sua.** È il gesto in cui il CRM registra
  il tempo, quindi non può essere un menu nascosto.

Il canvas navigabile si rigenera da questi file con lo strumento di design; il
file assemblato non è versionato perché include l'editor.
