import type { NextRequest } from "next/server";

import { aggiornaSessione } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return aggiornaSessione(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icone|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
