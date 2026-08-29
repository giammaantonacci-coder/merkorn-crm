import Link from "next/link";

import { Intestazione } from "@/components/nav/Intestazione";
import { Scheda } from "@/components/ui/Scheda";
import { Pastiglia } from "@/components/ui/Pastiglia";
import { PulsanteLink } from "@/components/ui/Pulsante";
import { Vuoto } from "@/components/ui/Vuoto";
import { aziende, profiloCorrente } from "@/lib/dati";
import { dataBreve, ETICHETTE_STATO_AZIENDA, iniziali } from "@/lib/formato";

export const metadata = { title: "Aziende · CRM Merkorn" };

export default async function PaginaAziende({
  searchParams,
}: {
  searchParams: Promise<{ cerca?: string }>;
}) {
  const [{ cerca }, profilo] = await Promise.all([searchParams, profiloCorrente()]);
  const elenco = await aziende(cerca);

  return (
    <>
      <Intestazione nome={profilo?.nome ?? "Merkorn"} />

      <div className="flex flex-col gap-3 px-4">
        <div className="flex items-center justify-between gap-3 px-2 pb-1">
          <h1 className="titolo text-[27px]">Aziende</h1>
          <PulsanteLink href="/aziende/nuova" className="h-11 px-5 text-sm">
            Nuova
          </PulsanteLink>
        </div>

        <form action="/aziende" className="px-1">
          <label htmlFor="cerca" className="sr-only">
            Cerca un&apos;azienda
          </label>
          <input
            id="cerca"
            name="cerca"
            type="search"
            defaultValue={cerca ?? ""}
            placeholder="Cerca per nome…"
            className="h-12 w-full rounded-full bg-panel px-5 text-base text-ink outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viola-ink"
          />
        </form>

        {elenco.length === 0 ? (
          <Scheda className="px-0 py-0">
            <Vuoto
              titolo={cerca ? "Nessun risultato" : "Nessuna azienda in anagrafica"}
              testo={
                cerca
                  ? `Nessuna azienda contiene «${cerca}». Prova con una parte del nome.`
                  : "L'anagrafica è il punto di partenza: ogni trattativa, documento e attività si aggancia a un'azienda."
              }
              azione={
                cerca ? (
                  <PulsanteLink href="/aziende" variante="secondario">
                    Vedi tutte
                  </PulsanteLink>
                ) : (
                  <PulsanteLink href="/aziende/nuova">Aggiungi la prima azienda</PulsanteLink>
                )
              }
            />
          </Scheda>
        ) : (
          <Scheda className="py-2">
            <ul className="flex flex-col divide-y divide-line">
              {elenco.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/aziende/${a.id}`}
                    className="flex items-center gap-3.5 py-3.5 active:opacity-70"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-panel text-[13px] font-bold">
                      {iniziali(a.ragione_sociale)}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[15.5px] font-bold tracking-[-0.015em]">
                        {a.ragione_sociale}
                      </span>
                      <span className="truncate text-[13px] text-muted">
                        {[a.settori?.nome, a.ultimo_contatto ? `visto ${dataBreve(a.ultimo_contatto)}` : null]
                          .filter(Boolean)
                          .join(" · ") || "Nessun contatto registrato"}
                      </span>
                    </span>
                    <Pastiglia tono={a.stato === "cliente" ? "in_tempo" : "neutro"}>
                      {ETICHETTE_STATO_AZIENDA[a.stato]}
                    </Pastiglia>
                  </Link>
                </li>
              ))}
            </ul>
          </Scheda>
        )}
      </div>
    </>
  );
}
