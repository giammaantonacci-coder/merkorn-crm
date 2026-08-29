import { Intestazione } from "@/components/nav/Intestazione";
import { Scheda, Riquadro, TitoloScheda, SottoTitolo } from "@/components/ui/Scheda";
import { Pastiglia } from "@/components/ui/Pastiglia";
import { fasi, motiviPerdita, profiloCorrente, tempiPerFase } from "@/lib/dati";
import { giorniBrevi } from "@/lib/formato";

export const metadata = { title: "Impostazioni · CRM Merkorn" };

const SOGLIA_CAMPIONE = 20;

export default async function PaginaImpostazioni() {
  const [profilo, elencoFasi, tempi, motivi] = await Promise.all([
    profiloCorrente(),
    fasi(),
    tempiPerFase(),
    motiviPerdita(),
  ]);

  const misure = new Map(tempi.map((t) => [t.fase_id, t]));
  const passaggiTotali = tempi.reduce((s, t) => s + Number(t.passaggi ?? 0), 0);

  return (
    <>
      <Intestazione nome={profilo?.nome ?? "Merkorn"} />

      <div className="flex flex-col gap-3 px-4">
        <h1 className="titolo px-2 pb-1 text-[27px]">Impostazioni</h1>

        <Scheda>
          <TitoloScheda>Fasi e soglie</TitoloScheda>
          <SottoTitolo className="mt-1.5">
            {passaggiTotali < SOGLIA_CAMPIONE
              ? `Le soglie vengono dai benchmark di settore. Dopo una ventina di passaggi registrati (ora ${passaggiTotali}) qui comparirà la vostra durata reale, da adottare al posto della soglia.`
              : "Accanto a ogni soglia c'è la durata mediana misurata sul vostro storico: dove diverge, la soglia va aggiornata."}
          </SottoTitolo>

          <ul className="mt-4 flex flex-col divide-y divide-line">
            {elencoFasi.map((f) => {
              const misura = misure.get(f.id);
              const reale = misura?.mediana_giorni;
              return (
                <li key={f.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[15px] font-semibold">{f.nome}</span>
                    <span className="text-[12.5px] text-muted">
                      {f.soglia_giorni === null ? "senza soglia" : `soglia ${f.soglia_giorni} giorni`}
                    </span>
                  </span>
                  {reale !== null && reale !== undefined ? (
                    <Pastiglia
                      tono={
                        f.soglia_giorni !== null && Number(reale) > f.soglia_giorni
                          ? "oltre"
                          : "in_tempo"
                      }
                    >
                      reale {giorniBrevi(Number(reale))}
                    </Pastiglia>
                  ) : (
                    <span className="shrink-0 text-[12.5px] text-muted">nessun dato</span>
                  )}
                </li>
              );
            })}
          </ul>
        </Scheda>

        <Scheda>
          <TitoloScheda className="mb-3.5">Motivi di perdita</TitoloScheda>
          <div className="flex flex-wrap gap-2">
            {motivi.map((m) => (
              <span key={m.id} className="rounded-full bg-panel px-4 py-2 text-sm font-semibold">
                {m.nome}
              </span>
            ))}
          </div>
        </Scheda>

        <Riquadro className="text-[13px] leading-relaxed text-muted">
          Fasi, soglie e motivi vivono nella base dati: si modificano senza toccare
          l&apos;applicazione, e lo storico resta coerente perché registra l&apos;identificativo
          della fase, non il nome.
        </Riquadro>
      </div>
    </>
  );
}
