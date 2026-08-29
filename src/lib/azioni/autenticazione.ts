"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { creaClientAmministratore } from "@/lib/supabase/amministratore";
import { pinSquadra, segretoAccessi } from "@/lib/supabase/configurazione";
import { creaClientServer } from "@/lib/supabase/server";
import { chiaveNome, credenzialeInterna, emailInterna, nomeLeggibile } from "@/lib/persone";

export type StatoModulo = { errore?: string };

/**
 * Accesso col solo nome. L'autenticazione vera resta sotto: il server ricava
 * dal nome una identita stabile e ci apre una sessione, così i permessi sul
 * database e la firma di ogni record continuano a funzionare.
 */
export async function entra(_precedente: StatoModulo, modulo: FormData): Promise<StatoModulo> {
  const digitato = String(modulo.get("nome") ?? "").trim();
  const chiave = chiaveNome(digitato);

  if (chiave.length < 2) {
    return { errore: "Scrivi il tuo nome per entrare." };
  }

  const pin = pinSquadra();
  if (pin && String(modulo.get("pin") ?? "").trim() !== pin) {
    return { errore: "Il PIN della squadra non è corretto." };
  }

  const segreto = segretoAccessi();
  if (!segreto) {
    return {
      errore:
        "Manca la chiave di servizio Supabase: senza, l'accesso col solo nome non può funzionare.",
    };
  }

  const email = emailInterna(chiave);
  const credenziale = credenzialeInterna(chiave, segreto);
  const nome = nomeLeggibile(digitato);

  const supabase = await creaClientServer();
  const primoTentativo = await supabase.auth.signInWithPassword({
    email,
    password: credenziale,
  });

  if (primoTentativo.error) {
    // Prima volta che questo nome entra: la persona va creata.
    const amministratore = creaClientAmministratore();
    if (!amministratore) {
      return {
        errore:
          "Manca la chiave di servizio Supabase: senza, non è possibile registrare una persona nuova.",
      };
    }

    const creazione = await amministratore.auth.admin.createUser({
      email,
      password: credenziale,
      email_confirm: true,
      user_metadata: { nome },
    });

    if (creazione.error) {
      return { errore: "Non è stato possibile registrare il nome. Riprova." };
    }

    const secondoTentativo = await supabase.auth.signInWithPassword({
      email,
      password: credenziale,
    });

    if (secondoTentativo.error) {
      return { errore: "Non è stato possibile entrare. Riprova." };
    }
  }

  // Il nome mostrato segue sempre l'ultima grafia digitata.
  await supabase.from("profili").update({ nome }).eq("email", email);

  revalidatePath("/", "layout");
  redirect("/");
}

export async function esci() {
  const supabase = await creaClientServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/accesso");
}
