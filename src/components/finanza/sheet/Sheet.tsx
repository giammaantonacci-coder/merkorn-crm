"use client";

import type { ReactNode } from "react";

/** Contenitore a comparsa dal basso, con velo scuro dietro. */
export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <>
      <div
        className="vela"
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(11,11,12,.45)", zIndex: 40 }}
      />
      <div
        className="sheet-su"
        onFocusCapture={(e) => {
          const t = e.target as HTMLElement;
          setTimeout(() => t.scrollIntoView({ block: "center", behavior: "smooth" }), 260);
        }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          // si solleva sopra la tastiera quando è aperta
          bottom: "var(--kb, 0px)",
          zIndex: 50,
          background: "#f5f6f8",
          borderRadius: "28px 28px 42px 42px",
          padding: "10px 22px 30px",
          paddingBottom: "calc(30px + env(safe-area-inset-bottom, 0px))",
          maxHeight: "calc(100% - var(--kb, 0px) - 8px)",
          overflowY: "auto",
          transition: "bottom .18s ease",
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
