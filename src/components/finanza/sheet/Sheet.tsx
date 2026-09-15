"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Foglio a comparsa dal basso. La tastiera lo copre in overlay (lo sheet non si
 * solleva): resta visibile la parte alta col campo in uso. Il campo a fuoco
 * viene scrollato quel tanto che serve per restare appena sopra la tastiera —
 * sia quando prende fuoco, sia quando la tastiera compare (visualViewport).
 */
export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const pannello = useRef<HTMLDivElement>(null);

  function portaSopraTastiera(el: Element | null) {
    const cont = pannello.current;
    if (!cont || !el || !cont.contains(el)) return;
    const vv = window.visualViewport;
    const bordoTastiera = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const r = el.getBoundingClientRect();
    const oltre = r.bottom - (bordoTastiera - 16);
    if (oltre > 0) cont.scrollTop += oltre;
  }

  // La tastiera compare qualche istante dopo il focus: riallineo al momento in
  // cui la visualViewport cambia (comparsa/scomparsa/redimensionamento).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const suCambio = () => portaSopraTastiera(document.activeElement);
    vv.addEventListener("resize", suCambio);
    vv.addEventListener("scroll", suCambio);
    return () => {
      vv.removeEventListener("resize", suCambio);
      vv.removeEventListener("scroll", suCambio);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className="vela"
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(11,11,12,.45)", zIndex: 40 }}
      />
      <div
        ref={pannello}
        className="sheet-su"
        onFocusCapture={(e) => {
          const el = e.target as Element;
          // sia subito, sia dopo la comparsa della tastiera
          portaSopraTastiera(el);
          setTimeout(() => portaSopraTastiera(el), 320);
        }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0, // ancorato in basso: la tastiera lo copre in overlay
          zIndex: 50,
          background: "#f5f6f8",
          borderRadius: "28px 28px 42px 42px",
          padding: "10px 22px 30px",
          // spazio extra pari alla tastiera: margine per scrollare il campo a fuoco
          paddingBottom: "calc(30px + env(safe-area-inset-bottom, 0px) + var(--kb, 0px))",
          // l'area utile si ferma sopra la tastiera: il resto scorre sotto di essa
          maxHeight: "calc(100% - var(--kb, 0px) - 8px)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        <div style={{ width: 38, height: 5, borderRadius: 3, background: "#d3d6dc", margin: "0 auto 14px" }} />
        {children}
      </div>
    </>
  );
}

export function TestataSheet({ titolo, onClose }: { titolo: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div style={{ fontSize: 19, fontWeight: 800 }}>{titolo}</div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Chiudi"
        className="flex items-center justify-center"
        style={{ width: 30, height: 30, borderRadius: "50%", background: "#e6e8ec", fontSize: 17, color: "#5c616b", border: 0, cursor: "pointer" }}
      >
        ✕
      </button>
    </div>
  );
}
