/**
 * Struttura vuota mostrata mentre la pagina carica dal server: dà un riscontro
 * immediato al tocco, così la navigazione non sembra bloccata.
 */
function Barra({ w = "60%", h = 14 }: { w?: string; h?: number }) {
  return (
    <span
      aria-hidden
      className="block rounded-full bg-panel"
      style={{ width: w, height: h }}
    />
  );
}

export function Scheletro() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between px-5 pb-4 pt-7">
        <Barra w="120px" h={20} />
        <span aria-hidden className="size-9 rounded-full bg-panel" />
      </div>

      <div className="flex flex-col gap-3 px-4">
        <div className="flex flex-col gap-2.5 px-2 py-1">
          <Barra w="70%" h={26} />
          <Barra w="40%" h={14} />
        </div>

        {[0, 1].map((i) => (
          <div key={i} className="rounded-[22px] bg-surface p-5 shadow-[0_1px_2px_rgb(22_22_26/0.04),0_6px_18px_rgb(22_22_26/0.07)]">
            <div className="mb-4 flex items-center justify-between">
              <Barra w="45%" h={16} />
              <Barra w="20%" h={12} />
            </div>
            <div className="flex flex-col gap-2.5">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-center gap-3 rounded-2xl bg-panel p-4">
                  <span aria-hidden className="size-2.5 rounded-full bg-line" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Barra w="55%" h={13} />
                    <Barra w="35%" h={11} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Caricamento…</span>
    </div>
  );
}
