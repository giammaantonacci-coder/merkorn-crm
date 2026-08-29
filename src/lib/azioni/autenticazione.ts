"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { creaClientServer } from "@/lib/supabase/server";

export type StatoModulo = { errore?: string };

export async function accedi(_precedente: StatoModulo, modulo: FormData): Promise<StatoModulo> {
  const email = String(modulo.get("email") ?? "").trim();
  const password = String(modulo.get("password") ?? "");

  if (!email || !password) {
    return { errore: "Servono email e password." };
  }

  const supabase = await creaClientServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { errore: "Email o password non corrette. Riprova." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function esci() {
  const supabase = await creaClientServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/accesso");
}
