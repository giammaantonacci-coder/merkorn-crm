import type { ReactNode } from "react";

import { SEMAFORO } from "@/lib/formato";
import type { Semaforo } from "@/lib/database.types";

export function Pastiglia({
  children,
  tono = "neutro",
}: {
  children: ReactNode;
  tono?: Semaforo;
}) {
  const s = SEMAFORO[tono];
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${s.fondo} ${s.testo}`}
    >
      {children}
    </span>
  );
}

export function Punto({ tono = "neutro" }: { tono?: Semaforo }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-2.5 shrink-0 rounded-full ${SEMAFORO[tono].punto}`}
    />
  );
}
