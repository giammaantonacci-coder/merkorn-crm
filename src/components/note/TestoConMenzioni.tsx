import { segmentaMenzioni } from "@/lib/menzioni";

/**
 * Mostra il testo di una nota trasformando «@Nome» in chip arancioni. Se una
 * menzione riguarda chi sta guardando (ioNome), la chip è piena: si nota subito.
 */
export function TestoConMenzioni({
  testo,
  nomi,
  ioNome,
  className = "",
}: {
  testo: string;
  nomi: string[];
  ioNome?: string | null;
  className?: string;
}) {
  const segmenti = segmentaMenzioni(testo, nomi);
  return (
    <span className={className}>
      {segmenti.map((s, i) =>
        s.menzione ? (
          <span
            key={i}
            className={`rounded-md px-1 py-0.5 font-bold ${
              ioNome && s.menzione === ioNome
                ? "bg-arancio text-white"
                : "bg-arancio-wash text-arancio-deep"
            }`}
          >
            {s.testo}
          </span>
        ) : (
          <span key={i}>{s.testo}</span>
        ),
      )}
    </span>
  );
}
