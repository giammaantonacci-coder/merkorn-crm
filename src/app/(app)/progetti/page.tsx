import Link from "next/link";

import { Intestazione } from "@/components/nav/Intestazione";
import { Scheda } from "@/components/ui/Scheda";
import { Pastiglia } from "@/components/ui/Pastiglia";
import { Vuoto } from "@/components/ui/Vuoto";
import { profiloCorrente, progetti } from "@/lib/dati";
import { dataBreve, ETICHETTE_PROGETTO, euro } from "@/lib/formato";

export const metadata = { title: "Progetti · CRM Merkorn" };

/** Un contratto entro 60 giorni dalla scadenza va rinnovato adesso. */
function scadenzaVicina(data: string | null) {
  if (!data) return false;
  const giorni = (new Date(data).getTime() - Date.now()) / 86_400_000;
  return giorni <= 60;
}

export default async function PaginaProgetti() {
  const [profilo, elenco] = await Promise.all([profiloCorrente(), progetti()]);

  return (
    <>
      <Intestazione nome={profilo?.nome ?? "Merkorn"} />

      <div className="flex flex-col gap-3 px-4">
        <h1 className="titolo px-2 pb-1 text-[27px]">Progetti</h1>

        {elenco.length === 0 ? (
          <Scheda className="px-0 py-0">
            <Vuoto
              titolo="Nessun progetto attivo"
              testo="Un progetto nasce da solo quando una trattativa passa a «Contratto firmato»."
            />
          </Scheda>
        ) : (
          <Scheda className="py-2">
            <ul className="flex flex-col divide-y divide-line">
              {elenco.map((p) => {
                const rinnovo = scadenzaVicina(p.scadenza_contratto);
                const riga = (
                  <>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[15.5px] font-bold tracking-[-0.015em]">
                        {p.aziende?.ragione_sociale ?? p.nome}
                      </span>
                      <span className="truncate text-[13px] text-muted">
                        {p.nome}
                        {p.golive_effettivo
                          ? ` · in produzione dal ${dataBreve(p.golive_effettivo)}`
                          : p.golive_previsto
                            ? ` · go-live previsto ${dataBreve(p.golive_previsto)}`
                            : ""}
                        {p.canone ? ` · ${euro(p.canone)}` : ""}
                      </span>
                    </span>
                    <Pastiglia tono={rinnovo ? "vicino" : p.stato === "live" ? "in_tempo" : "neutro"}>
                      {rinnovo ? "da rinnovare" : ETICHETTE_PROGETTO[p.stato]}
                    </Pastiglia>
                  </>
                );

                return (
                  <li key={p.id} className="py-3.5">
                    {p.trattativa_id ? (
                      <Link
                        href={`/trattative/${p.trattativa_id}`}
                        className="flex items-center gap-3 active:opacity-70"
                      >
                        {riga}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3">{riga}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Scheda>
        )}
      </div>
    </>
  );
}
