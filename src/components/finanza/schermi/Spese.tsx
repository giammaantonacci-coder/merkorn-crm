"use client";

import { useState } from "react";

import { RigaTx } from "@/components/finanza/RigaTx";
import { eur, type Calcolo, type Stato } from "@/lib/finanza";

type Filtro = "Tutte" | "Entrate" | "Casa" | "Cibo" | "Trasporti" | "Svago";
const FILTRI: Filtro[] = ["Tutte", "Entrate", "Casa", "Cibo", "Trasporti", "Svago"];

export function Spese({ stato, calcolo }: { stato: Stato; calcolo: Calcolo }) {
  const [filtro, setFiltro] = useState<Filtro>("Tutte");

  const lista = stato.tx.filter((t) => {
    if (filtro === "Tutte") return true;
    if (filtro === "Entrate") return t.tipo === "in";
    return t.tipo === "out" && t.cat === filtro;
  });

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
        <div className="h1">Movimenti</div>
        <div
          className="card flex items-center"
          style={{ gap: 8, padding: "7px 12px", fontSize: 13, fontWeight: 600 }}
        >
          Settembre <span style={{ color: "#8a8f99" }}>▾</span>
        </div>
      </div>

      <div className="flex" style={{ gap: 10, marginTop: 16 }}>
        <div className="card" style={{ flex: 1, padding: "15px 16px" }}>
          <div className="tag">Entrate</div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4, color: "#1f9d6b" }}>{eur(calcolo.entrate)}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "15px 16px" }}>
          <div className="tag">Uscite</div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4, color: "#d1543f" }}>{eur(calcolo.uscite)}</div>
        </div>
      </div>

      <div className="flex noscroll" style={{ gap: 8, marginTop: 16, overflowX: "auto", paddingBottom: 2 }}>
        {FILTRI.map((f) => {
          const attivo = filtro === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              style={{
                flex: "none",
                border: attivo ? "none" : "1px solid #e6e8ec",
                background: attivo ? "#6b72f0" : "#fff",
                color: attivo ? "#fff" : "#5c616b",
                borderRadius: 11,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className="tag" style={{ marginTop: 20 }}>
        Tutti i movimenti
      </div>
      <div className="card" style={{ marginTop: 8, padding: "4px 15px" }}>
        {lista.length === 0 ? (
          <div style={{ padding: "18px 0", fontSize: 13, color: "#8a8f99" }}>
            Nessun movimento in questa categoria.
          </div>
        ) : (
          lista.map((tx, i) => <RigaTx key={tx.id} tx={tx} size={34} ultima={i === lista.length - 1} />)
        )}
      </div>
    </>
  );
}
