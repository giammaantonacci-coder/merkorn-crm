"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
      <svg viewBox="0 0 24 24" className="size-6" {...tratto}>
        <path d="M4 11.5 12 4l8 7.5" />
        <path d="M6 10.5V20h12v-9.5" />
      </svg>
    ),
  },
  {
    href: "/pipeline",
    etichetta: "Pipeline",
    icona: (
      <svg viewBox="0 0 24 24" className="size-6" {...tratto}>
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
      <svg viewBox="0 0 24 24" className="size-6" {...tratto}>
        <path d="M4 20V6.5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 14 6.5V20" />
        <path d="M14 11h4.5A1.5 1.5 0 0 1 20 12.5V20M3 20h18M7 9h4M7 13h4" />
      </svg>
    ),
  },
  {
    href: "/altro",
    etichetta: "Altro",
    icona: (
      <svg viewBox="0 0 24 24" className="size-6" {...tratto}>
        <circle cx="5" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="19" cy="12" r="1.6" />
      </svg>
    ),
  },
];

export function BarraInferiore() {
  const percorso = usePathname();

  return (
    <nav
      aria-label="Sezioni"
      className="safe-bottom sticky bottom-0 z-20 flex justify-around bg-surface px-2 pt-3 shadow-[0_-1px_18px_rgb(22_22_26/0.07)] md:hidden"
    >
      {VOCI.map((voce) => {
        const attiva = voce.href === "/" ? percorso === "/" : percorso.startsWith(voce.href);
        return (
          <Link
            key={voce.href}
            href={voce.href}
            aria-current={attiva ? "page" : undefined}
            className={`flex min-h-[44px] w-20 flex-col items-center gap-1.5 pt-1 ${
              attiva ? "text-arancio" : "text-muted"
            }`}
          >
            {voce.icona}
            <span className={`text-[11px] ${attiva ? "font-bold" : "font-semibold"}`}>
              {voce.etichetta}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
