"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { creaClientAmministratore } from "@/lib/supabase/amministratore";
import {
  chiaveDiServizioSbagliata,
  pinSquadra,
  segretoAccessi,
} from "@/lib/supabase/configurazione";
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
        "Manca il segreto dell'accesso. Su Vercel imposta ACCESSO_SEGRETO con una " +
        "stringa lunga a piacere, oppure SUPABASE_SERVICE_ROLE_KEY con la chiave " +
        "segreta di Supabase.",
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

  // Il profilo lo crea un trigger sulla base dati, ma non diamolo per scontato:
  // se manca, chi entra resterebbe autenticato e senza accesso a nulla.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error } = await supabase
      .from("profili")
      .upsert({ id: user.id, nome, email, attivo: true }, { onConflict: "id" });

    if (error) {
      if (error.code === "42P01") {
        return {
          errore:
            "La base dati non e ancora predisposta: applica i file in " +
            "supabase/migrations dal SQL Editor di Supabase, in ordine numerico.",
        };
      }
      return { errore: `Entrato, ma il profilo non e stato creato: ${error.message}` };
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Registra una persona al primo ingresso, provando le strade in ordine e
 * fermandosi alla prima che riesce. Nessun singolo tassello mal configurato
 * deve poter bloccare l'accesso.
 *
 *   1. chiave di servizio, se c'e ed e valida — non richiede nulla su Supabase
 *   2. registrazione normale con la chiave pubblica — richiede che la conferma
 *      via email sia disattivata, perche questi indirizzi non ricevono posta
 *
 * Restituisce un messaggio d'errore, oppure null se e andata.
 */
async function registraPersona(
  email: string,
  credenziale: string,
  nome: string,
): Promise<string | null> {
  const problemi: string[] = [];
  const amministratore = creaClientAmministratore();

  if (amministratore) {
    const { error } = await amministratore.auth.admin.createUser({
      email,
      password: credenziale,
      email_confirm: true,
      user_metadata: { nome },
    });
    if (!error) return null;
    problemi.push(`chiave di servizio rifiutata (${error.message})`);
  } else if (chiaveDiServizioSbagliata()) {
    problemi.push(
      "in SUPABASE_SERVICE_ROLE_KEY c'e la chiave pubblica invece di quella segreta",
    );
  }

  const supabase = await creaClientServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: credenziale,
    options: { data: { nome } },
  });

  if (!error && data.session) return null;

  if (!error && !data.session) {
    return (
      "Su Supabase, in Authentication > Sign In / Providers > Email, disattiva " +
      "«Confirm email»: gli indirizzi usati qui sono interni e non ricevono posta."
    );
  }

  // Nome gia registrato ma credenziale diversa: e cambiato il segreto da cui
  // viene derivata. E l'unico caso in cui qualcuno resta fuori dai propri dati.
  const messaggio = error?.message ?? "motivo ignoto";
  if (/already registered|already exists/i.test(messaggio)) {
    return (
      "Questo nome risulta gia registrato, ma la credenziale non corrisponde: " +
      "e cambiato il segreto da cui viene derivata (ACCESSO_SEGRETO o la chiave " +
      "di servizio). Rimetti il valore precedente, oppure elimina la persona da " +
      "Supabase in Authentication > Users e rientra."
    );
  }

  problemi.push(`registrazione diretta rifiutata (${messaggio})`);

  return (
    "Non e stato possibile registrare il nome. " +
    problemi.join("; ") +
    ". Basta sistemare una delle due: metti la chiave segreta di Supabase in " +
    "SUPABASE_SERVICE_ROLE_KEY, oppure disattiva «Confirm email» in Authentication."
  );
}

export async function esci() {
  const supabase = await creaClientServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/accesso");
}
