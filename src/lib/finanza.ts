// Modello e logica dell'app di finanza personale. Nessun backend: i dati vivono
// nel dispositivo (localStorage). Qui stanno tipi, dati iniziali, formattazione
// e i calcoli derivati (saldo, entrate/uscite, budget, patrimonio).

export type TipoTx = "in" | "out";
export type Categoria = "Casa" | "Cibo" | "Trasporti" | "Svago" | "Altro" | "Entrata";

export type Transazione = {
  id: string;
  nome: string;
  cat: Categoria;
  tipo: TipoTx;
  importo: number;
  quando: string;
  mese: string; // "YYYY-MM", per il filtro del mese
  ts: number;
};

export type Obiettivo = {
  id: string;
  nome: string;
  target: number;
  salvato: number;
  colore: string;
};

export type Conto = {
  id: string;
  nome: string;
  sotto: string;
  saldo: number;
};

export type Stato = {
  nome: string;
  budget: number; // budget mensile impostato dall'utente (0 = non impostato)
  tx: Transazione[];
  obiettivi: Obiettivo[];
  conti: Conto[];
};

/** Colore del pallino per categoria, come nel design. */
export const CAT_COLORI: Record<Categoria, string> = {
  Casa: "#5b5e66",
  Cibo: "#111318",
  Trasporti: "#9a9da4",
  Svago: "#6b72f0",
  Altro: "#8a8f99",
  Entrata: "#1f9d6b",
};

export const CAT_USCITA: Categoria[] = ["Casa", "Cibo", "Trasporti", "Svago", "Altro"];

/** Saldo di partenza del conto principale: si parte da zero. */
export const SALDO_BASE = 0;

/** Budget mensile complessivo e ripartizione mostrata nella barra. */
export const BUDGET_TOTALE = 2400;
export const BUDGET_CATEGORIE: Categoria[] = ["Casa", "Cibo", "Trasporti"];
export const SFUMATURE_BUDGET = ["#6b72f0", "#8f95f4", "#b6baf8"];

export const OBIETTIVO_COLORI = ["#6b72f0", "#1f9d6b", "#c9a86a", "#d1543f", "#4b52c9"];

/** € con due decimali (default) o senza, all'italiana. */
export function eur(n: number, decimali = 2): string {
  return (
    "€ " +
    Math.abs(n).toLocaleString("it-IT", {
      minimumFractionDigits: decimali,
      maximumFractionDigits: decimali,
    })
  );
}

/** Interpreta un importo digitato all'italiana: "1.240,50" → 1240.5 */
export function leggiImporto(testo: string): number {
  return parseFloat(String(testo).replace(/\./g, "").replace(",", "."));
}

function id(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Etichetta «Oggi · 14:20» dal timestamp. */
export function quandoDa(ts: number): string {
  const d = new Date(ts);
  const ora = d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  return `Oggi · ${ora}`;
}

/** Mese in forma "YYYY-MM". */
export function meseDa(ts: number = Date.now()): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MESI_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

/** "2026-09" → "Settembre 2026" (o senza anno). */
export function etichettaMese(mese: string, conAnno = true): string {
  const [y, m] = mese.split("-").map(Number);
  const nome = MESI_IT[(m || 1) - 1] ?? mese;
  return conAnno ? `${nome} ${y}` : nome;
}

/** Il mese di una transazione, con ripiego per dati vecchi senza campo mese. */
export function meseDiTx(t: Transazione): string {
  if (t.mese) return t.mese;
  if (t.ts > 1e12) return meseDa(t.ts);
  return meseDa();
}

/** I mesi presenti tra le transazioni, dal più recente, col mese corrente incluso. */
export function mesiDisponibili(tx: Transazione[]): string[] {
  const set = new Set(tx.map(meseDiTx));
  set.add(meseDa());
  return [...set].sort().reverse();
}

/** Entrate e uscite di un singolo mese. */
export function totaliMese(tx: Transazione[], mese: string) {
  const nel = tx.filter((t) => meseDiTx(t) === mese);
  const entrate = nel.filter((t) => t.tipo === "in").reduce((a, t) => a + t.importo, 0);
  const uscite = nel.filter((t) => t.tipo === "out").reduce((a, t) => a + t.importo, 0);
  return { entrate, uscite };
}

/** Iniziale per l'avatar. */
export function iniziale(nome: string): string {
  return (nome.trim()[0] ?? "?").toUpperCase();
}

/** Scurisce un colore esadecimale mescolandolo col nero (f = quanto, 0..1). */
export function scurisci(hex: string, f = 0.32): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const d = (c: number) => Math.round(c * (1 - f));
  return `#${((1 << 24) + (d(r) << 16) + (d(g) << 8) + d(b)).toString(16).slice(1)}`;
}

const MESI_BREVI = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

/**
 * Andamento del saldo negli ultimi 7 mesi, ricavato dai movimenti (niente
 * grafico finto): barre in altezza relativa, etichette dei mesi, e il flusso
 * netto del mese corrente per il badge.
 */
export function andamentoSaldo(tx: Transazione[]): {
  barre: number[];
  etichette: string[];
  haDati: boolean;
  nettoMese: number;
} {
  const oggi = new Date();
  const mesi: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(oggi.getFullYear(), oggi.getMonth() - i, 1);
    mesi.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const nettoDi = (t: Transazione) => (t.tipo === "in" ? t.importo : -t.importo);
  const cumul = mesi.map((m) => tx.filter((t) => meseDiTx(t) <= m).reduce((a, t) => a + nettoDi(t), 0));
  const min = Math.min(...cumul, 0);
  const max = Math.max(...cumul, 0);
  const span = max - min || 1;
  const barre = cumul.map((v) => 15 + ((v - min) / span) * 85);
  const etichette = mesi.map((m) => MESI_BREVI[Number(m.split("-")[1]) - 1]);
  const meseCur = mesi[mesi.length - 1];
  const nettoMese = tx.filter((t) => meseDiTx(t) === meseCur).reduce((a, t) => a + nettoDi(t), 0);
  return { barre, etichette, haDati: tx.length > 0, nettoMese };
}

export function nuovaTransazione(dati: {
  nome: string;
  cat: Categoria;
  tipo: TipoTx;
  importo: number;
}): Transazione {
  const ts = Date.now();
  return { id: id(), ...dati, quando: quandoDa(ts), mese: meseDa(ts), ts };
}

export function nuovoObiettivo(dati: {
  nome: string;
  target: number;
  salvato: number;
  colore: string;
}): Obiettivo {
  return { id: id(), ...dati };
}

export function nuovoConto(dati: { nome: string; sotto: string; saldo: number }): Conto {
  return { id: id(), ...dati };
}

// ------------------------------------------------------------------ dati iniziali

/** Si parte da zero: nessun dato d'esempio. */
export const STATO_INIZIALE: Stato = {
  nome: "",
  budget: 0,
  tx: [],
  obiettivi: [],
  conti: [],
};

// ------------------------------------------------------------------ calcoli

export type Calcolo = {
  entrate: number;
  uscite: number;
  saldo: number;
  patrimonio: number;
  budget: number;
  budgetSpeso: number;
  budgetPerc: number;
  budgetRimasto: number;
  risparmioTotale: number;
};

export function calcola(stato: Stato): Calcolo {
  const entrate = stato.tx.filter((t) => t.tipo === "in").reduce((a, t) => a + t.importo, 0);
  const uscite = stato.tx.filter((t) => t.tipo === "out").reduce((a, t) => a + t.importo, 0);
  const saldo = SALDO_BASE + entrate - uscite;
  const patrimonio = saldo + stato.conti.reduce((a, c) => a + c.saldo, 0);

  const budget = stato.budget || 0;
  const budgetSpeso = uscite;
  const budgetPerc = budget > 0 ? Math.min(100, Math.round((budgetSpeso / budget) * 100)) : 0;
  const budgetRimasto = budget > 0 ? Math.max(0, budget - budgetSpeso) : 0;
  const risparmioTotale = stato.obiettivi.reduce((a, o) => a + o.salvato, 0);

  return { entrate, uscite, saldo, patrimonio, budget, budgetSpeso, budgetPerc, budgetRimasto, risparmioTotale };
}
