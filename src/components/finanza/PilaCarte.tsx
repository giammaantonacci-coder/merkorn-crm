"use client";

import { useRef, useState } from "react";

import { eur } from "@/lib/finanza";

export type Carta = {
  id: string;
  titolo: string;
  saldo: number;
  sotto: string;
  destra?: string;
  gradient: string;
  eliminabile: boolean;
};

const CARD_H = 152;
const PASSO = 18; // di quanto sporge ogni carta dietro

/**
 * Le carte impilate una sull'altra: quella davanti è a fuoco, le altre
 * sporgono dietro. Si scambiano con un tocco o uno swipe orizzontale.
 */
export function PilaCarte({ carte, onElimina }: { carte: Carta[]; onElimina: (id: string) => void }) {
  const [attiva, setAttiva] = useState(0);
  const giu = useRef<{ x: number; y: number; t: number } | null>(null);
  const n = carte.length;
  const dietroVisibili = Math.min(n - 1, 2);

  const idx = Math.min(attiva, n - 1);

  function suFine(e: React.PointerEvent) {
    const g = giu.current;
    giu.current = null;
    if (!g || n < 2) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    const dt = Date.now() - g.t;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setAttiva((a) => (dx < 0 ? (a + 1) % n : (a - 1 + n) % n));
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 350) {
      setAttiva((a) => (a + 1) % n);
    }
  }

  return (
    <div>
      <div
        style={{ position: "relative", height: CARD_H + dietroVisibili * PASSO, touchAction: "pan-y", cursor: n > 1 ? "grab" : "default" }}
        onPointerDown={(e) => {
          giu.current = { x: e.clientX, y: e.clientY, t: Date.now() };
        }}
        onPointerUp={suFine}
      >
        {carte.map((c, i) => {
          const rango = (i - idx + n) % n;
          const nascosta = rango > dietroVisibili;
          return (
            <div
              key={c.id}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: CARD_H,
                borderRadius: 20,
                padding: 22,
                color: "#fff",
                background: c.gradient,
                boxShadow: "0 12px 26px -12px rgba(20,22,40,.5)",
                transform: `translateY(${rango * PASSO}px) scale(${1 - rango * 0.045})`,
                transformOrigin: "top center",
                filter: `brightness(${1 - rango * 0.08})`,
                opacity: nascosta ? 0 : 1,
                zIndex: n - rango,
                transition: "transform .32s cubic-bezier(.22,.61,.36,1), filter .32s ease, opacity .28s ease",
                pointerEvents: "none",
                overflow: "hidden",
              }}
            >
              <div className="flex items-start justify-between">
                <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9 }}>{c.titolo}</div>
                {c.eliminabile ? (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onElimina(c.id)}
                    aria-label={`Elimina ${c.titolo}`}
                    className="flex items-center justify-center"
                    style={{ pointerEvents: "auto", width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.2)", color: "#fff", border: 0, fontSize: 15, cursor: "pointer" }}
                  >
                    ✕
                  </button>
                ) : (
                  <div style={{ width: 34, height: 22, borderRadius: 5, background: "rgba(255,255,255,.25)" }} />
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 24 }}>{eur(c.saldo)}</div>
              <div className="flex items-center justify-between" style={{ marginTop: 14, fontSize: 13, letterSpacing: ".12em", fontWeight: 600, opacity: 0.9 }}>
                <span>{c.sotto}</span>
                <span>{c.destra ?? ""}</span>
              </div>
            </div>
          );
        })}
      </div>

      {n > 1 ? (
        <div className="flex items-center justify-center" style={{ gap: 6, marginTop: 12 }}>
          {carte.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Vai a ${c.titolo}`}
              onClick={() => setAttiva(i)}
              style={{
                width: i === idx ? 18 : 7,
                height: 7,
                borderRadius: 4,
                border: 0,
                cursor: "pointer",
                padding: 0,
                background: i === idx ? "#6b72f0" : "#cfd3da",
                transition: "width .25s ease, background .25s ease",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
