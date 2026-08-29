import { createHmac } from "node:crypto";

/**
 * Chi entra digita solo il proprio nome. Da quel nome si ricava una identita
 * stabile: la stessa persona che riscrive il nome, anche con maiuscole o
 * accenti diversi, ritrova le proprie trattative.
 */
export function chiaveNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // segni diacritici
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

/** L'indirizzo interno con cui la persona esiste nell'autenticazione. */
export function emailInterna(chiave: string): string {
  return `${chiave}@merkorn.local`;
}

/**
 * La credenziale non la sceglie nessuno e non viene salvata da nessuna parte:
 * il server la ricalcola dal nome ogni volta.
 */
export function credenzialeInterna(chiave: string, segreto: string): string {
  return createHmac("sha256", segreto).update(`merkorn:${chiave}`).digest("hex");
}

/** Come il nome viene mostrato: iniziali maiuscole, spazi normalizzati. */
export function nomeLeggibile(nome: string): string {
  return nome
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((parola) => parola.charAt(0).toUpperCase() + parola.slice(1))
    .join(" ");
}
