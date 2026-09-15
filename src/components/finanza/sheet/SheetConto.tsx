"use client";

import { useState } from "react";

import { Sheet, TestataSheet } from "@/components/finanza/sheet/Sheet";
import { leggiImporto } from "@/lib/finanza";

export function SheetConto({
  onClose,
  onSalva,
}: {
  onClose: () => void;
  onSalva: (dati: { nome: string; sotto: string; saldo: number }) => void;
}) {
  const [nome, setNome] = useState("");
  const [sotto, setSotto] = useState("");
  const [saldo, setSaldo] = useState("");

  const s = leggiImporto(saldo) || 0;
  const valido = nome.trim().length > 0;

  return (
    <Sheet onClose={onClose}>
      <TestataSheet titolo="Nuovo conto" onClose={onClose} />

      <div style={{ marginTop: 16 }}>
        <div className="tag" style={{ marginBottom: 7 }}>
          Nome
        </div>
        <input className="finput" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Es. Conto risparmio" />
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="tag" style={{ marginBottom: 7 }}>
          Dettaglio
        </div>
        <input className="finput" value={sotto} onChange={(e) => setSotto(e.target.value)} placeholder="Es. Deposito · •••• 1234" />
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="tag" style={{ marginBottom: 7 }}>
          Saldo €
        </div>
        <input className="finput" value={saldo} onChange={(e) => setSaldo(e.target.value)} inputMode="decimal" placeholder="0,00" />
      </div>

      <button
        type="button"
        disabled={!valido}
        onClick={() => valido && onSalva({ nome: nome.trim(), sotto: sotto.trim() || "Conto", saldo: s })}
        style={{
          marginTop: 20,
          width: "100%",
          background: "#6b72f0",
          color: "#fff",
          borderRadius: 14,
          padding: "16px 0",
          fontSize: 15,
          fontWeight: 700,
          border: 0,
          cursor: valido ? "pointer" : "not-allowed",
          opacity: valido ? 1 : 0.5,
          fontFamily: "inherit",
        }}
      >
        Aggiungi conto
      </button>
    </Sheet>
  );
}
