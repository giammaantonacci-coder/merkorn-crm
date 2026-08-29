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

export function configurazioneSupabase(): ConfigurazioneSupabase | null {
  const url = primoValorizzato(URL_ACCETTATI);
  const chiave = primoValorizzato(CHIAVI_ACCETTATE);

  if (!url?.[1] || !chiave?.[1]) return null;
  return { url: url[1], chiave: chiave[1] };
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
