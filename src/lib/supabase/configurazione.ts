/**
 * L'applicazione è interamente server-side: nessun componente client parla con
 * Supabase, quindi il prefisso NEXT_PUBLIC_ non è necessario e si accettano
 * anche i nomi che imposta da sé l'integrazione Vercel ↔ Supabase.
 *
 * Le letture sono statiche di proposito: `process.env[nome]` non viene
 * sostituito a build time e sul runtime edge del proxy resterebbe vuoto.
 */
export type ConfigurazioneSupabase = { url: string; chiave: string };

const URL_ACCETTATI: [string, string | undefined][] = [
  ["NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL],
  ["SUPABASE_URL", process.env.SUPABASE_URL],
  ["SUPABASE_NEXT_PUBLIC_SUPABASE_URL", process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL],
];

const CHIAVI_ACCETTATE: [string, string | undefined][] = [
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY],
  ["SUPABASE_ANON_KEY", process.env.SUPABASE_ANON_KEY],
  ["SUPABASE_PUBLISHABLE_KEY", process.env.SUPABASE_PUBLISHABLE_KEY],
  [
    "SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ],
];

function primoValorizzato(candidati: [string, string | undefined][]) {
  return candidati.find(([, valore]) => valore && valore.trim() !== "");
}

/**
 * Tiene solo l'origine dell'indirizzo. Una barra finale o un pezzo di percorso
 * incollato insieme all'URL — succede copiando dalla schermata delle API —
 * produrrebbero richieste tipo `//auth/v1/...`, che il gateway di Supabase
 * rifiuta con "Invalid path specified in request URL": un messaggio che non
 * fa sospettare l'indirizzo.
 */
export function normalizzaUrl(grezzo: string): string | null {
  const pulito = grezzo.trim();
  if (pulito === "") return null;

  const conProtocollo = /^https?:\/\//i.test(pulito) ? pulito : `https://${pulito}`;

  try {
    return new URL(conProtocollo).origin;
  } catch {
    return null;
  }
}

export function configurazioneSupabase(): ConfigurazioneSupabase | null {
  const url = primoValorizzato(URL_ACCETTATI);
  const chiave = primoValorizzato(CHIAVI_ACCETTATE);

  if (!url?.[1] || !chiave?.[1]) return null;

  const origine = normalizzaUrl(url[1]);
  if (!origine) return null;

  return { url: origine, chiave: chiave[1].trim() };
}

/**
 * Chiave di servizio: serve solo lato server, per creare la persona la prima
 * volta che entra. L'integrazione Vercel <-> Supabase la imposta da se.
 */
const SERVIZIO_ACCETTATE: [string, string | undefined][] = [
  ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
  ["SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY],
  ["SUPABASE_SERVICE_KEY", process.env.SUPABASE_SERVICE_KEY],
];

/**
 * Supabase ha due generazioni di chiavi: quelle storiche in formato JWT
 * (`eyJ...`) e quelle nuove (`sb_secret_...`). Accettiamo entrambe, ma
 * scartiamo quella pubblica: e l'errore piu facile da fare, perche sta nella
 * stessa schermata, e produrrebbe un "Invalid API key" incomprensibile.
 */
export function chiaveDiServizio(): string | null {
  const trovata = primoValorizzato(SERVIZIO_ACCETTATE)?.[1] ?? null;
  if (!trovata) return null;

  const pubblica = primoValorizzato(CHIAVI_ACCETTATE)?.[1];
  if (trovata === pubblica) return null;
  if (trovata.startsWith("sb_publishable_")) return null;

  return trovata;
}

/** Se la chiave di servizio impostata e in realta quella pubblica. */
export function chiaveDiServizioSbagliata(): boolean {
  const trovata = primoValorizzato(SERVIZIO_ACCETTATE)?.[1];
  if (!trovata) return false;
  return chiaveDiServizio() === null;
}

/**
 * Segreto con cui si deriva la credenziale interna di ogni persona. Chi entra
 * digita solo il nome: la password vera la calcola il server e non esiste
 * altrove.
 *
 * Deve essere un valore realmente segreto. Il repository e pubblico, quindi
 * l'algoritmo e leggibile: con la sola chiave pubblica chiunque potrebbe
 * ricavare la credenziale di un nome e scavalcare il PIN.
 */
export function segretoAccessi(): string | null {
  return (
    process.env.ACCESSO_SEGRETO ??
    process.env.SUPABASE_JWT_SECRET ??
    chiaveDiServizio()
  );
}

/** PIN facoltativo di squadra: se impostato, viene chiesto oltre al nome. */
export function pinSquadra(): string | null {
  const pin = process.env.ACCESSO_PIN;
  return pin && pin.trim() !== "" ? pin.trim() : null;
}

/** I nomi cercati, per spiegare all'utente cosa impostare. */
export function nomiAccettati() {
  return {
    url: URL_ACCETTATI.map(([nome]) => nome),
    chiave: CHIAVI_ACCETTATE.map(([nome]) => nome),
  };
}

/** Quale dei due pezzi manca: serve alla schermata di configurazione. */
export function mancanti(): { url: boolean; chiave: boolean } {
  return {
    url: !primoValorizzato(URL_ACCETTATI),
    chiave: !primoValorizzato(CHIAVI_ACCETTATE),
  };
}
