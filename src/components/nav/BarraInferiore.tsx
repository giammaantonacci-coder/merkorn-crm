"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import type { ReactNode } from "react";

type Voce = { href: Route; etichetta: string; icona: ReactNode };

const tratto = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const VOCI: Voce[] = [
  {
    href: "/",
    etichetta: "Oggi",
    icona: (
      <svg viewBox="0 0 24 24" {...tratto}>
        <path d="M4 11.5 12 4l8 7.5" />
        <path d="M6 10.5V20h12v-9.5" />
      </svg>
    ),
  },
  {
    href: "/pipeline",
    etichetta: "Pipeline",
    icona: (
      <svg viewBox="0 0 24 24" {...tratto}>
        <rect x="3" y="5" width="5" height="14" rx="1.5" />
        <rect x="10" y="5" width="5" height="10" rx="1.5" />
        <rect x="17" y="5" width="4" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/aziende",
    etichetta: "Aziende",
    icona: (
      <svg viewBox="0 0 24 24" {...tratto}>
        <path d="M4 20V6.5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 14 6.5V20" />
        <path d="M14 11h4.5A1.5 1.5 0 0 1 20 12.5V20M3 20h18M7 9h4M7 13h4" />
      </svg>
    ),
  },
  {
    href: "/altro",
    etichetta: "Altro",
    icona: (
      <svg viewBox="0 0 24 24" {...tratto}>
        <circle cx="5" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="19" cy="12" r="1.6" />
      </svg>
    ),
  },
];

export function BarraInferiore() {
  const percorso = usePathname();
  const barra = useRef<HTMLElement>(null);
  const [compatta, setCompatta] = useState(false);

  // Calibra --shift: collassando, la pill si accorcia e le icone si
  // sposterebbero in verticale; il translate le riporta sulla stessa linea.
  useEffect(() => {
    const nodo = barra.current;
    const icona = nodo?.querySelector("svg");
    if (!nodo || !icona) return;

    const centro = () => {
      const r = icona.getBoundingClientRect();
      return r.top + r.height / 2;
    };

    nodo.classList.add("calibrazione");
    nodo.style.setProperty("--shift", "0px");
    const espanso = centro();
    nodo.classList.add("compatta");
    const compatto = centro();
    nodo.classList.remove("compatta");
    nodo.style.setProperty("--shift", `${(espanso - compatto).toFixed(2)}px`);
    requestAnimationFrame(() => nodo.classList.remove("calibrazione"));
  }, []);

  // Direzione dello scroll: giù stringe, su allarga. Un solo calcolo per frame
  // (requestAnimationFrame) e ascolto passivo: nessun blocco del thread.
  useEffect(() => {
    let ultimo = window.scrollY;
    let inCoda = false;
    const SOGLIA = 6; // movimento minimo prima di reagire: niente sfarfallio
    const CIMA = 12; // vicino alla cima resta sempre lunga

    const valuta = () => {
      inCoda = false;
      const y = window.scrollY;
      const delta = y - ultimo;
      if (y <= CIMA) setCompatta(false);
      else if (delta > SOGLIA) setCompatta(true);
      else if (delta < -SOGLIA) setCompatta(false);
      ultimo = y;
    };

    const alloScroll = () => {
      if (!inCoda) {
        inCoda = true;
        requestAnimationFrame(valuta);
      }
    };

    window.addEventListener("scroll", alloScroll, { passive: true });
    return () => window.removeEventListener("scroll", alloScroll);
  }, []);

  return (
    <div className="nav-dock md:hidden">
      <nav ref={barra} aria-label="Sezioni" className={`nav-barra${compatta ? " compatta" : ""}`}>
        {VOCI.map((voce) => {
          const attiva = voce.href === "/" ? percorso === "/" : percorso.startsWith(voce.href);
          return (
            <Link
              key={voce.href}
              href={voce.href}
              aria-current={attiva ? "page" : undefined}
              className="nav-tab"
            >
              {voce.icona}
              <span className="nav-et">{voce.etichetta}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
