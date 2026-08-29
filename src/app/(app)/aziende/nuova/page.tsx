import { IntestazioneIndietro } from "@/components/nav/Intestazione";
import { ModuloAzienda } from "@/components/aziende/ModuloAzienda";
import { settori } from "@/lib/dati";

export const metadata = { title: "Nuova azienda · CRM Merkorn" };

export default async function PaginaNuovaAzienda() {
  const elencoSettori = await settori();

  return (
    <>
      <IntestazioneIndietro titolo="Aziende" href="/aziende" />

      <div className="px-4">
        <div className="px-2 pb-4">
          <h1 className="titolo text-[27px]">Nuova azienda</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Bastano nome e settore. Il resto si aggiunge quando serve.
          </p>
        </div>

        <ModuloAzienda settori={elencoSettori} />
      </div>
    </>
  );
}
