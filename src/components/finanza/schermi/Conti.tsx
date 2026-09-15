import { eur, type Calcolo, type Conto, type Stato } from "@/lib/finanza";

function IconaConto({ conto }: { conto: Conto }) {
  let inner: React.CSSProperties = { width: 14, height: 14, borderRadius: 4, background: "#111318" };
  let box = "#eceef2";
  if (/deposito|risparmio/i.test(conto.sotto + conto.nome)) {
    inner = { width: 14, height: 14, borderRadius: "50%", background: "#1f9d6b" };
    box = "#e6f4ee";
  } else if (/portafoglio|contant/i.test(conto.sotto + conto.nome)) {
    inner = { width: 14, height: 14, borderRadius: 4, border: "2px solid #8a8f99" };
  }
  return (
    <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: box }}>
      <span style={inner} />
    </div>
  );
}

export function Conti({
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
      <div className="h1" style={{ marginTop: 6 }}>
        Conti
      </div>
      <div style={{ fontSize: 13, color: "#8a8f99", fontWeight: 500, marginTop: 4 }}>Patrimonio netto</div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-.02em", marginTop: 2 }}>
        {eur(calcolo.patrimonio)}
      </div>

      {/* conto principale */}
      <div
        style={{
          marginTop: 18,
          borderRadius: 20,
          padding: 22,
          background: "linear-gradient(135deg,#6b72f0,#4b52c9)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="flex items-start justify-between">
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>Conto principale</div>
          <div style={{ width: 34, height: 22, borderRadius: 5, background: "rgba(255,255,255,.25)" }} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 26 }}>{eur(calcolo.saldo)}</div>
        <div
          className="flex items-center justify-between"
          style={{ marginTop: 14, fontSize: 13, letterSpacing: ".14em", fontWeight: 600, opacity: 0.85 }}
        >
          <span>•••• 4921</span>
          <span>09/29</span>
        </div>
      </div>

      {/* altri conti */}
      <div className="card" style={{ marginTop: 14, padding: "6px 16px" }}>
        {stato.conti.map((c, i) => (
          <div
            key={c.id}
            className="flex items-center gap-3"
            style={{ padding: "13px 0", borderBottom: i === stato.conti.length - 1 ? "none" : "1px solid #eceef2" }}
          >
            <IconaConto conto={c} />
            <div className="min-w-0 flex-1">
              <div className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>
                {c.nome}
              </div>
              <div className="truncate" style={{ fontSize: 11, color: "#8a8f99" }}>
                {c.sotto}
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{eur(c.saldo)}</div>
            <button
              type="button"
              onClick={() => onElimina(c.id)}
              aria-label={`Elimina ${c.nome}`}
              style={{ width: 26, height: 26, marginLeft: 2, borderRadius: "50%", border: 0, background: "transparent", color: "#c0c4cc", fontSize: 16, cursor: "pointer", flex: "none" }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

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
        + Collega un conto
      </button>
    </>
  );
}
