/**
 * Senza le variabili d'ambiente il client Supabase non si può nemmeno creare.
 * Invece di far esplodere ogni richiesta con un 500 muto, qui si controlla
 * prima e l'applicazione mostra cosa manca.
 */
export type ConfigurazioneSupabase = { url: string; chiave: string };

export function configurazioneSupabase(): ConfigurazioneSupabase | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chiave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !chiave) return null;
  return { url, chiave };
}

export function variabiliMancanti(): string[] {
  const attese: [string, string | undefined][] = [
    ["NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
  ];
  return attese.filter(([, valore]) => !valore).map(([nome]) => nome);
}
