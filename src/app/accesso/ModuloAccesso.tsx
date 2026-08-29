"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { entra, type StatoModulo } from "@/lib/azioni/autenticazione";
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

export function ModuloAccesso({
  persone,
  chiediPin,
}: {
  persone: string[];
  chiediPin: boolean;
}) {
  const [stato, azione] = useActionState<StatoModulo, FormData>(entra, {});

  return (
    <form action={azione} className="mt-6 flex flex-col gap-3">
      <Campo
        etichetta="Il tuo nome"
        name="nome"
        autoComplete="name"
        autoCapitalize="words"
        required
        autoFocus
        placeholder="Marco Valli"
        list={persone.length > 0 ? "persone" : undefined}
      />

      {persone.length > 0 ? (
        <datalist id="persone">
          {persone.map((nome) => (
            <option key={nome} value={nome} />
          ))}
        </datalist>
      ) : null}

      {chiediPin ? (
        <Campo
          etichetta="PIN della squadra"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          required
          placeholder="••••"
        />
      ) : null}

      <Errore messaggio={stato.errore} />

      <div className="mt-2">
        <BottoneEntra />
      </div>
    </form>
  );
}
