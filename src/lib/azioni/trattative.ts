"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { creaClientServer } from "@/lib/supabase/server";
import type { TipoAttivita, Trattativa } from "@/lib/database.types";

export type StatoModulo = { errore?: string };

function numeroOppureNull(modulo: FormData, campo: string) {
  const grezzo = String(modulo.get(campo) ?? "").replace(/\./g, "").replace(",", ".").trim();
  if (grezzo === "") return null;
  const n = Number(grezzo);
  return Number.isFinite(n) ? n : null;
}

export async function creaTrattativa(
  _precedente: StatoModulo,
  modulo: FormData,
): Promise<StatoModulo> {
  const titolo = String(modulo.get("titolo") ?? "").trim();
  const aziendaId = String(modulo.get("azienda_id") ?? "").trim();

  if (!titolo) return { errore: "Dai un titolo alla trattativa." };
  if (!aziendaId) return { errore: "Scegli l'azienda a cui collegarla." };

  const supabase = await creaClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Una trattativa nasce sempre nella prima fase: è il punto zero da cui
  // parte il conteggio dell'intero ciclo.
  const { data: primaFase } = await supabase
    .from("fasi")
    .select("id")
    .eq("attiva", true)
    .eq("ambito", "prevendita")
    .order("ordine")
    .limit(1)
    .single();

  if (!primaFase) {
    return { errore: "Le fasi della pipeline non sono configurate." };
  }

  const { data, error } = await supabase
    .from("trattative")
    .insert({
      titolo,
      azienda_id: aziendaId,
      fase_id: primaFase.id,
      valore_stimato: numeroOppureNull(modulo, "valore_stimato"),
      servizio_id: String(modulo.get("servizio_id") ?? "").trim() || null,
      descrizione: String(modulo.get("descrizione") ?? "").trim() || null,
      commerciale_id: user?.id ?? null,
      esito: "aperta",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { errore: "Non è stato possibile aprire la trattativa. Riprova." };
  }

  revalidatePath("/pipeline");
  revalidatePath("/");
  redirect(`/trattative/${data.id}`);
}

/**
 * Sposta una trattativa di fase. Lo storico e la durata della fase lasciata
 * li scrive il trigger sulla base dati, non questa funzione.
 */
export async function spostaDiFase(
  _precedente: StatoModulo,
  modulo: FormData,
): Promise<StatoModulo> {
  const trattativaId = String(modulo.get("trattativa_id") ?? "");
  const faseId = String(modulo.get("fase_id") ?? "");
  const nota = String(modulo.get("nota") ?? "").trim();
  const motivoPerdita = String(modulo.get("motivo_perdita_id") ?? "").trim();

  if (!trattativaId || !faseId) {
    return { errore: "Manca la fase di destinazione." };
  }

  const supabase = await creaClientServer();

  const { data: fase } = await supabase
    .from("fasi")
    .select("id, is_vinta, is_persa, ambito")
    .eq("id", faseId)
    .single();

  if (!fase) return { errore: "Fase non trovata." };

  if (fase.is_persa && !motivoPerdita) {
    return { errore: "Per chiudere una trattativa come persa serve il motivo." };
  }

  const aggiornamento: Partial<Trattativa> = { fase_id: faseId };

  if (fase.is_vinta) {
    aggiornamento.esito = "vinta";
    aggiornamento.chiusura_effettiva = new Date().toISOString();
    const valoreFinale = numeroOppureNull(modulo, "valore_finale");
    if (valoreFinale !== null) aggiornamento.valore_finale = valoreFinale;
  } else if (fase.is_persa) {
    aggiornamento.esito = "persa";
    aggiornamento.chiusura_effettiva = new Date().toISOString();
    aggiornamento.motivo_perdita_id = motivoPerdita;
    if (nota) aggiornamento.note_chiusura = nota;
  } else if (fase.ambito === "uscita") {
    aggiornamento.esito = "non_qualificata";
    aggiornamento.chiusura_effettiva = new Date().toISOString();
  }

  const { error } = await supabase.from("trattative").update(aggiornamento).eq("id", trattativaId);

  if (error) {
    return { errore: "Il passaggio di fase non è andato a buon fine. Riprova." };
  }

  // La nota del passaggio finisce sulla riga di storico appena creata dal trigger.
  if (nota && !fase.is_persa) {
    const { data: ultima } = await supabase
      .from("storico_fasi")
      .select("id")
      .eq("trattativa_id", trattativaId)
      .order("avvenuto_il", { ascending: false })
      .limit(1)
      .single();

    if (ultima) {
      await supabase.from("storico_fasi").update({ nota }).eq("id", ultima.id);
    }
  }

  revalidatePath("/pipeline");
  revalidatePath("/");
  redirect(`/trattative/${trattativaId}`);
}

export async function registraAttivita(
  _precedente: StatoModulo,
  modulo: FormData,
): Promise<StatoModulo> {
  const trattativaId = String(modulo.get("trattativa_id") ?? "");
  const oggetto = String(modulo.get("oggetto") ?? "").trim();

  if (!oggetto) return { errore: "Scrivi di cosa si è parlato." };

  const supabase = await creaClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trattativa } = await supabase
    .from("trattative")
    .select("azienda_id")
    .eq("id", trattativaId)
    .single();

  const { error } = await supabase.from("attivita").insert({
    tipo: String(modulo.get("tipo") ?? "chiamata") as TipoAttivita,
    trattativa_id: trattativaId,
    azienda_id: trattativa?.azienda_id ?? null,
    oggetto,
    resoconto: String(modulo.get("resoconto") ?? "").trim() || null,
    avvenuta_il: new Date().toISOString(),
    autore_id: user?.id ?? null,
  });

  if (error) {
    return { errore: "L'attività non è stata registrata. Riprova." };
  }

  revalidatePath(`/trattative/${trattativaId}`);
  redirect(`/trattative/${trattativaId}`);
}
