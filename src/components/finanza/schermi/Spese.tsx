"use client";

import { useState } from "react";

import { RigaTx } from "@/components/finanza/RigaTx";
import {
  etichettaMese,
  eur,
  meseDiTx,
  mesiDisponibili,
  totaliMese,
  type Stato,
} from "@/lib/finanza";

type Filtro = "Tutte" | "Entrate" | "Casa" | "Cibo" | "Trasporti" | "Svago";
const FILTRI: Filtro[] = ["Tutte", "Entrate", "Casa", "Cibo", "Trasporti", "Svago"];

export function Spese({ stato, onElimina }: { stato: Stato; onElimina: (id: string) => void }) {
  const [filtro, setFiltro] = useState<Filtro>("Tutte");
  const [mese, setMese] = useState<string>("");
  const [apertoMese, setApertoMese] = useState(false);

  const mesi = mesiDisponibili(stato.tx);
  const meseSel = mesi.includes(mese) ? mese : mesi[0];
  const totali = totaliMese(stato.tx, meseSel);

  const lista = stato.tx.filter((t) => {
    if (meseDiTx(t) !== meseSel) return false;
    if (filtro === "Tutte") return true;
    if (filtro === "Entrate") return t.tipo === "in";
    return t.tipo === "out" && t.cat === filtro;
  });

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
        <div className="h1">Movimenti</div>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setApertoMese((v) => !v)}
            className="card flex items-center"
            style={{ gap: 8, padding: "7px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            {etichettaMese(meseSel, false)} <span style={{ color: "#8a8f99" }}>▾</span>
          </button>
          {apertoMese ? (
            <>
              <div onClick={() => setApertoMese(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
              <div
                className="card"
                style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 31, padding: 6, minWidth: 160, boxShadow: "0 12px 30px rgba(0,0,0,.12)" }}
              >
                {mesi.map((m) => {
                  const on = m === meseSel;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMese(m);
                        setApertoMese(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "9px 11px",
                        borderRadius: 9,
                        border: 0,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 14,
                        fontWeight: on ? 700 : 500,
                        color: on ? "#4b52c9" : "#111318",
                        background: on ? "#edefff" : "transparent",
                      }}
                    >
                      {etichettaMese(m)}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex" style={{ gap: 10, marginTop: 16 }}>
        <div className="card" style={{ flex: 1, padding: "15px 16px" }}>
          <div className="tag">Entrate</div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4, color: "#1f9d6b" }}>{eur(totali.entrate)}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "15px 16px" }}>
          <div className="tag">Uscite</div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4, color: "#d1543f" }}>{eur(totali.uscite)}</div>
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
          <div style={{ padding: "18px 0", fontSize: 13, color: "#8a8f99" }}>Nessun movimento qui.</div>
        ) : (
          lista.map((tx, i) => (
            <RigaTx key={tx.id} tx={tx} size={34} ultima={i === lista.length - 1} onElimina={() => onElimina(tx.id)} />
          ))
        )}
      </div>
    </>
  );
}
