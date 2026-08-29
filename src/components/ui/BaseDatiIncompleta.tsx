import { Logo } from "@/components/ui/Logo";
import { Scheda, Riquadro } from "@/components/ui/Scheda";
import { Pulsante } from "@/components/ui/Pulsante";
import { esci } from "@/lib/azioni/autenticazione";

/**
 * Sessione valida ma nessun profilo: succede quando le migrazioni non sono
 * state applicate. Rimandare al login farebbe rimbalzare all'infinito senza
 * mai dire cosa manca.
 */
export function BaseDatiIncompleta() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4">
      <div className="safe-top flex items-center gap-2.5 px-2">
        <Logo className="w-[26px] text-viola" />
        <span className="text-base font-extrabold tracking-[-0.02em]">Merkorn</span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        <Scheda className="p-6">
          <h1 className="titolo text-[27px]">La base dati non è ancora predisposta</h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            L&apos;accesso è riuscito, ma le tabelle del CRM non ci sono: senza quelle non c&apos;è
            nulla da mostrare né da salvare.
          </p>

          <Riquadro className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.05em] text-muted">Cosa fare</p>
            <ol className="mt-2.5 flex flex-col gap-2.5 text-sm leading-relaxed text-ink-soft">
              <li>
                <b className="font-bold">1.</b> Apri Supabase → SQL Editor.
              </li>
              <li>
                <b className="font-bold">2.</b> Incolla ed esegui i file della cartella{" "}
                <code className="font-mono text-[12.5px]">supabase/migrations</code> del repository,{" "}
                <b className="font-bold">in ordine numerico</b>, dal primo all&apos;ultimo.
              </li>
              <li>
                <b className="font-bold">3.</b> Torna qui e rientra col tuo nome.
              </li>
            </ol>
          </Riquadro>

          <p className="mt-5 text-[13px] leading-relaxed text-muted">
            Le migrazioni creano tabelle, permessi e gli automatismi che registrano il tempo speso
            in ogni fase. Vanno eseguite una volta sola.
          </p>

          <form action={esci} className="mt-5">
            <Pulsante type="submit" variante="secondario" className="w-full">
              Esci
            </Pulsante>
          </form>
        </Scheda>
      </div>

      <p className="safe-bottom text-center text-xs text-muted">Uso interno Merkorn</p>
    </main>
  );
}
