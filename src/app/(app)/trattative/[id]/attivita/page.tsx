import { notFound } from "next/navigation";

import { IntestazioneIndietro } from "@/components/nav/Intestazione";
import { ModuloAttivita } from "@/components/trattative/ModuloAttivita";
import { trattativa } from "@/lib/dati";

export const metadata = { title: "Registra attività · CRM Merkorn" };

export default async function PaginaAttivita({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dati = await trattativa(id);
  if (!dati) notFound();

  return (
    <>
      <IntestazioneIndietro
        titolo={dati.dettaglio.aziende?.ragione_sociale ?? "Trattativa"}
        href={`/trattative/${id}`}
      />
      <div className="px-4">
        <div className="px-2 pb-4">
          <h1 className="titolo text-[25px]">Cosa è successo?</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Resta nella storia dell&apos;azienda e aggiorna la data di ultimo contatto.
          </p>
        </div>
        <ModuloAttivita trattativaId={id} />
      </div>
    </>
  );
}
