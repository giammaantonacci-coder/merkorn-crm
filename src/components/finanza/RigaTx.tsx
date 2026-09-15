import { IconaCategoria } from "@/components/finanza/IconaCategoria";
import { eur, type Transazione } from "@/lib/finanza";

/** Una riga della lista movimenti: pallino categoria, nome, quando · categoria, importo. */
export function RigaTx({
  tx,
  size = 34,
  ultima = false,
  onElimina,
}: {
  tx: Transazione;
  size?: number;
  ultima?: boolean;
  onElimina?: () => void;
}) {
  const entrata = tx.tipo === "in";
  return (
    <div
      className="flex items-center gap-3"
      style={{ padding: "12px 0", borderBottom: ultima ? "none" : "1px solid #eceef2" }}
    >
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size, borderRadius: 9, background: "#eceef2" }}
      >
        <IconaCategoria cat={tx.cat} size={size >= 34 ? 18 : 17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate" style={{ fontSize: 14, fontWeight: 600 }}>
          {tx.nome}
        </div>
        <div className="truncate" style={{ fontSize: 11, color: "#8a8f99" }}>
          {tx.quando} · {tx.cat}
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: entrata ? "#1f9d6b" : "#111318" }}>
        {entrata ? "+ " : "− "}
        {eur(tx.importo)}
      </div>
      {onElimina ? (
        <button
          type="button"
          onClick={onElimina}
          aria-label={`Elimina ${tx.nome}`}
          className="flex items-center justify-center"
          style={{ width: 26, height: 26, marginLeft: 2, borderRadius: "50%", border: 0, background: "transparent", color: "#c0c4cc", fontSize: 16, cursor: "pointer", flex: "none" }}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
