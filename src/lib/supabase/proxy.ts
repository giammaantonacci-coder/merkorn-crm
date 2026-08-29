import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { configurazioneSupabase } from "@/lib/supabase/configurazione";

const PUBBLICHE = ["/accesso", "/auth"];

export async function aggiornaSessione(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Senza configurazione non c'è sessione da rinnovare né login possibile:
  // si lascia passare, e le pagine spiegano cosa manca invece di dare 500.
  const config = configurazioneSupabase();
  if (!config) return response;

  const supabase = createServerClient(
    config.url,
    config.chiave,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const percorso = request.nextUrl.pathname;
  const pubblica = PUBBLICHE.some((p) => percorso.startsWith(p));

  if (!user && !pubblica) {
    const url = request.nextUrl.clone();
    url.pathname = "/accesso";
    url.searchParams.set("da", percorso);
    return NextResponse.redirect(url);
  }

  if (user && percorso === "/accesso") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
