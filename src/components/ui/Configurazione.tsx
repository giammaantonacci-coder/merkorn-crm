import { Logo } from "@/components/ui/Logo";
import { Scheda, Riquadro } from "@/components/ui/Scheda";
import { mancanti, nomiAccettati } from "@/lib/supabase/configurazione";

/**
 * Mostrata quando manca il collegamento a Supabase: senza, l'applicazione non
 * può fare nulla, e una pagina bianca non lo spiegherebbe.
 */
export function Configurazione() {
  const manca = mancanti();
  const nomi = nomiAccettati();

  const gruppi = [
    { titolo: "Indirizzo del progetto", nomi: nomi.url, manca: manca.url },
    { titolo: "Chiave pubblica", nomi: nomi.chiave, manca: manca.chiave },
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4">
      <div className="safe-top flex items-center gap-2.5 px-2">
        <Logo className="w-[26px] text-arancio-vivo" />
        <span className="text-base font-extrabold tracking-[-0.02em]">Merkorn</span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        <Scheda className="p-6">
          <h1 className="titolo text-[27px]">Manca il collegamento alla base dati</h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            L&apos;applicazione è online ma non sa a quale progetto Supabase parlare. Serve una
            variabile per riga qui sotto: va bene <b className="font-bold text-ink">uno qualsiasi</b>{" "}
            dei nomi elencati.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {gruppi.map((gruppo) => (
              <Riquadro key={gruppo.titolo}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.05em] text-muted">
                    {gruppo.titolo}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      gruppo.manca ? "bg-bad-wash text-bad" : "bg-ok-wash text-ok"
                    }`}
                  >
                    {gruppo.manca ? "manca" : "trovata"}
                  </span>
                </div>
                <ul className="mt-2.5 flex flex-col gap-1.5">
                  {gruppo.nomi.map((nome) => (
                    <li
                      key={nome}
                      className={`font-mono text-[12.5px] font-semibold ${
                        gruppo.manca ? "text-ink-soft" : "text-muted line-through"
                      }`}
                    >
                      {nome}
                    </li>
                  ))}
                </ul>
              </Riquadro>
            ))}
          </div>

          <ol className="mt-5 flex flex-col gap-3 text-sm leading-relaxed text-ink-soft">
            <li>
              <b className="font-bold">1.</b> Su Vercel, in Settings → Environment Variables,
              controlla che le variabili siano attive su <b className="font-bold">Production</b>,
              non solo su Preview.
            </li>
            <li>
              <b className="font-bold">2.</b> I valori stanno su Supabase, in Impostazioni → API:
              Project URL e chiave pubblica.
            </li>
            <li>
              <b className="font-bold">3.</b> Rilancia il deploy: le variabili non si applicano a
              quello già pubblicato.
            </li>
          </ol>

          <p className="mt-5 text-[13px] leading-relaxed text-muted">
            In locale valgono le stesse variabili in un file <code>.env.local</code>, sul modello di{" "}
            <code>.env.example</code>.
          </p>
        </Scheda>
      </div>

      <p className="safe-bottom text-center text-xs text-muted">Uso interno Merkorn</p>
    </main>
  );
}
