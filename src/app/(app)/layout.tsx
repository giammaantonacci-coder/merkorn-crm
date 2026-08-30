import { redirect } from "next/navigation";

import { BaseDatiIncompleta } from "@/components/ui/BaseDatiIncompleta";
import { Configurazione } from "@/components/ui/Configurazione";
import { BarraInferiore } from "@/components/nav/BarraInferiore";
import { BarraLaterale } from "@/components/nav/BarraLaterale";
import { profiloCorrente, sessioneAperta } from "@/lib/dati";
import { configurazioneSupabase } from "@/lib/supabase/configurazione";

// La configurazione va riletta a ogni richiesta: se restasse congelata nella
// build, aggiungere le variabili su Vercel non avrebbe effetto fino alla
// ricompilazione successiva.
export const dynamic = "force-dynamic";

export default async function LayoutApplicazione({ children }: { children: React.ReactNode }) {
  if (!configurazioneSupabase()) return <Configurazione />;

  const profilo = await profiloCorrente();

  if (!profilo) {
    // Autenticato ma senza profilo: rimandare al login creerebbe un rimbalzo
    // infinito, quindi si dice cosa manca.
    if (await sessioneAperta()) return <BaseDatiIncompleta />;
    redirect("/accesso");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
      <BarraLaterale />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <main className="flex-1 pb-28 md:pb-6">{children}</main>
        <BarraInferiore />
      </div>
    </div>
  );
}
