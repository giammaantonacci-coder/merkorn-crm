"use client";

import { useState } from "react";

import { Sheet, TestataSheet } from "@/components/finanza/sheet/Sheet";
import { leggiImporto } from "@/lib/finanza";

export function SheetBudget({
  budget,
  onClose,
  onSalva,
}: {
  budget: number;
  onClose: () => void;
  onSalva: (budget: number) => void;
}) {
  const [valore, setValore] = useState(budget > 0 ? String(budget).replace(".", ",") : "");
  const b = leggiImporto(valore) || 0;

  return (
    <Sheet onClose={onClose}>
      <TestataSheet titolo="Budget mensile" onClose={onClose} />

      <div style={{ marginTop: 16 }}>
        <div className="tag" style={{ marginBottom: 7 }}>
          Quanto vuoi spendere al mese
        </div>
        <input
          className="finput"
          value={valore}
          onChange={(e) => setValore(e.target.value)}
          inputMode="decimal"
          placeholder="Es. 1.500"
          autoFocus
        />
        <p style={{ marginTop: 8, fontSize: 12.5, color: "#8a8f99" }}>
          La Home mostrerà quanto hai speso rispetto a questo tetto. Lascia vuoto per toglierlo.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onSalva(b)}
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
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Salva budget
      </button>
    </Sheet>
  );
}
