import type { ReactNode } from "react";

import { Logo } from "@/components/ui/Logo";

/**
 * Il CRM parte senza dati: lo stato a vuoto è la prima schermata che
 * il commerciale incontra davvero, non un ripiego.
 */
export function Vuoto({
  titolo,
  testo,
  azione,
}: {
  titolo: string;
  testo: string;
  azione?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <Logo className="mb-5 w-14 text-line" />
      <h3 className="titolo text-lg text-ink">{titolo}</h3>
      <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-muted">{testo}</p>
      {azione ? <div className="mt-5 flex flex-wrap justify-center gap-2.5">{azione}</div> : null}
    </div>
  );
}
