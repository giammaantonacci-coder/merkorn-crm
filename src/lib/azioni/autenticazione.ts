"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { creaClientAmministratore } from "@/lib/supabase/amministratore";
import { pinSquadra, segretoAccessi } from "@/lib/supabase/configurazione";
import { creaClientServer } from "@/lib/supabase/server";
import {
  chiaveNome,
  credenzialeInterna,
  emailInterna,
  nomeLeggibile,
  pinCorrisponde,
} from "@/lib/persone";

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
  if (pin && !pinCorrisponde(String(modulo.get("pin") ?? ""), pin)) {
    return { errore: "PIN non corretto." };
  }

  // Il segreto deve essere davvero segreto: il repository e pubblico, quindi
  // l'algoritmo si legge, e la chiave pubblica non basterebbe a proteggere nulla.
  const segreto = segretoAccessi();
  if (!segreto) {
    return {
      errore:
        "Manca SUPABASE_SERVICE_ROLE_KEY fra le variabili d'ambiente su Vercel. " +
        "La trovi su Supabase, in Impostazioni > API > service_role.",
    };
  }

  const email = emailInterna(chiave);
  const credenziale = credenzialeInterna(chiave, segreto);
  const nome = nomeLeggibile(digitato);

  const supabase = await creaClientServer();
  const accesso = await supabase.auth.signInWithPassword({ email, password: credenziale });

  if (accesso.error) {
    const registrazione = await registraPersona(email, credenziale, nome);
    if (registrazione) return { errore: registrazione };

    const secondoTentativo = await supabase.auth.signInWithPassword({
      email,
      password: credenziale,
    });

    if (secondoTentativo.error) {
      return { errore: `Non è stato possibile entrare: ${secondoTentativo.error.message}` };
    }
  }

  // Il nome mostrato segue sempre l'ultima grafia digitata.
  await supabase.from("profili").update({ nome }).eq("email", email);

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Registra una persona al primo ingresso. Con la chiave di servizio si crea
 * direttamente; senza, si passa dalla registrazione normale, che funziona solo
 * se su Supabase la conferma via email e disattivata — cosa necessaria comunque,
 * visto che questi indirizzi sono interni e non ricevono posta.
 *
 * Restituisce un messaggio d'errore, oppure null se e andata.
 */
async function registraPersona(
  email: string,
  credenziale: string,
  nome: string,
): Promise<string | null> {
  const amministratore = creaClientAmministratore();

  if (amministratore) {
    const { error } = await amministratore.auth.admin.createUser({
      email,
      password: credenziale,
      email_confirm: true,
      user_metadata: { nome },
    });
    return error ? `Non e stato possibile registrare il nome: ${error.message}` : null;
  }

  const supabase = await creaClientServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: credenziale,
    options: { data: { nome } },
  });

  if (error) {
    return `Non e stato possibile registrare il nome: ${error.message}`;
  }

  if (!data.session) {
    return (
      "Il nome e stato registrato ma manca la conferma via email. Su Supabase, in " +
      "Authentication > Sign In / Providers > Email, disattiva «Confirm email»: " +
      "gli indirizzi qui sono interni e non ricevono posta."
    );
  }

  return null;
}

export async function esci() {
  const supabase = await creaClientServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/accesso");
}
