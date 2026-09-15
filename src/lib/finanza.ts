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

/** Saldo di partenza del conto principale, prima di entrate e uscite registrate. */
export const SALDO_BASE = 1761.99;

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

export function nuovaTransazione(dati: {
  nome: string;
  cat: Categoria;
  tipo: TipoTx;
  importo: number;
}): Transazione {
  const ts = Date.now();
  return { id: id(), ...dati, quando: quandoDa(ts), ts };
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

export const STATO_INIZIALE: Stato = {
  tx: (
    [
      { nome: "Esselunga", cat: "Cibo", tipo: "out", importo: 48.2, quando: "Oggi · 14:20", ts: 6 },
      { nome: "Stipendio", cat: "Entrata", tipo: "in", importo: 3200, quando: "1 set", ts: 5 },
      { nome: "Netflix", cat: "Svago", tipo: "out", importo: 12.99, quando: "2 set", ts: 4 },
      { nome: "ATM Metro", cat: "Trasporti", tipo: "out", importo: 2.0, quando: "Oggi · 08:05", ts: 3 },
      { nome: "Enel Energia", cat: "Casa", tipo: "out", importo: 74.5, quando: "Ieri", ts: 2 },
      { nome: "Bar Centrale", cat: "Cibo", tipo: "out", importo: 3.8, quando: "Ieri", ts: 1 },
    ] satisfies Omit<Transazione, "id">[]
  ).map((t) => ({ ...t, id: `seed-${t.nome}` })),
  obiettivi: [
    { id: "seed-vac", nome: "Vacanza estate", target: 2000, salvato: 1200, colore: "#6b72f0" },
    { id: "seed-fondo", nome: "Fondo emergenza", target: 5000, salvato: 3400, colore: "#1f9d6b" },
    { id: "seed-laptop", nome: "Nuovo laptop", target: 1400, salvato: 300, colore: "#c9a86a" },
  ],
  conti: [
    { id: "seed-prep", nome: "Carta prepagata", sotto: "•••• 7734", saldo: 340 },
    { id: "seed-risp", nome: "Conto risparmio", sotto: "Deposito", saldo: 3400 },
    { id: "seed-cash", nome: "Contanti", sotto: "Portafoglio", saldo: 0 },
  ],
};

// ------------------------------------------------------------------ calcoli

export type Calcolo = {
  entrate: number;
  uscite: number;
  saldo: number;
  patrimonio: number;
  budgetSpeso: number;
  budgetPerc: number;
  budgetRimasto: number;
  perCategoria: { cat: Categoria; speso: number; perc: number; colore: string }[];
  risparmioTotale: number;
};

export function calcola(stato: Stato): Calcolo {
  const entrate = stato.tx.filter((t) => t.tipo === "in").reduce((a, t) => a + t.importo, 0);
  const uscite = stato.tx.filter((t) => t.tipo === "out").reduce((a, t) => a + t.importo, 0);
  const saldo = SALDO_BASE + entrate - uscite;
  const patrimonio = saldo + stato.conti.reduce((a, c) => a + c.saldo, 0);

  const perCategoria = BUDGET_CATEGORIE.map((cat, i) => {
    const speso = stato.tx
      .filter((t) => t.tipo === "out" && t.cat === cat)
      .reduce((a, t) => a + t.importo, 0);
    return { cat, speso, perc: (speso / BUDGET_TOTALE) * 100, colore: SFUMATURE_BUDGET[i] };
  });

  const budgetSpeso = uscite;
  const budgetPerc = Math.min(100, Math.round((budgetSpeso / BUDGET_TOTALE) * 100));
  const budgetRimasto = Math.max(0, BUDGET_TOTALE - budgetSpeso);
  const risparmioTotale = stato.obiettivi.reduce((a, o) => a + o.salvato, 0);

  return {
    entrate,
    uscite,
    saldo,
    patrimonio,
    budgetSpeso,
    budgetPerc,
    budgetRimasto,
    perCategoria,
    risparmioTotale,
  };
}
