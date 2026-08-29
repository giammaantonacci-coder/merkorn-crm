import { notFound } from "next/navigation";

import { IntestazioneIndietro } from "@/components/nav/Intestazione";
import { ModuloFase } from "@/components/trattative/ModuloFase";
import { fasi, motiviPerdita, trattativa } from "@/lib/dati";

export const metadata = { title: "Avanza di fase · CRM Merkorn" };

export default async function PaginaAvanzaFase({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [dati, elencoFasi, motivi] = await Promise.all([trattativa(id), fasi(), motiviPerdita()]);
  if (!dati) notFound();

  const { dettaglio, stato } = dati;
  const ordineCorrente = elencoFasi.find((f) => f.id === stato.fase_id)?.ordine ?? 0;

  const successiva =
    elencoFasi.find((f) => f.ambito !== "uscita" && f.ordine > ordineCorrente) ?? null;
  const vinta = elencoFasi.find((f) => f.is_vinta) ?? null;
  const persa = elencoFasi.find((f) => f.is_persa) ?? null;
  const nonQualificata =
    elencoFasi.find((f) => f.ambito === "uscita" && !f.is_persa) ?? null;

  return (
    <>
      <IntestazioneIndietro titolo={dettaglio.aziende?.ragione_sociale ?? "Trattativa"} href={`/trattative/${id}`} />

      <div className="px-4">
        <div className="px-2 pb-4">
          <h1 className="titolo text-[25px]">Dove va adesso?</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            I {stato.giorni_in_fase} giorni passati in «{stato.fase_nome}» restano registrati.
          </p>
        </div>

        <ModuloFase
          trattativaId={id}
          successiva={successiva}
          vinta={successiva?.is_vinta ? null : vinta}
          persa={persa}
          nonQualificata={nonQualificata}
          motivi={motivi}
          valoreStimato={dettaglio.valore_stimato}
        />
      </div>
    </>
  );
}
