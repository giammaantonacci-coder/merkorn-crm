import { createClient } from "@supabase/supabase-js";

import { chiaveDiServizio, configurazioneSupabase } from "@/lib/supabase/configurazione";
import type { Database } from "@/lib/database.types";

/**
 * Client con la chiave di servizio: scavalca i permessi di riga, quindi vive
 * solo lato server e si usa per le due cose che avvengono prima che ci sia un
 * utente — elencare le persone del team e crearne una nuova al primo accesso.
 */
export function creaClientAmministratore() {
  const config = configurazioneSupabase();
  const servizio = chiaveDiServizio();

  if (!config || !servizio) return null;

  return createClient<Database>(config.url, servizio, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
