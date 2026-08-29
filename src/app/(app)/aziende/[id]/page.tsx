import Link from "next/link";
import { notFound } from "next/navigation";

import { IntestazioneIndietro } from "@/components/nav/Intestazione";
import { Scheda, Riquadro, TitoloScheda } from "@/components/ui/Scheda";
import { Pastiglia } from "@/components/ui/Pastiglia";
import { PulsanteLink } from "@/components/ui/Pulsante";
import { azienda } from "@/lib/dati";
import {
  dataBreve,
  ETICHETTE_FONTE,
  ETICHETTE_PROGETTO,
  ETICHETTE_STATO_AZIENDA,
  euro,
  giorniBrevi,
  iniziali,
} from "@/lib/formato";

export default async function PaginaAzienda({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dati = await azienda(id);
  if (!dati) notFound();

  const { scheda, contatti, trattative, progetti } = dati;
  const aperte = trattative.filter((t) => t.esito === "aperta");
  const chiuse = trattative.filter((t) => t.esito !== "aperta");

  return (
    <>
      <IntestazioneIndietro titolo="Aziende" href="/aziende" />

      <div className="flex flex-col gap-3 px-4">
        <Scheda>
          <div className="flex items-start justify-between gap-3">
            <h1 className="titolo text-2xl">{scheda.ragione_sociale}</h1>
            <Pastiglia tono={scheda.stato === "cliente" ? "in_tempo" : "neutro"}>
              {ETICHETTE_STATO_AZIENDA[scheda.stato]}
            </Pastiglia>
          </div>

          <dl className="mt-4 flex flex-col divide-y divide-line">
            {[
              ["Settore", scheda.settori?.nome],
              ["Come è arrivata", scheda.fonte ? ETICHETTE_FONTE[scheda.fonte] : null],
              ["Partita IVA", scheda.partita_iva],
              ["Città", scheda.citta],
              ["Telefono", scheda.telefono],
              ["Email", scheda.email],
              ["Ultimo contatto", scheda.ultimo_contatto ? dataBreve(scheda.ultimo_contatto) : null],
            ]
              .filter(([, valore]) => Boolean(valore))
              .map(([etichetta, valore]) => (
                <div key={etichetta} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-[13px] text-muted">{etichetta}</dt>
                  <dd className="text-right text-[14.5px] font-semibold">{valore}</dd>
                </div>
              ))}
          </dl>

          {scheda.note ? (
            <Riquadro className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
              {scheda.note}
            </Riquadro>
          ) : null}
        </Scheda>

        <Scheda>
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <TitoloScheda>Trattative</TitoloScheda>
            <PulsanteLink
              href={`/trattative/nuova?azienda=${id}`}
              variante="secondario"
              className="h-10 px-4 text-[13px]"
            >
              Aprine una
            </PulsanteLink>
          </div>

          {trattative.length === 0 ? (
            <p className="text-sm text-muted">
              Nessuna trattativa aperta con questa azienda. È il momento buono per aprirne una.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {[...aperte, ...chiuse].map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/trattative/${t.id}`}
                    className="flex flex-col gap-2 rounded-2xl bg-panel p-4 active:opacity-80"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[15.5px] font-bold tracking-[-0.015em]">
                        {t.titolo}
                      </span>
                      <span className="shrink-0 text-sm font-bold">
                        {euro(t.valore_finale ?? t.valore_stimato)}
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-3">
                      <span className="truncate text-[13px] text-muted">{t.fase_nome}</span>
                      {t.esito === "aperta" ? (
                        <Pastiglia tono={t.semaforo}>{giorniBrevi(t.giorni_in_fase)}</Pastiglia>
                      ) : (
                        <Pastiglia tono={t.esito === "vinta" ? "in_tempo" : "oltre"}>
                          {t.esito}
                        </Pastiglia>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Scheda>

        {contatti.length > 0 ? (
          <Scheda>
            <TitoloScheda className="mb-3.5">Referenti</TitoloScheda>
            <ul className="flex flex-col divide-y divide-line">
              {contatti.map((c) => (
                <li key={c.id} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-panel text-xs font-bold">
                    {iniziali(`${c.nome} ${c.cognome}`)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[15px] font-bold tracking-[-0.015em]">
                      {c.nome} {c.cognome}
                    </span>
                    <span className="truncate text-[13px] text-muted">
                      {[c.qualifica, c.ruolo_decisionale].filter(Boolean).join(" · ") || "Referente"}
                    </span>
                  </span>
                  {c.telefono ? (
                    <a
                      href={`tel:${c.telefono}`}
                      aria-label={`Chiama ${c.nome}`}
                      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-viola-wash text-viola-deep"
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
                </li>
              ))}
            </ul>
          </Scheda>
        ) : null}

        {progetti.length > 0 ? (
          <Scheda>
            <TitoloScheda className="mb-3.5">Progetti</TitoloScheda>
            <ul className="flex flex-col gap-2.5">
              {progetti.map((p) => (
                <li key={p.id} className="rounded-2xl bg-panel p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-[15px] font-bold tracking-[-0.015em]">
                      {p.nome}
                    </span>
                    <Pastiglia tono={p.stato === "live" ? "in_tempo" : "neutro"}>
                      {ETICHETTE_PROGETTO[p.stato]}
                    </Pastiglia>
                  </div>
                  <p className="mt-1.5 text-[13px] text-muted">
                    Go-live {p.golive_effettivo ? dataBreve(p.golive_effettivo) : "previsto " + dataBreve(p.golive_previsto)}
                  </p>
                </li>
              ))}
            </ul>
          </Scheda>
        ) : null}
      </div>
    </>
  );
}
