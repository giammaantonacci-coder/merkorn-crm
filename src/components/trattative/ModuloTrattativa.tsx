"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { creaTrattativa, type StatoModulo } from "@/lib/azioni/trattative";
import { AreaTesto, Campo, Elenco } from "@/components/ui/Campo";
import { Errore } from "@/components/ui/Errore";
import { Pulsante } from "@/components/ui/Pulsante";
import { Scheda } from "@/components/ui/Scheda";
import type { Azienda, Servizio } from "@/lib/database.types";

function Apri() {
  const { pending } = useFormStatus();
  return (
    <Pulsante type="submit" className="w-full" disabled={pending}>
      {pending ? "Un attimo…" : "Apri la trattativa"}
    </Pulsante>
  );
}

export function ModuloTrattativa({
  aziende,
  servizi,
  aziendaPredefinita,
}: {
  aziende: Pick<Azienda, "id" | "ragione_sociale">[];
  servizi: Servizio[];
  aziendaPredefinita?: string;
}) {
  const [stato, azione] = useActionState<StatoModulo, FormData>(creaTrattativa, {});

  return (
    <form action={azione} className="flex flex-col gap-3">
      <Scheda className="flex flex-col gap-3">
        <Elenco
          etichetta="Azienda"
          name="azienda_id"
          required
          defaultValue={aziendaPredefinita ?? ""}
        >
          <option value="">Scegli…</option>
          {aziende.map((a) => (
            <option key={a.id} value={a.id}>
              {a.ragione_sociale}
            </option>
          ))}
        </Elenco>

        <Campo
          etichetta="Titolo"
          name="titolo"
          required
          placeholder="Portale tracking spedizioni"
        />

        <Elenco etichetta="Servizio" name="servizio_id" defaultValue="">
          <option value="">Non ancora deciso</option>
          {servizi.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </Elenco>

        <Campo
          etichetta="Valore stimato"
          name="valore_stimato"
          inputMode="decimal"
          placeholder="24000"
          nota="Anche una stima larga: serve a pesare la pipeline."
        />

        <AreaTesto
          etichetta="Di cosa si tratta"
          name="descrizione"
          placeholder="Gestionale per il magazzino, integrato con il gestionale esistente…"
        />
      </Scheda>

      <Errore messaggio={stato.errore} />
      <Apri />
    </form>
  );
}
