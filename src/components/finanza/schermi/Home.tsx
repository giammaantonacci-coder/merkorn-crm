import { RigaTx } from "@/components/finanza/RigaTx";
import { andamentoSaldo, eur, iniziale, type Calcolo, type Stato } from "@/lib/finanza";

export function Home({
  stato,
  calcolo,
  onVediSpese,
  onProfilo,
}: {
  stato: Stato;
  calcolo: Calcolo;
  onVediSpese: () => void;
  onProfilo: () => void;
}) {
  const recenti = stato.tx.slice(0, 3);
  const and = andamentoSaldo(stato.tx);

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
        <div>
          <div style={{ fontSize: 13, color: "#8a8f99", fontWeight: 500 }}>Buongiorno,</div>
          <div className="h1">{stato.nome || "Benvenuto"}</div>
        </div>
        <button
          type="button"
          onClick={onProfilo}
          aria-label="Modifica profilo"
          className="flex items-center justify-center text-white"
          style={{ width: 38, height: 38, borderRadius: 11, background: "#111318", fontWeight: 700, fontSize: 14, border: 0, cursor: "pointer", fontFamily: "inherit" }}
        >
          {stato.nome ? (
            iniziale(stato.nome)
          ) : (
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
            </svg>
          )}
        </button>
      </div>

      {/* saldo */}
      <div style={{ marginTop: 18, background: "#111318", borderRadius: 20, padding: 20, color: "#f5f6f8" }}>
        <div className="flex items-start justify-between">
          <div>
            <div style={{ fontSize: 12, color: "#7e838d", fontWeight: 500 }}>Saldo totale</div>
            <div style={{ fontSize: 33, fontWeight: 800, letterSpacing: "-.02em", marginTop: 4 }}>
              {eur(calcolo.saldo)}
            </div>
          </div>
          {and.haDati ? (
            <div
              style={{
                background: and.nettoMese >= 0 ? "rgba(143,224,182,.16)" : "rgba(240,182,168,.16)",
                color: and.nettoMese >= 0 ? "#8fe0b6" : "#f0b6a8",
                fontSize: 12,
                fontWeight: 700,
                padding: "5px 8px",
                borderRadius: 8,
              }}
            >
              {and.nettoMese >= 0 ? "▲" : "▼"} {eur(and.nettoMese, 0)}
            </div>
          ) : null}
        </div>

        {and.haDati ? (
          <>
            <div className="flex items-end" style={{ gap: 5, height: 60, marginTop: 20 }}>
              {and.barre.map((h, i) => (
                <div
                  key={i}
                  style={{ flex: 1, background: i === and.barre.length - 1 ? "#6b72f0" : "#2a2d38", borderRadius: "3px 3px 0 0", height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between" style={{ marginTop: 8, fontSize: 10, color: "#5c616b", fontWeight: 500 }}>
              {and.etichette.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          </>
        ) : (
          <div style={{ marginTop: 16, fontSize: 12.5, color: "#7e838d", fontWeight: 500 }}>
            Aggiungi un movimento col «+» e qui vedrai l&apos;andamento.
          </div>
        )}
      </div>

      {/* entrate / uscite */}
      <div className="flex" style={{ gap: 10, marginTop: 14 }}>
        <div className="card" style={{ flex: 1, padding: "13px 15px" }}>
          <div className="tag">Entrate</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: "#1f9d6b" }}>{eur(calcolo.entrate)}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "13px 15px" }}>
          <div className="tag">Uscite</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: "#d1543f" }}>{eur(calcolo.uscite)}</div>
        </div>
      </div>

      {/* budget */}
      <div className="card" style={{ marginTop: 14, padding: 15 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Budget mensile</span>
          <span style={{ fontSize: 12, color: "#8a8f99", fontWeight: 500 }}>
            {calcolo.budgetPerc}% · {eur(calcolo.budgetRimasto, 0)} rimasti
          </span>
        </div>
        <div className="flex" style={{ height: 6, background: "#eceef2", borderRadius: 3, overflow: "hidden" }}>
          {calcolo.perCategoria.map((c) => (
            <div key={c.cat} style={{ width: `${c.perc}%`, height: "100%", background: c.colore }} />
          ))}
        </div>
        <div className="flex justify-between" style={{ marginTop: 12, fontSize: 12 }}>
          {calcolo.perCategoria.map((c) => (
            <span key={c.cat} style={{ color: "#5c616b" }}>
              <b style={{ color: "#111318" }}>{c.cat === "Trasporti" ? "Trasp." : c.cat}</b>{" "}
              {Math.round(c.speso)}
            </span>
          ))}
        </div>
      </div>

      {/* recenti */}
      <div className="flex items-baseline justify-between" style={{ marginTop: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Transazioni recenti</div>
        {recenti.length > 0 ? (
          <span onClick={onVediSpese} style={{ fontSize: 13, color: "#6b72f0", fontWeight: 600, cursor: "pointer" }}>
            Vedi tutte
          </span>
        ) : null}
      </div>
      <div className="card" style={{ marginTop: 10, padding: "4px 15px" }}>
        {recenti.length === 0 ? (
          <div style={{ padding: "18px 2px", fontSize: 13.5, color: "#8a8f99" }}>
            Nessun movimento. Tocca il «+» per aggiungere il primo.
          </div>
        ) : (
          recenti.map((tx, i) => (
            <RigaTx key={tx.id} tx={tx} size={32} ultima={i === recenti.length - 1} />
          ))
        )}
      </div>
    </>
  );
}
