import { createBrowserClient } from "@supabase/ssr";

import { configurazioneSupabase } from "@/lib/supabase/configurazione";
import type { Database } from "@/lib/database.types";

export function creaClientBrowser() {
  const config = configurazioneSupabase();
  if (!config) {
    throw new Error(
      "Supabase non è configurato: mancano NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createBrowserClient<Database>(config.url, config.chiave);
}
