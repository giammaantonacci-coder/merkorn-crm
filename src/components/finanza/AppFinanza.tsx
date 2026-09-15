"use client";

import { useEffect, useState } from "react";

import { BarraNav, type Tab } from "@/components/finanza/BarraNav";
import { Home } from "@/components/finanza/schermi/Home";
import { Spese } from "@/components/finanza/schermi/Spese";
import { Obiettivi } from "@/components/finanza/schermi/Obiettivi";
import { Conti } from "@/components/finanza/schermi/Conti";
import { SheetTransazione } from "@/components/finanza/sheet/SheetTransazione";
import { SheetObiettivo } from "@/components/finanza/sheet/SheetObiettivo";
import { SheetConto } from "@/components/finanza/sheet/SheetConto";
import { SheetProfilo } from "@/components/finanza/sheet/SheetProfilo";
import { SheetBudget } from "@/components/finanza/sheet/SheetBudget";
import { useFinanza } from "@/lib/useFinanza";
import { calcola, OBIETTIVO_COLORI } from "@/lib/finanza";

type Modale = "nessuna" | "tx" | "obiettivo" | "conto" | "profilo" | "budget";

export function AppFinanza() {
  const {
    stato,
    impostaNome,
    impostaBudget,
    aggiungiTx,
    eliminaTx,
    aggiungiObiettivo,
    eliminaObiettivo,
    aggiungiConto,
    eliminaConto,
  } = useFinanza();
  const [tab, setTab] = useState<Tab>("home");
  const [modale, setModale] = useState<Modale>("nessuna");

  const calcolo = calcola(stato);
  const chiudi = () => setModale("nessuna");

  // La tastiera a schermo: aggiorno --kb con l'altezza coperta, così lo sheet
  // si solleva restando sopra la tastiera invece di finirci sotto.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const aggiorna = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty("--kb", `${Math.round(kb)}px`);
    };
    aggiorna();
    vv.addEventListener("resize", aggiorna);
    vv.addEventListener("scroll", aggiorna);
    return () => {
      vv.removeEventListener("resize", aggiorna);
      vv.removeEventListener("scroll", aggiorna);
      document.documentElement.style.setProperty("--kb", "0px");
    };
  }, []);

  return (
    <div
      className="mx-auto"
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        overflow: "hidden",
        background: "#f5f6f8",
        boxShadow: "0 0 40px rgba(0,0,0,.10)",
      }}
    >
      <div
        className="noscroll"
        style={{
          position: "absolute",
          inset: 0,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          padding: "calc(env(safe-area-inset-top, 0px) + 18px) 22px 116px",
        }}
      >
        {tab === "home" && (
          <Home
            stato={stato}
            calcolo={calcolo}
            onVediSpese={() => setTab("spese")}
            onProfilo={() => setModale("profilo")}
            onBudget={() => setModale("budget")}
          />
        )}
        {tab === "spese" && <Spese stato={stato} onElimina={eliminaTx} />}
        {tab === "obiettivi" && (
          <Obiettivi
            stato={stato}
            calcolo={calcolo}
            onNuovo={() => setModale("obiettivo")}
            onElimina={eliminaObiettivo}
          />
        )}
        {tab === "conti" && (
          <Conti stato={stato} calcolo={calcolo} onNuovo={() => setModale("conto")} onElimina={eliminaConto} />
        )}
      </div>

      <BarraNav tab={tab} onTab={setTab} onAggiungi={() => setModale("tx")} />

      {modale === "tx" && (
        <SheetTransazione
          onClose={chiudi}
          onSalva={(dati) => {
            aggiungiTx(dati);
            setTab("spese");
            chiudi();
          }}
        />
      )}

      {modale === "obiettivo" && (
        <SheetObiettivo
          onClose={chiudi}
          onSalva={(dati) => {
            aggiungiObiettivo({
              ...dati,
              colore: OBIETTIVO_COLORI[stato.obiettivi.length % OBIETTIVO_COLORI.length],
            });
            chiudi();
          }}
        />
      )}

      {modale === "conto" && (
        <SheetConto
          onClose={chiudi}
          onSalva={(dati) => {
            aggiungiConto(dati);
            chiudi();
          }}
        />
      )}

      {modale === "profilo" && (
        <SheetProfilo
          nome={stato.nome}
          onClose={chiudi}
          onSalva={(nome) => {
            impostaNome(nome);
            chiudi();
          }}
        />
      )}

      {modale === "budget" && (
        <SheetBudget
          budget={stato.budget}
          onClose={chiudi}
          onSalva={(budget) => {
            impostaBudget(budget);
            chiudi();
          }}
        />
      )}
    </div>
  );
}
