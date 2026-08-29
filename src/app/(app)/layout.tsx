import { redirect } from "next/navigation";

import { Configurazione } from "@/components/ui/Configurazione";
import { BarraInferiore } from "@/components/nav/BarraInferiore";
import { BarraLaterale } from "@/components/nav/BarraLaterale";
import { profiloCorrente } from "@/lib/dati";
import { variabiliMancanti } from "@/lib/supabase/configurazione";

export default async function LayoutApplicazione({ children }: { children: React.ReactNode }) {
  const mancanti = variabiliMancanti();
  if (mancanti.length > 0) return <Configurazione mancanti={mancanti} />;

  const profilo = await profiloCorrente();
  if (!profilo) redirect("/accesso");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
      <BarraLaterale />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <main className="flex-1 pb-6">{children}</main>
        <BarraInferiore />
      </div>
    </div>
  );
}
