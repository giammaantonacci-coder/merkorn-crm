import { eur, type Calcolo, type Stato } from "@/lib/finanza";

export function Obiettivi({
  stato,
  calcolo,
  onNuovo,
  onElimina,
}: {
  stato: Stato;
  calcolo: Calcolo;
  onNuovo: () => void;
  onElimina: (id: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
        <div className="h1">Obiettivi</div>
        <button
          type="button"
          onClick={onNuovo}
          aria-label="Nuovo obiettivo"
          className="flex items-center justify-center text-white"
          style={{ width: 34, height: 34, borderRadius: 11, background: "#6b72f0", fontSize: 22, fontWeight: 400, border: 0, cursor: "pointer", lineHeight: 1 }}
        >
          +
        </button>
      </div>
      <div style={{ fontSize: 13, color: "#8a8f99", fontWeight: 500, marginTop: 4 }}>
        Stai risparmiando {eur(calcolo.risparmioTotale, 0)} in totale
      </div>

      {stato.obiettivi.map((o) => {
        const perc = o.target > 0 ? Math.min(100, Math.round((o.salvato / o.target) * 100)) : 0;
        return (
          <div key={o.id} className="card" style={{ marginTop: 14, padding: 18 }}>
            <div className="flex items-center justify-between">
              <div style={{ fontSize: 15, fontWeight: 700 }}>{o.nome}</div>
              <div className="flex items-center" style={{ gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: o.colore }}>{perc}%</div>
                <button
                  type="button"
                  onClick={() => onElimina(o.id)}
                  aria-label={`Elimina ${o.nome}`}
                  style={{ width: 22, height: 22, borderRadius: "50%", border: 0, background: "transparent", color: "#c0c4cc", fontSize: 15, cursor: "pointer", lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex items-baseline justify-between" style={{ marginTop: 6 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{eur(o.salvato, 0)}</div>
              <div style={{ fontSize: 13, color: "#8a8f99", fontWeight: 500 }}>di {eur(o.target, 0)}</div>
            </div>
            <div style={{ height: 8, background: "#eceef2", borderRadius: 4, marginTop: 10, overflow: "hidden" }}>
              <div style={{ width: `${perc}%`, height: "100%", background: o.colore, borderRadius: 4 }} />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onNuovo}
        style={{
          marginTop: 14,
          width: "100%",
          border: "1.5px dashed #cfd3da",
          borderRadius: 16,
          padding: 16,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 600,
          color: "#8a8f99",
          background: "transparent",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        + Nuovo obiettivo
      </button>
    </>
  );
}
