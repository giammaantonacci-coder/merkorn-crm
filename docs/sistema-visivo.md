# Sistema visivo — CRM Merkorn

Derivato dal logo: cinque blocchi viola che salgono e ridiscendono, la forma di una
pipeline. I valori pronti per il codice sono in [design-tokens.css](design-tokens.css).

Il viola letto dal logo fornito è **#9747FF**. La geometria è stata ricostruita in
`public/brand/logo-merkorn.svg` (griglia 200×200, cinque blocchi, raggio 26): se
esiste l'originale vettoriale va sostituito, e la palette si ricalibra da quel solo
valore.

## Principio

Il viola è il marchio e l'avanzamento. Non è mai uno stato: vinta è verde, ferma è
ambra, persa è rossa. Dieci fasi tutte dello stesso viola sarebbero indistinguibili,
quindi il colore dice qualcosa — si satura man mano che la trattativa si avvicina
alla firma, poi vira al verde-acqua quando il cliente è acquisito.

## Palette

| Ruolo | Tema chiaro | Tema scuro |
|---|---|---|
| Accento marchio | `#9747FF` | `#C08BFF` |
| Accento profondo (testo, link) | `#7B2FE0` | `#D6B2FF` |
| Accento premuto / focus | `#6721C4` | `#E2CCFF` |
| Velo accento (selezione) | `#F3EBFF` | `#241934` |
| Fondo pagina | `#F8F6FB` | `#12101A` |
| Superficie (schede) | `#FFFFFF` | `#1B1826` |
| Superficie alternata | `#F1EEF7` | `#241F33` |
| Linea | `#E5E1EC` | `#2E2A3D` |
| Linea marcata | `#CFC8DC` | `#443E58` |
| Testo principale | `#14111C` | `#E9E6F0` |
| Testo secondario | `#3A3547` | `#C8C2D8` |
| Testo attenuato | `#6E6880` | `#A79FBC` |
| Vinta | `#17794F` | `#5CCB95` |
| Ferma | `#A15F00` | `#E5A855` |
| Persa | `#BF342B` | `#F58C84` |
| Informativo | `#1B6AAD` | `#6FB6EE` |

### Colori delle fasi

| Fase | Tema chiaro | Tema scuro |
|---|---|---|
| 1 Primo contatto | `#A868FF` | `#DEC6FF` |
| 2 Qualificazione | `#9747FF` | `#CBA8FF` |
| 3 Analisi requisiti | `#8A2BF2` | `#B98BFF` |
| 4 Proposta inviata | `#7828D8` | `#A870FF` |
| 5 Negoziazione | `#6721C4` | `#9758F0` |
| 6 Kickoff | `#279486` | `#7FDCCC` |
| 7 Sviluppo | `#1E8B7C` | `#5FC9B8` |
| 8 Collaudo e rilascio | `#137A6C` | `#45B3A2` |
| 9 Assistenza | `#0F6A5E` | `#2E9C8B` |
| Non qualificata | `#8B8697` | `#9E98AE` |
| Persa | `#BF342B` | `#F58C84` |

Tutti i valori sono verificati: testo almeno 4,5:1 sul proprio fondo, elementi
grafici almeno 3:1, in entrambi i temi.

I due estremi di ogni rampa sono passi di luminosità regolari: il viola scende da
0,657 a 0,459 in OKLab con passi fra 0,043 e 0,059, il teal da 0,603 a 0,472. È una
rampa **sequenziale**, non categorica: da sola non basta a distinguere le fasi, e
infatti il nome della fase è sempre scritto accanto al colore.

## Tipografia

Plus Jakarta Sans per tutta l'interfaccia: geometrica e leggermente arrotondata,
sta bene accanto ai blocchi del logo e regge i pesi alti dei numeri. IBM Plex Mono
solo dove le cifre devono incolonnarsi.

| Ruolo | Famiglia | Specifica |
|---|---|---|
| Numero grande (KPI) | Plus Jakarta Sans 800 | 33px, spaziatura −0,035em, `tabular-nums` |
| Titolo scheda | Plus Jakarta Sans 700 | 17,5px, spaziatura −0,02em |
| Testo interfaccia | Plus Jakarta Sans 400 | 15px |
| Etichette e note | Plus Jakarta Sans 500 | 13px, colore attenuato |
| Dati e importi | IBM Plex Mono 500 | cifre a larghezza fissa (`tabular-nums`) |

## Forma dell'interfaccia

Angoli generosi e bordi chiarissimi al posto delle ombre: l'interfaccia è fatta di
superfici bianche appoggiate su un fondo lavanda, non di pannelli sovrapposti.

| Elemento | Valore |
|---|---|
| Contenitore applicazione | raggio 28px |
| Scheda | raggio 22px, bordo 1px `#EBE7F3`, nessuna ombra |
| Riquadro interno | raggio 16px, fondo `#F8F6FC` |
| Scheda di trattativa | raggio 13px, filetto colorato di fase a sinistra 3px |
| Pillole, chip, pulsanti | raggio pieno (999px) |
| Spaziatura fra schede | 16px |
| Pulsante principale | gradiente `#A868FF → #7828D8`, testo bianco |

La navigazione principale è una riga di pillole contornate: quella attiva prende
bordo viola, testo viola profondo e fondo velo. Nessuna barra laterale.

## Regole d'uso

- Un solo pulsante viola pieno per schermata. Le azioni secondarie sono contornate,
  le terziarie sono solo testo.
- Il viola non è mai uno stato. Dice «Merkorn» e dice «avanzamento», mai «va bene».
- Il colore non è mai l'unico segnale: ogni stato porta anche un'etichetta scritta.
- Importi, giorni e percentuali nel monospaziato, per incolonnarsi.
- Niente sfumature viola: il logo è fatto di superfici piatte. Le ombre restano
  grigie e appena percettibili.
- Niente viola sui grafici multi-serie: verrebbe letto come «la nostra» serie.
