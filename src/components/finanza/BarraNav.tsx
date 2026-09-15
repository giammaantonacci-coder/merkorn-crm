"use client";

export type Tab = "home" | "spese" | "obiettivi" | "conti";

const ON = "#6b72f0";
const OFF = "#cfd3da";
const TXT_ON = "#111318";
const TXT_OFF = "#8a8f99";

function Etichetta({ attivo, children }: { attivo: boolean; children: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: attivo ? TXT_ON : TXT_OFF }}>
      {children}
    </span>
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
  const a = (t: Tab) => tab === t;
  const btn = "flex flex-col items-center gap-[5px] bg-transparent border-0 cursor-pointer p-0";

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-20 flex items-start justify-around border-t border-line"
      style={{
        height: 88,
        background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "14px 18px 0",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <button type="button" className={btn} onClick={() => onTab("home")} aria-label="Home">
        <div style={{ width: 22, height: 22, borderRadius: 6, background: a("home") ? ON : OFF }} />
        <Etichetta attivo={a("home")}>Home</Etichetta>
      </button>

      <button type="button" className={btn} onClick={() => onTab("spese")} aria-label="Spese">
        <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${a("spese") ? ON : OFF}` }} />
        <Etichetta attivo={a("spese")}>Spese</Etichetta>
      </button>

      <button
        type="button"
        className={btn}
        onClick={onAggiungi}
        aria-label="Nuova transazione"
        style={{ marginTop: -16 }}
      >
        <div
          className="flex items-center justify-center text-white"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#6b72f0",
            boxShadow: "0 8px 18px -4px rgba(107,114,240,.6)",
            fontSize: 30,
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          +
        </div>
      </button>

      <button type="button" className={btn} onClick={() => onTab("obiettivi")} aria-label="Obiettivi">
        <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${a("obiettivi") ? ON : OFF}` }} />
        <Etichetta attivo={a("obiettivi")}>Obiettivi</Etichetta>
      </button>

      <button type="button" className={btn} onClick={() => onTab("conti")} aria-label="Conti">
        <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${a("conti") ? ON : OFF}` }} />
        <Etichetta attivo={a("conti")}>Conti</Etichetta>
      </button>
    </nav>
  );
}
