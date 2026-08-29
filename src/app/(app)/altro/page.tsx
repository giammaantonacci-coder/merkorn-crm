import Link from "next/link";

import { Intestazione } from "@/components/nav/Intestazione";
import { Scheda, TitoloScheda } from "@/components/ui/Scheda";
import { Pulsante } from "@/components/ui/Pulsante";
import { esci } from "@/lib/azioni/autenticazione";
import { profiloCorrente } from "@/lib/dati";
import { iniziali } from "@/lib/formato";

export const metadata = { title: "Altro · CRM Merkorn" };

const VOCI = [
  { href: "/agenda", etichetta: "Agenda", nota: "Scadenze e prossime azioni" },
  { href: "/progetti", etichetta: "Progetti", nota: "Clienti già rilasciati e contratti" },
  { href: "/report", etichetta: "Report", nota: "Tempi per fase e tasso di successo" },
  { href: "/impostazioni", etichetta: "Impostazioni", nota: "Fasi, soglie e motivi di perdita" },
] as const;

export default async function PaginaAltro() {
  const profilo = await profiloCorrente();

  return (
    <>
      <Intestazione nome={profilo?.nome ?? "Merkorn"} />

      <div className="flex flex-col gap-3 px-4">
        <h1 className="titolo px-2 pb-1 text-[27px]">Altro</h1>

        <Scheda className="flex items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-viola text-sm font-bold text-white">
            {iniziali(profilo?.nome ?? "Merkorn")}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[15.5px] font-bold tracking-[-0.015em]">
              {profilo?.nome}
            </span>
            <span className="truncate text-[13px] text-muted">{profilo?.email}</span>
          </span>
        </Scheda>

        <Scheda className="py-2">
          <ul className="flex flex-col divide-y divide-line">
            {VOCI.map((v) => (
              <li key={v.href}>
                <Link href={v.href} className="flex items-center gap-3 py-3.5 active:opacity-70">
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[15.5px] font-bold tracking-[-0.015em]">
                      {v.etichetta}
                    </span>
                    <span className="truncate text-[13px] text-muted">{v.nota}</span>
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="size-[19px] shrink-0 text-line"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </Scheda>

        <Scheda>
          <TitoloScheda className="mb-3.5">Sessione</TitoloScheda>
          <form action={esci}>
            <Pulsante type="submit" variante="secondario" className="w-full">
              Esci
            </Pulsante>
          </form>
        </Scheda>
      </div>
    </>
  );
}
