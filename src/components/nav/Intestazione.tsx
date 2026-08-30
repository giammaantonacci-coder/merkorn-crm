import Link from "next/link";
import type { Route } from "next";
import type { UrlObject } from "url";
import type { ReactNode } from "react";

import { Logo } from "@/components/ui/Logo";
import { iniziali } from "@/lib/formato";

export function Intestazione({ nome, azione }: { nome: string; azione?: ReactNode }) {
  return (
    <header className="safe-top flex items-center justify-between px-5 pb-4 md:pt-7">
      <Link href="/" className="flex items-center gap-2.5 md:invisible">
        <Logo className="w-6 text-arancio-vivo" />
        <span className="text-[15px] font-extrabold tracking-[-0.02em]">Merkorn</span>
      </Link>

      <div className="flex items-center gap-2.5">
        {azione}
        <Link
          href="/altro"
          title={nome}
          className="flex size-9 items-center justify-center rounded-full bg-surface text-xs font-bold text-ink shadow-[0_1px_2px_rgb(22_22_26/0.04),0_6px_18px_rgb(22_22_26/0.07)]"
        >
          {iniziali(nome)}
        </Link>
      </div>
    </header>
  );
}

/** Intestazione di una pagina interna: freccia indietro e titolo di sezione. */
export function IntestazioneIndietro<T extends string>({
  titolo,
  href,
}: {
  titolo: string;
  href: Route<T> | UrlObject;
}) {
  return (
    <header className="safe-top flex items-center gap-3.5 px-5 pb-4 md:pt-7">
      <Link
        href={href}
        aria-label="Torna indietro"
        className="-ml-1 flex size-11 items-center justify-center rounded-full text-ink"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-[22px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m14 5-7 7 7 7" />
        </svg>
      </Link>
      <span className="text-[15px] font-semibold text-muted">{titolo}</span>
    </header>
  );
}
