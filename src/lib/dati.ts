import { cache } from "react";

import { configurazioneSupabase } from "@/lib/supabase/configurazione";
import { creaClientAmministratore } from "@/lib/supabase/amministratore";
import { creaClientServer } from "@/lib/supabase/server";
import type {
  Azienda,
  Fase,
  MotivoPerdita,
  Nota,
  Profilo,
  Servizio,
  Settore,
  TempoPerFase,
  Trattativa,
  TrattativaStato,
} from "@/lib/database.types";

/**
 * Senza configurazione non esiste una base dati da interrogare: le letture
 * rispondono vuoto, così la compilazione e le pagine reggono comunque e
 * l'applicazione può spiegare cosa manca.
 */
function nonConfigurato() {
  return configurazioneSupabase() === null;
}

export const profiloCorrente = cache(async function profiloCorrente(): Promise<Profilo | null> {
  if (nonConfigurato()) return null;

  const supabase = await creaClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profili").select("*").eq("id", user.id).single();
  return data ?? null;
});

export async function fasi(): Promise<Fase[]> {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  const { data } = await supabase
    .from("fasi")
    .select("*")
    .eq("attiva", true)
    .order("ordine");
  return data ?? [];
}

/** Le fasi che compongono la pipeline vera, escluse le uscite. */
export async function fasiPipeline(): Promise<Fase[]> {
  return (await fasi()).filter((f) => f.ambito !== "uscita");
}

export async function trattativeAperte(): Promise<TrattativaStato[]> {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  const { data } = await supabase
    .from("v_trattative_stato")
    .select("*")
    .eq("esito", "aperta")
    .order("fase_ordine")
    .order("giorni_in_fase", { ascending: false });
  return data ?? [];
}

/** Chi richiamare: aperte che hanno superato la soglia della loro fase. */
export async function trattativeOltreSoglia(): Promise<TrattativaStato[]> {
  const aperte = await trattativeAperte();
  return aperte
    .filter((t) => t.semaforo === "oltre")
    .sort((a, b) => b.giorni_in_fase - a.giorni_in_fase);
}

export async function trattativa(id: string) {
  if (nonConfigurato()) return null;

  const supabase = await creaClientServer();

  const [dettaglio, stato, storico, attivita, documenti] = await Promise.all([
    supabase
      .from("trattative")
      .select("*, aziende(id, ragione_sociale), contatti(id, nome, cognome, qualifica, telefono, ruolo_decisionale)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("v_trattative_stato").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("storico_fasi")
      .select("*, partenza:fasi!storico_fasi_fase_partenza_id_fkey(nome), arrivo:fasi!storico_fasi_fase_arrivo_id_fkey(nome)")
      .eq("trattativa_id", id)
      .order("avvenuto_il", { ascending: false }),
    supabase
      .from("attivita")
      .select("*")
      .eq("trattativa_id", id)
      .order("avvenuta_il", { ascending: false })
      .limit(20),
    supabase.from("documenti").select("*").eq("trattativa_id", id).order("caricato_il", { ascending: false }),
  ]);

  if (!dettaglio.data || !stato.data) return null;

  return {
    dettaglio: dettaglio.data,
    stato: stato.data,
    storico: storico.data ?? [],
    attivita: attivita.data ?? [],
    documenti: documenti.data ?? [],
  };
}

export async function aziende(cerca?: string) {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  let query = supabase
    .from("aziende")
    .select("*, settori(nome)")
    .order("ragione_sociale");

  if (cerca?.trim()) {
    query = query.ilike("ragione_sociale", `%${cerca.trim()}%`);
  }

  const { data } = await query;
  return data ?? [];
}

export async function azienda(id: string) {
  if (nonConfigurato()) return null;

  const supabase = await creaClientServer();

  const [scheda, contatti, trattative, progetti] = await Promise.all([
    supabase.from("aziende").select("*, settori(nome)").eq("id", id).maybeSingle(),
    supabase.from("contatti").select("*").eq("azienda_id", id).order("principale", { ascending: false }),
    supabase.from("v_trattative_stato").select("*").eq("azienda_id", id).order("fase_ordine"),
    supabase.from("progetti").select("*").eq("azienda_id", id).order("creato_il", { ascending: false }),
  ]);

  if (!scheda.data) return null;

  return {
    scheda: scheda.data,
    contatti: contatti.data ?? [],
    trattative: trattative.data ?? [],
    progetti: progetti.data ?? [],
  };
}

export async function scadenzeAperte() {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  const { data } = await supabase
    .from("scadenze")
    .select("*, trattative(id, titolo)")
    .eq("stato", "aperta")
    .order("scade_il");
  return data ?? [];
}

export async function scadenzeDiOggi() {
  const tutte = await scadenzeAperte();
  const fine = new Date();
  fine.setHours(23, 59, 59, 999);
  return tutte.filter((s) => new Date(s.scade_il) <= fine);
}

export async function progetti() {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  const { data } = await supabase
    .from("progetti")
    .select("*, aziende(ragione_sociale)")
    .order("golive_previsto", { nullsFirst: false });
  return data ?? [];
}

export async function tempiPerFase(): Promise<TempoPerFase[]> {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  const { data } = await supabase.from("v_tempi_per_fase").select("*").order("ordine");
  return data ?? [];
}

export async function trattativeChiuse(): Promise<Trattativa[]> {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  const { data } = await supabase
    .from("trattative")
    .select("*")
    .neq("esito", "aperta")
    .order("chiusura_effettiva", { ascending: false, nullsFirst: false });
  return data ?? [];
}

export async function settori(): Promise<Settore[]> {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  const { data } = await supabase.from("settori").select("*").eq("attivo", true).order("nome");
  return data ?? [];
}

export async function servizi(): Promise<Servizio[]> {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  const { data } = await supabase.from("servizi").select("*").eq("attivo", true).order("nome");
  return data ?? [];
}

export async function motiviPerdita(): Promise<MotivoPerdita[]> {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  const { data } = await supabase.from("motivi_perdita").select("*").eq("attivo", true).order("nome");
  return data ?? [];
}

export async function elencoAziendeSemplice(): Promise<Pick<Azienda, "id" | "ragione_sociale">[]> {
  if (nonConfigurato()) return [];

  const supabase = await creaClientServer();
  const { data } = await supabase.from("aziende").select("id, ragione_sociale").order("ragione_sociale");
  return data ?? [];
}

/**
 * I nomi gia registrati, per suggerirli in fase di accesso. Si legge senza
 * sessione, quindi passa dal client amministratore.
 */
export async function personeDelTeam(): Promise<string[]> {
  const amministratore = creaClientAmministratore();
  if (!amministratore) return [];

  const { data } = await amministratore
    .from("profili")
    .select("nome")
    .eq("attivo", true)
    .order("nome");

  return (data ?? []).map((p) => p.nome);
}

export type Menzione = { id: string; nome: string };
export type NotaConAutore = Nota & {
  autore: { nome: string } | null;
  menzioni: Menzione[];
};

/** Le persone taggabili in una nota: i membri attivi, id e nome. */
export async function personeTaggabili(): Promise<Menzione[]> {
  if (nonConfigurato()) return [];
  const supabase = await creaClientServer();
  const { data } = await supabase
    .from("profili")
    .select("id, nome")
    .eq("attivo", true)
    .order("nome");
  return data ?? [];
}

/** Bacheca condivisa: le aperte in cima, poi per data. Con le persone taggate. */
export async function noteCondivise(): Promise<NotaConAutore[]> {
  if (nonConfigurato()) return [];
  const supabase = await creaClientServer();

  // La FK va indicata esplicitamente: da quando esiste note_menzioni (ponte fra
  // note e profili), «autore:profili» sarebbe ambiguo e PostgREST risponderebbe
  // 300, svuotando la lista. «!note_autore_id_fkey» sceglie il legame diretto.
  const { data: righe } = await supabase
    .from("note")
    .select("*, autore:profili!note_autore_id_fkey(nome)")
    .order("completata")
    .order("creata_il", { ascending: false });
  const note = righe ?? [];
  if (note.length === 0) return [];

  // Le menzioni in query separate e senza embed (né reverse né forward): così
  // nessuna relazione "incorporata" può far fallire la lettura e svuotare la
  // bacheca. Se qualcosa qui va storto, le note restano visibili senza chip.
  const { data: legami } = await supabase
    .from("note_menzioni")
    .select("note_id, profilo_id")
    .in(
      "note_id",
      note.map((n) => n.id),
    );

  const righeLegami = legami ?? [];
  const nomePerId = new Map<string, string>();
  if (righeLegami.length > 0) {
    const { data: persone } = await supabase
      .from("profili")
      .select("id, nome")
      .in("id", [...new Set(righeLegami.map((l) => l.profilo_id))]);
    for (const p of persone ?? []) nomePerId.set(p.id, p.nome);
  }

  const perNota = new Map<string, Menzione[]>();
  for (const l of righeLegami) {
    const nome = nomePerId.get(l.profilo_id);
    if (!nome) continue;
    perNota.set(l.note_id, [...(perNota.get(l.note_id) ?? []), { id: l.profilo_id, nome }]);
  }

  return note.map((n) => ({ ...n, menzioni: perNota.get(n.id) ?? [] })) as NotaConAutore[];
}

/** Le sole note aperte, per l'anteprima nella schermata Oggi. */
export async function noteAperte(): Promise<NotaConAutore[]> {
  return (await noteCondivise()).filter((n) => !n.completata);
}

/** C'e una sessione valida? Vero anche quando il profilo non esiste ancora. */
export const sessioneAperta = cache(async function sessioneAperta(): Promise<boolean> {
  if (nonConfigurato()) return false;

  const supabase = await creaClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user !== null;
});
