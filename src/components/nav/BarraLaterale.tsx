"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

import { Logo } from "@/components/ui/Logo";

const VOCI: { href: Route; etichetta: string }[] = [
  { href: "/", etichetta: "Oggi" },
  { href: "/pipeline", etichetta: "Pipeline" },
  { href: "/aziende", etichetta: "Aziende" },
  { href: "/agenda", etichetta: "Agenda" },
  { href: "/progetti", etichetta: "Progetti" },
  { href: "/report", etichetta: "Report" },
  { href: "/impostazioni", etichetta: "Impostazioni" },
];

/** Da tablet in su la navigazione lascia il fondo schermo e passa di lato. */
export function BarraLaterale() {
  const percorso = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-1 border-r border-line px-4 py-7 md:flex">
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-3">
        <Logo className="w-6 text-arancio-vivo" />
        <span className="text-base font-extrabold tracking-[-0.02em]">Merkorn</span>
      </Link>

      {VOCI.map((voce) => {
        const attiva = voce.href === "/" ? percorso === "/" : percorso.startsWith(voce.href);
        return (
          <Link
            key={voce.href}
            href={voce.href}
            aria-current={attiva ? "page" : undefined}
            className={`rounded-full px-4 py-2.5 text-[15px] font-semibold transition-colors ${
              attiva ? "bg-arancio-wash text-arancio-deep" : "text-ink-soft hover:bg-panel"
            }`}
          >
            {voce.etichetta}
          </Link>
        );
      })}
    </aside>
  );
}
