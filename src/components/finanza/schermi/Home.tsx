import { RigaTx } from "@/components/finanza/RigaTx";
import { andamentoSaldo, eur, iniziale, scurisci, spesaPerMese, type Calcolo, type Stato } from "@/lib/finanza";

export function Home({
  stato,
  calcolo,
  onVediSpese,
  onProfilo,
  onBudget,
}: {
  stato: Stato;
  calcolo: Calcolo;
  onVediSpese: () => void;
  onProfilo: () => void;
  onBudget: () => void;
}) {
  const budgetColore =
    calcolo.budgetPerc >= 100 ? "#d1543f" : calcolo.budgetPerc >= 80 ? "#c9853f" : "#6b72f0";
  const recenti = stato.tx.slice(0, 3);
  const and = andamentoSaldo(stato.tx);

  // confronto spese fra i mesi
  const mesi = spesaPerMese(stato.tx, 6);
  const totaleSpese = mesi.reduce((a, m) => a + m.uscite, 0);
  const scala = Math.max(...mesi.map((m) => m.uscite), calcolo.budget, 1) * 1.15;
  const spesaCorrente = mesi[mesi.length - 1].uscite;
  const spesaPrec = mesi.length > 1 ? mesi[mesi.length - 2].uscite : 0;
  const diff = spesaCorrente - spesaPrec;

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

      {/* budget — stile obiettivi con la percentuale in filigrana */}
      <button
        type="button"
        onClick={onBudget}
        className="card"
        style={{ position: "relative", overflow: "hidden", marginTop: 14, padding: 18, width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit", display: "block" }}
      >
        {calcolo.budget > 0 ? (
          <>
            <span
              aria-hidden
              style={{
                position: "absolute",
                right: 10,
                bottom: -14,
                fontSize: 92,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-.04em",
                color: budgetColore,
                opacity: 0.08,
                zIndex: 0,
                pointerEvents: "none",
              }}
            >
              {calcolo.budgetPerc}%
            </span>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Budget mensile</div>
              <div className="flex items-baseline" style={{ gap: 8, marginTop: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{eur(calcolo.budgetSpeso, 0)}</div>
                <div style={{ fontSize: 13, color: "#8a8f99", fontWeight: 500 }}>di {eur(calcolo.budget, 0)}</div>
              </div>
              <div style={{ height: 8, background: "#dcdfe6", borderRadius: 4, marginTop: 12, overflow: "hidden", maxWidth: "72%" }}>
                <div style={{ width: `${calcolo.budgetPerc}%`, height: "100%", background: scurisci(budgetColore, 0.28), borderRadius: 4 }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12.5, color: "#8a8f99", fontWeight: 500 }}>
                {eur(calcolo.budgetRimasto, 0)} rimasti questo mese
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Budget mensile</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#8a8f99", fontWeight: 500 }}>
              Tocca per impostare un tetto di spesa mensile.
            </div>
          </>
        )}
      </button>

      {/* confronto spese fra i mesi */}
      {totaleSpese > 0 ? (
        <div className="card" style={{ marginTop: 14, padding: 18 }}>
          <div className="flex items-baseline justify-between">
            <div style={{ fontSize: 15, fontWeight: 700 }}>Spese per mese</div>
            {spesaPrec > 0 || spesaCorrente > 0 ? (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: diff > 0 ? "#d1543f" : diff < 0 ? "#1f9d6b" : "#8a8f99" }}>
                {diff === 0
                  ? "come il mese scorso"
                  : `${diff > 0 ? "+" : "−"} ${eur(diff, 0)} sul mese scorso`}
              </div>
            ) : null}
          </div>

          <div style={{ position: "relative", height: 76, marginTop: 16, display: "flex", alignItems: "flex-end", gap: 10 }}>
            {calcolo.budget > 0 ? (
              <div
                aria-hidden
                style={{ position: "absolute", left: 0, right: 0, top: `${Math.max(0, (1 - calcolo.budget / scala) * 100)}%`, borderTop: "1.5px dashed #b7bcc6" }}
              >
                <span style={{ position: "absolute", right: 0, top: -8, fontSize: 10, fontWeight: 700, color: "#8a8f99", background: "#fff", padding: "0 4px" }}>
                  budget
                </span>
              </div>
            ) : null}
            {mesi.map((m, i) => {
              const h = (m.uscite / scala) * 100;
              const corrente = i === mesi.length - 1;
              const sfora = calcolo.budget > 0 && m.uscite > calcolo.budget;
              const colore = sfora ? "#d1543f" : corrente ? "#6b72f0" : "#d3d7e0";
              return (
                <div key={m.mese} className="flex items-end" style={{ flex: 1, height: "100%" }}>
                  <div style={{ width: "100%", height: `${Math.max(m.uscite > 0 ? 4 : 0, h)}%`, background: colore, borderRadius: "4px 4px 0 0" }} />
                </div>
              );
            })}
          </div>
          <div className="flex" style={{ gap: 10, marginTop: 8 }}>
            {mesi.map((m, i) => (
              <span
                key={m.mese}
                style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: i === mesi.length - 1 ? 800 : 600, color: i === mesi.length - 1 ? "#111318" : "#8a8f99" }}
              >
                {m.etichetta}
              </span>
            ))}
          </div>
        </div>
      ) : null}

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
