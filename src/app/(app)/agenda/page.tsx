import Link from "next/link";

import { IntestazioneIndietro } from "@/components/nav/Intestazione";
import { Scheda, TitoloScheda } from "@/components/ui/Scheda";
import { Pastiglia } from "@/components/ui/Pastiglia";
import { Vuoto } from "@/components/ui/Vuoto";
import { scadenzeAperte } from "@/lib/dati";
import { dataBreve, ora } from "@/lib/formato";

export const metadata = { title: "Agenda · CRM Merkorn" };

export default async function PaginaAgenda() {
  const scadenze = await scadenzeAperte();

  const adesso = new Date();
  const fineOggi = new Date();
  fineOggi.setHours(23, 59, 59, 999);

  const inRitardo = scadenze.filter((s) => new Date(s.scade_il) < adesso);
  const oggi = scadenze.filter(
    (s) => new Date(s.scade_il) >= adesso && new Date(s.scade_il) <= fineOggi,
  );
  const dopo = scadenze.filter((s) => new Date(s.scade_il) > fineOggi);

  const gruppi = [
    { titolo: "In ritardo", righe: inRitardo, tono: "oltre" as const },
    { titolo: "Oggi", righe: oggi, tono: "in_tempo" as const },
    { titolo: "Prossime", righe: dopo, tono: "neutro" as const },
  ].filter((g) => g.righe.length > 0);

  return (
    <>
      <IntestazioneIndietro titolo="Agenda" href="/altro" />

      <div className="flex flex-col gap-3 px-4">
        <h1 className="titolo pb-1 text-[27px]">Agenda</h1>

        {scadenze.length === 0 ? (
          <Scheda className="px-0 py-0">
            <Vuoto
              titolo="Nessuna scadenza aperta"
              testo="Le prossime azioni compaiono qui appena le programmi da una trattativa."
            />
          </Scheda>
        ) : (
          gruppi.map((gruppo) => (
            <Scheda key={gruppo.titolo}>
              <TitoloScheda className="mb-3.5">{gruppo.titolo}</TitoloScheda>
              <ul className="flex flex-col divide-y divide-line">
                {gruppo.righe.map((s) => {
                  const contenuto = (
                    <>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-[15px] font-bold tracking-[-0.015em]">
                          {s.titolo}
                        </span>
                        <span className="truncate text-[13px] text-muted">
                          {dataBreve(s.scade_il)} · {ora(s.scade_il)}
                          {s.trattative ? ` · ${s.trattative.titolo}` : ""}
                        </span>
                      </span>
                      {gruppo.tono === "oltre" ? <Pastiglia tono="oltre">scaduta</Pastiglia> : null}
                    </>
                  );

                  return (
                    <li key={s.id} className="py-3.5 first:pt-0 last:pb-0">
                      {s.trattativa_id ? (
                        <Link
                          href={`/trattative/${s.trattativa_id}`}
                          className="flex items-center gap-3 active:opacity-70"
                        >
                          {contenuto}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3">{contenuto}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Scheda>
          ))
        )}
      </div>
    </>
  );
}
