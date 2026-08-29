"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registraAttivita, type StatoModulo } from "@/lib/azioni/trattative";
import { AreaTesto, Campo, ScelteRapide } from "@/components/ui/Campo";
import { Errore } from "@/components/ui/Errore";
import { Pulsante } from "@/components/ui/Pulsante";
import { Scheda, TitoloScheda } from "@/components/ui/Scheda";

const TIPI = [
  { valore: "chiamata", etichetta: "Chiamata" },
  { valore: "email", etichetta: "Email" },
  { valore: "incontro", etichetta: "Incontro" },
  { valore: "demo", etichetta: "Demo" },
  { valore: "nota", etichetta: "Nota" },
];

function Salva() {
  const { pending } = useFormStatus();
  return (
    <Pulsante type="submit" className="w-full" disabled={pending}>
      {pending ? "Un attimo…" : "Registra"}
    </Pulsante>
  );
}

export function ModuloAttivita({ trattativaId }: { trattativaId: string }) {
  const [stato, azione] = useActionState<StatoModulo, FormData>(registraAttivita, {});

  return (
    <form action={azione} className="flex flex-col gap-3">
      <input type="hidden" name="trattativa_id" value={trattativaId} />

      <Scheda>
        <TitoloScheda className="mb-3.5">Tipo</TitoloScheda>
        <ScelteRapide nome="tipo" opzioni={TIPI} predefinito="chiamata" />
      </Scheda>

      <Scheda className="flex flex-col gap-3">
        <Campo
          etichetta="In sintesi"
          name="oggetto"
          required
          placeholder="Chiamata con Laura Bianchi"
        />
        <AreaTesto
          etichetta="Cosa è stato detto"
          name="resoconto"
          placeholder="Ha confermato il budget ma vuole capire i tempi di integrazione…"
        />
      </Scheda>

      <Errore messaggio={stato.errore} />
      <Salva />
    </form>
  );
}
