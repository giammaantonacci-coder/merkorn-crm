"use client";

import Link from "next/link";
import { useActionState, useOptimistic, useRef, useState } from "react";

import { creaNota, type StatoModulo } from "@/lib/azioni/note";
import { Errore } from "@/components/ui/Errore";
import { Pulsante } from "@/components/ui/Pulsante";
import { Scheda, TitoloScheda } from "@/components/ui/Scheda";
import { EditorNota } from "@/components/note/EditorNota";
import { TestoConMenzioni } from "@/components/note/TestoConMenzioni";
import { personeMenzionate, type Persona } from "@/lib/menzioni";
import type { NotaConAutore } from "@/lib/dati";

/**
 * Anteprima delle note nella Home con composer al volo: il «+» apre un campo
 * per scrivere subito una nota condivisa, dove si può taggare un collega con
 * «@Nome». La nota compare in cima all'istante col nome di chi la scrive.
 */
export function NoteInComune({
  note,
  autore,
  persone,
}: {
  note: NotaConAutore[];
  autore: string;
  persone: Persona[];
}) {
  const [aperto, setAperto] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [ottimiste, aggiungiOttimista] = useOptimistic(
    note,
    (stato: NotaConAutore[], testo: string) => {
      const adesso = new Date().toISOString();
      const bozza: NotaConAutore = {
        id: `bozza-${adesso}`,
        testo,
        autore_id: null,
        completata: false,
        completata_il: null,
        creata_il: adesso,
        aggiornata_il: adesso,
        autore: { nome: autore },
        menzioni: personeMenzionate(testo, persone),
      };
      return [bozza, ...stato];
    },
  );

  const [stato, azione, inCorso] = useActionState<StatoModulo, FormData>(async (prec, modulo) => {
    const testo = String(modulo.get("testo") ?? "").trim();
    if (!testo) return { errore: "Scrivi la nota prima di aggiungerla." };

    aggiungiOttimista(testo);
    const esito = await creaNota(prec, modulo);
    if (!esito.errore) {
      formRef.current?.reset();
      setAperto(false);
    }
    return esito;
  }, {});

  return (
    <Scheda>
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <TitoloScheda>Note in comune</TitoloScheda>
        <button
          type="button"
          onClick={() => setAperto((v) => !v)}
          aria-expanded={aperto}
          aria-label={aperto ? "Chiudi" : "Nuova nota"}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-arancio text-white transition-opacity active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arancio-ink"
        >
          <svg
            viewBox="0 0 24 24"
            className={`size-5 transition-transform duration-200 ${aperto ? "rotate-45" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {aperto ? (
        <form ref={formRef} action={azione} className="mb-3.5 flex flex-col gap-2.5">
          <EditorNota
            name="testo"
            etichetta="Nuova nota"
            persone={persone}
            placeholder="Controllare la fabbrica con @Nome…"
            autoFocus
          />
          <Errore messaggio={stato.errore} />
          <div className="flex gap-2.5">
            <Pulsante type="submit" className="h-11 flex-1 px-4 text-sm" disabled={inCorso}>
              {inCorso ? "Un attimo…" : "Aggiungi"}
            </Pulsante>
            <Pulsante
              type="button"
              variante="secondario"
              className="h-11 flex-1 px-4 text-sm"
              onClick={() => setAperto(false)}
            >
              Annulla
            </Pulsante>
          </div>
        </form>
      ) : null}

      {ottimiste.length === 0 ? (
        <p className="text-sm text-muted">
          Nessuna nota aperta. Usa il «+» per un promemoria di squadra.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {ottimiste.slice(0, 4).map((n) => (
            <li key={n.id} className="flex items-start gap-3 rounded-2xl bg-panel p-4">
              <span aria-hidden className="mt-1 size-2.5 shrink-0 rounded-full bg-arancio" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <TestoConMenzioni
                  testo={n.testo}
                  nomi={n.menzioni.map((m) => m.nome)}
                  ioNome={autore}
                  className="text-[15px] font-semibold leading-snug"
                />
                <span className="text-[12.5px] text-muted">{n.autore?.nome ?? "—"}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3.5 flex justify-end">
        <Link href="/note" className="text-[13px] font-bold text-arancio-deep">
          Apri la bacheca
        </Link>
      </div>
    </Scheda>
  );
}
