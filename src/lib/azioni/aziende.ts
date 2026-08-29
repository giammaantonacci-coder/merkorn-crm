"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { creaClientServer } from "@/lib/supabase/server";
import type { Fonte } from "@/lib/database.types";

export type StatoModulo = { errore?: string };

function testoOppureNull(modulo: FormData, campo: string) {
  const valore = String(modulo.get(campo) ?? "").trim();
  return valore === "" ? null : valore;
}

export async function creaAzienda(
  _precedente: StatoModulo,
  modulo: FormData,
): Promise<StatoModulo> {
  const ragioneSociale = String(modulo.get("ragione_sociale") ?? "").trim();
  if (!ragioneSociale) {
    return { errore: "La ragione sociale è obbligatoria: senza non si può ritrovare l'azienda." };
  }

  const supabase = await creaClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("aziende")
    .insert({
      ragione_sociale: ragioneSociale,
      partita_iva: testoOppureNull(modulo, "partita_iva"),
      settore_id: testoOppureNull(modulo, "settore_id"),
      fonte: (testoOppureNull(modulo, "fonte") as Fonte | null) ?? null,
      telefono: testoOppureNull(modulo, "telefono"),
      email: testoOppureNull(modulo, "email"),
      citta: testoOppureNull(modulo, "citta"),
      note: testoOppureNull(modulo, "note"),
      stato: "potenziale",
      commerciale_id: user?.id ?? null,
      creata_da: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { errore: "Non è stato possibile salvare l'azienda. Riprova." };
  }

  revalidatePath("/aziende");

  if (modulo.get("apri_trattativa") === "si") {
    redirect(`/trattative/nuova?azienda=${data.id}`);
  }
  redirect(`/aziende/${data.id}`);
}
