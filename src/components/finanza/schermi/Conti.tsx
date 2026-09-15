import { PilaCarte, type Carta } from "@/components/finanza/PilaCarte";
import { eur, type Calcolo, type Stato } from "@/lib/finanza";

const GRADIENTE_PRINCIPALE = "linear-gradient(135deg,#6b72f0,#4b52c9)";
const GRADIENTI = [
  "linear-gradient(135deg,#1f9d6b,#17805a)",
  "linear-gradient(135deg,#3a3f66,#20233a)",
  "linear-gradient(135deg,#c9853f,#a9692c)",
  "linear-gradient(135deg,#c0455a,#8f2f43)",
  "linear-gradient(135deg,#2f7fbf,#215f92)",
];

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
  const carte: Carta[] = [
    {
      id: "principale",
      titolo: "Conto principale",
      saldo: calcolo.saldo,
      sotto: "•••• 4921",
      destra: "09/29",
      gradient: GRADIENTE_PRINCIPALE,
      eliminabile: false,
    },
    ...stato.conti.map((c, i) => ({
      id: c.id,
      titolo: c.nome,
      saldo: c.saldo,
      sotto: c.sotto,
      gradient: GRADIENTI[i % GRADIENTI.length],
      eliminabile: true,
    })),
  ];

  return (
    <>
      <div className="h1" style={{ marginTop: 6 }}>
        Conti
      </div>
      <div style={{ fontSize: 13, color: "#8a8f99", fontWeight: 500, marginTop: 4 }}>Patrimonio netto</div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-.02em", marginTop: 2 }}>
        {eur(calcolo.patrimonio)}
      </div>

      <div style={{ marginTop: 18 }}>
        <PilaCarte carte={carte} onElimina={onElimina} />
      </div>

      <button
        type="button"
        onClick={onNuovo}
        style={{
          marginTop: 18,
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
