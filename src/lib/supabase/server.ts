import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { configurazioneSupabase } from "@/lib/supabase/configurazione";
import type { Database } from "@/lib/database.types";

export async function creaClientServer() {
  const config = configurazioneSupabase();
  if (!config) {
    throw new Error(
      "Supabase non è configurato: mancano NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    config.url,
    config.chiave,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // In un Server Component i cookie sono di sola lettura: il refresh
            // della sessione lo fa il middleware, quindi qui si può ignorare.
          }
        },
      },
    },
  );
}
