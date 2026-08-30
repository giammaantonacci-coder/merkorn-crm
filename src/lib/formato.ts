import type { Semaforo, TrattativaStato } from "@/lib/database.types";

const EURO = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const DATA_LUNGA = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const DATA_BREVE = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" });
const ORA = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" });

export function euro(valore: number | null | undefined) {
  if (valore === null || valore === undefined) return "—";
  return EURO.format(valore);
}

export function dataLunga(iso: string | Date) {
  return DATA_LUNGA.format(typeof iso === "string" ? new Date(iso) : iso);
}

export function dataBreve(iso: string | null | undefined) {
  if (!iso) return "—";
  return DATA_BREVE.format(new Date(iso));
}

export function ora(iso: string) {
  return ORA.format(new Date(iso));
}

export function giorni(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `${Math.round(n)} ${Math.round(n) === 1 ? "giorno" : "giorni"}`;
}

export function giorniBrevi(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `${Math.round(n)} gg`;
}

export function iniziali(testo: string) {
  return testo
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parola) => parola[0] ?? "")
    .join("")
    .toUpperCase();
}

/** Colori del semaforo, gli stessi delle schermate approvate. */
export const SEMAFORO = {
  in_tempo: { punto: "bg-ok-dot", testo: "text-ok", fondo: "bg-ok-wash", etichetta: "In tempo" },
  vicino: { punto: "bg-warn-dot", testo: "text-warn", fondo: "bg-warn-wash", etichetta: "Si avvicina" },
  oltre: { punto: "bg-bad-dot", testo: "text-bad", fondo: "bg-bad-wash", etichetta: "Oltre soglia" },
  neutro: { punto: "bg-muted", testo: "text-muted", fondo: "bg-panel", etichetta: "Senza soglia" },
} as const satisfies Record<Semaforo, { punto: string; testo: string; fondo: string; etichetta: string }>;

/** Di quanto una trattativa ha sforato la soglia della sua fase. */
export function sforamento(giorniInFase: number, soglia: number | null) {
  if (soglia === null) return null;
  const oltre = giorniInFase - soglia;
  return oltre > 0 ? oltre : null;
}

// --------------------------------------------------------------- priorità

export type Livello = "alta" | "media" | "bassa";

export type TrattativaConPriorita = TrattativaStato & {
  punteggio: number;
  livello: Livello;
};

/**
 * Ogni fase avvicina alla firma: chi è più avanti pesa di più. La spinta del
 * semaforo tiene alte le trattative che stanno anche sforando i tempi.
 */
const SPINTA_SEMAFORO: Record<Semaforo, number> = {
  oltre: 1,
  vicino: 0.55,
  in_tempo: 0.15,
  neutro: 0.15,
};

export const LIVELLO_PRIORITA: Record<Livello, { etichetta: string; classe: string }> = {
  alta: { etichetta: "Alta", classe: "bg-arancio text-white" },
  media: { etichetta: "Media", classe: "bg-arancio-wash text-arancio-deep" },
  bassa: { etichetta: "Bassa", classe: "bg-panel text-muted" },
};

/**
 * Ordina le trattative aperte per importanza: quanto valgono e a che punto
 * sono. Il valore è rapportato alla trattativa più ricca del momento, così la
 * classifica ha senso anche con pochi clienti e si riequilibra da sola quando
 * ne arrivano altri. «ordineMassimo» è l'ordine dell'ultima fase prima della
 * firma: dà la posizione assoluta nella pipeline, non relativa alle presenti.
 */
export function perPriorita(
  aperte: TrattativaStato[],
  ordineMassimo: number,
): TrattativaConPriorita[] {
  const valoreMassimo = Math.max(1, ...aperte.map((t) => t.valore_stimato ?? 0));
  const scala = Math.max(1, ordineMassimo);

  return aperte
    .map((t) => {
      const valore = (t.valore_stimato ?? 0) / valoreMassimo;
      const avanzamento = Math.min(1, t.fase_ordine / scala);
      const punteggio =
        0.5 * valore + 0.35 * avanzamento + 0.15 * SPINTA_SEMAFORO[t.semaforo];
      const livello: Livello = punteggio >= 0.6 ? "alta" : punteggio >= 0.35 ? "media" : "bassa";
      return { ...t, punteggio, livello };
    })
    .sort(
      (a, b) =>
        b.punteggio - a.punteggio ||
        (b.valore_stimato ?? 0) - (a.valore_stimato ?? 0) ||
        b.giorni_in_fase - a.giorni_in_fase,
    );
}

export const ETICHETTE_FONTE: Record<string, string> = {
  passaparola: "Passaparola",
  fiera: "Fiera",
  sito_web: "Sito web",
  campagna: "Campagna",
  contatto_diretto: "Contatto diretto",
  altro: "Altro",
};

export const ETICHETTE_STATO_AZIENDA: Record<string, string> = {
  potenziale: "Potenziale",
  cliente: "Cliente",
  ex_cliente: "Ex cliente",
};

export const ETICHETTE_ATTIVITA: Record<string, string> = {
  chiamata: "Chiamata",
  email: "Email",
  incontro: "Incontro",
  demo: "Demo",
  nota: "Nota",
  altro: "Altro",
};

export const ETICHETTE_PROGETTO: Record<string, string> = {
  onboarding: "Onboarding",
  sviluppo: "Sviluppo",
  collaudo: "Collaudo",
  live: "In produzione",
  manutenzione: "Manutenzione",
  chiuso: "Chiuso",
};
