/**
 * Menzioni «@Nome» nelle note. La verità è il testo: da lì si ricavano le
 * persone taggate (lato server, per non fidarsi del client) e i segmenti da
 * evidenziare come chip (lato UI). Un nome è menzionato quando «@» + nome
 * compare preceduto da inizio o spazio e non è seguito da altre lettere, così
 * «@Mario» non scatta dentro «mario@email» e «@Ann» non pesca «Anna».
 */

export type Persona = { id: string; nome: string };

function scappa(testo: string) {
  return testo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Le persone effettivamente menzionate nel testo, tra quelle candidate. */
export function personeMenzionate<T extends { nome: string }>(testo: string, persone: T[]): T[] {
  return persone.filter((p) =>
    new RegExp(`(^|[^\\p{L}\\p{N}])@${scappa(p.nome)}(?![\\p{L}\\p{N}])`, "iu").test(testo),
  );
}

export type Segmento = { testo: string; menzione?: string };

/**
 * Spezza il testo in segmenti normali e menzioni, per la resa a chip. I nomi
 * più lunghi hanno la precedenza, così «@Mario Rossi» non si ferma a «@Mario».
 */
export function segmentaMenzioni(testo: string, nomi: string[]): Segmento[] {
  const validi = nomi.filter(Boolean);
  if (validi.length === 0) return [{ testo }];

  const alternativa = [...validi]
    .sort((a, b) => b.length - a.length)
    .map(scappa)
    .join("|");
  const re = new RegExp(`@(?:${alternativa})(?![\\p{L}\\p{N}])`, "giu");

  const segmenti: Segmento[] = [];
  let ultimo = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(testo)) !== null) {
    const precedente = m.index === 0 ? "" : testo[m.index - 1];
    if (precedente && /[\p{L}\p{N}]/u.test(precedente)) {
      re.lastIndex = m.index + 1; // «@» attaccato a una parola: non è una menzione
      continue;
    }
    if (m.index > ultimo) segmenti.push({ testo: testo.slice(ultimo, m.index) });
    segmenti.push({ testo: m[0], menzione: m[0].slice(1) });
    ultimo = m.index + m[0].length;
  }
  if (ultimo < testo.length) segmenti.push({ testo: testo.slice(ultimo) });
  return segmenti;
}
