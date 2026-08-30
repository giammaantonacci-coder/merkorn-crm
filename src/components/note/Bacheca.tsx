"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  completaNota,
  creaNota,
  eliminaNota,
  modificaNota,
  type StatoModulo,
} from "@/lib/azioni/note";
import { AreaTesto } from "@/components/ui/Campo";
import { Errore } from "@/components/ui/Errore";
import { Pulsante } from "@/components/ui/Pulsante";
import { Scheda, TitoloScheda } from "@/components/ui/Scheda";
import { Vuoto } from "@/components/ui/Vuoto";
import { dataBreve } from "@/lib/formato";
import type { NotaConAutore } from "@/lib/dati";

function BottoneAggiungi() {
  const { pending } = useFormStatus();
  return (
    <Pulsante type="submit" className="w-full" disabled={pending}>
      {pending ? "Un attimo…" : "Aggiungi alla bacheca"}
    </Pulsante>
  );
}

export function Bacheca({ note }: { note: NotaConAutore[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [statoAggiungi, azioneAggiungi] = useActionState<StatoModulo, FormData>(
    async (prec, modulo) => {
      const esito = await creaNota(prec, modulo);
      if (!esito.errore) formRef.current?.reset();
      return esito;
    },
    {},
  );

  // Rimozione e completamento aggiornano subito la lista, senza attendere il server.
  const [ottimiste, applica] = useOptimistic(
    note,
    (
      stato: NotaConAutore[],
      azione: { tipo: "completa"; id: string; valore: boolean } | { tipo: "elimina"; id: string },
    ) => {
      if (azione.tipo === "elimina") return stato.filter((n) => n.id !== azione.id);
      return stato.map((n) => (n.id === azione.id ? { ...n, completata: azione.valore } : n));
    },
  );

  const [, transizione] = useTransition();

  function segna(id: string, completata: boolean) {
    transizione(async () => {
      applica({ tipo: "completa", id, valore: completata });
      await completaNota(id, completata);
    });
  }

  function rimuovi(id: string) {
    transizione(async () => {
      applica({ tipo: "elimina", id });
      await eliminaNota(id);
    });
  }

  const aperte = ottimiste.filter((n) => !n.completata);
  const fatte = ottimiste.filter((n) => n.completata);

  return (
    <div className="flex flex-col gap-3">
      <Scheda>
        <form ref={formRef} action={azioneAggiungi} className="flex flex-col gap-3">
          <AreaTesto
            etichetta="Nuova nota"
            name="testo"
            required
            placeholder="Controllare scadenza fabbrica auto…"
          />
          <Errore messaggio={statoAggiungi.errore} />
          <BottoneAggiungi />
        </form>
      </Scheda>

      {ottimiste.length === 0 ? (
        <Scheda className="px-0 py-0">
          <Vuoto
            titolo="La bacheca è vuota"
            testo="Scrivi la prima nota qui sopra: la vedono tutti, con il nome di chi l'ha scritta."
          />
        </Scheda>
      ) : (
        <>
          {aperte.length > 0 ? (
            <Scheda>
              <TitoloScheda className="mb-3.5">Da fare</TitoloScheda>
              <ul className="flex flex-col gap-2.5">
                {aperte.map((n) => (
                  <Riga key={n.id} nota={n} onSegna={segna} onRimuovi={rimuovi} />
                ))}
              </ul>
            </Scheda>
          ) : null}

          {fatte.length > 0 ? (
            <Scheda>
              <TitoloScheda className="mb-3.5">Completate</TitoloScheda>
              <ul className="flex flex-col gap-2.5">
                {fatte.map((n) => (
                  <Riga key={n.id} nota={n} onSegna={segna} onRimuovi={rimuovi} />
                ))}
              </ul>
            </Scheda>
          ) : null}
        </>
      )}
    </div>
  );
}

function Riga({
  nota,
  onSegna,
  onRimuovi,
}: {
  nota: NotaConAutore;
  onSegna: (id: string, completata: boolean) => void;
  onRimuovi: (id: string) => void;
}) {
  const [inModifica, setInModifica] = useState(false);
  const [statoModifica, azioneModifica] = useActionState<StatoModulo, FormData>(
    async (prec, modulo) => {
      const esito = await modificaNota(prec, modulo);
      if (!esito.errore) setInModifica(false);
      return esito;
    },
    {},
  );

  if (inModifica) {
    return (
      <li>
        <form action={azioneModifica} className="flex flex-col gap-2.5 rounded-2xl bg-panel p-4">
          <input type="hidden" name="id" value={nota.id} />
          <AreaTesto etichetta="Modifica nota" name="testo" defaultValue={nota.testo} required />
          <Errore messaggio={statoModifica.errore} />
          <div className="flex gap-2.5">
            <Pulsante type="submit" className="h-11 flex-1 px-4 text-sm">
              Salva
            </Pulsante>
            <Pulsante
              type="button"
              variante="secondario"
              className="h-11 flex-1 px-4 text-sm"
              onClick={() => setInModifica(false)}
            >
              Annulla
            </Pulsante>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 rounded-2xl bg-panel p-4">
      <button
        type="button"
        role="checkbox"
        aria-checked={nota.completata}
        aria-label={nota.completata ? "Riapri" : "Segna completata"}
        onClick={() => onSegna(nota.id, !nota.completata)}
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
          nota.completata ? "border-arancio bg-arancio text-white" : "border-line-2 bg-surface"
        }`}
      >
        {nota.completata ? (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7" />
          </svg>
        ) : null}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p
          className={`text-[15px] leading-snug ${
            nota.completata ? "text-muted line-through" : "font-semibold text-ink"
          }`}
        >
          {nota.testo}
        </p>
        <div className="flex items-center gap-2 text-[12.5px] text-muted">
          <span className="font-semibold">{nota.autore?.nome ?? "—"}</span>
          <span aria-hidden>·</span>
          <span>{dataBreve(nota.creata_il)}</span>
        </div>
        <div className="mt-1 flex gap-4">
          <button
            type="button"
            onClick={() => setInModifica(true)}
            className="text-[13px] font-bold text-arancio-deep"
          >
            Modifica
          </button>
          <button
            type="button"
            onClick={() => onRimuovi(nota.id)}
            className="text-[13px] font-bold text-bad"
          >
            Elimina
          </button>
        </div>
      </div>
    </li>
  );
}
