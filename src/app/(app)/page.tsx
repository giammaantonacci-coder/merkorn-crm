import { Fragment } from "react";
import Link from "next/link";

import { Intestazione } from "@/components/nav/Intestazione";
import { Scheda, TitoloScheda } from "@/components/ui/Scheda";
import { PulsanteLink } from "@/components/ui/Pulsante";
import { Vuoto } from "@/components/ui/Vuoto";
import { NoteInComune } from "@/components/note/NoteInComune";
import {
  fasiPipeline,
  noteAperte,
  personeTaggabili,
  profiloCorrente,
  scadenzeAperte,
  trattativeAperte,
  trattativeOltreSoglia,
} from "@/lib/dati";
import { dataBreve, dataLunga, euro, giorniBrevi, LIVELLO_PRIORITA, ora, perPriorita } from "@/lib/formato";

export const metadata = { title: "Oggi · CRM Merkorn" };

export default async function PaginaOggi() {
  const [profilo, daRichiamare, aperte, fasi, scadenze, note, persone] = await Promise.all([
    profiloCorrente(),
    trattativeOltreSoglia(),
    trattativeAperte(),
    fasiPipeline(),
    scadenzeAperte(),
    noteAperte(),
    personeTaggabili(),
  ]);

  const quante = daRichiamare.length;

  // Le fasi verso la firma, in ordine: danno la barra di avanzamento e la
  // posizione assoluta di ogni trattativa nel percorso di vendita.
  const fasiFirma = fasi
    .filter((f) => f.ambito === "prevendita" || f.ambito === "chiusura")
    .sort((a, b) => a.ordine - b.ordine);
  const ordineFirma = Math.max(1, ...fasiFirma.map((f) => f.ordine));
  const perImportanza = perPriorita(aperte, ordineFirma);

  // Scadenze: quelle di oggi per l'agenda, e la prossima per ogni trattativa
  // (la lista è già ordinata per data, quindi la prima incontrata è la più vicina).
  const fineOggi = new Date();
  fineOggi.setHours(23, 59, 59, 999);
  const scadenzeOggi = scadenze.filter((s) => new Date(s.scade_il) <= fineOggi);

  const prossimaAzione = new Map<string, (typeof scadenze)[number]>();
  for (const s of scadenze) {
    if (s.trattativa_id && !prossimaAzione.has(s.trattativa_id)) {
      prossimaAzione.set(s.trattativa_id, s);
    }
  }

  return (
    <>
      <Intestazione nome={profilo?.nome ?? "Merkorn"} />

      <div className="flex flex-col gap-3 px-4">
        <div className="pb-2 pt-1">
          <h1 className="titolo text-[27px]">
            {aperte.length === 0
              ? "Non c'è ancora nessuna trattativa"
              : quante === 0
                ? "Nessuna trattativa in ritardo"
                : quante === 1
                  ? "Una trattativa ha bisogno di te"
                  : `${quante} trattative hanno bisogno di te`}
          </h1>
          <p className="mt-1.5 text-sm capitalize text-muted">{dataLunga(new Date())}</p>
        </div>

        {aperte.length === 0 ? (
          <Scheda className="px-0 py-0">
            <Vuoto
              titolo="La pipeline è vuota"
              testo="Il CRM parte senza dati: il primo record sarà un lead vero. Comincia inserendo l'azienda, poi apri la trattativa che la riguarda."
              azione={<PulsanteLink href="/aziende/nuova">Aggiungi la prima azienda</PulsanteLink>}
            />
          </Scheda>
        ) : (
          <Scheda>
            <div className="mb-4 flex items-center justify-between gap-3">
              <TitoloScheda>Su cosa lavorare</TitoloScheda>
              <span className="text-[13px] font-semibold text-muted">Per valore e avanzamento</span>
            </div>

            <ol className="flex flex-col gap-2.5">
              {perImportanza.slice(0, 5).map((t) => {
                const raggiunte = fasiFirma.filter((f) => f.ordine <= t.fase_ordine).length;
                const prossimaFase = fasiFirma.find((f) => f.ordine > t.fase_ordine);
                const prossima = prossimaAzione.get(t.id);
                const livello = LIVELLO_PRIORITA[t.livello];
                return (
                  <li key={t.id}>
                    <Link
                      href={`/trattative/${t.id}`}
                      className="block rounded-2xl bg-panel p-4 active:opacity-80"
                    >
                      <div className="flex items-baseline justify-between gap-2.5">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-[15.5px] font-bold tracking-[-0.015em]">
                            {t.ragione_sociale}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${livello.classe}`}
                          >
                            {livello.etichetta}
                          </span>
                        </span>
                        <span className="shrink-0 text-[15px] font-extrabold tabular-nums">
                          {euro(t.valore_stimato)}
                        </span>
                      </div>

                      <div className="mt-0.5 text-[13px] text-muted">
                        {giorniBrevi(t.giorni_in_fase)} in questa fase
                      </div>

                      {fasiFirma.length > 1 ? (
                        <>
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex flex-1 items-center gap-1">
                              {fasiFirma.map((f, idx) => {
                                const fatta = f.ordine <= t.fase_ordine;
                                return (
                                  <Fragment key={f.id}>
                                    {idx > 0 ? (
                                      <span
                                        className={`h-[3px] flex-1 rounded-full ${fatta ? "bg-arancio" : "bg-line"}`}
                                      />
                                    ) : null}
                                    <span
                                      className={`size-2.5 shrink-0 rounded-full ${fatta ? "bg-arancio" : "bg-line"}`}
                                    />
                                  </Fragment>
                                );
                              })}
                            </div>
                            <span className="shrink-0 text-[11px] font-bold tabular-nums text-muted">
                              {raggiunte}/{fasiFirma.length}
                            </span>
                          </div>

                          <div className="mt-2 text-[12.5px] font-bold">
                            <span className="text-arancio-deep">{t.fase_nome}</span>
                            {prossimaFase ? (
                              <span className="font-semibold text-muted"> → {prossimaFase.nome}</span>
                            ) : null}
                          </div>
                        </>
                      ) : null}

                      {prossima ? (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-arancio-deep">
                          <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
                            <path d="M3 9h18M8 3v3M16 3v3" />
                          </svg>
                          <span className="truncate">
                            {prossima.titolo} · {dataBreve(prossima.scade_il)}
                          </span>
                        </div>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ol>

            <Link
              href="/pipeline"
              className="mt-4 block py-1.5 text-center text-sm font-bold text-arancio-deep"
            >
              Vedi tutte le {aperte.length} aperte
            </Link>
          </Scheda>
        )}

        <Scheda>
          <TitoloScheda className="mb-3.5">In agenda oggi</TitoloScheda>

          {scadenzeOggi.length === 0 ? (
            <p className="text-sm text-muted">
              Niente in scadenza oggi. Le prossime azioni compaiono qui appena le programmi da una
              trattativa.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {scadenzeOggi.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <span className="w-12 shrink-0 text-[15px] font-bold text-arancio">
                    {ora(s.scade_il)}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[15px] font-bold tracking-[-0.015em]">
                      {s.titolo}
                    </span>
                    {s.trattative ? (
                      <span className="truncate text-[13px] text-muted">{s.trattative.titolo}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Scheda>

        <NoteInComune note={note} autore={profilo?.nome ?? "—"} persone={persone} />
      </div>
    </>
  );
}
