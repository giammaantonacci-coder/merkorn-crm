import { Configurazione } from "@/components/ui/Configurazione";
import { Logo } from "@/components/ui/Logo";
import { ModuloAccesso } from "@/app/accesso/ModuloAccesso";
import { configurazioneSupabase, pinSquadra } from "@/lib/supabase/configurazione";
import { personeDelTeam } from "@/lib/dati";

export const metadata = { title: "Accesso · CRM Merkorn" };

export const dynamic = "force-dynamic";

export default async function PaginaAccesso() {
  if (!configurazioneSupabase()) return <Configurazione />;

  const persone = await personeDelTeam();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4">
      <div className="safe-top flex items-center gap-2.5 px-2">
        <Logo className="w-[26px] text-arancio-vivo" />
        <span className="text-base font-extrabold tracking-[-0.02em]">Merkorn</span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        <div className="rounded-3xl bg-surface p-6 shadow-[0_1px_2px_rgb(22_22_26/0.04),0_6px_18px_rgb(22_22_26/0.07)]">
          <h1 className="titolo text-3xl">
            Le tue trattative,
            <br />
            sempre con te
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            Scrivi il tuo nome: le aziende e le trattative che registri restano collegate a te.
          </p>

          <ModuloAccesso persone={persone} chiediPin={pinSquadra() !== null} />
        </div>
      </div>

      <p className="safe-bottom text-center text-xs text-muted">Uso interno Merkorn</p>
    </main>
  );
}
