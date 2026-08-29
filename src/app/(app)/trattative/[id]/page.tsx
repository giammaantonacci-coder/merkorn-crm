import Link from "next/link";
import { notFound } from "next/navigation";

import { IntestazioneIndietro } from "@/components/nav/Intestazione";
import { Scheda, Riquadro, TitoloScheda, SottoTitolo } from "@/components/ui/Scheda";
import { PulsanteLink } from "@/components/ui/Pulsante";
import { PercorsoFasi } from "@/components/trattative/PercorsoFasi";
import { trattativa } from "@/lib/dati";
import {
  dataBreve,
  ETICHETTE_ATTIVITA,
  euro,
  giorni,
  giorniBrevi,
  iniziali,
  SEMAFORO,
  sforamento,
} from "@/lib/formato";

export default async function PaginaTrattativa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dati = await trattativa(id);
  if (!dati) notFound();

  const { dettaglio, stato, storico, attivita } = dati;
  const oltre = sforamento(stato.giorni_in_fase, stato.soglia_giorni);
  const tono = SEMAFORO[stato.semaforo];
  const referente = dettaglio.contatti;

  return (
    <>
      <IntestazioneIndietro titolo="Trattativa" href="/pipeline" />

      <div className="flex flex-col gap-3 px-4">
        <Scheda>
          <h1 className="titolo text-2xl">{dettaglio.aziende?.ragione_sociale}</h1>
          <p className="mt-1.5 text-sm text-muted">{dettaglio.titolo}</p>

          <div className={`mt-4 flex items-center gap-4 rounded-2xl p-4 ${tono.fondo}`}>
            <span className={`titolo shrink-0 text-[34px] ${tono.testo}`}>
              {stato.giorni_in_fase}
            </span>
            <span className={`text-[13.5px] leading-snug ${tono.testo}`}>
              <b className="font-bold">
                {stato.giorni_in_fase === 1 ? "giorno" : "giorni"} in {stato.fase_nome}
              </b>
              <br />
              {stato.soglia_giorni === null
                ? "questa fase non ha una soglia"
                : oltre
                  ? `${oltre} oltre la soglia di ${stato.soglia_giorni}`
                  : `la soglia è ${stato.soglia_giorni}`}
            </span>
          </div>

          <div className="mt-3.5 flex gap-2.5">
            <Riquadro className="flex-1 rounded-[15px] px-4 py-3">
              <span className="text-xs font-semibold text-muted">Valore</span>
              <p className="titolo mt-1 text-lg">
                {euro(dettaglio.valore_finale ?? dettaglio.valore_stimato)}
              </p>
            </Riquadro>
            <Riquadro className="flex-1 rounded-[15px] px-4 py-3">
              <span className="text-xs font-semibold text-muted">In pipeline da</span>
              <p className="titolo mt-1 text-lg">{giorni(stato.giorni_in_pipeline)}</p>
            </Riquadro>
          </div>
        </Scheda>

        <Scheda>
          <TitoloScheda>Quanto è durata ogni fase</TitoloScheda>
          <SottoTitolo className="mt-1.5">
            Verde se rientra nella soglia, rosso se la supera
          </SottoTitolo>
          <PercorsoFasi storico={storico} corrente={stato} />
        </Scheda>

        {referente ? (
          <Scheda className="flex items-center gap-3.5 py-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-panel text-sm font-bold">
              {iniziali(`${referente.nome} ${referente.cognome}`)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[15.5px] font-bold tracking-[-0.015em]">
                {referente.nome} {referente.cognome}
              </span>
              <span className="truncate text-[13px] text-muted">
                {[referente.qualifica, referente.ruolo_decisionale].filter(Boolean).join(" · ") ||
                  "Referente"}
              </span>
            </span>
            {referente.telefono ? (
              <a
                href={`tel:${referente.telefono}`}
                aria-label={`Chiama ${referente.nome}`}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-viola text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.7 1.5C10.6 19.8 4.2 13.4 3.5 5.2A1.5 1.5 0 0 1 5 3.5Z" />
                </svg>
              </a>
            ) : null}
          </Scheda>
        ) : null}

        <Scheda>
          <TitoloScheda className="mb-3.5">Cronologia</TitoloScheda>

          {attivita.length === 0 && storico.length <= 1 ? (
            <p className="text-sm text-muted">
              Ancora nessuna interazione registrata. Ogni chiamata o incontro che annoti qui resta
              nella storia dell'azienda.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {attivita.slice(0, 8).map((a) => (
                <li key={a.id} className="py-3.5 first:pt-0">
                  <p className="text-[15px] font-bold tracking-[-0.015em]">{a.oggetto}</p>
                  {a.resoconto ? (
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{a.resoconto}</p>
                  ) : null}
                  <p className="mt-1.5 text-xs text-muted">
                    {ETICHETTE_ATTIVITA[a.tipo] ?? a.tipo} · {dataBreve(a.avvenuta_il)}
                  </p>
                </li>
              ))}
              {storico
                .filter((s) => s.fase_partenza_id !== null)
                .slice(0, 4)
                .map((s) => (
                  <li key={s.id} className="py-3.5">
                    <p className="text-[15px] font-bold tracking-[-0.015em]">
                      Passata a {s.arrivo?.nome}
                    </p>
                    {s.nota ? (
                      <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{s.nota}</p>
                    ) : null}
                    <p className="mt-1.5 text-xs text-muted">
                      {dataBreve(s.avvenuto_il)}
                      {s.giorni_fase_precedente !== null && s.partenza
                        ? ` · ${giorniBrevi(s.giorni_fase_precedente)} in ${s.partenza.nome}`
                        : ""}
                    </p>
                  </li>
                ))}
            </ul>
          )}
        </Scheda>
      </div>

      {dettaglio.esito === "aperta" ? (
        <div className="safe-bottom sticky bottom-0 mt-3 flex gap-2.5 bg-surface px-4 pt-3.5">
          <PulsanteLink
            href={`/trattative/${id}/attivita`}
            variante="secondario"
            className="flex-1 px-3"
          >
            Registra attività
          </PulsanteLink>
          <PulsanteLink href={`/trattative/${id}/fase`} className="flex-1 px-3">
            Avanza di fase
          </PulsanteLink>
        </div>
      ) : (
        <div className="px-4 pt-1">
          <Riquadro className="text-sm text-muted">
            Trattativa chiusa come <b className="font-bold text-ink">{dettaglio.esito}</b> il{" "}
            {dataBreve(dettaglio.chiusura_effettiva)}.{" "}
            <Link href="/pipeline" className="font-bold text-viola-deep">
              Torna alla pipeline
            </Link>
          </Riquadro>
        </div>
      )}
    </>
  );
}
