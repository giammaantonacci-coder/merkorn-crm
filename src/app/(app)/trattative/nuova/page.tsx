import { IntestazioneIndietro } from "@/components/nav/Intestazione";
import { ModuloTrattativa } from "@/components/trattative/ModuloTrattativa";
import { PulsanteLink } from "@/components/ui/Pulsante";
import { Scheda } from "@/components/ui/Scheda";
import { Vuoto } from "@/components/ui/Vuoto";
import { elencoAziendeSemplice, servizi } from "@/lib/dati";

export const metadata = { title: "Nuova trattativa · CRM Merkorn" };

export default async function PaginaNuovaTrattativa({
  searchParams,
}: {
  searchParams: Promise<{ azienda?: string }>;
}) {
  const [{ azienda }, elenco, listaServizi] = await Promise.all([
    searchParams,
    elencoAziendeSemplice(),
    servizi(),
  ]);

  return (
    <>
      <IntestazioneIndietro titolo="Pipeline" href="/pipeline" />

      <div className="px-4">
        <div className="pb-4">
          <h1 className="titolo text-[27px]">Nuova trattativa</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Nasce in «Primo contatto»: da qui parte il conteggio dell&apos;intero ciclo.
          </p>
        </div>

        {elenco.length === 0 ? (
          <Scheda className="px-0 py-0">
            <Vuoto
              titolo="Prima serve un'azienda"
              testo="Ogni trattativa si aggancia a un'azienda in anagrafica. Inseriscine una e torna qui."
              azione={<PulsanteLink href="/aziende/nuova">Aggiungi un&apos;azienda</PulsanteLink>}
            />
          </Scheda>
        ) : (
          <ModuloTrattativa aziende={elenco} servizi={listaServizi} aziendaPredefinita={azienda} />
        )}
      </div>
    </>
  );
}
