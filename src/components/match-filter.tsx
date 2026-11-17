"use client";

import { useState } from "react";
import type { MatchRow } from "@/lib/data";
import { MATCH_TYPE_LABEL, resultOf } from "@/lib/format";
import { MatchList } from "./match-row";
import { Empty } from "./ui";

const TABS = ["all", "leagueMatch", "playoffMatch", "friendlyMatch"] as const;

export function MatchFilter({ matches }: { matches: MatchRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const list = tab === "all" ? matches : matches.filter((m) => m.matchType === tab);
  const rec = { W: 0, D: 0, L: 0 };
  list.forEach((m) => rec[resultOf(m.goals, m.goalsAgainst)]++);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-sm ${tab === t ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"}`}
            >
              {t === "all" ? "Todos" : MATCH_TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <div className="text-sm text-muted">
          <span className="text-win">{rec.W}G</span> · <span className="text-draw">{rec.D}E</span> ·{" "}
          <span className="text-loss">{rec.L}P</span>
        </div>
      </div>
      {list.length ? <MatchList matches={list} /> : <Empty>No hay partidos de este tipo guardados.</Empty>}
    </div>
  );
}
