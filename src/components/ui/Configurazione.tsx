import { Logo } from "@/components/ui/Logo";
import { Scheda, Riquadro } from "@/components/ui/Scheda";

/**
 * Mostrata quando mancano le variabili d'ambiente di Supabase: senza quelle
 * l'applicazione non può fare nulla, e una pagina bianca non lo spiegherebbe.
 */
export function Configurazione({ mancanti }: { mancanti: string[] }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4">
      <div className="safe-top flex items-center gap-2.5 px-2">
        <Logo className="w-[26px] text-viola" />
        <span className="text-base font-extrabold tracking-[-0.02em]">Merkorn</span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        <Scheda className="p-6">
          <h1 className="titolo text-[27px]">Manca il collegamento alla base dati</h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            L&apos;applicazione è online ma non sa a quale progetto Supabase parlare, quindi non può
            mostrare nulla.
          </p>

          <Riquadro className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.05em] text-muted">
              Variabili da impostare
            </p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {mancanti.map((nome) => (
                <li key={nome} className="font-mono text-[13px] font-semibold text-bad">
                  {nome}
                </li>
              ))}
            </ul>
          </Riquadro>

          <ol className="mt-5 flex flex-col gap-3 text-sm leading-relaxed text-ink-soft">
            <li>
              <b className="font-bold">1.</b> Su Supabase, in Impostazioni → API, copia l&apos;URL
              del progetto e la chiave pubblica.
            </li>
            <li>
              <b className="font-bold">2.</b> Su Vercel, in Settings → Environment Variables,
              incollale con i nomi qui sopra.
            </li>
            <li>
              <b className="font-bold">3.</b> Rilancia il deploy: le variabili non si applicano a
              quello già pubblicato.
            </li>
          </ol>

          <p className="mt-5 text-[13px] leading-relaxed text-muted">
            In locale valgono le stesse variabili, dentro un file <code>.env.local</code> —
            <code> .env.example</code> ne è il modello.
          </p>
        </Scheda>
      </div>

      <p className="safe-bottom text-center text-xs text-muted">Uso interno Merkorn</p>
    </main>
  );
}
