"use client";

import { useState } from "react";

import { Sheet, TestataSheet } from "@/components/finanza/sheet/Sheet";
import { leggiImporto } from "@/lib/finanza";

const bottone: React.CSSProperties = {
  marginTop: 20,
  width: "100%",
  background: "#6b72f0",
  color: "#fff",
  borderRadius: 14,
  padding: "16px 0",
  fontSize: 15,
  fontWeight: 700,
  border: 0,
  cursor: "pointer",
  fontFamily: "inherit",
};

export function SheetObiettivo({
  onClose,
  onSalva,
}: {
  onClose: () => void;
  onSalva: (dati: { nome: string; target: number; salvato: number }) => void;
}) {
  const [nome, setNome] = useState("");
  const [target, setTarget] = useState("");
  const [salvato, setSalvato] = useState("");

  const t = leggiImporto(target);
  const s = leggiImporto(salvato) || 0;
  const valido = nome.trim().length > 0 && t > 0;

  return (
    <Sheet onClose={onClose}>
      <TestataSheet titolo="Nuovo obiettivo" onClose={onClose} />

      <div style={{ marginTop: 16 }}>
        <div className="tag" style={{ marginBottom: 7 }}>
          Nome
        </div>
        <input className="finput" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Es. Vacanza estate" />
      </div>

      <div className="flex" style={{ gap: 10, marginTop: 14 }}>
        <div style={{ flex: 1 }}>
          <div className="tag" style={{ marginBottom: 7 }}>
            Obiettivo €
          </div>
          <input className="finput" value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" placeholder="2.000" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="tag" style={{ marginBottom: 7 }}>
            Già da parte €
          </div>
          <input className="finput" value={salvato} onChange={(e) => setSalvato(e.target.value)} inputMode="decimal" placeholder="0" />
        </div>
      </div>

      <button
        type="button"
        disabled={!valido}
        onClick={() => valido && onSalva({ nome: nome.trim(), target: t, salvato: Math.min(s, t) })}
        style={{ ...bottone, opacity: valido ? 1 : 0.5, cursor: valido ? "pointer" : "not-allowed" }}
      >
        Crea obiettivo
      </button>
    </Sheet>
  );
}
