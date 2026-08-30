import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Route } from "next";
import type { UrlObject } from "url";

type Variante = "principale" | "secondario" | "scuro";

const STILI: Record<Variante, string> = {
  principale: "bg-arancio text-white",
  secondario:
    "bg-surface text-ink shadow-[0_1px_2px_rgb(22_22_26/0.04),0_6px_18px_rgb(22_22_26/0.07)]",
  scuro: "bg-ink text-white",
};

const BASE =
  "inline-flex h-[46px] min-h-[44px] items-center justify-center rounded-full px-6 text-[15px] font-bold " +
  "transition-opacity active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arancio-ink";

export function Pulsante({
  variante = "principale",
  className = "",
  ...props
}: ComponentProps<"button"> & { variante?: Variante }) {
  return <button className={`${BASE} ${STILI[variante]} ${className}`} {...props} />;
}

export function PulsanteLink<T extends string>({
  href,
  variante = "principale",
  className = "",
  children,
}: {
  href: Route<T> | UrlObject;
  variante?: Variante;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${BASE} ${STILI[variante]} ${className}`}>
      {children}
    </Link>
  );
}

/** Pulsante tondo con il segno «+»: azione di aggiunta nelle intestazioni. */
export function PulsantePiu<T extends string>({
  href,
  label,
}: {
  href: Route<T> | UrlObject;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-arancio text-white transition-opacity active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arancio-ink"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
