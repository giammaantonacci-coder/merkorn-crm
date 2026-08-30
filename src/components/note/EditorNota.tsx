"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Persona } from "@/lib/menzioni";

/**
 * Campo nota con autocomplete delle menzioni: digitando «@» compare l'elenco
 * dei colleghi; la scelta inserisce «@Nome». È un textarea vero (con `name`),
 * quindi si invia come un campo normale dentro una form action.
 */
export function EditorNota({
  name,
  etichetta,
  persone,
  defaultValue = "",
  placeholder,
  autoFocus,
}: {
  name: string;
  etichetta: string;
  persone: Persona[];
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const area = useRef<HTMLTextAreaElement>(null);
  const [valore, setValore] = useState(defaultValue);
  const [inizio, setInizio] = useState<number | null>(null); // posizione della «@» attiva
  const [query, setQuery] = useState("");
  const [attivo, setAttivo] = useState(0);

  const candidati = useMemo(() => {
    if (inizio === null) return [];
    const q = query.trim().toLowerCase();
    const filtrati = q
      ? persone.filter((p) => p.nome.toLowerCase().startsWith(q))
      : persone;
    return filtrati.slice(0, 6);
  }, [inizio, query, persone]);

  const aperto = inizio !== null && candidati.length > 0;

  useEffect(() => setAttivo(0), [query, inizio]);

  // Cerca la «@» che apre una menzione: preceduta da inizio o spazio, sulla
  // stessa riga del cursore. Il nome può contenere spazi, quindi non ci si
  // ferma agli spazi ma solo a inizio testo o a capo.
  function rileva() {
    const el = area.current;
    if (!el) return;
    const caret = el.selectionStart;
    let i = caret - 1;
    while (i >= 0) {
      const c = valore[i];
      if (c === "\n") break;
      if (c === "@" && (i === 0 || /\s/.test(valore[i - 1]))) {
        setInizio(i);
        setQuery(valore.slice(i + 1, caret));
        return;
      }
      i -= 1;
    }
    setInizio(null);
    setQuery("");
  }

  function scegli(p: Persona) {
    const el = area.current;
    if (!el || inizio === null) return;
    const caret = el.selectionStart;
    const inserito = `@${p.nome} `;
    const nuovo = valore.slice(0, inizio) + inserito + valore.slice(caret);
    setValore(nuovo);
    setInizio(null);
    setQuery("");
    const posizione = inizio + inserito.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(posizione, posizione);
    });
  }

  function suTasto(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!aperto) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAttivo((a) => (a + 1) % candidati.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAttivo((a) => (a - 1 + candidati.length) % candidati.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      scegli(candidati[attivo]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setInizio(null);
    }
  }

  const idCampo = name;

  return (
    <div className="relative">
      <div className="rounded-[15px] bg-panel px-4 py-2.5">
        <label className="block text-xs font-semibold text-muted" htmlFor={idCampo}>
          {etichetta}
        </label>
        <textarea
          ref={area}
          id={idCampo}
          name={name}
          rows={3}
          required
          autoFocus={autoFocus}
          value={valore}
          placeholder={placeholder}
          onChange={(e) => {
            setValore(e.target.value);
            requestAnimationFrame(rileva);
          }}
          onKeyDown={suTasto}
          onClick={rileva}
          onBlur={() => requestAnimationFrame(() => setInizio(null))}
          className="w-full min-h-[28px] resize-none bg-transparent text-base text-ink outline-none placeholder:text-[#b4b4ba]"
        />
      </div>

      {aperto ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-line bg-surface py-1 shadow-[0_10px_30px_rgb(22_22_26/0.16)]"
        >
          {candidati.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === attivo}
                onMouseDown={(e) => {
                  e.preventDefault(); // non perdere il focus prima del click
                  scegli(p);
                }}
                onMouseEnter={() => setAttivo(i)}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[15px] font-semibold ${
                  i === attivo ? "bg-arancio-wash text-arancio-deep" : "text-ink"
                }`}
              >
                <span className="text-arancio-deep">@</span>
                {p.nome}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
