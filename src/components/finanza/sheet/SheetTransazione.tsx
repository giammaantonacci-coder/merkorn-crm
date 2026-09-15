"use client";

import { useState } from "react";

import { Sheet, TestataSheet } from "@/components/finanza/sheet/Sheet";
import { IconaCategoria } from "@/components/finanza/IconaCategoria";
import { CAT_USCITA, leggiImporto, type Categoria, type TipoTx } from "@/lib/finanza";

export function SheetTransazione({
  onClose,
  onSalva,
}: {
  onClose: () => void;
  onSalva: (dati: { nome: string; cat: Categoria; tipo: TipoTx; importo: number }) => void;
}) {
  const [tipo, setTipo] = useState<TipoTx>("out");
  const [importo, setImporto] = useState("");
  const [nome, setNome] = useState("");
  const [cat, setCat] = useState<Categoria>("Cibo");

  const isOut = tipo === "out";
  const importoValido = leggiImporto(importo);
  const puoSalvare = importoValido > 0;

  function salva() {
    if (!puoSalvare) return;
    onSalva({
      nome: nome.trim() || (isOut ? "Spesa" : "Entrata"),
      cat: isOut ? cat : "Entrata",
      tipo,
      importo: importoValido,
    });
  }

  return (
    <Sheet onClose={onClose}>
      <TestataSheet titolo="Nuova transazione" onClose={onClose} />

      {/* toggle uscita/entrata */}
      <div className="flex" style={{ background: "#e6e8ec", borderRadius: 13, padding: 4, marginTop: 16 }}>
        {(["out", "in"] as TipoTx[]).map((t) => {
          const on = tipo === t;
          const entrata = t === "in";
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                border: 0,
                fontFamily: "inherit",
                background: on ? "#fff" : "transparent",
                color: on ? (entrata ? "#1f9d6b" : "#111318") : "#8a8f99",
              }}
            >
              {entrata ? "Entrata" : "Uscita"}
            </button>
          );
        })}
      </div>

      {/* importo */}
      <div style={{ background: "#111318", borderRadius: 18, padding: "18px 20px", marginTop: 16, color: "#f5f6f8", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#7e838d", fontWeight: 500 }}>Importo</div>
        <div className="flex items-center justify-center" style={{ gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: isOut ? "#f5f6f8" : "#8fe0b6" }}>
            {isOut ? "−" : "+"} €
          </span>
          <input
            value={importo}
            onChange={(e) => setImporto(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            autoFocus
            style={{
              width: 150,
              border: "none",
              background: "transparent",
              color: isOut ? "#f5f6f8" : "#8fe0b6",
              fontSize: 30,
              fontWeight: 800,
              padding: 0,
              textAlign: "left",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* descrizione */}
      <div style={{ marginTop: 14 }}>
        <div className="tag" style={{ marginBottom: 7 }}>
          Descrizione
        </div>
        <input
          className="finput"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Es. Spesa supermercato"
        />
      </div>

      {/* categoria (solo uscita) */}
      {isOut ? (
        <div style={{ marginTop: 14 }}>
          <div className="tag" style={{ marginBottom: 7 }}>
            Categoria
          </div>
          <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
            {CAT_USCITA.map((c) => {
              const sel = cat === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className="flex items-center"
                  style={{
                    gap: 7,
                    padding: "8px 13px",
                    borderRadius: 11,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    border: `1px solid ${sel ? "#6b72f0" : "#e6e8ec"}`,
                    background: sel ? "#edefff" : "#fff",
                    color: sel ? "#4b52c9" : "#5c616b",
                  }}
                >
                  <IconaCategoria cat={c} size={16} />
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={salva}
        disabled={!puoSalvare}
        style={{
          marginTop: 20,
          width: "100%",
          background: isOut ? "#6b72f0" : "#1f9d6b",
          color: "#fff",
          borderRadius: 14,
          padding: "16px 0",
          textAlign: "center",
          fontSize: 15,
          fontWeight: 700,
          border: 0,
          cursor: puoSalvare ? "pointer" : "not-allowed",
          opacity: puoSalvare ? 1 : 0.5,
          fontFamily: "inherit",
        }}
      >
        Aggiungi transazione
      </button>
    </Sheet>
  );
}
