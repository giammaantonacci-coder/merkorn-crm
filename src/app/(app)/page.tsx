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
  scadenzeDiOggi,
  trattativeAperte,
  trattativeOltreSoglia,
} from "@/lib/dati";
import { dataLunga, euro, LIVELLO_PRIORITA, ora, perPriorita } from "@/lib/formato";

export const metadata = { title: "Oggi · CRM Merkorn" };

export default async function PaginaOggi() {
  const [profilo, daRichiamare, aperte, fasi, scadenze, note, persone] = await Promise.all([
    profiloCorrente(),
    trattativeOltreSoglia(),
    trattativeAperte(),
    fasiPipeline(),
    scadenzeDiOggi(),
    noteAperte(),
    personeTaggabili(),
  ]);

  const quante = daRichiamare.length;

  // Ordine dell'ultima fase prima della firma: misura quanto una trattativa è
  // vicina a chiudersi, indipendentemente da quali trattative ci sono adesso.
  const ordineFirma = Math.max(
    1,
    ...fasi.filter((f) => f.ambito === "prevendita" || f.ambito === "chiusura").map((f) => f.ordine),
  );
  const perImportanza = perPriorita(aperte, ordineFirma);

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
              <TitoloScheda>Panoramica trattative</TitoloScheda>
              <span className="text-[13px] font-semibold text-muted">Per valore e avanzamento</span>
            </div>

            <ol className="flex flex-col gap-2.5">
              {perImportanza.slice(0, 5).map((t, i) => {
                const livello = LIVELLO_PRIORITA[t.livello];
                return (
                  <li key={t.id}>
                    <Link
                      href={`/trattative/${t.id}`}
                      className="flex items-center gap-3 rounded-2xl bg-panel p-4 active:opacity-80"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-[13px] font-bold text-ink-soft tabular-nums">
                        {i + 1}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-[15.5px] font-bold tracking-[-0.015em]">
                          {t.ragione_sociale}
                        </span>
                        <span className="truncate text-[13px] text-muted">
                          {t.fase_nome} · {euro(t.valore_stimato)}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${livello.classe}`}
                      >
                        {livello.etichetta}
                      </span>
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

          {scadenze.length === 0 ? (
            <p className="text-sm text-muted">
              Niente in scadenza oggi. Le prossime azioni compaiono qui appena le programmi da una
              trattativa.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {scadenze.slice(0, 6).map((s) => (
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
