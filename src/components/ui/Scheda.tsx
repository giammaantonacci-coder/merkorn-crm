import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** La scheda bianca staccata dall'ombra leggera: l'unità di base di ogni schermata. */
export function Scheda({ children, className = "" }: Props) {
  return (
    <section
      className={`rounded-[22px] bg-surface p-5 shadow-[0_1px_2px_rgb(22_22_26/0.04),0_6px_18px_rgb(22_22_26/0.07)] ${className}`}
    >
      {children}
    </section>
  );
}

/** Il riquadro chiaro annidato: regge la gerarchia dentro una scheda. */
export function Riquadro({ children, className = "" }: Props) {
  return <div className={`rounded-2xl bg-panel p-4 ${className}`}>{children}</div>;
}

export function TitoloScheda({ children, className = "" }: Props) {
  return (
    <h2 className={`text-base font-bold tracking-[-0.02em] text-ink ${className}`}>{children}</h2>
  );
}

export function SottoTitolo({ children, className = "" }: Props) {
  return <p className={`text-[13px] leading-relaxed text-muted ${className}`}>{children}</p>;
}
