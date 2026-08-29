"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { creaAzienda, type StatoModulo } from "@/lib/azioni/aziende";
import { AreaTesto, Campo, Elenco, ScelteRapide } from "@/components/ui/Campo";
import { Errore } from "@/components/ui/Errore";
import { Pulsante } from "@/components/ui/Pulsante";
import { Scheda, SottoTitolo, TitoloScheda } from "@/components/ui/Scheda";
import type { Settore } from "@/lib/database.types";

const FONTI = [
  { valore: "passaparola", etichetta: "Passaparola" },
  { valore: "fiera", etichetta: "Fiera" },
  { valore: "sito_web", etichetta: "Sito web" },
  { valore: "contatto_diretto", etichetta: "Contatto diretto" },
  { valore: "campagna", etichetta: "Campagna" },
];

function Salva({
  etichetta,
  valore,
  variante,
}: {
  etichetta: string;
  valore: string;
  variante?: "principale" | "secondario";
}) {
  const { pending } = useFormStatus();
  return (
    <Pulsante
      type="submit"
      name="apri_trattativa"
      value={valore}
      variante={variante}
      className="w-full"
      disabled={pending}
    >
      {pending ? "Un attimo…" : etichetta}
    </Pulsante>
  );
}

export function ModuloAzienda({ settori }: { settori: Settore[] }) {
  const [stato, azione] = useActionState<StatoModulo, FormData>(creaAzienda, {});

  return (
    <form action={azione} className="flex flex-col gap-3">
      <Scheda className="flex flex-col gap-3">
        <Campo
          etichetta="Ragione sociale"
          name="ragione_sociale"
          required
          autoFocus
          placeholder="Trasporti Bevi S.r.l."
        />
        <Campo etichetta="Partita IVA" name="partita_iva" inputMode="numeric" placeholder="11 cifre" />
        <Elenco etichetta="Settore" name="settore_id" defaultValue="">
          <option value="">Non ancora deciso</option>
          {settori.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </Elenco>
      </Scheda>

      <Scheda>
        <TitoloScheda>Come è arrivata</TitoloScheda>
        <SottoTitolo className="mb-3.5 mt-1">
          Serve a capire quale canale porta i clienti migliori
        </SottoTitolo>
        <ScelteRapide nome="fonte" opzioni={FONTI} predefinito="passaparola" />
      </Scheda>

      <Scheda className="flex flex-col gap-3">
        <Campo etichetta="Telefono" name="telefono" type="tel" inputMode="tel" />
        <Campo etichetta="Email" name="email" type="email" inputMode="email" />
        <Campo etichetta="Città" name="citta" />
        <AreaTesto etichetta="Note" name="note" placeholder="Come è nato il contatto…" />
      </Scheda>

      <Errore messaggio={stato.errore} />

      <div className="flex flex-col gap-2.5">
        <Salva etichetta="Salva e apri una trattativa" valore="si" />
        <Salva etichetta="Salva soltanto l&apos;azienda" valore="no" variante="secondario" />
      </div>
    </form>
  );
}
