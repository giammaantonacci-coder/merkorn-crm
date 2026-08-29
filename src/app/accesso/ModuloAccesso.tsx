"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { accedi, type StatoModulo } from "@/lib/azioni/autenticazione";
import { Campo } from "@/components/ui/Campo";
import { Errore } from "@/components/ui/Errore";
import { Pulsante } from "@/components/ui/Pulsante";

function BottoneEntra() {
  const { pending } = useFormStatus();
  return (
    <Pulsante type="submit" className="w-full" disabled={pending}>
      {pending ? "Un attimo…" : "Entra"}
    </Pulsante>
  );
}

export function ModuloAccesso() {
  const [stato, azione] = useActionState<StatoModulo, FormData>(accedi, {});

  return (
    <form action={azione} className="mt-6 flex flex-col gap-3">
      <Campo
        etichetta="Email"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        required
        placeholder="nome@merkorn.it"
      />
      <Campo
        etichetta="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
      />

      <Errore messaggio={stato.errore} />

      <div className="mt-2 flex flex-col gap-3">
        <BottoneEntra />
      </div>
    </form>
  );
}
