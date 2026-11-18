"use client";

import { useState } from "react";
import type { MatchRow } from "@/lib/data";
import { fmtDay, MATCH_TYPE_LABEL } from "@/lib/format";
import { groupNights, nightHeadline } from "@/lib/nights";
import { MatchList } from "./match-row";

const TABS = ["all", "leagueMatch", "playoffMatch", "friendlyMatch"] as const;

/** Historial agrupado por noche, con filtro por tipo de partido. */
export function MatchFilter({ matches }: { matches: MatchRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const list = tab === "all" ? matches : matches.filter((m) => m.matchType === tab);
  const nights = groupNights(list);

  return (
    <div>
      <div role="tablist" aria-label="Tipo de partido" className="no-scrollbar mb-10 flex overflow-x-auto border border-line">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`tv min-h-12 flex-1 px-5 text-2xl transition-colors ${
              tab === t ? "bg-green text-white" : "bg-panel text-ink-2 hover:text-ink"
            }`}
          >
            {t === "all" ? "Todos" : MATCH_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {nights.length ? (
        <div className="space-y-14">
          {nights.map((n) => (
            <section key={n.key} aria-label={`Noche del ${fmtDay(n.start)}`}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 className="tv text-4xl first-letter:uppercase">{fmtDay(n.start)}</h2>
                <p className="text-base text-ink-2">
                  {nightHeadline(n)} · {n.gf}-{n.ga} en goles
                </p>
              </div>
              <MatchList matches={n.matches} />
            </section>
          ))}
        </div>
      ) : (
        <p className="border border-line bg-panel px-6 py-12 text-center text-ink-2">No hay partidos de este tipo guardados.</p>
      )}
    </div>
  );
}
