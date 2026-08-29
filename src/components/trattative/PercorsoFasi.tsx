import type { StoricoFase, TrattativaStato } from "@/lib/database.types";
import { giorniBrevi } from "@/lib/formato";

type Riga = { nome: string; giorni: number; oltre: boolean; corrente: boolean };

/**
 * Le fasi già attraversate, con la barra proporzionale ai giorni davvero
 * trascorsi: la durata si legge dalla forma prima che dal numero.
 */
export function PercorsoFasi({
  storico,
  corrente,
}: {
  storico: (StoricoFase & { partenza: { nome: string } | null; arrivo: { nome: string } | null })[];
  corrente: TrattativaStato;
}) {
  const concluse: Riga[] = storico
    .filter((s) => s.partenza !== null && s.giorni_fase_precedente !== null)
    .map((s) => ({
      nome: s.partenza!.nome,
      giorni: Number(s.giorni_fase_precedente),
      // La soglia della fase lasciata non è nella riga di storico: si segna
      // in rosso solo la fase corrente, dove la soglia la conosciamo.
      oltre: false,
      corrente: false,
    }))
    .reverse();

  const righe: Riga[] = [
    ...concluse,
    {
      nome: corrente.fase_nome,
      giorni: corrente.giorni_in_fase,
      oltre: corrente.semaforo === "oltre",
      corrente: true,
    },
  ];

  const massimo = Math.max(...righe.map((r) => r.giorni), 1);

  return (
    <ul className="mt-4 flex flex-col gap-3.5">
      {righe.map((riga, indice) => {
        const larghezza = Math.max(4, Math.round((riga.giorni / massimo) * 100));
        const colore = riga.oltre ? "bg-bad-dot" : riga.corrente ? "bg-warn-dot" : "bg-ok-dot";
        const testo = riga.oltre ? "text-bad" : riga.corrente ? "text-warn" : "text-ok";

        return (
          <li key={`${riga.nome}-${indice}`} className="flex items-center gap-3">
            <span
              className={`w-[112px] shrink-0 truncate text-[13.5px] ${
                riga.corrente ? "font-bold text-ink" : "text-ink"
              }`}
            >
              {riga.nome}
            </span>
            <span className="flex min-w-0 flex-1 items-center">
              <span
                className={`h-2.5 rounded-full ${colore}`}
                style={{ width: `${larghezza}%` }}
                aria-hidden
              />
            </span>
            <span className={`shrink-0 text-[13px] font-bold ${testo}`}>
              {giorniBrevi(riga.giorni)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
