"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { spostaDiFase, type StatoModulo } from "@/lib/azioni/trattative";
import { AreaTesto, Campo, Elenco } from "@/components/ui/Campo";
import { Errore } from "@/components/ui/Errore";
import { Pulsante } from "@/components/ui/Pulsante";
import { Scheda } from "@/components/ui/Scheda";
import type { Fase, MotivoPerdita } from "@/lib/database.types";

function Conferma({ etichetta }: { etichetta: string }) {
  const { pending } = useFormStatus();
  return (
    <Pulsante type="submit" variante="scuro" className="w-full" disabled={pending}>
      {pending ? "Un attimo…" : etichetta}
    </Pulsante>
  );
}

export function ModuloFase({
  trattativaId,
  successiva,
  vinta,
  persa,
  nonQualificata,
  motivi,
  valoreStimato,
}: {
  trattativaId: string;
  successiva: Fase | null;
  vinta: Fase | null;
  persa: Fase | null;
  nonQualificata: Fase | null;
  motivi: MotivoPerdita[];
  valoreStimato: number | null;
}) {
  const [stato, azione] = useActionState<StatoModulo, FormData>(spostaDiFase, {});
  const [scelta, setScelta] = useState<Fase | null>(successiva ?? vinta ?? null);

  const scelte = [successiva, vinta, persa, nonQualificata].filter(Boolean) as Fase[];

  function classiScelta(fase: Fase) {
    const attiva = scelta?.id === fase.id;
    if (fase.is_persa) {
      return attiva ? "bg-bad text-white" : "bg-bad-wash text-bad";
    }
    if (fase.is_vinta) {
      return attiva ? "bg-ok text-white" : "bg-ok-wash text-ok";
    }
    if (fase.ambito === "uscita") {
      return attiva ? "bg-ink text-white" : "bg-panel text-ink-soft";
    }
    return attiva ? "bg-viola text-white" : "bg-panel text-ink";
  }

  return (
    <form action={azione} className="flex flex-col gap-3">
      <input type="hidden" name="trattativa_id" value={trattativaId} />
      <input type="hidden" name="fase_id" value={scelta?.id ?? ""} />

      <Scheda>
        <fieldset>
          <legend className="mb-3.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
            Scegli dove spostarla
          </legend>

          <div className="flex flex-col gap-2.5">
            {scelte.map((fase) => (
              <button
                key={fase.id}
                type="button"
                onClick={() => setScelta(fase)}
                aria-pressed={scelta?.id === fase.id}
                className={`flex min-h-[56px] items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left transition-colors ${classiScelta(fase)}`}
              >
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[16px] font-bold tracking-[-0.02em]">{fase.nome}</span>
                  <span className="text-[13px] opacity-80">
                    {fase.is_persa
                      ? "Chiederà il motivo"
                      : fase.is_vinta
                        ? "Nascerà il progetto collegato"
                        : fase.ambito === "uscita"
                          ? "Esce senza contare fra le perse"
                          : fase.soglia_giorni
                            ? `Soglia ${fase.soglia_giorni} giorni`
                            : "Senza soglia"}
                  </span>
                </span>
                {scelta?.id === fase.id ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-[22px] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="m5 12.5 4.5 4.5L19 7" />
                  </svg>
                ) : null}
              </button>
            ))}
          </div>
        </fieldset>
      </Scheda>

      {scelta?.is_persa ? (
        <Scheda className="flex flex-col gap-3">
          <Elenco etichetta="Motivo della perdita" name="motivo_perdita_id" required>
            <option value="">Scegli un motivo…</option>
            {motivi.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </Elenco>
          <p className="px-1 text-xs text-muted">
            È obbligatorio: senza motivo le statistiche sulle sconfitte non dicono nulla.
          </p>
        </Scheda>
      ) : null}

      {scelta?.is_vinta ? (
        <Scheda>
          <Campo
            etichetta="Valore finale"
            name="valore_finale"
            inputMode="decimal"
            defaultValue={valoreStimato ?? ""}
            nota="Quello effettivamente firmato, se diverso dalla stima."
          />
        </Scheda>
      ) : null}

      <Scheda>
        <AreaTesto
          etichetta="Nota sul passaggio — facoltativa"
          name="nota"
          placeholder="Ha chiesto una revisione del canone…"
        />
      </Scheda>

      <Errore messaggio={stato.errore} />

      <Conferma etichetta={scelta ? `Sposta in ${scelta.nome}` : "Scegli una fase"} />
    </form>
  );
}
