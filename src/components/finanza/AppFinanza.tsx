"use client";

import { useState } from "react";

import { BarraNav, type Tab } from "@/components/finanza/BarraNav";
import { Home } from "@/components/finanza/schermi/Home";
import { Spese } from "@/components/finanza/schermi/Spese";
import { Obiettivi } from "@/components/finanza/schermi/Obiettivi";
import { Conti } from "@/components/finanza/schermi/Conti";
import { SheetTransazione } from "@/components/finanza/sheet/SheetTransazione";
import { SheetObiettivo } from "@/components/finanza/sheet/SheetObiettivo";
import { SheetConto } from "@/components/finanza/sheet/SheetConto";
import { useFinanza } from "@/lib/useFinanza";
import { calcola, OBIETTIVO_COLORI } from "@/lib/finanza";

type Modale = "nessuna" | "tx" | "obiettivo" | "conto";

export function AppFinanza() {
  const { stato, aggiungiTx, aggiungiObiettivo, aggiungiConto } = useFinanza();
  const [tab, setTab] = useState<Tab>("home");
  const [modale, setModale] = useState<Modale>("nessuna");

  const calcolo = calcola(stato);
  const chiudi = () => setModale("nessuna");

  return (
    <div
      className="mx-auto"
      style={{
        maxWidth: 430,
        height: "100dvh",
        position: "relative",
        overflow: "hidden",
        background: "#f5f6f8",
        boxShadow: "0 0 40px rgba(0,0,0,.06)",
      }}
    >
      <div
        className="noscroll"
        style={{
          position: "absolute",
          inset: 0,
          overflowY: "auto",
          padding: "calc(env(safe-area-inset-top, 0px) + 18px) 22px 116px",
        }}
      >
        {tab === "home" && <Home stato={stato} calcolo={calcolo} onVediSpese={() => setTab("spese")} />}
        {tab === "spese" && <Spese stato={stato} calcolo={calcolo} />}
        {tab === "obiettivi" && (
          <Obiettivi stato={stato} calcolo={calcolo} onNuovo={() => setModale("obiettivo")} />
        )}
        {tab === "conti" && <Conti stato={stato} calcolo={calcolo} onNuovo={() => setModale("conto")} />}
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
    </div>
  );
}
