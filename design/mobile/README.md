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

## Linguaggio visivo

Base monocroma su fondo bianco, schede con angoli ampi (22px) staccate da
un'ombra leggera invece che da un bordo — `0 1px 2px rgba(22,22,26,.04)` più
`0 6px 18px rgba(22,22,26,.07)`. Dentro le schede la gerarchia la reggono i
riquadri chiari annidati `#F6F6F4`. Tipografia Manrope, titoli in peso 800 con
spaziatura stretta.

Il viola Merkorn `#9747FF` compare solo dove si agisce — pulsante principale, fase
scelta, voce di menu attiva — e non colora mai un'informazione.

Le fasi parlano a semaforo, non per identità:

| Colore | Significato |
|---|---|
| Verde `#229160` · testo `#1B7A4B` | La fase rientra nella soglia |
| Giallo `#B98600` · testo `#8A6200` | Vicina alla soglia |
| Rosso `#D94A3F` · testo `#BF342B` | Oltre la soglia |

Il nome della fase è sempre scritto: il colore dice se sei in tempo, non che fase
è. Tutti i valori sono verificati sul contrasto (testo ≥ 4,5:1, pastiglie ≥ 3:1).

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
