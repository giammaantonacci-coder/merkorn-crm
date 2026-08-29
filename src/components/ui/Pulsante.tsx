import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Route } from "next";
import type { UrlObject } from "url";

type Variante = "principale" | "secondario" | "scuro";

const STILI: Record<Variante, string> = {
  principale: "bg-viola text-white",
  secondario:
    "bg-surface text-ink shadow-[0_1px_2px_rgb(22_22_26/0.04),0_6px_18px_rgb(22_22_26/0.07)]",
  scuro: "bg-ink text-white",
};

const BASE =
  "inline-flex h-[54px] min-h-[44px] items-center justify-center rounded-full px-6 text-[15px] font-bold " +
  "transition-opacity active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viola-ink";

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
