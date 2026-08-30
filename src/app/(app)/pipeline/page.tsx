import Link from "next/link";

import { Intestazione } from "@/components/nav/Intestazione";
import { Scheda, TitoloScheda } from "@/components/ui/Scheda";
import { Pastiglia, Punto } from "@/components/ui/Pastiglia";
import { PulsanteLink, PulsantePiu } from "@/components/ui/Pulsante";
import { Vuoto } from "@/components/ui/Vuoto";
import { fasiPipeline, profiloCorrente, trattativeAperte } from "@/lib/dati";
import { euro, giorniBrevi, sforamento } from "@/lib/formato";
import type { Semaforo } from "@/lib/database.types";

export const metadata = { title: "Pipeline · CRM Merkorn" };

/** Il semaforo del gruppo è quello della trattativa messa peggio. */
function semaforoPeggiore(valori: Semaforo[]): Semaforo {
  if (valori.includes("oltre")) return "oltre";
  if (valori.includes("vicino")) return "vicino";
  if (valori.includes("in_tempo")) return "in_tempo";
  return "neutro";
}

export default async function PaginaPipeline() {
  const [profilo, aperte, fasi] = await Promise.all([
    profiloCorrente(),
    trattativeAperte(),
    fasiPipeline(),
  ]);

  const valoreAperto = aperte.reduce((somma, t) => somma + (t.valore_stimato ?? 0), 0);
  const inRitardo = aperte.filter((t) => t.semaforo === "oltre").length;

  return (
    <>
      <Intestazione nome={profilo?.nome ?? "Merkorn"} />

      <div className="flex flex-col gap-3 px-4">
        <div className="flex items-center justify-between gap-3 pb-1">
          <h1 className="titolo text-[27px]">Pipeline</h1>
<PulsantePiu href="/trattative/nuova" label="Nuova trattativa" />
        </div>

        {aperte.length === 0 ? (
          <Scheda className="px-0 py-0">
            <Vuoto
              titolo="Non c'è ancora nessuna trattativa"
              testo="Apri la prima trattativa da un'azienda in anagrafica: da lì parte il conteggio del ciclo."
              azione={<PulsanteLink href="/trattative/nuova">Apri una trattativa</PulsanteLink>}
            />
          </Scheda>
        ) : (
          <>
            <Scheda className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <span className="titolo whitespace-nowrap text-[29px]">{euro(valoreAperto)}</span>
                <span className="text-right text-[13.5px] leading-snug text-muted">
                  Valore aperto
                  <br />
                  su {aperte.length} {aperte.length === 1 ? "trattativa" : "trattative"}
                </span>
              </div>
              <div className="h-px bg-line" />
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`titolo w-[152px] shrink-0 text-[29px] ${inRitardo > 0 ? "text-bad" : "text-ok"}`}
                >
                  {inRitardo}
                </span>
                <span className="text-right text-[13.5px] leading-snug text-muted">
                  Oltre la soglia
                  <br />
                  della loro fase
                </span>
              </div>
            </Scheda>

            {fasi.map((fase) => {
              const gruppo = aperte.filter((t) => t.fase_id === fase.id);
              if (gruppo.length === 0) return null;

              const valore = gruppo.reduce((s, t) => s + (t.valore_stimato ?? 0), 0);
              const tono = semaforoPeggiore(gruppo.map((t) => t.semaforo));

              return (
                <Scheda key={fase.id}>
                  <div className="mb-3.5 flex items-center justify-between gap-3">
                    <TitoloScheda>{fase.nome}</TitoloScheda>
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <Punto tono={tono} />
                      <span className="text-[13px] font-semibold text-muted">
                        {gruppo.length} · {euro(valore)}
                      </span>
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2.5">
                    {gruppo.map((t) => {
                      const oltre = sforamento(t.giorni_in_fase, t.soglia_giorni);
                      return (
                        <li key={t.id}>
                          <Link
                            href={`/trattative/${t.id}`}
                            className="flex flex-col gap-2 rounded-2xl bg-panel p-4 active:opacity-80"
                          >
                            <span className="flex items-baseline justify-between gap-3">
                              <span className="truncate text-[15.5px] font-bold tracking-[-0.015em]">
                                {t.ragione_sociale}
                              </span>
                              <span className="shrink-0 text-sm font-bold">
                                {euro(t.valore_stimato)}
                              </span>
                            </span>
                            <span className="flex items-center justify-between gap-3">
                              <span className="truncate text-[13px] text-muted">{t.titolo}</span>
                              <Pastiglia tono={t.semaforo}>
                                {giorniBrevi(t.giorni_in_fase)}
                                {oltre ? " · oltre" : ""}
                              </Pastiglia>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </Scheda>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}
