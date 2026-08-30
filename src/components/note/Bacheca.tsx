"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  completaNota,
  creaNota,
  eliminaNota,
  modificaNota,
  type StatoModulo,
} from "@/lib/azioni/note";
import { Errore } from "@/components/ui/Errore";
import { Pulsante } from "@/components/ui/Pulsante";
import { Scheda, TitoloScheda } from "@/components/ui/Scheda";
import { Vuoto } from "@/components/ui/Vuoto";
import { EditorNota } from "@/components/note/EditorNota";
import { TestoConMenzioni } from "@/components/note/TestoConMenzioni";
import { dataBreve } from "@/lib/formato";
import type { Persona } from "@/lib/menzioni";
import type { NotaConAutore } from "@/lib/dati";

function BottoneAggiungi() {
  const { pending } = useFormStatus();
  return (
    <Pulsante type="submit" className="w-full" disabled={pending}>
      {pending ? "Un attimo…" : "Aggiungi alla bacheca"}
    </Pulsante>
  );
}

export function Bacheca({
  note,
  persone,
  ioId,
  ioNome,
}: {
  note: NotaConAutore[];
  persone: Persona[];
  ioId: string | null;
  ioNome: string | null;
}) {
  // Rimonta l'editor dopo un salvataggio riuscito, per svuotarlo.
  const [chiave, setChiave] = useState(0);
  const [statoAggiungi, azioneAggiungi] = useActionState<StatoModulo, FormData>(
    async (prec, modulo) => {
      const esito = await creaNota(prec, modulo);
      if (!esito.errore) setChiave((k) => k + 1);
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
  const [soloMie, setSoloMie] = useState(false);

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

  const miRiguarda = (n: NotaConAutore) => !!ioId && n.menzioni.some((m) => m.id === ioId);
  const quanteMieTotali = ottimiste.filter(miRiguarda).length;
  const visibili = soloMie ? ottimiste.filter(miRiguarda) : ottimiste;
  const aperte = visibili.filter((n) => !n.completata);
  const fatte = visibili.filter((n) => n.completata);

  return (
    <div className="flex flex-col gap-3">
      <Scheda>
        <form action={azioneAggiungi} className="flex flex-col gap-3">
          <EditorNota
            key={chiave}
            name="testo"
            etichetta="Nuova nota"
            persone={persone}
            placeholder="Controllare la fabbrica con @Nome…"
          />
          <Errore messaggio={statoAggiungi.errore} />
          <BottoneAggiungi />
        </form>
      </Scheda>

      {ioId && quanteMieTotali > 0 ? (
        <div className="flex gap-2">
          <FiltroPill attivo={!soloMie} onClick={() => setSoloMie(false)}>
            Tutte
          </FiltroPill>
          <FiltroPill attivo={soloMie} onClick={() => setSoloMie(true)}>
            Mi riguardano · {quanteMieTotali}
          </FiltroPill>
        </div>
      ) : null}

      {ottimiste.length === 0 ? (
        <Scheda className="px-0 py-0">
          <Vuoto
            titolo="La bacheca è vuota"
            testo="Scrivi la prima nota qui sopra: la vedono tutti, con il nome di chi l'ha scritta. Tagga un collega con «@Nome»."
          />
        </Scheda>
      ) : visibili.length === 0 ? (
        <Scheda className="px-0 py-0">
          <Vuoto titolo="Nessuna nota ti riguarda" testo="Non ci sono note che ti menzionano." />
        </Scheda>
      ) : (
        <>
          {aperte.length > 0 ? (
            <Scheda>
              <TitoloScheda className="mb-3.5">Da fare</TitoloScheda>
              <ul className="flex flex-col gap-2.5">
                {aperte.map((n) => (
                  <Riga
                    key={n.id}
                    nota={n}
                    persone={persone}
                    ioNome={ioNome}
                    onSegna={segna}
                    onRimuovi={rimuovi}
                  />
                ))}
              </ul>
            </Scheda>
          ) : null}

          {fatte.length > 0 ? (
            <Scheda>
              <TitoloScheda className="mb-3.5">Completate</TitoloScheda>
              <ul className="flex flex-col gap-2.5">
                {fatte.map((n) => (
                  <Riga
                    key={n.id}
                    nota={n}
                    persone={persone}
                    ioNome={ioNome}
                    onSegna={segna}
                    onRimuovi={rimuovi}
                  />
                ))}
              </ul>
            </Scheda>
          ) : null}
        </>
      )}
    </div>
  );
}

function FiltroPill({
  attivo,
  onClick,
  children,
}: {
  attivo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={attivo}
      className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
        attivo ? "bg-arancio text-white" : "bg-panel text-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}

function Riga({
  nota,
  persone,
  ioNome,
  onSegna,
  onRimuovi,
}: {
  nota: NotaConAutore;
  persone: Persona[];
  ioNome: string | null;
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
          <EditorNota
            name="testo"
            etichetta="Modifica nota"
            persone={persone}
            defaultValue={nota.testo}
          />
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
        <TestoConMenzioni
          testo={nota.testo}
          nomi={nota.menzioni.map((m) => m.nome)}
          ioNome={ioNome}
          className={`text-[15px] leading-snug ${
            nota.completata ? "text-muted line-through" : "font-semibold text-ink"
          }`}
        />
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
