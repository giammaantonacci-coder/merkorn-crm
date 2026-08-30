import { IntestazioneIndietro } from "@/components/nav/Intestazione";
import { Scheda, Riquadro, TitoloScheda, SottoTitolo } from "@/components/ui/Scheda";
import { Vuoto } from "@/components/ui/Vuoto";
import { tempiPerFase, trattativeAperte, trattativeChiuse } from "@/lib/dati";
import { euro, giorniBrevi } from "@/lib/formato";

export const metadata = { title: "Report · CRM Merkorn" };

export default async function PaginaReport() {
  const [tempi, aperte, chiuse] = await Promise.all([
    tempiPerFase(),
    trattativeAperte(),
    trattativeChiuse(),
  ]);

  const vinte = chiuse.filter((t) => t.esito === "vinta");
  const perse = chiuse.filter((t) => t.esito === "persa");
  const decise = vinte.length + perse.length;
  const tassoSuccesso = decise > 0 ? Math.round((vinte.length / decise) * 100) : null;

  const misurate = tempi.filter((t) => t.mediana_giorni !== null);
  const massimo = Math.max(...misurate.map((t) => Number(t.mediana_giorni ?? 0)), 1);

  return (
    <>
      <IntestazioneIndietro titolo="Report" href="/altro" />

      <div className="flex flex-col gap-3 px-4">
        <h1 className="titolo pb-1 text-[27px]">Report</h1>

        <Scheda className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <span className="titolo whitespace-nowrap text-[29px]">
              {euro(aperte.reduce((s, t) => s + (t.valore_stimato ?? 0), 0))}
            </span>
            <span className="text-right text-[13.5px] leading-snug text-muted">
              Valore aperto
              <br />
              su {aperte.length} {aperte.length === 1 ? "trattativa" : "trattative"}
            </span>
          </div>
          <div className="h-px bg-line" />
          <div className="flex items-center justify-between gap-4">
            <span className="titolo w-[152px] shrink-0 text-[29px]">
              {tassoSuccesso === null ? "—" : `${tassoSuccesso}%`}
            </span>
            <span className="text-right text-[13.5px] leading-snug text-muted">
              Tasso di successo
              <br />
              {decise === 0 ? "nessuna ancora decisa" : `${vinte.length} vinte su ${decise}`}
            </span>
          </div>
        </Scheda>

        <Scheda>
          <TitoloScheda>Tempi per fase</TitoloScheda>
          <SottoTitolo className="mt-1.5">
            Durata mediana misurata sul vostro storico, confrontata con la soglia
          </SottoTitolo>

          {misurate.length === 0 ? (
            <Riquadro className="mt-4 text-sm text-muted">
              Ancora nessuna fase conclusa: il dato compare da solo appena qualche trattativa
              avanza. Fino ad allora restano valide le soglie di partenza.
            </Riquadro>
          ) : (
            <ul className="mt-4 flex flex-col gap-3.5">
              {misurate.map((t) => {
                const mediana = Number(t.mediana_giorni);
                const oltre = t.soglia_giorni !== null && mediana > t.soglia_giorni;
                return (
                  <li key={t.fase_id} className="flex items-center gap-3">
                    <span className="w-[112px] shrink-0 truncate text-[13.5px]">{t.fase_nome}</span>
                    <span className="flex min-w-0 flex-1 items-center">
                      <span
                        className={`h-2.5 rounded-full ${oltre ? "bg-bad-dot" : "bg-ok-dot"}`}
                        style={{ width: `${Math.max(4, Math.round((mediana / massimo) * 100))}%` }}
                        aria-hidden
                      />
                    </span>
                    <span
                      className={`shrink-0 text-[13px] font-bold ${oltre ? "text-bad" : "text-ok"}`}
                    >
                      {giorniBrevi(mediana)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Scheda>

        <Scheda>
          <TitoloScheda className="mb-3.5">Trattative chiuse</TitoloScheda>
          {chiuse.length === 0 ? (
            <Vuoto
              titolo="Nessuna ancora chiusa"
              testo="Il tasso di successo e i motivi di perdita compaiono qui dalla prima chiusura."
            />
          ) : (
            <dl className="flex flex-col divide-y divide-line">
              {[
                ["Vinte", vinte.length],
                ["Perse", perse.length],
                ["Non qualificate", chiuse.length - decise],
                ["Valore firmato", euro(vinte.reduce((s, t) => s + (t.valore_finale ?? 0), 0))],
              ].map(([etichetta, valore]) => (
                <div key={etichetta} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-[13px] text-muted">{etichetta}</dt>
                  <dd className="text-[15px] font-bold">{valore}</dd>
                </div>
              ))}
            </dl>
          )}
        </Scheda>
      </div>
    </>
  );
}
