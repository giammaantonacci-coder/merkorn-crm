"use client";

import type { ReactNode } from "react";

export type Tab = "home" | "spese" | "obiettivi" | "conti";

const ON = "#6b72f0";
const OFF = "#9aa0aa";
const TXT_ON = "#111318";
const TXT_OFF = "#8a8f99";

const tratto = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const ICONE: Record<Tab, ReactNode> = {
  home: (
    <svg viewBox="0 0 24 24" width={24} height={24} {...tratto}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  ),
  spese: (
    <svg viewBox="0 0 24 24" width={24} height={24} {...tratto}>
      <path d="M6 3h12v18l-2.2-1.6-2 1.6-1.8-1.6-1.8 1.6-2-1.6L6 21z" />
      <path d="M9.5 8.5h5M9.5 12.5h5" />
    </svg>
  ),
  obiettivi: (
    <svg viewBox="0 0 24 24" width={24} height={24} {...tratto}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  conti: (
    <svg viewBox="0 0 24 24" width={24} height={24} {...tratto}>
      <rect x="3" y="6" width="18" height="13" rx="2.6" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1.2" />
    </svg>
  ),
};

const ETICHETTE: Record<Tab, string> = {
  home: "Home",
  spese: "Spese",
  obiettivi: "Obiettivi",
  conti: "Conti",
};

function Voce({ tab, attivo, onTab }: { tab: Tab; attivo: boolean; onTab: (t: Tab) => void }) {
  return (
    <button
      type="button"
      onClick={() => onTab(tab)}
      aria-label={ETICHETTE[tab]}
      className="flex flex-col items-center gap-[5px] bg-transparent border-0 cursor-pointer p-0"
      style={{ color: attivo ? ON : OFF }}
    >
      {ICONE[tab]}
      <span style={{ fontSize: 11, fontWeight: 600, color: attivo ? TXT_ON : TXT_OFF }}>
        {ETICHETTE[tab]}
      </span>
    </button>
  );
}

export function BarraNav({
  tab,
  onTab,
  onAggiungi,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  onAggiungi: () => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex items-start justify-around border-t border-line"
      style={{
        width: "100%",
        maxWidth: 430,
        height: 88,
        background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "12px 18px 0",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <Voce tab="home" attivo={tab === "home"} onTab={onTab} />
      <Voce tab="spese" attivo={tab === "spese"} onTab={onTab} />

      <button
        type="button"
        onClick={onAggiungi}
        aria-label="Nuova transazione"
        className="flex items-center justify-center text-white"
        style={{
          marginTop: -14,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#6b72f0",
          boxShadow: "0 8px 18px -4px rgba(107,114,240,.6)",
          border: 0,
          cursor: "pointer",
          flex: "none",
        }}
      >
        <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <Voce tab="obiettivi" attivo={tab === "obiettivi"} onTab={onTab} />
      <Voce tab="conti" attivo={tab === "conti"} onTab={onTab} />
    </nav>
  );
}
