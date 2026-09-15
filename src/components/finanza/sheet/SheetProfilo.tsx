"use client";

import { useState } from "react";

import { Sheet, TestataSheet } from "@/components/finanza/sheet/Sheet";

export function SheetProfilo({
  nome,
  onClose,
  onSalva,
}: {
  nome: string;
  onClose: () => void;
  onSalva: (nome: string) => void;
}) {
  const [valore, setValore] = useState(nome);
  const valido = valore.trim().length > 0;

  return (
    <Sheet onClose={onClose}>
      <TestataSheet titolo="Il tuo profilo" onClose={onClose} />

      <div style={{ marginTop: 16 }}>
        <div className="tag" style={{ marginBottom: 7 }}>
          Come ti chiami
        </div>
        <input
          className="finput"
          value={valore}
          onChange={(e) => setValore(e.target.value)}
          placeholder="Il tuo nome"
          autoFocus
        />
        <p style={{ marginTop: 8, fontSize: 12.5, color: "#8a8f99" }}>
          Compare nel saluto della Home. Resta solo su questo dispositivo.
        </p>
      </div>

      <button
        type="button"
        disabled={!valido}
        onClick={() => valido && onSalva(valore.trim())}
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
        Salva
      </button>
    </Sheet>
  );
}
