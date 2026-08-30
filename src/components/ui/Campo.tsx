import type { ComponentProps, ReactNode } from "react";

const CONTENITORE = "rounded-[15px] bg-panel px-4 py-2.5";
const ETICHETTA = "block text-xs font-semibold text-muted";
const CONTROLLO =
  "w-full min-h-[28px] bg-transparent text-base text-ink outline-none placeholder:text-[#b4b4ba]";

/** Campo di testo: etichetta piccola sopra, valore grande sotto, dentro un riquadro chiaro. */
export function Campo({
  etichetta,
  nota,
  className = "",
  id,
  ...props
}: ComponentProps<"input"> & { etichetta: string; nota?: string }) {
  const idCampo = id ?? props.name;
  return (
    <div className={className}>
      <div className={CONTENITORE}>
        <label className={ETICHETTA} htmlFor={idCampo}>
          {etichetta}
        </label>
        <input id={idCampo} className={CONTROLLO} {...props} />
      </div>
      {nota ? <p className="mt-1.5 px-1 text-xs text-muted">{nota}</p> : null}
    </div>
  );
}

export function AreaTesto({
  etichetta,
  className = "",
  id,
  ...props
}: ComponentProps<"textarea"> & { etichetta: string }) {
  const idCampo = id ?? props.name;
  return (
    <div className={`${CONTENITORE} ${className}`}>
      <label className={ETICHETTA} htmlFor={idCampo}>
        {etichetta}
      </label>
      <textarea id={idCampo} rows={3} className={`${CONTROLLO} resize-none`} {...props} />
    </div>
  );
}

export function Elenco({
  etichetta,
  children,
  className = "",
  id,
  ...props
}: ComponentProps<"select"> & { etichetta: string; children: ReactNode }) {
  const idCampo = id ?? props.name;
  return (
    <div className={`${CONTENITORE} ${className}`}>
      <label className={ETICHETTA} htmlFor={idCampo}>
        {etichetta}
      </label>
      <select id={idCampo} className={`${CONTROLLO} appearance-none`} {...props}>
        {children}
      </select>
    </div>
  );
}

/** Scelta a pastiglie: una riga di opzioni toccabili, per i campi a valori fissi. */
export function ScelteRapide({
  nome,
  opzioni,
  predefinito,
}: {
  nome: string;
  opzioni: { valore: string; etichetta: string }[];
  predefinito?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opzioni.map((o) => (
        <label
          key={o.valore}
          className="cursor-pointer rounded-full bg-panel px-4 py-2.5 text-sm font-semibold text-ink transition-colors has-[:checked]:bg-arancio has-[:checked]:text-white"
        >
          <input
            type="radio"
            name={nome}
            value={o.valore}
            defaultChecked={o.valore === predefinito}
            className="sr-only"
          />
          {o.etichetta}
        </label>
      ))}
    </div>
  );
}
