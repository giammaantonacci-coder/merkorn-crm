"use server";

import { revalidatePath } from "next/cache";

import { creaClientServer } from "@/lib/supabase/server";
import { personeMenzionate } from "@/lib/menzioni";

type ClientServer = Awaited<ReturnType<typeof creaClientServer>>;

export type StatoModulo = { errore?: string };

async function utente() {
  const supabase = await creaClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function aggiorna() {
  revalidatePath("/note");
  revalidatePath("/");
}

/**
 * Allinea le menzioni di una nota al suo testo: legge i «@Nome» presenti tra i
 * membri attivi e riscrive le righe di note_menzioni. La verità è il testo,
 * così la modifica di una nota aggiorna da sola chi la riguarda.
 */
async function sincronizzaMenzioni(supabase: ClientServer, noteId: string, testo: string) {
  const { data } = await supabase.from("profili").select("id, nome").eq("attivo", true);
  const ids = personeMenzionate(testo, data ?? []).map((p) => p.id);

  await supabase.from("note_menzioni").delete().eq("note_id", noteId);
  if (ids.length > 0) {
    await supabase
      .from("note_menzioni")
      .insert(ids.map((profilo_id) => ({ note_id: noteId, profilo_id })));
  }
}

export async function creaNota(_precedente: StatoModulo, modulo: FormData): Promise<StatoModulo> {
  const testo = String(modulo.get("testo") ?? "").trim();
  if (!testo) return { errore: "Scrivi la nota prima di aggiungerla." };

  const { supabase, user } = await utente();
  const { data, error } = await supabase
    .from("note")
    .insert({ testo, autore_id: user?.id ?? null, completata: false })
    .select("id")
    .single();

  if (error || !data) return { errore: "Non è stato possibile salvare la nota. Riprova." };
  await sincronizzaMenzioni(supabase, data.id, testo);
  aggiorna();
  return {};
}

export async function modificaNota(_precedente: StatoModulo, modulo: FormData): Promise<StatoModulo> {
  const id = String(modulo.get("id") ?? "");
  const testo = String(modulo.get("testo") ?? "").trim();
  if (!id) return { errore: "Nota non trovata." };
  if (!testo) return { errore: "La nota non può restare vuota." };

  const { supabase } = await utente();
  const { error } = await supabase
    .from("note")
    .update({ testo, aggiornata_il: new Date().toISOString() })
    .eq("id", id);

  if (error) return { errore: "La modifica non è andata a buon fine. Riprova." };
  await sincronizzaMenzioni(supabase, id, testo);
  aggiorna();
  return {};
}

/** Segna la nota fatta o la riapre. */
export async function completaNota(id: string, completata: boolean) {
  const { supabase } = await utente();
  await supabase
    .from("note")
    .update({
      completata,
      completata_il: completata ? new Date().toISOString() : null,
      aggiornata_il: new Date().toISOString(),
    })
    .eq("id", id);
  aggiorna();
}

export async function eliminaNota(id: string) {
  const { supabase } = await utente();
  await supabase.from("note").delete().eq("id", id);
  aggiorna();
}
