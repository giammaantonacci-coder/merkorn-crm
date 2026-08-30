import { IntestazioneIndietro } from "@/components/nav/Intestazione";
import { Bacheca } from "@/components/note/Bacheca";
import { noteCondivise, personeTaggabili, profiloCorrente } from "@/lib/dati";

export const metadata = { title: "Note in comune · Merkorn CRM" };

export default async function PaginaNote() {
  const [note, persone, profilo] = await Promise.all([
    noteCondivise(),
    personeTaggabili(),
    profiloCorrente(),
  ]);

  return (
    <>
      <IntestazioneIndietro titolo="Note in comune" href="/" />

      <div className="px-4">
        <div className="pb-4">
          <h1 className="titolo text-[27px]">Note in comune</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Una bacheca per tutti: ogni nota resta con il nome di chi l&apos;ha scritta.
          </p>
        </div>

        <Bacheca
          note={note}
          persone={persone}
          ioId={profilo?.id ?? null}
          ioNome={profilo?.nome ?? null}
        />
      </div>
    </>
  );
}
