"use client";

import { useState } from "react";

/**
 * Cambia entre las fotos del jugador (en cancha, de perfil, de civil…).
 * Recibe cada escenario ya armado en el servidor y solo maneja cuál se ve.
 */
export function PlayerGallery({ items }: { items: { label: string; stage: React.ReactNode }[] }) {
  const [i, setI] = useState(0);
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1">
        {items.map((it, k) => (
          <div
            key={it.label}
            aria-hidden={k !== i}
            className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out)] ${
              k === i ? "opacity-100" : "pointer-events-none opacity-0 motion-safe:translate-x-6"
            }`}
          >
            {it.stage}
          </div>
        ))}
      </div>
      {items.length > 1 ? (
        <div role="tablist" aria-label="Fotos" className="flex gap-px bg-line">
          {items.map((it, k) => (
            <button
              key={it.label}
              type="button"
              role="tab"
              aria-selected={k === i}
              onClick={() => setI(k)}
              className={`tv min-h-11 flex-1 px-2 text-xl whitespace-nowrap transition-colors ${
                k === i ? "bg-ink text-ground" : "bg-panel text-ink hover:bg-panel-2"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
