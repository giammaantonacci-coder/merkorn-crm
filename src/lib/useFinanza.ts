"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  STATO_INIZIALE,
  nuovaTransazione,
  nuovoConto,
  nuovoObiettivo,
  type Categoria,
  type Conto,
  type Obiettivo,
  type Stato,
  type TipoTx,
  type Transazione,
} from "@/lib/finanza";

const CHIAVE = "finanza:v2";

/**
 * Stato dell'app tenuto sul dispositivo. Parte dai dati d'esempio (uguali sul
 * server e al primo render, così niente disallineamenti di idratazione), poi
 * carica da localStorage e da lì in avanti salva a ogni modifica.
 */
export function useFinanza() {
  const [stato, setStato] = useState<Stato>(STATO_INIZIALE);
  const [pronto, setPronto] = useState(false);
  const caricato = useRef(false);

  useEffect(() => {
    try {
      const grezzo = localStorage.getItem(CHIAVE);
      if (grezzo) {
        const salvato = JSON.parse(grezzo) as Partial<Stato>;
        setStato({
          nome: salvato.nome ?? STATO_INIZIALE.nome,
          budget: salvato.budget ?? STATO_INIZIALE.budget,
          tx: salvato.tx ?? STATO_INIZIALE.tx,
          obiettivi: salvato.obiettivi ?? STATO_INIZIALE.obiettivi,
          conti: salvato.conti ?? STATO_INIZIALE.conti,
        });
      }
    } catch {
      // spazio non accessibile (finestra privata, storage bloccato): si resta ai dati d'esempio
    }
    caricato.current = true;
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!caricato.current) return;
    try {
      localStorage.setItem(CHIAVE, JSON.stringify(stato));
    } catch {
      // salvataggio non disponibile: l'app resta comunque usabile in sessione
    }
  }, [stato]);

  const impostaNome = useCallback((nome: string) => {
    const pulito = nome.trim() || "Io";
    setStato((s) => ({ ...s, nome: pulito }));
  }, []);

  const impostaBudget = useCallback((budget: number) => {
    setStato((s) => ({ ...s, budget: Math.max(0, budget) }));
  }, []);

  const aggiungiTx = useCallback(
    (dati: { nome: string; cat: Categoria; tipo: TipoTx; importo: number }) => {
      const t = nuovaTransazione(dati);
      setStato((s) => ({ ...s, tx: [t, ...s.tx] }));
    },
    [],
  );

  const eliminaTx = useCallback((id: string) => {
    setStato((s) => ({ ...s, tx: s.tx.filter((t) => t.id !== id) }));
  }, []);

  const aggiungiObiettivo = useCallback(
    (dati: { nome: string; target: number; salvato: number; colore: string }) => {
      const o = nuovoObiettivo(dati);
      setStato((s) => ({ ...s, obiettivi: [...s.obiettivi, o] }));
    },
    [],
  );

  const eliminaObiettivo = useCallback((id: string) => {
    setStato((s) => ({ ...s, obiettivi: s.obiettivi.filter((o) => o.id !== id) }));
  }, []);

  const aggiungiConto = useCallback((dati: { nome: string; sotto: string; saldo: number }) => {
    const c = nuovoConto(dati);
    setStato((s) => ({ ...s, conti: [...s.conti, c] }));
  }, []);

  const eliminaConto = useCallback((id: string) => {
    setStato((s) => ({ ...s, conti: s.conti.filter((c) => c.id !== id) }));
  }, []);

  return {
    stato,
    pronto,
    impostaNome,
    impostaBudget,
    aggiungiTx,
    eliminaTx,
    aggiungiObiettivo,
    eliminaObiettivo,
    aggiungiConto,
    eliminaConto,
  };
}

export type { Transazione, Obiettivo, Conto };
